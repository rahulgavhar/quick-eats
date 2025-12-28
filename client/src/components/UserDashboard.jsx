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
import { toast } from "react-toastify";

const UserDashboard = () => {
  const dispatch = useDispatch();
  useGetCity();
  const { userData, city } = useSelector((state) => state.user);
  const { mode } = useSelector((state) => state.theme);

  // Sample restaurant data
  const [restaurants] = useState([
    {
      id: 1,
      name: "Burger Haven",
      rating: 4.5,
      deliveryTime: "30-40 min",
      deliveryFee: "$2.99",
      image: "🍔",
      cuisine: "American",
      foods: [
        {
          id: 101,
          name: "Classic Burger",
          price: 8.99,
          image: "🍔",
          description: "Juicy beef patty with lettuce and tomato",
        },
        {
          id: 102,
          name: "Cheese Burger",
          price: 9.99,
          image: "🧀",
          description: "Double cheese with crispy bacon",
        },
        {
          id: 103,
          name: "Veggie Burger",
          price: 7.99,
          image: "🥬",
          description: "Fresh vegetables and hummus",
        },
      ],
    },
    {
      id: 2,
      name: "Pizza Palace",
      rating: 4.7,
      deliveryTime: "25-35 min",
      deliveryFee: "$1.99",
      image: "🍕",
      cuisine: "Italian",
      foods: [
        {
          id: 201,
          name: "Margherita Pizza",
          price: 12.99,
          image: "🍕",
          description: "Basil, mozzarella, and tomato",
        },
        {
          id: 202,
          name: "Pepperoni Pizza",
          price: 14.99,
          image: "🍕",
          description: "Loaded with pepperoni slices",
        },
        {
          id: 203,
          name: "Veggie Pizza",
          price: 11.99,
          image: "🥦",
          description: "Fresh vegetables and olive oil",
        },
      ],
    },
    {
      id: 3,
      name: "Sushi Supreme",
      rating: 4.8,
      deliveryTime: "20-30 min",
      deliveryFee: "$3.99",
      image: "🍣",
      cuisine: "Japanese",
      foods: [
        {
          id: 301,
          name: "California Roll",
          price: 10.99,
          image: "🍣",
          description: "Crab, avocado, and cucumber",
        },
        {
          id: 302,
          name: "Salmon Sashimi",
          price: 15.99,
          image: "🐟",
          description: "Fresh salmon slices",
        },
        {
          id: 303,
          name: "Tuna Roll",
          price: 12.99,
          image: "🍣",
          description: "Fresh tuna with rice",
        },
      ],
    },
    {
      id: 4,
      name: "Taco Fiesta",
      rating: 4.6,
      deliveryTime: "15-25 min",
      deliveryFee: "$1.49",
      image: "🌮",
      cuisine: "Mexican",
      foods: [
        {
          id: 401,
          name: "Beef Tacos",
          price: 8.99,
          image: "🌮",
          description: "Seasoned beef with salsa",
        },
        {
          id: 402,
          name: "Fish Tacos",
          price: 10.99,
          image: "🐟",
          description: "Crispy fish with slaw",
        },
        {
          id: 403,
          name: "Chicken Burrito",
          price: 9.99,
          image: "🌯",
          description: "Grilled chicken wrapped in tortilla",
        },
      ],
    },
  ]);

  const [cart, setCart] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef(null);

  // Derived user details from store with safe fallbacks
  const firstName = (
    (userData?.name || userData?.fullName || userData?.username || "User") + ""
  ).split(" ")[0];
  const roleLabel = userData?.role
    ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1)
    : null;
  const locationName = city || "Mumbai";

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
                      className={`text-3xl font-bold transition-colors duration-300 ${
                        mode === "dark" ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {selectedRestaurant.image} {selectedRestaurant.name}
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
                  {selectedRestaurant.foods.map((food) => (
                    <FoodCard
                      key={food.id}
                      food={food}
                      onAddToCart={() => addToCart(food, selectedRestaurant)}
                    />
                  ))}
                </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredRestaurants.map((restaurant) => (
                    <RestaurantCard
                      key={restaurant.id}
                      restaurant={restaurant}
                      onClick={() => setSelectedRestaurant(restaurant)}
                    />
                  ))}
                </div>
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
