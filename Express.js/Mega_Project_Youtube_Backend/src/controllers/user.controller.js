// src/controllers/user.controller.js - CLEAN VERSION WITH ALGORITHM COMMENTS
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // ALGORITHM: User Registration Flow

  // Step 1: Extract user data from request body
  const { fullName, email, username, password } = req.body;

  // Step 2: Validate that all required fields are present and not empty
  const fields = { fullName, email, username, password };
  const emptyField = Object.entries(fields).find(
    ([key, value]) => !value || value.trim() === ""
  );
  if (emptyField) {
    const [field] = emptyField;
    throw new apiError(400, `${field} is required`);
  }

  // Step 3: Check if user already exists in database (by username or email)
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new apiError(409, "Username or email already exists");
  }

  // Step 4: Get file paths from uploaded files (avatar and cover image)
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  // Step 5: Validate that avatar file is uploaded (avatar is required)
  if (!avatarLocalPath) {
    throw new apiError(400, "Avatar file is required");
  }

  // Step 6: Upload avatar image to Cloudinary storage service
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  // Step 7: Upload cover image to Cloudinary (optional - upload if exists)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // Step 8: Verify avatar uploaded successfully to Cloudinary
  if (!avatar) {
    throw new apiError(400, "Avatar file is required");
  }

  // Step 9: Create new user document in MongoDB database
  const user = await User.create({
    fullName,
    avatar: avatar.url, // Store Cloudinary URL for avatar
    coverImage: coverImage?.url || "", // Store Cloudinary URL for cover image (empty if none)
    email,
    password, // Password will be hashed by pre-save hook in User model
    username: username.toLowerCase(), // Store username in lowercase for consistency
  });

  // Step 10: Retrieve created user from database, excluding sensitive fields
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken" // Don't send password or refresh token in response
  );

  // Step 11: Verify user was created successfully in database
  if (!createdUser) {
    throw new apiError(500, "Something went wrong while registering the user");
  }

  // Step 12: Return success response with created user data (201 Created status)
  return res
    .status(201)
    .json(new apiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // Algorithm
  /* 
      1 ==> fetch data from req.body
      2 ==> user or email
      3 ==> find the user
      4 ==> password check
      5 ==> generate access and refresh token
      6 ==> send secure cookies
    */

  const { username, email, password } = req.body();
  if (!(username || email)) {
    throw new apiError(400, "username or password is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { password }],
  });

  if (!user) {
    throw new apiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new apiError(401, "Invalid Credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(200, {
        user: loggedInUser,
        accessToken,
        refreshToken,
        message: "User logged In Successfully",
      })
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, "User logged out successfully"));
});
export { registerUser, loginUser, logoutUser };

// ALGORITHM SUMMARY:
// 1. Extract user data from request
// 2. Validate all required fields are present
// 3. Check for duplicate username/email in database
// 4. Get uploaded file paths
// 5. Validate avatar file exists
// 6. Upload avatar to Cloudinary
// 7. Upload cover image to Cloudinary (optional)
// 8. Verify avatar upload succeeded
// 9. Create user in database (password auto-hashed by pre-save hook)
// 10. Retrieve user without sensitive data
// 11. Verify user creation
// 12. Return success response with user data
