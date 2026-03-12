"""
OANDA Order Management Module
Placing and managing orders via OANDA v20 API.
"""

from typing import Dict, Any, Optional, List
from broker.oanda.client import OandaClient
from utils.logger import logger


async def place_market_order(
    client: OandaClient,
    instrument: str,
    units: float,
    take_profit: Optional[float] = None,
    stop_loss: Optional[float] = None,
    time_in_force: str = "FOK",
) -> Dict[str, Any]:
    """
    Place a market order.
    units > 0 = BUY, units < 0 = SELL
    """
    order_body: Dict[str, Any] = {
        "order": {
            "type": "MARKET",
            "instrument": instrument,
            "units": str(units),
            "timeInForce": time_in_force,
            "positionFill": "DEFAULT",
        }
    }

    if take_profit is not None:
        order_body["order"]["takeProfitOnFill"] = {"price": str(take_profit)}
    if stop_loss is not None:
        order_body["order"]["stopLossOnFill"] = {"price": str(stop_loss)}

    response = await client.post(
        f"/v3/accounts/{client.account_id}/orders",
        json_body=order_body,
    )
    logger.info(f"Market order placed: {units} {instrument}")
    return _parse_order_response(response)


async def place_limit_order(
    client: OandaClient,
    instrument: str,
    units: float,
    price: float,
    take_profit: Optional[float] = None,
    stop_loss: Optional[float] = None,
    time_in_force: str = "GTC",
    gtd_time: Optional[str] = None,
) -> Dict[str, Any]:
    """Place a limit order."""
    order_body: Dict[str, Any] = {
        "order": {
            "type": "LIMIT",
            "instrument": instrument,
            "units": str(units),
            "price": str(price),
            "timeInForce": time_in_force,
            "positionFill": "DEFAULT",
        }
    }

    if time_in_force == "GTD" and gtd_time:
        order_body["order"]["gtdTime"] = gtd_time
    if take_profit is not None:
        order_body["order"]["takeProfitOnFill"] = {"price": str(take_profit)}
    if stop_loss is not None:
        order_body["order"]["stopLossOnFill"] = {"price": str(stop_loss)}

    response = await client.post(
        f"/v3/accounts/{client.account_id}/orders",
        json_body=order_body,
    )
    logger.info(f"Limit order placed: {units} {instrument} @ {price}")
    return _parse_order_response(response)


async def place_stop_order(
    client: OandaClient,
    instrument: str,
    units: float,
    price: float,
    take_profit: Optional[float] = None,
    stop_loss: Optional[float] = None,
    time_in_force: str = "GTC",
    gtd_time: Optional[str] = None,
) -> Dict[str, Any]:
    """Place a stop order."""
    order_body: Dict[str, Any] = {
        "order": {
            "type": "STOP",
            "instrument": instrument,
            "units": str(units),
            "price": str(price),
            "timeInForce": time_in_force,
            "positionFill": "DEFAULT",
        }
    }

    if time_in_force == "GTD" and gtd_time:
        order_body["order"]["gtdTime"] = gtd_time
    if take_profit is not None:
        order_body["order"]["takeProfitOnFill"] = {"price": str(take_profit)}
    if stop_loss is not None:
        order_body["order"]["stopLossOnFill"] = {"price": str(stop_loss)}

    response = await client.post(
        f"/v3/accounts/{client.account_id}/orders",
        json_body=order_body,
    )
    logger.info(f"Stop order placed: {units} {instrument} @ {price}")
    return _parse_order_response(response)


async def place_stop_limit_order(
    client: OandaClient,
    instrument: str,
    units: float,
    price: float,
    price_bound: float,
    take_profit: Optional[float] = None,
    stop_loss: Optional[float] = None,
    time_in_force: str = "GTC",
    gtd_time: Optional[str] = None,
) -> Dict[str, Any]:
    """Place a stop-limit (market-if-touched) order."""
    order_body: Dict[str, Any] = {
        "order": {
            "type": "MARKET_IF_TOUCHED",
            "instrument": instrument,
            "units": str(units),
            "price": str(price),
            "priceBound": str(price_bound),
            "timeInForce": time_in_force,
            "positionFill": "DEFAULT",
        }
    }

    if time_in_force == "GTD" and gtd_time:
        order_body["order"]["gtdTime"] = gtd_time
    if take_profit is not None:
        order_body["order"]["takeProfitOnFill"] = {"price": str(take_profit)}
    if stop_loss is not None:
        order_body["order"]["stopLossOnFill"] = {"price": str(stop_loss)}

    response = await client.post(
        f"/v3/accounts/{client.account_id}/orders",
        json_body=order_body,
    )
    logger.info(f"Stop-limit order placed: {units} {instrument} @ {price}")
    return _parse_order_response(response)


async def get_pending_orders(client: OandaClient) -> List[Dict[str, Any]]:
    """Get all pending orders."""
    response = await client.get(f"/v3/accounts/{client.account_id}/pendingOrders")
    orders = response.get("orders", [])
    return [_parse_order(o) for o in orders]


async def cancel_order(client: OandaClient, order_id: str) -> Dict[str, Any]:
    """Cancel a pending order."""
    response = await client.put(f"/v3/accounts/{client.account_id}/orders/{order_id}/cancel")
    logger.info(f"Order {order_id} cancelled")
    return response


def _parse_order_response(response: Dict[str, Any]) -> Dict[str, Any]:
    """Parse the response from an order placement."""
    result: Dict[str, Any] = {}

    # Check for order fill (market orders fill immediately)
    if "orderFillTransaction" in response:
        fill = response["orderFillTransaction"]
        result["status"] = "FILLED"
        result["order_id"] = fill.get("orderID")
        result["trade_id"] = fill.get("tradeOpened", {}).get("tradeID") or fill.get("id")
        result["instrument"] = fill.get("instrument")
        result["units"] = float(fill.get("units", 0))
        result["price"] = float(fill.get("price", 0))
        result["pl"] = float(fill.get("pl", 0))
        result["financing"] = float(fill.get("financing", 0))
        result["commission"] = float(fill.get("commission", 0))
        result["time"] = fill.get("time")

    # Check for order create (pending orders)
    elif "orderCreateTransaction" in response:
        create = response["orderCreateTransaction"]
        result["status"] = "PENDING"
        result["order_id"] = create.get("id")
        result["instrument"] = create.get("instrument")
        result["units"] = float(create.get("units", 0))
        result["price"] = float(create.get("price", 0))
        result["time"] = create.get("time")

    # Check for rejection
    elif "orderRejectTransaction" in response:
        reject = response["orderRejectTransaction"]
        result["status"] = "REJECTED"
        result["reject_reason"] = reject.get("rejectReason")
        result["order_id"] = reject.get("id")

    return result


def _parse_order(order: Dict[str, Any]) -> Dict[str, Any]:
    """Parse a single order object."""
    return {
        "order_id": order.get("id"),
        "type": order.get("type"),
        "instrument": order.get("instrument"),
        "units": float(order.get("units", 0)),
        "price": float(order.get("price", 0)),
        "state": order.get("state"),
        "time_in_force": order.get("timeInForce"),
        "create_time": order.get("createTime"),
        "take_profit": order.get("takeProfitOnFill", {}).get("price"),
        "stop_loss": order.get("stopLossOnFill", {}).get("price"),
    }
