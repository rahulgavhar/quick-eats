import React, { useState } from "react";
import { MdClose, MdEdit, MdDelete, MdAdd } from "react-icons/md";
import { useSelector } from "react-redux";
import AddRestaurantForm from "./AddRestaurantForm";

const ManageRestaurant = ({ restaurant, onClose, onAddItem, onUpdateItem, onDeleteItem, onEdit }) => {
  const { mode } = useSelector((state) => state.theme);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddRestaurantForm, setShowAddRestaurantForm] = useState(false);

  if (!restaurant) {
    return null;
  }

  return (
    <>
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div
        className={`w-full max-w-2xl rounded-lg shadow-xl transition-colors duration-300 max-h-[90vh] overflow-y-auto ${
          mode === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        {/* Header */}
        <div
          className={`sticky top-0 flex justify-between items-center p-6 border-b ${
            mode === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
          }`}
        >
          <h2 className="text-2xl font-bold">
            Manage {restaurant.name}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition ${
              mode === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
            }`}
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Restaurant Info */}
          <div
            className={`p-4 rounded-lg border ${
              mode === "dark"
                ? "border-gray-700 bg-gray-700"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="flex relative">
              <h3 className="font-semibold mb-3">Restaurant Details</h3>
              <button className="bg-transparent absolute top-0 right-0 p-1">
                <MdEdit
                  size={20}
                  className={`ml-2 cursor-pointer ${
                    mode === "dark" ? "text-green-400" : "text-green-700"
                  }`}
                  onClick={() => {
                    setShowAddRestaurantForm(true);
                  }}
                />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className={mode === "dark" ? "text-gray-400" : "text-gray-600"}>
                  Cuisine
                </p>
                <p className="font-semibold">{restaurant.cuisine || "N/A"}</p>
              </div>
              <div>
                <p className={mode === "dark" ? "text-gray-400" : "text-gray-600"}>
                  Location
                </p>
                <p className="font-semibold">{restaurant.location || "N/A"}</p>
              </div>
              <div>
                <p className={mode === "dark" ? "text-gray-400" : "text-gray-600"}>
                  Phone
                </p>
                <p className="font-semibold">{restaurant.phone || "N/A"}</p>
              </div>
              <div>
                <p className={mode === "dark" ? "text-gray-400" : "text-gray-600"}>
                  Rating
                </p>
                <p className="font-semibold">⭐ {restaurant.rating || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Menu Items ({restaurant.items?.length || 0})</h3>
              <button
                onClick={() => {
                  setShowAddItem(true);
                  setEditingItem(null);
                }}
                className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                  mode === "dark"
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                <MdAdd size={18} /> Add Item
              </button>
            </div>

            {restaurant.items && restaurant.items.length > 0 ? (
              <div className="space-y-3">
                {restaurant.items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border flex items-center justify-between ${
                      mode === "dark"
                        ? "border-gray-700 bg-gray-700"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-3xl">{item.image || "🍽️"}</span>
                      <div>
                        <h4 className="font-semibold">{item.name}</h4>
                        <p
                          className={`text-sm ${
                            mode === "dark"
                              ? "text-gray-400"
                              : "text-gray-600"
                          }`}
                        >
                          {item.description}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <span className="font-bold text-green-600">
                            ${item.price}
                          </span>
                          {item.isVegetarian && (
                            <span className="text-xs px-2 py-0.5 rounded bg-green-200 text-green-800">
                              🥬 Veg
                            </span>
                          )}
                          {!item.isAvailable && (
                            <span className="text-xs px-2 py-0.5 rounded bg-red-200 text-red-800">
                              Out of Stock
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingItem(item)}
                        className={`p-2 rounded-lg transition ${
                          mode === "dark"
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                        }`}
                      >
                        <MdEdit size={18} />
                      </button>
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className={`p-2 rounded-lg transition ${
                          mode === "dark"
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "bg-red-500 text-white hover:bg-red-600"
                        }`}
                      >
                        <MdDelete size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={`p-6 rounded-lg text-center border-2 border-dashed ${
                  mode === "dark"
                    ? "border-gray-700 text-gray-400"
                    : "border-gray-300 text-gray-500"
                }`}
              >
                <p>No items added yet. Add your first menu item!</p>
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className={`w-full px-4 py-2 rounded-lg font-semibold transition ${
                mode === "dark"
                  ? "bg-gray-700 text-white hover:bg-gray-600"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
      </div>
      
      {showAddRestaurantForm && (
        <AddRestaurantForm
          initialData={restaurant}
          onClose={() => setShowAddRestaurantForm(false)}
          onSave={(updatedRestaurant) => {
            onEdit(updatedRestaurant);
            setShowAddRestaurantForm(false);
          }}
        />
      )}
    </>
  );
};

export default ManageRestaurant;
