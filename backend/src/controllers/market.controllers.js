import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import ChapterRelease from "../models/chapterRelease.models.js";
import ApiError from "../utils/ApiError.utils.js";
import releaseChapterService from "../services/releaseChapter.services.js";
import {
  closeMarketService,
  updatePriceService,
} from "../services/closeMarket.services.js";
import priceChangeByAlgorithm from "../utils/priceChange.utils.js";
import CharacterStock from "../models/characterStock.models.js";
import mongoose from "mongoose";
import {
  stockTotalQuantityBuyAndSells,
  totalQuantityOfStocks,
} from "../utils/stockStats.utils.js";

const getLatestChapter = asyncHandler(async (req, res, _) => {
  const latestChapter = await ChapterRelease.findOne().sort({
    releaseDate: -1,
  });
  if (!latestChapter) {
    throw new ApiError(400, "latest chapter not released");
  }
  res
    .status(200)
    .json(
      new ApiResponse(200, latestChapter, "latest chapter fetched successfully")
    );
});

const getMarketStatus = asyncHandler(async (req, res, _) => {
  const latestChapter = await ChapterRelease.findOne().sort({
    releaseDate: -1,
  });
  if (!latestChapter) {
    throw new ApiError(400, "latest chapter not released");
  }
  let flag =
    Date.now() > latestChapter.windowEndDate.getTime() ||
    latestChapter.isWindowClosed
      ? "closed"
      : "open";
  res
    .status(200)
    .json(new ApiResponse(200, flag, "window status fetched successfully"));
});

const releaseChapter = asyncHandler(async (req, res, _) => {
  if (!req?.admin) {
    throw new ApiError(400, "unauthorized request");
  }
  const newChapter = await releaseChapterService();
  res
    .status(200)
    .json(new ApiResponse(200, `new chapter ${newChapter} released`));
});

const openMarket = asyncHandler(async (req, res, _next) => {
  if (!req?.admin) {
    throw new ApiError(400, "unauthorized request");
  }

  const latestChapterDoc = await ChapterRelease.findOne().sort({
    releaseDate: -1,
  });

  if (!latestChapterDoc) {
    throw new ApiError(400, "no chapter has been released yet");
  }

  if (Date.now() > latestChapterDoc.windowEndDate.getTime()) {
    throw new ApiError(400, "the market can no longer be opened");
  }

  if (!latestChapterDoc.isWindowClosed) {
    throw new ApiError(400,'market is already opened');
  }

  latestChapterDoc.isWindowClosed = false;
  latestChapterDoc.save({ validateModifiedOnly: true });

  res.status(200).json(new ApiResponse(200, "market opened successfully"));
});

const closeMarket = asyncHandler(async (req, res, _) => {
  if (!req?.admin) {
    throw new ApiError(400, "unauthorized request");
  }
  await closeMarketService();
  res.status(200).json(new ApiResponse(200, "market closed successfully"));
});

const getStockStatistics = asyncHandler(async (req, res, _next) => {
  if (!req?.admin) {
    throw new ApiError(400, "unauthorized request");
  }
  const latestChapterDoc = await ChapterRelease.findOne().sort({
    releaseDate: -1,
  });

  if (!latestChapterDoc) {
    throw new ApiError(400, "no chapter has been released yet");
  }

  const latestChapter = latestChapterDoc.chapter;
  const allStocks = await CharacterStock.find();
  const stockMap = await stockTotalQuantityBuyAndSells(latestChapter);

  if (!stockMap) {
    throw new ApiError(500, "error in getting stock stats");
  }

  const stockStats = new Map();
  allStocks.forEach((stock) => {
    const name = stock.name;
    const stockId = stock._id.toString();
    const buys = stockMap.get(stockId)?.totalBuys || 0;
    const sells = stockMap.get(stockId)?.totalSells || 0;
    const totalQuantity = stockMap.get(stockId)?.totalQuantity || 0;
    stockStats.set(name, {
      buys,
      sells,
      totalQuantity,
    });
  });

  const response = Object.fromEntries(stockStats);

  res
    .status(200)
    .json(new ApiResponse(200, response, "stock stats fetched successfully"));
});

