
import os
import logging
from typing import Dict, Any, List, Optional
import asyncpg
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.asyncio import async_scoped_session
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from dotenv import load_dotenv
from ...domain.models import Base

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)


# SQLAlchemy sync engine and session
def get_db_url():
    """Get database URL from environment variables."""
    username = os.getenv("DB_USERNAME", "postgres")
    password = os.getenv("DB_PASSWORD", "yougen123")
    host = os.getenv("DB_HOST", "localhost")
    port = os.getenv("DB_PORT", "5432")
    database = os.getenv("DB_NAME", "yougen")
    return f"postgresql://{username}:{password}@{host}:{port}/{database}"


# Create SQLAlchemy engine and session
engine = create_engine(get_db_url())
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db_session = scoped_session(SessionLocal)


# AsyncPG connection pool for direct SQL queries
class Database:
    """Database connection manager using asyncpg."""
    
    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None
    
    async def connect(self) -> None:
        """Create a connection pool to the database."""
        try:
            database_url = os.getenv("DATABASE_URL", get_db_url())
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

# Function to get a database session
def get_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
