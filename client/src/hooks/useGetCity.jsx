import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { userSliceActions } from "../redux/slices/userSlice.js";

const useGetCity = () => {
  const dispatch = useDispatch();
  const { coords, developer_coords } = useSelector((state) => state.user);
  const apiURL = import.meta.env.VITE_API_URL;
  if (!apiURL) {
    console.error("API_URL not defined");
    return;
  }

  useEffect(() => {
    const setupLocation = async () => {
      if (developer_coords) {
        dispatch(userSliceActions.setCity("Panvel"));
        dispatch(userSliceActions.setState("Maharashtra"));
        dispatch(
          userSliceActions.setCoords({
            lat: 19.042729,
            lon: 73.075492,
          })
        );
        try {
          await axios.post(
            `${apiURL}/api/user/update-location`,
            {
              location: {
                lat: 19.042729,
                lon: 73.075492,
              },
            },
            { withCredentials: true }
          );
        } catch (locationError) {
          console.error(
            "Error updating location in DB:",
            locationError.response?.data || locationError.message
          );
        }

        return;
      }

      if (!navigator.geolocation) {
        console.error("Geolocation not supported");
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

          if (coords.lat === null || coords.lon === null) {
            // Initial fetch, set coords in store
            dispatch(
              userSliceActions.setCoords({ lat: latitude, lon: longitude })
            );
          }

          try {
            const response = await axios.post(
              `${apiURL}/api/user/get-city`,
              { latitude, longitude },
              { withCredentials: true }
            );

            dispatch(userSliceActions.setCity(response.data.city));
            dispatch(userSliceActions.setState(response.data.state));

            // Update user location in DB after successfully getting city
            try {
              await axios.post(
                `${apiURL}/api/user/update-location`,
                {
                  location: {
                    lat: latitude,
                    lon: longitude,
                  },
                },
                { withCredentials: true }
              );
              console.log("Location updated in DB:", { latitude, longitude });
            } catch (locationError) {
              console.error(
                "Error updating location in DB:",
              locationError.response?.data || locationError.message
            );
          }
        } catch (error) {
          console.error("Error fetching city data:", error);
        }
      },
      (error) => {
        console.error("Geolocation error:", error.message);
      }
    );
    };
    
    setupLocation();
  }, [dispatch, coords.lat, coords.lon, developer_coords, apiURL]);

  return null;
};

export default useGetCity;
