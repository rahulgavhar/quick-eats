import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import FoodCard from "../General/FoodCard";
import axios from "axios";

const SampleItems = ({ allRestaurants, addToCart }) => {
  const { mode } = useSelector((state) => state.theme);
  const [sampleItems, setSampleItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSampleItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiURL = import.meta.env.VITE_API_URL;
      
      // Converting to have only ids
      const restaurantIds = allRestaurants.map((r) => r._id);
      
      const response = await axios.post(
        `${apiURL}/api/items/samples`,
        { restaurants: restaurantIds },
        {
          withCredentials: true,
        }
      );
      
      setSampleItems(response.data || []);


    } catch (error) {
      console.error("Error fetching sample items:", error);
      setError(error.response?.data?.message || "Failed to load best picks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (allRestaurants && allRestaurants.length > 0) {
      fetchSampleItems();
    }
  }, [allRestaurants]);

  return (
    <div className="mb-8">
      {/* Header Section */}
      <div
        className={`mb-6 p-4 rounded-lg border-l-4 border-orange-500 ${
          mode === "dark" ? "bg-gray-800" : "bg-white shadow-md"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">⭐</span>
          <div>
            <h2
              className={`text-2xl font-bold ${
                mode === "dark" ? "text-white" : "text-gray-800"
              }`}
            >
              Best Picks for You
            </h2>
            <p
              className={`mt-1 text-sm ${
                mode === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Handpicked popular items from nearby restaurants
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, idx) => (
            <div
              key={idx}
              className={`rounded-lg shadow-md overflow-hidden border-t-4 border-orange-500 animate-pulse ${
                mode === "dark" ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div
                className={`h-40 ${
                  mode === "dark"
                    ? "bg-linear-to-b from-gray-700 to-gray-600"
                    : "bg-linear-to-b from-orange-100 to-yellow-100"
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
      {error && !loading && (
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
              <h3 className="font-bold text-lg mb-1">Error Loading Best Picks</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && (!sampleItems || sampleItems.length === 0) && (
        <div
          className={`rounded-lg p-12 text-center ${
            mode === "dark" ? "bg-gray-800" : "bg-white shadow-md"
          }`}
        >
          <div className="text-6xl mb-4">🍽️</div>
          <h3
            className={`text-xl font-bold mb-2 ${
              mode === "dark" ? "text-white" : "text-gray-800"
            }`}
          >
            No Best Picks Available
          </h3>
          <p
            className={`${mode === "dark" ? "text-gray-400" : "text-gray-600"}`}
          >
            We're working on finding the best items for you.
            <br />
            Check back soon or explore nearby restaurants.
          </p>
        </div>
      )}

      {/* Items Grid */}
      {!loading && !error && sampleItems && sampleItems.length > 0 && (
        <>
          <div
            className={`mb-4 text-sm font-semibold ${
              mode === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {sampleItems.length} featured item{sampleItems.length !== 1 ? "s" : ""}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sampleItems.map((item) => (
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

export default SampleItems;
