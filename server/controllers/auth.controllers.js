import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import genToken from "../utils/token.js";
import ENV from "../config/env.js";
import { sendOTPEmail } from "../utils/mail.js";
import genOtpToken from "../utils/otpToken.js";
import jwt from "jsonwebtoken";


export const signUp = async (req, res) => {
  try {
    const { fullName, email, password, mobile, role, countryCode } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    if (mobile.length < 10) {
      return res
        .status(400)
        .json({ message: "Mobile number must be at least 10 digits long" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      mobile,
      role,
      countryCode,
    });
    await newUser.save();

    const token = genToken(newUser._id, newUser.role);

    res.cookie("token", token, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userToReturn = newUser.toObject();
    delete userToReturn.password;
    delete userToReturn.otp;
    delete userToReturn.isOtpVerified;
    delete userToReturn.otpExpiry;
    delete userToReturn.otpRequests;
    delete userToReturn.otpRequestsResetTime;

    res
      .status(201)
      .json({ user: userToReturn, message: "User registered successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = genToken(user._id, user.role);
    res.cookie("token", token, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userToReturn = user.toObject();
    delete userToReturn.password;
    delete userToReturn.otp;
    delete userToReturn.isOtpVerified;
    delete userToReturn.otpExpiry;
    delete userToReturn.otpRequests;
    delete userToReturn.otpRequestsResetTime;

    res.status(200).json({ user: userToReturn, message: "Signed in successfully" });
  } catch (error) {
    console.error("SignIn error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const signOut = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(200).json({ message: "Signed out successfully" });
  } catch (error) {
    console.error("SignOut error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const OTP_EXPIRY_MS = 15 * 60 * 1000;
const OTP_REQUEST_WINDOW_MS = 60 * 60 * 1000;
const MAX_OTP_REQUESTS = 5;

export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select("+otp +isOtpVerified +otpExpiry +otpRequests +otpRequestsResetTime");

    if (!user) {
      return res.status(400).json({
        message: "User with this email does not exist",
        result: false,
      });
    }

    // OTP already verified but session valid
    if (user.isOtpVerified) {
      try {
        jwt.verify(req.cookies.otpToken, ENV.JWT_SECRET);
        return res.status(400).json({
          code: "OTP_ALREADY_VERIFIED",
          message: "OTP already verified",
          result: true,
        });
      } catch {
        res.clearCookie("otpToken");
        user.isOtpVerified = false;
        await user.save();
      }
    }

    // Active OTP exists
    if (user.otpExpiry && Date.now() < user.otpExpiry.getTime()) {
      return res.status(409).json({
        code: "OTP_ALREADY_EXISTS",
        message: "An active OTP already exists",
        result: true,
        otpExpiry: user.otpExpiry,
      });
    }

    // Reset OTP request window
    if (
      !user.otpRequestsResetTime ||
      Date.now() > user.otpRequestsResetTime.getTime()
    ) {
      user.otpRequests = 0;
      user.otpRequestsResetTime = new Date(
        Date.now() + OTP_REQUEST_WINDOW_MS
      );
    }

    user.otpRequests += 1;
    if (user.otpRequests > MAX_OTP_REQUESTS) {
      return res.status(429).json({
        message: "Too many OTP requests. Please try again later.",
        result: false,
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + OTP_EXPIRY_MS);
    await user.save();

    await sendOTPEmail(email, otp);

    res.status(200).json({
      message: "OTP sent successfully",
      otpExpiry: user.otpExpiry,
      result: true,
    });
  } catch (error) {
    console.error("SendOTP error:", error);
    res.status(500).json({ message: "Internal server error", result: false });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select("+otp +isOtpVerified +otpExpiry +otpRequests +otpRequestsResetTime");

    if (!user) {
      return res.status(400).json({
        message: "User with this email does not exist",
        result: false,
      });
    }

    if (user.isOtpVerified) {
      try {
        jwt.verify(req.cookies.otpToken, ENV.JWT_SECRET);
        return res.status(400).json({
          code: "OTP_ALREADY_VERIFIED",
          message: "OTP already verified",
          result: true,
        });
      } catch {
        res.clearCookie("otpToken");
        user.isOtpVerified = false;
        await user.save();
      }
    }

    // Reset window
    if (
      !user.otpRequestsResetTime ||
      Date.now() > user.otpRequestsResetTime.getTime()
    ) {
      user.otpRequests = 0;
      user.otpRequestsResetTime = new Date(
        Date.now() + OTP_REQUEST_WINDOW_MS
      );
    }

    user.otpRequests += 1;
    if (user.otpRequests > MAX_OTP_REQUESTS) {
      return res.status(429).json({
        message: "Too many OTP requests. Please try again later.",
        result: false,
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + OTP_EXPIRY_MS);
    await user.save();

    await sendOTPEmail(email, otp);

    res.status(200).json({
      message: "OTP resent successfully",
      otpExpiry: user.otpExpiry,
      result: true,
    });
  } catch (error) {
    console.error("ResendOTP error:", error);
    res.status(500).json({ message: "Internal server error", result: false });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email }).select("+otp");

    if (!user) {
      return res.status(400).json({
        message: "User with this email does not exist",
        result: false,
      });
    }

    if (user.isOtpVerified) {
      try {
        jwt.verify(req.cookies.otpToken, ENV.JWT_SECRET);
        return res.status(400).json({
          code: "OTP_ALREADY_VERIFIED",
          message: "OTP already verified",
          result: true,
        });
      } catch {
        res.clearCookie("otpToken");
        user.isOtpVerified = false;
        await user.save();
      }
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({
        message: "No OTP requested",
        result: false,
      });
    }

    if (Date.now() > user.otpExpiry.getTime()) {
      user.otp = null;
      user.otpExpiry = null;
      await user.save();

      return res.status(400).json({
        message: "OTP has expired",
        result: false,
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
        result: false,
      });
    }

    user.isOtpVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const otpToken = genOtpToken(user._id);

    res.cookie("otpToken", otpToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: OTP_EXPIRY_MS,
    });

    res.status(200).json({
      message: "OTP verified successfully",
      result: true,
    });
  } catch (error) {
    console.error("VerifyOTP error:", error);
    res.status(500).json({ message: "Internal server error", result: false });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        message: "User with this email does not exist",
        result: false,
      });
    }

    if (!user.isOtpVerified) {
      return res.status(400).json({
        message: "OTP verification required",
        result: false,
      });
    }

    try {
      const decoded = jwt.verify(req.cookies.otpToken, ENV.JWT_SECRET);
      if (decoded.userId !== user._id.toString()) {
        return res.status(401).json({
          message: "Unauthorized",
          result: false,
        });
      }
    } catch {
      return res.status(401).json({
        message: "OTP session expired. Please verify again.",
        result: false,
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.isOtpVerified = false;
    await user.save();

    res.clearCookie("otpToken");

    res.status(200).json({
      message: "Password reset successfully",
      result: true,
    });
  } catch (error) {
    console.error("ResetPassword error:", error);
    res.status(500).json({ message: "Internal server error", result: false });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { email, fullName, mobile, role } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email required",
        result: false,
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        fullName,
        email,
        mobile: mobile || "",
        role: role || "user",
        password: hashedPassword,
      });
    }

    const token = genToken(user._id, user.role);

    res.cookie("token", token, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      user,
      message: "Signed in successfully",
      result: true,
    });
  } catch (error) {
    console.error("GoogleAuth error:", error);
    res.status(500).json({ message: "Internal server error", result: false });
  }
};
