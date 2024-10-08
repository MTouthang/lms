import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: [5, "Name must be at least 5 characters"],
      lowercase: true,
      trim: true, // Removes unnecessary spaces
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please fill in a valid email address",
      ], // Matches email against regex
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Will not select password upon looking up a document
    },
    subscription: {
      id: String,
      status: String,
    },
    avatar: {
      public_id: {
        type: String,
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
      },
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
  },

  {
    timestamps: true,
  }
);

// Hashes password before saving to the database - using the schema pre method
userSchema.pre("save", async function (next) {
  // If password is not modified then do not hash it
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

userSchema.methods.generateJWTToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role, subscription: this.subscription },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRY,
    }
  );
};

/**
 * Generates a password reset token, hashes it, and stores the hash in the user's schema.
 * Also sets an expiration time for the token.
 *
 * @async
 * @method generatePasswordResetToken
 * @returns {Promise<string>} The plain reset token before hashing, to be sent to the user.
 */
userSchema.methods.generatePasswordResetToken = async function () {
  // create random token using node built-in crypto
  const resetToken = crypto.randomBytes(20).toString("hex");

  // again hash the token with crypto
  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // add forgotPassword expiry date
  this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

const User = model("User", userSchema);

export default User;
