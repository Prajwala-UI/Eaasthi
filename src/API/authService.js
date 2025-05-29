// authService.js

import apiService from './apiService';
import Swal from 'sweetalert2';
import config from '../Config/config';

// Access token API
export const getAccessToken = async () => {
  const formData = new FormData();
  formData.append("username", "admin");
  formData.append("password", "admin@123");

  return await apiService.postRequest('/Token', formData);
};
//send otp API
export const sendOtpAPI = async (mobileNumber) => {
  try {
    const response = await apiService.postRequest(`${config.endpoints.send_OTP}`, {
      mobileNumber: mobileNumber,
      source: "Layout khata",
    });
    console.log("Full response inside sendOtpAPI:", response);
    return response;
  } catch (error) {
    console.error("OTP Send Error:", error);
    throw error;
  }
};
//verify OTP API
export const verifyOtpAPI = async (mobileNumber, otp) => {
  try {
    const response = await apiService.postRequest(`${config.endpoints.verify_OTP}`, {
      mobileNumber,
      otp,
      source: "Layout khata",
    });
    console.log("Full response inside verifyOtpAPI:", response);
    return response;
  } catch (error) {
    console.error("OTP Verification Error:", error);
    throw error;
  }
};


//District API 
export const handleFetchDistricts = async (newLanguage) => {
  try {
    sessionStorage.setItem('isTokenRequired', false);

    const response = await apiService.getRequest(`${config.endpoints.kaveriDistrict}`, {}); // assuming relative path only

    if (response.responsE_CODE === "200") {
      const modifiedDistricts = response.district.map((dist) => ({
        ...dist,
        displayName: newLanguage === 'kn' ? dist.districT_NAME_KN : dist.districT_NAME
      }));

      return modifiedDistricts; // return processed data
    } else {
      throw new Error(`Unexpected response code: ${response.responsE_CODE}`);
    }
  } catch (err) {
    console.error("Error fetching districts", err);
    throw err;
  }
};
//taluk API
export const handleFetchTalukOptions = async (districtCode, language) => {
  try {
    sessionStorage.setItem('isTokenRequired', false); // mark token needed if required

    const response = await apiService.postRequest(`${config.endpoints.kaveriTaluk}`, {
      districT_CODE: String(districtCode),
    });

    if (response.responsE_CODE === "200") {
      const talukOptions = response.taluk.map((item) => ({
        ...item,
        displayName: language === 'kn' ? item.talukA_NAME_KN : item.talukA_NAME,
      }));

      return talukOptions;
    } else {
      console.error('Unexpected response code while fetching taluks:', response);
      throw new Error(response.responsE_DESC || 'Taluk fetch failed');
    }
  } catch (err) {
    console.error("Error fetching taluk options:", err);
    throw err;
  }
};
//Hobli API
export const handleFetchHobliOptions = async (districtCode, talukCode, language) => {
  try {
    sessionStorage.setItem('isTokenRequired', false);
    const response = await apiService.postRequest(`${config.endpoints.kaveriHobli}`, {
      districT_CODE: String(districtCode),
      taluK_CODE: String(talukCode),
    });

    if (response.responsE_CODE === "200") {
      return response.hobli.map(item => ({
        ...item,
        displayName: language === 'kn' ? item.hoblI_NAME_KN : item.hoblI_NAME
      }));
    }

    console.error("Error in hobli API response:", response);
    return [];
  } catch (err) {
    console.error("Error fetching hoblis:", err);
    throw err;
  }
};
//Village API
export const handleFetchVillageOptions = async (districtCode, talukCode, hobliCode, language) => {
  try {
    sessionStorage.setItem('isTokenRequired', false);
    const response = await apiService.postRequest(`${config.endpoints.kaveriVillage}`, {
      districT_CODE: String(districtCode),
      taluK_CODE: String(talukCode),
      hoblI_CODE: String(hobliCode),
    });

    if (response.responsE_CODE === "200") {
      return response.village.map(item => ({
        ...item,
        displayName: language === 'kn' ? item.villagE_NAME_KN : item.villagE_NAME
      }));
    }

    console.error("Error in village API response:", response);
    return [];
  } catch (err) {
    console.error("Error fetching villages:", err);
    throw err;
  }
};
//GO btn fetch API
export const handleFetchHissaOptions = async ({
  districtCode,
  talukCode,
  hobliCode,
  villageCode,
  surveyNo
}) => {
  try {
    sessionStorage.setItem('isTokenRequired', false);
    const payload = {
      bhm_dist_code: String(districtCode),
      bhm_taluk_code: String(talukCode),
      bhm_hobli_code: String(hobliCode),
      village_code: String(parseInt(villageCode)),
      survey_no: String(surveyNo),
    };

    const response = await apiService.postRequest(`${config.endpoints.kaveriHissa}`, payload);

    if (response?.surnoc && response?.hissaNo && response?.landCode) {
      return {
        surnocOptions: [response.surnoc],
        hissaOptions: [response.hissaNo],
        landCode: response.landCode,
      };
    } else {
      console.warn("No valid Hissa data received", response);
      return {
        surnocOptions: [],
        hissaOptions: [],
        landCode: '',
      };
    }
  } catch (error) {
    console.error("Error in handleFetchHissaOptions:", error);
    throw error;
  }
};
//RTC details API
export const fetchRTCDetailsAPI = async ({
  districtCode,
  talukCode,
  hobliCode,
  villageCode,
  landCode
}) => {
  try {
    const payload = {
      disT_CODE: districtCode.toString(),
      taluK_CODE: talukCode.toString(),
      hoblI_CODE: hobliCode.toString(),
      villagE_CODE: villageCode.toString(),
      lanD_CODE: landCode.toString(),
    };

    const response = await apiService.postRequest(`${config.endpoints.kaveriFetchDetails}`, payload);

    if (response?.responsE_CODE === '200') {
      const parsedData = JSON.parse(response.data);
      return { success: true, data: parsedData };
    } else {
      return { success: false, message: response.responsE_MESSAGE };
    }
  } catch (error) {
    console.error("Error in fetchRTCDetailsAPI:", error);
    throw error;
  }
};
//Survey Number first block Save API
export const submitsurveyNoDetails = async (payload) => {
  try {
   
    const response = await apiService.postRequest(`${config.endpoints.EPIDFetchDetails}`,  payload);

     return response;
  } catch (error) {
    console.error("EPID Fetching Details Error:", error);
    throw error;
  }
};

