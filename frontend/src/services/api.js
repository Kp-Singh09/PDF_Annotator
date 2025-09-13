import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const authAPI = axios.create({
  baseURL: `${API_BASE_URL}/api/auth`,
});

export const pdfAPI = axios.create({

  baseURL: `${API_BASE_URL}/api/pdfs`,
});

export const highlightsAPI = axios.create({
  baseURL: `${API_BASE_URL}/api/highlights`,
});

export const drawingsAPI = axios.create({
  baseURL: `${API_BASE_URL}/api/drawings`,
});

const addAuthToken = (config) => {
  const token = localStorage.getItem('token');
  if (token) {

    config.headers['x-auth-token'] = token;
  }
  return config;
};

authAPI.interceptors.request.use(addAuthToken);
pdfAPI.interceptors.request.use(addAuthToken);
highlightsAPI.interceptors.request.use(addAuthToken);
drawingsAPI.interceptors.request.use(addAuthToken); 

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
drawingsAPI.interceptors.response.use(response => response, handleError); 