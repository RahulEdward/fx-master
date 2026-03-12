"""
Market Data Service
Fetches candles from brokers and persists to the database.
"""

from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

from models.broker_account import BrokerAccount
from models.market_data import MarketData
from utils.security import decrypt_credential
from utils.logger import logger

from broker.oanda.client import OandaClient
from broker.oanda.market_data import get_candles, get_latest_price, get_multiple_prices


async def fetch_and_store_candles(
    db: AsyncSession,
    broker_account_id: int,
    user_id: int,
    instrument: str,
    granularity: str = "M5",
    count: int = 200,
) -> List[Dict[str, Any]]:
    """Fetch candles from broker and store in database."""
    result = await db.execute(
        select(BrokerAccount).where(
            BrokerAccount.id == broker_account_id,
            BrokerAccount.user_id == user_id,
        )
    )
    account = result.scalar_one_or_none()
    if not account:
        raise ValueError("Broker account not found")

    token = decrypt_credential(account.api_token_encrypted)
    client = OandaClient(token, account.account_id, account.environment)

    try:
        candles = await get_candles(client, instrument, granularity, count)

        # DB-agnostic upsert (works with SQLite and PostgreSQL)
        for c in candles:
            ts = c.get("timestamp")
            if isinstance(ts, str):
                ts = datetime.fromisoformat(ts.replace("Z", "+00:00"))

            # Check if candle exists
            existing = await db.execute(
                select(MarketData).where(
                    MarketData.instrument == instrument,
                    MarketData.granularity == granularity,
                    MarketData.broker_name == account.broker_name,
                    MarketData.timestamp == ts,
                )
            )
            row = existing.scalar_one_or_none()
            if row:
                row.close = c["close"]
                row.high = c["high"]
                row.low = c["low"]
                row.volume = c.get("volume", 0)
            else:
                db.add(MarketData(
                    instrument=instrument, granularity=granularity,
                    broker_name=account.broker_name,
                    open=c["open"], high=c["high"],
                    low=c["low"], close=c["close"],
                    volume=c.get("volume", 0), timestamp=ts,
                ))
            await db.flush()

        logger.info(f"Stored {len(candles)} candles for {instrument} {granularity}")
        return candles
    finally:
        await client.close()


async def get_stored_candles(
    db: AsyncSession,
    instrument: str,
    granularity: str = "M5",
    limit: int = 200,
) -> List[Dict[str, Any]]:
    """Retrieve candles from the database."""
    result = await db.execute(
        select(MarketData)
        .where(MarketData.instrument == instrument, MarketData.granularity == granularity)
        .order_by(MarketData.timestamp.desc())
        .limit(limit)
    )
    rows = result.scalars().all()
    return [
        {
            "timestamp": r.timestamp.isoformat(),
            "open": r.open, "high": r.high,
            "low": r.low, "close": r.close,
            "volume": r.volume,
        }
        for r in reversed(rows)
    ]
