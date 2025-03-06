import ChapterRelease from "../models/chapterRelease.models.js";
import ApiError from "../utils/ApiError.utils.js";
import isWindowOpen from "../utils/windowStatus.js";
import User from "../models/user.models.js";
import mongoose from "mongoose";

/**
 * Service to release a new chapter and update all users' prevNetWorth in bulk.
 * @returns {number} The new chapter number
 * @throws {ApiError} If conditions for chapter release are not met or transaction fails
 */
const releaseChapterService = async () => {
  // Find the latest chapter
  const latestChapter = await ChapterRelease.findOne().sort({
    releaseDate: -1,
  });

  // Check if a chapter exists and if its window is still open
  if (latestChapter && isWindowOpen(latestChapter)) {
    throw new ApiError(400, "Window is still open");
  }

  // Check if prices need to be updated
  if (latestChapter && !latestChapter.isPriceUpdated) {
    throw new ApiError(400, "Price needs to be updated before chapter release");
  }

  // Check if next chapter release is allowed
  if (latestChapter && !latestChapter.canReleaseNext) {
    throw new ApiError(400, "Next chapter release is not allowed at this time");
  }

  // Determine the new chapter number and dates
  const newChapterNumber = latestChapter ? latestChapter.chapter + 1 : 1141;
  const releaseDate = new Date();
  const windowEndDate = new Date(releaseDate);
  windowEndDate.setDate(windowEndDate.getDate() + 3);

  try {
    // Perform the chapter release and bulk update in a transaction
    const transactionResult = await mongoose.connection.transaction(
      async (session) => {
        // Create the new chapter
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
          throw new Error("Problem releasing chapter");
        }

        // Bulk update all users' prevNetWorth
        await User.updateMany(
          {}, // Empty filter to target all users
          [
            {
              $set: {
                prevNetWorth: {
                  $add: [
                    "$accountValue", // User's account value
                    {
                      $sum: {
                        $map: {
                          input: "$ownedStocks", // Array of owned stocks
                          as: "ownedStock",
                          in: {
                            $multiply: [
                              "$$ownedStock.quantity", // Stock quantity
                              "$$ownedStock.stock.currentValue", // Stock current value
                            ],
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          ],
          { session } // Include in the transaction
        );

        console.log(`New chapter ${newChapterNumber} released`);
        return newChapterNumber;
      }
    );

    return transactionResult; // Return the new chapter number
  } catch (error) {
    console.log(`Error while releasing chapter: ${error.message}`);
    throw error; // Re-throw for upstream handling
  }
};

export default releaseChapterService;