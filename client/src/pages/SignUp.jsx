import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Briefcase, Bike, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { MdLightMode, MdDarkMode } from "react-icons/md";
import axios from "axios";
import { toast } from "react-toastify";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase.js";
import { useDispatch, useSelector } from "react-redux";
import { userSliceActions } from "../redux/slices/userSlice.js";
import { toggleTheme } from "../redux/slices/themeSlice.js";

const SignUp = () => {
  const navigate = useNavigate();
  const apiURL = import.meta.env.VITE_API_URL;
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    fullName: "",
    email: "",
    countryCode: "+91",
    mobile: "",
    role: "user",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    // Update form data
    const updatedFormData = { ...formData, [name]: fieldValue };

    // Update fullName when firstName or lastName changes
    if (name === "firstName" || name === "lastName") {
      const firstName = name === "firstName" ? fieldValue : formData.firstName;
      const lastName = name === "lastName" ? fieldValue : formData.lastName;
      updatedFormData.fullName = `${firstName} ${lastName}`.trim();
    }

    setFormData(updatedFormData);

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
      } else if (value.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      } else {
        delete newErrors.password;
      }

      // Also validate confirm password if it has a value
      if (formData.confirmPassword) {
        if (value !== formData.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        } else {
          delete newErrors.confirmPassword;
        }
      }
    }

    if (name === "confirmPassword") {
      if (!value) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== value) {
        newErrors.confirmPassword = "Passwords do not match";
      } else {
        delete newErrors.confirmPassword;
      }
    }

    if (name === "mobile") {
      if (value && !/^\d*$/.test(value)) {
        newErrors.mobile = "Mobile number must contain only digits";
      } else if (value && (value.length < 10 || value.length > 15)) {
        newErrors.mobile = "Mobile number must be between 10-15 digits";
      } else {
        delete newErrors.mobile;
      }
    }

    if (name === "acceptTerms") {
      if (!fieldValue) {
        newErrors.acceptTerms = "You must accept the Terms & Conditions";
      } else {
        delete newErrors.acceptTerms;
      }
    }

    setErrors(newErrors);
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (formData.mobile && !/^\d+$/.test(formData.mobile)) {
      newErrors.mobile = "Mobile number must contain only digits";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "You must accept the Terms & Conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Prepare data for submission - join countryCode and mobile
    const submissionData = {
      ...formData,
    };

    // Remove confirmPassword and countryCode as they're not needed in backend
    delete submissionData.confirmPassword;

    // Handle signup logic here
    try {
      const response = await axios.post(
        `${apiURL}/api/auth/signup`,
        submissionData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      dispatch(userSliceActions.setUserData(response.data.user));
      toast.success("Signup successful!");
      navigate("/");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Signup failed. Please try again."
      );
      console.error("Signup error:", error);
    }
  };

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    try {
      const response = await axios.post(
        `${apiURL}/api/auth/google-auth`,
        {
          fullName: result.user.displayName,
          email: result.user.email,
          mobile: result.user.phoneNumber || "",
          role: "user",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      dispatch(userSliceActions.setUserData(response.data.user));
      toast.success("Signed up with Google successfully!");
      navigate("/");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Google sign up failed. Please try again."
      );
      console.error("Google SignUp error:", error);
    }
  };

  const roles = [
    { value: "user", label: "User", icon: User, description: "Order food" },
    {
      value: "owner",
      label: "Owner",
      icon: Briefcase,
      description: "Manage restaurant",
    },
    {
      value: "deliveryboy",
      label: "Delivery Boy",
      icon: Bike,
      description: "Deliver orders",
    },
  ];

  const countryCodes = [
    { code: "+93", country: "Afghanistan", flag: "🇦🇫" },
    { code: "+355", country: "Albania", flag: "🇦🇱" },
    { code: "+213", country: "Algeria", flag: "🇩🇿" },
    { code: "+376", country: "Andorra", flag: "🇦🇩" },
    { code: "+244", country: "Angola", flag: "🇦🇴" },
    { code: "+54", country: "Argentina", flag: "🇦🇷" },
    { code: "+374", country: "Armenia", flag: "🇦🇲" },
    { code: "+61", country: "Australia", flag: "🇦🇺" },
    { code: "+43", country: "Austria", flag: "🇦🇹" },
    { code: "+994", country: "Azerbaijan", flag: "🇦🇿" },
    { code: "+973", country: "Bahrain", flag: "🇧🇭" },
    { code: "+880", country: "Bangladesh", flag: "🇧🇩" },
    { code: "+375", country: "Belarus", flag: "🇧🇾" },
    { code: "+32", country: "Belgium", flag: "🇧🇪" },
    { code: "+501", country: "Belize", flag: "🇧🇿" },
    { code: "+229", country: "Benin", flag: "🇧🇯" },
    { code: "+975", country: "Bhutan", flag: "🇧🇹" },
    { code: "+591", country: "Bolivia", flag: "🇧🇴" },
    { code: "+387", country: "Bosnia", flag: "🇧🇦" },
    { code: "+267", country: "Botswana", flag: "🇧🇼" },
    { code: "+55", country: "Brazil", flag: "🇧🇷" },
    { code: "+673", country: "Brunei", flag: "🇧🇳" },
    { code: "+359", country: "Bulgaria", flag: "🇧🇬" },
    { code: "+226", country: "Burkina Faso", flag: "🇧🇫" },
    { code: "+257", country: "Burundi", flag: "🇧🇮" },
    { code: "+855", country: "Cambodia", flag: "🇰🇭" },
    { code: "+237", country: "Cameroon", flag: "🇨🇲" },
    { code: "+1", country: "Canada", flag: "🇨🇦" },
    { code: "+238", country: "Cape Verde", flag: "🇨🇻" },
    { code: "+56", country: "Chile", flag: "🇨🇱" },
    { code: "+86", country: "China", flag: "🇨🇳" },
    { code: "+57", country: "Colombia", flag: "🇨🇴" },
    { code: "+506", country: "Costa Rica", flag: "🇨🇷" },
    { code: "+385", country: "Croatia", flag: "🇭🇷" },
    { code: "+53", country: "Cuba", flag: "🇨🇺" },
    { code: "+357", country: "Cyprus", flag: "🇨🇾" },
    { code: "+420", country: "Czech Republic", flag: "🇨🇿" },
    { code: "+45", country: "Denmark", flag: "🇩🇰" },
    { code: "+253", country: "Djibouti", flag: "🇩🇯" },
    { code: "+593", country: "Ecuador", flag: "🇪🇨" },
    { code: "+20", country: "Egypt", flag: "🇪🇬" },
    { code: "+503", country: "El Salvador", flag: "🇸🇻" },
    { code: "+372", country: "Estonia", flag: "🇪🇪" },
    { code: "+251", country: "Ethiopia", flag: "🇪🇹" },
    { code: "+679", country: "Fiji", flag: "🇫🇯" },
    { code: "+358", country: "Finland", flag: "🇫🇮" },
    { code: "+33", country: "France", flag: "🇫🇷" },
    { code: "+995", country: "Georgia", flag: "🇬🇪" },
    { code: "+49", country: "Germany", flag: "🇩🇪" },
    { code: "+233", country: "Ghana", flag: "🇬🇭" },
    { code: "+30", country: "Greece", flag: "🇬🇷" },
    { code: "+502", country: "Guatemala", flag: "🇬🇹" },
    { code: "+224", country: "Guinea", flag: "🇬🇳" },
    { code: "+509", country: "Haiti", flag: "🇭🇹" },
    { code: "+504", country: "Honduras", flag: "🇭🇳" },
    { code: "+852", country: "Hong Kong", flag: "🇭🇰" },
    { code: "+36", country: "Hungary", flag: "🇭🇺" },
    { code: "+354", country: "Iceland", flag: "🇮🇸" },
    { code: "+91", country: "India", flag: "🇮🇳" },
    { code: "+62", country: "Indonesia", flag: "🇮🇩" },
    { code: "+98", country: "Iran", flag: "🇮🇷" },
    { code: "+964", country: "Iraq", flag: "🇮🇶" },
    { code: "+353", country: "Ireland", flag: "🇮🇪" },
    { code: "+972", country: "Israel", flag: "🇮🇱" },
    { code: "+39", country: "Italy", flag: "🇮🇹" },
    { code: "+81", country: "Japan", flag: "🇯🇵" },
    { code: "+962", country: "Jordan", flag: "🇯🇴" },
    { code: "+7", country: "Kazakhstan", flag: "🇰🇿" },
    { code: "+254", country: "Kenya", flag: "🇰🇪" },
    { code: "+965", country: "Kuwait", flag: "🇰🇼" },
    { code: "+996", country: "Kyrgyzstan", flag: "🇰🇬" },
    { code: "+856", country: "Laos", flag: "🇱🇦" },
    { code: "+371", country: "Latvia", flag: "🇱🇻" },
    { code: "+961", country: "Lebanon", flag: "🇱🇧" },
    { code: "+231", country: "Liberia", flag: "🇱🇷" },
    { code: "+218", country: "Libya", flag: "🇱🇾" },
    { code: "+370", country: "Lithuania", flag: "🇱🇹" },
    { code: "+352", country: "Luxembourg", flag: "🇱🇺" },
    { code: "+853", country: "Macau", flag: "🇲🇴" },
    { code: "+389", country: "Macedonia", flag: "🇲🇰" },
    { code: "+261", country: "Madagascar", flag: "🇲🇬" },
    { code: "+265", country: "Malawi", flag: "🇲🇼" },
    { code: "+60", country: "Malaysia", flag: "🇲🇾" },
    { code: "+960", country: "Maldives", flag: "🇲🇻" },
    { code: "+223", country: "Mali", flag: "🇲🇱" },
    { code: "+356", country: "Malta", flag: "🇲🇹" },
    { code: "+222", country: "Mauritania", flag: "🇲🇷" },
    { code: "+230", country: "Mauritius", flag: "🇲🇺" },
    { code: "+52", country: "Mexico", flag: "🇲🇽" },
    { code: "+373", country: "Moldova", flag: "🇲🇩" },
    { code: "+377", country: "Monaco", flag: "🇲🇨" },
    { code: "+976", country: "Mongolia", flag: "🇲🇳" },
    { code: "+382", country: "Montenegro", flag: "🇲🇪" },
    { code: "+212", country: "Morocco", flag: "🇲🇦" },
    { code: "+258", country: "Mozambique", flag: "🇲🇿" },
    { code: "+95", country: "Myanmar", flag: "🇲🇲" },
    { code: "+264", country: "Namibia", flag: "🇳🇦" },
    { code: "+977", country: "Nepal", flag: "🇳🇵" },
    { code: "+31", country: "Netherlands", flag: "🇳🇱" },
    { code: "+64", country: "New Zealand", flag: "🇳🇿" },
    { code: "+505", country: "Nicaragua", flag: "🇳🇮" },
    { code: "+227", country: "Niger", flag: "🇳🇪" },
    { code: "+234", country: "Nigeria", flag: "🇳🇬" },
    { code: "+47", country: "Norway", flag: "🇳🇴" },
    { code: "+968", country: "Oman", flag: "🇴🇲" },
    { code: "+92", country: "Pakistan", flag: "🇵🇰" },
    { code: "+970", country: "Palestine", flag: "🇵🇸" },
    { code: "+507", country: "Panama", flag: "🇵🇦" },
    { code: "+595", country: "Paraguay", flag: "🇵🇾" },
    { code: "+51", country: "Peru", flag: "🇵🇪" },
    { code: "+63", country: "Philippines", flag: "🇵🇭" },
    { code: "+48", country: "Poland", flag: "🇵🇱" },
    { code: "+351", country: "Portugal", flag: "🇵🇹" },
    { code: "+974", country: "Qatar", flag: "🇶🇦" },
    { code: "+40", country: "Romania", flag: "🇷🇴" },
    { code: "+7", country: "Russia", flag: "🇷🇺" },
    { code: "+250", country: "Rwanda", flag: "🇷🇼" },
    { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
    { code: "+221", country: "Senegal", flag: "🇸🇳" },
    { code: "+381", country: "Serbia", flag: "🇷🇸" },
    { code: "+65", country: "Singapore", flag: "🇸🇬" },
    { code: "+421", country: "Slovakia", flag: "🇸🇰" },
    { code: "+386", country: "Slovenia", flag: "🇸🇮" },
    { code: "+27", country: "South Africa", flag: "🇿🇦" },
    { code: "+82", country: "South Korea", flag: "🇰🇷" },
    { code: "+34", country: "Spain", flag: "🇪🇸" },
    { code: "+94", country: "Sri Lanka", flag: "🇱🇰" },
    { code: "+249", country: "Sudan", flag: "🇸🇩" },
    { code: "+46", country: "Sweden", flag: "🇸🇪" },
    { code: "+41", country: "Switzerland", flag: "🇨🇭" },
    { code: "+963", country: "Syria", flag: "🇸🇾" },
    { code: "+886", country: "Taiwan", flag: "🇹🇼" },
    { code: "+992", country: "Tajikistan", flag: "🇹🇯" },
    { code: "+255", country: "Tanzania", flag: "🇹🇿" },
    { code: "+66", country: "Thailand", flag: "🇹🇭" },
    { code: "+228", country: "Togo", flag: "🇹🇬" },
    { code: "+216", country: "Tunisia", flag: "🇹🇳" },
    { code: "+90", country: "Turkey", flag: "🇹🇷" },
    { code: "+993", country: "Turkmenistan", flag: "🇹🇲" },
    { code: "+256", country: "Uganda", flag: "🇺🇬" },
    { code: "+380", country: "Ukraine", flag: "🇺🇦" },
    { code: "+971", country: "UAE", flag: "🇦🇪" },
    { code: "+44", country: "United Kingdom", flag: "🇬🇧" },
    { code: "+1", country: "United States", flag: "🇺🇸" },
    { code: "+598", country: "Uruguay", flag: "🇺🇾" },
    { code: "+998", country: "Uzbekistan", flag: "🇺🇿" },
    { code: "+58", country: "Venezuela", flag: "🇻🇪" },
    { code: "+84", country: "Vietnam", flag: "🇻🇳" },
    { code: "+967", country: "Yemen", flag: "🇾🇪" },
    { code: "+260", country: "Zambia", flag: "🇿🇲" },
    { code: "+263", country: "Zimbabwe", flag: "🇿🇼" },
  ];

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-x-hidden transition-colors duration-300 ${
      mode === "dark"
        ? "bg-linear-to-br from-gray-900 via-gray-800 to-gray-900"
        : "bg-linear-to-br from-green-50 via-emerald-50 to-teal-50"
    }`}>
      {/* Theme Toggle Button */}
      <button
        onClick={() => dispatch(toggleTheme())}
        className="absolute top-6 right-6 p-2 rounded-full transition-all duration-300 hover:opacity-80"
        title={mode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {mode === "dark" ? (
          <MdLightMode size={24} className="text-yellow-400" />
        ) : (
          <MdDarkMode size={24} className="text-gray-700" />
        )}
      </button>
      <div className="w-full max-w-2xl">
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
            Create your account to get started
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
            Sign Up
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-2 transition-colors duration-300 ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border-2 focus:outline-none transition ${
                    errors.firstName
                      ? "border-red-500 focus:border-red-500"
                      : mode === "dark"
                      ? "border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-green-400"
                      : "border-gray-200 focus:ring-2 focus:ring-green-500"
                  }`}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-2 transition-colors duration-300 ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border-2 focus:outline-none transition ${
                    mode === "dark"
                      ? "border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-green-400"
                      : "border-gray-200 focus:ring-2 focus:ring-green-500"
                  }`}
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-2 transition-colors duration-300 ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              }`}>
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border-2 focus:outline-none transition ${
                  errors.email
                    ? "border-red-500 focus:border-red-500"
                    : mode === "dark"
                    ? "border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-green-400"
                    : "border-gray-200 focus:ring-2 focus:ring-green-500"
                }`}
                placeholder="john.doe@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Mobile with Country Code */}
            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-2 transition-colors duration-300 ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              }`}>
                Mobile Number
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  className={`w-full sm:w-auto px-2 sm:px-3 py-2.5 sm:py-3 text-xs sm:text-sm md:text-base rounded-lg border-2 focus:outline-none focus:ring-2 transition ${
                    mode === "dark"
                      ? "border-gray-600 bg-gray-700 text-white focus:ring-green-400"
                      : "border-gray-200 bg-white focus:ring-green-500"
                  }`}
                >
                  {countryCodes.map((country) => (
                    <option
                      key={country.code + country.country}
                      value={country.code}
                    >
                      {country.flag} {country.code} {country.country}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className={`flex-1 w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border-2 focus:outline-none transition ${
                    errors.mobile
                      ? "border-red-500 focus:border-red-500"
                      : mode === "dark"
                      ? "border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-green-400"
                      : "border-gray-200 focus:ring-2 focus:ring-green-500"
                  }`}
                  placeholder="1234567890"
                />
              </div>
              {errors.mobile && (
                <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-3 transition-colors duration-300 ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              }`}>
                Select Your Role
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => handleRoleSelect(role.value)}
                      className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 bg-transparent ${
                        formData.role === role.value
                          ? "border-green-500 bg-green-50 shadow-md"
                          : "border-gray-200 hover:border-green-300 hover:bg-green-50"
                      } ${mode === "dark"
                        ? formData.role === role.value
                          ? "bg-green-900 border-green-400 shadow-md"
                          : "border-gray-600 hover:border-green-400 hover:bg-green-900"
                        : ""}`}
                    >
                      <div className={`flex flex-col items-center text-center space-y-1 sm:space-y-2 ${
                        mode === "dark"
                          ? "text-white"
                          : "text-gray-800"
                      }`}>
                        <Icon
                          className={`w-6 h-6 sm:w-8 sm:h-8 ${
                            formData.role === role.value
                              ? "text-green-600"
                              : "text-gray-600"
                          } ${mode === "dark" ? "text-green-400" : ""}`}
                        />
                        <div>
                          <div
                            className={`text-sm sm:text-base font-semibold ${
                              formData.role === role.value
                                ? "text-green-700"
                                : "text-gray-700"
                            } ${mode === "dark" ? "text-white" : ""}`}
                          >
                            {role.label}
                          </div>
                          <div className={`text-xs ${mode === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                            {role.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-2 transition-colors duration-300 ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border-2 focus:outline-none transition ${
                    errors.password
                      ? "border-red-500 focus:border-red-500"
                      : mode === "dark"
                      ? "border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-green-400"
                      : "border-gray-200 focus:ring-2 focus:ring-green-500"
                  }`}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-2 transition-colors duration-300 ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border-2 focus:outline-none transition ${
                    errors.confirmPassword
                      ? "border-red-500 focus:border-red-500"
                      : mode === "dark"
                      ? "border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-green-400"
                      : "border-gray-200 focus:ring-2 focus:ring-green-500"
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                name="acceptTerms"
                id="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500"
              />
              <label
                className={`text-xs sm:text-sm leading-relaxed transition-colors duration-300 ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
                htmlFor="acceptTerms"
              >
                By signing up, you agree to our
                <span className="text-green-600 font-semibold">
                  {" "}
                  Terms & Conditions{" "}
                </span>
                and
                <span className="text-green-600 font-semibold">
                  {" "}
                  Privacy Policy
                </span>
                .
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-red-500 text-xs -mt-1">{errors.acceptTerms}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full text-white py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                mode === "dark"
                  ? "bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  : "bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              }`}
            >
              Create Account
            </button>

            {/* Google Sign Up */}
            <button
              type="button"
              className={`w-full border-2 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                mode === "dark"
                  ? "border-gray-600 text-white hover:border-green-400 hover:bg-gray-700 bg-transparent"
                  : "border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50"
              }`}
              onClick={handleGoogleSignUp}
            >
              <FcGoogle className="text-xl" />
              Sign up with Google
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-5 sm:mt-6 text-center">
            <p className={`text-sm sm:text-base transition-colors duration-300 ${
              mode === "dark" ? "text-gray-400" : "text-gray-600"
            }`}>
              Already have an account?{" "}
              <Link
                to="/signin"
                className={`font-semibold hover:underline transition ${
                  mode === "dark"
                    ? "text-green-400 hover:text-green-300"
                    : "text-green-600 hover:text-green-700"
                }`}
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
