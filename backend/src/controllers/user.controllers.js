import { defaultAvatarUrl } from "../constants.js";
import ChapterRelease from "../models/chapterRelease.models.js";
import User from "../models/user.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.utils.js";
import jwt from "jsonwebtoken";
import isWindowOpen from "../utils/windowStatus.js";
import Coupon from "../models/coupon.models.js";
import containsProfanity from "../utils/profanity.utils.js";
import Transaction from "../models/transaction.models.js";

const verifyCoupon = async (couponCode, user) => {
  const coupon = await Coupon.findOne({
    code: couponCode.toUpperCase(),
    isActive: true,
  });

  if (!coupon) {
    throw new ApiError(404, "Invalid coupon code");
  }

  // Check if user has already used a referral code
  if (coupon.couponType === "REFERRAL" && user.hasUsedReferral) {
    throw new ApiError(400, "You have already used a referral code");
  }

  // Check if user has already used this coupon
  if (coupon.usedBy.includes(user._id)) {
    throw new ApiError(400, "Coupon already used by you");
  }

  // Check if coupon is first-time only
  if (coupon.isFirstTimeOnly) {
    const hasTransactions = await Transaction.exists({ user: user._id });
    if (hasTransactions) {
      throw new ApiError(400, "This coupon is for first-time users only");
    }
  }

  // Check if max users limit reached
  if (coupon.usedCount >= coupon.maxUsers) {
    throw new ApiError(400, "Coupon usage limit reached");
  }

  // Update coupon usage
  coupon.usedCount += 1;
  coupon.usedBy.push(user._id);
  if (coupon.usedCount >= coupon.maxUsers) {
    coupon.isActive = false;
  }
  await coupon.save();

  return coupon;
};

const generateAccessRefreshToken = async (user) => {
  try {
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    const _updatedUser = await User.findByIdAndUpdate(user._id, {
      $set: {
        refreshToken,
      },
    });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating access and refresh token",
      error.message,
      error.stack
    );
  }
};

const registerUser = asyncHandler(async (req, res, _) => {
  //we need to get the username and password
  //check if it is valid
  //then store tha password
  const { username, password } = req.body;

  if (!username?.trim() || !password?.trim()) {
    throw new ApiError(400, "username and password required");
  }

  // Check for profanity in username
  if (containsProfanity(username)) {
    throw new ApiError(400, "Username contains inappropriate content");
  }

  const existingUser = await User.findOne({ username });

  if (existingUser) {
    throw new ApiError(409, "user already exists");
  }

  const avatarLocalFilePath = req.file?.path;
  const avatarUrl = avatarLocalFilePath
    ? await uploadOnCloudinary(avatarLocalFilePath)
    : defaultAvatarUrl;

  if (!avatarUrl) {
    throw new ApiError(500, "not able to upload avatar");
  }

  const user = await User.create({
    username: username?.trim().toLowerCase(),
    password,
    avatar: avatarUrl,
    accountValue: 2500,
    prevNetWorth: 2500,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "some error occurred while creating user");
  }

  res
    .status(200)
    .json(new ApiResponse(200, createdUser, "user created successfully"));
});

const loginUser = asyncHandler(async (req, res, _) => {
  const { username, password, couponCode } = req.body;

  if (!username?.trim() || !password?.trim()) {
    throw new ApiError(400, "username and password required");
  }

  const user = await User.verifyUser(username, password);

  if (!user) {
    throw new ApiError(500, "Unexpected Error: user verification failed");
  }

  const [tokens, coupon] = await Promise.all([
    generateAccessRefreshToken(user),
    couponCode?.trim() ? verifyCoupon(couponCode, user) : Promise.resolve(0),
  ]);

  const couponAmount = coupon?.amount || 0;

  const { accessToken, refreshToken } = tokens;

  //check if the user needs to get extra 100 dollars for daily login
  const midNightTime = () => new Date(new Date().setHours(0, 0, 0, 0));
  const isDailyLoginBonus = !user.lastLogin || user.lastLogin < midNightTime();

  const updateObject = {
    $set: {
      lastLogin: Date.now(),
    },
  };

  const totalBonus = (isDailyLoginBonus ? 100 : 0) + couponAmount;
  if (totalBonus > 0) {
    updateObject.$inc = {
      accountValue: totalBonus,
    };
  }

  // If it's a referral coupon, add bonus to referrer's account
  if (coupon?.couponType === "REFERRAL" && coupon?.createdBy) {
    await User.findByIdAndUpdate(coupon.createdBy._id, {
      $inc: { balance: coupon.referrerBonus },
    });
    //set this user
    updateObject.$set = {
      hasUsedReferral: true,
    };
  }

  const loggedInUser = await User.findByIdAndUpdate(user._id, updateObject, {
    new: true,
  }).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, { options, maxAge: 86400000 })
    .cookie("refreshToken", refreshToken, { options, maxAge: 864000000 })
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
          bonusApplied: {
            dailyLogin: isDailyLoginBonus ? 100 : 0,
            coupon: couponAmount,
          },
        },
        "user logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res, _) => {
  //i just need to delete token in cookies
  //also delete the refreshToken
  if (!req.user) {
    throw new ApiError(401, "unauthenticated request");
  }
  const _user = await User.findByIdAndUpdate(req.user?._id, {
    $unset: {
      refreshToken: "",
    },
  });

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res, _) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  const user = await User.findById(decodedToken?._id);

  if (!user || user.refreshToken != incomingRefreshToken) {
    throw new ApiError(401, "Refresh token expired or invalid");
  }

  const { accessToken, refreshToken } = await generateAccessRefreshToken(user);

  const midNightTime = () => new Date(new Date().setHours(0, 0, 0, 0));
  const isDailyLoginBonus = !user.lastLogin || user.lastLogin < midNightTime();

  const updateObject = {
    $set: {
      lastLogin: Date.now(),
    },
  };

  // Add bonus if applicable
  if (isDailyLoginBonus) {
    updateObject.$inc = {
      accountValue: 100,
    };
  }

  const loggedInUser = await User.findByIdAndUpdate(user._id, updateObject, {
    new: true,
  }).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, { options, maxAge: 86400000 })
    .cookie("refreshToken", refreshToken, { options, maxAge: 864000000 })
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken: refreshToken,
          bonusApplied: {
            dailyLogin: isDailyLoginBonus ? 100 : 0,
          },
        },
        "User logged in successfully using refresh token"
      )
    );
});

