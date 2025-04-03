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

export const fetchEvents = (limit = 10) => 
  api.get(`/events?limit=${limit}`);

export const createEvent = (eventData) =>
  api.post('/events', eventData);