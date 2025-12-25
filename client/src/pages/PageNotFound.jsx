import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MdHome, MdLightMode, MdDarkMode } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../redux/slices/themeSlice";

const PageNotFound = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [bounce, setBounce] = useState(false);

  // Parallax effect on mouse move
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 20,
        y: (e.clientY / window.innerHeight) * 20,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Bounce animation on load
  useEffect(() => {
    setBounce(true);
  }, []);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 flex flex-col items-center justify-center relative overflow-hidden ${
        mode === "dark"
          ? "bg-linear-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-linear-to-br from-blue-50 via-green-50 to-blue-50"
      }`}
    >
      {/* Animated Background Elements */}
      <div
        className={`absolute top-10 left-10 w-72 h-72 rounded-full blur-3xl opacity-20 transition-transform duration-500 ${
          mode === "dark" ? "bg-blue-500" : "bg-blue-300"
        }`}
        style={{
          transform: `translate(${mousePos.x * 2}px, ${mousePos.y * 2}px)`,
        }}
      />
      <div
        className={`absolute bottom-10 right-10 w-72 h-72 rounded-full blur-3xl opacity-20 transition-transform duration-500 ${
          mode === "dark" ? "bg-green-500" : "bg-green-300"
        }`}
        style={{
          transform: `translate(${-mousePos.x * 2}px, ${-mousePos.y * 2}px)`,
        }}
      />

      {/* Top Right Theme Toggle */}
      <button
        onClick={() => dispatch(toggleTheme())}
        className={`absolute top-6 right-6 p-3 rounded-full transition-all duration-300 ${
          mode === "dark"
            ? "bg-gray-700 hover:bg-gray-600 text-yellow-300"
            : "bg-white hover:bg-gray-100 text-gray-700 shadow-lg"
        }`}
      >
        {mode === "dark" ? (
          <MdLightMode size={24} />
        ) : (
          <MdDarkMode size={24} />
        )}
      </button>

      {/* Main Content */}
      <div className="relative z-10 text-center px-6 max-w-2xl">
        {/* 404 Number with Bounce */}
        <div
          className={`transition-transform duration-700 ${
            bounce ? "scale-100" : "scale-0"
          }`}
          style={{
            animation: bounce ? "bounce 1s ease-in-out" : "none",
          }}
        >
          <div
            className={`text-9xl font-black mb-4 bg-clip-text text-transparent ${
              mode === "dark"
                ? "bg-linear-to-r from-blue-400 via-purple-400 to-pink-400"
                : "bg-linear-to-r from-blue-500 via-purple-500 to-pink-500"
            }`}
          >
            404
          </div>
        </div>

        {/* Heading */}
        <h1
          className={`text-4xl md:text-5xl font-bold mb-4 transition-colors duration-300 ${
            mode === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Oops! Page Not Found
        </h1>

        {/* Description */}
        <p
          className={`text-lg md:text-xl mb-8 transition-colors duration-300 ${
            mode === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          The page you're looking for seems to have wandered off. Don't worry,
          we'll help you find your way back!
        </p>

        {/* Funny Emoji Animation */}
        <div className="mb-12 text-6xl animate-bounce">
          🍽️
        </div>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* Go Home Button */}
          <button
            onClick={() => navigate("/")}
            className={`group relative px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden ${
              mode === "dark"
                ? "bg-linear-to-r from-green-600 to-teal-600 text-white hover:shadow-lg hover:shadow-green-500/50"
                : "bg-linear-to-r from-green-500 to-teal-500 text-white hover:shadow-lg hover:shadow-green-400/50"
            }`}
          >
            <div
              className={`absolute inset-0 ${
                mode === "dark"
                  ? "bg-linear-to-r from-green-700 to-teal-700"
                  : "bg-linear-to-r from-green-600 to-teal-600"
              } translate-y-full group-hover:translate-y-0 transition-transform duration-300`}
            />
            <MdHome size={24} className="relative z-10" />
            <span className="relative z-10">Go Home</span>
          </button>

          {/* Go Back Button */}
          <button
            onClick={() => navigate(-1)}
            className={`px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 border-2 ${
              mode === "dark"
                ? "border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                : "border-gray-400 text-gray-700 hover:bg-gray-100"
            }`}
          >
            Go Back
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-16 pt-12 border-t border-gray-600/30">
          <p
            className={`text-sm mb-6 transition-colors duration-300 ${
              mode === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Or try one of these popular pages:
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { label: "Browse Restaurants", path: "/" },
              { label: "Your Orders", path: "/" },
              { label: "Contact Support", path: "/" },
            ].map((link) => (
              <button
                key={link.label}
                onClick={() => navigate(link.path)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  mode === "dark"
                    ? "bg-gray-700 text-blue-400 hover:bg-gray-600"
                    : "bg-white text-blue-600 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className={`absolute inset-0 ${
            mode === "dark" ? "bg-gray-600" : "bg-gray-400"
          }`}
          style={{
            backgroundImage: `
              linear-gradient(90deg, currentColor 1px, transparent 1px),
              linear-gradient(currentColor 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
};

export default PageNotFound;
