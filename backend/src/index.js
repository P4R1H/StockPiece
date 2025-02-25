import "dotenv/config";
import app from "./app.js";
import connectDB from "./db/index.db.js";
import initializeAdmin from "./services/initializeAdmin.services.js";
import releaseChapter from "./services/releaseChapter.services.js";
import cron from "node-cron";
import { closeMarket } from "./controllers/market.controllers.js";

const PORT = process.env.PORT || 8000;

let server;

const startServer = async () => {
  try {
    await connectDB();
    await initializeAdmin();
    
    server = app.listen(PORT, () => {
      console.log(`Server ${process.pid} listening on port: ${PORT}`);
    });

    // Graceful shutdown handlers
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    
    app.on("error", (error) => {
      console.error('Server error:', error);
      gracefulShutdown();
    });
    
    // Schedule cron jobs in only one worker to avoid duplicates
    // if (process.env.NODE_APP_INSTANCE === '0') {
    //   cron.schedule("0 0 * * 1", releaseChapter.bind(null, null, null));
    //   cron.schedule("0 0 * * 4", closeMarket.bind(null, null, null));
    // }
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

const gracefulShutdown = async () => {
  console.log('Received kill signal, shutting down gracefully');
  
  if (server) {
    server.close(() => {
      console.log('Closed out remaining connections');
      process.exit(0);
    });

    // Force close after 10s
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  }
};

startServer();