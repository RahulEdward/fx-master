"""
FX-Master Logger Utility
Structured logging with loguru.
"""

import sys
from loguru import logger as _logger
from config import settings

# Remove default handler
_logger.remove()

# Console handler
_logger.add(
    sys.stderr,
    level="DEBUG" if settings.DEBUG else "INFO",
    format=(
        "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
        "<level>{message}</level>"
    ),
    colorize=True,
)

# File handler (rotating)
_logger.add(
    "logs/fxmaster_{time:YYYY-MM-DD}.log",
    rotation="10 MB",
    retention="30 days",
    compression="gz",
    level="DEBUG",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} | {message}",
)

logger = _logger
