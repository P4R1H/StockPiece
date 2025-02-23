import CharacterStock from "../models/characterStock.models.js";
import mongoose from "mongoose";
import ChapterRelease from "../models/chapterRelease.models.js";
import ApiError from "../utils/ApiError.utils.js";
import priceChangeByAlgorithm from "../utils/priceChange.utils.js";

const updatePriceService = async () => {
  const latestChapterDoc = await ChapterRelease.findOne().sort({
    releaseDate: -1,
  });

  if (!latestChapterDoc) {
    throw new ApiError(400, "no chapter has been released");
  }

  if (
    !latestChapterDoc.isWindowClosed &&
    Date.now() < latestChapterDoc.windowEndDate
  ) {
    throw new ApiError(400, "window is still open");
  }

  if (latestChapterDoc?.isPriceUpdated) {
    //i was thinking of throwing a error but maybe its not required
    throw new ApiError(400,'price has already been updated');
  }

  const latestChapterNumber = latestChapterDoc.chapter;

  const priceUpdates = await priceChangeByAlgorithm(latestChapterNumber);

  if (!priceUpdates) {
    throw new ApiError(500, "some error occurred while getting priceUpdates");
  }

  const allStocks = await CharacterStock.find();

  if (!allStocks) {
    throw new ApiError(500, "some error occurred while getting all stocks");
  }

  const bulkOps = allStocks.map((stock) => {
    const { newValue, totalQuantity } = priceUpdates.get(stock.name);
    return {
      updateOne: {
        filter: { _id: stock._id },
        update: {
          $set: {
            currentValue: newValue,
            initialValue: stock.currentValue,
            baseQuantity: totalQuantity,
          },
          $push: {
            valueHistory: {
              chapter: latestChapterNumber,
              value: newValue,
            },
          },
        },
      },
    };
  });

  const response = Object.fromEntries(priceUpdates);

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await CharacterStock.bulkWrite(bulkOps, { session });
    await session.commitTransaction();

    console.log("stock updated successfully");

    latestChapterDoc.isPriceUpdated = true;
    latestChapterDoc.save({ validateModifiedOnly: true });

    return response;
  } catch (error) {
    await session.abortTransaction();
    console.log("there was some error rolling back the transaciton");
    throw error;
  } finally {
    session.endSession();
  }
};

const closeMarketService = async () => {
  const latestChapterDoc = await ChapterRelease.findOne().sort({
    releaseDate: -1,
  });
  //if the market has already been closed then that's an error
  if (latestChapterDoc?.isWindowClosed) {
    throw new ApiError(400, "market is already closed");
  }

  latestChapterDoc.isWindowClosed = true;
  latestChapterDoc.save({ validateModifiedOnly: true });
};

export { updatePriceService, closeMarketService };
