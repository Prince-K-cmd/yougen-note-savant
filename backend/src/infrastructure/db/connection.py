
import os
import logging
from typing import Dict, Any, List, Optional
import asyncpg
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)


class Database:
    """Database connection manager using asyncpg."""
    
    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None
    
    async def connect(self) -> None:
        """Create a connection pool to the database."""
        try:
            database_url = os.getenv("DATABASE_URL")
            if not database_url:
                raise ValueError("DATABASE_URL environment variable not set")
                
            self.pool = await asyncpg.create_pool(
                database_url,
                min_size=1,
                max_size=10,
            )
            logger.info("Database connection established")
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            raise
    
    async def disconnect(self) -> None:
        """Close the connection pool."""
        if self.pool:
            await self.pool.close()
            logger.info("Database connection closed")
    
    async def execute(self, query: str, *args: Any) -> str:
        """Execute a query and return the status."""
        if not self.pool:
            await self.connect()
        async with self.pool.acquire() as conn:
            return await conn.execute(query, *args)
    
    async def fetch(self, query: str, *args: Any) -> List[Dict[str, Any]]:
        """Execute a query and return all results as dicts."""
        if not self.pool:
            await self.connect()
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(query, *args)
            return [dict(row) for row in rows]
    
    async def fetchone(self, query: str, *args: Any) -> Optional[Dict[str, Any]]:
        """Execute a query and return the first result as a dict."""
        if not self.pool:
            await self.connect()
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(query, *args)
            return dict(row) if row else None


# Create a database instance
db = Database()
