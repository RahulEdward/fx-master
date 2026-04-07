"""
Market Routes
Candle data, latest prices, and instrument info.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database.connection import get_db
from models.broker_account import BrokerAccount
from utils.security import get_current_user_id
from utils.helpers import build_response

from broker.oanda._client_cache import get_cached_client
from broker.oanda.market_data import get_candles, get_latest_price, get_spread, get_multiple_prices
from broker.oanda.instruments import get_instruments

router = APIRouter(prefix="/market", tags=["Market Data"])


async def _get_account(db: AsyncSession, broker_account_id: int, user_id: int) -> BrokerAccount:
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


@router.get("/instruments")
async def list_instruments(
    broker_account_id: int = Query(...),
    instrument_type: str = Query(default=None),
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    account = await _get_account(db, broker_account_id, user_id)
    client = await get_cached_client(account)
    data = await get_instruments(client, instrument_type)
    return build_response(data=data)


@router.get("/candles")
async def get_candles_route(
    broker_account_id: int = Query(...),
    instrument: str = Query(...),
    granularity: str = Query(default="M5"),
    count: int = Query(default=500, ge=1, le=5000),
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Fetch candles directly from OANDA (no DB storage for speed)."""
    account = await _get_account(db, broker_account_id, user_id)
    client = await get_cached_client(account)
    candles = await get_candles(client, instrument, granularity, count)
    return build_response(data=candles)


@router.get("/price")
async def get_price(
    broker_account_id: int = Query(...),
    instrument: str = Query(...),
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    account = await _get_account(db, broker_account_id, user_id)
    client = await get_cached_client(account)
    data = await get_latest_price(client, instrument)
    return build_response(data=data)


@router.get("/spread")
async def get_spread_route(
    broker_account_id: int = Query(...),
    instrument: str = Query(...),
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    account = await _get_account(db, broker_account_id, user_id)
    client = await get_cached_client(account)
    data = await get_spread(client, instrument)
    return build_response(data=data)


@router.get("/prices")
async def get_prices(
    broker_account_id: int = Query(...),
    instruments: str = Query(..., description="Comma-separated instrument list"),
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    account = await _get_account(db, broker_account_id, user_id)
    client = await get_cached_client(account)
    inst_list = [i.strip() for i in instruments.split(",")]
    data = await get_multiple_prices(client, inst_list)
    return build_response(data=data)
