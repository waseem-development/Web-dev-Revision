// src/models/user.model.js
import mongoose from "mongoose";
import jwt from "jsonwebtoken"; // JWT = JSON Web Token for authentication
import bcrypt from "bcrypt"; // bcrypt = secure password hashing library
const { Schema } = mongoose;
// ================================================================
// NOTES (Industry / Interview perspective):
//
// JWT (jsonwebtoken):
// - Standard for user authentication & API tokens.
// - Stateless: No server-side session storage needed; all info in token.
// - Structure: Header, Payload (claims), Signature.
// - Sent in Authorization header as Bearer token: `Authorization: Bearer <token>`
// - Common interview points:
//     * JWT vs session cookies: JWT is stateless, cookies often server-stored
//     * Secure usage: Always use strong secrets, set expiration, consider refresh tokens
//     * Pros: Scales easily, no server session store needed
//     * Cons: Cannot easily revoke without extra mechanisms
//
// bcrypt:
// - Library to hash passwords before storing in DB
// - Automatically adds salt to protect against rainbow table attacks
// - Methods:
//     * bcrypt.hash(plaintext, saltRounds) → generates hash
//     * bcrypt.compare(plaintext, hash) → checks password
// - Common interview points:
//     * Never store plaintext passwords
//     * Salt rounds increase security but cost CPU time
//     * Alternatives: bcryptjs, scrypt, argon2 (argon2 is currently considered most secure)
//
// Mongoose Model Concepts:
// - pre("save") middleware: run logic before saving document (e.g., hashing passwords)
// - instance methods: add functions to model instances, e.g., checking password, generating JWT
// ================================================================

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true, // DB enforces uniqueness
      required: [true, "Username is required"], // validation
      lowercase: true, // normalize input: Waseem → waseem
      trim: true, // remove extra spaces
      index: true, // add DB index for faster search & queries
    },
    email: {
      type: String,
      required: [true, "email is required"],
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      index: true, // indexing for fast searches
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
      // Note: do NOT set minlength here if hashing in pre-save, enforce in validation/controller
    },
    avatar: {
      type: String,
    },
    coverImage: {
      type: String,
      default: "../../public/coverImage.png", // default cover image
    },
    refreshToken: {
      type: String,
    },
    watchHistory: {
      type: Schema.Types.ObjectId,
      ref: "Video", // reference Video collection for population
    },
  },
  { timestamps: true } // Mongoose automatically adds createdAt & updatedAt
);

// ==========================================
// Pre-save middleware: hash password before saving
// ==========================================
userSchema.pre("save", async function (next) {
  // 'this' = the document being saved
  // Only hash if password field is new or modified
  if (!this.isModified("password")) return next();

  try {
    // Use bcrypt.hash with explicit await
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// ==========================================
// Instance method: compare plaintext password with hashed
// ==========================================
userSchema.methods.isPasswordCorrect = async function (password) {
  // 'this.password' = hashed password from DB
  return await bcrypt.compare(password, this.password);
};

// ==========================================
// Instance method: generate access token (JWT)
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
// Instance method: generate refresh token (JWT)
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
const User = mongoose.model("User", userSchema);
export { User };
/*
INTERVIEW PERSPECTIVE:

1. Why use bcrypt instead of plain SHA256/MD5?
   - bcrypt is slow & salted → prevents brute-force/rainbow table attacks
   - MD5/SHA256 are fast → easier to brute force
   - Industry standard for passwords

2. Why pre("save") middleware instead of hashing in controller?
   - Centralized hashing logic
   - Prevents forgetting to hash in some controller
   - Keeps controllers clean

3. Why instance methods like isPasswordCorrect?
   - Encapsulate behavior in the model (OOP principle)
   - Cleaner, easier to maintain

4. JWT considerations:
   - Always sign with secret
   - Expire tokens to limit risk
   - Do NOT store sensitive info (like password)
   - Use refresh tokens for longer sessions
   - Verify tokens in middleware

5. Next() in pre-save:
   - Calls next middleware or continues saving
   - If error occurs, pass error via next(err)
*/
