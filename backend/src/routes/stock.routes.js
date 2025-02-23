import express from "express";
import {
  buyStock,
  getAllStocks,
  sellStock,
  changeStockValue,
} from "../controllers/stock.controllers.js";
import { verifyAdminJWT, verifyJWT } from "../middlewares/auth.middlewares.js";

const stockRoute = express.Router();

stockRoute.route("/all-stocks").get(verifyAdminJWT, getAllStocks);

//safe routes
stockRoute.route("/value").patch(verifyAdminJWT, changeStockValue); //done

stockRoute.use(verifyJWT);

stockRoute.route("/buy").post(buyStock);
stockRoute.route("/sell").post(sellStock);

export default stockRoute;
