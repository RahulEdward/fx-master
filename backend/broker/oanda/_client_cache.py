"""
Cached OANDA client pool — reuses HTTP connections per broker account.
"""
import asyncio
from typing import Dict, Tuple
from broker.oanda.client import OandaClient
from utils.security import decrypt_credential
from models.broker_account import BrokerAccount

_cache: Dict[int, Tuple[OandaClient, float]] = {}
_lock = asyncio.Lock()
_TTL = 300  # 5 minutes


async def get_cached_client(account: BrokerAccount) -> OandaClient:
    """Get or create a cached OandaClient for the given broker account."""
    import time
    now = time.time()

    async with _lock:
        if account.id in _cache:
            client, created = _cache[account.id]
            if now - created < _TTL and client._client and not client._client.is_closed:
                return client
            # Expired or closed — clean up
            try:
                await client.close()
            except Exception:
                pass

        token = decrypt_credential(account.api_token_encrypted)
        client = OandaClient(token, account.account_id, account.environment)
        _cache[account.id] = (client, now)
        return client
