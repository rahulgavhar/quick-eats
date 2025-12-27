import React from "react";
import { useSelector } from "react-redux";
import { MdError } from "react-icons/md";

const ErrorComponent = ({ message, onRetry }) => {
  const { mode } = useSelector((state) => state.theme);

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${
        mode === "dark" ? "bg-black/50" : "bg-white/50"
      }`}
    >
      <div
        className={`rounded-lg p-8 max-w-md text-center shadow-lg ${
          mode === "dark"
            ? "bg-gray-800 text-white"
            : "bg-white text-gray-900"
        }`}
      >
        <MdError className="mx-auto mb-4 text-red-500" size={48} />
        <h2 className="text-2xl font-bold mb-2">Something Went Wrong</h2>
        <p
          className={`mb-6 ${
            mode === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {message || "An unexpected error occurred. Please try again."}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className={`px-6 py-2 rounded-lg font-semibold text-white transition ${
              mode === "dark"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorComponent;
