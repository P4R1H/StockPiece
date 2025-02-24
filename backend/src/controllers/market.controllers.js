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

  let flag = isWindowOpen(latestChapter) ? "open" : "close";
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

  if (Date.now() > latestChapterDoc.windowEndDate.getTime() || latestChapterDoc.isPriceUpdated) {
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
  const chapter = req.body.chapter;

  //if the window is open and we need the latest chapter
  let response;
  if ((!chapter || latestChapter === chapter) && isWindowOpen(latestChapterDoc)) {
    const statistics = await priceChangeByAlgorithm(latestChapter);
    response = Array.from(statistics.values());
  } else {
    //we fetch from the update collection
    const chapterUpdate = await ChapterUpdate.findOne({
      chapter: latestChapter,
    })
      .populate({
        path: "updates.stockID",
        select: "name", // Only fetch the 'name' field
      })
      .lean();
    if (!chapterUpdate) {
      throw new ApiError(400, "wrong chapter requested");
    }

    response = chapterUpdate.updates.map(({stockID,...update}) => ({
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

  //we also need the map for stock and its corresponding new price
  //then we will form bulk operations for that we need stock ids
  //so we also have to fetch all stocks from database
  //why just form the bulkops togethor after fetching all stock

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

// const getPriceUpdatesByAlgorithm = asyncHandler(async (req, res, _next) => {
//   if (!req?.admin) {
//     throw new ApiError(400, "unauthorized request");
//   }

//   const latestChapterDoc = await ChapterRelease.findOne().sort({
//     releaseDate: -1,
//   });

//   if (!latestChapterDoc) {
//     throw new ApiError(400, "no chapter has been released yet");
//   }

//   if (
//     isWindowOpen(latestChapterDoc)
//   ) {
//     throw new ApiError(400, "window is still open");
//   }

//   if (latestChapterDoc?.isPriceUpdated) {
//     throw new ApiError(400, "price has already been updated");
//   }

//   const latestChapter = latestChapterDoc.chapter;

//   const priceChangeMap = await priceChangeByAlgorithm(latestChapter);
//   if (!priceChangeMap) {
//     throw new ApiError(500, "error in getting the price change map");
//   }

//   const priceChange = Object.fromEntries(priceChangeMap);

//   res
//     .status(200)
//     .json(
//       new ApiResponse(
//         200,
//         priceChange,
//         "price change by algorithm fetched successfully"
//       )
//     );
// });

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

//now i need to create a route for changing the price manually
//also there will be a route to only close the market but not do anything on closing
//change price will be a different route

export {
  getLatestChapter,
  getMarketStatus,
  closeMarket,
  releaseChapter,
  // getPriceUpdatesByAlgorithm,
  priceUpdateManual,
  getStockStatistics,
  postUpdatePrice,
  openMarket,
};
