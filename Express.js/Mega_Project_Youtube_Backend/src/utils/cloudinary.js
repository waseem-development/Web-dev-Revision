import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import dotenv from "dotenv";
import { apiError } from "./apiError";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      throw new Error("Failed to locate file path");
    }

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    await fs.unlink(localFilePath);

    return {
      url: response.secure_url,
      public_id: response.public_id,
    };
  } catch (error) {
    if (localFilePath) {
      try {
        await fs.unlink(localFilePath);
      } catch (unlinkError) {
        console.warn(`⚠️ Cleanup failed after upload error: ${localFilePath}`);
      }
    }

    return null; // Signal upload failed
  }
};

export { uploadOnCloudinary };
