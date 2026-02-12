// src/routes/user.routes.js
import express from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refresshAccessToken
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

// CRITICAL: Add body parsing middleware to THIS router
router.use(express.json({ limit: "16kb" }));
router.use(express.urlencoded({ extended: true, limit: "16kb" }));

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refresshAccessToken);

export default router;