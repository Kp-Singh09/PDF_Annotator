import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Create axios instances
export const authAPI = axios.create({
  baseURL: `${API_BASE_URL}/api/auth`,
});

export const pdfAPI = axios.create({
  // FIX: The base URL should point to '/api/pdfs'
  baseURL: `${API_BASE_URL}/api/pdfs`,
});

export const highlightsAPI = axios.create({
  baseURL: `${API_BASE_URL}/api/highlights`,
});

// NEW: Add a new instance for the drawings API
export const drawingsAPI = axios.create({
  baseURL: `${API_BASE_URL}/api/drawings`,
});


// Request interceptors to add auth token
const addAuthToken = (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // FIX: The backend expects 'x-auth-token', not 'Authorization'
    config.headers['x-auth-token'] = token;
  }
  return config;
};

// Apply interceptors
authAPI.interceptors.request.use(addAuthToken);
pdfAPI.interceptors.request.use(addAuthToken);
highlightsAPI.interceptors.request.use(addAuthToken);
drawingsAPI.interceptors.request.use(addAuthToken); // Also apply to drawings


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
drawingsAPI.interceptors.response.use(response => response, handleError); // Also apply to drawings