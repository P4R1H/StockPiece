import express from "express";
import {
  getLatestChapter,
  getStockUpdateStatistics,
  getMarketStatus,
  closeMarket,
  priceUpdateManual,
  releaseChapter,
  openMarket,
  postUpdatePrice,
  getAllStockStatistics,
  toggleNextChapterRelease,
  getNextChapterReleaseStatus,
  getAllChapters,
} from "../controllers/market.controllers.js";
import { verifyAdminJWT } from "../middlewares/auth.middlewares.js";

const marketRouter = express.Router();

marketRouter.route("/chapters/latest").get(getLatestChapter);
marketRouter.route("/status").get(getMarketStatus);

//protected routes
marketRouter.use(verifyAdminJWT);
marketRouter.route("/chapters/release").post(releaseChapter);
marketRouter.route("/close").patch(closeMarket);
marketRouter.route("/open").patch(openMarket);
// marketRouter
//   .route("/price-updates/algorithm")
//   .get(getPriceUpdatesByAlgorithm) //done
//   .post(priceUpdateByAlgorithm); //done
marketRouter.route("/update-price").post(postUpdatePrice);
marketRouter.route("/price-updates/manual").post(priceUpdateManual); //done
//this is the one used to fetch chapter wise updates
marketRouter.route("/statistics").get(getStockUpdateStatistics); //done
marketRouter.route("/statistics/all").get(getAllStockStatistics);
marketRouter
  .route("/chapters/next-release")
  .get(getNextChapterReleaseStatus)
  .patch(toggleNextChapterRelease);
marketRouter.route("/chapters").get(getAllChapters);
//done

export default marketRouter;
