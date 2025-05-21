// authService.js

import apiService from './apiService';
import Swal from 'sweetalert2';

// Access token API
// export const getAccessToken = async (username, password) => {
//   return await apiService.postRequest('/access-token', { userId, userRole, secretKey });
// };


//District API 
export const handleFetchDistricts = async (newLanguage) => {
  try {
    sessionStorage.setItem('isTokenRequired', false);

    const response = await apiService.postRequest('GetDistrictName', {}); // assuming relative path only

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

    const response = await apiService.postRequest('/GetTalukName', {
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
    const response = await apiService.postRequest('/GetHobliName', {
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
    const response = await apiService.postRequest('/GetVillageName', {
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

    const response = await apiService.postRequest('/GetHissaList', payload);

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

    const response = await apiService.postRequest('/GetRTCDetailsWithBhoomiVillage', payload);

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



//EPID fetching API

// authService.js

// export const handleFetchEPIDDetails = async (epidNumber) => {
//   try {
//     sessionStorage.setItem('isTokenRequired', true); // assuming this controls token usage

//     const response = await apiService.postRequest('/FnGetOwnerKhataDetails', {
//       propertyEPID: epidNumber,
//     });

//     if (response.responseCode === 200 && response.responseStatus) {
//       const parsedResponse = JSON.parse(response.responseMessage);
//       const approvedDetails = parsedResponse.response?.ApprovedPropertyDetails;

//       if (!approvedDetails) throw new Error("No property details found");

//       const owner = approvedDetails.OwnerDetails?.[0] || {};

//       return {
//         name: owner.OwnerName || "N/A",
//         address: owner.OwnerAddress || "N/A",
//         status: approvedDetails.PropertyClassification || "N/A",
//         relationshipType: owner.IdentifierName || "N/A",
//         relationName: owner.IdType || "N/A",
//       };
//     } else {
//       throw new Error("EPID not found or response invalid");
//     }
//   } catch (err) {
//     console.error("Error fetching EPID details:", err);
//     throw err;
//   }
// };


export const handleFetchEPIDDetails = async (epidNumber) => {
  try {
    sessionStorage.setItem('isTokenRequired', true); // Assuming this controls token usage

    const response = await apiService.postRequest('/FnGetOwnerKhataDetails', {
      propertyEPID: epidNumber,
    });

    const parsedResponse = JSON.parse(response.responseMessage);

    if (parsedResponse.response?.IsValueExists === "Y") {
      if (response.responseCode === 200 && response.responseStatus === true) {


        // Check if IsValueExists is "Y"
        const approvedDetails = parsedResponse.response.ApprovedPropertyDetails;

        if (!approvedDetails) {
          throw new Error("No property details found");
        }

        return approvedDetails; // Return the entire ApprovedPropertyDetails object
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
