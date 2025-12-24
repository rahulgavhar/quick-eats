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
import themeReducer from "./slices/themeSlice";

const userPersistConfig = {
  key: "user",
  storage,
  whitelist: ["userData", "city"],
};

const persistedUserReducer = persistReducer(
  userPersistConfig,
  userReducer
);

const rootReducer = combineReducers({
  user: persistedUserReducer,
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
