import "dotenv/config";
import app from "./app.js";
import connectDB from "./db/index.db.js";
import initializeAdmin from "./services/initializeAdmin.services.js";
import releaseChapterService from "./services/releaseChapter.services.js";
import { closeMarketService, updatePriceService } from "./services/closeMarket.services.js";
import cron from "node-cron";

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
      console.log(`Server ${process.pid} started on port: ${PORT}`);
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
  // Runs at minute 0, 3, 6, 9, 12, etc. (every 3 minutes, starting at 0)
  cron.schedule("0/3 * * * *", async () => {
    try {
      console.log("Cron job: Running release chapter service");
      await releaseChapterService();
    } catch (error) {
      console.error("Error in release chapter service:", error);
    }
  });

  // Runs at minute 1, 4, 7, 10, 13, etc. (every 3 minutes, starting at 1)
  cron.schedule("1/3 * * * *", async () => {
    try {
      console.log("Cron job: Running close market service");
      await closeMarketService();
    } catch (error) {
      console.error("Error in close market service:", error);
    }
  });

  // Runs at minute 2, 5, 8, 11, 14, etc. (every 3 minutes, starting at 2)
  cron.schedule("2/3 * * * *", async () => {
    try {
      console.log("Cron job: Running update price service");
      await updatePriceService();
    } catch (error) {
      console.error("Error in update price service:", error);
    }
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
