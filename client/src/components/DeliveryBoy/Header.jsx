import React from "react";
import { MdLightMode, MdDarkMode, MdAccountCircle } from "react-icons/md";
import { RiMenu3Line } from "react-icons/ri";
import { GiCrossedBones } from "react-icons/gi";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../../redux/slices/themeSlice";

const Header = ({
  firstName,
  roleLabel,
  showProfileDropdown,
  setShowProfileDropdown,
  showMobileMenu,
  setShowMobileMenu,
  dropdownRef,
  ProfileDropdown,
}) => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);
  const { userData } = useSelector((state) => state.user);

  return (
    <div
      className={`sticky top-0 z-40 shadow-lg p-6 max-md:p-2 transition-colors duration-300 ${
        mode === "dark"
          ? "bg-linear-to-r from-gray-800 to-gray-700 text-white"
          : "bg-linear-to-r from-green-500 to-teal-500 text-white"
      }`}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-3 max-md:grid-cols-2 items-center p-2 gap-4">
        <div className="justify-self-start">
          <h1 className="text-3xl font-bold max-[310px]:hidden max-[430px]:text-xl">
            🛵 Quick Eats Delivery
          </h1>
          <div className="flex items-center gap-3">
            <p className={mode === "dark" ? "text-gray-300" : "text-green-100"}>
              <span className="min-[270px]:hidden">🛵 </span>
              Hi, {firstName}!
            </p>
            {roleLabel && (
              <span
                className={`text-xs px-2 py-1 rounded-full font-semibold border ${
                  mode === "dark"
                    ? "bg-gray-700 text-yellow-300 border-gray-600"
                    : "bg-white/20 text-white border-white/40"
                }`}
              >
                {roleLabel}
              </span>
            )}
          </div>
        </div>

        {/* Desktop actions */}
        <div className="md:flex items-center gap-4 justify-self-end col-start-3">
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
              <MdAccountCircle size={28} />
            </button>

            {showProfileDropdown && <ProfileDropdown />}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-white hover:opacity-80 transition bg-transparent"
            onClick={() => setShowMobileMenu((s) => !s)}
            aria-label="Toggle menu"
          >
            {showMobileMenu ? (
              <GiCrossedBones size={26} />
            ) : (
              <RiMenu3Line size={26} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
