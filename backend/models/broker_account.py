"""
Broker Account Model
Stores user broker connections — reusable across all broker integrations.
"""

from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float,
)
from database.connection import Base
from utils.helpers import utcnow


class BrokerAccount(Base):
    __tablename__ = "broker_accounts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Broker identification
    broker_name = Column(String(50), nullable=False, index=True)  # "oanda", "fxcm", etc.
    environment = Column(String(10), nullable=False, default="demo")  # "demo" or "live"

    # Encrypted credentials
    api_token_encrypted = Column(Text, nullable=False)
    account_id = Column(String(100), nullable=False)

    # Account snapshot (updated periodically)
    account_alias = Column(String(100), nullable=True)
    currency = Column(String(10), nullable=True, default="USD")
    balance = Column(Float, nullable=True)
    margin_available = Column(Float, nullable=True)
    margin_used = Column(Float, nullable=True)
    unrealized_pl = Column(Float, nullable=True)
    open_trade_count = Column(Integer, nullable=True, default=0)
    open_position_count = Column(Integer, nullable=True, default=0)

    # Status
    is_active = Column(Boolean, default=True)
    is_connected = Column(Boolean, default=False)
    last_synced_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    def __repr__(self):
        return f"<BrokerAccount(id={self.id}, broker='{self.broker_name}', account='{self.account_id}')>"
