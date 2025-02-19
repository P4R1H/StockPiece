import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import ChapterRelease from "../models/chapterRelease.models.js";
import ApiError from "../utils/ApiError.utils.js";
import releaseChapterService from "../services/releaseChapter.services.js";
import closeMarketService from "../services/closeMarket.services.js";

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

const isWindowOpen = asyncHandler(async (req, res, _) => {
  const latestChapter = await ChapterRelease.findOne().sort({
    releaseDate: -1,
  });
  if (!latestChapter) {
    throw new ApiError(400, "latest chapter not released");
  }
  let flag = Date.now() > latestChapter.windowEndDate.getTime() || latestChapter.isWindowClosed ? false : true;
  res
    .status(200)
    .json(new ApiResponse(200, flag, "window status fetched successfully"));
});

const manualReleaseChapter = asyncHandler( async( req, res, _) => {
  if (!req?.admin) {
    throw new ApiError(400,"unauthorized request");
  }
  const response = await releaseChapterService(true);
  res
    .status(200)
    .json(response)
})

const manualCloseMarket = asyncHandler ( async( req, res, _) => {
  if (!req?.admin) {
    throw new ApiError(400,"unauthorized request");
  }
  const response = await closeMarketService(true);
  res
    .status(200)
    .json(response)
})

export { getLatestChapter, isWindowOpen, manualCloseMarket, manualReleaseChapter };
