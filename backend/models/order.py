"""
Order Model
Stores all orders across all brokers.
"""

from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey, Text,
)
from database.connection import Base
from utils.helpers import utcnow


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    broker_account_id = Column(Integer, ForeignKey("broker_accounts.id", ondelete="CASCADE"), nullable=False, index=True)

    # Broker-side identifiers
    broker_order_id = Column(String(100), nullable=True, index=True)
    broker_name = Column(String(50), nullable=False)

    # Order details
    instrument = Column(String(20), nullable=False, index=True)
    order_type = Column(String(20), nullable=False)  # MARKET, LIMIT, STOP, STOP_LIMIT
    side = Column(String(10), nullable=False)  # BUY / SELL
    units = Column(Float, nullable=False)
    price = Column(Float, nullable=True)  # For limit/stop orders

    # Risk management
    take_profit = Column(Float, nullable=True)
    stop_loss = Column(Float, nullable=True)
    trailing_stop_distance = Column(Float, nullable=True)

    # Execution
    time_in_force = Column(String(10), default="FOK")  # FOK, GTC, GTD, IOC
    filled_price = Column(Float, nullable=True)
    filled_units = Column(Float, nullable=True)

    # Status
    status = Column(String(20), nullable=False, default="PENDING")  # PENDING, FILLED, CANCELLED, REJECTED
    reject_reason = Column(Text, nullable=True)

    # Timestamps
    placed_at = Column(DateTime(timezone=True), default=utcnow)
    filled_at = Column(DateTime(timezone=True), nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    def __repr__(self):
        return f"<Order(id={self.id}, {self.side} {self.units} {self.instrument} @ {self.price})>"
