import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}`
    );
    console.log(
      `MONGODB connected host:${connectionInstance.connection.host} `
    );
  } catch (error) {
    console.log(`MONGODB connection failed: ${error}`);
    process.exit(1);
  }
};

export default connectDB;
