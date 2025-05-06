
# YouGen Database Setup Guide

This guide explains how to set up and use the YouGen database system.

## Database Architecture

YouGen uses PostgreSQL for data storage with the following components:
- Docker Compose for containerization
- SQLAlchemy for ORM (Object-Relational Mapping)
- Alembic for database migrations
- PostgreSQL as the database engine
- pgAdmin for database management

## Getting Started

### Prerequisites

- Docker and Docker Compose installed
- Python 3.8+ installed
- pip/pip3 installed

### Setup Instructions

1. **Clone the repository**

```bash
git clone <repository-url>
cd yougen
```

2. **Set up environment variables**

Create a `.env` file in the backend directory with the following variables:

```
DB_USERNAME=postgres
DB_PASSWORD=yougen123
DB_NAME=yougen
DB_HOST=localhost
DB_PORT=5432
PGADMIN_DEFAULT_EMAIL=admin@yougen.com
PGADMIN_DEFAULT_PASSWORD=admin123
```

3. **Start the database with Docker Compose**

```bash
cd backend
docker-compose up -d
```

This will start both PostgreSQL and pgAdmin containers.

4. **Run database migrations**

```bash
# Install dependencies first
pip install -r requirements.txt

# Run migrations
alembic upgrade head
```

5. **Verify the setup**

Access pgAdmin at http://localhost:5050 and log in with:
- Email: admin@yougen.com
- Password: admin123

Then add a new server with:
- Name: YouGen
- Host: db (use this hostname within Docker network)
- Port: 5432
- Username: postgres
- Password: yougen123

## Database Schema

The YouGen database has the following tables:

1. **videos** - Stores video metadata
   - id (PK)
   - video_id (unique)
   - platform
   - title
   - thumbnail
   - duration
   - upload_date
   - channel
   - created_at

2. **notes** - Stores user notes for videos
   - id (PK)
   - video_id (FK)
   - content (JSONB)
   - content_text
   - content_embedding
   - timestamp
   - tags
   - created_at
   - updated_at

3. **chats** - Stores chat history
   - id (PK)
   - video_id (FK)
   - message
   - response
   - language
   - created_at

4. **downloads** - Stores download history
   - id (PK)
   - video_id (FK)
   - format
   - file_path
   - file_size
   - created_at

## Common Database Operations

### Creating a New Migration

```bash
alembic revision -m "description_of_change"
```

Edit the generated file in `alembic/versions/` to define your changes.

### Upgrading the Database

```bash
alembic upgrade head  # Apply all pending migrations
alembic upgrade +1    # Apply one migration
```

### Downgrading the Database

```bash
alembic downgrade -1  # Revert one migration
alembic downgrade base  # Revert all migrations
```

### Common SQL Queries

#### Get all videos
```sql
SELECT * FROM videos;
```

#### Get notes for a specific video
```sql
SELECT * FROM notes WHERE video_id = 'some_video_id';
```

#### Get download history
```sql
SELECT d.*, v.title, v.thumbnail 
FROM downloads d
JOIN videos v ON d.video_id = v.video_id
ORDER BY d.created_at DESC;
```

#### Get recent note history
```sql
SELECT n.id, n.content_text, n.created_at, n.updated_at, v.video_id, v.title
FROM notes n
JOIN videos v ON n.video_id = v.video_id
ORDER BY n.updated_at DESC
LIMIT 10;
```

## Troubleshooting

### Connection Issues

If you can't connect to the database, check:
1. Docker containers are running: `docker-compose ps`
2. Database credentials are correct
3. Network configuration allows connections

### Migration Problems

If migrations fail:
1. Check the error message: `alembic upgrade head --sql`
2. Ensure the database is reachable
3. Fix any conflicts in migration files

### Database Reset

If you need to start fresh:
1. Stop containers: `docker-compose down`
2. Delete volumes: `docker-compose down -v`
3. Start again: `docker-compose up -d`
4. Run migrations: `alembic upgrade head`

## Accessing Database Shell

```bash
# Direct access
docker-compose exec db psql -U postgres -d yougen

# From host machine (if PostgreSQL client is installed)
psql -h localhost -U postgres -d yougen
```

## Backup and Restore

### Creating a Backup

```bash
docker-compose exec db pg_dump -U postgres yougen > yougen_backup.sql
```

### Restoring from Backup

```bash
cat yougen_backup.sql | docker-compose exec -T db psql -U postgres -d yougen
```
