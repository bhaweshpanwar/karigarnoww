import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Remove the 401 redirect — let React Router route guards handle it
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api;
