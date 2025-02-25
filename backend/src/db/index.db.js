import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import { URL } from "node:url";

const connectDB = async () => {
  try {
    const url = new URL(`mongodb+srv://admin:BAwwLq8tcOMtqsVP@roadmap.ykhw9zp.mongodb.net/stockpiece?retryWrites=true&w=majority&appName=roadmap`);
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
