import axios from "axios";

// Using your Vite environment variable
const api = axios.create({
  baseURL: import.meta.env.VITE_Api,
  headers: { "Content-Type": "application/json" },
});

// Single, individual exports
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const Login = async (phone_no: string, password: string) => {
  const response = await api.post("/login", { phone_no, password });
  return response.data;
};

export const Register = async (
  name: string,
  phone_no: string,
  password: string,
) => {
  const response = await api.post("/register", { name, phone_no, password });
  return response.data;
};

export const Logout = async () => {
  const response = await api.post("/logout");
  return response.data;
};
