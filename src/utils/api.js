import axios from 'axios';

/**
 * API Client Configuration
 * 
 * Centralized HTTP client with interceptors for auth tokens,
 * error handling, and request/response transformation.
 */

const hostname = window.location.hostname;
const BASE_URL = import.meta.env.VITE_API_URL || `http://${hostname}:8080/api/identity/`;

/**
 * Get stored auth token
 */
const getToken = () => {
  try {
    const token = localStorage.getItem('auth_token');
    return token || null;
  } catch {
    return null;
  }
};

// Create axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors and extract data
axiosInstance.interceptors.response.use(
  (response) => {
    // If it's a 204 No Content, return null
    if (response.status === 204) return null;
    return response.data;
  },
  (error) => {
    // Return a standardized error object
    if (error.response) {
      // Server responded with a status other than 200 range
      const data = error.response.data;
      
      // Handle Laravel validation errors specifically
      if (error.response.status === 422 && data.errors) {
        // Extract the first validation error message
        const firstErrorKey = Object.keys(data.errors)[0];
        const firstErrorMessage = data.errors[firstErrorKey][0];
        return Promise.reject(new Error(firstErrorMessage || data.message || 'Données invalides'));
      }

      const message = data?.message || `Erreur HTTP ${error.response.status}`;
      return Promise.reject(new Error(message));
    } else if (error.request) {

      // Request was made but no response was received
      return Promise.reject(new Error('Erreur de connexion au serveur. Vérifiez votre connexion internet.'));
    } else {
      // Something happened in setting up the request that triggered an Error
      return Promise.reject(new Error(error.message));
    }
  }
);

/**
 * API client methods
 */
const api = {
  get: (endpoint, options = {}) => axiosInstance.get(endpoint, options),
  
  post: (endpoint, data, options = {}) => axiosInstance.post(endpoint, data, options),
  
  put: (endpoint, data, options = {}) => axiosInstance.put(endpoint, data, options),
  
  patch: (endpoint, data, options = {}) => axiosInstance.patch(endpoint, data, options),
  
  delete: (endpoint, options = {}) => axiosInstance.delete(endpoint, options),
  
  // Expose the axios instance directly if needed for custom configs
  instance: axiosInstance,
};

export default api;
