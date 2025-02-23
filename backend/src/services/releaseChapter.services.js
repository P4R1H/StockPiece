import ChapterRelease from "../models/chapterRelease.models.js";
import ApiError from "../utils/ApiError.utils.js";

const releaseChapterService = async () => {
  const latestChapter = await ChapterRelease.findOne().sort({
    releaseDate: -1,
  });

  if (
    latestChapter &&
    !latestChapter.isWindowClosed &&
    Date.now() < latestChapter.windowEndDate
  ) {
    throw new ApiError(400, "window is still open");
  }

  const newChapterNumber = latestChapter ? latestChapter.chapter + 1 : 1;
  //set the release to now
  const releaseDate = new Date();
  const windowEndDate = new Date(releaseDate);
  //we have a 3 day window to buy stock
  windowEndDate.setDate(windowEndDate.getDate() + 3);

  const newChapter = await ChapterRelease.create({
    chapter: newChapterNumber,
    releaseDate,
    windowEndDate,
  });

  if (!newChapter) {
    throw new Error("problem releasing chapter");
  }

  console.log(`new chapter ${newChapterNumber} released`);
  return newChapterNumber;
};

export default releaseChapterService;
