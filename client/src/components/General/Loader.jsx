import React from "react";
import { useSelector } from "react-redux";

const Loader = () => {
  const { mode } = useSelector((state) => state.theme);

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${
        mode === "dark" ? "bg-black/50" : "bg-white/50"
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div
            className={`absolute inset-0 rounded-full border-4 border-transparent ${
              mode === "dark"
                ? "border-t-green-500 border-r-green-500"
                : "border-t-green-400 border-r-green-400"
            } animate-spin`}
          ></div>
          <div className="absolute inset-2 rounded-full flex items-center justify-center text-2xl">
            🍽️
          </div>
        </div>
        <p
          className={`text-lg font-semibold ${
            mode === "dark" ? "text-white" : "text-gray-800"
          }`}
        >
          Loading...
        </p>
      </div>
    </div>
  );
};

export default Loader;
