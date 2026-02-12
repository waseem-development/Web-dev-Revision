// src/controllers/user.controller.js - COMPLETE ALGORITHM COMMENTS
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"; // MISSING IMPORT - ADD THIS!

const generateAccessAndRefreshToken = async (userId) => {
  try {
    // 1. Find user by ID
    const user = await User.findById(userId);

    // 2. Generate access token using user's instance method
    const accessToken = user.generateAccessToken();

    // 3. Generate refresh token using user's instance method
    const refreshToken = user.generateRefreshToken();

    // 4. Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); // Skip validation

    // 5. Return both tokens
    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // ==========================================
  // STEP 1: EXTRACT DATA FROM REQUEST BODY
  // ==========================================
  const { fullName, email, username, password } = req.body;

  // ==========================================
  // STEP 2: VALIDATE REQUIRED FIELDS
  // ==========================================
  const fields = { fullName, email, username, password };
  const emptyField = Object.entries(fields).find(
    ([key, value]) => !value || value.trim() === ""
  );
  if (emptyField) {
    const [field] = emptyField;
    throw new apiError(400, `${field} is required`);
  }

  // ==========================================
  // STEP 3: CHECK FOR EXISTING USER
  // ==========================================
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    // Determine which credential already exists
    if (existedUser.username === username) {
      throw new apiError(409, "Username already exists");
    }
    if (existedUser.email === email) {
      throw new apiError(409, "Email already exists");
    }
  }

  // ==========================================
  // STEP 4: GET UPLOADED FILE PATHS FROM MULTER
  // ==========================================
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  // ==========================================
  // STEP 5: VALIDATE AVATAR FILE EXISTS
  // ==========================================
  if (!avatarLocalPath) {
    throw new apiError(400, "Avatar file is required");
  }

  // ==========================================
  // STEP 6: UPLOAD AVATAR TO CLOUDINARY
  // ==========================================
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  // ==========================================
  // STEP 7: UPLOAD COVER IMAGE TO CLOUDINARY (OPTIONAL)
  // ==========================================
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // ==========================================
  // STEP 8: VERIFY AVATAR UPLOAD SUCCEEDED
  // ==========================================
  if (!avatar) {
    throw new apiError(400, "Avatar file is required");
  }

  // ==========================================
  // STEP 9: CREATE USER IN DATABASE
  // ==========================================
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password, // PRE-SAVE HOOK TRIGGERS HERE - password gets hashed
    username: username.toLowerCase(),
  });

  // ==========================================
  // STEP 10: RETRIEVE USER WITHOUT SENSITIVE FIELDS
  // ==========================================
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // ==========================================
  // STEP 11: VERIFY USER CREATION
  // ==========================================
  if (!createdUser) {
    throw new apiError(500, "Something went wrong while registering the user");
  }

  // ==========================================
  // STEP 12: RETURN SUCCESS RESPONSE
  // ==========================================
  return res
    .status(201)
    .json(new apiResponse(201, createdUser, "User registered successfully"));

  // ==========================================
  // COMPLETE REGISTRATION FLOW SUMMARY:
  // ==========================================
  /*
  📦 REQUEST → Multer parses files → Controller receives
  
  1️⃣ Client sends: 
     - Body: { fullName, email, username, password }
     - Files: avatar.jpg, coverImage.jpg (multipart/form-data)
  
  2️⃣ Validation:
     - All fields present and non-empty
     - Username/email not already in DB
  
  3️⃣ File Processing:
     - Multer saves files temporarily on server
     - Paths: ./public/temp/avatar-123.jpg, ./public/temp/cover-456.jpg
  
  4️⃣ Cloudinary Upload:
     - Reads temp files, uploads to cloud
     - Returns secure URLs: https://cloudinary.com/avatar.jpg
  
  5️⃣ Database Operation:
     - Creates new user document
     - pre('save') hook hashes password with bcrypt (salt rounds=10)
     - Stores avatar URL, coverImage URL (or empty string)
  
  6️⃣ Response:
     - Queries user again excluding password & refreshToken
     - Sends 201 Created with user data
  
  🎯 FINAL: User exists in DB with hashed password, ready to login!
  */
});

