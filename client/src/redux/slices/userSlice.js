import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

/* ============================
   INITIAL STATE
============================ */
const initialState = {
  userData: null,
  cartItems: [],
  coords: { lat: null, lon: null },
  city: null,
  state: null,
  fetchedAt: null,
  restaurants: [],
  loading: false,
  error: null,
};

/* ============================
   ASYNC THUNKS
============================ */
export const fetchUserData = createAsyncThunk(
  "user/fetchUserData",
  async (_, { rejectWithValue }) => {
    const apiURL = import.meta.env.VITE_API_URL;

    try {
      const res = await axios.get(`${apiURL}/api/user/current`, {
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Failed to fetch user data"
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "user/logoutUser",
  async (_, { rejectWithValue }) => {
    const apiURL = import.meta.env.VITE_API_URL;

    try {
      await axios.post(
        `${apiURL}/api/auth/signout`,
        {},
        { withCredentials: true }
      );
      return;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Logout failed");
    }
  }
);

/* ============================
   SLICE
============================ */
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    updateUserData: (state, action) => {
      state.userData = {
        ...state.userData,
        ...action.payload,
      };
    },
    clearUserData: () => initialState,
    setCity: (state, action) => {
      state.city = action.payload;
    },
    setState: (state, action) => {
      state.state = action.payload;
    },
    setCoords: (state, action) => {
      state.coords = action.payload;
    },
    // Legacy actions kept for compatibility
    addToCart: (state, action) => {
      state.cartItems.push(action.payload);
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (item, index) => index !== action.payload
      );
    },
    // New robust cart actions
    addOrIncrementCartItem: (state, action) => {
      const { id, restaurantId } = action.payload || {};
      if (!id || !restaurantId) return;
      const idx = state.cartItems.findIndex(
        (i) => i.id === id && i.restaurantId === restaurantId
      );
      if (idx >= 0) {
        state.cartItems[idx].quantity = (state.cartItems[idx].quantity || 1) + 1;
      } else {
        const quantity = action.payload.quantity && action.payload.quantity > 0 ? action.payload.quantity : 1;
        state.cartItems.push({ ...action.payload, quantity });
      }
    },
    updateCartQuantity: (state, action) => {
      const { id, restaurantId, quantity } = action.payload || {};
      if (!id || !restaurantId) return;
      const idx = state.cartItems.findIndex(
        (i) => i.id === id && i.restaurantId === restaurantId
      );
      if (idx >= 0) {
        if (quantity <= 0) {
          state.cartItems.splice(idx, 1);
        } else {
          state.cartItems[idx].quantity = quantity;
        }
      }
    },
    removeCartItem: (state, action) => {
      const { id, restaurantId } = action.payload || {};
      if (!id || !restaurantId) return;
      state.cartItems = state.cartItems.filter(
        (i) => !(i.id === id && i.restaurantId === restaurantId)
      );
    },
    clearCart: (state) => {
      state.cartItems = [];
    },
    setFetchedAt: (state, action) => {
      state.fetchedAt = action.payload;
    },
    setRestaurants: (state, action) => {
      state.restaurants = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      /* -------- FETCH USER -------- */
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.userData = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* -------- LOGOUT -------- */
      .addCase(logoutUser.pending, () => initialState)
      .addCase(logoutUser.fulfilled, () => initialState)
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const userSliceActions = userSlice.actions;
export default userSlice.reducer;
