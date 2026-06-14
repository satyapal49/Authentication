import express from 'express';
import dotenv from 'dotenv';
import connectdb from './config/db.js';
import { createClient } from 'redis';
import userRoutes from './routes/user.js'
import cookieParser from 'cookie-parser';
import cors from 'cors';

// Load environment variables from a .env file into process.env
dotenv.config();

// Connect to MongoDB (defined in ./config/db.js)
// This returns a promise, so we await it at startup.
await connectdb();

// Read Redis URL from environment (used for rate limits, OTPs, and temp storage)
const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.log('Redis URL Missing');
  // Exit early if Redis is not configured because the app relies on it.
  process.exit(1);
}

// Create a Redis client instance and connect
export const redisClient = createClient({
  url: redisUrl,
});

redisClient.connect().then(() => console.log('connected redis')).catch(console.error);


// Create the Express application
const app = express();


// Built-in middleware to parse JSON request bodies
app.use(express.json());
app.use(cookieParser());
// Enable CORS for all routes (you can configure this further in production)
app.use(cors({
  origin: process.env.FRONTEND_URL, // Allow requests from this origin (your frontend)
  credentials: true, // Allow cookies to be sent with requests
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
}));

// Mount our user routes under "/api/v1"
// Example: POST /api/v1/register
app.use("/api/v1", userRoutes);


const PORT = process.env.PORT || 5000;

// Start listening for HTTP requests
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});