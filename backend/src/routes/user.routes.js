import { Router } from "express";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  updateAvatar,
} from "../controllers/user.controllers.js";
import upload from "../middlewares/multer.middlewares.js";
import { registerUser } from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const userRouter = Router();

userRouter.route("/register").post(upload.single("avatar"), registerUser);

userRouter.route("/login").post(loginUser);

//secure routes
userRouter.route("/refresh-token").post(refreshAccessToken);

userRouter.use(verifyJWT);

userRouter.route('/update-avatar').post(upload.single("avatar"),updateAvatar)
userRouter.route("/logout").post(logoutUser);

export default userRouter;