//EPID fetching API
export const handleFetchEPIDDetails = async (epidNumber) => {
  try {
    sessionStorage.setItem('isTokenRequired', false); // Assuming this controls token usage

    const response = await apiService.postRequest(`${config.endpoints.epid}`, {
      propertyEPID: epidNumber,
    });

    // The API returns approvedPropertyDetails inside epidKhataDetails.response
    const parsedResponse = response.epidKhataDetails?.response;

    if (parsedResponse?.isValueExists === "Y") {
      if (response.responseCode === 200 && response.responseStatus === true) {
        const approvedDetails = parsedResponse.approvedPropertyDetails;

        if (!approvedDetails) {
          throw new Error("No property details found");
        }

        return approvedDetails;
      } else {
        throw new Error("Please provide a correct EPID");
      }
    } else {
      Swal.fire({
        title: "Error",
        text: "EPID is invalid. Please provide a correct EPID",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  } catch (err) {
    console.error("Error fetching EPID details:", err);
    throw err;
  }
};
//EPID first block Save API
export const submitEPIDDetails = async (payload) => {
  try {
   
    const response = await apiService.postRequest(`${config.endpoints.EPIDFetchDetails}`,  payload);

     return response;
  } catch (error) {
    console.error("EPID Fetching Details Error:", error);
    throw error;
  }
};


//Approval Order API
export const insertApprovalInfo = async (payload) => {
  try {
    const response = await apiService.postRequest(config.endpoints.insertApprovalInfo, payload);
    return response;
  } catch (error) {
    console.error("Insert Approval Info Error:", error);
    throw error;
  }
};

//Approval Order List API
export const listApprovalInfo = async ({ level, aprLkrsId, aprId }) => {
  try {
     const url = `${config.endpoints.listApprovalInfo}?level=${level}&aprLkrsId=${aprLkrsId}&aprId=${aprId}`;
    const response = await apiService.getRequest(url);
  return response;
  } catch (error) {
    console.error("Insert Approval Info Error:", error);
    throw error;
  }
};


//release Order API
export const insertReleaseInfo = async (payload) => {
  try {
    const response = await apiService.postRequest(config.endpoints.insertReleaseInfo, payload);
    return response;
  } catch (error) {
    console.error("Insert Approval Info Error:", error);
    throw error;
  }
};

//release Order List API
export const listReleaseInfo = async ({ level, aprLkrsId, aprId }) => {
  try {
     const url = `${config.endpoints.listReleaseInfo}?level=${level}&aprLkrsId=${aprLkrsId}&aprId=${aprId}`;
    const response = await apiService.getRequest(url);
  return response;
  } catch (error) {
    console.error("Insert Approval Info Error:", error);
    throw error;
  }
};