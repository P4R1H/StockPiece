import Admin from "../models/admin.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import CharacterStock from "../models/characterStock.models.js";
import { defaultAvatarUrl } from "../constants.js";
import { uploadOnCloudinary } from "../utils/cloudinary.utils.js";

//the super admin has already been registered we only need to have login
const adminLogin = asyncHandler(async (req, res, _) => {
  const { username, password } = req.body;

  if (!username?.trim() || !password?.trim()) {
    throw new ApiError(400, "username and password is required");
  }

  const admin = await Admin.findOne({ username });

  if (!admin) {
    throw new ApiError(404, "invalid admin username");
  }

  if (!(await admin.validatePassword(password))) {
    throw new ApiError(401, "invalid password");
  }

  const accessToken = await admin.generateAccessToken();

  const loggedInAdmin = await Admin.findById(admin._id).select("-password");

  const options = {
    httpOnly: true,
    secure: true,
    maxAge: 900000,
  };

  res
    .status(200)
    .cookie("adminToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        loggedInAdmin,
        { accessToken },
        "admin logged in successfully"
      )
    );
});

const adminLogout = asyncHandler(async (req, res, _) => {
  //i just need to delete token in cookies
  if (!req.admin) {
    throw new ApiError(401, "unauthenticated request");
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("adminToken", options)
    .json(new ApiResponse(200, null, "Admin logged out successfully"));
});

const createAdmin = asyncHandler(async (req, res, _) => {
  if (!req.admin) {
    throw new ApiError(401, "unauthenticated request");
  }

  //we also need to check if it is an super admin
  if (!req.admin.isSuperAdmin) {
    throw new ApiError(403, "only super admin access");
  }

  const { username, password } = req.body;

  if (!username?.trim() || !password?.trim()) {
    throw new ApiError(400, "username and password is required");
  }

  const existingAdmin = await Admin.findOne({
    username: username.toLowerCase(),
  });

  if (existingAdmin) {
    throw new ApiError(400, "admin already exists");
  }

  const createdAdmin = await Admin.create({
    username: username?.trim().toLowerCase(),
    password,
  });

  if (!createdAdmin) {
    throw new ApiError(500, "there was some error while adding admin");
  }

  res
    .status(200)
    .json(new ApiResponse(200, createdAdmin, "admin added successfully"));
});

const deleteAdmin = asyncHandler(async (req, res, _) => {
  if (!req.admin) {
    throw new ApiError(401, "unauthenticated request");
  }

  if (!req.admin.isSuperAdmin) {
    throw new ApiError(403, "only super admin access");
  }

  const { username } = req.body;

  if (!username?.trim()) {
    throw new ApiError(400, "username is required");
  }

  const admin = await Admin.findOne({ username });

  if (!admin) {
    throw new ApiError(404, `admin with username ${username} not found`);
  }

  const removedAdmin = await Admin.findByIdAndDelete(admin._id);

  res
    .status(200)
    .json(new ApiResponse(200, removedAdmin, "admin deleted successfully"));
});

const createCharacterStock = asyncHandler(async (req, res, _) => {
  if (!req.admin) {
    throw new ApiError(401, "unauthenticated request");
  }

  const { name, initialValue, tickerSymbol } = req.body;

  if (!name?.trim()) {
    throw new ApiError(400, "name required");
  }

  let characterStock;
  //check if the stock already exists and is removed
  const existingCharacterStock = await CharacterStock.findOne({
    $or: [{ name }, { tickerSymbol }],
  });

  if (existingCharacterStock && !existingCharacterStock.isRemoved) {
    throw new ApiError(400, "character stock or ticker symbol already added ");
  } else if (existingCharacterStock?.isRemoved) {
    existingCharacterStock.isRemoved = false;
    existingCharacterStock.save({ validateModifiedOnly: true });
    characterStock = existingCharacterStock;
  } else {
    if (!initialValue?.trim()) {
      throw new ApiError(400, "initial value required");
    }

    if (!parseInt(initialValue)) {
      throw new ApiError(400, "enter a valid initial value");
    }

    if (!tickerSymbol?.trim()) {
      throw new ApiError(400, "ticker symbol required");
    }

    const imageLocalFilePath = req.file?.path;
    const imageUrl = imageLocalFilePath
      ? await uploadOnCloudinary(imageLocalFilePath, true)
      : defaultAvatarUrl;

    if (!imageUrl) {
      throw new ApiError(500, "not able to upload image");
    }

    characterStock = await CharacterStock.create({
      name: name.trim(),
      initialValue: parseInt(initialValue),
      currentValue: initialValue,
      imageURL: imageUrl,
      tickerSymbol,
    });

    if (!characterStock) {
      throw new ApiError(
        500,
        "there was some error while creating character Stock"
      );
    }
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, characterStock, "character stock added successfully")
    );
});

//need to request the super admin for permanent deletion
//we can handle deleting referencings later
const deleteCharacterStockTemp = asyncHandler(async (req, res, _) => {
  if (!req.admin) {
    throw new ApiError(401, "unauthenticated request");
  }

  const { name } = req.body;

  if (!name?.trim()) {
    throw new ApiError(400, "name is required");
  }

  const characterStock = await CharacterStock.findOne({ name });

  if (!characterStock || characterStock.isRemoved) {
    throw new ApiError(404, "character stock not found");
  }

  const removedCharacterStock = await CharacterStock.findByIdAndUpdate(
    characterStock._id,
    { isRemoved: true },
    { new: true }
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, removedCharacterStock, "stock deleted successfully")
    );
});

export {
  adminLogin,
  createAdmin,
  createCharacterStock,
  deleteCharacterStockTemp,
  deleteAdmin,
  adminLogout,
};
