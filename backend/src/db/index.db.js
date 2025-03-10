import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Use the connection string directly
    const connectionString = process.env.MONGO_URI;
    
    // Add authSource=admin if it's not already in the connection string
    const finalConnectionString = connectionString.includes('authSource=') 
      ? connectionString 
      : `${connectionString}&authSource=admin`;
    
    console.log("Connecting to:", finalConnectionString);
    
    const connectionInstance = await mongoose.connect(finalConnectionString);
    console.log(
      `MONGODB connected host`
    );
  } catch (error) {
    console.log(`MONGODB connection failed:`, error);
    process.exit(1);
  }
};

export default connectDB;