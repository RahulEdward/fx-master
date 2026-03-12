"""
Trading Engine Service
Broker-agnostic trading operations that delegate to specific broker implementations.
"""

from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from models.broker_account import BrokerAccount
from models.order import Order
from models.trade import Trade
from utils.security import decrypt_credential
from utils.logger import logger
from utils.helpers import utcnow

# Broker adapters
from broker.oanda.client import OandaClient
from broker.oanda import orders as oanda_orders
from broker.oanda import trades as oanda_trades


def _get_oanda_client(account: BrokerAccount) -> OandaClient:
    """Create an OandaClient from a BrokerAccount record."""
    token = decrypt_credential(account.api_token_encrypted)
    return OandaClient(
        api_token=token,
        account_id=account.account_id,
        environment=account.environment,
    )


async def get_broker_client(db: AsyncSession, broker_account_id: int, user_id: int):
    """Get the appropriate broker client for a given account."""
    result = await db.execute(
        select(BrokerAccount).where(
            BrokerAccount.id == broker_account_id,
            BrokerAccount.user_id == user_id,
            BrokerAccount.is_active == True,
        )
    )
    account = result.scalar_one_or_none()
    if not account:
        raise ValueError("Broker account not found or inactive")

    if account.broker_name == "oanda":
        return _get_oanda_client(account), account
    else:
        raise ValueError(f"Unsupported broker: {account.broker_name}")


async def place_order(
    db: AsyncSession,
    user_id: int,
    broker_account_id: int,
    instrument: str,
    units: float,
    order_type: str = "MARKET",
    price: Optional[float] = None,
    price_bound: Optional[float] = None,
    take_profit: Optional[float] = None,
    stop_loss: Optional[float] = None,
    time_in_force: str = "FOK",
) -> Dict[str, Any]:
    """Place an order through the appropriate broker."""
    client, account = await get_broker_client(db, broker_account_id, user_id)

    try:
        if account.broker_name == "oanda":
            if order_type == "MARKET":
                result = await oanda_orders.place_market_order(
                    client, instrument, units, take_profit, stop_loss, time_in_force
                )
            elif order_type == "LIMIT":
                result = await oanda_orders.place_limit_order(
                    client, instrument, units, price, take_profit, stop_loss, time_in_force
                )
            elif order_type == "STOP":
                result = await oanda_orders.place_stop_order(
                    client, instrument, units, price, take_profit, stop_loss, time_in_force
                )
            elif order_type == "STOP_LIMIT":
                result = await oanda_orders.place_stop_limit_order(
                    client, instrument, units, price, price_bound or price,
                    take_profit, stop_loss, time_in_force
                )
            else:
                raise ValueError(f"Unknown order type: {order_type}")
        else:
            raise ValueError(f"Unsupported broker: {account.broker_name}")

        # Persist order to DB
        side = "BUY" if units > 0 else "SELL"
        order_record = Order(
            user_id=user_id,
            broker_account_id=broker_account_id,
            broker_order_id=result.get("order_id"),
            broker_name=account.broker_name,
            instrument=instrument,
            order_type=order_type,
            side=side,
            units=abs(units),
            price=price or result.get("price"),
            take_profit=take_profit,
            stop_loss=stop_loss,
            time_in_force=time_in_force,
            filled_price=result.get("price") if result.get("status") == "FILLED" else None,
            filled_units=abs(result.get("units", 0)) if result.get("status") == "FILLED" else None,
            status=result.get("status", "PENDING"),
            reject_reason=result.get("reject_reason"),
            filled_at=utcnow() if result.get("status") == "FILLED" else None,
        )
        db.add(order_record)
        await db.flush()

        # If filled, create a trade record
        if result.get("status") == "FILLED" and result.get("trade_id"):
            trade_record = Trade(
                user_id=user_id,
                broker_account_id=broker_account_id,
                broker_trade_id=result.get("trade_id"),
                broker_name=account.broker_name,
                instrument=instrument,
                side="LONG" if units > 0 else "SHORT",
                units=abs(units),
                entry_price=result.get("price", 0),
                take_profit=take_profit,
                stop_loss=stop_loss,
                state="OPEN",
            )
            db.add(trade_record)

        return result

    finally:
        await client.close()
