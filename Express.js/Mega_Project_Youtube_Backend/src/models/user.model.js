// src/models/user.model.js - FINAL WORKING VERSION
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
// Instance method: generate access token
// ==========================================
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d",
    }
  );
};

// ==========================================
// Instance method: generate refresh token
// ==========================================
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "10d",
    }
  );
};

// ==========================================
// Export the User model
// ==========================================
export const User = mongoose.model("User", userSchema);
