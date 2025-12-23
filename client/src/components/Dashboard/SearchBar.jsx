import React from "react";
import { MdLocationOn } from "react-icons/md";
import { useSelector } from "react-redux";

const SearchBar = ({ searchTerm, setSearchTerm, foodSuggestions, currentSuggestionIndex, locationName }) => {
  const { mode } = useSelector((state) => state.theme);

  return (
    <div className="mb-8">
      <div
        className={`flex flex-col sm:flex-row gap-2 sm:gap-0 rounded-2xl sm:rounded-full shadow-md border-2 overflow-hidden transition-colors duration-300 ${
          mode === "dark"
            ? "bg-gray-800 border-gray-600 focus-within:border-green-400"
            : "bg-white border-green-300 focus-within:border-green-500"
        }`}
      >
        {/* Location Section */}
        <div
          className={`flex items-center gap-2 px-6 py-4 sm:border-r-2 whitespace-nowrap transition-colors duration-300 ${
            mode === "dark"
              ? "bg-gray-700 sm:border-gray-600 text-gray-200"
              : "bg-green-50 sm:border-green-200 text-gray-700"
          }`}
        >
          <MdLocationOn size={24} className="text-green-600" />
          <span className="font-semibold">{locationName}</span>
        </div>

        {/* Food Search Section */}
        <input
          type="text"
          placeholder={`Search ${foodSuggestions[currentSuggestionIndex]}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`border-none flex-1 px-4 py-4 focus:outline-none text-lg transition-colors duration-300 ${
            mode === "dark"
              ? "bg-gray-800 text-white placeholder-gray-400"
              : "bg-white text-gray-900 placeholder-gray-500"
          }`}
        />
      </div>
    </div>
  );
};

export default SearchBar;
