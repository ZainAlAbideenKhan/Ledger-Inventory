import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* =========================
   REQUEST INTERCEPTOR
   - Attach token automatically
========================= */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   RESPONSE INTERCEPTOR
   - Centralized error handling
========================= */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network / server down
      return Promise.reject({
        message: 'Network error. Please try again.',
      });
    }

    const { status, data } = error.response;

    if (status === 401) {
      // Invalid / expired token
      localStorage.removeItem('token');
    }

    return Promise.reject({
      status,
      message: data?.message || 'Something went wrong',
    });
  }
);

export default api;
