import ChapterRelease from "../models/chapterRelease.models.js";
import ApiError from "../utils/ApiError.utils.js";

const releaseChapter = async () => {
  try {
    console.log("running weekly crone job...");
    const latestChapter = await ChapterRelease.findOne().sort({
      releaseDate: -1,
    });
    if (!latestChapter) {
      throw new ApiError(400, "problem in getting latest chapter");
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

    //after releasing the chapter we also need to update users account

    console.log(`new chapter ${newChapterNumber} released`);
  } catch (error) {
    console.log(
      `there was some error while releasing chapter ${error.message}`
    );
  }
};

export default releaseChapter;
