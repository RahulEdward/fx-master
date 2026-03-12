"""
OANDA Authentication Module
Token validation and account connection.
"""

from typing import Dict, Any
from broker.oanda.client import OandaClient
from utils.logger import logger


async def validate_token(client: OandaClient) -> bool:
    """
    Validate that the API token is valid by attempting to list accounts.
    Returns True if the token is valid.
    """
    try:
        response = await client.get("/v3/accounts")
        accounts = response.get("accounts", [])
        logger.info(f"Token validated — {len(accounts)} account(s) found")
        return len(accounts) > 0
    except Exception as e:
        logger.error(f"Token validation failed: {e}")
        return False


async def connect_account(client: OandaClient) -> Dict[str, Any]:
    """
    Connect and return full account details for the configured account_id.
    """
    response = await client.get(f"/v3/accounts/{client.account_id}")
    account = response.get("account", {})
    logger.info(f"Connected to account {client.account_id}")
    return {
        "account_id": account.get("id"),
        "alias": account.get("alias", ""),
        "currency": account.get("currency", "USD"),
        "balance": float(account.get("balance", 0)),
        "margin_available": float(account.get("marginAvailable", 0)),
        "margin_used": float(account.get("marginUsed", 0)),
        "unrealized_pl": float(account.get("unrealizedPL", 0)),
        "open_trade_count": int(account.get("openTradeCount", 0)),
        "open_position_count": int(account.get("openPositionCount", 0)),
        "environment": client.environment,
    }


async def get_account_details(client: OandaClient) -> Dict[str, Any]:
    """Get full account details including all fields."""
    response = await client.get(f"/v3/accounts/{client.account_id}")
    return response.get("account", {})
