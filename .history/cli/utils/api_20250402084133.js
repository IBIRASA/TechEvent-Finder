import axios from 'axios';
import { style } from './styles.js';

const api = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:3000/api'
});

api.interceptors.response.use(
  response => response.data,
  error => {
    throw new Error(
      error.response?.data?.message || 
      style.error('API request failed')
    );
  }
);

// Add this to your existing api.js
export const fetchUsers = async (options = {}) => {
    const params = new URLSearchParams();
    if (options.admins) params.append('admin', 'true');
    
    return api.get(`/users?${params.toString()}`);
  };

export const createEvent = (eventData) =>
  api.post('/events', eventData);