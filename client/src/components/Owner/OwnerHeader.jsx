import React from "react";
import { MdLightMode, MdDarkMode, MdAccountCircle, MdAdd } from "react-icons/md";
import { RiMenu3Line } from "react-icons/ri";
import { GiCrossedBones } from "react-icons/gi";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../../redux/slices/themeSlice";

const OwnerHeader = ({
  firstName,
  hasRestaurant,
  onAddRestaurant,
  onAddItem,
  showProfileDropdown,
  setShowProfileDropdown,
  showMobileMenu,
  setShowMobileMenu,
  dropdownRef,
  ProfileDropdown,
}) => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);

  return (
    <div
      className={`sticky top-0 z-40 shadow-lg p-6 max-md:p-2 transition-colors duration-300 ${
        mode === "dark"
          ? "bg-linear-to-r from-gray-800 to-gray-700 text-white"
          : "bg-linear-to-r from-green-500 to-teal-500 text-white"
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center p-2">
        <div>
          <h1 className="text-3xl font-bold max-[270px]:hidden">
            🍽️ Quick Eats
          </h1>
          <div className="flex items-center gap-3">
            <p className={mode === "dark" ? "text-gray-300" : "text-green-100"}>
              <span className="min-[270px]:hidden">🍽️ </span>
              Hi, {firstName}!
            </p>
            <span
              className={`text-xs px-2 py-1 rounded-full font-semibold border ${
                mode === "dark"
                  ? "bg-gray-700 text-green-300 border-gray-600"
                  : "bg-white/20 text-white border-white/40"
              }`}
            >
              Owner
            </span>
          </div>
        </div>

        {/* Desktop actions */}
        <div className="md:flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={() => dispatch(toggleTheme())}
            className="max-md:hidden text-white hover:opacity-80 transition-all duration-300 bg-transparent"
            title={
              mode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
            }
          >
            {mode === "dark" ? (
              <MdLightMode size={24} />
            ) : (
              <MdDarkMode size={24} />
            )}
          </button>

          {/* Action Button - Add Restaurant or Add Item */}
          {hasRestaurant ? (
            <button
              onClick={onAddItem}
              className={`max-md:hidden px-6 py-3 rounded-full font-semibold transition flex items-center gap-2 ${
                mode === "dark"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-white text-green-500 hover:bg-green-50"
              }`}
            >
              <MdAdd size={20} /> Add Item
            </button>
          ) : (
            <button
              onClick={onAddRestaurant}
              className={`max-md:hidden px-6 py-3 rounded-full font-semibold transition flex items-center gap-2 ${
                mode === "dark"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-white text-green-500 hover:bg-green-50"
              }`}
            >
              <MdAdd size={20} /> Add Restaurant
            </button>
          )}

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className={`max-md:hidden p-2 rounded-full font-semibold transition flex items-center gap-2 ${
                mode === "dark"
                  ? "bg-gray-700 text-white hover:bg-gray-600"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
              title="Profile"
            >
              <MdAccountCircle size={24} />
            </button>
            {showProfileDropdown && ProfileDropdown}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden text-white text-2xl bg-transparent"
          >
            {showMobileMenu ? <GiCrossedBones /> : <RiMenu3Line />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div
          className={`md:hidden mt-4 p-4 rounded-lg space-y-3 ${
            mode === "dark" ? "bg-gray-700" : "bg-white/10"
          }`}
        >
          {hasRestaurant ? (
            <button
              onClick={() => {
                onAddItem();
                setShowMobileMenu(false);
              }}
              className={`w-full px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                mode === "dark"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-white text-green-500 hover:bg-green-50"
              }`}
            >
              <MdAdd size={20} /> Add Item
            </button>
          ) : (
            <button
              onClick={() => {
                onAddRestaurant();
                setShowMobileMenu(false);
              }}
              className={`w-full px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                mode === "dark"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-white text-green-500 hover:bg-green-50"
              }`}
            >
              <MdAdd size={20} /> Add Restaurant
            </button>
          )}

          {/* Theme Toggle Mobile */}
          <button
            onClick={() => {
              dispatch(toggleTheme());
              setShowMobileMenu(false);
            }}
            className={`w-full px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
              mode === "dark"
                ? "bg-gray-600 text-white hover:bg-gray-500"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {mode === "dark" ? <MdLightMode /> : <MdDarkMode />}
            {mode === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      )}
    </div>
  );
};

export default OwnerHeader;
