"""
OANDA Risk Management Module
Position sizing and margin calculations.
"""

from typing import Dict, Any
from broker.oanda.client import OandaClient
from broker.oanda.market_data import get_latest_price
from broker.oanda.accounts import get_account_summary


def calculate_lot_size(
    account_balance: float,
    risk_percent: float,
    stop_loss_pips: float,
    pip_value: float = 10.0,
) -> float:
    if stop_loss_pips <= 0:
        raise ValueError("Stop loss pips must be > 0")
    risk_amount = account_balance * (risk_percent / 100.0)
    units = risk_amount / (stop_loss_pips * (pip_value / 100000))
    return round(units, 0)


def calculate_margin_required(units: float, price: float, margin_rate: float) -> float:
    return abs(units) * price * margin_rate


def calculate_position_size(
    account_balance: float, risk_percent: float,
    entry_price: float, stop_loss_price: float,
    instrument: str = "EUR_USD",
) -> Dict[str, Any]:
    risk_amount = account_balance * (risk_percent / 100.0)
    price_distance = abs(entry_price - stop_loss_price)
    is_jpy = "JPY" in instrument.upper()
    pip_multiplier = 100 if is_jpy else 10000
    pip_distance = price_distance * pip_multiplier
    if pip_distance <= 0:
        raise ValueError("Entry and stop loss must be different prices")
    if is_jpy:
        pip_value_per_unit = 0.01 / entry_price
    else:
        pip_value_per_unit = 0.0001 / entry_price if "USD" not in instrument.split("_")[-1] else 0.0001
    units = risk_amount / (pip_distance * pip_value_per_unit) if pip_value_per_unit > 0 else risk_amount / price_distance
    return {
        "units": round(units, 0),
        "risk_amount": round(risk_amount, 2),
        "pip_distance": round(pip_distance, 1),
        "price_distance": round(price_distance, 6),
    }


async def get_risk_assessment(client: OandaClient, instrument: str, units: float) -> Dict[str, Any]:
    summary = await get_account_summary(client)
    price_data = await get_latest_price(client, instrument)
    balance = summary.get("balance", 0)
    margin_available = summary.get("margin_available", 0)
    margin_rate = float(summary.get("margin_rate", 0.02))
    current_price = price_data.get("mid", 0)
    margin_required = calculate_margin_required(units, current_price, margin_rate)
    margin_percent = (margin_required / margin_available * 100) if margin_available > 0 else 100
    return {
        "instrument": instrument, "units": units, "current_price": current_price,
        "account_balance": balance, "margin_available": margin_available,
        "margin_required": round(margin_required, 2),
        "margin_usage_percent": round(margin_percent, 2),
        "can_execute": margin_required <= margin_available,
        "leverage": round(1 / margin_rate) if margin_rate > 0 else 0,
    }
