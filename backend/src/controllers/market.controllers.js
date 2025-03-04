import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import ChapterRelease from "../models/chapterRelease.models.js";
import ApiError from "../utils/ApiError.utils.js";
import releaseChapterService from "../services/releaseChapter.services.js";
import ChapterUpdate from "../models/chapterUpdate.models.js";
import { closeMarketService } from "../services/closeMarket.services.js";
import priceChangeByAlgorithm from "../utils/priceChange.utils.js";
import CharacterStock from "../models/characterStock.models.js";
import { stockStatistics } from "../utils/stockStats.utils.js";
import isWindowOpen from "../utils/windowStatus.js";
import { updatePriceService } from "../services/closeMarket.services.js";
import cache from "../utils/cache.js";
import { CACHE_KEYS } from "../constants.js";
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

  let flag = isWindowOpen(latestChapter) ? "open" : "closed";
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

  if (
    // Date.now() > latestChapterDoc.windowEndDate.getTime() ||
    latestChapterDoc.isPriceUpdated
  ) {
    throw new ApiError(400, "the market can no longer be opened");
  }

  if (!latestChapterDoc.isWindowClosed) {
    throw new ApiError(400, "market is already opened");
  }

  latestChapterDoc.isWindowClosed = false;
  await latestChapterDoc.save({ validateModifiedOnly: true });

  res.status(200).json(new ApiResponse(200, "market opened successfully"));
});

const closeMarket = asyncHandler(async (req, res, _) => {
  if (!req?.admin) {
    throw new ApiError(400, "unauthorized request");
  }
  const closeMarketSuccess = await closeMarketService();

  if (!closeMarketSuccess) {
    throw new ApiError(500, "not able to close market");
  }

  res.status(200).json(new ApiResponse(200, "market closed successfully"));
});

const getAllStockStatistics = asyncHandler(async (req, res, _next) => {

  if (!req.admin) {
    const cachedData = cache.get(CACHE_KEYS.STOCK_STATISTICS);
    if (cachedData) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            {},
            "stock stats fetched successfully from cache"
          )
        );
    }
  }

  const latestChapterDoc = await ChapterRelease.findOne().sort({
    releaseDate: -1,
  });

  if (!latestChapterDoc) {
    throw new ApiError(400, "no chapter has been released yet");
  }

  // Define the projection based on admin status
  const updateProjection = req.admin
    ? {
        name: "$stockName",
        oldValue: "$updates.oldValue",
        newValue: "$updates.newValue",
        totalBuys: "$updates.totalBuys",
        totalSells: "$updates.totalSells",
        totalQuantity: "$updates.totalQuantity",
        _id: "$updates._id",
      }
    : {
        name: "$stockName",
        newValue: "$updates.newValue",
      };

  // Use aggregation to group updates by chapter
  const chapterUpdatesGrouped = await ChapterUpdate.aggregate([
    // Unwind the updates array to work with individual update documents
    { $unwind: "$updates" },

    // Lookup to join with the CharacterStock collection
    {
      $lookup: {
        from: "characterstocks", // collection name 
        localField: "updates.stockID",
        foreignField: "_id",
        as: "stockDetails",
      },
    },

    // Get the first item from stockDetails array
    {
      $addFields: {
        stockName: { $arrayElemAt: ["$stockDetails.name", 0] },
      },
    },

    // Replace stockID with name and restructure the update object
    {
      $project: {
        chapter: 1,
        update: updateProjection,
      },
    },

    // Group back by chapter with the modified updates
    {
      $group: {
        _id: "$chapter",
        updates: { $push: "$update" },
      },
    },

    // Format the results
    {
      $project: {
        _id: 0,
        chapter: "$_id",
        updates: 1,
      },
    },

    // Sort by chapter number
    {
      $sort: { chapter: 1 },
    },
  ]);

  // Transform array to object with chapters as keys
  const chapterUpdatesObject = {};

  chapterUpdatesGrouped.forEach((item) => {
    if (
      latestChapterDoc.chapter !== item.chapter ||
      latestChapterDoc.isPriceUpdated
    ) {
      chapterUpdatesObject[item.chapter] = item.updates;
    }
  });

  if (!req.admin) {
    cache.set(CACHE_KEYS.STOCK_STATISTICS, chapterUpdatesObject, 3600);
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "chapter update history fetched successfully"
      )
    );
});

