import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import FoodCard from "../General/FoodCard";
import axios from "axios";

const SampleItems = ({ allRestaurants, addToCart }) => {
  const { mode } = useSelector((state) => state.theme);
  const [sampleItems, setSampleItems] = useState([]);
  const [fetchedItems, setFetchedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 280; // w-64 (256px) + gap (16px) + padding
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 300);
    }
  };

  const handleRightArrowClick = () => {
    scroll("right");
    fetchOnScroll();
  };

  const fetchOnScroll = async () => {
    try {
      const apiURL = import.meta.env.VITE_API_URL;

      // Converting to have only ids
      const restaurantIds = allRestaurants.map((r) => r._id);

      const response = await axios.post(
        `${apiURL}/api/items/samples`,
        { restaurants: restaurantIds, fetchedItems, size: 2 },
        {
          withCredentials: true,
        }
      );
      setSampleItems((prev) => [...prev, ...(response.data || [])]);
      setFetchedItems((prev) => [
        ...prev,
        ...response.data.map((item) => item._id || item.id),
      ]);
    } catch (error) {
      console.error("Error fetching sample items:", error);
      setError(error.response?.data?.message || "Failed to load best picks");
    }
  };

  const fetchSampleItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiURL = import.meta.env.VITE_API_URL;

      // Converting to have only ids
      const restaurantIds = allRestaurants.map((r) => r._id);

      const response = await axios.post(
        `${apiURL}/api/items/samples`,
        { restaurants: restaurantIds, fetchedItems, size: 6 },
        {
          withCredentials: true,
        }
      );

      setSampleItems(response.data || []);
      setFetchedItems((prev) => [
        ...prev,
        ...response.data.map((item) => item._id || item.id),
      ]);
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

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [sampleItems]);

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
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-transparent">
          {[...Array(8)].map((_, idx) => (
            <div
              key={idx}
              className={`shrink-0 w-64 rounded-lg shadow-md overflow-hidden border-t-4 border-orange-500 animate-pulse ${
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
              <h3 className="font-bold text-lg mb-1">
                Error Loading Best Picks
              </h3>
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

      {/* Items Horizontal Scroll */}
      {!loading && !error && sampleItems && sampleItems.length > 0 && (
        <>
          <div
            className={`mb-4 text-sm font-semibold flex justify-end ${
              mode === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            <span className="font-bold">
              {sampleItems.length} featured item
              {sampleItems.length !== 1 ? "s" : ""}
            </span>{" "}
          </div>
          <div className="relative group">
            {/* Left Arrow Button */}
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white p-2 rounded-full shadow-lg transition-all ${
                !canScrollLeft ? "opacity-50 hidden" : "opacity-100"
              }`}
              aria-label="Scroll left"
            >
              <MdChevronLeft size={24} />
            </button>

            {/* Carousel Container */}
            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-hidden pb-4"
              onScroll={checkScroll}
            >
              {sampleItems.map((item) => (
                <div key={item._id || item.id} className="shrink-0 w-64">
                  <FoodCard
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
                </div>
              ))}
            </div>

            {/* Right Arrow Button */}
            <button
              onClick={handleRightArrowClick}
              disabled={!canScrollRight}
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white p-2 rounded-full shadow-lg transition-all ${
                !canScrollRight ? "opacity-50 hidden" : "opacity-100"
              }`}
              aria-label="Scroll right"
            >
              <MdChevronRight size={24} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SampleItems;
