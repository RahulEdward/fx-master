"""
WebSocket Service
Manages WebSocket connections and subscribes to Redis PubSub for live prices.
"""

import asyncio
import json
from typing import Dict, Set
from fastapi import WebSocket
import redis.asyncio as aioredis

from config import settings
from utils.logger import logger


class WebSocketManager:
    """Manages client WebSocket connections and price subscriptions."""

    def __init__(self):
        self._connections: Dict[str, Set[WebSocket]] = {}  # instrument -> set of websockets
        self._redis: aioredis.Redis = None
        self._listener_task: asyncio.Task = None

    async def _get_redis(self) -> aioredis.Redis:
        if self._redis is None:
            self._redis = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        return self._redis

    async def connect(self, websocket: WebSocket, instruments: list[str]):
        """Register a WebSocket client for given instruments."""
        await websocket.accept()
        for inst in instruments:
            if inst not in self._connections:
                self._connections[inst] = set()
            self._connections[inst].add(websocket)
        logger.info(f"WS client connected for {instruments}")

    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket client from all subscriptions."""
        for inst in list(self._connections.keys()):
            self._connections[inst].discard(websocket)
            if not self._connections[inst]:
                del self._connections[inst]

    async def broadcast(self, instrument: str, data: dict):
        """Send data to all clients subscribed to an instrument."""
        clients = self._connections.get(instrument, set())
        dead = []
        for ws in clients:
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            clients.discard(ws)

    async def start_redis_listener(self):
        """Start listening to Redis PubSub channels and forwarding to WS clients."""
        if self._listener_task and not self._listener_task.done():
            return
        self._listener_task = asyncio.create_task(self._listen_loop())

    async def _listen_loop(self):
        """Main Redis PubSub listener loop."""
        redis_client = await self._get_redis()
        pubsub = redis_client.pubsub()
        await pubsub.psubscribe("prices:*")

        try:
            async for message in pubsub.listen():
                if message["type"] == "pmessage":
                    channel = message["channel"]
                    instrument = channel.replace("prices:", "")
                    try:
                        data = json.loads(message["data"])
                    except (json.JSONDecodeError, TypeError):
                        continue
                    await self.broadcast(instrument, data)
        except asyncio.CancelledError:
            pass
        finally:
            await pubsub.unsubscribe()

    async def stop(self):
        """Clean shutdown."""
        if self._listener_task:
            self._listener_task.cancel()
        if self._redis:
            await self._redis.close()


# Singleton instance
ws_manager = WebSocketManager()
