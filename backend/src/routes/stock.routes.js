import express from 'express'
import { buyStock, checkOpenMarket, sellStock } from '../controllers/stock.controllers.js';

const stockRoute = express.Router();

stockRoute
  .route('/buy')
  .post(buyStock)

stockRoute
  .route('/sell')
  .post(sellStock)

stockRoute
  .route('/check-open-market')
  .post(checkOpenMarket)

export default stockRoute;