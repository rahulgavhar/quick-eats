import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const useGetItems = (restaurantId) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 6,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchItems = useCallback(
    async (page = 1) => {
      if (!restaurantId) {
        setItems([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 6,
          hasNextPage: false,
          hasPreviousPage: false,
        });
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${API_URL}/api/items/restaurant`,
          {
            params: {
              restaurantId,
              page,
              limit: 6,
              },
            withCredentials: true,
          }
        );

        setItems(response.data.items || []);
        setPagination(response.data.pagination || {});
      } catch (err) {
        console.error("Error fetching items:", err);
        setError(err.response?.data?.message || "Failed to fetch items");
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [restaurantId, API_URL]
  );

  // Fetch items when restaurantId changes
  useEffect(() => {
    fetchItems(1);
  }, [restaurantId, fetchItems]);

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchItems(page);
    }
  }, [pagination.totalPages, fetchItems]);

  const nextPage = useCallback(() => {
    if (pagination.hasNextPage) {
      goToPage(pagination.currentPage + 1);
    }
  }, [pagination, goToPage]);

  const previousPage = useCallback(() => {
    if (pagination.hasPreviousPage) {
      goToPage(pagination.currentPage - 1);
    }
  }, [pagination, goToPage]);

  return {
    items,
    loading,
    error,
    pagination,
    goToPage,
    nextPage,
    previousPage,
    refetch: () => fetchItems(pagination.currentPage),
  };
};

export default useGetItems;
