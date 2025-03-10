import { DAILY_LOGIN_BONUS, defaultAvatarUrl } from "../constants.js";
import User from "../models/user.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.utils.js";
import jwt from "jsonwebtoken";
import Coupon from "../models/coupon.models.js";
import containsProfanity from "../utils/profanity.utils.js";
import Transaction from "../models/transaction.models.js";
import UserFingerprint from "../models/fingerPrint.models.js";
import ChapterRelease from "../models/chapterRelease.models.js";
import { CACHE_KEYS } from "../constants.js";
import cache from "../utils/cache.js";
import mongoose from "mongoose";

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
    if (user.lastLogin) {
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
  await coupon.save({validateModifiedOnly: true});

  return coupon;
};

const checkDailyLogin = (lastDailyLoginDate) => {
  if (!lastDailyLoginDate) return true; // First time login

  //get last midnight
  const lastDailyLoginMidnight = new Date(lastDailyLoginDate);
  lastDailyLoginMidnight.setHours(0, 0, 0, 0);

  //get current midnight
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  //return true if the last midnight was before today's midnight
  return lastDailyLoginMidnight < todayMidnight;
};

const generateAccessRefreshToken = async (user) => {
  try {
    const [ accessToken, refreshToken ] = await Promise.all([
      user.generateAccessToken(),
      user.generateRefreshToken()
    ])

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
      error,
      error.stack
    );
  }
};

const registerUser = asyncHandler(async (req, res, _) => {
  const { username, password, fingerprint } = req.body;

  if (!username?.trim() || !password?.trim()) {
    throw new ApiError(400, "username and password required");
  }

  let existingFingerPrint;
  if (fingerprint?.trim()) {
    //if finger print provided then we need to check if max 3 accounts created or not for the week
    existingFingerPrint = await UserFingerprint.findOne({ fingerprint });

    if (existingFingerPrint?.count >= 3) {
      throw new ApiError(429, "max accounts created for your device");
    }
    
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
    accountValue: 5000,
    prevNetWorth: 5000,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "some error occurred while creating user");
  }

  if (fingerprint?.trim()) {
    if (existingFingerPrint) {
      existingFingerPrint.count += 1;
      existingFingerPrint.save({ validateModifiedOnly: true });
    } else {
      const _createdFingerPrint = await UserFingerprint.create({
        fingerprint: fingerprint.trim(),
      });
    }
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        createdUser,
        maxAccountCreated: false,
      },
      "user created successfully"
    )
  );
});

