import {
  stockTotalQuantityBuyAndSells,
} from "./stockStats.utils.js";
import CharacterStock from "../models/characterStock.models.js";

//this will return
// priceUpdateMap.set(name, {
//   totalQuantity,
//   newValue,
// });
const priceChangeByAlgorithm = async (chapter) => {
  const stockMap = await stockTotalQuantityBuyAndSells(chapter);

  const allStocks = await CharacterStock.find();
  //we need to return a map with stock as the key and its new Value and newQuantity as the value
  const priceUpdateMap = new Map();
  allStocks.forEach((stock) => {
    const stockID = stock._id.toString();
    const name = stock.name;
    const buys = stockMap.get(stockID).totalBuys || 0;
    const sells = stockMap.get(stockID).totalSells || 0;
    const prev_ciculation = stock.baseQuantity;
    const currentValue = stock.currentValue;
    const totalQuantity = stockMap.get(stockID).totalQuantity || 0;
    const newValue = calculatePriceUpdate(
      currentValue,
      prev_ciculation,
      buys,
      sells
    );

    priceUpdateMap.set(name, {
      totalQuantity,
      newValue,
    });
  });

  return priceUpdateMap;
};

function calculatePriceUpdate(
  currentPrice,
  prevCirculation,
  boughtThisChap,
  soldThisChap
) {
  // Calculate total trading volume
  const totalVolume = boughtThisChap + soldThisChap;
  if (totalVolume === 0) {
    return currentPrice;
  }

  // Prevent division by zero in volume impact calculation
  const effectiveCirculation = Math.max(prevCirculation, 1);

  // Calculate net pressure (-1 to +1)
  const buyPressure = (boughtThisChap - soldThisChap) / totalVolume;

  // Volume ratio (trading volume relative to circulation)
  const volumeRatio = totalVolume / effectiveCirculation;
  const volumeImpact = Math.log(1 + volumeRatio) * 2;

  let percentChange;

  // Separate logic for price rises and falls
  if (buyPressure >= 0) {
    // Dampening factor for expensive stocks
    const priceDampener = 1 / (1 + Math.log(1 + currentPrice / 100));
    // Increase max rise allowed if volumeRatio > 1
    const extraRiseFactor = volumeRatio > 1 ? volumeRatio : 1;
    const maxRisePercent =
      (300 / (1 + Math.log(1 + currentPrice / 50))) * extraRiseFactor;

    const rawPercentChange = buyPressure * volumeImpact * priceDampener * 100;
    percentChange = Math.min(rawPercentChange, maxRisePercent);
  } else {
    // For declines, amplify drop if selling dominates
    const sellRatio = soldThisChap / totalVolume;
    const dropMultiplier = 1 + Math.max(0, sellRatio - 0.5); // extra penalty if >50% of trades are sells

    const priceDampener = 1 / (1 + Math.log(1 + currentPrice / 100));
    const rawPercentChange =
      buyPressure * volumeImpact * priceDampener * 100 * dropMultiplier;
    // Allow a larger drop than rise cap (e.g. 20% more)
    const maxDropPercent = (300 / (1 + Math.log(1 + currentPrice / 50))) * 1.2;
    percentChange = Math.max(rawPercentChange, -maxDropPercent);
  }

  const newPrice = currentPrice * (1 + percentChange / 100);
  return Math.max(newPrice, 10); // Ensure price never falls below 10
}

export default priceChangeByAlgorithm;
