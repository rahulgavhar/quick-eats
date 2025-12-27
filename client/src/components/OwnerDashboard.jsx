import React, { useState, useEffect, useRef, use } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../redux/slices/userSlice";
import { persistor } from "../redux/store";
import axios from "axios";
import { ownerSliceActions } from "../redux/slices/ownerSlice.js";

// Import Owner components
import OwnerHeader from "./Owner/OwnerHeader";
import OwnerProfileDropdown from "./Owner/OwnerProfileDropdown";
import RestaurantOverview from "./Owner/RestaurantOverview";
import AddRestaurantForm from "./Owner/AddRestaurantForm";
import AddItemForm from "./Owner/AddItemForm";
import ManageRestaurant from "./Owner/ManageRestaurant";
import Footer from "./General/Footer";
import { toast } from "react-toastify";
import Loader from "./General/Loader";

const OwnerDashboard = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const { mode } = useSelector((state) => state.theme);
  const apiURL = import.meta.env.VITE_API_URL;
  const reduxRestaurantData = useSelector(
    (state) => state.owner.restaurantData
  );

  // State management
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAddRestaurant, setShowAddRestaurant] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showManageRestaurant, setShowManageRestaurant] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Sample restaurant data (would be fetched from API)
  const [restaurant, setRestaurant] = useState(reduxRestaurantData || null);

  useEffect(() => {
    if (restaurant) return;

    // Simulate fetching restaurant data
    const fetchRestaurant = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${apiURL}/api/restaurants/owner`, {
          withCredentials: true,
        });

        if (response.data.code !== 404) {
          setRestaurant({
            name: response.data.restaurant.name,
            city: response.data.restaurant.city,
            state: response.data.restaurant.state,
            phone: response.data.profile.phone,
            email: response.data.profile.email,
            image: response.data.profile.image,
            location: response.data.profile.address,
            rating: response.data.restaurant.rating,
            isOpen: response.data.restaurant.isOpen,
            latitude: response.data.restaurant.location.coordinates[1],
            longitude: response.data.restaurant.location.coordinates[0],
            cuisine: response.data.profile.cuisine,
            id: response.data.restaurant._id,
          });
          dispatch(ownerSliceActions.setRestaurant(restaurant));
        }
      } catch (error) {
        console.error("Error fetching restaurant:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, []);

  useEffect(() => {
    // Update Redux store with restaurant data
    dispatch(ownerSliceActions.setRestaurant(restaurant));
  }, [restaurant]);

  // Fetching Items
  useEffect(() => {
    if (!restaurant || !restaurant.id) return;

    const fetchItems = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${apiURL}/api/items/restaurant`, {
          params: { restaurantId: restaurant.id },
          withCredentials: true,
        });
        setRestaurant((prev) => ({
          ...prev,
          items: response.data.items,
        }));
        dispatch(ownerSliceActions.setItems(response.data.items));
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [restaurant?.id]);

  // Derived user details
  const firstName = (
    (userData?.name || userData?.fullName || userData?.username || "Owner") + ""
  ).split(" ")[0];

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

  // Handle logout
  const handleLogout = async () => {
    await dispatch(logoutUser()).unwrap();
    await persistor.purge();
    setShowProfileDropdown(false);
    toast.success("Logged out successfully");
  };

  // Handle add restaurant
  const handleAddRestaurant = async (formData) => {
    setLoading(true);
    try {
      // Fetching address from coordinates could be done here
      const address = await axios.get(`${apiURL}/api/restaurants/address`, {
        params: {
          lat: formData.latitude,
          lon: formData.longitude,
        },
        withCredentials: true,
      });

      // API call to create restaurant would go here
      const newRestaurant = {
        ...formData,
        address: address.data.address,
      };

      // uploading data with image file
      const response = await axios.post(
        `${apiURL}/api/restaurants/create`,
        newRestaurant,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      const fetchedRestaurant = {
        id: response.data.restaurant._id,
        name: response.data.restaurant.name,
        city: response.data.restaurant.city,
        state: response.data.restaurant.state,
        phone: response.data.profile.phone,
        email: response.data.profile.email,
        coverPhoto: response.data.profile.image,
        location: response.data.profile.address,
        rating: response.data.restaurant.rating,
        isOpen: response.data.restaurant.isOpen,
        latitude: response.data.restaurant.location.coordinates[1],
        longitude: response.data.restaurant.location.coordinates[0],
        cuisine: response.data.profile.cuisine,
      };

      setRestaurant(fetchedRestaurant);

      dispatch(ownerSliceActions.setRestaurant(fetchedRestaurant));

      setShowAddRestaurant(false);
      // Show success toast
      toast.success("Restaurant created successfully");
    } catch (error) {
      console.error("Error:", error);
      // Show error toast
      toast.error("Could not create restaurant. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit restaurant
  const handleEditRestaurant = async (formData) => {
    setLoading(true);
    try {
      await axios.put(
        `${apiURL}/api/restaurants/edit/${restaurant.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      setRestaurant((prev) => ({
        ...prev,
        ...formData,
      }));
      setShowAddRestaurant(false);
      // Show success toast
      toast.success("Restaurant updated successfully");
    } catch (error) {
      console.error("Error:", error);
      // Show error toast
      toast.error("Could not update restaurant. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete restaurant
  const handleDeleteRestaurant = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this restaurant? This action cannot be undone."
      )
    ) {
      setRestaurant(null);
      dispatch(ownerSliceActions.clearRestaurant());
      await axios.delete(`${apiURL}/api/items/restaurant/${restaurant.id}`, {
        withCredentials: true,
      });
      await axios.delete(`${apiURL}/api/restaurants/delete/${restaurant.id}`, {
        withCredentials: true,
      });
      // Show success toast
      toast.success("Restaurant deleted successfully");
    }
  };

  // Handle add item
  const handleAddItem = async (formData) => {
    setLoading(true);

    if (restaurant == null) {
      toast.error("Please create a restaurant first.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${apiURL}/api/items/create/${restaurant.id}`,
        formData,
        {
          withCredentials: true,
        }
      );

      const addedItem = response.data.item;

      if (restaurant) {
        setRestaurant((prev) => ({
          ...prev,
          items: [
            ...prev.items,
            {
              ...addedItem
            },
          ],
        }));
      }

      setShowAddItem(false);
      dispatch(
        ownerSliceActions.addItemToRestaurant({
          ...addedItem
        })
      );
      // Show success toast
      toast.success("Item added successfully");
    } catch (error) {
      console.error("Error:", error);
      // Show error toast
      toast.error("Could not add item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete item
  const handleDeleteItem = async (itemId) => {
    if (!restaurant) return;
    if (window.confirm("Are you sure you want to delete this item?")) {
      await axios.delete(`${apiURL}/api/items/delete/${itemId}`, {
        withCredentials: true,
      });
      setRestaurant((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item._id !== itemId),
      }));
    }
    dispatch(ownerSliceActions.deleteItemFromRestaurant(itemId));
    toast.success("Item deleted successfully");
  };

  // Handle update item
  const handleUpdateItem = async (itemId, updatedData) => {
    if (!restaurant) return;

    await axios.put(`${apiURL}/api/items/edit/${itemId}`, updatedData, {
      withCredentials: true,
    });

    setRestaurant((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item._id === itemId ? { ...item, ...updatedData } : item
      ),
    }));
    
    dispatch(
      ownerSliceActions.updateItemInRestaurant({ id: itemId, updatedData })
    );
    toast.success("Item updated successfully");
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        mode === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {loading && <Loader />}

      {/* Header */}
      <OwnerHeader
        firstName={firstName}
        hasRestaurant={!!restaurant}
        onAddRestaurant={() => setShowAddRestaurant(true)}
        onAddItem={() => setShowAddItem(true)}
        onManageRestaurant={() => setShowManageRestaurant(true)}
        handleLogout={handleLogout}
        showProfileDropdown={showProfileDropdown}
        setShowProfileDropdown={setShowProfileDropdown}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        dropdownRef={dropdownRef}
        ProfileDropdown={
          <OwnerProfileDropdown
            handleLogout={handleLogout}
            setShowProfileDropdown={setShowProfileDropdown}
            onManageRestaurant={() => {
              setShowManageRestaurant(true);
              setShowProfileDropdown(false);
            }}
          />
        }
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 max-md:p-3">
        {/* Restaurant Overview Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6">Your Restaurant</h2>
          <RestaurantOverview
            restaurant={restaurant}
            onManage={() => setShowManageRestaurant(true)}
            onDelete={handleDeleteRestaurant}
          />
        </div>

        {/* Quick Stats */}
        {restaurant && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div
              className={`p-6 rounded-lg border transition-colors duration-300 ${
                mode === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <p
                className={`text-sm font-semibold ${
                  mode === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Menu Items
              </p>
              <p className="text-4xl font-bold text-green-600 mt-2">
                {restaurant.items?.length || 0}
              </p>
            </div>

            <div
              className={`p-6 rounded-lg border transition-colors duration-300 ${
                mode === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <p
                className={`text-sm font-semibold ${
                  mode === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Restaurant Rating
              </p>
              <p className="text-4xl font-bold text-yellow-500 mt-2">
                ⭐ {restaurant.rating}
              </p>
            </div>

            <div
              className={`p-6 rounded-lg border transition-colors duration-300 ${
                mode === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <p
                className={`text-sm font-semibold ${
                  mode === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Status
              </p>
              <p className="text-4xl font-bold mt-2">
                {restaurant.isOpen ? "🟢 Open" : "🔴 Closed"}
              </p>
            </div>
          </div>
        )}

        {/* Get Started Section */}
        {!restaurant && (
          <div
            className={`p-12 rounded-lg border-2 border-dashed text-center transition-colors duration-300 ${
              mode === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-300"
            }`}
          >
            <p className="text-4xl mb-4">🍽️</p>
            <h3 className="text-2xl font-bold mb-2">
              Welcome to Your Dashboard
            </h3>
            <p
              className={`mb-6 ${
                mode === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              You haven't added a restaurant yet. Get started by creating your
              first restaurant!
            </p>
            <button
              onClick={() => setShowAddRestaurant(true)}
              className={`px-8 py-3 rounded-lg font-bold text-white transition ${
                mode === "dark"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              Create Restaurant
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      {showAddRestaurant && (
        <AddRestaurantForm
          onClose={() => setShowAddRestaurant(false)}
          onSubmit={handleAddRestaurant}
        />
      )}

      {showAddItem && (
        <AddItemForm
          onClose={() => setShowAddItem(false)}
          onSubmit={handleAddItem}
        />
      )}

      {showManageRestaurant && (
        <ManageRestaurant
          onEdit={handleEditRestaurant}
          restaurant={restaurant}
          onClose={() => setShowManageRestaurant(false)}
          onAddItem={(item) => {
            setShowAddItem(false);
            handleAddItem(item);
          }}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
        />
      )}
    </div>
  );
};

export default OwnerDashboard;
