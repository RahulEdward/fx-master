"""
OANDA Account Management Module
"""

from typing import Dict, Any, List
from broker.oanda.client import OandaClient
from utils.logger import logger


async def get_accounts(client: OandaClient) -> List[Dict[str, Any]]:
    """List all accounts accessible with the current token."""
    response = await client.get("/v3/accounts")
    accounts = response.get("accounts", [])
    return [
        {
            "id": acc.get("id"),
            "tags": acc.get("tags", []),
        }
        for acc in accounts
    ]


async def get_account_summary(client: OandaClient) -> Dict[str, Any]:
    """Get account summary (lighter than full details)."""
    response = await client.get(f"/v3/accounts/{client.account_id}/summary")
    account = response.get("account", {})
    return {
        "account_id": account.get("id"),
        "alias": account.get("alias", ""),
        "currency": account.get("currency", "USD"),
        "balance": float(account.get("balance", 0)),
        "nav": float(account.get("NAV", 0)),
        "margin_available": float(account.get("marginAvailable", 0)),
        "margin_used": float(account.get("marginUsed", 0)),
        "margin_rate": float(account.get("marginRate", 0)),
        "unrealized_pl": float(account.get("unrealizedPL", 0)),
        "realized_pl": float(account.get("pl", 0)),
        "open_trade_count": int(account.get("openTradeCount", 0)),
        "open_position_count": int(account.get("openPositionCount", 0)),
        "pending_order_count": int(account.get("pendingOrderCount", 0)),
        "financing": float(account.get("financing", 0)),
        "last_transaction_id": account.get("lastTransactionID"),
    }


async def get_account_details(client: OandaClient) -> Dict[str, Any]:
    """Get full account details with all sub-entities."""
    response = await client.get(f"/v3/accounts/{client.account_id}")
    return response.get("account", {})


async def get_account_configuration(client: OandaClient) -> Dict[str, Any]:
    """Get account configuration."""
    details = await get_account_details(client)
    return {
        "alias": details.get("alias"),
        "currency": details.get("currency"),
        "margin_rate": details.get("marginRate"),
        "hedging_enabled": details.get("hedgingEnabled", False),
        "guaranteed_stop_loss_order_mode": details.get("guaranteedStopLossOrderMode"),
    }


async def get_account_instruments(client: OandaClient) -> List[Dict[str, Any]]:
    """Get list of tradable instruments for the account."""
    response = await client.get(f"/v3/accounts/{client.account_id}/instruments")
    instruments = response.get("instruments", [])
    return [
        {
            "name": inst.get("name"),
            "display_name": inst.get("displayName"),
            "type": inst.get("type"),
            "pip_location": inst.get("pipLocation"),
            "display_precision": inst.get("displayPrecision"),
            "margin_rate": inst.get("marginRate"),
            "minimum_trade_size": inst.get("minimumTradeSize"),
            "maximum_trailing_stop_distance": inst.get("maximumTrailingStopDistance"),
            "minimum_trailing_stop_distance": inst.get("minimumTrailingStopDistance"),
        }
        for inst in instruments
    ]
