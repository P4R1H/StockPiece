import ChapterRelease from "../models/chapterRelease.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import User from "../models/user.models.js";
import mongoose from "mongoose";
import CharacterStock from "../models/characterStock.models.js";
import PurchasedStock from "../models/purchasedStock.models.js";

const buyStock = asyncHandler( async (req, res, _) => {
  //we need to check if the chapter is active or not
  //first check if the window is open
  if (!req.user) {
    throw new ApiError(400,'unauthorized request')
  }

  const latestChapter = await ChapterRelease.findOne().sort({releaseDate: -1});

  if (Date.now() > latestChapter.windowEndDate.getTime()) {
    throw new ApiError(400,'buying window is closed');
  }

  const user = await User.findById(req.user?._id).select(
    "-password -refreshToken"
  );
  //only allow single logged in user to try
  if (req.user.tokenVersion != user.tokenVersion) {
    throw new ApiError(409,'user logged in another session')
  }

  //now i need to check the price of the stock and check if there is enough balance
  const { name, quantity } = req.params;

  const characterStock = await CharacterStock.find({name});

  if (!characterStock) {
    throw new ApiError(400,`${name} stock not available`);
  }

  const totalPrice = characterStock.currentValue * quantity;

  if (user.acountValue < totalPrice) {
    throw new ApiError(400,'insufficient funds')
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  const purchasedStock = await PurchasedStock.create(
    {
      purchasedBy: user._id,
      stockID: characterStock._id,
      quantity,
      purchaseValue: totalPrice,
      chapterPurchasedAt: latestChapter.chapter
    }
  )

  user.accountValue -= totalPrice;
  const stockIndex = user.ownedStocks.findIndex(item => item.stock.toString() === characterStock._id.toString());
  if (stockToUpdate) {
    user.ownedStocks[stockIndex].quantity += quantity
  } else {
    user.ownedStocks.push(
      {
        stock: characterStock._id,
        quantity
      }
    )
  }

  await user.save({ session, validateModifiedOnly: true });
  await session.commitTransaction();
  session.endSession();

  res
  .status(200)
  .json(
    new ApiResponse(200,purchasedStock,"stock purchased successfully")
  )
})

const checkOpenMarket = asyncHandler( async (req, res, _) => {
  const latestChapter = await ChapterRelease.findOne().sort({releaseDate: -1});
  const isOpen = false
  if (Date.now() < latestChapter.windowEndDate.getTime()) {
    isOpen = true;
  }
  res
  .status(200)
  .json(
    new ApiResponse(200,isOpen,"market Status")
  )
})

export {
  checkOpenMarket,
  buyStock
}