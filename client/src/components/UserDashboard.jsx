import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser, userSliceActions } from "../redux/slices/userSlice";
import { persistor } from "../redux/store";

// Import child components
import Header from "./User/UserHeader";
import ProfileDropdown from "./User/UserProfileDropdown";
import MobileMenu from "./User/UserMobileMenu";
import SearchBar from "./User/SearchBar";
import RestaurantCard from "./User/RestaurantCard";
import FoodCard from "./General/FoodCard";
import CartItem from "./User/CartItem";
import OrderSummary from "./User/OrderSummary";
import ShowOnMap from "./User/ShowOnMap";
import Footer from "./General/Footer";
import useGetCity from "../hooks/useGetCity";
import useNearbyRestaurants from "../hooks/useNearbyRestaurants";
import useGetItems from "../hooks/useGetItems";
import useSearchItems from "../hooks/useSearchItems";
import { toast } from "react-toastify";
import SearchedItems from "./User/SearchedItems";
import SampleItems from "./User/SampleItems";
import BeatLoader from "react-spinners/BeatLoader";
import Popup from "reactjs-popup";
import { useNavigate } from "react-router-dom";

const UserDashboard = ({
  activePopup,
  popupShown,
  setActivePopup,
  setPopupShown,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get city from custom hook
  useGetCity();

  const { userData, city } = useSelector((state) => state.user);
  const { mode } = useSelector((state) => state.theme);

  // Local state
  const cartItems = useSelector((state) => state.user.cartItems);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef(null);
  const developer_coords = useSelector((state) => state.user.developer_coords);

  const {
    data: restaurants,
    loading,
    error,
    pagination: restaurantPagination,
    nextPage: nextRestaurantPage,
    previousPage: previousRestaurantPage,
    goToPage: goToRestaurantPage,
    allRestaurants,
  } = useNearbyRestaurants();
  const {
    items: restaurantItems,
    loading: itemsLoading,
    pagination,
    nextPage,
    previousPage,
    goToPage,
  } = useGetItems(selectedRestaurant?.id);

  // Derived user details from store with safe fallbacks
  const firstName = (
    (userData?.name || userData?.fullName || userData?.username || "User") + ""
  ).split(" ")[0];
  const roleLabel = userData?.role
    ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1)
    : null;
  const locationName = city || "";

  // Food suggestions for dynamic placeholder
  const foodSuggestions = [
    "Burger",
    "Pizza",
    "Sushi",
    "Tacos",
    "Pasta",
    "Biryani",
    "Fried Chicken",
    "Samosa",
    "Dosa",
    "Noodles",
  ];

  // Dynamic placeholder animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSuggestionIndex((prev) => (prev + 1) % foodSuggestions.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Show popup once when developer location is active
  useEffect(() => {
    if (developer_coords && !popupShown) {
      setActivePopup(true);
      setPopupShown(true);
    }
  }, [developer_coords, popupShown]);

  // Reset popup flag when switching away from developer location
  useEffect(() => {
    if (!developer_coords) {
      setPopupShown(false);
    }
  }, [developer_coords]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutUser()).unwrap();
    await persistor.purge();
    setShowProfileDropdown(false);
    toast.success("Logged out successfully!");
  };

  const setToDeveloperLocation = useCallback(
    async (close, { city, lat, lon }) => {
      
      dispatch(userSliceActions.setCity(city));
      dispatch(userSliceActions.setState("Maharashtra"));
      dispatch(
        userSliceActions.setCoords({
          lat,
          lon,
        })
      );

      dispatch(userSliceActions.toDev(true));
      dispatch(userSliceActions.setFetchedAt(null)); // Force refetching restaurants
      if (close) close();
    },
    [dispatch]
  );

  const setToCurrentLocation = useCallback(
    async (close) => {
      navigator.geolocation.getCurrentPosition((position => {
        const { latitude, longitude } = position.coords;
        dispatch(userSliceActions.setCoords({
          lat: latitude,
          lon: longitude,
        }));
      }));
      dispatch(userSliceActions.toDev(false));
      dispatch(userSliceActions.setFetchedAt(null)); // Force refetching restaurants
      if (close) close();
    },
    [dispatch]
  );

  const addToCart = (food, restaurant) => {
    dispatch(
      userSliceActions.addOrIncrementCartItem({
        ...food,
        id: food.id,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
      })
    );
  };

  const removeFromCart = (foodId, restaurantId) => {
    dispatch(userSliceActions.removeCartItem({ id: foodId, restaurantId }));
  };

  const updateQuantity = (foodId, restaurantId, quantity) => {
    dispatch(
      userSliceActions.updateCartQuantity({
        id: foodId,
        restaurantId,
        quantity,
      })
    );
  };

  const calculateTotal = () => {
    return cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty. Add some items before checkout.");
      return;
    }
    navigate("/checkout");
  };

  return (
    <div
      className={`w-full min-h-screen transition-colors duration-300 ${
        mode === "dark"
          ? "bg-linear-to-br from-gray-900 to-gray-800"
          : "bg-linear-to-br from-green-50 to-cyan-50"
      }`}
    >
      {/* Header */}
      <Header
        firstName={firstName}
        roleLabel={roleLabel}
        cart={cartItems}
        showCart={showCart}
        setShowCart={setShowCart}
        showProfileDropdown={showProfileDropdown}
        setShowProfileDropdown={setShowProfileDropdown}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        dropdownRef={dropdownRef}
        setToDeveloperLocation={setToDeveloperLocation}
        setToCurrentLocation={setToCurrentLocation}
        city={city}
        ProfileDropdown={() => (
          <ProfileDropdown
            handleLogout={handleLogout}
            setShowProfileDropdown={setShowProfileDropdown}
          />
        )}
      />

      {/* Mobile Menu */}
      <MobileMenu
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        cart={cartItems}
        setShowCart={setShowCart}
        handleLogout={handleLogout}
        setToDeveloperLocation={setToDeveloperLocation}
        setToCurrentLocation={setToCurrentLocation}
        city={city}
      />

      {/* Warning Popup to Change Location */}
      <Popup
        open={activePopup}
        closeOnDocumentClick={false}
        onClose={() => setActivePopup(false)}
        modal
        nested
      >
        {(close) => (
          <div
            className={`rounded-lg p-4 sm:p-6 w-96 max-w-[90vw] shadow-xl ${
              mode === "dark"
                ? "bg-gray-800 text-yellow-300"
                : "bg-white text-yellow-800"
            }`}
          >
            <div className="text-center">
              <h2 className="text-lg sm:text-xl font-bold mb-3 flex items-center justify-center gap-2 flex-wrap">
                <span className="text-2xl sm:text-3xl">⚠️</span>
                <span>Developer Location Active</span>
              </h2>
              <p className="mb-4 text-sm sm:text-base">
                Currently viewing the developer's location (Panvel). To see
                restaurants near you, please change your location.
              </p>
              <button
                onClick={close}
                className={`px-4 sm:px-6 py-2 rounded-lg font-semibold transition-colors duration-200 text-sm sm:text-base ${
                  mode === "dark"
                    ? "bg-yellow-700 text-yellow-300 hover:bg-yellow-600"
                    : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                }`}
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </Popup>

      <div className="max-w-7xl mx-auto p-6">
        {!showCart ? (
          <>
            {/* Search Bar */}
            <SearchBar
              setSearchName={setSearchName}
              setSearchCategory={setSearchCategory}
              foodSuggestions={foodSuggestions}
              currentSuggestionIndex={currentSuggestionIndex}
              locationName={locationName}
              setSelectedRestaurant={setSelectedRestaurant}
            />

            {!selectedRestaurant && (
              <>
                {!(
                  searchName ||
                  (searchCategory && searchCategory != "All")
                ) ? (
                  <>
                    {/* Initial Recomendations */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <h2
                          className={`text-xl font-bold transition-colors duration-300 ${
                            mode === "dark" ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {" "}
                          Best Matches for You{" "}
                        </h2>
                        {loading && <BeatLoader color="#22c55e" size={8} />}
                      </div>

                      {/* Sample Items*/}
                      {!loading && (
                        <SampleItems
                          allRestaurants={allRestaurants}
                          addToCart={addToCart}
                        />
                      )}
                    </div>
                  </>
                ) : (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2
                        className={`text-xl font-bold transition-colors duration-300 ${
                          mode === "dark" ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {" "}
                        Search Results{" "}
                      </h2>
                    </div>

                    {/* Searched Items from useSearchItems*/}
                    <SearchedItems
                      useSearchItems={useSearchItems}
                      searchName={searchName}
                      searchCategory={searchCategory}
                      allRestaurants={allRestaurants}
                      addToCart={addToCart}
                      onClearSearch={() => {
                        setSearchName("");
                        setSearchCategory("All");
                      }}
                    />
                  </div>
                )}
              </>
            )}

            {selectedRestaurant ? (
              <>
                {/* Back Button & Restaurant Header */}
                <div className="mb-6">
                  <button
                    onClick={() => setSelectedRestaurant(null)}
                    className="bg-green-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-600 transition"
                  >
                    ← Back to Restaurants
                  </button>
                  <div
                    className={`mt-4 rounded-lg p-6 shadow-md border-l-4 border-green-500 transition-colors duration-300 ${
                      mode === "dark" ? "bg-gray-800" : "bg-white"
                    }`}
                  >
                    <h2
                      className={`text-3xl font-bold transition-colors duration-300 flex items-center gap-3 ${
                        mode === "dark" ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {selectedRestaurant.image &&
                      (selectedRestaurant.image.startsWith("http") ||
                        selectedRestaurant.image.startsWith("/")) ? (
                        <img
                          src={selectedRestaurant.image}
                          className="w-12 h-12 rounded object-cover"
                        />
                      ) : (
                        <span className="text-3xl">
                          {selectedRestaurant.image}
                        </span>
                      )}
                      {selectedRestaurant.name}
                    </h2>
                    {/* Address */}
                    <p
                      className={`mt-2 transition-colors duration-300 ${
                        mode === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {" "}
                      {selectedRestaurant.address}
                    </p>
                    <div
                      className={`flex max-[430px]:flex-col max-[430px]:gap-2 gap-6 mt-3 transition-colors duration-300 ${
                        mode === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      <span>⭐ {selectedRestaurant.rating}</span>
                      <span>⏱️ {selectedRestaurant.deliveryTime}</span>
                      <span>💵 Delivery: {selectedRestaurant.deliveryFee}</span>
                    </div>
                  </div>
                </div>

                {/* Food Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {itemsLoading ? (
                    <>
                      {[...Array(6)].map((_, idx) => (
                        <div
                          key={idx}
                          className={`rounded-lg shadow-md overflow-hidden border-t-4 border-green-500 animate-pulse ${
                            mode === "dark" ? "bg-gray-800" : "bg-white"
                          }`}
                        >
                          <div
                            className={`h-40 transition-colors duration-300 ${
                              mode === "dark"
                                ? "bg-linear-to-b from-gray-700 to-gray-600"
                                : "bg-linear-to-b from-green-100 to-cyan-100"
                            }`}
                          />
                          <div className="p-4 space-y-3">
                            <div
                              className={`h-4 rounded transition-colors duration-300 ${
                                mode === "dark" ? "bg-gray-700" : "bg-gray-200"
                              }`}
                            />
                            <div
                              className={`h-3 rounded w-2/3 transition-colors duration-300 ${
                                mode === "dark" ? "bg-gray-700" : "bg-gray-200"
                              }`}
                            />
                            <div
                              className={`h-8 rounded transition-colors duration-300 ${
                                mode === "dark" ? "bg-gray-700" : "bg-gray-200"
                              }`}
                            />
                          </div>
                        </div>
                      ))}
                    </>
                  ) : restaurantItems.length > 0 ? (
                    <>
                      {restaurantItems.map((food) => (
                        <FoodCard
                          key={food._id || food.id}
                          food={{
                            id: food._id || food.id,
                            ...food,
                          }}
                          onAddToCart={() =>
                            addToCart(
                              {
                                id: food._id || food.id,
                                ...food,
                              },
                              selectedRestaurant
                            )
                          }
                        />
                      ))}
                    </>
                  ) : (
                    <div
                      className={`col-span-full text-center py-12 rounded-lg ${
                        mode === "dark" ? "bg-gray-800" : "bg-white"
                      }`}
                    >
                      <p
                        className={`transition-colors duration-300 ${
                          mode === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        No items available at this restaurant.
                      </p>
                    </div>
                  )}
                </div>

                {/* Pagination Controls */}
                {restaurantItems.length > 0 && pagination.totalPages > 1 && (
                  <div className="mt-8 flex justify-center items-center gap-4">
                    <button
                      onClick={previousPage}
                      disabled={!pagination.hasPreviousPage}
                      className={`px-6 py-2 rounded-lg font-semibold transition ${
                        pagination.hasPreviousPage
                          ? "bg-green-500 text-white hover:bg-green-600 cursor-pointer"
                          : "bg-gray-300 text-gray-600 cursor-not-allowed"
                      }`}
                    >
                      ← Previous
                    </button>

                    <div
                      className={`flex gap-2 items-center ${
                        mode === "dark" ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {[...Array(pagination.totalPages)].map((_, idx) => {
                        const pageNum = idx + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => goToPage(pageNum)}
                            className={`px-3 py-1 rounded transition ${
                              pagination.currentPage === pageNum
                                ? "bg-green-500 text-white font-bold"
                                : mode === "dark"
                                ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={nextPage}
                      disabled={!pagination.hasNextPage}
                      className={`px-6 py-2 rounded-lg font-semibold transition ${
                        pagination.hasNextPage
                          ? "bg-green-500 text-white hover:bg-green-600 cursor-pointer"
                          : "bg-gray-300 text-gray-600 cursor-not-allowed"
                      }`}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Restaurants Grid */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                  <h2
                    className={`text-xl font-bold transition-colors duration-300 ${
                      mode === "dark" ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Popular Restaurants Around You
                  </h2>
                  {restaurants && restaurants.length > 0 && (
                    <div className="flex justify-end">
                      <ShowOnMap restaurants={allRestaurants} />
                    </div>
                  )}
                </div>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, idx) => (
                      <div
                        key={idx}
                        className={`rounded-lg shadow-md overflow-hidden border-t-4 border-green-500 animate-pulse ${
                          mode === "dark" ? "bg-gray-800" : "bg-white"
                        }`}
                      >
                        <div
                          className={`h-32 transition-colors duration-300 ${
                            mode === "dark"
                              ? "bg-linear-to-b from-gray-700 to-gray-600"
                              : "bg-linear-to-b from-green-100 to-cyan-100"
                          }`}
                        />
                        <div className="p-4 space-y-3">
                          <div
                            className={`h-4 rounded transition-colors duration-300 ${
                              mode === "dark" ? "bg-gray-700" : "bg-gray-200"
                            }`}
                          />
                          <div
                            className={`h-3 rounded w-2/3 transition-colors duration-300 ${
                              mode === "dark" ? "bg-gray-700" : "bg-gray-200"
                            }`}
                          />
                          <div
                            className={`h-8 rounded transition-colors duration-300 ${
                              mode === "dark" ? "bg-gray-700" : "bg-gray-200"
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {restaurants.map((restaurant) => (
                        <RestaurantCard
                          key={restaurant.id}
                          restaurant={restaurant}
                          onClick={() => setSelectedRestaurant(restaurant)}
                        />
                      ))}
                    </div>

                    {/* Restaurant Pagination Controls */}
                    {restaurantPagination.totalPages > 1 && (
                      <div className="mt-8 flex justify-center items-center gap-4">
                        <button
                          onClick={previousRestaurantPage}
                          disabled={!restaurantPagination.hasPreviousPage}
                          className={`px-6 py-2 rounded-lg font-semibold transition ${
                            restaurantPagination.hasPreviousPage
                              ? "bg-green-500 text-white hover:bg-green-600 cursor-pointer"
                              : "bg-gray-300 text-gray-600 cursor-not-allowed"
                          }`}
                        >
                          ← Previous
                        </button>

                        <div
                          className={`flex gap-2 items-center ${
                            mode === "dark" ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {[...Array(restaurantPagination.totalPages)].map(
                            (_, idx) => {
                              const pageNum = idx + 1;
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => goToRestaurantPage(pageNum)}
                                  className={`px-3 py-1 rounded transition ${
                                    restaurantPagination.currentPage === pageNum
                                      ? "bg-green-500 text-white font-bold"
                                      : mode === "dark"
                                      ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            }
                          )}
                        </div>

                        <button
                          onClick={nextRestaurantPage}
                          disabled={!restaurantPagination.hasNextPage}
                          className={`px-6 py-2 rounded-lg font-semibold transition ${
                            restaurantPagination.hasNextPage
                              ? "bg-green-500 text-white hover:bg-green-600 cursor-pointer"
                              : "bg-gray-300 text-gray-600 cursor-not-allowed"
                          }`}
                        >
                          Next →
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </>
        ) : (
          <>
            {/* Cart View */}
            <div className="mb-6">
              <button
                onClick={() => setShowCart(false)}
                className="bg-green-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-600 transition"
              >
                ← Continue Shopping
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div
                  className={`rounded-lg shadow-md p-6 transition-colors duration-300 ${
                    mode === "dark" ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <h2
                    className={`text-2xl font-bold mb-6 transition-colors duration-300 ${
                      mode === "dark" ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Your Cart
                  </h2>
                  {cartItems.length === 0 ? (
                    <p
                      className={`text-center py-8 transition-colors duration-300 ${
                        mode === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Your cart is empty. Add some delicious food!
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <CartItem
                          key={`${item.id}-${item.restaurantId}`}
                          item={item}
                          onUpdateQuantity={updateQuantity}
                          onRemove={removeFromCart}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <OrderSummary
                cart={cartItems}
                calculateTotal={calculateTotal}
                onCheckout={handleCheckout}
                locationName={locationName}
              />
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default UserDashboard;
