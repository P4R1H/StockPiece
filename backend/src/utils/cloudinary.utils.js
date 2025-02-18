import { v2 as cloudinary } from "cloudinary";
import { extractPublicId } from "cloudinary-build-url";
import fs from "node:fs";
import ApiError from "./ApiError.utils.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const maxAttempts = 3;

const deleteTempFile = async (localFilePath) => {
  try {
    if (localFilePath) {
      await fs.promises.unlink(localFilePath);
      console.log("temp file deleted: ", !fs.existsSync(localFilePath));
    }
  } catch (error) {
    console.log("error deleting temp file", error.message);
  }
};

const uploadOnCloudinary = async (localFilePath,stock=false) => {
  try {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        if (!localFilePath) return null;
        // const transformation = {
        //     width: 330,
        //     crop: "scale",
        //     quality: 60,    // Adjusts quality to balance file size and quality
        //     fetch_format: "auto"  // Converts the image to WebP format if supported
        // }
        // if (stock) {
        //   transformation.width = 200
        // }
        const uploadResult = await cloudinary.uploader.upload(localFilePath, {
          resource_type: "auto",
          // transformation
        });

        console.log("File has been uploaded on cloudinary");
        return uploadResult.secure_url  ;
      } catch (uploadError) {
        if (attempt == maxAttempts) {
          throw uploadError;
        }
      }
    }
  } catch (error) {
    throw new ApiError(
      500,
      "error in uploading to cloudinary",
      error.message,
      error.stack
    );
  } finally {
    await deleteTempFile(localFilePath);
  }
};

const deleteFromCloudinary = async (url) => {
  try {
    if (!url) return null;
    const publicId = extractPublicId(url);
    const destroyResult = cloudinary.uploader.destroy(publicId);
    console.log("file deleted successfully from cloudinary");
    return destroyResult;
  } catch (error) {
    throw new ApiError(
      500,
      "error in deleting from cloudinary",
      error.message,
      error.stack
    );
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
