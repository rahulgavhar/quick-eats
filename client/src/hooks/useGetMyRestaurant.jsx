import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux';
import { ownerSliceActions } from '../redux/slices/ownerSlice';
import axios from 'axios';

const useGetMyRestaurant = () => {
    const dispatch = useDispatch();
    const apiURL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchMyRestaurant = async () => {
            try {
                const response = await axios.get(`${apiURL}/restaurants/owner`, {
                    withCredentials: true,
                });
                if (response.data.success) {
                    dispatch(ownerSliceActions.setRestaurant(response.data.restaurant));
                }
            } catch (error) {
                console.error('Error fetching restaurant data:', error);
            }
        };

        fetchMyRestaurant();
    }, [dispatch]);

    return null;
}

export default useGetMyRestaurant
