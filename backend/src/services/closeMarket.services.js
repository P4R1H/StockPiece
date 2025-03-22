import CharacterStock from "../models/characterStock.models.js";
import mongoose from "mongoose";
import ChapterRelease from "../models/chapterRelease.models.js";
import ApiError from "../utils/ApiError.utils.js";
import priceChangeByAlgorithm from "../utils/priceChange.utils.js";
import ChapterUpdate from "../models/chapterUpdate.models.js";
import isWindowOpen from "../utils/windowStatus.js";
import cache from "../utils/cache.js";
import { CACHE_KEYS } from "../constants.js";
import { appearanceTax } from "./appearanceTax.services.js";

const updatePriceService = async () => {
  cache.del(CACHE_KEYS.STOCK_STATISTICS);

  const latestChapterDoc = await ChapterRelease.findOne().sort({
    releaseDate: -1,
  });

  if (!latestChapterDoc) {
    throw new ApiError(400, "no chapter has been released");
  }

  if (isWindowOpen(latestChapterDoc)) {
    throw new ApiError(400, "window is still open");
  }

  if (latestChapterDoc?.isPriceUpdated) {
    //i was thinking of throwing a error but maybe its not required
    throw new ApiError(400, "price has already been updated");
  }

  const latestChapterNumber = latestChapterDoc.chapter;

  //now here we need to fetch the update array
  const chapterUpdate = await ChapterUpdate.findOne({
    chapter: latestChapterNumber,
  });

  if (!chapterUpdate) {
    throw new ApiError(500, "error in getting chapter updates");
  }

  const chapterUpdateMap = new Map();

  chapterUpdate.updates.forEach((element) => {
    const stockID = element.stockID.toString();

    chapterUpdateMap.set(stockID, {
      newValue: element.newValue,
      totalQuantity: element.totalQuantity,
    });
  });

  const charactersThatAppearedThisChapter =
    await appearanceTax(latestChapterNumber);

  //i can do the update without it but for extra safety i am including it
  //since this is not a very frequent operation i can afford this
  const allStocks = await CharacterStock.find();

  if (!allStocks) {
    throw new ApiError(500, "some error occurred while getting all stocks");
  }

  const bulkOps = allStocks.map((stock) => {
    const stockID = stock._id.toString();
    let newValue = chapterUpdateMap.get(stockID)?.newValue || 0;
    const totalQuantity = chapterUpdateMap.get(stockID)?.totalQuantity || 0;

    // Because it's common for the strawhats to be at every chapter that's why they get less tax than other characters ... I also thought about doing a bit more complex system where I would store each character appearances and do a streak and sudden appearance tax but that would require to mess around with the DB/schema and I don't want to do that
    if (
      charactersThatAppearedThisChapter["Straw Hat Pirates"].includes(
        stock.name
      )
    ) {
      newValue += 1;
    }

    if (charactersThatAppearedThisChapter["Others"].includes(stock.name)) {
      newValue += 10;
    }

    return {
      updateOne: {
        filter: { _id: stock._id },
        update: {
          $set: {
            currentValue: newValue,
            initialValue: stock.currentValue,
            baseQuantity: totalQuantity,
          },
        },
      },
    };
  });

  const formattedResponse = allStocks.map((stock) => {
    const stockID = stock._id.toString();
    const updateInfo = chapterUpdateMap.get(stockID) || {
      newValue: 0,
      totalQuantity: 0,
    };
    return {
      stockID,
      name: stock.name,
      newValue: updateInfo.newValue,
      totalQuantity: updateInfo.totalQuantity,
    };
  });

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await CharacterStock.bulkWrite(bulkOps, { session });
    await session.commitTransaction();

    console.log("stock updated successfully");

    latestChapterDoc.isPriceUpdated = true;
    await latestChapterDoc.save({ validateModifiedOnly: true });

    return formattedResponse;
  } catch (error) {
    await session.abortTransaction();
    console.log("there was some error rolling back the transaciton");
    throw error;
  } finally {
    session.endSession();
  }
};

//on chapter update we wil make a new array
const closeMarketService = async () => {
  cache.del(CACHE_KEYS.STOCK_STATISTICS);

  const latestChapterDoc = await ChapterRelease.findOne().sort({
    releaseDate: -1,
  });
  //if the market has already been closed then that's an error
  if (latestChapterDoc?.isWindowClosed) {
    throw new ApiError(400, "market is already closed");
  }

  const latestChapter = latestChapterDoc.chapter;

  const priceUpdateMap = await priceChangeByAlgorithm(latestChapter);

  const formattedUpdates = Array.from(priceUpdateMap).map(
    ([stockID, stats]) => ({
      stockID, // The stock id key from the map
      name: stats.name, // The stock name from the map
      oldValue: stats.currentValue,
      newValue: stats.newValue,
      totalBuys: stats.totalBuys,
      totalSells: stats.totalSells,
      totalQuantity: stats.totalQuantity,
    })
  );

  const updatesArray = formattedUpdates.map(({ _name, ...stats }) => stats);

  const chapterUpdate = await ChapterUpdate.findOneAndUpdate(
    { chapter: latestChapter },
    {
      updates: updatesArray,
    },
    {
      new: true,
      upsert: true,
    }
  );

  if (!chapterUpdate) {
    throw new ApiError(
      500,
      "there was some error while performing the chapter udpate"
    );
  }

  latestChapterDoc.isWindowClosed = true;
  await latestChapterDoc.save({ validateModifiedOnly: true });

  return formattedUpdates;
};

export { updatePriceService, closeMarketService };
