import express from 'express'
import { getLatestChapter } from '../controllers/market.controllers.js';

const marketRoute = express.Router();

marketRoute
  .route('/latest-chapter')
  .get(getLatestChapter)

export default marketRoute