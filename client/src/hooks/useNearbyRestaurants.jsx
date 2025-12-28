import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { userSliceActions } from "../redux/slices/userSlice.js";

const useNearbyRestaurants = () => {
  const dispatch = useDispatch();
  const { fetchedAt, restaurants } = useSelector((state) => state.user);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    const controller = new AbortController();

    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      setLoading(false);
      return;
    }

    const apiURL = import.meta.env.VITE_API_URL;
    if (!apiURL) {
      console.error("API_URL not defined");
      setLoading(false);
      return;
    }

    const currentTime = Date.now();
    // Fetch if never fetched before or last fetch was more than 1 minutes ago
    if (fetchedAt && currentTime - fetchedAt < 1 * 60 * 1000) {
      if (!window.location.hostname.includes("localhost")) {
        console.log("1 request per minute limit enforced");
        setData(restaurants);
        setLoading(false);
        return;
      }
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        dispatch(userSliceActions.setFetchedAt(currentTime));

        try {
          const response = await axios.get(`${apiURL}/api/restaurants/nearby`, {
            params: { lat: latitude, lon: longitude },
            withCredentials: true,
            signal: controller.signal,
          });

          // Attach restaurantProfileData to each restaurant
          response.data.restaurants = await Promise.all(
            response.data.restaurants.map(async (restaurant) => {
              try {
                const res = await axios.get(
                  `${apiURL}/api/restaurants/id/${restaurant._id}`,
                  {
                    params: {
                      shouldPopulate: true,
                    },
                    withCredentials: true,
                    signal: controller.signal,
                  }
                );

                const itemsRes = res.data.profile.items;

                const finalRestaurant = {
                  name: res.data.restaurant.name,
                  rating: res.data.restaurant.rating,
                  deliveryTime: "30-40 min",
                  deliveryFee: "$2.99",
                  image: res.data.profile.image,
                  cuisine: res.data.profile.cuisine,
                  foods: itemsRes.map((item) => ({
                    id: item._id,
                    name: item.name,
                    price: item.price,
                    image: item.image,
                    description: item.description,
                  })),
                  id: res.data.restaurant._id,
                };

                return finalRestaurant;
              } catch (err) {
                console.error("Error fetching restaurant profile:", err);
                return null;
              }
            })
          );

          if (response.data && response.data.restaurants) {
            if (!isMounted) return;
            setData(response.data.restaurants);
            dispatch(
              userSliceActions.setRestaurants(response.data.restaurants)
            );
            setLoading(false);
          }
        } catch (error) {
          if (axios.isCancel(error)) {
            console.log("Request cancelled:", error.message);
            return;
          }
          console.error("Error fetching city data:", error);
          setError(error);
          setLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error.message);
        setError(error);
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [dispatch]);

  return { data, loading, error };
};

export default useNearbyRestaurants;
