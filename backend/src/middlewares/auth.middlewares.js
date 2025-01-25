import ApiError from "../utils/ApiError.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import jwt from "jsonwebtoken";
import User from "../models/user.models.js";

const verifyJWT = asyncHandler(async (req, _, next) => {
  //we need to get the accessToken from cookies
  const accessToken =
    req.cookies?.accessToken ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!accessToken) {
    throw new ApiError(401, "Unauthrized request");
  }

  const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

  const user = await User.findById(decodedToken?._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(401, "Invalid Access Token");
  }

  req.user = user;
  next();
});

export default verifyJWT;
