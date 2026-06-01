import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import authReducer from "./authSlice";
import categoryReducer from "./categorySlice";
import productReducer from "./productSlice";
import blogReducer from "./blogSlice";
import orderReducer from "./orderSlice";
import transactionReducer from "./transactionSlice";
import userReducer from "./userSlice";
import contactReducer from "./contactSlice";


const persistConfig = {
  key: "gaukrishna-root",
  storage,
  whitelist: ["auth"], // Only persist auth for now
};

const rootReducer = combineReducers({
  auth: authReducer,
  categories: categoryReducer,
  products: productReducer,
  blogs: blogReducer,
  orders: orderReducer,
  transactions: transactionReducer,
  users: userReducer,
  contacts: contactReducer,
});


const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});

export const persistor = persistStore(store);
