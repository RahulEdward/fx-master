"""
Position Model
Aggregate position per instrument across all brokers.
"""

from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey,
)
from database.connection import Base
from utils.helpers import utcnow


class Position(Base):
    __tablename__ = "positions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    broker_account_id = Column(Integer, ForeignKey("broker_accounts.id", ondelete="CASCADE"), nullable=False, index=True)

    broker_name = Column(String(50), nullable=False)
    instrument = Column(String(20), nullable=False, index=True)

    # Position details
    long_units = Column(Float, nullable=True, default=0.0)
    short_units = Column(Float, nullable=True, default=0.0)
    average_price = Column(Float, nullable=True)
    unrealized_pl = Column(Float, nullable=True, default=0.0)
    margin_used = Column(Float, nullable=True, default=0.0)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    def __repr__(self):
        return f"<Position(id={self.id}, {self.instrument}, L={self.long_units}, S={self.short_units})>"
