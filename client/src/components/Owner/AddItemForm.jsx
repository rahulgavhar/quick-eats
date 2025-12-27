import React, { useState } from "react";
import { MdClose } from "react-icons/md";
import { useSelector } from "react-redux";

const AddItemForm = ({ onClose, onSubmit, initial, onSave }) => {
  const { mode } = useSelector((state) => state.theme);
  const [formData, setFormData] = useState({
    name: `${initial?.name || ""}`,
    description: `${initial?.description || ""}`,
    price: `${initial?.price || ""}`,
    category: `${initial?.category || ""}`,
    image: `${initial?.image || "🍕"}`,
    isVegetarian: false,
    isAvailable: true,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Item name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.price || formData.price <= 0) newErrors.price = "Valid price is required";
    if (!formData.category.trim()) newErrors.category = "Category is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if(formData.isVegetarian) {
      formData.foodType = "Vegetarian";
    } else {
      formData.foodType = "Non-Vegetarian";
    }

    setLoading(true);
    try {
      if(initial) {
        onSave(formData);
        return;
      }
      await onSubmit(formData);
    } catch (error) {
      console.error("Error adding item:", error);
    } finally {
      setLoading(false);
    }
  };

  const foodEmojis = [
    "🍕",
    "🍔",
    "🌮",
    "🍜",
    "🍱",
    "🍣",
    "🥘",
    "🍝",
    "🥗",
    "🍲",
    "🥙",
    "🌯",
    "🍛",
    "🥟",
    "🍢",
    "🥡",
    "🍤",
    "🌭",
    "🥩",
    "🍖",
  ];

  const categories = [
    "Appetizer",
    "Main Course",
    "Dessert",
    "Beverage",
    "Side Dish",
    "Salad",
    "Soup",
    "Snack",
    "Breakfast",
    "Lunch",
    "Dinner",
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div
        className={`w-full max-w-md rounded-lg shadow-xl transition-colors duration-300 max-h-[90vh] overflow-y-auto ${
          mode === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        {/* Header */}
        <div
          className={`sticky top-0 flex justify-between items-center p-6 border-b ${
            mode === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
          }`}
        >
          <h2 className="text-2xl font-bold">{`${initial?"Edit":"Add"}`} Item</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition ${
              mode === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
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
              Item Icon
            </label>
            <div className="grid grid-cols-5 gap-2">
              {foodEmojis.map((emoji) => (
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

          {/* Item Name */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Item Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Margherita Pizza"
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

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your item..."
              rows="3"
              className={`w-full px-4 py-2 rounded-lg border transition resize-none ${
                errors.description
                  ? mode === "dark"
                    ? "border-red-600 bg-red-900/20"
                    : "border-red-500 bg-red-50"
                  : mode === "dark"
                  ? "border-gray-600 bg-gray-700"
                  : "border-gray-300 bg-gray-50"
              } ${mode === "dark" ? "text-white" : "text-gray-900"}`}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-semibold mb-2">Price ($) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g., 12.99"
              className={`w-full px-4 py-2 rounded-lg border transition ${
                errors.price
                  ? mode === "dark"
                    ? "border-red-600 bg-red-900/20"
                    : "border-red-500 bg-red-50"
                  : mode === "dark"
                  ? "border-gray-600 bg-gray-700"
                  : "border-gray-300 bg-gray-50"
              } ${mode === "dark" ? "text-white" : "text-gray-900"}`}
            />
            {errors.price && (
              <p className="text-red-500 text-xs mt-1">{errors.price}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border transition ${
                errors.category
                  ? mode === "dark"
                    ? "border-red-600 bg-red-900/20"
                    : "border-red-500 bg-red-50"
                  : mode === "dark"
                  ? "border-gray-600 bg-gray-700"
                  : "border-gray-300 bg-gray-50"
              } ${mode === "dark" ? "text-white" : "text-gray-900"}`}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-xs mt-1">{errors.category}</p>
            )}
          </div>

          {/* Vegetarian Checkbox */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="veg"
              name="isVegetarian"
              checked={formData.isVegetarian}
              onChange={handleChange}
              className="w-4 h-4 cursor-pointer"
            />
            <label htmlFor="veg" className="text-sm font-semibold cursor-pointer">
              🥬 Vegetarian Item
            </label>
          </div>

          {/* Available Checkbox */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="available"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
              className="w-4 h-4 cursor-pointer"
            />
            <label htmlFor="available" className="text-sm font-semibold cursor-pointer">
              ✅ Available Now
            </label>
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
              {loading ? (initial ? "Editing..." : "Adding...") : (initial ? "Edit Item" : "Add Item")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemForm;
