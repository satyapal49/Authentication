# Authentication Project

A full-stack authentication application with secure user registration, email verification, OTP-based login, and JWT session management. The backend handles validation, rate limiting, and token refresh; the frontend is a React + Vite app with pages scaffolded for each auth flow.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [Authentication Flows](#authentication-flows)
- [API Endpoints](#api-endpoints)
- [Project Architecture](#project-architecture)
- [Security Features](#security-features)

## ✨ Features

### Backend
- **User Registration** — Validates input, hashes passwords, and sends a verification email
- **Email Verification** — Temporary registration data stored in Redis; account created after link click
- **OTP Login** — Two-step login: credentials check, then email OTP verification
- **JWT Sessions** — Access and refresh tokens issued as httpOnly cookies
- **Token Refresh** — Refresh endpoint rotates short-lived access tokens
- **Protected Routes** — Auth middleware with Redis user caching
- **Rate Limiting** — Redis-backed limits on register and login attempts
- **Data Validation** — Zod schema validation on all inputs
- **MongoDB Integration** — Persistent user storage via Mongoose
- **Email Delivery** — Nodemailer with Gmail SMTP for verification and OTP emails

### Frontend
- **React + Vite** — Fast dev server with HMR
- **Tailwind CSS v4** — Utility-first styling
- **Page Scaffolding** — Routes prepared for Home, Register, Login, Verify, VerifyOtp, and Dashboard (UI in progress)

## Tech Stack

### Backend
| Package | Purpose |
|---------|---------|
| Node.js | JavaScript runtime |
| Express.js (v5) | Web framework |
| MongoDB + Mongoose | Database and ODM |
| Redis | OTP storage, rate limits, temp registration data, refresh tokens, user cache |
| JWT | Access and refresh token signing |
| Bcrypt | Password hashing |
| Zod | Request validation |
| Nodemailer | Transactional email (Gmail SMTP) |
| Cookie Parser | httpOnly cookie handling |
| mongo-sanitize | NoSQL injection prevention |

### Frontend
| Package | Purpose |
|---------|---------|
| React 19 | UI library |
| Vite 8 | Build tool and dev server |
| React Router DOM | Client-side routing (to be wired) |
| Axios | HTTP client (to be wired) |
| Tailwind CSS v4 | Styling |
| React Toastify | Toast notifications (to be wired) |

## Project Structure

```
AUTHENTICATION/
├── Backend/
│   ├── index.js                    # App entry point, Redis + Express setup
│   ├── package.json
│   ├── .env                        # Environment variables (not committed)
│   ├── config/
│   │   ├── db.js                   # MongoDB connection
│   │   ├── zod.js                  # Validation schemas
│   │   ├── generateToken.js        # JWT access/refresh token helpers
│   │   ├── sendMail.js             # Nodemailer SMTP transport
│   │   └── html.js                 # Email HTML templates
│   ├── controllers/
│   │   └── user.js                 # Register, verify, login, OTP, profile, logout
│   ├── middlewares/
│   │   ├── tryCatch.js             # Async error wrapper
│   │   └── isAuth.js               # JWT auth + Redis user cache
│   ├── models/
│   │   └── User.js                 # User schema
│   └── routes/
│       └── user.js                 # Auth route definitions
└── Frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── App.jsx
        ├── main.jsx
        └── pages/
            ├── Home.jsx
            ├── Register.jsx
            ├── Login.jsx
            ├── Verify.jsx          # Email verification callback
            ├── VerifyOtp.jsx       # OTP entry after login
            └── Dashboard.jsx       # Protected page
```

## Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB (local instance or Atlas)
- Redis (local instance or hosted — required for the app to start)
- Gmail account with an App Password (for SMTP email delivery)
- npm

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AUTHENTICATION
   ```

2. **Install backend dependencies**
   ```bash
   cd Backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../Frontend
   npm install
   ```

## Environment Setup

Create a `.env` file in the `Backend` directory:

```env
# Database
MONGO_URI=mongodb://localhost:27017/authentication
# OR MongoDB Atlas:
# MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/authentication

# Redis (required — app exits if missing)
REDIS_URL=redis://localhost:6379

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_access_token_secret
REFRESH_SECRET=your_refresh_token_secret

# Email (Gmail SMTP)
SMTP_USER=your@gmail.com
SMTP_PASSWORD=your_gmail_app_password

# App branding & frontend URL (used in verification emails)
APP_NAME=Authentication App
FRONTEND_URL=http://localhost:5173
```

## Running the Application

Start MongoDB and Redis before launching the backend.

**Backend (development)**
```bash
cd Backend
npm run dev
```
Server runs on `http://localhost:5000` by default.

**Frontend (development)**
```bash
cd Frontend
npm run dev
```
Vite dev server runs on `http://localhost:5173` by default.

**Production**
```bash
# Backend
cd Backend && npm start

# Frontend
cd Frontend && npm run build && npm run preview
```

## Authentication Flows

### Registration
1. Client sends `POST /api/v1/register` with name, email, and password.
2. Server validates input, rate-limits the request, and stores hashed credentials in Redis (5-minute TTL).
3. A verification email is sent with a link to `{FRONTEND_URL}/token/{token}`.
4. Client calls `POST /api/v1/verify/:token` to create the user in MongoDB.

### Login
1. Client sends `POST /api/v1/login` with email and password.
2. Server validates credentials and emails a 6-digit OTP (5-minute TTL in Redis).
3. Client sends `POST /api/v1/verify-otp` with email and OTP.
4. Server sets `accessToken` (1 min) and `refreshToken` (7 days) as httpOnly cookies.

### Session Management
- `GET /api/v1/me` — Returns the authenticated user's profile (requires access token cookie).
- `POST /api/v1/refresh` — Issues a new access token using the refresh token cookie.
- `POST /api/v1/logout` — Revokes refresh token and clears cookies.

## API Endpoints

Base URL: `http://localhost:5000/api/v1`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | No | Register; sends verification email |
| POST | `/verify/:token` | No | Complete registration via email token |
| POST | `/login` | No | Validate credentials; send OTP email |
| POST | `/verify-otp` | No | Verify OTP; set auth cookies |
| GET | `/me` | Yes | Get current user profile |
| POST | `/refresh` | Cookie | Refresh access token |
| POST | `/logout` | Yes | Log out and clear session |

### Example: Register
```bash
curl -X POST http://localhost:5000/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"securePass123"}'
```

**Response (200)**
```json
{
  "message": "if your email is valid, a verification link has been sent. it will expire in 5 mins"
}
```

### Example: Verify Email
```bash
curl -X POST http://localhost:5000/api/v1/verify/<token>
```

**Response (201)**
```json
{
  "message": "Email Verified Successfully! Your Account has been created",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Example: Login
```bash
curl -X POST http://localhost:5000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"securePass123"}'
```

### Example: Verify OTP
```bash
curl -X POST http://localhost:5000/api/v1/verify-otp \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"john@example.com","otp":"123456"}'
```

### Example: Get Profile
```bash
curl http://localhost:5000/api/v1/me -b cookies.txt
```

## Project Architecture

```
Client Request
     │
     ▼
  Routes (user.js)
     │
     ▼
  Middleware (isAuth / tryCatch)
     │
     ▼
  Controllers (user.js)
     │
     ├──► Zod validation
     ├──► Redis (OTP, rate limits, temp data, tokens, cache)
     ├──► MongoDB via Mongoose (User model)
     └──► Nodemailer (verification & OTP emails)
     │
     ▼
  JSON Response / httpOnly Cookies
```

## Security Features

- Passwords hashed with bcrypt (10 salt rounds)
- JWT access tokens (1 min) and refresh tokens (7 days) in httpOnly cookies
- Refresh tokens stored in Redis and validated on refresh
- OTP and registration data expire after 5 minutes
- Rate limiting on register and login (60-second cooldown per IP + email)
- Zod input validation with structured error responses
- mongo-sanitize prevents NoSQL injection
- Sensitive configuration kept in environment variables

## Notes

- The project uses ES modules (`"type": "module"` in both `package.json` files).
- Redis is mandatory — the backend exits on startup if `REDIS_URL` is not set.
- Frontend pages are scaffolded; routing and API integration are still in progress.
- For cross-origin cookie auth, configure CORS and set `secure: true` on cookies in production.

## Future Enhancements

- [ ] Wire up React Router and connect frontend pages to the API
- [ ] Add password reset flow
- [ ] Enable CORS for frontend-backend communication
- [ ] Add comprehensive test suite
- [ ] Production deployment configuration (HTTPS, secure cookies)

## License

ISC

## Author

Satyapal
