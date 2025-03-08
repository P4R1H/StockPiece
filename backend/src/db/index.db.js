import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import { URL } from "node:url";

const connectDB = async () => {
  try {
    const url = new URL(`mongodb://root:nh5OQCgnrkX9AJ7kf8X8msbK5N2057mC7669QRv9iuh9Wi5JiHChbItNAXIarUqq@138.199.226.113:5432,138.199.226.113:5433,138.199.226.113:5434/?replicaSet=rs0/${DB_NAME}`);
    console.log(url.toString());
    const connectionInstance = await mongoose.connect(`mongodb://root:nh5OQCgnrkX9AJ7kf8X8msbK5N2057mC7669QRv9iuh9Wi5JiHChbItNAXIarUqq@138.199.226.113:5432,138.199.226.113:5433,138.199.226.113:5434/?replicaSet=rs0/${DB_NAME}`);
    console.log(
      `MONGODB connected host:${connectionInstance.connection.host} `
    );
  } catch (error) {
    console.log(`MONGODB connection failed: ${error}`);
    process.exit(1);
  }
};

export default connectDB;
