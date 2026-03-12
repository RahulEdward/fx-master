"""
OANDA Position Management Module
"""

from typing import Dict, Any, List
from broker.oanda.client import OandaClient
from utils.logger import logger


async def get_positions(client: OandaClient) -> List[Dict[str, Any]]:
    """Get all open positions."""
    response = await client.get(f"/v3/accounts/{client.account_id}/openPositions")
    positions = response.get("positions", [])
    return [_parse_position(p) for p in positions]


async def get_position(client: OandaClient, instrument: str) -> Dict[str, Any]:
    """Get position for a specific instrument."""
    response = await client.get(
        f"/v3/accounts/{client.account_id}/positions/{instrument}"
    )
    position = response.get("position", {})
    return _parse_position(position)


async def close_position(
    client: OandaClient,
    instrument: str,
    long_units: str = "NONE",
    short_units: str = "NONE",
) -> Dict[str, Any]:
    """
    Close a position (long side, short side, or both).
    Use "ALL" to close all units on a side.
    """
    body = {
        "longUnits": long_units,
        "shortUnits": short_units,
    }

    response = await client.put(
        f"/v3/accounts/{client.account_id}/positions/{instrument}/close",
        json_body=body,
    )
    logger.info(f"Position {instrument} closed: long={long_units}, short={short_units}")
    return response


def _parse_position(position: Dict[str, Any]) -> Dict[str, Any]:
    """Parse a position object from OANDA API response."""
    long_info = position.get("long", {})
    short_info = position.get("short", {})

    return {
        "instrument": position.get("instrument"),
        "long_units": float(long_info.get("units", 0)),
        "long_average_price": float(long_info.get("averagePrice", 0)) if long_info.get("averagePrice") else 0.0,
        "long_unrealized_pl": float(long_info.get("unrealizedPL", 0)),
        "short_units": float(short_info.get("units", 0)),
        "short_average_price": float(short_info.get("averagePrice", 0)) if short_info.get("averagePrice") else 0.0,
        "short_unrealized_pl": float(short_info.get("unrealizedPL", 0)),
        "unrealized_pl": float(position.get("unrealizedPL", 0)),
        "margin_used": float(position.get("marginUsed", 0)) if position.get("marginUsed") else 0.0,
    }
