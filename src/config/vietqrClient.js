import axios from 'axios';

const VIETQR_BASE_URL = 'https://api.vietqr.io/v2';

const vietqrClient = axios.create({
  baseURL: VIETQR_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'x-client-id': process.env.VIETQR_CLIENT_ID || '',
    'x-api-key': process.env.VIETQR_API_KEY || '',
  },
});

// Response interceptor for consistent error handling
vietqrClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.desc || error.message || 'VietQR API error';
    const status = error.response?.status || 500;
    const err = new Error(message);
    err.status = status;
    err.vietqrData = error.response?.data;
    throw err;
  }
);

export default vietqrClient;
