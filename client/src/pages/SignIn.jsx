import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { MdLightMode, MdDarkMode } from "react-icons/md";
import axios from "axios";
import { toast } from "react-toastify";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase.js";
import { useDispatch, useSelector } from "react-redux";
import {userSliceActions} from "../redux/slices/userSlice.js";
import { toggleTheme } from "../redux/slices/themeSlice.js";

const SignIn = () => {
  const navigate = useNavigate();
  const apiURL = import.meta.env.VITE_API_URL;
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time validation
    const newErrors = { ...errors };

    if (name === "email") {
      if (!value.trim()) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        newErrors.email = "Email is invalid";
      } else {
        delete newErrors.email;
      }
    }

    if (name === "password") {
      if (!value) {
        newErrors.password = "Password is required";
      } else {
        delete newErrors.password;
      }
    }

    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await axios.post(`${apiURL}/api/auth/signin`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      dispatch(userSliceActions.setUserData(response.data.user));
      toast.success("Signed in successfully!");
      navigate("/");
    } catch (error) {
      console.error("Signin error:", error);
      const message =
        error?.response?.data?.message || "Sign in failed. Please try again.";
      toast.error(message);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    try {
      const response = await axios.post(
        `${apiURL}/api/auth/google-auth`,
        {
          fullName: result.user.displayName,
          email: result.user.email,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      dispatch(userSliceActions.setUserData(response.data.user));
      toast.success("Signed in with Google successfully!");
      navigate("/");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Google sign in failed. Please try again."
      );
      console.error("Google SignIn error:", error);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-x-hidden transition-colors duration-300 ${
      mode === "dark"
        ? "bg-linear-to-br from-gray-900 via-gray-800 to-gray-900"
        : "bg-linear-to-br from-green-50 via-emerald-50 to-teal-50"
    }`}>
      {/* Theme Toggle Button */}
      <button
        onClick={() => dispatch(toggleTheme())}
        className="absolute top-6 right-6 p-2 rounded-full transition-all duration-300 bg-transparent hover:opacity-80"
        title={mode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {mode === "dark" ? (
          <MdLightMode size={24} className="text-yellow-400" />
        ) : (
          <MdDarkMode size={24} className="text-gray-700" />
        )}
      </button>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-2 transition-colors duration-300 ${
            mode === "dark" ? "text-green-400" : "text-green-800"
          }`}>
            Quick Eats
          </h1>
          <p className={`text-sm sm:text-base px-4 transition-colors duration-300 ${
            mode === "dark" ? "text-green-300" : "text-green-600"
          }`}>
            Welcome back! Please sign in to continue
          </p>
        </div>

        {/* Form Container */}
        <div className={`rounded-2xl shadow-2xl p-6 sm:p-8 transition-colors duration-300 ${
          mode === "dark"
            ? "bg-gray-800 text-white"
            : "bg-white"
        }`}>
          <h2 className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center transition-colors duration-300 ${
            mode === "dark" ? "text-green-400" : "text-green-800"
          }`}>
            Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Email Field */}
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              }`}>
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 focus:outline-none transition ${
                    errors.email
                      ? "border-red-500 focus:border-red-500"
                      : mode === "dark"
                      ? "border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-green-400"
                      : "border-gray-200 focus:ring-2 focus:ring-green-500"
                  }`}
                  placeholder="john.doe@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              }`}>
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  placeholder="Enter your password"
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 rounded-lg border-2 focus:outline-none transition ${
                    errors.password
                      ? "border-red-500 focus:border-red-500"
                      : mode === "dark"
                      ? "border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-green-400"
                      : "border-gray-200 focus:ring-2 focus:ring-green-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none bg-transparent transition-colors duration-300 ${
                    mode === "dark"
                      ? "text-gray-500 hover:text-gray-400"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                to="/reset-password"
                className={`text-xs sm:text-sm hover:underline transition ${
                  mode === "dark"
                    ? "text-green-400 hover:text-green-300"
                    : "text-green-600 hover:text-green-700"
                }`}
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-linear-to-r from-green-600 to-emerald-600 text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Sign In
            </button>

            {/* Google Sign In */}
            <button
              type="button"
              className={`w-full border-2 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base bg-transparent font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                mode === "dark"
                  ? "border-gray-600 text-white hover:border-green-400 hover:bg-gray-700"
                  : "border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50"
              }`}
              onClick={handleGoogleSignIn}
            >
              <FcGoogle className="text-xl" />
              Sign in with Google
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5 sm:my-6">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full transition-colors duration-300 ${
                mode === "dark" ? "border-t border-gray-600" : "border-t border-gray-300"
              }`}></div>
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className={`px-2 transition-colors duration-300 ${
                mode === "dark"
                  ? "bg-gray-800 text-gray-400"
                  : "bg-white text-gray-500"
              }`}>or</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className={`text-sm sm:text-base transition-colors duration-300 ${
              mode === "dark" ? "text-gray-400" : "text-gray-600"
            }`}>
              Don't have an account?{" "}
              <Link
                to="/signup"
                className={`font-semibold hover:underline transition ${
                  mode === "dark"
                    ? "text-green-400 hover:text-green-300"
                    : "text-green-600 hover:text-green-700"
                }`}
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={`mt-4 sm:mt-6 text-center text-xs sm:text-sm px-4 transition-colors duration-300 ${
          mode === "dark" ? "text-gray-500" : "text-gray-500"
        }`}>
          <p>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
