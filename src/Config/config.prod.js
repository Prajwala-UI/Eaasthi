// config.prod.js

const ApiCredentials = {
    credentials: {
        apiUrl: "https://testapps.bbmpgov.in/ekhata/api/values",
        username: "BBMPOTP",
        password: "10750b6bdc29495297efd2fb29047a94"
    }
};

const config = {
    apiBaseUrl: ApiCredentials.credentials.apiUrl,

    endpoints: {
        sendOTP: '/fnSendOtp',
        verifyOTP: '/fnValidateOtp'
    }
};


export default config;