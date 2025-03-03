import ApiError from "../utils/ApiError.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import Admin from "../models/admin.models.js";

const verifyToken = async (token, secret, model, selectFields) => {
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, secret);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return null;
    }
    throw new ApiError(401, "Invalid Access Token");
  }

  const user = await model.findById(decodedToken?._id).select(selectFields);
  if (!user) {
    throw new ApiError(401, "Invalid Access Token");
  }

  return user;
};

const verifyJWT = asyncHandler(async (req, _, next) => {
  const accessToken =
    req.cookies?.accessToken ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!accessToken) {
    return next();
  }

  const user = await verifyToken(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET,
    User,
    "-password -refreshToken"
  );

  if (user) {
    req.user = user;
  }

  next();
});

const verifyAdminJWT = asyncHandler(async (req, _, next) => {
  const adminToken =
    req.cookies?.adminToken ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!adminToken) {
    return next();
  }

  const admin = await verifyToken(
    adminToken,
    process.env.ADMIN_ACCESS_TOKEN_SECRET,
    Admin,
    "-password"
  );

  if (admin) {
    req.admin = admin;
  }

  next();
});

export { verifyAdminJWT, verifyJWT };
