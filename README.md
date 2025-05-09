
# YouGen Note Savant

YouGen Note Savant is a web application for analyzing YouTube videos, creating notes, and managing downloads.

## Project Structure

This project is organized into two main directories:

- `frontend/`: Contains the React application with TypeScript, Tailwind CSS, and shadcn/ui
- `backend/`: Contains the FastAPI Python backend with PostgreSQL database

## Backend Setup

To set up the backend services:

```bash
# Navigate to the backend directory
cd backend

# Create a .env file (if not exists)
echo "DB_USERNAME=postgres
DB_PASSWORD=yougen123
DB_HOST=localhost
DB_PORT=5432
DB_NAME=yougen" > .env

# Start the database services
docker-compose up -d

# Install Python dependencies
pip install -r requirements.txt

# Initialize the database
python -m src.infrastructure.db.init_db

# Start the backend server
uvicorn src.presentation.main:app --reload
```

For more detailed information about the database setup, refer to the [Backend README](backend/README.md).

## Frontend Setup

To set up the frontend:

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Features

- YouTube video analysis
- Transcript viewing and generation
- Note-taking system
- Download management
- History tracking
- AI-powered insights

## Development

This project uses:
- Vite for frontend building
- React and TypeScript
- Tailwind CSS and shadcn/ui for styling
- FastAPI for the backend API
- PostgreSQL for the database
- Docker for database containerization

