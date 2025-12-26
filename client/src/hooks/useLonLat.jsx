import { useCallback, useEffect, useState } from "react";

const useLonLat = () => {
  const [coords, setCoords] = useState({ lat: null, lon: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        setError(err?.message || "Unable to fetch location");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return {
    coords,
    loading,
    error,
    refresh: fetchLocation,
  };
};

export default useLonLat;
