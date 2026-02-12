// src/models/user.model.js
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    avatar: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      default: "../../public/coverImage.png"
    },
    refreshToken: {
      type: String,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
  },
  { timestamps: true }
);

// ==========================================
// PRE-SAVE HOOK - MONGOOSE v9 COMPATIBLE
// ==========================================
userSchema.pre("save", async function () {
  // 1. Only hash if password is modified
  if (!this.isModified("password")) return;

  try {
    // 2. Hash the password
    this.password = await bcrypt.hash(this.password, 10);
    // No next() or next.next() needed in Mongoose 9!
  } catch (error) {
    // 3. Throw errors to prevent saving if hashing fails
    throw error;
  }
});


// ==========================================
// Instance method: compare password
// ==========================================
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// ==========================================
// GENERATE ACCESS TOKEN
// ==========================================
userSchema.methods.generateAccessToken = function () {
  // IMPORTANT: process.env.ACCESS_TOKEN_SECRET is a SECRET KEY, NOT a token
  // It's a string like "s7f9a2k1h5g8d3j6" stored in .env file
  // We use this secret to SIGN/CREATE a new token, NOT to pass an existing token
  
  return jwt.sign(
    {  // PAYLOAD: Data we want to store INSIDE the token
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,  // SECRET KEY for signing (NOT a token!)
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d",  // Token expiry
    }
  );
  // OUTPUT: Brand new JWT token string: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
};

// ==========================================
// GENERATE REFRESH TOKEN
// ==========================================
userSchema.methods.generateRefreshToken = function () {
  // IMPORTANT: This uses a DIFFERENT secret key from access token
  // process.env.REFRESH_TOKEN_SECRET is a DIFFERENT string like "k9m3n7b2v5c1x8z4"
  // Never use the same secret for both tokens!
  
  return jwt.sign(
    {  // Minimal payload - only user ID
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,  // DIFFERENT secret key for signing
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "10d",  // Longer expiry
    }
  );
  // OUTPUT: Brand new refresh token string
};

// ==========================================
// COMPLETE FLOW VISUALIZATION
// ==========================================
/*
SECRET KEYS (stored in .env, NEVER exposed to client):
ACCESS_TOKEN_SECRET = "randomString123"     ← Used to SIGN access tokens
REFRESH_TOKEN_SECRET = "differentString456" ← Used to SIGN refresh tokens

TOKENS (created by jwt.sign, sent to client):
accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." ← RESULT of signing
refreshToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." ← RESULT of signing

SECRET (input) → jwt.sign() → TOKEN (output)
NOT: TOKEN (input) → jwt.sign() → Another token

COMMON MISCONCEPTION:
 "We're giving jwt.sign() a token to create another token"
 "We're giving jwt.sign() a SECRET KEY to SIGN/CREATE a brand new token"
*/

// ==========================================
// Export the User model
// ==========================================
export const User = mongoose.model("User", userSchema);
