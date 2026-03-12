"""
OANDA Instruments Module
Instrument lookup and metadata.
"""

from typing import Dict, Any, List, Optional
from broker.oanda.client import OandaClient


async def get_instruments(
    client: OandaClient,
    instrument_type: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Get all tradable instruments, optionally filtered by type.
    Types: CURRENCY, CFD, METAL
    """
    params = {}
    if instrument_type:
        params["type"] = instrument_type

    response = await client.get(
        f"/v3/accounts/{client.account_id}/instruments",
        params=params if params else None,
    )
    instruments = response.get("instruments", [])
    return [
        {
            "name": inst.get("name"),
            "display_name": inst.get("displayName"),
            "type": inst.get("type"),
            "pip_location": inst.get("pipLocation"),
            "display_precision": inst.get("displayPrecision"),
            "trade_units_precision": inst.get("tradeUnitsPrecision"),
            "margin_rate": inst.get("marginRate"),
            "minimum_trade_size": inst.get("minimumTradeSize"),
            "maximum_order_units": inst.get("maximumOrderUnits"),
            "tags": [t.get("name") for t in inst.get("tags", [])],
        }
        for inst in instruments
    ]


async def get_instrument_details(
    client: OandaClient,
    instrument: str,
) -> Dict[str, Any]:
    """Get details for a specific instrument."""
    response = await client.get(
        f"/v3/accounts/{client.account_id}/instruments",
        params={"instruments": instrument},
    )
    instruments = response.get("instruments", [])
    if instruments:
        inst = instruments[0]
        return {
            "name": inst.get("name"),
            "display_name": inst.get("displayName"),
            "type": inst.get("type"),
            "pip_location": inst.get("pipLocation"),
            "display_precision": inst.get("displayPrecision"),
            "margin_rate": inst.get("marginRate"),
            "financing": inst.get("financing", {}),
        }
    return {}
