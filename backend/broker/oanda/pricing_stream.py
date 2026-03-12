"""
OANDA Live Price Streaming Module
Connects to OANDA streaming API and publishes to Redis PubSub.
"""

import asyncio
import json
from typing import List, Optional, Set

import httpx
import redis.asyncio as aioredis

from config import settings
from utils.logger import logger


class OandaPriceStream:
    """
    Manages a persistent streaming connection to OANDA pricing stream.
    Publishes tick data to Redis PubSub channels for downstream consumers.
    """

    def __init__(
        self,
        api_token: str,
        account_id: str,
        environment: str = "demo",
        redis_url: str = settings.REDIS_URL,
    ):
        self.api_token = api_token
        self.account_id = account_id
        self.environment = environment
        self.redis_url = redis_url

        if environment == "live":
            self.stream_url = settings.OANDA_STREAM_LIVE_URL
        else:
            self.stream_url = settings.OANDA_STREAM_DEMO_URL

        self._subscribed_instruments: Set[str] = set()
        self._running = False
        self._task: Optional[asyncio.Task] = None
        self._redis: Optional[aioredis.Redis] = None

    async def _get_redis(self) -> aioredis.Redis:
        if self._redis is None:
            self._redis = aioredis.from_url(self.redis_url, decode_responses=True)
        return self._redis

    def subscribe_symbol(self, symbol: str):
        """Add an instrument to the subscription set."""
        self._subscribed_instruments.add(symbol)
        logger.info(f"Subscribed to {symbol} stream")

    def unsubscribe_symbol(self, symbol: str):
        """Remove an instrument from the subscription set."""
        self._subscribed_instruments.discard(symbol)
        logger.info(f"Unsubscribed from {symbol} stream")

    async def start_price_stream(self):
        """Start the streaming connection in a background task."""
        if self._running:
            logger.warning("Price stream already running")
            return

        if not self._subscribed_instruments:
            logger.warning("No instruments subscribed — cannot start stream")
            return

        self._running = True
        self._task = asyncio.create_task(self._stream_loop())
        logger.info(f"Price stream started for {self._subscribed_instruments}")

    async def stop_price_stream(self):
        """Stop the streaming connection."""
        self._running = False
        if self._task and not self._task.done():
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        if self._redis:
            await self._redis.close()
            self._redis = None
        logger.info("Price stream stopped")

    async def _stream_loop(self):
        """Main streaming loop with automatic reconnection."""
        while self._running:
            try:
                await self._connect_and_stream()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Stream error: {e}. Reconnecting in 5s...")
                await asyncio.sleep(5)

    async def _connect_and_stream(self):
        """Connect to OANDA streaming endpoint and process ticks."""
        instruments_str = ",".join(self._subscribed_instruments)
        url = (
            f"{self.stream_url}/v3/accounts/{self.account_id}"
            f"/pricing/stream?instruments={instruments_str}"
        )

        headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Accept-Datetime-Format": "RFC3339",
        }

        redis_client = await self._get_redis()

        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream("GET", url, headers=headers) as response:
                response.raise_for_status()
                logger.info("Connected to OANDA price stream")

                async for line in response.aiter_lines():
                    if not self._running:
                        break
                    if not line.strip():
                        continue

                    try:
                        data = json.loads(line)
                    except json.JSONDecodeError:
                        continue

                    msg_type = data.get("type")

                    if msg_type == "PRICE":
                        tick = self._parse_price_tick(data)
                        if tick:
                            channel = f"prices:{tick['instrument']}"
                            await redis_client.publish(channel, json.dumps(tick))

                    elif msg_type == "HEARTBEAT":
                        # Keep-alive — optional logging
                        pass

    @staticmethod
    def _parse_price_tick(data: dict) -> Optional[dict]:
        """Parse a PRICE message from the stream into a clean tick dict."""
        instrument = data.get("instrument")
        if not instrument:
            return None

        bids = data.get("bids", [])
        asks = data.get("asks", [])
        bid = float(bids[0].get("price", 0)) if bids else 0.0
        ask = float(asks[0].get("price", 0)) if asks else 0.0

        return {
            "instrument": instrument,
            "bid": bid,
            "ask": ask,
            "mid": round((bid + ask) / 2, 6),
            "spread": round(ask - bid, 6),
            "time": data.get("time"),
            "tradeable": data.get("tradeable", False),
        }
