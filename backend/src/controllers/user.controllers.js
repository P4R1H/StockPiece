import { defaultAvatarUrl } from "../constants.js";
import User from "../models/user.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.utils.js";
import jwt from "jsonwebtoken";

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
    accountValue: 10000,
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
  const { username, password } = req.body;

  if (!username?.trim() || !password?.trim()) {
    throw new ApiError(400, "username and password required");
  }

  const user = await User.verifyUser(username, password);

  if (!user) {
    throw new ApiError(500, "Unexpected Error: user verification failed");
  }

  const { accessToken, refreshToken } = await generateAccessRefreshToken(user);

  //check if the user needs to get extra 100 dollars for daily login
  const midNightTime = () => new Date(new Date.setHours(0, 0, 0, 0));

  const loggedInUser =
    !user.lastLogin || user.lastLogin < midNightTime
      ? await User.findByIdAndUpdate(
          user._id,
          {
            $set: {
              lastLogin: Date.now(),
            },
            $inc: {
              accountValue: 100,
            },
          },
          { new: true }
        ).select("-password -refreshToken")
      : await User.findByIdAndUpdate(
          user._id,
          {
            $set: {
              lastLogin: Date.now(),
            },
          },
          { new: true }
        ).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
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
    .cookie("accessToken", "", options)
    .cookie("refreshToken", "", options)
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

  const loggedInUser = await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        lastLogin: Date.now(),
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
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

const getCurrentUser = asyncHandler(async (req, res, _) => {
  if (!req.user) {
    throw new ApiError(401, "unauthenticated request");
  }
  res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"));
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

  let totalInitialValue = 0;
  let totalCurrentValue = 0;

  user.ownedStocks.forEach((stock) => {
    totalInitialValue += stock.stock.initialValue * stock.quantity;
    totalCurrentValue += stock.stock.currentValue * stock.quantity;
  });

  const profitPercentage =
    ((totalCurrentValue - totalInitialValue) / totalInitialValue) * 100;

  user.profit = profitPercentage;
  user.stockValue = totalCurrentValue;

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
    .select("username ownedStocks")
    .lean();

  // Calculate stock values for all users
  const usersWithStockValue = allUsers.map((user) => ({
    _id: user._id.toString(),
    name: user.username,
    stockValue: user.ownedStocks.reduce((total, ownedStock) => {
      const currentValue = ownedStock.stock?.currentValue || 0;
      const quantity = ownedStock.quantity || 0;
      return total + currentValue * quantity;
    }, 0),
  }));

  // Sort all users by stock value
  const sortedUsers = usersWithStockValue.sort(
    (a, b) => b.stockValue - a.stockValue
  );

  //get the top hundred users and only the relevent data
  const topUsers = sortedUsers.slice(0, 100).map((user) => ({
    name: user.name,
    stockValue: user.stockValue,
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
  getCurrentUser,
  getCurrentUserPortfolio,
  getTopUsersByStockValue,
};
