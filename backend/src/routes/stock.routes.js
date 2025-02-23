import express from "express";
import {
  buyStock,
  getAllStocks,
  sellStock,
  changeStockValue,
} from "../controllers/stock.controllers.js";
import { verifyAdminJWT, verifyJWT } from "../middlewares/auth.middlewares.js";

const stockRoute = express.Router();

stockRoute.route("/stocks").get(verifyAdminJWT, getAllStocks);

//safe routes
stockRoute.route("/value").patch(verifyAdminJWT, changeStockValue); //done

stockRoute.use(verifyJWT);

stockRoute.route("/transactions/buy").post(buyStock);
stockRoute.route("/transactions/sell").post(sellStock);

export default stockRoute;
