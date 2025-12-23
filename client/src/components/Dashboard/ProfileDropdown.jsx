import React from "react";
import { MdPerson, MdReceipt, MdSettings, MdLogout } from "react-icons/md";
import { useSelector } from "react-redux";

const ProfileDropdown = ({ handleLogout, setShowProfileDropdown }) => {
  const { userData } = useSelector((state) => state.user);
  const { mode } = useSelector((state) => state.theme);

  const roleLabel = userData?.role
    ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1)
    : null;

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
            {userData?.name ||
              userData?.fullName ||
              userData?.username ||
              "User"}
          </p>
          {roleLabel && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full border ${
                mode === "dark"
                  ? "text-green-300 border-gray-600"
                  : "text-green-800 border-green-300"
              }`}
            >
              {roleLabel}
            </span>
          )}
        </div>
        <p
          className={`text-sm ${
            mode === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {userData?.email || "user@example.com"}
        </p>
      </div>

      <div className="py-2">
        <button
          onClick={() => {
            setShowProfileDropdown(false);
            // Add profile navigation here
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
            setShowProfileDropdown(false);
            // Add orders navigation here
          }}
          className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors duration-200 ${
            mode === "dark"
              ? "text-gray-300  hover:text-green-500 bg-gray-800"
              : "text-gray-700 hover:bg-green-50 hover:text-green-600"
          }`}
        >
          <MdReceipt size={20} />
          <span>My Orders</span>
        </button>

        <button
          onClick={() => {
            setShowProfileDropdown(false);
            // Add settings navigation here
          }}
          className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors duration-200 ${
            mode === "dark"
              ? "text-gray-300  hover:text-green-500 bg-gray-800"
              : "text-gray-700 hover:bg-green-50 hover:text-green-600"
          }`}
        >
          <MdSettings size={20} />
          <span>Settings</span>
        </button>

        <div
          className={`border-t ${
            mode === "dark" ? "border-gray-700" : "border-gray-200"
          }`}
        ></div>

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

export default ProfileDropdown;
