import { defaultAvatarUrl } from "../constants.js";
import User from "../models/user.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import { uploadOnCloudinary } from "../utils/cloudinary.utils.js";
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

  const loggedInUser = await User.findByIdAndUpdate(
    user._id,
    {
      $inc: {
        tokenVersion: 1
      }
    },
    {new: true}
  ).select(
    "-password -refreshToken"
  );

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
          accessToken,
          refreshToken: refreshToken,
        },
        "User logged in successfully using refresh token"
      )
    );
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
