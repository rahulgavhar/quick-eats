import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  MdEdit,
  MdSave,
  MdCancel,
  MdLightMode,
  MdDarkMode,
  MdArrowBack,
} from "react-icons/md";
import { Mail, Phone, User, Lock } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { toggleTheme } from "../redux/slices/themeSlice";
import { userSliceActions } from "../redux/slices/userSlice";

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

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const apiURL = import.meta.env.VITE_API_URL;
  const { userData, city } = useSelector((state) => state.user);
  const { mode } = useSelector((state) => state.theme);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    countryCode: "+91",
    role: "user",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  // Initialize form with user data (prefill all known fields)
  useEffect(() => {
    if (userData) {
      const derivedFirstName =
        userData.firstName ||
        userData.fullName?.split(" ")[0] ||
        userData.name?.split(" ")[0] ||
        "";
      const derivedLastName =
        userData.lastName ||
        userData.fullName?.split(" ")[1] ||
        userData.name?.split(" ")[1] ||
        "";

      setFormData((prev) => ({
        ...prev,
        firstName: derivedFirstName,
        lastName: derivedLastName,
        email: userData.email || "",
        mobile: userData.mobile || "",
        countryCode: userData.countryCode || "+91",
        role: userData.role || "user",
      }));
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic validations
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (formData.mobile) {
      if (!/^\d*$/.test(formData.mobile)) {
        newErrors.mobile = "Mobile number must contain only digits";
      } else if (formData.mobile.length < 10 || formData.mobile.length > 15) {
        newErrors.mobile = "Mobile number must be between 10-15 digits";
      }
    }

    // Password validations (only if user is changing password)
    if (formData.newPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = "Current password is required";
      }
      if (!formData.newPassword) {
        newErrors.newPassword = "New password is required";
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = "Password must be at least 6 characters";
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const roleChanged = formData.role !== userData.role;
    
    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobile: formData.mobile,
        countryCode: formData.countryCode,
        role: formData.role,
      };

      // Include password change if provided
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await axios.put(
        `${apiURL}/api/user/update`,
        updateData,
        {
          withCredentials: true,
        }
      );

      // Update Redux store
      dispatch(
        userSliceActions.updateUserData({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          mobile: formData.mobile,
          countryCode: formData.countryCode,
          role: formData.role,
        })
      );

      // Reset password fields
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      toast.success("Profile updated successfully!");
      setIsEditing(false);

      // If role changed, redirect to home to refresh with new token
      if (roleChanged) {
        toast.info("Redirecting to apply role changes...");
        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update profile";
      toast.error(errorMessage);
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to current user data
    const derivedFirstName =
      userData?.firstName ||
      userData?.fullName?.split(" ")[0] ||
      userData?.name?.split(" ")[0] ||
      "";
    const derivedLastName =
      userData?.lastName ||
      userData?.fullName?.split(" ")[1] ||
      userData?.name?.split(" ")[1] ||
      "";
    setFormData((prev) => ({
      ...prev,
      firstName: derivedFirstName,
      lastName: derivedLastName,
      email: userData?.email || "",
      mobile: userData?.mobile || "",
      role: userData?.role || "user",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
    setErrors({});
    setIsEditing(false);
  };

  // Account status based on mobile presence
  const isActive = !!(formData.mobile && formData.mobile.trim() !== "");
  const purchasesCount = Array.isArray(userData?.purchases)
    ? userData.purchases.length
    : Number.isFinite(userData?.purchases)
    ? Number(userData.purchases)
    : 0;

  // Role-based color styling for badges/text
  const roleKey = ((isEditing ? formData.role : userData?.role) || "user").toLowerCase();
  const roleStyle =
    mode === "dark"
      ? roleKey === "owner"
        ? "text-red-300 border-red-400"
        : roleKey === "deliveryboy"
        ? "text-yellow-300 border-yellow-400"
        : "text-green-300 border-green-400"
      : roleKey === "owner"
      ? "text-red-700 border-red-300"
      : roleKey === "deliveryboy"
      ? "text-yellow-700 border-yellow-300"
      : "text-green-700 border-green-300";

  if (!userData) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          mode === "dark" ? "bg-gray-900 text-white" : "bg-gray-50"
        }`}
      >
        <button
          onClick={() => navigate(-1)}
          className={`absolute top-6 left-6 p-2 rounded-full bg-transparent border-0 border-white text-white transition`}
        >
          <MdArrowBack size={24} />
        </button>
        <div className="text-center">
          <p className="text-lg mb-4">Please log in to view your profile</p>
          <button
            onClick={() => navigate("/signin")}
            className={`px-6 py-2 rounded-lg font-semibold transition text-white ${
              mode === "dark"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        mode === "dark" ? "bg-gray-900 text-white" : "bg-gray-50"
      }`}
    >
      {/* Header */}
      <div
        className={`sticky top-0 z-40 shadow-lg p-6 transition-colors duration-300 ${
          mode === "dark"
            ? "bg-linear-to-r from-gray-800 to-gray-700"
            : "bg-linear-to-r from-green-500 to-teal-500 text-white"
        }`}
      >
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-full bg-transparent transition ${
                mode === "dark" ? "text-white" : "text-white hover:opacity-80"
              }`}
            >
              <MdArrowBack size={24} />
            </button>
            <h1 className="text-3xl font-bold">My Profile</h1>
          </div>

          <button
            onClick={() => dispatch(toggleTheme())}
            className={`p-2 rounded-full bg-transparent transition ${
              mode === "dark"
                ? "hover:bg-gray-700 text-white"
                : "text-white hover:opacity-80"
            }`}
          >
            {mode === "dark" ? (
              <MdLightMode size={24} />
            ) : (
              <MdDarkMode size={24} />
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6 max-md:p-3">
        <div
          className={`rounded-lg shadow-lg overflow-hidden transition-colors duration-300 ${
            mode === "dark"
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
          }`}
        >
          {/* Profile Header Section */}
          <div
            className={`p-8 border-b ${
              mode === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-6 max-[530px]:flex-col max-[530px]:gap-4">
              <div className="flex items-center gap-4 max-[530px]:flex-col">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl font-bold ${
                    mode === "dark"
                      ? "bg-green-900 text-green-300"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {(formData.firstName || "U")[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-3xl font-bold">
                    {formData.firstName} {formData.lastName}
                  </h2>
                  <p
                    className={`text-sm max-[530px]:flex my-4 max-[530px]:justify-center ${
                      mode === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                                      <span
                className={`text-xs px-2 py-1 rounded-full font-semibold border ${
                  mode === "dark" ? "bg-gray-700" : "bg-white/20"
                } ${roleStyle}`}
              >
                {(isEditing ? formData.role : userData?.role) || "User"}
              </span>
                  </p>
                  <p
                    className={`text-sm max-[530px]:flex max-[530px]:justify-center ${
                      mode === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    📍 {city || "Location not set"}
                  </p>
                </div>
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                    mode === "dark"
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  <MdEdit size={20} /> Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Profile Information */}
          <div className="p-8 space-y-6">
            {/* Personal Information Section */}
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <User size={20} /> Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      mode === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 rounded-lg border transition ${
                      isEditing
                        ? mode === "dark"
                          ? "border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          : "border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        : mode === "dark"
                        ? "border-gray-700 bg-gray-700 text-white cursor-not-allowed"
                        : "border-gray-300 bg-gray-50 cursor-not-allowed"
                    }`}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      mode === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 rounded-lg border transition ${
                      isEditing
                        ? mode === "dark"
                          ? "border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          : "border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        : mode === "dark"
                        ? "border-gray-700 bg-gray-700 text-white cursor-not-allowed"
                        : "border-gray-300 bg-gray-50 cursor-not-allowed"
                    }`}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div
              className={`p-4 rounded-lg border ${
                mode === "dark"
                  ? "border-gray-700 bg-gray-700"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Mail size={20} /> Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div className="md:col-span-2">
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      mode === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 rounded-lg border transition ${
                      isEditing
                        ? mode === "dark"
                          ? "border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          : "border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        : mode === "dark"
                        ? "border-gray-700 bg-gray-700 text-white cursor-not-allowed"
                        : "border-gray-300 bg-gray-50 cursor-not-allowed"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      mode === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Country Code
                  </label>
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 rounded-lg border transition ${
                      isEditing
                        ? mode === "dark"
                          ? "border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          : "border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        : mode === "dark"
                        ? "border-gray-700 bg-gray-700 text-white cursor-not-allowed"
                        : "border-gray-300 bg-gray-50 cursor-not-allowed"
                    }`}
                  >
                    {countryCodes.map((country, index) => (
                      <option key={index} value={country.code}>
                        {country.flag} {country.country} ({country.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      mode === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="1234567890"
                    className={`w-full px-4 py-3 rounded-lg border transition ${
                      isEditing
                        ? mode === "dark"
                          ? "border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          : "border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        : mode === "dark"
                        ? "border-gray-700 bg-gray-700 text-white cursor-not-allowed"
                        : "border-gray-300 bg-gray-50 cursor-not-allowed"
                    }`}
                  />
                  {errors.mobile && (
                    <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Password Section (only show when editing) */}
            {isEditing && (
              <div
                className={`p-4 rounded-lg border ${
                  mode === "dark"
                    ? "border-gray-700 bg-gray-700"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Lock size={20} /> Change Password (Optional)
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  {/* Current Password */}
                  <div>
                    <label
                      className={`block text-sm font-semibold mb-2 ${
                        mode === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      placeholder="Enter current password"
                      className={`w-full px-4 py-3 rounded-lg border transition ${
                        mode === "dark"
                          ? "border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          : "border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      }`}
                    />
                    {errors.currentPassword && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.currentPassword}
                      </p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label
                      className={`block text-sm font-semibold mb-2 ${
                        mode === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Enter new password (at least 6 characters)"
                      className={`w-full px-4 py-3 rounded-lg border transition ${
                        mode === "dark"
                          ? "border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          : "border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      }`}
                    />
                    {errors.newPassword && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.newPassword}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      className={`block text-sm font-semibold mb-2 ${
                        mode === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                      className={`w-full px-4 py-3 rounded-lg border transition ${
                        mode === "dark"
                          ? "border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          : "border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      }`}
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <p
                    className={`text-sm ${
                      mode === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Leave password fields empty if you don't want to change your
                    password.
                  </p>
                </div>
              </div>
            )}

            {/* Account Information */}
            <div
              className={`p-4 rounded-lg border ${
                mode === "dark"
                  ? "border-gray-700 bg-gray-700"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <h3 className="text-lg font-bold mb-3">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p
                    className={`${
                      mode === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Account Type
                  </p>
                  {isEditing ? (
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 rounded-lg border transition ${
                        mode === "dark"
                          ? "border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          : "border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      }`}
                    >
                      <option value="user">User</option>
                      <option value="owner">Owner</option>
                      <option value="deliveryBoy">Delivery Boy</option>
                    </select>
                  ) : (
                    <p className={`font-semibold capitalize ${roleStyle}`}>
                      {userData?.role || formData.role || "User"}
                    </p>
                  )}
                </div>
                <div>
                  <p
                    className={`${
                      mode === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Account Status
                  </p>
                  <p
                    className={`font-semibold ${
                      isActive
                        ? "text-green-600"
                        : mode === "dark"
                        ? "text-yellow-400"
                        : "text-yellow-600"
                    }`}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </p>
                </div>
                <div>
                  <p
                    className={`${
                      mode === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Purchases
                  </p>
                  <p className="font-semibold">{purchasesCount}</p>
                </div>
                {userData?.createdAt && (
                  <div>
                    <p
                      className={`${
                        mode === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Member Since
                    </p>
                    <p className="font-semibold">
                      {new Date(userData.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-4 pt-6">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition text-white ${
                    loading
                      ? "opacity-50 cursor-not-allowed"
                      : mode === "dark"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  <MdSave size={20} /> {loading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                    mode === "dark"
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  <MdCancel size={20} /> Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
