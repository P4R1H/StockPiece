import mongoose from "mongoose";
import argon from "argon2";
import ApiError from "../utils/ApiError.utils.js";
import jwt from "jsonwebtoken";
import { defaultAvatarUrl } from "../constants.js";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "username is required"],
      unique: [true, "username already exists"],
      lowercase: true,
      trim: true,
      minLength: [3, "username should be minimum 3 characters"],
      index: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minLength: [6, "password should be minimum 6 characters"],
    },
    avatar: {
      type: String, //cloudinary
      default: defaultAvatarUrl,
    },
    accountValue: {
      type: Number,
      default: 10000,
    },
    prevNetWorth: {
      type: Number,
      default: 10000,
    },
    ownedStocks: {
      type: [
        {
          stock: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CharacterStock",
          },
          quantity: {
            type: Number,
            required: true,
          },
        },
      ],
      default: [],
    },
    lastLogin: {
      type: Date,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

//hash the password before saving
userSchema.pre("save", async function (next) {
  try {
    const user = this;

    if (!user.isModified(["password"])) {
      return next();
    }

    const hash = await argon.hash(user.password);
    user.password = hash;
    return next();
  } catch (error) {
    next(error);
  }
});

userSchema.static("verifyUser", async function (username, password) {
  const user = await User.findOne({ username });
  if (!user) {
    throw new ApiError(404, "user not found");
  }
  if (!(await argon.verify(user.password, password))) {
    throw new ApiError(401, "invalid password");
  }
  return user;
});

userSchema.methods.generateAccessToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      username: this.username,
      avatar: this.avatar,
      lastLogin: this.lastLogin,
      accountValue: this.accountValue,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
  return token;
};

userSchema.methods.generateRefreshToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );

  return token;
};

//we need to create the user model at last after we add all the methods
const User = mongoose.model("User", userSchema);

export default User;