const priceUpdateManual = asyncHandler(async (req, res, _) => {
  if (!req?.admin) {
    throw new ApiError(400, "unauthroized request");
  }
  const latestChapterDoc = await ChapterRelease.findOne().sort({
    releaseDate: -1,
  });

  if (
    !latestChapterDoc.isWindowClosed &&
    Date.now() < latestChapterDoc.windowEndDate.getTime()
  ) {
    throw new ApiError(400, "window is still open");
  }

  if (latestChapterDoc?.isPriceUpdated) {
    throw new ApiError(400, "price has already been updated");
  }

  const latestChapter = latestChapterDoc.chapter;

  //we also need the map for stock and its corresponding new price
  //then we will form bulk operations for that we need stock ids
  //so we also have to fetch all stocks from database
  //why just form the bulkops togethor after fetching all stock

  const usersStocks = await totalQuantityOfStocks();

  // Convert aggregation results into a map for easy lookup.
  const stockMap = new Map();
  usersStocks.forEach((stock) => {
    stockMap.set(stock._id.toString(), stock.totalQuantity);
  });

  const allStocks = await CharacterStock.find();
  const stockUpdate = {};
  //now for each stock we need the new price, new base Quantity
  const bulkOps = allStocks.map((stock) => {
    //get the new value for this stock from admin if not given then take the default value
    const newValue = req.body[stock.name] || stock.currentValue;
    const newBaseQuantity = stockMap.get(stock._id.toString()) || 0;
    stockUpdate[stock.name] = newValue;

    return {
      updateOne: {
        filter: { _id: stock._id },
        update: {
          $set: {
            currentValue: newValue,
            baseQuantity: newBaseQuantity,
            initialValue: stock.currentValue,
          },
          $push: {
            valueHistory: {
              chapter: latestChapter,
              value: newValue,
            },
          },
        },
      },
    };
  });

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await CharacterStock.bulkWrite(bulkOps, { session });
    await session.commitTransaction();

    console.log("stock updated successfully");

    latestChapterDoc.isPriceUpdated = true;
    latestChapterDoc.save({ validateModifiedOnly: true });
  } catch (error) {
    await session.abortTransaction();
    console.log("there was some error rolling back the transaciton");
    throw error;
  } finally {
    session.endSession();
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, stockUpdate, "stock price updated successfully")
    );
});

const getPriceUpdatesByAlgorithm = asyncHandler(async (req, res, _next) => {
  if (!req?.admin) {
    throw new ApiError(400, "unauthorized request");
  }

  const latestChapterDoc = await ChapterRelease.findOne().sort({
    releaseDate: -1,
  });

  if (!latestChapterDoc) {
    throw new ApiError(400, "no chapter has been released yet");
  }

  if (
    !latestChapterDoc.isWindowClosed &&
    Date.now() < latestChapterDoc.windowEndDate.getTime()
  ) {
    throw new ApiError(400, "window is still open");
  }

  if (latestChapterDoc?.isPriceUpdated) {
    throw new ApiError(400, "price has already been updated");
  }

  const latestChapter = latestChapterDoc.chapter;

  const priceChangeMap = await priceChangeByAlgorithm(latestChapter);
  if (!priceChangeMap) {
    throw new ApiError(500, "error in getting the price change map");
  }

  const priceChange = Object.fromEntries(priceChangeMap);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        priceChange,
        "price change by algorithm fetched successfully"
      )
    );
});

const priceUpdateByAlgorithm = asyncHandler(async (req, res, _next) => {
  if (!req?.admin) {
    throw new ApiError(400, "unauthorized request");
  }

  const stockUpdate = await updatePriceService();

  if (!stockUpdate) {
    throw new ApiError(500, "some error occured while getting stock updates");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, stockUpdate, "stock price updated successfully")
    );
});

//now i need to create a route for changing the price manually
//also there will be a route to only close the market but not do anything on closing
//change price will be a different route

export {
  getLatestChapter,
  getMarketStatus,
  closeMarket,
  releaseChapter,
  getPriceUpdatesByAlgorithm,
  priceUpdateManual,
  getStockStatistics,
  priceUpdateByAlgorithm,
  openMarket,
};
