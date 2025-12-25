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
  },
});

export const ownerSliceActions = ownerSlice.actions;
export default ownerSlice.reducer;
