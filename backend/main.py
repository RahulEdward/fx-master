"""
FX-Master — Main FastAPI Application
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database.connection import init_db, close_db
# Import all models so Base.metadata discovers them
import models  # noqa: F401

from routes.auth_routes import router as auth_router
from routes.broker_routes import router as broker_router
from routes.market_routes import router as market_router
from routes.trading_routes import router as trading_router

from services.websocket_service import ws_manager
from utils.logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    logger.info(f"Starting {settings.APP_NAME} [{settings.APP_ENV}]")

    # Initialize database tables
    await init_db()
    logger.info("Database initialized")

    # Start Redis WebSocket listener
    try:
        await ws_manager.start_redis_listener()
        logger.info("WebSocket Redis listener started")
    except Exception as e:
        logger.warning(f"Redis not available, WS streaming disabled: {e}")

    yield

    # Shutdown
    logger.info("Shutting down...")
    await ws_manager.stop()
    await close_db()
    logger.info("Shutdown complete")


app = FastAPI(
    title=settings.APP_NAME,
    description="FX-Master Forex Trading SaaS Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---- Register Routers ----
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(broker_router, prefix=settings.API_PREFIX)
app.include_router(market_router, prefix=settings.API_PREFIX)
app.include_router(trading_router, prefix=settings.API_PREFIX)


# ---- WebSocket Endpoint ----
@app.websocket("/ws/prices")
async def websocket_prices(
    websocket: WebSocket,
    instruments: str = Query(default="EUR_USD"),
):
    """
    WebSocket endpoint for live price streaming.
    Connect with: ws://host/ws/prices?instruments=EUR_USD,GBP_USD
    """
    inst_list = [i.strip() for i in instruments.split(",")]
    await ws_manager.connect(websocket, inst_list)

    try:
        while True:
            # Keep connection alive; client can send subscribe/unsubscribe messages
            data = await websocket.receive_text()
            # Handle client messages (subscribe/unsubscribe)
            import json
            try:
                msg = json.loads(data)
                action = msg.get("action")
                symbols = msg.get("instruments", [])
                if action == "subscribe":
                    for s in symbols:
                        if s not in ws_manager._connections:
                            ws_manager._connections[s] = set()
                        ws_manager._connections[s].add(websocket)
                elif action == "unsubscribe":
                    for s in symbols:
                        if s in ws_manager._connections:
                            ws_manager._connections[s].discard(websocket)
            except Exception:
                pass
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
        logger.info("WebSocket client disconnected")


# ---- Health Check ----
@app.get("/health")
async def health():
    return {"status": "healthy", "service": settings.APP_NAME}


@app.get("/")
async def root():
    return {
        "service": settings.APP_NAME,
        "version": "1.0.0",
        "docs": "/docs",
    }
