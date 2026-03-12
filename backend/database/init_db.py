"""
Database Initialization Script
Run standalone to create all tables.
"""

import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(__file__) + "/..")

from database.connection import init_db, close_db
import models  # noqa: F401


async def main():
    print("Creating database tables...")
    await init_db()
    print("Done. All tables created.")
    await close_db()


if __name__ == "__main__":
    asyncio.run(main())
