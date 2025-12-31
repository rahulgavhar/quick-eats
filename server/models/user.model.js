import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    /* =========================
       BASIC PROFILE
    ========================== */
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      minlength: 8,
      select: false, // prevent accidental exposure
    },

    countryCode: {
      type: String,
      trim: true,
    },

    mobile: {
      type: String,
      trim: true,
      index: true,
    },

    role: {
      type: String,
      enum: ["user", "owner", "deliveryBoy"],
      default: "user",
      required: true,
      index: true,
    },

    purchases: {
      type: Number,
      default: 0,
    },

    orders: [
      {
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Order",
        },
      },
    ],

    /* =========================
       OTP AUTH / VERIFICATION
    ========================== */
    otp: {
      type: String,
      default: null,
      select: false, // OTP should NEVER be returned
    },

    isOtpVerified: {
      type: Boolean,
      default: false,
    },

    otpExpiry: {
      type: Date,
      default: null,
    },

    otpRequests: {
      type: Number,
      default: 0,
    },

    otpRequestsResetTime: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