const loginUser = asyncHandler(async (req, res, _) => {
  const { username, password, couponCode } = req.body;

  console.log(req.headers["accept-language"]);

  if (!username?.trim() || !password?.trim()) {
    throw new ApiError(400, "username and password required");
  }

  const user = await User.verifyUser(username, password);

  if (!user) {
    throw new ApiError(500, "Unexpected Error: user verification failed");
  }

  const firstTimeLogin = user.lastLogin ? false : true;

  const [tokens, coupon] = await Promise.all([
    generateAccessRefreshToken(user),
    couponCode?.trim() ? verifyCoupon(couponCode, user) : Promise.resolve(0),
  ]);

  const couponAmount = coupon?.amount || 0;

  const { accessToken, refreshToken } = tokens;

  const updateObject = {
    $set: {
      lastLogin: new Date()
    },
  };

  if (couponAmount > 0) {
    updateObject.$inc = {
      accountValue: couponAmount,
    };
  }

  // If it's a referral coupon, add bonus to referrer's account
  if (coupon?.couponType === "REFERRAL" && coupon?.createdBy) {
    await User.findByIdAndUpdate(coupon.createdBy._id, {
      $inc: { accountValue: coupon.referrerBonus },
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
    sameSite: "None"
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, { ...options, maxAge: 86400000 })
    .cookie("refreshToken", refreshToken, { ...options, maxAge: 864000000 })
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
          bonusApplied: {
            newUserBonus: 5000,
            coupon: couponAmount,
          },
          firstTimeLogin
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
    sameSite: "None"
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

  const updateObject = {
    $set: {
      lastLogin: new Date(),
    },
  };

  const loggedInUser = await User.findByIdAndUpdate(user._id, updateObject, {
    new: true,
  }).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None"
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, { ...options, maxAge: 86400000 })
    .cookie("refreshToken", refreshToken, { ...options, maxAge: 864000000 })
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken: refreshToken,
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
  let loginFlag = false;
  let dailyLoginBonus = 0;
  if (req.user) {
    loginFlag = true;
    const user = req.user;
    //check if the user needs to get extra 100 dollars for daily login
    dailyLoginBonus = checkDailyLogin(user.lastDailyBonus) ? DAILY_LOGIN_BONUS : 0;

    if (dailyLoginBonus > 0) {
      await User.findByIdAndUpdate(user._id, {
        $inc: {
          accountValue: dailyLoginBonus,
        },
        $set: {
          lastDailyBonus: new Date(),
        },
      });
    }
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        loginStatus: loginFlag,
        dailyLoginBonus: dailyLoginBonus,
      },
      `user is ${loginFlag ? "logged In" : "not logged In"}`
    )
  );
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
  const { orderBy = "totalValue" } = req.query;
  const validOrders = ["accountValue", "stockValue", "totalValue"];

  // Validate orderBy parameter
  if (!validOrders.includes(orderBy)) {
    throw new ApiError(400, "Invalid orderBy parameter");
  }

  // const cachedData = cache.get(CACHE_KEYS.LEADER_BOARD);
  // if (cachedData) {
  //   return res
  //     .status(200)
  //     .json(
  //       new ApiResponse(
  //         200,
  //         cachedData,
  //         "stock stats fetched successfully from cache"
  //       )
  //     );
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

  // cache.set(CACHE_KEYS.LEADER_BOARD, {
  //   topUsers,
  //   currentUser: currentUserData,
  // }, 3600);

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

const getUserTransaction = asyncHandler(async (req, res, _next) => {
  // Authentication check
  if (!req.admin) {
    throw new ApiError(401, 'Unauthorized access');
  }

  // Input validation
  const { username, chapter = "-1" } = req.query;

  if (!username?.trim()) {
    throw new ApiError(400, 'Username is required');
  }

  // Parse chapter number
  const chapterNumber = Number(chapter);
  if (isNaN(chapterNumber)) {
    throw new ApiError(400, 'Invalid chapter number');
  }

  // Find user
  const user = await User.findOne({ username: username.trim() });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  let userTransactions;

  if (chapterNumber === -1) {
    // Get all transactions
    userTransactions = await Transaction.find({ 
      purchasedBy: user._id 
    })
    .sort({ createdAt: -1 })
    .lean();
  } else {
    // Get chapter-specific transactions
    const chapterDoc = await ChapterRelease.findOne(
      chapterNumber ? { chapter: chapterNumber } : {}
    )
    .sort({ releaseDate: -1 })
    .lean();

    if (!chapterDoc) {
      throw new ApiError(404, `Chapter ${chapterNumber || "latest"} not found`);
    }

    userTransactions = await Transaction.find({ 
      purchasedBy: user._id,
      chapterPurchasedAt: chapterDoc.chapter 
    })
    .sort({ createdAt: -1 })
    .lean();
  }

  // Response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        transactions: userTransactions,
        user: { 
          username: user.username,
          id: user._id 
        },
        chapter: chapterNumber === -1 ? 'all' : chapterNumber
      },
      `${chapterNumber === -1 ? "All" : `Chapter ${chapterNumber}`} transactions fetched successfully`
    )
  );
});

const updatePreviousNetworth = asyncHandler(async (req, res, _next) => {
  if (!req.admin) {
    throw new ApiError(400,'unauthorized error');
  }

  const _transaction = await mongoose.connection.transaction(
    async (session) => {
      
      // Update all users' prevNetWorth with their current total value
      const users = await User
      .find({})
      .populate({
        path: "ownedStocks.stock",
        select: "currentValue",
      })
      .session(session)

      let bulkOps = [];

      for (const user of users) {
        const stockValue = user.ownedStocks.reduce(
          (total, stock) => total + stock.stock.currentValue * stock.quantity,
          0
        );
        const currentNetWorth = user.accountValue + stockValue;

        bulkOps.push({
          updateOne: {
            filter: {_id: user._id},
            update: {
              $set: {
                prevNetWorth: currentNetWorth
              }
            }
          }
        })

        if (bulkOps.length === 1000) {
          await User.bulkWrite(bulkOps, {session});
          bulkOps = [];
        }
      }

      if (bulkOps.length > 0) {
        await User.bulkWrite(bulkOps, {session});
      }

    }
  )

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        'user prev net worth updated successfully'
      )
    )
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
  getUserTransaction,
  updatePreviousNetworth
};
