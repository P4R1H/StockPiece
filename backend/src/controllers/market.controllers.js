import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import ChapterRelease from "../models/chapterRelease.models.js";
import ApiError from "../utils/ApiError.utils.js";

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
  let flag = Date.now() > latestChapter.windowEndDate.getTime() ? false : true;
  res
    .status(200)
    .json(new ApiResponse(200, flag, "window status fetched successfully"));
});

export { getLatestChapter, isWindowOpen };
