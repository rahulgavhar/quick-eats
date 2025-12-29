import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../redux/slices/userSlice";
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
import Footer from "./General/Footer";
import useGetCity from "../hooks/useGetCity";
import useNearbyRestaurants from "../hooks/useNearbyRestaurants";
import useGetItems from "../hooks/useGetItems";
import { toast } from "react-toastify";

const UserDashboard = () => {
  const dispatch = useDispatch();
  useGetCity();

  const { userData, city } = useSelector((state) => state.user);
  const { mode } = useSelector((state) => state.theme);


  // Local state
  const [cart, setCart] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef(null);

  
  const { data: restaurants, loading, error, pagination: restaurantPagination, nextPage: nextRestaurantPage, previousPage: previousRestaurantPage, goToPage: goToRestaurantPage } = useNearbyRestaurants();
  const { items: restaurantItems, loading: itemsLoading, pagination, nextPage, previousPage, goToPage } = useGetItems(selectedRestaurant?.id);

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

  const addToCart = (food, restaurant) => {
    const existingItem = cart.find(
      (item) => item.id === food.id && item.restaurantId === restaurant.id
    );

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === food.id && item.restaurantId === restaurant.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          ...food,
          restaurantId: restaurant.id,
          quantity: 1,
          restaurantName: restaurant.name,
        },
      ]);
    }
  };

  const removeFromCart = (foodId, restaurantId) => {
    setCart(
      cart.filter(
        (item) => !(item.id === foodId && item.restaurantId === restaurantId)
      )
    );
  };

  const updateQuantity = (foodId, restaurantId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(foodId, restaurantId);
    } else {
      setCart(
        cart.map((item) =>
          item.id === foodId && item.restaurantId === restaurantId
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const calculateTotal = () => {
    return cart
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  const filteredRestaurants = restaurants.filter(
    (restaurant) =>
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    const deliveryTo = userData?.address?.street
      ? `${userData.address.street}${
          userData.address.city ? ", " + userData.address.city : ""
        }`
      : userData?.address || locationName;
    alert(
      `Order placed! Total: $${calculateTotal()}\nDelivery to: ${deliveryTo}`
    );
    setCart([]);
    setShowCart(false);
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
        cart={cart}
        showCart={showCart}
        setShowCart={setShowCart}
        showProfileDropdown={showProfileDropdown}
        setShowProfileDropdown={setShowProfileDropdown}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        dropdownRef={dropdownRef}
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
        cart={cart}
        setShowCart={setShowCart}
        handleLogout={handleLogout}
      />

      <div className="max-w-7xl mx-auto p-6">
        {!showCart ? (
          <>
            {/* Search Bar */}
            <SearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              foodSuggestions={foodSuggestions}
              currentSuggestionIndex={currentSuggestionIndex}
              locationName={locationName}
            />

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
                      {selectedRestaurant.image && (selectedRestaurant.image.startsWith('http') || selectedRestaurant.image.startsWith('/')) ? (
                        <img
                          src={selectedRestaurant.image}
                          alt={selectedRestaurant.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      ) : (
                        <span className="text-3xl">{selectedRestaurant.image}</span>
                      )}
                      {selectedRestaurant.name}
                    </h2>
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
                            ...food
                          }}
                          onAddToCart={() => addToCart({
                            id: food._id || food.id,
                            ...food
                          }, selectedRestaurant)}
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
                <h2
                  className={`text-xl font-bold mb-6 transition-colors duration-300 ${
                    mode === "dark" ? "text-white" : "text-gray-800"
                  }`}
                >
                  Popular Restaurants Around You
                </h2>
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
                      {filteredRestaurants.map((restaurant) => (
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
                          {[...Array(restaurantPagination.totalPages)].map((_, idx) => {
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
                          })}
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
                  {cart.length === 0 ? (
                    <p
                      className={`text-center py-8 transition-colors duration-300 ${
                        mode === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Your cart is empty. Add some delicious food!
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
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
                cart={cart}
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
