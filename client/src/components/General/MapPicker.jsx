import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useSelector } from "react-redux";

// Fix for default marker icon in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const MapPicker = ({ latitude, longitude, onLocationSelect, immovable }) => {
  const { mode } = useSelector((state) => state.theme);
  const [position, setPosition] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        setPosition([lat, lng]);
      }
    }
  }, [latitude, longitude]);

  const handleLocationSelect = (lat, lng) => {
    if(immovable === null) setPosition([lat, lng]);
    onLocationSelect(lat.toFixed(6), lng.toFixed(6));
  };

  // Default center (India) if no coordinates provided
  const center = position || [20.5937, 78.9629];

  return (
    <div
      className={`rounded-lg overflow-hidden border ${
        mode === "dark" ? "border-gray-700" : "border-gray-200"
      }`}
    >
      <MapContainer
        center={center}
        zoom={position ? 15 : 5}
        style={{ height: "300px", width: "100%" }}
        ref={mapRef}
        key={`${center[0]}-${center[1]}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {position && <Marker position={position} />}
        <MapClickHandler onLocationSelect={handleLocationSelect} />
      </MapContainer>
      <div
        className={`px-3 py-2 text-xs text-center ${
          mode === "dark" ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"
        }`}
      >
        {position
          ? `📍 Selected: ${position[0].toFixed(6)}, ${position[1].toFixed(6)}`
          : "Click anywhere on the map to set restaurant location"}
      </div>
    </div>
  );
};

export default MapPicker;
