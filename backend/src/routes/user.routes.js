import { Router } from "express";
import {
  checkLogin,
  getCurrentUserPortfolio,
  getTopUsersByStockValue,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updateAvatar,
} from "../controllers/user.controllers.js";
import upload from "../middlewares/multer.middlewares.js";
import { registerUser } from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const userRouter = Router();

userRouter.route("/auth/register").post(upload.single("avatar"), registerUser);
userRouter.route("/auth/login").post(loginUser);

//secure routes
userRouter.route("/auth/refresh").post(refreshAccessToken);

userRouter.use(verifyJWT);

userRouter
  .route("/profile/avatar")
  .patch(upload.single("avatar"), updateAvatar);
userRouter.route("/auth/logout").post(logoutUser);
userRouter.route("/profile/login-status").get(checkLogin);
userRouter.route("/portfolio").get(getCurrentUserPortfolio);
userRouter.route("/leaderboard").get(getTopUsersByStockValue);

export default userRouter;
