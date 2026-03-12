"""
Risk Service
Broker-agnostic risk calculations.
"""

from typing import Dict, Any
from broker.oanda.risk import (
    calculate_lot_size,
    calculate_margin_required,
    calculate_position_size,
)


def compute_position_size(
    account_balance: float,
    risk_percent: float,
    entry_price: float,
    stop_loss_price: float,
    instrument: str = "EUR_USD",
) -> Dict[str, Any]:
    """Wrapper for broker-agnostic position sizing."""
    return calculate_position_size(
        account_balance, risk_percent,
        entry_price, stop_loss_price, instrument,
    )


def compute_lot_size(
    account_balance: float,
    risk_percent: float,
    stop_loss_pips: float,
    pip_value: float = 10.0,
) -> float:
    return calculate_lot_size(account_balance, risk_percent, stop_loss_pips, pip_value)


def compute_margin(units: float, price: float, margin_rate: float) -> float:
    return calculate_margin_required(units, price, margin_rate)
