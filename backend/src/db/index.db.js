import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import { URL } from "node:url";

const connectDB = async () => {
  try {
    const url = new URL(`${process.env.MONGO_URI}/${DB_NAME}${"?retryWrites=true&w=majority&appName=roadmap"}`);
    console.log(url.toString());
    const connectionInstance = await mongoose.connect(url.toString());
    console.log(
      `MONGODB connected host:${connectionInstance.connection.host} `
    );
  } catch (error) {
    console.log(`MONGODB connection failed: ${error}`);
    process.exit(1);
  }
};

export default connectDB;
