import ChapterRelease from "../models/chapterRelease.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import User from "../models/user.models.js";
import mongoose from "mongoose";
import CharacterStock from "../models/characterStock.models.js";
import Transaction from "../models/transaction.models.js";
import isWindowOpen from "../utils/windowStatus.js";
import ChapterUpdate from "../models/chapterUpdate.models.js";

const validateTransactionQuantity = (quantity) => {
  const parsedQuantity = Number(quantity);

  if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
    throw new ApiError(400, "Invalid quantity. Must be a positive integer");
  }
  return parsedQuantity;
};

const buyStock = asyncHandler(async (req, res, _) => {
  //we need to check if the chapter is active or not
  //first check if the window is open
  if (!req?.user) {
    throw new ApiError(401, "Unauthenticated request");
  }

  const { name, quantity } = req.body;

  const [latestChapter, characterStock] = await Promise.all([
    ChapterRelease.findOne().sort({
      releaseDate: -1,
    }),
    CharacterStock.findOne({ name }),
  ]);

  if (!latestChapter) {
    throw new ApiError(400, "no chapter is released yet");
  }

  if (!isWindowOpen(latestChapter)) {
    throw new ApiError(400, "buying window is closed");
  }

  // Use validateTransactionQuantity instead of direct validation
  const validatedQuantity = validateTransactionQuantity(quantity);

  if (!characterStock || characterStock.isRemoved) {
    throw new ApiError(400, `${name} stock not available`);
  }

  const totalPrice = characterStock.currentValue * validatedQuantity;

  try {
    const transaction = await mongoose.connection.transaction(
      async (session) => {
        const user = await User.findById(req.user._id)
          .select("-password -refreshToken")
          .session(session);

        if (!user) {
          throw new ApiError(400, "user not found");
        }

        if (user.accountValue < totalPrice) {
          throw new ApiError(400, "insufficient funds");
        }

        if (req.user.lastLogin.getTime() != user.lastLogin.getTime()) {
          throw new ApiError(409, "User logged in another session");
        }

        const [createdTransaction] = await Transaction.create(
          [
            {
              purchasedBy: user._id,
              stockID: characterStock._id,
              quantity: validatedQuantity,
              value: characterStock.currentValue,
              type: "buy",
              chapterPurchasedAt: latestChapter.chapter,
            },
          ],
          { session }
        );

        user.accountValue -= totalPrice;
        const stockIndex = user.ownedStocks.findIndex(
          (item) => item.stock.toString() === characterStock._id.toString()
        );
        if (stockIndex >= 0) {
          user.ownedStocks[stockIndex].quantity += validatedQuantity;
        } else {
          user.ownedStocks.push({
            stock: characterStock._id,
            quantity: validatedQuantity,
          });
        }

        await user.save({ session, validateModifiedOnly: true });

        return createdTransaction;
      }
    );

    res
      .status(200)
      .json(new ApiResponse(200, transaction, "stock purchased successfully"));
  } catch (error) {
    console.log("there was some error while buying rolling back transaction");
    throw new ApiError(
      500,
      "some error occurred while making buy transaction",
      error
    );
  }
});

