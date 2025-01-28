import Admin from "../models/admin.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import CharacterStock from "../models/characterStock.models.js";

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

  if (!admin.validatePassword(password)) {
    throw new ApiError(401, "invalid password");
  }

  const accessToken = await admin.generateAccessToken();

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        null,
        { accessToken },
        "admin logged in successfully"
      )
    );
});

const addAdmin = asyncHandler(async (req, res, _) => {
  if (!req.admin) {
    throw new ApiError(401, "unauthorized access");
  }

  //we also need to check if it is an super admin
  if (!req.admin.isSuperAdmin) {
    throw new ApiError(403, "only super admin access");
  }

  const { username, password } = req.body;

  if (!username?.trim() || !password?.trim()) {
    throw new ApiError(400, "username and password is required");
  }

  const admin = await Admin.create({
    username: username?.trim().toLowerCase(),
    password,
  });

  const createdAdmin = await Admin.findById(admin._id).select("-password");

  if (!createdAdmin) {
    throw new ApiError(500, "there was some error while adding admin");
  }

  res
    .status(200)
    .json(new ApiResponse(200, createdAdmin, "admin added successfully"));
});

const addCharacterStock = asyncHandler( async (req, res, _) => {
  if (!req.admin) {
    throw new ApiError(401, "unauthorized access");
  }

  const {name, initialValue} = req.body;

  if (!name?.trim() || !initialValue?.trim()) {
    throw new ApiError(400,'name and initial value required');
  }

  if (!parseInt(initialValue)) {
    throw new ApiError(400,'enter a valid initial value');
  }

  const characterStock = await CharacterStock.create({
    name: name.trim(),
    initialValue: parseInt(initialValue)
  })

  if (!characterStock) {
    throw new ApiError(500,'there was some error while creating character Stock');
  }

  res
  .status(200)
  .json(
    new ApiResponse(200,characterStock,'character stock created successfully')
  )
})

export { 
  adminLogin, 
  addAdmin,
  addCharacterStock
};
