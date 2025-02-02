import "dotenv/config";
import app from "./app.js";
import connectDB from "./db/index.db.js";
import initializeAdmin from "./services/initializeAdmin.services.js";
import releaseChapter from "./services/releaseChapter.services.js";
import cron from "node-cron";
import closeMarket from "./services/closeMarket.services.js";

const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    initializeAdmin();
    cron.schedule("0 0 * * 1", releaseChapter.bind(null,null,null));
    cron.schedule("0 0 * * 4", closeMarket.bind(null,null,null));
    // releaseChapter();
  })
  .then(() => {
    app.on("error", (err) => {
      throw err;
    });
    app.listen(PORT, () => {
      console.log(`server started port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`server start error: ${err}`);
    process.exit(1);
  });