const updateAvatar = asyncHandler(async (req, res, _) => {
  if (!req.user) {
    throw new ApiError(401, "unauthenticated request");
  }
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "no file uploaded");
  }

  const oldAvatarUrl = req.user.avatar;
  if (oldAvatarUrl != defaultAvatarUrl) {
    const result = await deleteFromCloudinary(oldAvatarUrl);
    if (!result || result === "error") {
      throw new ApiError(500, "error in deleting the avatar file", result);
    }
  }

  const newAvatar = await uploadOnCloudinary(avatarLocalPath);
  if (!newAvatar) {
    throw new ApiError(500, "not able to upload new avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: newAvatar,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user,
        newAvatar,
      },
      "avatar updated successfully"
    )
  );
});

//this is just to check whether a user is there or not
//as requested by the frontend
const checkLogin = asyncHandler(async (req, res, _) => {
  if (!req.user) {
    return res
      .status(200)
      .json(new ApiResponse(200, false, "no logged in user"));
  }
  res.status(200).json(new ApiResponse(200, true, "user is logged in"));
});

const getCurrentUserPortfolio = asyncHandler(async (req, res, _) => {
  if (!req.user) {
    throw new ApiError(401, "unauthenticated request");
  }
  const user = await User.findById(req.user._id)
    .populate({
      path: "ownedStocks.stock",
      select: "name initialValue currentValue",
    })
    .select("-password -refreshToken -createdAt -updatedAt")
    .lean();

  if (!user) {
    throw new ApiError(400, "no user found");
  }

  // current net worth account + stockValue
  const currentStockValue = user.ownedStocks.reduce(
    (total, stock) => total + stock.stock.currentValue * stock.quantity,
    0
  );
  const currentNetWorth = user.accountValue + currentStockValue;

  // profit percentage based on previous net worth
  const profitPercentage =
    user.prevNetWorth > 0
      ? ((currentNetWorth - user.prevNetWorth) / user.prevNetWorth) * 100
      : 0;

  user.profit = profitPercentage;
  user.stockValue = currentStockValue;
  user.netWorth = currentNetWorth;

  res
    .status(200)
    .json(new ApiResponse(200, user, "user portfolio fetched successfully"));
});

// const getLeaderBoard = asyncHandler( async (req, res, next) => {
//   const userRanking = await User.aggregate([
//     {
//       $lookup: {
//         from:
//       }
//     }
//   ])
// })

const getTopUsersByStockValue = asyncHandler(async (req, res) => {
  const currentUserId = req.user?._id;
  const { orderBy = "totalValue" } = req.body;
  const validOrders = ["accountValue", "stockValue", "totalValue"];

  // Validate orderBy parameter
  if (!validOrders.includes(orderBy)) {
    throw new ApiError(400, "Invalid orderBy parameter");
  }

  //since we want guests to also have a look at the leader board
  // if (!currentUserId) {
  //   throw new ApiError(401, "Unauthenticated request");
  // }

  // Get all users with populated stock data
  const allUsers = await User.find({})
    .populate({
      path: "ownedStocks.stock",
      select: "currentValue",
    })
    .select("username ownedStocks accountValue")
    .lean();

  // Calculate stock values for all users
  const usersWithTotalValue = allUsers.map((user) => {
    const stockValue = user.ownedStocks.reduce((total, ownedStock) => {
      const currentValue = ownedStock.stock?.currentValue || 0;
      const quantity = ownedStock.quantity || 0;
      return total + currentValue * quantity;
    }, 0);

    const totalValue = stockValue + user.accountValue;

    return {
      _id: user._id.toString(),
      name: user.username,
      stockValue,
      accountValue: user.accountValue,
      totalValue,
    };
  });

  // Sort all users by stock value
  const sortedUsers = usersWithTotalValue.sort(
    (a, b) => b[orderBy] - a[orderBy]
  );

  //get the top hundred users and only the relevent data
  const topUsers = sortedUsers.slice(0, 100).map((user) => ({
    name: user.name,
    stockValue: user.stockValue,
    accountValue: user.accountValue,
    totalValue: user.totalValue,
  }));

  // Find current user's position
  const currentUserIndex = currentUserId
    ? sortedUsers.findIndex((user) => user._id === currentUserId.toString())
    : -1;

  // Prepare current user data
  let currentUserData = null;
  if (currentUserIndex !== -1) {
    currentUserData = {
      name: sortedUsers[currentUserIndex].name,
      stockValue: sortedUsers[currentUserIndex].stockValue,
      accountValue: sortedUsers[currentUserIndex].accountValue,
      totalValue: sortedUsers[currentUserIndex].totalValue,
      rank: currentUserIndex + 1,
    };
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        topUsers,
        currentUser: currentUserData,
      },
      "Leaderboard data fetched successfully"
    )
  );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updateAvatar,
  checkLogin,
  getCurrentUserPortfolio,
  getTopUsersByStockValue,
};
