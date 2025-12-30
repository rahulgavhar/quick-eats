import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const useFetchItems = ({ searchName, searchCategory, allRestaurants }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiURL = import.meta.env.VITE_API_URL;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${apiURL}/api/items/search`,
        {
          name: searchName,
          category: searchCategory,
          restaurants: allRestaurants.map((r) => r._id),
        },
        {
          withCredentials: true,
        }
      );
      setData(response.data);
    } catch (err) {
      console.error("Error searching items:", err);
      setError(err.response?.data?.message || "Failed to search items");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [searchName, searchCategory, allRestaurants, apiURL]);

  useEffect(() => {
    if (searchName || searchCategory) {
      fetchData();
    } else {
      setData(null);
    }
  }, [searchName, searchCategory, fetchData]);

  return { data, loading, error, fetchData };
};

export default useFetchItems;
