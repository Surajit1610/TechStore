import axios from "axios";
import { useAuthStore } from "@/store/Auth";

const api = axios.create({});

api.interceptors.request.use(
  // @ts-ignore
  (config) => {
    if (typeof window !== "undefined") {
      const jwt = useAuthStore.getState().jwt;
      if (jwt) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${jwt}`;
      }
    }
    return config;
  },
  // @ts-ignore
  (error) => Promise.reject(error)
);

// Gracefully handle expired/missing JWTs
api.interceptors.response.use(
  // @ts-ignore
  (response) => response,
  // @ts-ignore
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await useAuthStore.getState().verifySession();
        const newJwt = useAuthStore.getState().jwt;
        if (newJwt) {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newJwt}`;
          return api(originalRequest);
        }
      } catch (e) {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
