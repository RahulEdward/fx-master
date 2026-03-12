"""
OANDA Market Data Module
Candle history, latest pricing, and spread retrieval.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from broker.oanda.client import OandaClient
from utils.logger import logger

# Valid granularities
VALID_GRANULARITIES = {"S5", "S10", "S15", "S30", "M1", "M2", "M4", "M5",
                       "M10", "M15", "M30", "H1", "H2", "H3", "H4", "H6",
                       "H8", "H12", "D", "W", "M"}


async def get_candles(
    client: OandaClient,
    instrument: str,
    granularity: str = "M5",
    count: int = 200,
    from_time: Optional[str] = None,
    to_time: Optional[str] = None,
    price: str = "MBA",  # Mid, Bid, Ask
) -> List[Dict[str, Any]]:
    """
    Fetch historical candlestick data.

    Args:
        instrument: e.g. "EUR_USD"
        granularity: S5, M1, M5, M15, M30, H1, H4, D, etc.
        count: Number of candles (max 5000)
        from_time: RFC3339 start time
        to_time: RFC3339 end time
        price: M=mid, B=bid, A=ask (combine: "MBA")
    """
    if granularity not in VALID_GRANULARITIES:
        raise ValueError(f"Invalid granularity: {granularity}")

    params: Dict[str, Any] = {
        "granularity": granularity,
        "price": price,
    }

    if from_time and to_time:
        params["from"] = from_time
        params["to"] = to_time
    else:
        params["count"] = min(count, 5000)

    response = await client.get(
        f"/v3/instruments/{instrument}/candles",
        params=params,
    )

    candles = response.get("candles", [])
    result = []
    for c in candles:
        if not c.get("complete", False) and granularity != "S5":
            continue  # Skip incomplete candles except for tick-level

        mid = c.get("mid", {})
        candle_data = {
            "timestamp": c.get("time"),
            "open": float(mid.get("o", 0)),
            "high": float(mid.get("h", 0)),
            "low": float(mid.get("l", 0)),
            "close": float(mid.get("c", 0)),
            "volume": int(c.get("volume", 0)),
            "complete": c.get("complete", False),
        }

        # Include bid/ask if available
        if "bid" in c:
            bid = c["bid"]
            candle_data["bid_open"] = float(bid.get("o", 0))
            candle_data["bid_close"] = float(bid.get("c", 0))
        if "ask" in c:
            ask = c["ask"]
            candle_data["ask_open"] = float(ask.get("o", 0))
            candle_data["ask_close"] = float(ask.get("c", 0))

        result.append(candle_data)

    logger.debug(f"Fetched {len(result)} candles for {instrument} {granularity}")
    return result


async def get_latest_price(client: OandaClient, instrument: str) -> Dict[str, Any]:
    """Get the latest price (bid/ask/spread) for an instrument."""
    response = await client.get(
        f"/v3/accounts/{client.account_id}/pricing",
        params={"instruments": instrument},
    )
    prices = response.get("prices", [])
    if not prices:
        return {}

    p = prices[0]
    bids = p.get("bids", [{}])
    asks = p.get("asks", [{}])
    bid = float(bids[0].get("price", 0)) if bids else 0.0
    ask = float(asks[0].get("price", 0)) if asks else 0.0

    return {
        "instrument": p.get("instrument"),
        "bid": bid,
        "ask": ask,
        "mid": round((bid + ask) / 2, 6) if bid and ask else 0.0,
        "spread": round(ask - bid, 6) if bid and ask else 0.0,
        "time": p.get("time"),
        "tradeable": p.get("tradeable", False),
    }


async def get_spread(client: OandaClient, instrument: str) -> Dict[str, Any]:
    """Get current spread for an instrument."""
    price = await get_latest_price(client, instrument)
    return {
        "instrument": price.get("instrument"),
        "spread": price.get("spread", 0.0),
        "bid": price.get("bid", 0.0),
        "ask": price.get("ask", 0.0),
    }


async def get_multiple_prices(
    client: OandaClient,
    instruments: List[str],
) -> List[Dict[str, Any]]:
    """Get latest prices for multiple instruments at once."""
    instruments_str = ",".join(instruments)
    response = await client.get(
        f"/v3/accounts/{client.account_id}/pricing",
        params={"instruments": instruments_str},
    )
    prices = response.get("prices", [])
    result = []
    for p in prices:
        bids = p.get("bids", [{}])
        asks = p.get("asks", [{}])
        bid = float(bids[0].get("price", 0)) if bids else 0.0
        ask = float(asks[0].get("price", 0)) if asks else 0.0
        result.append({
            "instrument": p.get("instrument"),
            "bid": bid,
            "ask": ask,
            "mid": round((bid + ask) / 2, 6) if bid and ask else 0.0,
            "spread": round(ask - bid, 6) if bid and ask else 0.0,
            "time": p.get("time"),
            "tradeable": p.get("tradeable", False),
        })
    return result
