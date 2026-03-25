import axios from "axios";

export const weatherClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 5000,
});

export const airClient = axios.create({
  baseURL: import.meta.env.VITE_AIR_BASE,
  timeout: 5000,
});