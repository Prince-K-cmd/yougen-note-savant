
import asyncio
import logging
from sqlalchemy_utils import database_exists, create_database
from src.infrastructure.db.connection import get_db_url, engine
from src.domain.models import Base

logger = logging.getLogger(__name__)

def init_database():
    """Create database and tables if they don't exist."""
    try:
        url = get_db_url()
        
        # Create database if it doesn't exist
        if not database_exists(url):
            create_database(url)
            logger.info("Database created")
        else:
            logger.info("Database already exists")
        
        # Create tables
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created")
        
        return True
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        return False

if __name__ == "__main__":
    init_database()
