"""
OANDA Pydantic Schemas for request/response validation.
"""

from pydantic import BaseModel, Field
from typing import Optional, List


class ConnectBrokerRequest(BaseModel):
    api_token: str = Field(..., min_length=10, description="OANDA API token")
    account_id: str = Field(..., min_length=3, description="OANDA account ID")
    environment: str = Field(default="demo", pattern="^(demo|live)$")


class OrderRequest(BaseModel):
    instrument: str = Field(..., description="e.g. EUR_USD")
    units: float = Field(..., description="Positive=BUY, Negative=SELL")
    order_type: str = Field(default="MARKET", pattern="^(MARKET|LIMIT|STOP|STOP_LIMIT)$")
    price: Optional[float] = None
    price_bound: Optional[float] = None
    take_profit: Optional[float] = None
    stop_loss: Optional[float] = None
    trailing_stop_distance: Optional[float] = None
    time_in_force: str = Field(default="FOK")


class ModifyTradeRequest(BaseModel):
    take_profit: Optional[float] = None
    stop_loss: Optional[float] = None
    trailing_stop_distance: Optional[float] = None


class CloseTradeRequest(BaseModel):
    units: Optional[str] = None


class ClosePositionRequest(BaseModel):
    long_units: str = Field(default="NONE")
    short_units: str = Field(default="NONE")


class CandleRequest(BaseModel):
    instrument: str
    granularity: str = Field(default="M5")
    count: int = Field(default=200, ge=1, le=5000)
    from_time: Optional[str] = None
    to_time: Optional[str] = None


class PositionSizeRequest(BaseModel):
    account_balance: float
    risk_percent: float = Field(ge=0.1, le=10.0)
    entry_price: float
    stop_loss_price: float
    instrument: str = Field(default="EUR_USD")


class SubscribeRequest(BaseModel):
    instruments: List[str]
