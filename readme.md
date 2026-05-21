# Authentication Project

A full-stack authentication application with secure user registration and login functionality. This project demonstrates best practices for handling user authentication with JWT tokens, password encryption, and data validation.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Project Architecture](#project-architecture)

## ✨ Features

- **User Registration** - Create new user accounts with validation
- **Secure Password Storage** - Passwords encrypted using bcrypt
- **JWT Authentication** - Token-based authentication system
- **Data Validation** - Input validation using Zod schema validation
- **MongoDB Integration** - Persistent data storage
- **Error Handling** - Centralized error handling with try-catch middleware
- **Security** - Includes mongo-sanitize for injection prevention

## 🛠 Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework (v5.2.1)
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling (v9.6.2)
- **JWT** - JSON Web Tokens for authentication (v9.0.3)
- **Bcrypt** - Password hashing (v6.0.0)
- **Zod** - TypeScript-first schema validation (v4.4.3)
- **Nodemon** - Development server with auto-reload

### Frontend
- (To be implemented)

## 📁 Project Structure

```
AUTHENTICATION/
├── Backend/
│   ├── index.js                 # Main application entry point
│   ├── package.json             # Dependencies
│   ├── .env                     # Environment variables
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── zod.js              # Zod validation schemas
│   ├── controllers/
│   │   └── user.js             # User controller logic
│   ├── middlewares/
│   │   └── tryCatch.js         # Error handling middleware
│   ├── models/
│   │   └── User.js             # User model schema
│   └── routes/
│       └── user.js             # User routes
└── Frontend/                    # React/Vue frontend (To be implemented)
```

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas connection string)
- npm or yarn package manager

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AUTHENTICATION
   ```

2. **Install Backend Dependencies**
   ```bash
   cd Backend
   npm install
   ```

3. **Install Frontend Dependencies** (when available)
   ```bash
   cd Frontend
   npm install
   ```

## 🔧 Environment Setup

Create a `.env` file in the `Backend` directory with the following variables:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/authentication
# OR for MongoDB Atlas:
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/authentication

# Server Configuration
PORT=5000

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Node Environment
NODE_ENV=development
```

## ▶️ Running the Application

### Development Mode (with auto-reload)
```bash
cd Backend
npm run dev
```

### Production Mode
```bash
cd Backend
npm start
```

The server will start on the configured PORT (default: 5000).

## 🔌 API Endpoints

### User Registration
- **Endpoint:** `POST /api/v1/register`
- **Description:** Create a new user account
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123"
  }
  ```
- **Response:** 
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt_token_here"
  }
  ```

## 🏗️ Project Architecture

### Backend Flow
1. **Request → Routes** - Incoming requests are routed to appropriate handlers
2. **Routes → Controllers** - Controllers handle business logic
3. **Controllers → Models** - Models interact with the database via Mongoose
4. **Validation** - Zod validates all input data
5. **Error Handling** - Try-catch middleware handles errors gracefully
6. **Response** - Returns structured JSON responses

### Key Components

- **config/db.js** - Establishes MongoDB connection
- **config/zod.js** - Defines validation schemas
- **controllers/user.js** - Handles user registration and authentication logic
- **models/User.js** - Defines User schema and database structure
- **middlewares/tryCatch.js** - Wraps async operations with error handling
- **routes/user.js** - Defines API endpoints

## 🔐 Security Features

- Passwords are hashed using bcrypt with salt rounds
- JWT tokens are used for stateless authentication
- Input validation using Zod prevents invalid data
- Mongo-sanitize prevents NoSQL injection attacks
- Environment variables protect sensitive configuration

## 📝 Notes

- This project uses ES modules (type: "module" in package.json)
- Nodemon is configured for development to auto-restart on file changes
- All sensitive data should be stored in environment variables
- Ensure MongoDB is running before starting the application

## 🚧 Future Enhancements

- [ ] Implement login endpoint with JWT verification
- [ ] Add password reset functionality
- [ ] Implement refresh token mechanism
- [ ] Create user profile endpoints
- [ ] Add React/Vue frontend
- [ ] Implement email verification
- [ ] Add rate limiting
- [ ] Create comprehensive test suite

## 📄 License

ISC

## 👨‍💻 Author

Satyapal
