import "dotenv/config";
import app from "./app.js";
import connectDB from "./db/index.db.js";
import initializeAdmin from "./services/initializeAdmin.services.js";
import releaseChapterService from "./services/releaseChapter.services.js";
import { closeMarketService, updatePriceService } from "./services/closeMarket.services.js";
import cron from "node-cron";
import ErrorLog from "./models/errorLog.models.js";

const PORT = process.env.PORT || 8000;
let server;

const startServer = async () => {
  try {
    // Connect to the database
    await connectDB();
    // Initialize admin after DB is connected
    await initializeAdmin();
    
    // Set up cron jobs (second approach)
    setupCronJobs();

    // Start the server
    server = app.listen(PORT, () => {
      console.log(`Server ${process.pid} listening on port: ${PORT}`);
    });

    // Graceful shutdown handlers
    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);
    app.on("error", (error) => {
      console.error("Server error:", error);
      gracefulShutdown();
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

const setupCronJobs = () => {
  // Release chapter at 00:00 every Friday
  cron.schedule("0 0 * * 5", async () => {
    try {
      console.log("Starting release chapter service...");
      await releaseChapterService();
      console.log("Chapter released successfully");
    } catch (err) {
      console.error("Error during release chapter:", err);
      try {
        await ErrorLog.create({
          message: err.message,
          stack: err.stack,
          name: err.name || "UnknownError",
          statusCode: 500,
          isHighPriority: true,
          additionalInfo: {
            timestamp: new Date()
          }
        });
      } catch (logError) {
        console.error("Error logging failed:", logError);
      }
    }
  },{
    timezone: "Asia/Kolkata"
  });

  // Close market at 00:00 every Tuesday
  cron.schedule("0 0 * * 2", async () => {
    try {
      console.log("Starting close market service...");
      await closeMarketService();
      console.log("Market closed successfully");
    } catch (error) {
      console.error("Error during close market:", error);
      try {
        await ErrorLog.create({
          message: err.message,
          stack: err.stack,
          name: err.name || "UnknownError",
          statusCode: 500,
          isHighPriority: true,
          additionalInfo: {
            timestamp: new Date()
          }
        });
      } catch (logError) {
        console.error("Error logging failed:", logError);
      }
    }
  },{
    timezone: "Asia/Kolkata"
  });

  // Update price at 00:00 every Wednesday
  cron.schedule("0 0 * * 3", async () => {
    try {
      console.log("Starting update price service...");
      await updatePriceService();
      console.log("Price updated successfully");
    } catch (error) {
      console.error("Error during update price:", error);
      try {
        await ErrorLog.create({
          message: err.message,
          stack: err.stack,
          name: err.name || "UnknownError",
          statusCode: 500,
          isHighPriority: true,
          additionalInfo: {
            timestamp: new Date()
          }
        });
      } catch (logError) {
        console.error("Error logging failed:", logError);
      }
    }
  },{
    timezone: "Asia/Kolkata"
  });
};

const gracefulShutdown = async () => {
  console.log("Received kill signal, shutting down gracefully");
  if (server) {
    server.close(() => {
      console.log("Closed out remaining connections");
      process.exit(0);
    });
    // Force close after 10 seconds
    setTimeout(() => {
      console.error("Could not close connections in time, forcefully shutting down");
      process.exit(1);
    }, 10000);
  }
};

startServer();


//friday12:01
//tuesday 12:01