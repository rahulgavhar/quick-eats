import { useState } from "react";
import { useSelector } from "react-redux";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Custom marker icons with different colors
const createCustomIcon = (color, id) => {
  return L.divIcon({
    className: `custom-marker custom-marker-${id}`,
    html: `<div style="
      width: 30px;
      height: 30px;
      background-color: ${color} !important;
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      position: relative;
    ">
      <div style="
        width: 10px;
        height: 10px;
        background-color: white;
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      "></div>
    </div>`,
    iconSize: [30, 30], // size of the icon
    iconAnchor: [15, 30], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -30],
  });
};

const userIcon = createCustomIcon("#10b981", "user"); // Green for user
const restaurantIcon = createCustomIcon("#ef4444", "restaurant"); // Red for restaurants

const ShowOnMap = ({ restaurants }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { coords: userLocation } = useSelector((state) => state.user);
  const { mode } = useSelector((state) => state.theme);

  // Calculate center of map (user location or center of restaurants)
  const getMapCenter = () => {
    if (userLocation?.lat && userLocation?.lon) {
      return [userLocation.lat, userLocation.lon];
    }
    if (restaurants && restaurants.length > 0) {
      const firstRestaurant = restaurants[0];
      if (firstRestaurant?.location?.coordinates) {
        return [
          firstRestaurant.location.coordinates[1],
          firstRestaurant.location.coordinates[0],
        ];
      }
    }
    return [20.5937, 78.9629]; // Default India center
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 transition flex items-center gap-2"
        type="button"
      >
        <span>🗺️</span>
        <span>Show on Map</span>
      </button>

      {isOpen && (
        <>
          <style>{`
            .custom-marker-user > div {
              background-color: #10b981 !important;
            }
            .custom-marker-restaurant > div {
              background-color: #ef4444 !important;
            }
            .custom-marker {
              background: transparent !important;
              border: none !important;
            }
          `}</style>
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setIsOpen(false)}
          >
          <div
            className={`relative w-full max-w-5xl rounded-lg shadow-2xl overflow-hidden ${
              mode === "dark" ? "bg-gray-800" : "bg-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between p-4 border-b ${
                mode === "dark"
                  ? "bg-gray-900 border-gray-700"
                  : "bg-green-50 border-green-200"
              }`}
            >
              <div>
                <h3
                  className={`text-xl font-bold ${
                    mode === "dark" ? "text-white" : "text-gray-800"
                  }`}
                >
                  Restaurants Near You
                </h3>
                <p
                  className={`text-sm mt-1 ${
                    mode === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  🟢 Your Location · 🔴 Restaurants ({restaurants?.length || 0})
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className={`text-2xl font-bold w-8 h-8 rounded-full transition ${
                  mode === "dark"
                    ? "text-gray-400 hover:bg-gray-700 hover:text-white"
                    : "text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                }`}
              >
                ×
              </button>
            </div>

            {/* Map Container */}
            <div className="h-125 w-full">
              <MapContainer
                center={getMapCenter()}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User Location Marker */}
                {userLocation?.lat && userLocation?.lon && (
                  <Marker
                    position={[userLocation.lat, userLocation.lon]}
                    icon={userIcon}
                  >
                    <Popup>
                      <div className="text-center font-semibold">
                        <p className="text-green-600">📍 Your Location</p>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Restaurant Markers */}
                {restaurants?.map((restaurant) => {
                  const coords = restaurant.location?.coordinates;
                  if (!coords || coords.length < 2) return null;

                  const [lon, lat] = coords;
                  return (
                    <Marker
                      key={restaurant.id || restaurant._id}
                      position={[lat, lon]}
                      icon={restaurantIcon}
                    >
                      <Popup>
                        <div className="min-w-50">
                          <h4 className="font-bold text-gray-800">
                            {restaurant.name}
                          </h4>
                          {restaurant.cuisine && (
                            <p className="text-sm text-gray-600 mt-1">
                              🍽️ {restaurant.cuisine}
                            </p>
                          )}
                          {restaurant.rating && (
                            <p className="text-sm text-gray-600">
                              ⭐ {restaurant.rating}
                            </p>
                          )}
                          {restaurant.deliveryTime && (
                            <p className="text-sm text-gray-600">
                              ⏱️ {restaurant.deliveryTime}
                            </p>
                          )}
                          {restaurant.address && (
                            <p className="text-xs text-gray-500 mt-2">
                              📍 {restaurant.address}
                            </p>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          </div>
        </div>
        </>
      )}
    </>
  );
};

export default ShowOnMap;
