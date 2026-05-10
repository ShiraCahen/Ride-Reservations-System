# Ride Reservations System

A full-stack ride reservations system with:

- `frontend`: Vue 3 + TypeScript
- `backend`: Node.js + Express + TypeScript
- `database`: MySQL (persistent storage)

## Features

- Reservations list page
- Create reservation page with validations
- REST API integration
- MySQL persistence (data remains after app restart)

## Project Structure

- `frontend/` - Vue client app
- `backend/` - Express REST API
- `backend/sql/schema.sql` - MySQL database/table setup script

## 1) Setup MySQL

Create database and table:

```sql
SOURCE backend/sql/schema.sql;
```

Or copy/paste and run the SQL from `backend/sql/schema.sql` in your MySQL client.

## 2) Backend Setup

```bash
cd backend
copy .env.example .env
```

Update `.env` with your MySQL credentials.

Run backend:

```bash
npm install
npm run dev
```

Backend runs on `http://localhost:4000`.

## 3) Frontend Setup

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## API Endpoints

- `GET /api/reservations` - list all reservations
- `POST /api/reservations` - create reservation
- `GET /api/health` - health check

## Reservation Fields

- Rider name (min 2 chars)
- Pickup location (min 3 chars)
- Dropoff location (min 3 chars)
- Pickup time (must be future datetime)
- Passenger count (1 to 6)
- Phone number (basic phone format validation)

## Upload to GitHub

Initialize and push:

```bash
git init
git add .
git commit -m "Build ride reservations system with Vue, Express, and MySQL"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```
