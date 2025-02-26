import ChapterRelease from "../models/chapterRelease.models.js";
import ApiError from "../utils/ApiError.utils.js";
import isWindowOpen from "../utils/windowStatus.js";
import User from "../models/user.models.js";
import mongoose from "mongoose";

const releaseChapterService = async () => {
  const latestChapter = await ChapterRelease.findOne().sort({
    releaseDate: -1,
  });

  if (latestChapter && isWindowOpen(latestChapter)) {
    throw new ApiError(400, "window is still open");
  }

  if (latestChapter && !latestChapter.isPriceUpdated) {
    throw new ApiError(400,'price needs to updated before chapter release');
  }

  if (latestChapter && !latestChapter.canReleaseNext) {
    throw new ApiError(400, "Next chapter release is not allowed at this time");
  }

  const newChapterNumber = latestChapter ? latestChapter.chapter + 1 : 1141;
  const releaseDate = new Date();
  const windowEndDate = new Date(releaseDate);
  windowEndDate.setDate(windowEndDate.getDate() + 3);

  // Start a session for the transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create new chapter
    const newChapter = await ChapterRelease.create(
      [
        {
          chapter: newChapterNumber,
          releaseDate,
          windowEndDate,
        },
      ],
      { session }
    );

    if (!newChapter?.[0]) {
      throw new Error("problem releasing chapter");
    }

    // Update all users' prevNetWorth with their current total value
    const users = await User.find({})
      .populate({
        path: "ownedStocks.stock",
        select: "currentValue",
      })
      .session(session);

    for (const user of users) {
      const stockValue = user.ownedStocks.reduce(
        (total, stock) => total + stock.stock.currentValue * stock.quantity,
        0
      );
      const currentNetWorth = user.accountValue + stockValue;

      await User.findByIdAndUpdate(
        user._id,
        {
          prevNetWorth: currentNetWorth,
        },
        { session }
      );
    }

    await session.commitTransaction();
    console.log(`new chapter ${newChapterNumber} released`);
    return newChapterNumber;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export default releaseChapterService;
