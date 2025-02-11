import ApiError from "../utils/ApiError.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import Admin from "../models/admin.models.js";

const verifyJWT = asyncHandler(async (req, _, next) => {
  //we need to get the accessToken from cookies
  const accessToken =
    req.cookies?.accessToken ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!accessToken) {
    return next();
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

const verifyAdminJWT = asyncHandler(async (req, _, next) => {
  //we need to get the accessToken from cookies
  const adminToken =
    req.cookies?.adminToken ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!adminToken) {
    return next();
  }

  const decodedToken = jwt.verify(
    adminToken,
    process.env.ADMIN_ACCESS_TOKEN_SECRET
  );

  const admin = await Admin.findById(decodedToken?._id).select("-password");

  if (!admin) {
    throw new ApiError(401, "Invalid Access Token");
  }

  req.admin = admin;
  next();
});

export { verifyAdminJWT, verifyJWT };
