import axios from "axios";

// Change VITE_API_BASE_URL to switch between local and deployed backend
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export { API_BASE_URL };
export default apiClient;
