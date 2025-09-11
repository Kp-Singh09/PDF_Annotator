import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Create axios instances
export const authAPI = axios.create({
  baseURL: `${API_BASE_URL}/api/auth`,
});

export const pdfAPI = axios.create({
  baseURL: `${API_BASE_URL}/api/pdf`,
});

export const highlightsAPI = axios.create({
  baseURL: `${API_BASE_URL}/api/highlights`,
});

// Request interceptors to add auth token
const addAuthToken = (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

pdfAPI.interceptors.request.use(addAuthToken);
highlightsAPI.interceptors.request.use(addAuthToken);

// Response interceptors for error handling
const handleError = (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return Promise.reject(error);
};

authAPI.interceptors.response.use(response => response, handleError);
pdfAPI.interceptors.response.use(response => response, handleError);
highlightsAPI.interceptors.response.use(response => response, handleError);