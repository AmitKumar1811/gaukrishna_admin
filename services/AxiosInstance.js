import axios from "axios";
import { store } from "../src/store/store";

const axiosInstance = axios.create({
  baseURL: `https://api.gaukrishna.com/api/v1`, // Update base URL for new project name
});

axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth?.token;

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`; // Standard Bearer token
    }

    // Detect if payload is FormData
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Dispatch logout action if needed, or handle redirect
      // store.dispatch(logout()); // Need to import logout from authSlice
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
