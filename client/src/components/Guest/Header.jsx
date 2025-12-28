import { MdLightMode, MdDarkMode } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { toggleTheme } from "../../redux/slices/themeSlice";

const Header = () => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);

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

        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch(toggleTheme())}
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold transition"
            title={mode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {mode === "dark" ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
            <span className="text-sm">Theme</span>
          </button>

          <Link
            to="/signin"
            className="px-4 py-2 rounded-full font-semibold bg-white text-emerald-700 hover:bg-emerald-50 transition"
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 rounded-full font-semibold border border-white/60 text-white hover:bg-white/10 transition"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Header;
