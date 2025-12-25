import React, { useState } from "react";
import { MdClose } from "react-icons/md";
import { useSelector } from "react-redux";

const AddRestaurantForm = ({ onClose, onSubmit }) => {
  const { mode } = useSelector((state) => state.theme);
  const [formData, setFormData] = useState({
    name: "",
    cuisine: "",
    location: "",
    phone: "",
    image: "🍽️",
    deliveryTime: "30-45",
    deliveryFee: "2.99",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Restaurant name is required";
    if (!formData.cuisine.trim()) newErrors.cuisine = "Cuisine type is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error adding restaurant:", error);
    } finally {
      setLoading(false);
    }
  };

  const emojis = ["🍽️", "🍕", "🍔", "🍜", "🍱", "🍣", "🌮", "🥘", "🍝", "🥗"];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div
        className={`w-full max-w-md rounded-lg shadow-xl transition-colors duration-300 ${
          mode === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        {/* Header */}
        <div
          className={`flex justify-between items-center p-6 border-b ${
            mode === "dark" ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <h2 className="text-2xl font-bold">Add Restaurant</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition ${
              mode === "dark"
                ? "hover:bg-gray-700"
                : "hover:bg-gray-100"
            }`}
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Emoji Selector */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Restaurant Icon
            </label>
            <div className="grid grid-cols-5 gap-2">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, image: emoji }))
                  }
                  className={`text-3xl p-2 rounded-lg transition ${
                    formData.image === emoji
                      ? mode === "dark"
                        ? "bg-green-600"
                        : "bg-green-400"
                      : mode === "dark"
                      ? "hover:bg-gray-700"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Restaurant Name */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Restaurant Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Pizza Palace"
              className={`w-full px-4 py-2 rounded-lg border transition ${
                errors.name
                  ? mode === "dark"
                    ? "border-red-600 bg-red-900/20"
                    : "border-red-500 bg-red-50"
                  : mode === "dark"
                  ? "border-gray-600 bg-gray-700"
                  : "border-gray-300 bg-gray-50"
              } ${mode === "dark" ? "text-white" : "text-gray-900"}`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Cuisine Type */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Cuisine Type *
            </label>
            <input
              type="text"
              name="cuisine"
              value={formData.cuisine}
              onChange={handleChange}
              placeholder="e.g., Italian, Chinese, Indian"
              className={`w-full px-4 py-2 rounded-lg border transition ${
                errors.cuisine
                  ? mode === "dark"
                    ? "border-red-600 bg-red-900/20"
                    : "border-red-500 bg-red-50"
                  : mode === "dark"
                  ? "border-gray-600 bg-gray-700"
                  : "border-gray-300 bg-gray-50"
              } ${mode === "dark" ? "text-white" : "text-gray-900"}`}
            />
            {errors.cuisine && (
              <p className="text-red-500 text-xs mt-1">{errors.cuisine}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Downtown, Mumbai"
              className={`w-full px-4 py-2 rounded-lg border transition ${
                errors.location
                  ? mode === "dark"
                    ? "border-red-600 bg-red-900/20"
                    : "border-red-500 bg-red-50"
                  : mode === "dark"
                  ? "border-gray-600 bg-gray-700"
                  : "border-gray-300 bg-gray-50"
              } ${mode === "dark" ? "text-white" : "text-gray-900"}`}
            />
            {errors.location && (
              <p className="text-red-500 text-xs mt-1">{errors.location}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g., +91-9876543210"
              className={`w-full px-4 py-2 rounded-lg border transition ${
                errors.phone
                  ? mode === "dark"
                    ? "border-red-600 bg-red-900/20"
                    : "border-red-500 bg-red-50"
                  : mode === "dark"
                  ? "border-gray-600 bg-gray-700"
                  : "border-gray-300 bg-gray-50"
              } ${mode === "dark" ? "text-white" : "text-gray-900"}`}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Delivery Time */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Delivery Time (minutes)
            </label>
            <input
              type="text"
              name="deliveryTime"
              value={formData.deliveryTime}
              onChange={handleChange}
              placeholder="e.g., 30-45"
              className={`w-full px-4 py-2 rounded-lg border transition ${
                mode === "dark"
                  ? "border-gray-600 bg-gray-700"
                  : "border-gray-300 bg-gray-50"
              } ${mode === "dark" ? "text-white" : "text-gray-900"}`}
            />
          </div>

          {/* Delivery Fee */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Delivery Fee ($)
            </label>
            <input
              type="number"
              step="0.01"
              name="deliveryFee"
              value={formData.deliveryFee}
              onChange={handleChange}
              placeholder="e.g., 2.99"
              className={`w-full px-4 py-2 rounded-lg border transition ${
                mode === "dark"
                  ? "border-gray-600 bg-gray-700"
                  : "border-gray-300 bg-gray-50"
              } ${mode === "dark" ? "text-white" : "text-gray-900"}`}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                mode === "dark"
                  ? "bg-gray-700 text-white hover:bg-gray-600"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition text-white ${
                loading
                  ? "opacity-50 cursor-not-allowed"
                  : mode === "dark"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {loading ? "Creating..." : "Create Restaurant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRestaurantForm;
