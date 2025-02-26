import express from "express";
import {
  buyStock,
  getAllStocks,
  sellStock,
  changeStockValue,
} from "../controllers/stock.controllers.js";
import { verifyAdminJWT, verifyJWT } from "../middlewares/auth.middlewares.js";

const stockRouter = express.Router();

stockRouter.route("/stocks").get(verifyAdminJWT, getAllStocks);

//safe routes
stockRouter.route("/value").patch(verifyAdminJWT, changeStockValue); //done

stockRouter.use(verifyJWT);

stockRouter.route("/transactions/buy").post(buyStock);
stockRouter.route("/transactions/sell").post(sellStock);

export default stockRouter;
