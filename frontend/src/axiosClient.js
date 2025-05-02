// axiosClient.js
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8000/', // adapte selon config prod/dev
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // utile si tu utilises des cookies/session
});

export default axiosClient;
