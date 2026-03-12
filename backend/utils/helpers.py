"""
FX-Master General Helpers
"""

from datetime import datetime, timezone
from typing import Any, Dict, Optional


def utcnow() -> datetime:
    """Return timezone-aware UTC now."""
    return datetime.now(timezone.utc)


def to_timestamp(dt: datetime) -> float:
    """Convert datetime to Unix timestamp."""
    return dt.timestamp()


def from_timestamp(ts: float) -> datetime:
    """Convert Unix timestamp to UTC datetime."""
    return datetime.fromtimestamp(ts, tz=timezone.utc)


def safe_float(value: Any, default: float = 0.0) -> float:
    """Safely convert a value to float."""
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def safe_int(value: Any, default: int = 0) -> int:
    """Safely convert a value to int."""
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def sanitize_symbol(symbol: str) -> str:
    """Normalize instrument symbol: EUR/USD -> EUR_USD."""
    return symbol.strip().upper().replace("/", "_")


def format_pips(value: float, instrument: str) -> float:
    """Convert raw price diff to pips based on instrument type."""
    # JPY pairs have 2-digit pip, others have 4-digit
    if "JPY" in instrument.upper():
        return round(value * 100, 1)
    return round(value * 10000, 1)


def build_response(
    success: bool = True,
    data: Any = None,
    message: str = "",
    errors: Optional[list] = None,
) -> Dict[str, Any]:
    """Standard API response envelope."""
    resp: Dict[str, Any] = {"success": success}
    if message:
        resp["message"] = message
    if data is not None:
        resp["data"] = data
    if errors:
        resp["errors"] = errors
    return resp
