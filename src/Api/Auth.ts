import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_Api, // Ensure your .env has VITE_Api defined
  headers: { "Content-Type": "application/json" },
});

// Intercept requests to attach the token from Zustand
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  console.log("Interceptor is sending token:", token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Restored exact original names: Login, Register, Logout
export const Login = async (phone_no: string, password: string) => {
  const response = await api.post("/auth/login", { phone_no, password });
  return response.data;
};

export const Register = async (
  name: string,
  phone_no: string,
  password: string,
) => {
  const response = await api.post("/auth/register", {
    name,
    phone_no,
    password,
  });
  return response.data;
};

export const Logout = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

export const ResetPassword = async (phone_no: string, password: string) => {
  // Sending as a PUT request to the backend
  const response = await api.put("/auth/reset-password", {
    phone_no,
    password,
  });
  return response.data;
};
