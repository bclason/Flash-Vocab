import { getDeviceId } from './utils/deviceId';

// API Configuration
const config = {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://68.43.58.115',
  
  // Helper function to get headers with device ID
  getHeaders: () => ({
    'Content-Type': 'application/json',
    'X-Device-ID': getDeviceId()
  })
};

export default config;