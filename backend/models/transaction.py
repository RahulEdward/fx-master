"""
Transaction Model
Historical transaction log across all brokers.
"""

from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey, Text,
)
from database.connection import Base
from utils.helpers import utcnow


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    broker_account_id = Column(Integer, ForeignKey("broker_accounts.id", ondelete="CASCADE"), nullable=False, index=True)

    # Broker-side identifiers
    broker_transaction_id = Column(String(100), nullable=True, index=True)
    broker_name = Column(String(50), nullable=False)

    # Transaction details
    transaction_type = Column(String(50), nullable=False, index=True)
    # Types: ORDER_FILL, TAKE_PROFIT_ORDER, STOP_LOSS_ORDER, MARGIN_CALL_ENTER,
    #        MARGIN_CALL_EXIT, DAILY_FINANCING, TRANSFER_FUNDS, etc.

    instrument = Column(String(20), nullable=True)
    units = Column(Float, nullable=True)
    price = Column(Float, nullable=True)
    pl = Column(Float, nullable=True, default=0.0)
    financing = Column(Float, nullable=True, default=0.0)
    commission = Column(Float, nullable=True, default=0.0)
    account_balance = Column(Float, nullable=True)

    # Raw response (for auditing)
    raw_data = Column(Text, nullable=True)

    # Timestamps
    transaction_time = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    def __repr__(self):
        return f"<Transaction(id={self.id}, type='{self.transaction_type}')>"
