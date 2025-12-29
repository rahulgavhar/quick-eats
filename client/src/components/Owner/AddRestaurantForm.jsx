import React, { useEffect, useState } from "react";
import { MdClose } from "react-icons/md";
import { useSelector } from "react-redux";
import useLonLat from "../../hooks/useLonLat";
import MapPicker from "../General/MapPicker";

const AddRestaurantForm = ({ onClose, onSubmit, initialData, onSave }) => {
  const { mode } = useSelector((state) => state.theme);
  const { coords, loading: locLoading, error: locError, refresh } = useLonLat();
  const [formData, setFormData] = useState({
    name: `${initialData?.name || ""}`,
    cuisine: `${initialData?.cuisine || ""}`,
    location: `${initialData?.location || ""}`,
    city: `${initialData?.city || ""}`,
    state: `${initialData?.state || ""}`,
    phone: `${initialData?.phone || ""}`,
    email: `${initialData?.email || ""}`,
    image: "🍽️",
    coverPhoto: `${initialData?.coverPhoto || null}`,
    deliveryTime: "30-45",
    deliveryFee: "2.99",
    longitude: Number.parseFloat(`${initialData?.longitude || ""}`),
    latitude: Number.parseFloat(`${initialData?.latitude || ""}`),
  });
  const [coverPhotoPreview, setCoverPhotoPreview] = useState(null);
  const [coordinateSource, setCoordinateSource] = useState("owner");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCoordinateSourceChange = (source) => {
    setCoordinateSource(source);
    setErrors((prev) => ({ ...prev, latitude: "", longitude: "", coordinateSource: "" }));
  };

  useEffect(() => {
    if (coordinateSource === "owner" && coords.lat && coords.lon) {
      setFormData((prev) => ({
        ...prev,
        latitude: coords.lat.toFixed(6),
        longitude: coords.lon.toFixed(6),
      }));
    }
  }, [coordinateSource, coords.lat, coords.lon]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Restaurant name is required";
    if (!formData.cuisine.trim()) newErrors.cuisine = "Cuisine type is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email";
    }

    if (coordinateSource === "owner") {
      if (!coords.lat || !coords.lon) {
        newErrors.coordinateSource = "Allow location to use your coordinates";
      }
    } else {
      if (!formData.latitude || !formData.longitude) {
        newErrors.latitude = "Latitude and longitude from map are required";
        newErrors.longitude = "Latitude and longitude from map are required";
      }
    }
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
      if (onSave) {
        await onSave(formData);
      } else{
        await onSubmit(formData);
      }
    } catch (error) {
      console.error("Error adding restaurant:", error);
    } finally {
      setLoading(false);
    }
  };

  const emojis = ["🍽️", "🍕", "🍔", "🍜", "🍱", "🍣", "🌮", "🥘", "🍝", "🥗"];

  const handleCoverPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, coverPhoto: "Please select an image file" }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, coverPhoto: "File size must be less than 5MB" }));
        return;
      }
      setFormData((prev) => ({ ...prev, coverPhoto: file }));
      const reader = new FileReader();
      reader.onload = (e) => setCoverPhotoPreview(e.target?.result);
      reader.readAsDataURL(file);
      setErrors((prev) => ({ ...prev, coverPhoto: "" }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div
        className={`w-full max-w-2xl rounded-lg shadow-xl transition-colors duration-300 max-h-[90vh] overflow-y-auto ${
          mode === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        {/* Header */}
        <div
          className={`flex justify-between items-center p-4 sm:p-6 border-b ${
            mode === "dark" ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <h2 className="text-2xl font-bold">{`${(onSave)?`Edit`:`Create`}`} Restaurant</h2>
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
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {/* Emoji Selector */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Restaurant Icon
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-[320px]:grid-cols-2 text-center">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, image: emoji }))
                  }
                  className={`text-3xl sm:text-4xl p-2 sm:p-3 rounded-lg transition w-full ${
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

          {/* City & State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-2">City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g., Mumbai"
                className={`w-full px-4 py-2 rounded-lg border transition ${
                  errors.city
                    ? mode === "dark"
                      ? "border-red-600 bg-red-900/20"
                      : "border-red-500 bg-red-50"
                    : mode === "dark"
                    ? "border-gray-600 bg-gray-700"
                    : "border-gray-300 bg-gray-50"
                } ${mode === "dark" ? "text-white" : "text-gray-900"}`}
              />
              {errors.city && (
                <p className="text-red-500 text-xs mt-1">{errors.city}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">State *</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="e.g., Maharashtra"
                className={`w-full px-4 py-2 rounded-lg border transition ${
                  errors.state
                    ? mode === "dark"
                      ? "border-red-600 bg-red-900/20"
                      : "border-red-500 bg-red-50"
                    : mode === "dark"
                    ? "border-gray-600 bg-gray-700"
                    : "border-gray-300 bg-gray-50"
                } ${mode === "dark" ? "text-white" : "text-gray-900"}`}
              />
              {errors.state && (
                <p className="text-red-500 text-xs mt-1">{errors.state}</p>
              )}
            </div>
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

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-2">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g., contact@restaurant.com"
              className={`w-full px-4 py-2 rounded-lg border transition ${
                errors.email
                  ? mode === "dark"
                    ? "border-red-600 bg-red-900/20"
                    : "border-red-500 bg-red-50"
                  : mode === "dark"
                  ? "border-gray-600 bg-gray-700"
                  : "border-gray-300 bg-gray-50"
              } ${mode === "dark" ? "text-white" : "text-gray-900"}`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Cover Photo Upload */}
          <div>
            <label className="block text-sm font-semibold mb-2">Cover Photo</label>
            <div
              className={`px-4 py-6 rounded-lg border-2 border-dashed transition text-center cursor-pointer ${
                errors.coverPhoto
                  ? mode === "dark"
                    ? "border-red-600 bg-red-900/20"
                    : "border-red-500 bg-red-50"
                  : mode === "dark"
                  ? "border-gray-600 bg-gray-700 hover:border-green-500 hover:bg-gray-600"
                  : "border-gray-300 bg-gray-50 hover:border-green-500 hover:bg-gray-100"
              }`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverPhotoChange}
                className="hidden"
                id="coverPhotoInput"
              />
              <label htmlFor="coverPhotoInput" className="cursor-pointer block">
                {coverPhotoPreview ? (
                  <div className="space-y-2">
                    <img
                      src={coverPhotoPreview}
                      className="h-32 w-full object-cover rounded-lg mx-auto"
                    />
                    <p className="text-xs opacity-80">Click to change photo</p>
                    <p className="text-xs font-semibold text-green-500">✓ {formData.coverPhoto?.name}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-2xl">📸</p>
                    <p className="text-sm font-semibold">Click to upload or drag & drop</p>
                    <p className="text-xs opacity-80">PNG, JPG up to 5MB</p>
                  </div>
                )}
              </label>
            </div>
            {errors.coverPhoto && (
              <p className="text-red-500 text-xs mt-1">{errors.coverPhoto}</p>
            )}
          </div>

          {/* Coordinates */}
          <div className="space-y-3">
            <div className="flex items-start sm:items-center justify-between gap-2 sm:gap-0">
              <p className="text-sm font-semibold">Restaurant Coordinates *</p>
              {locError && (
                <span className="text-xs text-red-500">{locError}</span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 text-sm">
              <button
                type="button"
                onClick={() => handleCoordinateSourceChange("owner")}
                className={`flex-1 px-3 py-2 rounded-lg border text-white transition ${
                  coordinateSource === "owner"
                    ? mode === "dark"
                      ? "border-green-500 bg-green-600/20"
                      : "border-green-500 bg-green-50"
                    : mode === "dark"
                    ? "border-gray-600 bg-gray-800"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                Use my location
                <span className="block text-xs opacity-80">
                  {locLoading ? "Detecting..." : coords.lat ? "Found coordinates" : "Tap to retry"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleCoordinateSourceChange("map")}
                className={`flex-1 px-3 py-2 text-white rounded-lg border transition ${
                  coordinateSource === "map"
                    ? mode === "dark"
                      ? "border-green-500 bg-green-600/20"
                      : "border-green-500 bg-green-50"
                    : mode === "dark"
                    ? "border-gray-600 bg-gray-800"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                Choose from map
                <span className="block text-xs opacity-80">
                  Pick from the map view
                </span>
              </button>
            </div>
            {coordinateSource === "owner" && (
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold mb-1">Latitude</label>
                    <input
                      type="text"
                      name="latitude"
                      value={formData.latitude}
                      readOnly
                      className={`w-full px-3 py-2 rounded-lg border transition ${
                        errors.latitude || errors.coordinateSource
                          ? mode === "dark"
                            ? "border-red-600 bg-red-900/20"
                            : "border-red-500 bg-red-50"
                          : mode === "dark"
                          ? "border-gray-600 bg-gray-700"
                          : "border-gray-300 bg-gray-50"
                      } ${mode === "dark" ? "text-white" : "text-gray-900"}`}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold mb-1">Longitude</label>
                    <input
                      type="text"
                      name="longitude"
                      value={formData.longitude}
                      readOnly
                      className={`w-full px-3 py-2 rounded-lg border transition ${
                        errors.longitude || errors.coordinateSource
                          ? mode === "dark"
                            ? "border-red-600 bg-red-900/20"
                            : "border-red-500 bg-red-50"
                          : mode === "dark"
                          ? "border-gray-600 bg-gray-700"
                          : "border-gray-300 bg-gray-50"
                      } ${mode === "dark" ? "text-white" : "text-gray-900"}`}
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={refresh}
                    className={`px-3 py-1 rounded-md font-semibold ${
                      mode === "dark"
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    Refresh location
                  </button>
                  <span className="opacity-80">
                    Keep location services on to auto-fill coordinates
                  </span>
                </div>
              </div>
            )}
            {coordinateSource === "map" && (
              <div className="space-y-3">
                <p className="text-xs opacity-80">
                  Click anywhere on the map below to set the restaurant location.
                </p>
                <MapPicker
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  onLocationSelect={(lat, lng) => {
                    setFormData((prev) => ({
                      ...prev,
                      latitude: lat,
                      longitude: lng,
                    }));
                    setErrors((prev) => ({ ...prev, latitude: "", longitude: "" }));
                  }}
                />
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold mb-1">Latitude</label>
                    <input
                      type="text"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      placeholder="e.g., 19.0760"
                      className={`w-full px-3 py-2 rounded-lg border transition ${
                        errors.latitude
                          ? mode === "dark"
                            ? "border-red-600 bg-red-900/20"
                            : "border-red-500 bg-red-50"
                          : mode === "dark"
                          ? "border-gray-600 bg-gray-700"
                          : "border-gray-300 bg-gray-50"
                      } ${mode === "dark" ? "text-white" : "text-gray-900"}`}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold mb-1">Longitude</label>
                    <input
                      type="text"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      placeholder="e.g., 72.8777"
                      className={`w-full px-3 py-2 rounded-lg border transition ${
                        errors.longitude
                          ? mode === "dark"
                            ? "border-red-600 bg-red-900/20"
                            : "border-red-500 bg-red-50"
                          : mode === "dark"
                          ? "border-gray-600 bg-gray-700"
                          : "border-gray-300 bg-gray-50"
                      } ${mode === "dark" ? "text-white" : "text-gray-900"}`}
                    />
                  </div>
                </div>
                <div className="flex items-start gap-2 text-xs opacity-80">
                  <span>💡</span>
                  <span>You can also manually type or paste coordinates in the fields above.</span>
                </div>
              </div>
            )}
            {(errors.latitude || errors.longitude || errors.coordinateSource) && (
              <p className="text-red-500 text-xs mt-1">
                {errors.latitude || errors.longitude || errors.coordinateSource}
              </p>
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
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
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
              {loading ? ((onSave)?"Editing":"Creating...") : ((onSave)?"Edit":"Create") + " Restaurant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRestaurantForm;
