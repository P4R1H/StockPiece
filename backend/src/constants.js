import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { v2 as cloudinary } from "cloudinary";

const DB_NAME = "stockpiece";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const k = 50;
const epsilon = 1;
const decayFactor = 0.1;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const defaultAvatarpublidId = "WhatsApp_Image_2025-01-31_at_8.25.11_PM_subn0w";
const defaultAvatarUrl = cloudinary.url(defaultAvatarpublidId);

const CACHE_KEYS = {
  STOCK_STATISTICS: "stock_statistics_public",
};

const CRON_SCHEDULES = {
  MONDAY: "0 0 * * 1",
  TUESDAY: "0 0 * * 2",
  WEDNESDAY: "0 0 * * 3",
  THURSDAY: "0 0 * * 4",
  FRIDAY: "0 0 * * 5",
  SATURDAY: "0 0 * * 6",
  SUNDAY: "0 0 * * 0",
};

const DAILY_LOGIN_BONUS = 100;
const REFERRAL_BONUS = 1000;
const REFERRER_BONUS = 500;
const MAX_REFERRALS = 5;

export {
  DB_NAME,
  __dirname,
  defaultAvatarUrl,
  k,
  epsilon,
  decayFactor,
  CACHE_KEYS,
  CRON_SCHEDULES,
  DAILY_LOGIN_BONUS,
  REFERRAL_BONUS,
  REFERRER_BONUS,
  MAX_REFERRALS
};
