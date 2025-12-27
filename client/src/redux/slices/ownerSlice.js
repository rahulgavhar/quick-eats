import { createSlice } from "@reduxjs/toolkit";

const ownerSlice = createSlice({
  name: "owner",
  initialState: {
    restaurantData: null,
  },
  reducers: {
    setRestaurant(state, action) {
      state.restaurantData = action.payload;
    },
    clearRestaurant(state) {
      state.restaurantData = null;
    },
    setItems(state, action) {
      if (state.restaurantData) {
        state.restaurantData.items = action.payload;
      }
    },
    addItemToRestaurant(state, action) {
      if (state.restaurantData) {
        state.restaurantData.items.push(action.payload);
      }
    },
    updateItemInRestaurant(state, action) {
      if (state.restaurantData) {
        const index = state.restaurantData.items.findIndex(
          (item) => item._id === action.payload.id
        );
        
        if (index !== -1) {
          state.restaurantData.items[index] = action.payload.updatedData;
        }
      }
    },
    deleteItemFromRestaurant(state, action) {
      if (state.restaurantData) {
        state.restaurantData.items = state.restaurantData.items.filter(
          (item) => item._id !== action.payload
        );
      }
    }
  },
});

export const ownerSliceActions = ownerSlice.actions;
export default ownerSlice.reducer;
