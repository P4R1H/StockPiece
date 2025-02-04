import ChapterRelease from "../models/chapterRelease.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import User from "../models/user.models.js";
import mongoose from "mongoose";
import CharacterStock from "../models/characterStock.models.js";
import Transaction from "../models/transaction.models.js";

const buyStock = asyncHandler(async (req, res, _) => {
  //we need to check if the chapter is active or not
  //first check if the window is open
  if (!req.user) {
    throw new ApiError(400, "unauthorized request");
  }

  const latestChapter = await ChapterRelease.findOne().sort({
    releaseDate: -1,
  });

  if (Date.now() > latestChapter.windowEndDate.getTime()) {
    throw new ApiError(400, "buying window is closed");
  }

  const user = await User.findById(req.user?._id).select(
    "-password -refreshToken"
  );
  //only allow single logged in user to try
  if (req.user.lastLogin.getTime() != user.lastLogin.getTime()) {
    throw new ApiError(409, "user logged in another session");
  }

  //now i need to check the price of the stock and check if there is enough balance
  const { name, quantity } = req.body;

  const characterStock = await CharacterStock.findOne({ name });

  if (!characterStock || characterStock.isRemoved) {
    throw new ApiError(400, `${name} stock not available`);
  }

  const totalPrice = characterStock.currentValue * parseInt(quantity);

  if (user.accountValue < totalPrice) {
    throw new ApiError(400, "insufficient funds");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  const transaction = await Transaction.create(
    [
      {
        purchasedBy: user._id,
        stockID: characterStock._id,
        quantity: parseInt(quantity),
        value: totalPrice,
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
    user.ownedStocks[stockIndex].quantity += parseInt(quantity);
  } else {
    user.ownedStocks.push({
      stock: characterStock._id,
      quantity,
    });
  }

  await user.save({ session, validateModifiedOnly: true });

  await session.commitTransaction();
  session.endSession();

  res
    .status(200)
    .json(new ApiResponse(200, transaction, "stock purchased successfully"));
});

const sellStock = asyncHandler(async (req, res, _) => {
  //we need to check if the chapter is active or not
  //first check if the window is open
  if (!req.user) {
    throw new ApiError(400, "unauthorized request");
  }

  const latestChapter = await ChapterRelease.findOne().sort({
    releaseDate: -1,
  });

  if (Date.now() > latestChapter.windowEndDate.getTime()) {
    throw new ApiError(400, "selling window is closed");
  }

  const user = await User.findById(req.user?._id).select(
    "-password -refreshToken"
  );
  //only allow single logged in user to try
  if (req.user.lastLogin.getTime() != user.lastLogin.getTime()) {
    throw new ApiError(409, "user logged in another session");
  }

  //now i need to check the price of the stock and check if there is enough balance
  const { name, quantity } = req.body;

  const characterStock = await CharacterStock.findOne({ name });

  if (!characterStock || characterStock.isRemoved) {
    throw new ApiError(400, `${name} stock not available`);
  }

  const stockIndex = user.ownedStocks.findIndex(
    (item) => item.stock.toString() === characterStock._id.toString()
  );

  if (stockIndex < 0) {
    throw new ApiError(400, "user does not have this stock");
  }
  //check if the quantity we want to sell is even available
  if (parseInt(quantity) > user.ownedStocks[stockIndex].quantity) {
    throw new ApiError(400, "not enough stock to sell");
  }

  const totalPrice = characterStock.currentValue * parseInt(quantity);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const transaction = await Transaction.create(
      [
        {
          purchasedBy: user._id,
          stockID: characterStock._id,
          quantity: parseInt(quantity),
          value: totalPrice,
          type: "sell",
          chapterPurchasedAt: latestChapter.chapter,
        },
      ],
      { session }
    );

    user.accountValue += totalPrice;
    user.ownedStocks[stockIndex].quantity -= parseInt(quantity);
    //if user does not own any quantity then remove from the owned stock
    if (user.ownedStocks[stockIndex].quantity === 0) {
      user.ownedStocks.splice(stockIndex, 1);
    }

    await user.save({ session, validateModifiedOnly: true });
    await session.commitTransaction();

    res
      .status(200)
      .json(new ApiResponse(200, transaction, "stock purchased successfully"));
  } catch (error) {
    session.abortTransaction();
    throw new ApiError(
      500,
      "some error occurred while making transaction",
      error
    );
  } finally {
    session.endSession();
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
  if (!latestChapter) {
    throw new ApiError(500, "not able to fetch latest chapter");
  }

  const allStocks = req.admin
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

const checkOpenMarket = asyncHandler(async (req, res, _) => {
  const latestChapter = await ChapterRelease.findOne().sort({
    releaseDate: -1,
  });
  let isOpen = false;
  if (Date.now() < latestChapter.windowEndDate.getTime()) {
    isOpen = true;
  }
  res.status(200).json(new ApiResponse(200, isOpen, "market Status"));
});

export { checkOpenMarket, buyStock, sellStock, getAllStocks };
