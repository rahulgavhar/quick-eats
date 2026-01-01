import { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { userSliceActions } from "../redux/slices/userSlice.js";

const useNearbyRestaurants = () => {
  const dispatch = useDispatch();
  const { fetchedAt, restaurants, coords: reduxCoords, developer_coords, city, state } = useSelector((state) => state.user);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRestaurants: 0,
    restaurantsPerPage: 8,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [coordinates, setCoordinates] = useState(null);
  const hasInitialFetchRef = useRef(false);
  const originalCoordsRef = useRef(null); // Store original geolocation coords
  const originalStateRef = useRef(city); // Store original restaurant state
  const originalCityRef = useRef(state); // Store original city

  const fetchRestaurants = useCallback(
    async (page = 1) => {
      if (!coordinates) return;

      const { latitude, longitude } = coordinates;
      const apiURL = import.meta.env.VITE_API_URL;
      if (!apiURL) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${apiURL}/api/restaurants/nearby`, {
          params: { 
            lat: latitude, 
            lon: longitude,
            page,
            limit: 8
          },
          withCredentials: true,
        });

        setAllRestaurants(response.data.allRestaurants || []);

        const enrichedRestaurants = await Promise.all(
          response.data.restaurants.map(async (restaurant) => {
            try {
              const res = await axios.get(
                `${apiURL}/api/restaurants/id/${restaurant._id}`,
                {
                  withCredentials: true,
                }
              );

              return {
                id: res.data.restaurant._id,
                name: res.data.restaurant.name,
                rating: res.data.restaurant.rating,
                deliveryTime: "30-40 min",
                deliveryFee: "$2.99",
                image: res.data.profile.image,
                cuisine: res.data.profile.cuisine,
                address: res.data.profile.address,
                foods: [],
              };
            } catch {
              return null;
            }
          })
        );

        setData(enrichedRestaurants.filter(Boolean));
        setPagination(response.data.pagination || {});
        
        // Cache on first page only
        if (page === 1) {
          const filtered = enrichedRestaurants.filter(Boolean);
          dispatch(
            userSliceActions.setRestaurants(
              filtered
            )
          );
          dispatch(userSliceActions.setFetchedAt(Date.now()));
          // Store original state and city on first fetch
          originalStateRef.current = response.data.state || "";
          originalCityRef.current = response.data.city || "";
        }

        setLoading(false);
      } catch (error) {
        if (!axios.isCancel(error)) {
          setError(error);
          setLoading(false);
        }
      }
    },
    [coordinates]
  );

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchRestaurants(page);
    }
  }, [pagination.totalPages, fetchRestaurants]);

  const nextPage = useCallback(() => {
    if (pagination.hasNextPage) {
      fetchRestaurants(pagination.currentPage + 1);
    }
  }, [pagination.currentPage, pagination.hasNextPage, fetchRestaurants]);

  const previousPage = useCallback(() => {
    if (pagination.hasPreviousPage) {
      fetchRestaurants(pagination.currentPage - 1);
    }
  }, [pagination.currentPage, pagination.hasPreviousPage, fetchRestaurants]);

  // Get coordinates on mount
  useEffect(() => {
    let isMounted = true;

    if (!navigator.geolocation) {
      setLoading(false);
      return;
    }

    const currentTime = Date.now();

    if (fetchedAt && currentTime - fetchedAt < 60 * 1000) {
      if (!window.location.hostname.includes("localhost")) {
        setData(restaurants);
        setLoading(false);
        setAllRestaurants(restaurants);
        hasInitialFetchRef.current = true;
        return;
      }
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (isMounted) {
          const { latitude, longitude } = position.coords;
          const coords = { latitude, longitude };
          setCoordinates(coords);
          originalCoordsRef.current = coords; // Store original coords
          // Initialize refs on first geolocation success
          if (!originalStateRef.current) originalStateRef.current = "";
          if(!originalCityRef.current) originalCityRef.current = "";
        }
      },
      (error) => {
        setError(error);
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch restaurants when coordinates change (only once)
  useEffect(() => {
    if (coordinates && !hasInitialFetchRef.current) {
      hasInitialFetchRef.current = true;
      fetchRestaurants(1);
    }
  }, [coordinates]);

  // Listen to Redux coordinates for developer location changes
  useEffect(() => {
    if (developer_coords && reduxCoords?.lat && reduxCoords?.lon) {
      // Use developer coordinates from Redux
      setCoordinates({
        latitude: reduxCoords.lat,
        longitude: reduxCoords.lon,
      });
      // Force refetch
      hasInitialFetchRef.current = false;
    } else if (!developer_coords && originalCoordsRef.current) {
      // Switch back to original geolocation coordinates and restore original state
      setCoordinates(originalCoordsRef.current);
      dispatch(
        userSliceActions.setState(originalStateRef.current)
      );
      dispatch(
        userSliceActions.setCity(originalCityRef.current)
      );
      // Force refetch
      hasInitialFetchRef.current = false;
    }
  }, [developer_coords, reduxCoords?.lat, reduxCoords?.lon]);

  return { 
    data, 
    loading, 
    error,
    pagination,
    goToPage,
    nextPage,
    previousPage,
    allRestaurants
  };
};

export default useNearbyRestaurants;
