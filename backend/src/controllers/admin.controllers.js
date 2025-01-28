import Admin from "../models/admin.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils";
import asyncHandler from "../utils/asyncHandler.utils";

//the super admin has already been registered we only need to have login
const adminLogin = asyncHandler( async (req,res,_) => {
  const { username, password } = req.body;

  if (!username?.trim() || !password?.trim()) {
    throw new ApiError(400,'username and password is required');
  }

  const admin = await Admin.findOne({username});
  if (!admin) {
    throw new ApiError(404,'invalid super admin username');
  }

  if (!admin.validatePassword(password)) {
    throw new ApiError(401,'invalid password');
  }

  const accessToken = await admin.generateAccessToken();

  options = {
    httpOnly: true,
    secure: true
  }

  res
  .status(200)
  .cookie('accessToken',accessToken,options)
  .json(
    new ApiResponse(200,null,accessToken,"admin logged in successfully")
  )
})

export {
  adminLogin
}