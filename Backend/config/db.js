import mongoose from "mongoose";

const connectdb =  async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: "authenticaton",
        });
        console.log(`DB Connected`)
    } catch (error) {
        console.log(`failed to connect ${error}`)
    }
}

export default connectdb;