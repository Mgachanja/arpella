import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Uses localStorage
import authReducer from "../slices/authSlice";
import cartReducer from "../slices/cartSlice";
import staffReducer from "../slices/staffSlice"
import productsReducer from "../slices/productsSlice"
import { thunk } from "redux-thunk";

// Persist config for auth
const authPersistConfig = {
  key: "auth",
  storage,
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer, // Persist auth state
    cart: cartReducer,
    staff:staffReducer,
    products: productsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(thunk), // Prevent serializable state check errors
});

export const persistor = persistStore(store);
