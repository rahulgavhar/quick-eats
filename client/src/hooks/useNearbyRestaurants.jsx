import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { userSliceActions } from "../redux/slices/userSlice.js";

const useNearbyRestaurants = () => {
  const dispatch = useDispatch();
  const { fetchedAt } = useSelector((state) => state.user);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    
    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      return;
    }

    const apiURL = import.meta.env.VITE_API_URL;
    if (!apiURL) {
      console.error("API_URL not defined");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        const currentTime = Date.now();
        // Fetch if never fetched before or last fetch was more than 1 minutes ago
        if (fetchedAt && currentTime - fetchedAt < 1 * 60 * 1000) {
          console.log("1 request per minute limit enforced");
          if (!window.location.href.includes("localhost")) {
            setLoading(false);
            return;
          }
        }
        
        dispatch(userSliceActions.setFetchedAt(currentTime));

        try {
          const response = await axios.get(`${apiURL}/api/restaurants/nearby`, {
            params: { lat: latitude, lon: longitude },
            withCredentials: true,
          });

          // Attach restaurantProfileData to each restaurant
          response.data.restaurants = await Promise.all(
            response.data.restaurants.map(async (restaurant) => {
              const res = await axios.get(
                `${apiURL}/api/restaurants/id/${restaurant._id}`,
                { withCredentials: true }
              );

              const itemsRes = await axios.get(
                `${apiURL}/api/items/restaurant`,
                {
                  params: { restaurantId: restaurant._id },
                  withCredentials: true,
                }
              );

              const finalRestaurant = {
                name: res.data.restaurant.name,
                rating: res.data.restaurant.rating,
                deliveryTime: "30-40 min",
                deliveryFee: "$2.99",
                image: res.data.profile.image,
                cuisine: res.data.profile.cuisine,
                foods: itemsRes.data.items.map((item) => ({
                  id: item._id,
                  name: item.name,
                  price: item.price,
                  image: item.image,
                  description: item.description,
                })),
                id: res.data.restaurant._id,
              };

              return finalRestaurant;
            })
          );

          if (response.data && response.data.restaurants) {
            setData(response.data.restaurants);
            setLoading(false);
          }
        } catch (error) {
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
  }, [dispatch]);

  return { data, loading, error };
};

export default useNearbyRestaurants;
