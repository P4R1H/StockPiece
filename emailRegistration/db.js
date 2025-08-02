import mongoose from "mongoose";
import { DB_NAME } from "./constansts.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_DB_URI}/${DB_NAME}`
    );
    console.log(
      `MongoDB connected host: ${connectionInstance.connection.host}`
    );
  } catch(err) {
    console.log(`MongoDB connection failed`,err);
    process.exit(1);
  }
}

export default connectDB;