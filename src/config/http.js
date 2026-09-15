import axios from 'axios';
import { API_URL } from './env';

export const http = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});
