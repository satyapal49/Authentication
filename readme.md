# Authentication Project

A full-stack authentication app built with Node.js, Express, MongoDB, Redis, and React. It supports email-based registration verification, password login with OTP confirmation, JWT cookies, refresh tokens, and protected profile access.

## Features

### Backend

- User registration with Zod validation and bcrypt password hashing
- Email verification link before creating the user account
- Login flow with email and password followed by a 6-digit OTP
- Access token and refresh token issued as httpOnly cookies
- Refresh token storage and revocation with Redis
- Protected profile route using JWT authentication
- Redis-backed temporary data for OTPs, verification tokens, user cache, and rate limits
- Gmail SMTP email delivery with Nodemailer
- NoSQL injection protection with `mongo-sanitize`
- CORS configured for the frontend origin

### Frontend

- React 19 with Vite
- React Router routing for Home, Login, Register, and VerifyOtp
- Axios request setup used in the Login page
- Tailwind CSS v4 styling
- Login page UI and OTP navigation flow started
- Register, Verify, VerifyOtp, and Dashboard pages are currently scaffolded/in progress

## Tech Stack

### Backend

| Tool | Purpose |
| --- | --- |
| Node.js | JavaScript runtime |
| Express.js | API server |
| MongoDB + Mongoose | User database and schema modeling |
| Redis | OTPs, verification tokens, rate limits, refresh tokens, and cache |
| JWT | Access and refresh token signing |
| bcrypt | Password hashing |
| Zod | Request validation |
| Nodemailer | Email delivery |
| cookie-parser | Cookie handling |
| cors | Frontend/backend cross-origin requests |
| mongo-sanitize | NoSQL injection protection |

### Frontend

| Tool | Purpose |
| --- | --- |
| React | UI framework |
| Vite | Development server and build tool |
| React Router DOM | Client-side routing |
| Axios | HTTP requests |
| Tailwind CSS | Utility-first styling |
| React Toastify | Toast notifications dependency |

## Project Structure

```text
AUTHENTICATION/
├── Backend/
│   ├── index.js
│   ├── package.json
│   ├── config/
│   │   ├── db.js
│   │   ├── generateToken.js
│   │   ├── html.js
│   │   ├── sendMail.js
│   │   └── zod.js
│   ├── controllers/
│   │   └── user.js
│   ├── middlewares/
│   │   ├── isAuth.js
│   │   └── tryCatch.js
│   ├── models/
│   │   └── User.js
│   └── routes/
│       └── user.js
├── Frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       └── pages/
│           ├── Dashboard.jsx
│           ├── Home.jsx
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── Verify.jsx
│           └── VerifyOtp.jsx
└── readme.md
```

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB, either local or Atlas
- Redis, either local or hosted
- Gmail account with an app password for SMTP

## Installation

Clone the repository and install dependencies for both apps:

```bash
git clone <repository-url>
cd AUTHENTICATION

cd Backend
npm install

cd ../Frontend
npm install
```

## Environment Variables

Create a `.env` file inside `Backend/`.

```env
MONGO_URI=mongodb://localhost:27017/authentication
REDIS_URL=redis://localhost:6379

PORT=5000
NODE_ENV=development

JWT_SECRET=your_access_token_secret
REFRESH_SECRET=your_refresh_token_secret

SMTP_USER=your@gmail.com
SMTP_PASSWORD=your_gmail_app_password

APP_NAME=Authentication App
FRONTEND_URL=http://localhost:5173
```

Important: `Frontend/src/main.jsx` currently exports:

```js
export const server = "http://localhost:5052"
```

For local development, either run the backend with `PORT=5052` or update that frontend value to match your backend port, such as `http://localhost:5000`.

## Running the App

Start MongoDB and Redis first.

Run the backend:

```bash
cd Backend
npm run dev
```

Run the frontend in another terminal:

```bash
cd Frontend
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`, unless `PORT` is changed

## Available Scripts

### Backend

```bash
npm run dev      # Start with nodemon
npm start        # Start with node
npm test         # Placeholder test script
```

### Frontend

```bash
npm run dev      # Start Vite
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Authentication Flow

### Register and Verify Email

1. Client sends `POST /api/v1/register` with `name`, `email`, and `password`.
2. Backend validates the request and checks the register rate limit.
3. Password is hashed and temporary registration data is stored in Redis for 5 minutes.
4. Backend sends an email verification link to the user.
5. Client sends `POST /api/v1/verify/:token`.
6. Backend creates the user in MongoDB and deletes the temporary Redis entry.

### Login and Verify OTP

1. Client sends `POST /api/v1/login` with `email` and `password`.
2. Backend validates credentials and checks the login rate limit.
3. Backend sends a 6-digit OTP to the user's email.
4. OTP is stored in Redis for 5 minutes.
5. Client sends `POST /api/v1/verify-otp` with `email` and `otp`.
6. Backend sets `accessToken` and `refreshToken` cookies.

### Session Management

- `GET /api/v1/me` returns the authenticated user's profile.
- `POST /api/v1/refresh` creates a new access token from a valid refresh token cookie.
- `POST /api/v1/logout` revokes the refresh token, clears cookies, and removes cached user data.

## API Endpoints

Base URL:

```text
http://localhost:<PORT>/api/v1
```

| Method | Endpoint | Auth Required | Description |
| --- | --- | --- | --- |
| POST | `/register` | No | Register a user and send verification email |
| POST | `/verify/:token` | No | Verify email and create account |
| POST | `/login` | No | Validate credentials and send OTP |
| POST | `/verify-otp` | No | Verify OTP and set auth cookies |
| GET | `/me` | Yes | Get authenticated user profile |
| POST | `/refresh` | Refresh cookie | Refresh access token |
| POST | `/logout` | Yes | Log out and clear session |

## Example Requests

### Register

```bash
curl -X POST http://localhost:5000/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"securePass123"}'
```

### Verify Email

```bash
curl -X POST http://localhost:5000/api/v1/verify/<token>
```

### Login

```bash
curl -X POST http://localhost:5000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"securePass123"}'
```

### Verify OTP and Store Cookies

```bash
curl -X POST http://localhost:5000/api/v1/verify-otp \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"john@example.com","otp":"123456"}'
```

### Get Profile

```bash
curl http://localhost:5000/api/v1/me -b cookies.txt
```

### Refresh Token

```bash
curl -X POST http://localhost:5000/api/v1/refresh -b cookies.txt -c cookies.txt
```

### Logout

```bash
curl -X POST http://localhost:5000/api/v1/logout -b cookies.txt
```

## Security Notes

- Passwords are hashed with bcrypt using 10 salt rounds.
- Registration tokens and OTPs expire after 5 minutes.
- Access tokens expire after 1 minute.
- Refresh tokens expire after 7 days and are stored in Redis.
- Auth cookies are httpOnly.
- Rate limits are applied to register and login attempts by IP and email.
- `sameSite: "none"` is used for auth cookies. In production, use HTTPS and enable `secure: true` consistently.
- Keep `.env` files and secrets out of version control.

## Current Development Notes

- The backend depends on Redis and exits if `REDIS_URL` is missing.
- CORS uses `FRONTEND_URL`, so make sure it matches the Vite dev server URL.
- Frontend API integration is partially complete. The Login page calls the backend, while Register, Verify, VerifyOtp, and Dashboard still need full implementation.
- The verification email currently links to `/token/:token`; make sure the frontend route matches this path when implementing email verification.
- No automated tests are currently implemented.

## License

ISC

## Author

Satyapal