const loginUser = asyncHandler(async (req, res) => {
  // ==========================================
  // STEP 1: EXTRACT CREDENTIALS FROM REQUEST
  // ==========================================
  const { username, email, password } = req.body;

  // ==========================================
  // STEP 2: VALIDATE REQUIRED FIELDS
  // ==========================================
  if ((!username && !email) || !password) {
    throw new apiError(400, "Username/email and password are required");
  }

  // ==========================================
  // STEP 3: FIND USER BY USERNAME OR EMAIL
  // ==========================================
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new apiError(404, "User does not exist");
  }

  // ==========================================
  // STEP 4: VERIFY PASSWORD USING INSTANCE METHOD
  // ==========================================
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new apiError(401, "Invalid Credentials");
  }

  // ==========================================
  // STEP 5: GENERATE ACCESS & REFRESH TOKENS
  // ==========================================
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  // ==========================================
  // STEP 6: GET USER WITHOUT SENSITIVE FIELDS
  // ==========================================
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // ==========================================
  // STEP 7: SET COOKIE OPTIONS (SECURE)
  // ==========================================
  const options = {
    httpOnly: true, // Prevents XSS attacks - JS cannot access cookie
    secure: true, // Only send over HTTPS
  };

  // ==========================================
  // STEP 8: SEND RESPONSE WITH COOKIES AND DATA
  // ==========================================
  return res
    .status(200)
    .cookie("accessToken", accessToken, options) // Set access token cookie
    .cookie("refreshToken", refreshToken, options) // Set refresh token cookie
    .json(
      new apiResponse(200, {
        user: loggedInUser,
        accessToken, // Also send in body for mobile apps
        refreshToken, // Also send in body for mobile apps
        message: "User logged In Successfully",
      })
    );

  // ==========================================
  // COMPLETE LOGIN FLOW SUMMARY:
  // ==========================================
  /*
  🔐 REQUEST → Controller receives credentials
  
  1️⃣ Client sends: { email: "user@example.com", password: "123456" }
  
  2️⃣ Database query: Find user by email/username
  
  3️⃣ Password verification: 
     - bcrypt.compare(plainPassword, hashedPassword)
     - Returns true/false
  
  4️⃣ Token Generation:
     - generateAccessToken(): JWT with user data, expires 1d
     - generateRefreshToken(): JWT with only userId, expires 10d
  
  5️⃣ Database Update:
     - Store refreshToken in user document
  
  6️⃣ Response:
     - Set HTTP-only cookies with both tokens
     - Send user data + tokens in body
  
  🎯 FINAL: User is authenticated, tokens stored in cookies + DB
  */
});

const logoutUser = asyncHandler(async (req, res) => {
  // ==========================================
  // STEP 1: REMOVE REFRESH TOKEN FROM DATABASE
  // ==========================================
  await User.findByIdAndUpdate(
    req.user._id, // User ID from verifyJWT middleware
    {
      $set: {
        refreshToken: undefined, // Clear refresh token from DB
      },
    },
    {
      new: true, // Return updated document
    }
  );

  // ==========================================
  // STEP 2: SET COOKIE OPTIONS FOR CLEARING
  // ==========================================
  const options = {
    httpOnly: true,
    secure: true,
  };

  // ==========================================
  // STEP 3: CLEAR COOKIES AND SEND RESPONSE
  // ==========================================
  res
    .status(200)
    .clearCookie("accessToken", options) // Remove access token cookie
    .clearCookie("refreshToken", options) // Remove refresh token cookie
    .json(new apiResponse(200, "User logged out successfully"));

  // ==========================================
  // COMPLETE LOGOUT FLOW SUMMARY:
  // ==========================================
  /*
  🚪 REQUEST → Protected route → verifyJWT middleware runs first
  
  1️⃣ verifyJWT:
     - Extracts token from cookie/header
     - Verifies token with ACCESS_TOKEN_SECRET
     - Finds user by ID from decoded token
     - Attaches req.user = user
     - Calls next()
  
  2️⃣ logoutUser:
     - Gets req.user._id from middleware
     - Updates user document: refreshToken = undefined
     - Clears both token cookies
  
  🎯 FINAL: User logged out, tokens invalid, can't access protected routes
  */
});

const refresshAccessToken = asyncHandler(async (req, res) => {
  try {
    // ==========================================
    // STEP 1: GET REFRESH TOKEN FROM COOKIE OR BODY
    // ==========================================
    const incomingRefreshToken =
      req.cookies?.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new apiError(401, "Unauthorized Request");
    }

    // ==========================================
    // STEP 2: VERIFY REFRESH TOKEN
    // ==========================================
    // FIX BUG: Should use REFRESH_TOKEN_SECRET, not ACCESS_TOKEN_SECRET
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET // 🔴 FIXED: Was ACCESS_TOKEN_SECRET
    );

    // ==========================================
    // STEP 3: FIND USER FROM DECODED TOKEN
    // ==========================================
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new apiError(401, "Invalid Refresh Token");
    }

    // ==========================================
    // STEP 4: VERIFY TOKEN MATCHES DATABASE
    // ==========================================
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new apiError(401, "Refresh Token is expired or used");
    }

    // ==========================================
    // STEP 5: GENERATE NEW TOKENS
    // ==========================================
    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    // ==========================================
    // STEP 6: SET COOKIE OPTIONS
    // ==========================================
    const options = {
      httpOnly: true,
      secure: true,
    };

    // ==========================================
    // STEP 7: SEND NEW TOKENS IN COOKIES AND BODY
    // ==========================================
    return res
      .status(200)
      .cookie("accessToken", accessToken, options) // FIXED: was "accesshToken"
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new apiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access Token Refreshed"
        )
      );
  } catch (error) {
    throw new apiError(401, error?.message || "Invalid Refresh Token");
  }

  // ==========================================
  // COMPLETE REFRESH TOKEN FLOW SUMMARY:
  // ==========================================
  /*
  🔄 REQUEST → Client sends expired access token + valid refresh token
  
  1️⃣ Client detects 401 "Token expired"
  
  2️⃣ Client calls /refresh-token with refreshToken (cookie or body)
  
  3️⃣ Server verifies refreshToken using REFRESH_TOKEN_SECRET
  
  4️⃣ Server checks refreshToken matches DB record
  
  5️⃣ Server generates NEW accessToken and NEW refreshToken (rotation)
  
  6️⃣ Server updates DB with new refreshToken
  
  7️⃣ Server sends new tokens in cookies + response body
  
  🎯 FINAL: Client gets new access token, continues session without re-login
  
  */
});

export { registerUser, loginUser, logoutUser, refresshAccessToken };
