import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { v2 as cloudinary } from "cloudinary";

const DB_NAME = "stockpiece";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const defaultAvatarpublidId = "defaultAvatar_evaivb";
const defaultAvatarUrl = cloudinary.url(defaultAvatarpublidId);

export { DB_NAME, __dirname, defaultAvatarUrl };
