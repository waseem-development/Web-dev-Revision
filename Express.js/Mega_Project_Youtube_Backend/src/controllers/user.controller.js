// src/controllers/user.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // Get user details from frontend
  // validation: not empty
  // Check if user exists (username and email)
  // Check for images if they exist. Check Avatar
  // Upload them to cloudinary
  // Create user object - create entry in DB
  // Remove password and refresh token fields from response
  // Check for user creation
  // Return response

  const { fullName, email, username, password } = req.body;
  console.log(`fullName: ${fullName}`);
  console.log(`email: ${email}`);
  console.log(`username: ${username}`);
  console.log(`password: ${password}`);

  // Validate required fields
  const fields = { fullName, email, username, password };
  const emptyField = Object.entries(fields).find(
    ([key, value]) => !value || value.trim() === ""
  );
  if (emptyField) {
    const [field] = emptyField;
    throw new apiError(400, `${field} is required`);
  }

  // Check if username or email already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new apiError(409, "Username or email already exists");
  }

  // Check for uploaded avatar and cover images
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new apiError(400, "Avatar file is required");
  }

  // Upload images to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new apiError(400, "Avatar file is required");
  }

  // Create user in DB
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // Remove sensitive fields from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new apiError(500, "Something went wrong while registering the user");
  }

  // Return success response
  return res
    .status(201)
    .json(new apiResponse(201, createdUser, "User registered successfully"));
});

export { registerUser };
