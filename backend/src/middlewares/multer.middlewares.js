import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import ApiError from "../utils/ApiError.utils.js";
import { __dirname } from "../constants.js";

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    const destinationPath = path.join(__dirname, "../public/temp");
    //if the dir is not there we make it
    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath, { recursive: true });
    }

    cb(null, destinationPath);
  },
  filename: function (_req, file, cb) {
    const newFileName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, newFileName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /\.(jpg|jpeg|png|gif|webp)$/i;
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  // Check if mimetype exists and is valid
  if (file.mimetype && allowedMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }
  // Fallback to extension-based check
  if (file.originalname.match(allowedExtensions)) {
    return cb(null, true);
  }
  // Reject file if neither mimetype nor extension is valid
  cb(new ApiError(400, "Only valid image files are allowed"), false);
};

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5, //5mb
  },
  fileFilter,
});

export default upload;
