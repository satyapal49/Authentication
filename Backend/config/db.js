import mongoose from "mongoose";

// connectdb: Establishes a connection to MongoDB using Mongoose.
// This function is called at app startup to ensure the database is ready
// before the server starts handling requests.
const connectdb =  async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            // dbName sets the database name to use in MongoDB
            dbName: "authenticaton",
        });
        console.log(`DB Connected`)
    } catch (error) {
        // Log and surface the error if the database connection fails
        console.log(`failed to connect ${error}`)
    }
}

export default connectdb;