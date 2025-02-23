import express from "express";
import {
  getLatestChapter,
  getPriceUpdatesByAlgorithm,
  getStockStatistics,
  getMarketStatus,
  closeMarket,
  priceUpdateManual,
  priceUpdateByAlgorithm,
  releaseChapter,
  openMarket,
} from "../controllers/market.controllers.js";
import { verifyAdminJWT } from "../middlewares/auth.middlewares.js";

const marketRouter = express.Router();

marketRouter.route("/chapters/latest").get(getLatestChapter);
marketRouter.route("/status").get(getMarketStatus);

//protected routes
marketRouter.use(verifyAdminJWT);
marketRouter.route("chapters/release").post(releaseChapter);
marketRouter.route("/close").patch(closeMarket);
marketRouter.route("/open").patch(openMarket);
marketRouter
  .route("/price-updates/algorithm")
  .get(getPriceUpdatesByAlgorithm) //done
  .post(priceUpdateByAlgorithm); //done
marketRouter.route("/price-updates/manual").post(priceUpdateManual); //done
marketRouter.route("/statistics").get(getStockStatistics); //done

export default marketRouter;