const getStockUpdateStatistics = asyncHandler(async (req, res, _next) => {
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
  const { chapter } = req.query;

  //if the window is open and we need the latest chapter
  let response;
  if (
    (!chapter || latestChapter === chapter) &&
    isWindowOpen(latestChapterDoc)
  ) {
    const statistics = await priceChangeByAlgorithm(latestChapter);
    response = Array.from(statistics.values());
  } else {
    //we fetch from the update collection
    const chapterToFetch = chapter || latestChapter;
    const chapterUpdate = await ChapterUpdate.findOne({
      chapter: chapterToFetch
    })
      .populate({
        path: "updates.stockID",
        select: "name", // Only fetch the 'name' field
      })
      .lean();

    if (!chapterUpdate) {
      throw new ApiError(400, "wrong chapter requested");
    }

    response = chapterUpdate.updates.map(({ stockID, ...update }) => ({
      name: stockID.name, // Replace Object with just the name
      ...update,
    }));
  }

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

  if (isWindowOpen(latestChapterDoc)) {
    throw new ApiError(400, "window is still open");
  }

  if (latestChapterDoc?.isPriceUpdated) {
    throw new ApiError(400, "price has already been updated");
  }

  const latestChapter = latestChapterDoc.chapter;

  const stockMap = await stockStatistics(latestChapter);

  if (!stockMap) {
    throw new ApiError(500, "error in getting stock statistics");
  }

  const allStocks = await CharacterStock.find();

  if (!allStocks) {
    throw new ApiError(500, "error in getting all stocks");
  }

  const formattedResponse = allStocks.map((stock) => {
    const stockID = stock._id.toString();
    const name = stock.name;
    const newValue = req.body[name] || stock.currentValue;
    const oldValue = stock.currentValue;
    const totalQuantity = stockMap.get(stockID)?.totalQuantity || 0;
    const totalBuys = stockMap.get(stockID)?.totalBuys || 0;
    const totalSells = stockMap.get(stockID)?.totalSells || 0;

    return {
      stockID,
      name,
      oldValue,
      newValue,
      totalBuys,
      totalSells,
      totalQuantity,
    };
  });

  const updatesArray = formattedResponse.map(({ _name, ...stats }) => stats);
  //now for each stock we need the new price, new base Quantity
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

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        formattedResponse,
        "stock price updated successfully"
      )
    );
});

const postUpdatePrice = asyncHandler(async (req, res, _next) => {
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

const toggleNextChapterRelease = asyncHandler(async (req, res) => {
  if (!req?.admin) {
    throw new ApiError(400, "unauthorized request");
  }

  const latestChapter = await ChapterRelease.findOne().sort({
    releaseDate: -1,
  });

  if (!latestChapter) {
    throw new ApiError(400, "no chapter has been released yet");
  }

  latestChapter.canReleaseNext = !latestChapter.canReleaseNext;
  await latestChapter.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { canReleaseNext: latestChapter.canReleaseNext },
        `Next chapter release ${latestChapter.canReleaseNext ? "enabled" : "disabled"} successfully`
      )
    );
});

const getNextChapterReleaseStatus = asyncHandler(async (req, res) => {
  if (!req?.admin) {
    throw new ApiError(400, "unauthorized request");
  }

  const latestChapter = await ChapterRelease.findOne().sort({
    releaseDate: -1,
  });

  if (!latestChapter) {
    throw new ApiError(400, "no chapter has been released yet");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { canReleaseNext: latestChapter.canReleaseNext },
        "Next chapter release status fetched successfully"
      )
    );
});

const getAllChapters = asyncHandler(async (req, res) => {
  if (!req.admin) {
    throw new ApiError(401, "unauthenticated request");
  }

  const chapters = await ChapterRelease.find({}).lean();

  res
    .status(200)
    .json(new ApiResponse(200, chapters, "all chapters fetched successfully"));
});

export {
  getLatestChapter,
  getMarketStatus,
  closeMarket,
  releaseChapter,
  getNextChapterReleaseStatus,
  toggleNextChapterRelease,
  getAllChapters,
  // getPriceUpdatesByAlgorithm,
  getAllStockStatistics,
  priceUpdateManual,
  getStockUpdateStatistics,
  postUpdatePrice,
  openMarket,
};
