// store.js
import { configureStore } from "@reduxjs/toolkit";
import pasteReducer from "./pasteSlice";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    paste: pasteReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== "production",
});
