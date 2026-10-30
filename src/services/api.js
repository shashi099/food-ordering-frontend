import axios from 'axios';

// Create an Axios instance with your Spring Boot backend URL
const API = axios.create({
  baseURL: 'http://localhost:8080', // Adjust this if your Spring Boot runs on a different port
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: You can intercept requests later to attach JWT tokens for security
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // We'll use this later for authentication
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;