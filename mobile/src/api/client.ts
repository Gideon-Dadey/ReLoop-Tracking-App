import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Use your computer's local network IP so the phone can reach the backend
// Update this IP if your network changes
const API_URL = 'http://192.168.180.80:3000'; // Current Host IP

export const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Optional: Response interceptor for handling 401s and refreshing tokens
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // Refresh logic would go here
      // const refreshToken = useAuthStore.getState().refreshToken;
      // const { data } = await axios.post(`${API_URL}/auth/refresh`, { token: refreshToken });
      // useAuthStore.getState().setAuth(data.user, data.accessToken, data.refreshToken);
      // originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      // return apiClient(originalRequest);
    }
    return Promise.reject(error);
  }
);
