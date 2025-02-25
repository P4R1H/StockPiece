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
  // This cron job runs every 3 minutes.
  // It chains three tasks with 1 minute delay between them.
  cron.schedule("* * * * *", async () => {
    console.log("hello");
  })
  cron.schedule("*/3 * * * *", async () => {
    try {
      console.log("Cron cycle started: release chapter, then close market, then update price");

      // Start release chapter immediately
      console.log("Starting release chapter service...");
      await releaseChapterService();
      console.log("Chapter released. Waiting 1 minute before closing market...");

      // Wait 1 minute, then run close market service
      setTimeout(async () => {
        console.log("Starting close market service...");
        await closeMarketService();
        console.log("Market closed. Waiting 1 minute before updating price...");

        // Wait another 1 minute, then run update price service
        setTimeout(async () => {
          console.log("Starting update price service...");
          await updatePriceService();
          console.log("Price updated. Cycle complete.");
        }, 60000); // Delay for update price: 1 minute (60,000 ms)
      }, 60000); // Delay for close market: 1 minute (60,000 ms)
    } catch (error) {
      console.error("Error during scheduled tasks:", error);
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
