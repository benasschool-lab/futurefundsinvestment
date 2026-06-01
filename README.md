# Future Funds Investment Platform

Professional full-stack investment platform prototype with PayPal and mobile money deposit/withdraw flow scaffolding.

## Structure

- `backend/` — Node.js + Express + TypeScript API
- `frontend/` — React + Vite + TypeScript SPA

## Setup

1. Install dependencies for backend and frontend:
   - `cd backend && npm install`
   - `cd ../frontend && npm install`
2. Start backend and frontend separately:
   - `cd backend && npm run dev`
   - `cd frontend && npm run dev`

## Features

- User registration and login
- Dashboard with balance, deposits, and withdrawals
- Tabbed dashboard for Deposit, Withdraw, and Account details
- Recent activity feed and professional fintech styling
- PayPal and mobile money (MTN, AT, Telecel) payment flow scaffolding
- Clean React UI with modern dark theme and background styling
- Typed backend API with Express, SQLite, and JWT authentication

## Running the project

1. Install dependencies:
   - `cd backend && npm install`
   - `cd ../frontend && npm install`
2. Copy the backend example env file and configure it:
   - `cd backend && copy .env.example .env`
3. Start the backend server:
   - `cd backend && npm run dev`
4. Start the frontend app:
   - `cd frontend && npm run dev`
5. Open the URL shown by Vite (usually `http://localhost:5173`).

## API overview

- `POST /api/auth/register` — register a new user
- `POST /api/auth/login` — login and receive a JWT token
- `GET /api/transactions/balance` — get current user balance
- `POST /api/transactions/deposit` — create a deposit transaction
- `POST /api/transactions/withdraw` — create a withdrawal transaction
- `POST /api/payments/paypal` — PayPal payment stub response
- `POST /api/payments/mobile-money` — mobile money payment stub response

## Notes

- The platform is a fully working development scaffold, not a production-ready payment gateway.
- The payment routes are stubbed and demonstrate where PayPal / mobile money integration is handled.
- For real deployments, connect to actual payment providers and secure credentials.
