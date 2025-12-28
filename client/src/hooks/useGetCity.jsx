import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { userSliceActions } from "../redux/slices/userSlice.js";

const useGetCity = () => {
  const dispatch = useDispatch();
  const { coords } = useSelector((state) => state.user);

  useEffect(() => {
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

        // Fetch only if person moved significantly (more than toFixed(2) precision)
        if (
          coords.lat?.toFixed(2) === latitude.toFixed(2) &&
          coords.lon?.toFixed(2) === longitude.toFixed(2)
        ) {
          return;
        }
        
        if(coords.lat === null || coords.lon === null) {
          // Initial fetch, set coords in store
          dispatch(userSliceActions.setCoords({ lat: latitude, lon: longitude }));
        }

        try {
          const response = await axios.post(
            `${apiURL}/api/user/get-city`,
            { latitude, longitude },
            { withCredentials: true }
          );

          dispatch(userSliceActions.setCity(response.data.city));
          dispatch(userSliceActions.setState(response.data.state));
        } catch (error) {
          console.error("Error fetching city data:", error);
        }
      },
      (error) => {
        console.error("Geolocation error:", error.message);
      }
    );
  }, [dispatch]);

  return null;
};

export default useGetCity;
