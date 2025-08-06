import { Router } from "express";
import {
  checkLogin,
  getCurrentUserPortfolio,
  getTopUsersByStockValue,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updateAvatar,
  updatePreviousNetworth,
} from "../controllers/user.controllers.js";
import upload from "../middlewares/multer.middlewares.js";
import { registerUser } from "../controllers/user.controllers.js";
import { verifyAdminJWT, verifyJWT } from "../middlewares/auth.middlewares.js";
import { globalRequestLimiter } from "../middlewares/requestLimit.middlewares.js";

const userRouter = Router();

userRouter.use((req, res, next) => {
  if (req.method === "POST") {
    return res.status(405).json({
      error: "POST requests are not allowed",
      method: req.method,
      path: req.path,
    });
  }
  next();
});

// userRouter
//   .route("/auth/register")
//   .post(globalRequestLimiter, upload.single("avatar"), registerUser);
userRouter.route("/auth/login").post(loginUser);

//secure routes
userRouter.route("/auth/refresh").post(refreshAccessToken);

userRouter
  .route("/networth/prev")
  .patch(verifyAdminJWT, updatePreviousNetworth);

userRouter.use(verifyJWT);

userRouter
  .route("/profile/avatar")
  .patch(upload.single("avatar"), updateAvatar);
userRouter.route("/auth/logout").post(logoutUser);
userRouter.route("/profile/login-status").get(checkLogin);
userRouter.route("/portfolio").get(getCurrentUserPortfolio);
userRouter.route("/leaderboard").get(getTopUsersByStockValue);

export default userRouter;
