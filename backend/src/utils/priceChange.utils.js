import { stockStatistics } from "./stockStats.utils.js";
import CharacterStock from "../models/characterStock.models.js";
import ApiError from "./ApiError.utils.js";

//this will return
// priceUpdateMap.set(name, {
//   totalQuantity,
//   newValue,
//   buys,
//   sells
// });
const priceChangeByAlgorithm = async (chapter) => {
  try {
    const [stockMap, allStocks] = await Promise.all([
      stockStatistics(chapter),
      CharacterStock.find().lean(),
    ]);

    if (!stockMap || !allStocks) {
      throw new ApiError(500, "Failed to fetch stock data");
    }

    const priceUpdateMap = new Map();

    allStocks.forEach((stock) => {
      const stockID = stock._id.toString();
      const stockStats = stockMap.get(stockID) || {
        totalBuys: 0,
        totalSells: 0,
        totalQuantity: 0,
      };

      const priceUpdate = {
        name: stock.name,
        totalQuantity: stockStats.totalQuantity,
        currentValue: stock.currentValue,
        newValue: calculatePriceUpdate(
          stock.currentValue,
          stock.baseQuantity,
          stockStats.totalBuys,
          stockStats.totalSells
        ),
        totalBuys: stockStats.totalBuys,
        totalSells: stockStats.totalSells,
      };

      priceUpdateMap.set(stockID, Math.max(10, priceUpdate/2));
    });

    return priceUpdateMap;
  } catch (error) {
    throw new ApiError(500, `Price calculation failed: ${error.message}`);
  }
};

function calculatePriceUpdate(
  currentPrice,
  prevCirculation,
  boughtThisChap,
  soldThisChap
) {
  const MIN_CIRCULATION = 100;
  const MIN_PRICE = 10;
  const BASE_VOLUME_IMPACT = 2;
  const PRICE_DAMPENER_FACTOR = 100;
  const MAX_RISE_BASE = 300;
  const SELL_PENALTY_THRESHOLD = 0.5;
  const DROP_MULTIPLIER_BASE = 1.2;

  const adjustedCirculation = Math.max(prevCirculation, MIN_CIRCULATION);
  const totalVolume = boughtThisChap + soldThisChap;

  if (totalVolume === 0) return currentPrice;

  const effectiveCirculation = Math.max(adjustedCirculation, 1);
  const buyPressure = (boughtThisChap - soldThisChap) / totalVolume;
  const volumeRatio = totalVolume / effectiveCirculation;
  const volumeImpact = Math.log(1 + volumeRatio) * BASE_VOLUME_IMPACT;
  const priceDampener =
    1 / (1 + Math.log(1 + currentPrice / PRICE_DAMPENER_FACTOR));

  let percentChange;
  if (buyPressure >= 0) {
    const extraRiseFactor = Math.max(volumeRatio, 1);
    const maxRisePercent =
      (MAX_RISE_BASE / (1 + Math.log(1 + currentPrice / 50))) * extraRiseFactor;
    const rawPercentChange = buyPressure * volumeImpact * priceDampener * 100;
    percentChange = Math.min(rawPercentChange, maxRisePercent);
  } else {
    const sellRatio = soldThisChap / totalVolume;
    const dropMultiplier = 1 + Math.max(0, sellRatio - SELL_PENALTY_THRESHOLD);
    const rawPercentChange =
      buyPressure * volumeImpact * priceDampener * 100 * dropMultiplier;
    const maxDropPercent =
      (MAX_RISE_BASE / (1 + Math.log(1 + currentPrice / 50))) *
      DROP_MULTIPLIER_BASE;
    percentChange = Math.max(rawPercentChange, -maxDropPercent);
  }

  return Math.max(currentPrice * (1 + percentChange / 100), MIN_PRICE);
}

export default priceChangeByAlgorithm;