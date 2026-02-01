// ================================================================
// src/utils/cloudinary.js - FIXED VERSION
// ================================================================

import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";

// ================================================================
// CRITICAL: Import and configure dotenv
// ================================================================
import dotenv from "dotenv";
dotenv.config(); // This loads environment variables from .env file

// ================================================================
// CONFIGURATION - Add debug logging
// ================================================================
console.log("🔧 Cloudinary Configuration Loading...");
console.log("📁 CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("🔑 CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "***SET***" : "❌ MISSING");
console.log("🔐 CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "***SET***" : "❌ MISSING");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Verify configuration
console.log("✅ Cloudinary Config Status:", {
  cloud_name: cloudinary.config().cloud_name,
  has_api_key: !!cloudinary.config().api_key,
  has_api_secret: !!cloudinary.config().api_secret
});

// ================================================================
// FUNCTION: uploadOnCloudinary
// ================================================================
const uploadOnCloudinary = async (localFilePath) => {
  console.log("🚀 Cloudinary upload started for:", localFilePath);
  
  try {
    // -----------------------------
    // Validation: ensure file exists
    // -----------------------------
    if (!localFilePath) {
      console.error("❌ No local file path provided");
      throw new Error("Failed to locate file path");
    }

    // Check if file actually exists on disk
    try {
      await fs.access(localFilePath);
      console.log("📄 File exists on disk, size:", (await fs.stat(localFilePath)).size, "bytes");
    } catch (fsError) {
      console.error("❌ File not found at path:", localFilePath);
      throw new Error("File not found on disk");
    }

    // -----------------------------
    // Upload to Cloudinary
    // -----------------------------
    console.log("⬆️ Uploading to Cloudinary...");
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("✅ File uploaded successfully to Cloudinary");
    console.log("🔗 URL:", response.secure_url);

    // -----------------------------
    // Remove local temp file
    // -----------------------------
    console.log("🗑️ Deleting local temp file...");
    await fs.unlink(localFilePath);
    console.log("✅ Local file deleted");

    // -----------------------------
    // Return key data from Cloudinary
    // -----------------------------
    return {
      url: response.secure_url,
      public_id: response.public_id,
    };
  } catch (error) {
    console.error("❌ Cloudinary upload failed!");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    // -----------------------------
    // Cleanup even if upload fails
    // -----------------------------
    if (localFilePath) {
      try {
        await fs.unlink(localFilePath);
        console.log("🗑️ Cleaned up temp file after error");
      } catch (unlinkError) {
        console.error("Failed to delete temp file:", unlinkError.message);
      }
    }

    return null;
  }
};

// ================================================================
// Export
// ================================================================
export { uploadOnCloudinary };