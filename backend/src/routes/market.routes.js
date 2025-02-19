import express from "express";
import {
  getLatestChapter,
  isWindowOpen,
  manualCloseMarket,
  manualReleaseChapter,
} from "../controllers/market.controllers.js";
import { verifyAdminJWT } from "../middlewares/auth.middlewares.js";

const marketRouter = express.Router();

marketRouter.route("/latest-chapter").get(getLatestChapter);
marketRouter.route("/window-status").get(isWindowOpen);

//protected routes
marketRouter.use(verifyAdminJWT);
marketRouter.route("/release-chapter").post(manualReleaseChapter);
marketRouter.route("/close-market").post(manualCloseMarket);

export default marketRouter;
