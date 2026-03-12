"""
Trading Routes
Order placement, trade management, positions, transactions.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database.connection import get_db
from models.broker_account import BrokerAccount
from models.trade import Trade as TradeModel
from models.transaction import Transaction as TxModel
from utils.security import get_current_user_id, decrypt_credential
from utils.helpers import build_response, utcnow

from broker.oanda.client import OandaClient
from broker.oanda.schemas import OrderRequest, ModifyTradeRequest, CloseTradeRequest, ClosePositionRequest
from broker.oanda import trades as oanda_trades
from broker.oanda import positions as oanda_positions
from broker.oanda import transactions as oanda_transactions
from broker.oanda.risk import get_risk_assessment
from broker.oanda.schemas import PositionSizeRequest
from services.trading_engine import place_order
from services.risk_service import compute_position_size

import json

router = APIRouter(prefix="/trading", tags=["Trading"])


def _make_client(account: BrokerAccount) -> OandaClient:
    token = decrypt_credential(account.api_token_encrypted)
    return OandaClient(token, account.account_id, account.environment)


async def _get_account(db, broker_account_id, user_id):
    result = await db.execute(
        select(BrokerAccount).where(
            BrokerAccount.id == broker_account_id,
            BrokerAccount.user_id == user_id,
            BrokerAccount.is_active == True,
        )
    )
    account = result.scalar_one_or_none()
    if not account:
        raise HTTPException(404, "Broker account not found")
    return account


# ---- Orders ----

@router.post("/order")
async def create_order(
    req: OrderRequest,
    broker_account_id: int = Query(...),
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Place an order through the trading engine."""
    result = await place_order(
        db=db, user_id=user_id,
        broker_account_id=broker_account_id,
        instrument=req.instrument,
        units=req.units,
        order_type=req.order_type,
        price=req.price,
        price_bound=req.price_bound,
        take_profit=req.take_profit,
        stop_loss=req.stop_loss,
        time_in_force=req.time_in_force,
    )
    return build_response(data=result, message="Order processed")


# ---- Trades ----

@router.get("/trades")
async def list_trades(
    broker_account_id: int = Query(...),
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    account = await _get_account(db, broker_account_id, user_id)
    client = _make_client(account)
    try:
        trades = await oanda_trades.get_open_trades(client)
        return build_response(data=trades)
    finally:
        await client.close()


@router.put("/trades/{trade_id}/close")
async def close_trade(
    trade_id: str,
    req: CloseTradeRequest = None,
    broker_account_id: int = Query(...),
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    account = await _get_account(db, broker_account_id, user_id)
    client = _make_client(account)
    try:
        units = req.units if req else None
        result = await oanda_trades.close_trade(client, trade_id, units)
        return build_response(data=result, message="Trade closed")
    finally:
        await client.close()


@router.put("/trades/{trade_id}/modify")
async def modify_trade(
    trade_id: str,
    req: ModifyTradeRequest,
    broker_account_id: int = Query(...),
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    account = await _get_account(db, broker_account_id, user_id)
    client = _make_client(account)
    try:
        result = await oanda_trades.modify_trade(
            client, trade_id, req.take_profit, req.stop_loss, req.trailing_stop_distance
        )
        return build_response(data=result, message="Trade modified")
    finally:
        await client.close()


# ---- Positions ----

@router.get("/positions")
async def list_positions(
    broker_account_id: int = Query(...),
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    account = await _get_account(db, broker_account_id, user_id)
    client = _make_client(account)
    try:
        positions = await oanda_positions.get_positions(client)
        return build_response(data=positions)
    finally:
        await client.close()


@router.put("/positions/{instrument}/close")
async def close_position(
    instrument: str,
    req: ClosePositionRequest,
    broker_account_id: int = Query(...),
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    account = await _get_account(db, broker_account_id, user_id)
    client = _make_client(account)
    try:
        result = await oanda_positions.close_position(
            client, instrument, req.long_units, req.short_units
        )
        return build_response(data=result, message="Position closed")
    finally:
        await client.close()


# ---- Transactions ----

@router.get("/transactions")
async def list_transactions(
    broker_account_id: int = Query(...),
    count: int = Query(default=50, ge=1, le=500),
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    account = await _get_account(db, broker_account_id, user_id)
    client = _make_client(account)
    try:
        txns = await oanda_transactions.get_recent_transactions(client, count)
        # Store transactions
        for tx in txns:
            tx_record = TxModel(
                user_id=user_id,
                broker_account_id=broker_account_id,
                broker_transaction_id=tx.get("transaction_id"),
                broker_name="oanda",
                transaction_type=tx.get("type", "UNKNOWN"),
                instrument=tx.get("instrument"),
                units=tx.get("units"),
                price=tx.get("price"),
                pl=tx.get("pl", 0),
                financing=tx.get("financing", 0),
                commission=tx.get("commission", 0),
                account_balance=tx.get("account_balance"),
                raw_data=tx.get("raw_data"),
            )
            db.add(tx_record)
        return build_response(data=txns)
    finally:
        await client.close()


# ---- Risk ----

@router.post("/risk/position-size")
async def calculate_pos_size(req: PositionSizeRequest):
    result = compute_position_size(
        req.account_balance, req.risk_percent,
        req.entry_price, req.stop_loss_price, req.instrument,
    )
    return build_response(data=result)


@router.get("/risk/assessment")
async def risk_assessment(
    broker_account_id: int = Query(...),
    instrument: str = Query(...),
    units: float = Query(...),
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    account = await _get_account(db, broker_account_id, user_id)
    client = _make_client(account)
    try:
        result = await get_risk_assessment(client, instrument, units)
        return build_response(data=result)
    finally:
        await client.close()
