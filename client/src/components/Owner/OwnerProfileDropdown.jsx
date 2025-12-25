import React from "react";
import {
  MdPerson,
  MdRestaurantMenu,
  MdLogout,
  MdManageAccounts,
} from "react-icons/md";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const OwnerProfileDropdown = ({
  handleLogout,
  setShowProfileDropdown,
  onManageRestaurant,
}) => {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);
  const { mode } = useSelector((state) => state.theme);

  return (
    <div
      className={`absolute right-0 mt-2 w-56 rounded-lg shadow-lg overflow-hidden z-50 transition-colors duration-300 ${
        mode === "dark"
          ? "bg-gray-800 border border-gray-700"
          : "bg-white border border-gray-200"
      }`}
    >
      <div
        className={`px-4 py-3 border-b ${
          mode === "dark" ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div className="flex items-center gap-2">
          <p
            className={`font-semibold ${
              mode === "dark" ? "text-white" : "text-gray-800"
            }`}
          >
            {userData?.name || userData?.fullName || userData?.username || "Owner"}
          </p>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border ${
              mode === "dark"
                ? "text-green-300 border-gray-600"
                : "text-green-800 border-green-300"
            }`}
          >
            Owner
          </span>
        </div>
        <p
          className={`text-sm ${
            mode === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {userData?.email || "owner@example.com"}
        </p>
      </div>

      <div className="py-2">
        <button
          onClick={() => {
            setShowProfileDropdown(false);
            navigate("/profile");
          }}
          className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors duration-200 ${
            mode === "dark"
              ? "text-gray-300  hover:text-green-500 bg-gray-800"
              : "text-gray-700 hover:bg-green-50 hover:text-green-600"
          }`}
        >
          <MdPerson size={20} />
          <span>My Profile</span>
        </button>

        <button
          onClick={() => {
            onManageRestaurant();
            setShowProfileDropdown(false);
          }}
          className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors duration-200 ${
            mode === "dark"
              ? "text-gray-300  hover:text-green-500 bg-gray-800"
              : "text-gray-700 hover:bg-green-50 hover:text-green-600"
          }`}
        >
          <MdManageAccounts size={20} />
          <span>Manage Restaurant</span>
        </button>

        <button
          onClick={() => {
            setShowProfileDropdown(false);
            // Add settings navigation
          }}
          className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors duration-200 ${
            mode === "dark"
              ? "text-gray-300  hover:text-green-500 bg-gray-800"
              : "text-gray-700 hover:bg-green-50 hover:text-green-600"
          }`}
        >
          <MdRestaurantMenu size={20} />
          <span>Menu Settings</span>
        </button>

        <div
          className={`border-t ${
            mode === "dark" ? "border-gray-700" : "border-gray-200"
          }`}
        />

        <button
          onClick={handleLogout}
          className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors duration-200 ${
            mode === "dark"
              ? "text-red-300 hover:text-red-500 bg-gray-800"
              : "text-red-600 hover:bg-red-50"
          }`}
        >
          <MdLogout size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default OwnerProfileDropdown;
