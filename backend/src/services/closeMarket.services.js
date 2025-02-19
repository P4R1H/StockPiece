import User from "../models/user.models.js";
import CharacterStock from "../models/characterStock.models.js";
import { k, epsilon, decayFactor } from "../constants.js";
import mongoose from "mongoose";
import ChapterRelease from "../models/chapterRelease.models.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import ApiError from "../utils/ApiError.utils.js";

const closeMarketService = async (manual) => {
  try {
    const latestChapterDoc = await ChapterRelease.findOne().sort({
      releaseDate: -1,
    });
    const latestChapter = latestChapterDoc?.chapter;

    if (latestChapterDoc.isWindowClosed) {
      console.log("market is already closed");
      if (manual) {
        throw new ApiError(400,'market is already closed');
      } else {
        console.log("market already closed");
        return;
      }
    }
  
    latestChapterDoc.isWindowClosed = true;
    latestChapterDoc.save({validateModifiedOnly: true});
  
    const usersStocks = await User.aggregate([
      { $unwind: "$ownedStocks" },
      {
        $group: {
          _id: "$ownedStocks.stock",
          totalQuantity: { $sum: "$ownedStocks.quantity" },
        },
      },
    ]);
  
    // Convert aggregation results into a map for easy lookup.
    const stockMap = new Map();
    usersStocks.forEach((stock) => {
      stockMap.set(stock._id.toString(), stock.totalQuantity);
    });
  
    const allStocks = await CharacterStock.find();
  
    const bulkOps = allStocks.map((stock) => {
      //default to 0 if there are no holdings.
      const totalQuantity = stockMap.get(stock._id.toString()) || 0;
      let newValue;
      let newBaseQuantity;
  
      if (totalQuantity === 0) {
        // If no one holds the stock, apply a gentle decay instead of a sudden drop.
        newValue = stock.currentValue * decayFactor;
        newBaseQuantity = stock.baseQuantity;
      } else if (totalQuantity === stock.baseQuantity) {
        newValue = stock.currentValue;
        newBaseQuantity = stock.baseQuantity;
      } else {
        const deltaH = totalQuantity - stock.baseQuantity;
  
        // const Heff = Math.max((stock.baseQuantity + totalQuantity) / 2, epsilon);
  
        const changeFactor =
          k * Math.log(Math.abs(deltaH) + 1) * Math.sign(deltaH);
        newValue = stock.currentValue * changeFactor;
        //prevent from sudden crash
        const minPrice = decayFactor * stock.currentValue;
        newValue = Math.max(newValue, minPrice);
  
        newBaseQuantity = totalQuantity;
      }
  
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
    // Update all stocks in a transaction.
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      await CharacterStock.bulkWrite(bulkOps, { session });
      await session.commitTransaction();
      console.log("Stocks updated successfully");
    } catch (error) {
      await session.abortTransaction();
      if (manual) {
        throw error;
      }
      console.error("Rolling back stock update transaction due to error:", error);
    } finally {
      session.endSession();
    }

    if (manual) {
      return new ApiResponse(200,"market closed successfully");
    }
  } catch (error) {
    if (manual) {
      throw error;
    }
    console.log(`some error occurred: ${error}`);
  }

};

export default closeMarketService;
