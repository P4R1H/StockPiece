import express from "express";
import { getLatestChapter, isWindowOpen } from "../controllers/market.controllers.js";

const marketRoute = express.Router();

marketRoute.route("/latest-chapter").get(getLatestChapter);
marketRoute.route("/window-status").get(isWindowOpen);

export default marketRoute;
