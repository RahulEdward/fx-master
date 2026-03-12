"""
OANDA-specific Utility Functions
"""

# OANDA granularity mapping
TIMEFRAME_MAP = {
    "1s": "S5", "5s": "S5", "10s": "S10", "15s": "S15", "30s": "S30",
    "1m": "M1", "5m": "M5", "15m": "M15", "30m": "M30",
    "1h": "H1", "4h": "H4", "1d": "D",
    "S5": "S5", "M1": "M1", "M5": "M5", "M15": "M15", "M30": "M30",
    "H1": "H1", "H4": "H4", "D": "D", "W": "W",
}


def normalize_granularity(timeframe: str) -> str:
    """Convert common timeframe strings to OANDA granularity."""
    return TIMEFRAME_MAP.get(timeframe, timeframe.upper())


def oanda_instrument(symbol: str) -> str:
    """Normalize instrument symbol for OANDA (EUR/USD -> EUR_USD)."""
    return symbol.strip().upper().replace("/", "_")
