import ApiResponse from "../utils/ApiResponse.utils";
import asyncHandler from "../utils/asyncHandler.utils.js";

const getLatestChapter = asyncHandler( async(req, res, _) => {
  const latestChapter = await ChapterRelease.findOne().sort({releaseDate: -1});
  res
  .status(200)
  .json(
    new ApiResponse(200,latestChapter,"latest chapter fetched successfully")
  )
})

export {
  getLatestChapter
}