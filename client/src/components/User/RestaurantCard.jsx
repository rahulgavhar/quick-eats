import React from "react";
import { useSelector } from "react-redux";

const RestaurantCard = ({ restaurant, onClick }) => {
  const { mode } = useSelector((state) => state.theme);
  
  // Check if image is a URL or emoji
  const isImageUrl = restaurant.image && (restaurant.image.startsWith('http') || restaurant.image.startsWith('/'));

  return (
    <div
      onClick={onClick}
      className={`rounded-lg shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden hover:scale-105 transform border-t-4 border-green-500 ${
        mode === "dark" ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div
        className={`p-0 text-6xl flex items-center justify-center h-40 w-full transition-colors duration-300 overflow-hidden ${
          mode === "dark"
            ? "bg-linear-to-b from-gray-700 to-gray-600"
            : "bg-linear-to-b from-green-100 to-cyan-100"
        }`}
      >
        {isImageUrl ? (
          <img
            src={restaurant.image}
            className="w-full h-full object-cover"
          />
        ) : (
          restaurant.image
        )}
      </div>
      <div className="p-4">
        <h3
          className={`text-lg font-bold transition-colors duration-300 ${
            mode === "dark" ? "text-white" : "text-gray-800"
          }`}
        >
          {restaurant.name}
        </h3>
        <p
          className={`text-sm transition-colors duration-300 ${
            mode === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {restaurant.cuisine}
        </p>
        <div
          className={`flex justify-between items-center mt-3 text-sm transition-colors duration-300 ${
            mode === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          <span>⭐ {restaurant.rating}</span>
          <span>⏱️ {restaurant.deliveryTime}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="w-full mt-4 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition font-semibold"
        >
          View Menu
        </button>
      </div>
    </div>
  );
};

export default RestaurantCard;
