"""
Market Data Model
Historical candle / OHLCV data.
"""

from sqlalchemy import (
    Column, Integer, String, Float, DateTime, UniqueConstraint,
)
from database.connection import Base
from utils.helpers import utcnow


class MarketData(Base):
    __tablename__ = "market_data"

    id = Column(Integer, primary_key=True, autoincrement=True)

    instrument = Column(String(20), nullable=False, index=True)
    granularity = Column(String(5), nullable=False, index=True)  # S5, M1, M5, ... D
    broker_name = Column(String(50), nullable=False)

    # OHLCV
    open = Column(Float, nullable=False)
    high = Column(Float, nullable=False)
    low = Column(Float, nullable=False)
    close = Column(Float, nullable=False)
    volume = Column(Integer, nullable=True, default=0)

    # Candle timestamp
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)

    created_at = Column(DateTime(timezone=True), default=utcnow)

    __table_args__ = (
        UniqueConstraint(
            "instrument", "granularity", "broker_name", "timestamp",
            name="uix_market_data_candle",
        ),
    )

    def __repr__(self):
        return f"<MarketData({self.instrument} {self.granularity} {self.timestamp})>"
