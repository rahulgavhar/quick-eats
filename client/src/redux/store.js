import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";

import storage from "redux-persist/lib/storage";
import { persistStore, persistReducer } from "redux-persist";
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

import userReducer from "./slices/userSlice";
import ownerReducer from "./slices/ownerSlice";
import themeReducer from "./slices/themeSlice";

/*  Persisted Reducers Setup */

// User Persist Config
const userPersistConfig = {
  key: "user",
  storage,
  whitelist: ["userData", "city", "state", "cartItems", "coords", "fetchedAt", "restaurants"],
};
const persistedUserReducer = persistReducer(
  userPersistConfig,
  userReducer
);

// Owner Persist Config
const ownerPersistConfig = {
  key: "owner",
  storage,
  whitelist: ["restaurantData"],
};
const persistedOwnerReducer = persistReducer(
  ownerPersistConfig,
  ownerReducer
);



// Root Reducer
const rootReducer = combineReducers({
  user: persistedUserReducer,
  owner: persistedOwnerReducer,
  theme: themeReducer,
});

const rootPersistConfig = {
  key: "root",
  storage,
  whitelist: ["theme"],
};

const persistedRootReducer = persistReducer(
  rootPersistConfig,
  rootReducer
);

export const store = configureStore({
  reducer: persistedRootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
