import express from 'express';
import dotenv from 'dotenv';
import connectdb from './config/db.js';


dotenv.config();

await connectdb();

const app = express();

// Importing router
import userRoutes from './routes/user.js'

// using routes
app.use("/api/v1", userRoutes)



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});