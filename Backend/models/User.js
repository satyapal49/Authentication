import mongoose from "mongoose";

// Define the User schema for MongoDB using Mongoose.
// This describes what data each user document will contain.
const Schema =  new mongoose.Schema({
    name : {
        type: String,
        required: true,
    },
    email : {
        type: String,
        required: true,
        unique: true,
    },
    password : {
        type: String,
        required: true,
    },
    role : {
        // Simple role field, defaults to "user"; can be extended later
        type: String,
        default: "user",
    },
}, {timestamps: true});

// Export the Mongoose model so other parts of the app can query/create users.
export const  User = mongoose.model("User", Schema)