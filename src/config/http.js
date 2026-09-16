import axios from 'axios';
import { API_URL } from './env';
import { clearSession, getToken } from './auth';

export const http = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const attachAuth = (config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

const onUnauthorized = (error) => {
  const status = error.response?.status;
  const path = window.location.pathname;
  const isAuthPage = path.startsWith('/login') || path.startsWith('/forgot') || path.startsWith('/reset-password');
  if (status === 401 && !isAuthPage) {
    clearSession();
    window.location.assign('/login');
  }
  return Promise.reject(error);
};

http.interceptors.request.use(attachAuth);
http.interceptors.response.use((response) => response, onUnauthorized);

axios.interceptors.request.use(attachAuth);
axios.interceptors.response.use((response) => response, onUnauthorized);
