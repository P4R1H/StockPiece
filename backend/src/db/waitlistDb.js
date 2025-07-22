import mongoose from "mongoose";

let waitlistConnection = null;

const connectWaitlistDB = async () => {
  try {
    if (waitlistConnection) {
      return waitlistConnection;
    }

    waitlistConnection = await mongoose.createConnection(
      process.env.WAITLIST_DB_URI
    );

    console.log(`Waitlist DB connected successfully`);
    return waitlistConnection;
  } catch (error) {
    console.error("Waitlist DB connection failed:", error);
    // Don't exit the process - let the app continue without waitlist functionality
    waitlistConnection = null;
    throw error; // Let the caller handle the error
  }
};

export default connectWaitlistDB;
