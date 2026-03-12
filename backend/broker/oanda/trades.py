"""
OANDA Trade Management Module
"""

from typing import Dict, Any, List, Optional
from broker.oanda.client import OandaClient
from utils.logger import logger


async def get_open_trades(client: OandaClient) -> List[Dict[str, Any]]:
    """Get all open trades for the account."""
    response = await client.get(f"/v3/accounts/{client.account_id}/openTrades")
    trades = response.get("trades", [])
    return [_parse_trade(t) for t in trades]


async def get_trade(client: OandaClient, trade_id: str) -> Dict[str, Any]:
    """Get details for a specific trade."""
    response = await client.get(f"/v3/accounts/{client.account_id}/trades/{trade_id}")
    trade = response.get("trade", {})
    return _parse_trade(trade)


async def close_trade(
    client: OandaClient,
    trade_id: str,
    units: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Close a trade (fully or partially).
    If units is None, closes the entire trade.
    """
    body = {}
    if units:
        body["units"] = str(units)
    else:
        body["units"] = "ALL"

    response = await client.put(
        f"/v3/accounts/{client.account_id}/trades/{trade_id}/close",
        json_body=body,
    )
    logger.info(f"Trade {trade_id} closed")
    return _parse_close_response(response)


async def modify_trade(
    client: OandaClient,
    trade_id: str,
    take_profit: Optional[float] = None,
    stop_loss: Optional[float] = None,
    trailing_stop_distance: Optional[float] = None,
) -> Dict[str, Any]:
    """Modify TP/SL/trailing stop on an open trade."""
    body: Dict[str, Any] = {}

    if take_profit is not None:
        body["takeProfit"] = {"price": str(take_profit)}
    if stop_loss is not None:
        body["stopLoss"] = {"price": str(stop_loss)}
    if trailing_stop_distance is not None:
        body["trailingStopLoss"] = {"distance": str(trailing_stop_distance)}

    response = await client.put(
        f"/v3/accounts/{client.account_id}/trades/{trade_id}/orders",
        json_body=body,
    )
    logger.info(f"Trade {trade_id} modified: TP={take_profit}, SL={stop_loss}")
    return response


def _parse_trade(trade: Dict[str, Any]) -> Dict[str, Any]:
    """Parse a trade object from OANDA API response."""
    return {
        "trade_id": trade.get("id"),
        "instrument": trade.get("instrument"),
        "side": "LONG" if float(trade.get("currentUnits", 0)) > 0 else "SHORT",
        "units": float(trade.get("currentUnits", 0)),
        "initial_units": float(trade.get("initialUnits", 0)),
        "entry_price": float(trade.get("price", 0)),
        "current_price": float(trade.get("unrealizedPL", 0)),  # Approximation
        "unrealized_pl": float(trade.get("unrealizedPL", 0)),
        "realized_pl": float(trade.get("realizedPL", 0)),
        "swap": float(trade.get("financing", 0)),
        "commission": float(trade.get("commission", 0)) if trade.get("commission") else 0.0,
        "margin_used": float(trade.get("marginUsed", 0)) if trade.get("marginUsed") else 0.0,
        "state": trade.get("state", "OPEN"),
        "open_time": trade.get("openTime"),
        "take_profit": trade.get("takeProfitOrder", {}).get("price") if trade.get("takeProfitOrder") else None,
        "stop_loss": trade.get("stopLossOrder", {}).get("price") if trade.get("stopLossOrder") else None,
        "trailing_stop_distance": trade.get("trailingStopLossOrder", {}).get("distance") if trade.get("trailingStopLossOrder") else None,
    }


def _parse_close_response(response: Dict[str, Any]) -> Dict[str, Any]:
    """Parse the response from closing a trade."""
    result: Dict[str, Any] = {"status": "CLOSED"}

    if "orderFillTransaction" in response:
        fill = response["orderFillTransaction"]
        result["trade_id"] = fill.get("tradesClosed", [{}])[0].get("tradeID") if fill.get("tradesClosed") else None
        result["instrument"] = fill.get("instrument")
        result["units"] = float(fill.get("units", 0))
        result["price"] = float(fill.get("price", 0))
        result["realized_pl"] = float(fill.get("pl", 0))
        result["financing"] = float(fill.get("financing", 0))
        result["time"] = fill.get("time")

    return result
