import { MdLightMode, MdDarkMode } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { RiMenu3Line } from "react-icons/ri";
import { GiCrossedBones } from "react-icons/gi";
import { toggleTheme } from "../../redux/slices/themeSlice";
import { useState } from "react";

const Header = () => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <div
      className={`sticky top-0 z-40 shadow-lg p-6 max-md:p-2 transition-colors duration-300 ${
        mode === "dark"
          ? "bg-linear-to-r from-gray-900 to-gray-800 text-white"
          : "bg-linear-to-r from-green-500 to-teal-500 text-white"
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center p-2">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <span className="max-[320px]:hidden">🍽️</span> Quick Eats
            </h1>
            <p className={mode === "dark" ? "text-gray-300" : "text-green-100"}>
              Food, fast and clear
            </p>
          </div>
        </div>

        {/* Desktop actions */}
        <div className="md:flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={() => dispatch(toggleTheme())}
            className={`max-md:hidden text-white hover:opacity-80 transition-all duration-300 bg-transparent ${
              mode === "dark" ? "bg-black/10" : "bg-white/10"
            }`} 
            title={mode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {mode === "dark" ? (
              <MdLightMode size={24} />
            ) : (
              <MdDarkMode size={24} />
            )}
          </button>

          {/* Log In Button */}
          <Link
            to="/signin"
            className={`max-md:hidden px-6 py-3 rounded-full font-semibold transition ${
              mode === "dark"
                ? "bg-white text-gray-900 hover:bg-gray-100"
                : "bg-white text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            Log In
          </Link>

          {/* Sign Up Button */}
          <Link
            to="/signup"
            className={`max-md:hidden px-6 py-3 rounded-full font-semibold border-2 transition ${
              mode === "dark"
                ? "border-white text-white hover:bg-white/10"
                : "border-white text-white hover:bg-white/20"
            }`}
          >
            Sign Up
          </Link>

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

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div
          className={`md:hidden mt-4 pb-4 space-y-3 border-t ${
            mode === "dark" ? "border-gray-700" : "border-white/20"
          }`}
        >
          {/* Theme Toggle Mobile */}
          <button
            onClick={() => {
              dispatch(toggleTheme());
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition ${
              mode === "dark" ? "bg-gray-400" : ""
            }`}
            title={mode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <span className="font-semibold">Theme</span>
            {mode === "dark" ? (
              <MdLightMode size={20} />
            ) : (
              <MdDarkMode size={20} />
            )}
          </button>

          {/* Log In Mobile */}
          <Link
            to="/signin"
            onClick={() => setShowMobileMenu(false)}
            className={`block w-full px-4 py-3 rounded-lg font-semibold text-center transition ${
              mode === "dark"
                ? "bg-white text-gray-900 hover:bg-gray-100"
                : "bg-white text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            Log In
          </Link>

          {/* Sign Up Mobile */}
          <Link
            to="/signup"
            onClick={() => setShowMobileMenu(false)}
            className={`block w-full px-4 py-3 rounded-lg font-semibold text-center border-2 transition ${
              mode === "dark"
                ? "border-white text-white hover:bg-white/10"
                : "border-white text-white hover:bg-white/20"
            }`}
          >
            Sign Up
          </Link>
        </div>
      )}
    </div>
  );
};

export default Header;
