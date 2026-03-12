"""
OANDA Transaction History Module
"""

from typing import Dict, Any, List, Optional
from broker.oanda.client import OandaClient
from utils.logger import logger
import json


async def get_transaction_history(
    client: OandaClient,
    from_time: Optional[str] = None,
    to_time: Optional[str] = None,
    page_size: int = 100,
    transaction_type: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Get transaction history for the account.

    Transaction types:
        ORDER_FILL, TAKE_PROFIT_ORDER, STOP_LOSS_ORDER,
        MARGIN_CALL_ENTER, MARGIN_CALL_EXIT, DAILY_FINANCING,
        TRANSFER_FUNDS, etc.
    """
    params: Dict[str, Any] = {"pageSize": page_size}
    if from_time:
        params["from"] = from_time
    if to_time:
        params["to"] = to_time
    if transaction_type:
        params["type"] = transaction_type

    response = await client.get(
        f"/v3/accounts/{client.account_id}/transactions",
        params=params,
    )

    # The transactions endpoint returns transaction IDs; we need to fetch ranges
    pages = response.get("pages", [])
    transactions = []

    # Get the transaction ID range
    tx_from = response.get("from")
    tx_to = response.get("to")

    if tx_from and tx_to:
        range_response = await client.get(
            f"/v3/accounts/{client.account_id}/transactions/idrange",
            params={"from": tx_from, "to": tx_to},
        )
        raw_transactions = range_response.get("transactions", [])
        for tx in raw_transactions:
            if transaction_type and tx.get("type") != transaction_type:
                continue
            transactions.append(_parse_transaction(tx))

    logger.debug(f"Fetched {len(transactions)} transactions")
    return transactions


async def get_transaction_details(
    client: OandaClient,
    transaction_id: str,
) -> Dict[str, Any]:
    """Get details for a specific transaction."""
    response = await client.get(
        f"/v3/accounts/{client.account_id}/transactions/{transaction_id}"
    )
    transaction = response.get("transaction", {})
    return _parse_transaction(transaction)


async def get_recent_transactions(
    client: OandaClient,
    count: int = 50,
) -> List[Dict[str, Any]]:
    """Get the most recent N transactions using sinceID."""
    # First get account to find last transaction ID
    summary = await client.get(f"/v3/accounts/{client.account_id}/summary")
    last_id = summary.get("account", {}).get("lastTransactionID")

    if not last_id:
        return []

    since_id = max(0, int(last_id) - count)
    response = await client.get(
        f"/v3/accounts/{client.account_id}/transactions/sinceid",
        params={"id": str(since_id)},
    )

    raw_transactions = response.get("transactions", [])
    return [_parse_transaction(tx) for tx in raw_transactions]


def _parse_transaction(tx: Dict[str, Any]) -> Dict[str, Any]:
    """Parse a transaction object from OANDA API response."""
    return {
        "transaction_id": tx.get("id"),
        "type": tx.get("type"),
        "time": tx.get("time"),
        "instrument": tx.get("instrument"),
        "units": float(tx.get("units", 0)) if tx.get("units") else None,
        "price": float(tx.get("price", 0)) if tx.get("price") else None,
        "pl": float(tx.get("pl", 0)) if tx.get("pl") else 0.0,
        "financing": float(tx.get("financing", 0)) if tx.get("financing") else 0.0,
        "commission": float(tx.get("commission", 0)) if tx.get("commission") else 0.0,
        "account_balance": float(tx.get("accountBalance", 0)) if tx.get("accountBalance") else None,
        "reason": tx.get("reason"),
        "trade_id": tx.get("tradeID"),
        "order_id": tx.get("orderID"),
        "raw_data": json.dumps(tx),
    }
