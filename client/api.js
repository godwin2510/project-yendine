import axios from 'axios';

const API_URL = 'http://localhost:8080/auth/';

const api = axios.create({
  baseURL: API_URL,
  // withCredentials: true,
});

export const googleAuth = (code) => api.get(`/google?code=${code}`);
