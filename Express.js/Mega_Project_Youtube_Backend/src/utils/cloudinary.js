// ================================================================
// cloudinaryUpload.js
// ================================================================

// Import Cloudinary v2 SDK and Node.js filesystem promises
import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";

// ================================================================
// CONFIGURATION
// ================================================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Cloud name from your account
  api_key: process.env.CLOUDINARY_API_KEY,       // API key
  api_secret: process.env.CLOUDINARY_API_SECRET, // API secret
  // Cloudinary URL can also be used instead of individual values
});

// ================================================================
// NOTES:
// 1. cloudinary.v2:
//    - Cloudinary SDK exposes v2 API for uploads, transformations, deletions.
//    - Handles image, video, and auto resource types.

// 2. fs/promises:
//    - Node.js built-in filesystem promises API
//    - Allows async/await file operations like deleting temp files

// 3. Why delete local files?
//    - When using multer or temp uploads, a copy is saved locally.
//    - After uploading to Cloudinary, local copy is redundant.
//    - Prevents storage bloat and keeps server clean.

// 4. Error handling:
//    - Upload or unlink can fail.
//    - Must catch errors to prevent crashing the server.
// ================================================================

// ================================================================
// FUNCTION: uploadOnCloudinary
// ================================================================
const uploadOnCloudinary = async (localFilePath) => {
  try {
    // -----------------------------
    // Validation: ensure file exists
    // -----------------------------
    if (!localFilePath) {
      throw new Error("Failed to locate file path");
    }

    // -----------------------------
    // Upload to Cloudinary
    // -----------------------------
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // Automatically detect if image/video/file
    });

    console.log("File is uploaded on Cloudinary", response.url);

    // -----------------------------
    // Remove local temp file
    // -----------------------------
    // In production: always cleanup to avoid disk bloat
    await fs.unlink(localFilePath);

    // -----------------------------
    // Return key data from Cloudinary
    // -----------------------------
    return {
      url: response.secure_url,  // HTTPS secure URL to serve in frontend
      public_id: response.public_id, // Cloudinary ID for deleting/updating later
    };
  } catch (error) {
    // -----------------------------
    // Cleanup even if upload fails
    // -----------------------------
    if (localFilePath) {
      await fs.unlink(localFilePath).catch(() => {
        // Optional: log deletion errors at debug level
        // console.debug("Failed to delete temp file:", localFilePath);
      });
    }

    // -----------------------------
    // Log error for monitoring/debugging
    // -----------------------------
    console.error("Cloudinary error:", error.message);

    // -----------------------------
    // Return null to indicate failure
    // -----------------------------
    return null;
  }
};

// ================================================================
// Export
// ================================================================
export { uploadOnCloudinary };

// ================================================================
// INTERVIEW / INDUSTRY NOTES:
// ================================================================

// 1. Why use a wrapper function like this?
//    - Centralizes upload logic
//    - Handles validation, upload, cleanup, and errors
//    - Controllers or routes only need to call this function

// 2. Resource type 'auto':
//    - Automatically detects file type (image/video)
//    - Safer in production to handle multiple file types

// 3. fs.unlink vs fs.unlinkSync:
//    - unlink: async, non-blocking, safer in Node.js
//    - unlinkSync: blocks event loop (bad for high-concurrency servers)

// 4. .catch(() => {}):
//    - Prevents crash if cleanup fails
//    - In dev, could log for debugging

// 5. Return object { url, public_id }:
//    - Makes it easier to save metadata in DB (e.g., product photo, video upload)

// 6. Common pitfalls:
//    - Forgetting to delete local files → disk fills up
//    - Not catching Cloudinary errors → crashes server
//    - Hardcoding API keys → security risk, always use env vars

// 7. Security tips:
//    - Never expose API secret in frontend
//    - Use signed URLs if allowing client-side direct upload
//    - Use environment variables and `.env` file
