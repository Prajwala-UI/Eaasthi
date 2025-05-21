//axiosInstance.js
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import Swal from "sweetalert2";

const axiosInstance = axios.create({
    // baseURL: 'https://localhost:7277/api/Bhoomi/',
    baseURL: 'https://localhost:7049/api/eaasthi/',
    headers: {
        Accept: '*/*',  
    },
});

// Request interceptor for adding Authorization header
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = sessionStorage.getItem('accessToken');
         const isTokenRequired = sessionStorage.getItem('isTokenRequired');
        
        console.log(accessToken, "accessToken",sessionStorage.getItem('isTokenRequired'));
        if (accessToken && isTokenRequired === "false") {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log("response",error.response);
        // Handle token expiration or other errors globally
        if (error.response.status === 401 ||  error.response.status === 403) {
            console.error('Unauthorized, redirecting to login...');
            Swal.fire({
                title: "Session Expired",
                text: "Your token has expired. Please re-login to access the dashboard.",
                icon: "warning",
                confirmButtonText: "Re-login",
                allowOutsideClick: false, // Prevent closing by clicking outside
              }).then((result) => {
                if (result.isConfirmed) {
                  // Navigate to the login page
                  window.location.href = "/"; // Replace with your login page route
                }
              });
              
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
