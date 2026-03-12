"""
Trade Model
Stores open and closed trades across all brokers.
"""

from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey,
)
from database.connection import Base
from utils.helpers import utcnow


class Trade(Base):
    __tablename__ = "trades"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    broker_account_id = Column(Integer, ForeignKey("broker_accounts.id", ondelete="CASCADE"), nullable=False, index=True)

    # Broker-side identifiers
    broker_trade_id = Column(String(100), nullable=True, index=True)
    broker_name = Column(String(50), nullable=False)

    # Trade details
    instrument = Column(String(20), nullable=False, index=True)
    side = Column(String(10), nullable=False)  # LONG / SHORT
    units = Column(Float, nullable=False)
    entry_price = Column(Float, nullable=False)
    current_price = Column(Float, nullable=True)

    # Risk management
    take_profit = Column(Float, nullable=True)
    stop_loss = Column(Float, nullable=True)
    trailing_stop_distance = Column(Float, nullable=True)

    # P&L
    unrealized_pl = Column(Float, nullable=True, default=0.0)
    realized_pl = Column(Float, nullable=True, default=0.0)
    swap = Column(Float, nullable=True, default=0.0)
    commission = Column(Float, nullable=True, default=0.0)

    # Status
    state = Column(String(20), nullable=False, default="OPEN")  # OPEN, CLOSED
    close_price = Column(Float, nullable=True)

    # Timestamps
    opened_at = Column(DateTime(timezone=True), default=utcnow)
    closed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    def __repr__(self):
        return f"<Trade(id={self.id}, {self.side} {self.units} {self.instrument})>"
