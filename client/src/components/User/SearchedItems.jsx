import FoodCard from "../General/FoodCard";
import { useSelector } from "react-redux";

const SearchedItems = ({
  useSearchItems,
  searchName,
  searchCategory,
  allRestaurants,
  addToCart,
  onClearSearch,
}) => {
  const { data, loading, error } = useSearchItems({
    searchName,
    searchCategory,
    allRestaurants,
  });
  const { mode } = useSelector((state) => state.theme);

  return (
    <div className="mb-8">
      {/* Header Section */}
      {(searchName || searchCategory !== "All") && (
        <div
          className={`mb-6 p-4 rounded-lg border-l-4 border-green-500 ${
            mode === "dark" ? "bg-gray-800" : "bg-white shadow-md"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2
                className={`text-2xl font-bold ${
                  mode === "dark" ? "text-white" : "text-gray-800"
                }`}
              >
                Search Results
              </h2>
              <p
                className={`mt-1 text-sm ${
                  mode === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {searchName && `Searching for "${searchName}"`}
                {searchName && searchCategory !== "All" && " in "}
                {searchCategory !== "All" && `${searchCategory}`}
              </p>
            </div>
            <button
              onClick={onClearSearch}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2 ${
                mode === "dark"
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span>✕</span>
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, idx) => (
            <div
              key={idx}
              className={`rounded-lg shadow-md overflow-hidden border-t-4 border-green-500 animate-pulse ${
                mode === "dark" ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div
                className={`h-40 ${
                  mode === "dark"
                    ? "bg-linear-to-b from-gray-700 to-gray-600"
                    : "bg-linear-to-b from-green-100 to-cyan-100"
                }`}
              />
              <div className="p-4 space-y-3">
                <div
                  className={`h-4 rounded ${
                    mode === "dark" ? "bg-gray-700" : "bg-gray-200"
                  }`}
                />
                <div
                  className={`h-3 rounded w-2/3 ${
                    mode === "dark" ? "bg-gray-700" : "bg-gray-200"
                  }`}
                />
                <div
                  className={`h-8 rounded ${
                    mode === "dark" ? "bg-gray-700" : "bg-gray-200"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div
          className={`rounded-lg p-6 border-l-4 border-red-500 ${
            mode === "dark"
              ? "bg-red-900/20 text-red-300"
              : "bg-red-50 text-red-800"
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-bold text-lg mb-1">Error Loading Results</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && data && data.items?.length === 0 && (
        <div
          className={`rounded-lg p-12 text-center ${
            mode === "dark" ? "bg-gray-800" : "bg-white shadow-md"
          }`}
        >
          <div className="text-6xl mb-4">🔍</div>
          <h3
            className={`text-xl font-bold mb-2 ${
              mode === "dark" ? "text-white" : "text-gray-800"
            }`}
          >
            No Results Found
          </h3>
          <p
            className={`${mode === "dark" ? "text-gray-400" : "text-gray-600"}`}
          >
            We couldn't find any items matching your search criteria.
            <br />
            Try adjusting your search terms or category.
          </p>
        </div>
      )}

      {/* Results Grid */}
      {!loading && !error && data && data.items?.length > 0 && (
        <>
          <div
            className={`mb-4 text-sm font-semibold ${
              mode === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Found {data.items.length} item{data.items.length !== 1 ? "s" : ""}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data.items.map((item) => (
              <FoodCard
                key={item._id || item.id}
                food={{
                  id: item._id || item.id,
                  ...item,
                }}
                onAddToCart={() =>
                  addToCart(
                    {
                      id: item._id || item.id,
                      ...item,
                    },
                    {
                      id: item.restaurantId,
                      name: item.restaurantName || "Unknown Restaurant",
                    }
                  )
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchedItems;
