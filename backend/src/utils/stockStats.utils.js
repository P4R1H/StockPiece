//so we need total quantity, total buys, total sells for each stock

import ChapterRelease from "../models/chapterRelease.models.js";
import Transaction from "../models/transaction.models.js";
import ApiError from "./ApiError.utils.js";
import User from "../models/user.models.js";

//why are we using totalQuanity by fetching user stocks instead of just adding net buys
//becaue it is possilbe if the baseQuantity was not updated then we may get wrong total Q
//while calculating it using aggregation gives us the exact value

//return an array of stock and there total quantity
// _id: "$ownedStocks.stock",
// totalQuantity: { $sum: "$ownedStocks.quantity" },
const totalQuantityOfStocks = async () => {
  const usersStocks = await User.aggregate([
    { $unwind: "$ownedStocks" },
    {
      $group: {
        _id: "$ownedStocks.stock",
        totalQuantity: { $sum: "$ownedStocks.quantity" },
      },
    },
  ]);

  if (!usersStocks) {
    throw new ApiError(500, "some error occurred while fetching user stocks");
  }

  return usersStocks;
};

//return an array  with stockid, totalBuys and totalSells
const totalBuySellsForChapter = async (chapter) => {
  //first we need to check if the chapter is even there or not
  const chapterExists = await ChapterRelease.findOne({ chapter });

  if (!chapterExists) {
    throw new ApiError(400, "this chapter does not exists");
  }

  const buySellTransactions = await Transaction.aggregate([
    {
      $match: { chapterPurchasedAt: chapter },
    },
    {
      $group: {
        _id: "$stockID",
        totalBuys: {
          $sum: {
            $cond: [{ $eq: ["$type", "buy"] }, "$quantity", 0],
          },
        },
        totalSells: {
          $sum: {
            $cond: [{ $eq: ["$type", "sell"] }, "$quantity", 0],
          },
        },
      },
    },
  ]);

  if (!buySellTransactions) {
    throw new ApiError(500, "some error occurred while fetching transactions");
  }

  return buySellTransactions;
};

//return stockId with totalbuy and sell
// stockMap.set(stockID, {
//   totalQuantity: some value, // Default quantity
//   totalBuys: transaction.totalBuys|| 0,
//   totalSells: transaction.totalSells || 0,
// });
const stockStatistics = async (chapter) => {
  const usersStocks = await totalQuantityOfStocks();
  const buySellTransactions = await totalBuySellsForChapter(chapter);

  // Convert aggregation results into a map for easy lookup.
  const stockMap = new Map();

  // First, initialize the map with totalQuantity from usersStocks.
  usersStocks.forEach((stock) => {
    stockMap.set(stock._id.toString(), {
      totalQuantity: stock.totalQuantity,
      totalBuys: 0,
      totalSells: 0,
    });
  });

  // update the map with total buys and sells from buySellTransactions.
  buySellTransactions.forEach((transaction) => {
    const stockID = transaction._id.toString();

    if (stockMap.has(stockID)) {
      // If the stockID already exists update its buy/sell values
      const stockData = stockMap.get(stockID);
      stockData.totalBuys = transaction.totalBuys || 0;
      stockData.totalSells = transaction.totalSells || 0;
      stockMap.set(stockID, stockData); // Update the map
    } else {
      // If stockID wasn't in usersStocks create a new entry maybe because everyone has sold there stocks
      stockMap.set(stockID, {
        totalQuantity: 0, // Default quantity
        totalBuys: transaction.totalBuys || 0,
        totalSells: transaction.totalSells || 0,
      });
    }
  });

  return stockMap;
};

export { totalQuantityOfStocks, totalBuySellsForChapter, stockStatistics };
