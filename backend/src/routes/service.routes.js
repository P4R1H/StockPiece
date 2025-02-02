import express from "express";
import releaseChapter from "../services/releaseChapter.services.js";
import closeMarket from "../services/closeMarket.services.js";
import { verifyAdminJWT } from "../middlewares/auth.middlewares.js";

const serviceRouter = express.Router();

serviceRouter.use(verifyAdminJWT);

serviceRouter.route("/release-chapter").post(releaseChapter);
serviceRouter.route("/close-market").post(closeMarket);

export default serviceRouter;
