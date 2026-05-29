import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/identity/',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add a request interceptor to inject the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to unwrap data and handle errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // If the error has a response from the server, reject with that data
    if (error.response && error.response.data) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);

export default api;
