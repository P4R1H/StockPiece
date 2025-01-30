import express from 'express'
import { buyStock, checkOpenMarket, getAllStocks, sellStock } from '../controllers/stock.controllers.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js';

const stockRoute = express.Router();

stockRoute
  .route('/check-open-market')
  .get(checkOpenMarket)

stockRoute
  .route('/all-stocks')
  .get(getAllStocks)

//safe routes
stockRoute.use(verifyJWT)

stockRoute
  .route('/buy')
  .post(buyStock)

stockRoute
  .route('/sell')
  .post(sellStock)

export default stockRoute;