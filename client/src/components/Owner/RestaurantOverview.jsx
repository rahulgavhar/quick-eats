import React from "react";
import { MdEdit, MdDelete, MdFastfood } from "react-icons/md";
import { useSelector } from "react-redux";

const RestaurantOverview = ({ restaurant, onManage, onDelete }) => {
  const { mode } = useSelector((state) => state.theme);

  if (!restaurant) {
    return (
      <div
        className={`p-6 rounded-lg border-2 border-dashed transition-colors duration-300 text-center ${
          mode === "dark"
            ? "bg-gray-800 border-gray-700 text-gray-400"
            : "bg-gray-50 border-gray-300 text-gray-500"
        }`}
      >
        <MdFastfood size={48} className="mx-auto mb-3 opacity-50" />
        <p className="text-lg font-semibold">No Restaurant Added</p>
        <p className="text-sm mt-2">Add your restaurant to get started</p>
      </div>
    );
  }

  // light or dark mode banner style
  // for light mode bright image with dark overlay
  const bannerStyle = {
    backgroundImage: restaurant.image
      ? `url(${restaurant.coverPhoto})`
      : mode === "dark"
      ? "linear-gradient(135deg, #1f2937, #0f172a)"
      : "linear-gradient(135deg, #d1fae5, #14b8a6)",
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    <div
      className={`p-6 rounded-lg border transition-colors duration-300 ${
        mode === "dark"
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200"
      }`}
    >
      <div
        className="rounded-lg h-40 mb-6 border overflow-hidden"
        style={bannerStyle}
      >
        <div className={`h-full w-full flex items-end ${mode !== "dark" ? "" : "bg-black/20"}`}>
          <div className="p-4">
            <p className="text-white/90 text-sm font-semibold">
              {restaurant.cuisine || "Multi-cuisine"}
            </p>
            <h2 className="text-white text-2xl font-bold drop-shadow">
              {restaurant.name}
            </h2>
          </div>
        </div>
      </div>

      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">{restaurant.name}</h2>
          <p
            className={`text-sm ${
              mode === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {restaurant.cuisine || "Multi-cuisine"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p
            className={`text-sm ${
              mode === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Rating
          </p>
          <p className="text-xl font-bold">⭐ {restaurant.rating || "N/A"}</p>
        </div>
        <div>
          <p
            className={`text-sm ${
              mode === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Items
          </p>
          <p className="text-xl font-bold">
            {restaurant.items?.length || 0} items
          </p>
        </div>
        <div>
          <p
            className={`text-sm ${
              mode === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Location
          </p>
          <p className="text-xl font-bold">📍 {restaurant.location || "N/A"}</p>
        </div>
        <div>
          <p
            className={`text-sm ${
              mode === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Status
          </p>
          <p
            className={`font-bold px-3 py-1 rounded-full text-sm w-fit ${
              restaurant.isOpen
                ? mode === "dark"
                  ? "bg-green-900 text-green-300"
                  : "bg-green-100 text-green-800"
                : mode === "dark"
                ? "bg-red-900 text-red-300"
                : "bg-red-100 text-red-800"
            }`}
          >
            {restaurant.isOpen ? "🟢 Open" : "🔴 Closed"}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onManage}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
            mode === "dark"
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          <MdEdit size={18} /> Manage
        </button>
        <button
          onClick={onDelete}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
            mode === "dark"
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-red-500 text-white hover:bg-red-600"
          }`}
        >
          <MdDelete size={18} /> Delete
        </button>
      </div>
    </div>
  );
};

export default RestaurantOverview;
