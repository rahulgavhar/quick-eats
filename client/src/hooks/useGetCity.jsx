import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { userSliceActions } from "../redux/slices/userSlice.js";

const useGetCity = () => {
  const dispatch = useDispatch();

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

        try {
          const response = await axios.post(
            `${apiURL}/api/user/get-city`,
            { latitude, longitude },
            { withCredentials: true }
          );

          dispatch(userSliceActions.setCity(response.data.city));
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
