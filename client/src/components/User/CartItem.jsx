import React from "react";
import { useSelector } from "react-redux";

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const { mode } = useSelector((state) => state.theme);

  return (
    <div
      className={`flex flex-row max-[370px]:flex-col items-start max-[370px]:items-center sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border transition-colors duration-300 ${
        mode === "dark"
          ? "bg-gray-700 border-gray-600"
          : "bg-green-50 border-green-200"
      }`}
    >
      {/* Image and Item Details */}
      <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto sm:flex-1 max-[270px]:flex-col">
        <div className="text-3xl sm:text-4xl shrink-0">{item.image}</div>
        <div className="flex-1 min-w-0">
          <h3
            className={`font-bold text-sm sm:text-base transition-colors duration-300 truncate ${
              mode === "dark" ? "text-white" : "text-gray-800"
            }`}
          >
            {item.name}
          </h3>
          <p
            className={`text-xs sm:text-sm transition-colors duration-300 truncate ${
              mode === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {item.restaurantName}
          </p>
          <p className="text-green-500 font-semibold text-sm sm:text-base">
            ${item.price}
          </p>
        </div>
      </div>

      {/* Quantity Controls and Remove Button */}
      <div className="flex max-sm:flex-col items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto max-[370px]:gap-1">
        <div className="flex items-center gap-2 sm:gap-3 max-[370px]:gap-1">
          <button
            onClick={() =>
              onUpdateQuantity(item.id, item.restaurantId, item.quantity - 1)
            }
            className="bg-red-500 text-white w-8 h-8 sm:w-5 sm:h-5 rounded-full hover:bg-red-600 active:scale-95 transition font-bold text-sm sm:text-base shrink-0"
          >
            -
          </button>
          <span
            className={`font-bold w-6 sm:w-8 text-center transition-colors duration-300 ${
              mode === "dark" ? "text-white" : "text-gray-800"
            }`}
          >
            {item.quantity}
          </span>
          <button
            onClick={() =>
              onUpdateQuantity(item.id, item.restaurantId, item.quantity + 1)
            }
            className="bg-green-500 text-white w-8 h-8 sm:w-8 sm:h-8 rounded-full hover:bg-green-600 active:scale-95 transition font-bold text-sm sm:text-base shrink-0"
          >
            +
          </button>
        </div>
        <button
          onClick={() => onRemove(item.id, item.restaurantId)}
          className={`text-red-500 hover:text-red-700 font-semibold text-sm sm:text-base transition-colors duration-300 px-2 py-1 whitespace-nowrap ${
            mode === "dark" ? "hover:text-red-400 bg-transparent" : ""
          }`}
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default CartItem;
