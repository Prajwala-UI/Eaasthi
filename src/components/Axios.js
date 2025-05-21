import axios from 'axios';
import CryptoJS from 'crypto-js';

// API URLs
const ENVIRONMENTS = {
  local: "https://localhost:44368/v1/",
  test: "https://bbmpeaasthi.karnataka.gov.in/objection_api_test/v1/",
  live: "https://bbmpeaasthi.karnataka.gov.in/BBMPCoreAPI/v1/"
};

// Select the environment
const baseURL = ENVIRONMENTS.local; // Change this to .test or .live as needed
const APP_SECRET = "$343145dsfsdf-3241^&+&!^&*@#-asd23";
// Create axios instance
const instance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const generateRandomNumber = (min = 1000, max = 9999) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
// Token management
let tokenPromise = null;

const getNewToken = async () => {
  try {
   const random =  generateRandomNumber();
    const hashedPassword = CryptoJS.MD5(random).toString();
    const data = {
      UserId: random,
      Password: hashedPassword + random.toString(),
      IsOTPGenerated: true
    };
    
    const queryString = new URLSearchParams(data).toString();
    const response = await axios.post(`${baseURL}Auth/CitizenLogin?${queryString}`);
    
    if (response.data.token) {
      // Store token in sessionStorage or other secure storage
     // sessionStorage.setItem('auth_token', response.data.token);
      return response.data.token;
    }
    throw new Error('Token not received from server');
  } catch (error) {
    console.error('Error getting new token:', error);
    throw error;
  }
};

// Request interceptor
instance.interceptors.request.use(
  async (config) => {
    try {
      // Check if we have a token in storage
     // let token = sessionStorage.getItem('auth_token');
      let token = false
      // If no token, request a new one
      if (!token) {
        // Use promise caching to prevent multiple simultaneous token requests
        if (!tokenPromise) {
          tokenPromise = getNewToken();
        }
        token = await tokenPromise;
        tokenPromise = null; // Reset the promise
      }

      // Add token to request header
      config.headers['Authorization'] = `Bearer ${token}`;
      const timestamp = Math.floor(Date.now() / 1000).toString();
    
    // Create verification hash
    const hash = CryptoJS.HmacSHA256(timestamp, APP_SECRET).toString(CryptoJS.enc.Base64);
    
    // Add verification headers
    config.headers['X-App-Verification'] = hash;
    config.headers['X-Request-Timestamp'] = timestamp;
      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Clear existing token
       // sessionStorage.removeItem('auth_token');
        tokenPromise = null;

        // Get new token
        const token = await getNewToken();
        
        // Retry the original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return instance(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Handle failed refresh (e.g., redirect to login)
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;