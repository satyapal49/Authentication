import express from 'express';
import dotenv from 'dotenv';
import connectdb from './config/db.js';
import { createClient } from 'redis';


dotenv.config();

await connectdb();

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.log('Redis URL Missing');
  process.exit(1);
}

export const redisClient = createClient({
  url: redisUrl,
});

redisClient.connect().then(() => console.log('connected redis')).catch(console.error);


const app = express();

// Importing router
import userRoutes from './routes/user.js'

// middleware
app.use(express.json());

// using routes
app.use("/api/v1", userRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});