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
        verifyOTP: '/fnValidateOtp',
        epid: '/api/eaasthi/FnGetOwnerKhataDetails',
        send_OTP: '/api/otp/fnSendOtp',
        verify_OTP: '/api/otp/fnValidateOtp',
        kaveriDistrict: '/api/Bhoomi/GetDistrictName',
        kaveriTaluk: '/api/Bhoomi/GetTalukName',
        kaveriHobli: '/api/Bhoomi/GetHobliName',
        kaveriVillage: '/api/Bhoomi/GetVillageName',
        kaveriHissa: '/api/Bhoomi/GetHissaList',
        kaveriFetchDetails: '/api/Bhoomi/GetRTCDetailsWithBhoomiVillage',
        insertApprovalInfo: '/api/Approval/fnInsertApprovalinfo',
        listApprovalInfo: '/api/Approval/fnGetApprovalList',
        insertReleaseInfo: '/api/Release/fnInsertReleaseinfo',
        listReleaseInfo: '/api/Release/fnGetReleaseList',
    }
};


export default config;