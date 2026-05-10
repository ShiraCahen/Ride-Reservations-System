# Ride Reservations System

A Small full-stack ride reservations system with two main pages: 
1. Reservations list page: Where users can view all existing reservations.
2. Create reservation page: Where users can create a new reservation.

- `frontend`: Vue client app (Vue 3 + TypeScript)
- `backend`: Express REST API (Node.js + TypeScript)
- `database`: MySQL (persistent storage)

## Project Structure

- `frontend/` - Vue client app
- `backend/` - Express REST API
- MySQL database/table: `backend/sql/schema.sql` setup script for persistent storage.

## 1) Setup MySQL

Create database and table:
copy/paste and run the SQL from `backend/sql/schema.sql` in your MySQL client.

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
- `DELETE /api/reservations` - delete reservation
- `PUT /api/reservations` - update a reservation
- `GET /api/health` - health check

## Reservation Fields

- Rider first name (mandatory)
- Rider last name (mandatory)
- Pickup location (mandatory)
- Dropoff location (mandatory, musy be different from Pickup)
- Pickup time (mandatory, must be future datetime)
- Passenger count (mandatory, 1 to 6)
- Phone number (mandatory, basic phone format validation)
- Special Requirements
