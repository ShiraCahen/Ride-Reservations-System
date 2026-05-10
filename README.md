# Ride Reservations System
<<<<<<< HEAD

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
=======
A Small full-stack ride reservations system with two main pages: 
1. Reservations list page: Where users can view all existing reservations.
2. Create reservation page: Where users can create a new reservation.

## Project Structure
- frontend: Vue client app (Vue 3 + TypeScript)
- backend: Express REST API (Node.js + TypeScript)
- MySQL database/table: backend/sql/schema.sql setup script for persistent storage.

## 1) Setup MySQL
Create database and table:
copy/paste and run the SQL from backend/sql/schema.sql in your MySQL client.

## 2) Backend Setup
bash: cd backend
bash: copy .env.example .env
Update backend\.env with your MySQL credentials.
bash: npm install
bash: npm run dev
Backend runs on `http://localhost:4000`.

## 3) Frontend Setup
bash: cd frontend
bash: copy .env.example .env
bash: npm install
bash: npm run dev
Frontend runs on `http://localhost:5173`.

## API Endpoints
- GET /api/reservations: list all reservations
- POST /api/reservations: create reservation
- DELETE /api/reservations/: delete reservation
- PUT /api/reservations/: update a reservation
- GET /api/health: health check

## Reservation Fields
- Rider first name (mandatory)
- Rider last name (mandatory)
- Pickup location (mandatory)
- Dropoff location (mandatory, musy be different from Pickup)
- Pickup time (mandatory, must be future datetime)
- Passenger count (mandatory, 1 to 6)
- Phone number (mandatory, basic phone format validation)
- Special Requirements
>>>>>>> a79829e22b49f9c00bdc5dd7b4468323da104052
