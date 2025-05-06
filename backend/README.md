
# YouGen Backend

This is the backend for the YouGen Note Savant application. It provides APIs for video analysis, download management, and note-taking.

## Database Setup with Docker

The backend uses PostgreSQL as its database, and we provide a Docker Compose setup for easy development.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Quick Start

1. Clone the repository and navigate to the backend directory

```bash
cd backend
```

2. Create a `.env` file with the following content:

```
DB_USERNAME=postgres
DB_PASSWORD=yougen123
DB_HOST=db
DB_PORT=5432
DB_NAME=yougen
```

3. Start the database with Docker Compose

```bash
docker-compose up -d
```

This will start a PostgreSQL database and a pgAdmin instance for database management.

4. Run database migrations

```bash
alembic upgrade head
```

5. Start the backend API server

```bash
uvicorn src.presentation.main:app --reload
```

### Docker Compose Services

The `docker-compose.yml` file includes the following services:

- **db**: PostgreSQL database server
- **pgadmin**: Web-based PostgreSQL admin tool

You can access pgAdmin at http://localhost:5050 with:
- Email: admin@yougen.com
- Password: admin123

## Database Schema

The YouGen database includes the following tables:

- **video_metadata**: Stores information about videos
- **notes**: Stores user notes related to videos
- **download_history**: Tracks user downloads
- **batch_downloads**: Tracks batch download tasks

## Database Queries

Here are some common database queries you can run with SQL or using the pgAdmin interface:

### Get All Notes

```sql
SELECT * FROM notes;
```

### Get Download History

```sql
SELECT * FROM download_history;
```

### Get Most Recent Downloads

```sql
SELECT * FROM download_history ORDER BY download_date DESC LIMIT 10;
```

### Get Downloads by Format

```sql
SELECT * FROM download_history WHERE format = 'mp4';
```

### Get Failed Downloads

```sql
SELECT * FROM download_history WHERE status = 'failed';
```

### Get Batch Download Stats

```sql
SELECT 
  task_id, 
  COUNT(*) as total_downloads,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
FROM download_history
WHERE batch_id IS NOT NULL
GROUP BY task_id;
```

## API Documentation

Once the server is running, you can access the API documentation at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Development

### Running Migrations

We use Alembic for database migrations.

To create a new migration:

```bash
alembic revision --autogenerate -m "Your migration message"
```

To run migrations:

```bash
alembic upgrade head
```

To revert the last migration:

```bash
alembic downgrade -1
```

### Database Models

The database models are defined in SQLAlchemy in the `src/domain/models` directory. Any changes to these models should be reflected in the database through migrations.