const sellStock = asyncHandler(async (req, res, _) => {
  //we need to check if the chapter is active or not
  //first check if the window is open
  if (!req.user) {
    throw new ApiError(401, "Unauthenticated request");
  }

  //now i need to check the price of the stock and check if there is enough balance
  const { name, quantity } = req.body;

  // Use validateTransactionQuantity instead of direct validation
  const validatedQuantity = validateTransactionQuantity(quantity);

  const [latestChapter, characterStock] = await Promise.all([
    ChapterRelease.findOne().sort({
      releaseDate: -1,
    }),
    CharacterStock.findOne({ name }),
  ]);

  if (!latestChapter) {
    throw new ApiError(400, "no chapter is released yet");
  }

  if (!isWindowOpen(latestChapter)) {
    throw new ApiError(400, "selling window is closed");
  }

  const totalPrice = characterStock.currentValue * validatedQuantity;

  try {
    const transaction = await mongoose.connection.transaction(
      async (session) => {
        const user = await User.findById(req.user._id)
          .select("-password -refreshToken")
          .session(session);

        if (!user) {
          throw new ApiError(400, "user not found");
        }

        const stockIndex = user.ownedStocks.findIndex(
          (item) => item.stock.toString() === characterStock._id.toString()
        );

        if (stockIndex < 0) {
          throw new ApiError(400, "user does not have this stock");
        }

        //check if the quantity we want to sell is even available
        if (validatedQuantity > user.ownedStocks[stockIndex].quantity) {
          throw new ApiError(400, "not enough stock to sell");
        }

        if (req.user.lastLogin.getTime() != user.lastLogin.getTime()) {
          throw new ApiError(409, "User logged in another session");
        }

        const [createdTransaction] = await Transaction.create(
          [
            {
              purchasedBy: user._id,
              stockID: characterStock._id,
              quantity: validatedQuantity,
              value: characterStock.currentValue,
              type: "sell",
              chapterPurchasedAt: latestChapter.chapter,
            },
          ],
          { session }
        );

        user.accountValue += totalPrice;
        user.ownedStocks[stockIndex].quantity -= validatedQuantity;
        //if user does not own any quantity then remove from the owned stock
        if (user.ownedStocks[stockIndex].quantity === 0) {
          user.ownedStocks.splice(stockIndex, 1);
        }

        await user.save({ session, validateModifiedOnly: true });

        return createdTransaction;
      }
    );

    res
      .status(200)
      .json(new ApiResponse(200, transaction, "Stock sold successfully"));
  } catch (error) {
    console.log("there was some error while selling rolling back transaction");
    throw new ApiError(
      500,
      "some error occurred while making sell transaction",
      error
    );
  }
});

//so i have to update this based on the popularity
//i am thinking of using aggregation pipline and sorting it based on the number of
//transaction made per chapter for that i need to attach the aggregation plugin maybe

const getAllStocks = asyncHandler(async (req, res, _) => {
  const latestChapterDoc = await ChapterRelease.findOne().sort({
    releaseDate: -1,
  });
  const latestChapter = latestChapterDoc?.chapter;

  const allStocks =
    req.admin || !latestChapter
      ? await CharacterStock.find()
      : await CharacterStock.aggregate([
          {
            $match: {
              isRemoved: false,
            },
          },
          {
            $lookup: {
              from: "transactions",
              let: {
                stockID: "$_id",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: [
                            { $toString: "$chapterPurchasedAt" }, // Ensure string comparison
                            { $toString: latestChapter }, // Ensure consistency
                          ],
                        },
                        {
                          $eq: [
                            "$stockID",
                            { $toObjectId: "$$stockID" }, // Convert for ObjectId match
                          ],
                        },
                      ],
                    },
                  },
                },
              ],
              as: "popularity",
            },
          },
          {
            $set: {
              popularityCount: {
                $size: "$popularity",
              },
            },
          },
          {
            $unset: ["popularity", "latestChapter"],
          },
        ]);

  res
    .status(200)
    .json(new ApiResponse(200, allStocks, "All stocks fetched successfully"));
});

// const _getAllStocks = asyncHandler( async (req, res, _) => {
//   const allStocks = await CharacterStock.find();
//   res
//   .status(200)
//   .json(
//     new ApiResponse(200,allStocks,"all stocks fetched successfully")
//   )
// })

const changeStockValue = asyncHandler(async (req, res, _next) => {
  if (!req?.admin) {
    throw new ApiError(400, "unauthorized request");
  }

  //I have to change the price and change the valueHistory
  const latestChapterDoc = await ChapterRelease.findOne().sort({
    releaseDate: -1,
  });

  const latestChapter = latestChapterDoc.chapter;

  if (latestChapterDoc.isPriceUpdated) {
    throw new ApiError(400, "price has been updated for this chapter");
  }

  if (isWindowOpen(latestChapterDoc)) {
    throw new ApiError(400, "window is still open");
  }

  const { name, value } = req.body;

  const stock = await CharacterStock.findOne({ name });

  if (!stock) {
    throw new ApiError(400, "stock with this name does not exists");
  }

  const updatedStockValue = await ChapterUpdate.findOneAndUpdate(
    {
      chapter: latestChapter,
      "updates.stockID": stock._id,
    },
    { $set: { "updates.$.newValue": value } },
    { new: true }
  );

  if (!updatedStockValue) {
    throw new ApiError(500, "error in updating stock value");
  }

  res
    .status(200)
    .json(new ApiResponse(200, null, "stock value changed successfully"));

  //so basically find this chapter in the array and edit the value
});

export { buyStock, sellStock, getAllStocks, changeStockValue };
