import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import DashboardLayout from '../../Layout/DashboardLayout';
import { useTranslation } from "react-i18next";
import i18n from "../../localization/i18n";
import SAS_Sample from '../../assets/Sample_SAS_APPLICATIONNO.jpeg';
import SampleDeep_no from '../../assets/deedNo.jpg';
import Swal from "sweetalert2";
import Loader from "../../Layout/Loader";
import DataTable from "react-data-table-component";
import axios from 'axios';
import { useTable, usePagination } from "react-table";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { toast, Toaster } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import apiService from '../../API/apiService';
import {
    handleFetchDistricts, handleFetchTalukOptions, handleFetchHobliOptions, handleFetchVillageOptions,
    handleFetchHissaOptions, fetchRTCDetailsAPI, handleFetchEPIDDetails, getAccessToken, sendOtpAPI, verifyOtpAPI, submitEPIDDetails, submitsurveyNoDetails,
    insertApprovalInfo, listApprovalInfo, insertReleaseInfo, listReleaseInfo,
} from '../../API/authService';

import bbmplogo from '../../assets/bbmp.png';

export const useLoader = () => {
    const [loading, setLoading] = useState(false);

    const start_loader = () => setLoading(true);
    const stop_loader = () => setLoading(false);

    return { loading, start_loader, stop_loader };
};


const BBMP_LayoutForm = () => {

    const { loading, start_loader, stop_loader } = useLoader(); // Use loader context
    const [zoomLevel] = useState(0.9);
    const [newLanguage, setNewLanguage] = useState(localStorage.getItem('selectedLanguage'));

    const [siteData, setSiteData] = useState([]);
    const [gpsData, setGpsData] = useState({});

    useEffect(() => {
        document.body.style.zoom = zoomLevel;
    }, [zoomLevel]);

    useEffect(() => {
        const interval = setInterval(() => {
            const storedLang = localStorage.getItem('selectedLanguage') || 'en';
            if (storedLang !== newLanguage) {
                setNewLanguage(storedLang);
            }
        }, 500); // Check every 500ms

        return () => clearInterval(interval); // Cleanup



    }, [newLanguage]);

    const CreatedBy = 1;
    const CreatedName = "username";
    const RoleID = "user";

    useEffect(() => {
        generate_Token();

        sessionStorage.setItem('createdBy', CreatedBy.toString());
        sessionStorage.setItem('createdName', CreatedName);
        sessionStorage.setItem('RoleID', RoleID);

    }, []);

    const generate_Token = async () => {
        try {
            const response = await getAccessToken();
            sessionStorage.setItem('access_token', response.access_token);
        } catch (err) {
            console.error("Error fetching districts", err);
        } finally {

        }
    };


    const [selectedLandType, setSelectedLandType] = useState("convertedRevenue");

    const [rtc_AddedData, setRtc_AddedData] = useState([]);

    const [approval_details, setApprovalDetails] = useState([]);
    const [order_details, setOrderDetails] = useState([]);


    return (
        <>
            {loading && <Loader />}

            <DashboardLayout>

                <div className={`layout-form-container ${loading ? 'no-interaction' : ''}`}>
                    <div className="my-3 my-md-5">
                        <div className="container mt-5">
                            <div className="card">
                                <div className="card-header layout_btn_color" >
                                    <h5 className="card-title" style={{ textAlign: 'center' }}>Bulk eKhata for layout to owner / developer</h5>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                            <h6>What is the type of Land on which layout is formed</h6>
                                        </div>

                                        {/* First Radio Button */}
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6" >
                                            <div className="form-check">
                                                <label className="form-check-label">
                                                    <input
                                                        className="form-check-input radioStyle"
                                                        type="radio"
                                                        name="landType"
                                                        value="convertedRevenue"
                                                        onChange={() => setSelectedLandType("convertedRevenue")}
                                                        checked={selectedLandType === "convertedRevenue"}
                                                    />
                                                    Converted Revenue Survey No (No BBMP Khata)
                                                </label>
                                            </div>
                                        </div>

                                        {/* Second Radio Button */}
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                            <div className="form-check">
                                                <label className="form-check-label">
                                                    <input
                                                        className="form-check-input radioStyle"
                                                        type="radio"
                                                        name="landType"
                                                        value="bbmpKhata"
                                                        onChange={() => setSelectedLandType("bbmpKhata")}
                                                        checked={selectedLandType === "bbmpKhata"}
                                                    />
                                                    BBMP A-Khata</label>
                                            </div>
                                        </div>

                                        {/* Section for First Radio Button */}
                                        {/* Section for BBMP A-Khata Selection */}
                                        {selectedLandType === "bbmpKhata" && (
                                            <BBMPKhata />
                                        )}

                                        {/* Section for Second Radio Button */}
                                        {selectedLandType === "convertedRevenue" && (
                                            <NoBBMPKhata Language={newLanguage} rtc_AddedData={rtc_AddedData} setRtc_AddedData={setRtc_AddedData} setOrderDetails={setOrderDetails} />
                                        )}

                                    </div>
                                </div>
                            </div>

                            <BDA approval_details={approval_details} setApprovalDetails={setApprovalDetails} order_details={order_details} setOrderDetails={setOrderDetails} />
                            <IndividualGPSBlock />
                            <ECDetailsBlock />
                            <DeclarationBlock rtc_AddedData={rtc_AddedData} approval_details={approval_details} order_details={order_details} />
                        </div>

                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
//No BBMP Khata section
const NoBBMPKhata = ({ Language, rtc_AddedData, setRtc_AddedData }) => {

    const { loading, start_loader, stop_loader } = useLoader(); // Use loader context
    const [language, setLanguage] = useState(localStorage.getItem("selectedLanguage"));
    const { t, i18n } = useTranslation();
    const [districts, setDistricts] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState("");

    const [taluks, setTaluks] = useState([]);
    const [selectedTaluk, setSelectedTaluk] = useState("");

    const [hoblis, setHoblis] = useState([]);
    const [selectedHobli, setSelectedHobli] = useState("");

    const [villages, setVillages] = useState([]);
    const [selectedVillage, setSelectedVillage] = useState("");

    const [surveyNumber, setSurveyNumber] = useState("");

    const [surnoc, setSurnoc] = useState('');
    const [surnocOptions, setSurnocOptions] = useState([]);

    const [hissaNo, setHissaNo] = useState('');
    const [hissaOptions, setHissaOptions] = useState([]);
    const [landCode, setLandCode] = useState('');


    const [selectedSurnoc, setSelectedSurnoc] = useState('');
    const [selectedHissaNo, setSelectedHissaNo] = useState('');


    useEffect(() => {
        console.log("Language changed:", Language);
        fetchDistricts(Language);
    }, [Language]);

    useEffect(() => {
        if (selectedDistrict) {
            fetchTaluks(selectedDistrict, Language);
        }
    }, [selectedDistrict, Language]);

    const [createdBy, setCreatedBy] = useState(null);
    const [createdName, setCreatedName] = useState('');
    const [roleID, setRoleID] = useState('');

    useEffect(() => {
        const storedCreatedBy = sessionStorage.getItem('createdBy');
        const storedCreatedName = sessionStorage.getItem('createdName');
        const storedRoleID = sessionStorage.getItem('RoleID');

        setCreatedBy(storedCreatedBy);
        setCreatedName(storedCreatedName);
        setRoleID(storedRoleID);


    }, []);

    const [isDistrictReadonly, setIsDistrictReadonly] = useState(false);

    const fetchDistricts = async (newLanguage) => {

        try {
            const districts = await handleFetchDistricts(newLanguage);
            setDistricts(districts);
            setSelectedDistrict(20);
            setIsDistrictReadonly(true);

        } catch (err) {
            console.error("Error fetching districts", err);

        } finally {
        }
    };
    const fetchTaluks = async (districtCode, Language) => {
        console.log("Fetching taluks for district:", districtCode);

        try {
            const options = await handleFetchTalukOptions(districtCode, language);
            setTaluks(options);
        } catch (err) {
            console.error('Failed to load Taluk options:', err);

        } finally {
        }
    };
    const fetchHoblis = async (districtCode, talukCode, Language) => {
        console.log("Fetching Hobli for district:", districtCode, talukCode, language);

        try {
            const hobliOptions = await handleFetchHobliOptions(districtCode, talukCode, language);
            setHoblis(hobliOptions);

        } catch (err) {
            console.error('Failed to fetch hoblis:', err);

        } finally {

        }
    };
    const fetchVillages = async (districtCode, talukCode, hobliCode, Language) => {
        console.log("Fetching Hobli for district:", districtCode, talukCode, hobliCode, language);

        try {
            const villageOptions = await handleFetchVillageOptions(districtCode, talukCode, hobliCode, language);
            setVillages(villageOptions);

        } catch (err) {
            console.error('Failed to fetch villages:', err);
        } finally {
        }
    };
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [showTable, setShowTable] = useState(false);
    const [rtcAddedData, setRtcAddedData] = useState([]);
    const [rtcData, setRtcData] = useState([]);
    const handleDistrictChange = (e) => {
        const districtCode = e.target.value;
        console.log('Selected District:', districtCode); // Debug

        setSelectedDistrict(districtCode);
        setSelectedTaluk("");
        setSelectedHobli("");
        setSelectedVillage("");
        setTaluks([]);
        setHoblis([]);
        setVillages([]);

        fetchTaluks(districtCode, Language); // Language should be defined
    };
    const handleTalukChange = (e) => {
        const talukCode = e.target.value;
        setSelectedTaluk(talukCode);
        setSelectedHobli('');
        setSelectedVillage('');
        setHoblis([]);        // Clear previous hoblis
        setVillages([]);      // Clear previous villages
        setSurveyNumber('');
        // Reset and disable Surnoc and Hissa
        setSurnocEnabled(false);
        setHissaEnabled(false);
        setSelectedSurnoc('');
        setSelectedHissaNo('');
        setSurnocOptions([]);
        setHissaOptions([]);

        // Fetch hoblis for selected taluk
        fetchHoblis(selectedDistrict, talukCode, Language);
    };
    const handleHobliChange = (e) => {

        const hobliCode = e.target.value;
        setSelectedHobli(hobliCode);
        setSelectedVillage("");
        setVillages([]);
        setSurveyNumber('');

        // Reset and disable Surnoc and Hissa
        setSurnocEnabled(false);
        setHissaEnabled(false);
        setSelectedSurnoc('');
        setSelectedHissaNo('');
        setSurnocOptions([]);
        setHissaOptions([]);

        // Fetch villages for selected hobli
        fetchVillages(selectedDistrict, selectedTaluk, hobliCode, Language);
    };
    const handleVillageChange = (e) => {

        const value = e.target.value;
        setSelectedVillage(value);
        setSurveyNumber(''); // Clear existing survey number

        // Reset and disable Surnoc and Hissa
        setSurnocEnabled(false);
        setHissaEnabled(false);
        setSelectedSurnoc('');
        setSelectedHissaNo('');
        setSurnocOptions([]);
        setHissaOptions([]);
    };
    const handleSurveyNumberChange = (e) => {
        const value = e.target.value;
        if (/^[0-9-/]*$/.test(value)) {  // Only numbers, hyphen, slash
            setSurveyNumber(value);
        }
    };
    const [surnocEnabled, setSurnocEnabled] = useState(false);
    const [hissaEnabled, setHissaEnabled] = useState(false);
    const resetFields = () => {
        setSelectedDistrict('');
        setSelectedTaluk('');
        setSelectedHobli('');
        setSelectedVillage('');
    };
    const handleFetchHissa = () => {
        if (surveyNumber && selectedVillage) {
            fetch_go();
        }
    };

    const fetch_go = async () => {
        start_loader();
        try {
            const hissaData = await handleFetchHissaOptions({
                districtCode: selectedDistrict,
                talukCode: selectedTaluk,
                hobliCode: selectedHobli,
                villageCode: selectedVillage,
                surveyNo: surveyNumber,
            });

            setSelectedSurnoc("");
            setSelectedHissaNo("");
            setSurnocOptions(hissaData.surnocOptions || []);
            setHissaOptions(hissaData.hissaOptions || []);
            setLandCode(hissaData.landCode);

            // Enable Surnoc dropdown, disable Hissa until Surnoc is selected
            setSurnocEnabled(true);
            setHissaEnabled(false);
        } catch (err) {
            console.error("Failed to fetch Hissa data", err);
        } finally {
            stop_loader();
        }
    };

    const fetchRTCDetails = async () => {

        if (!selectedDistrict || !selectedTaluk || !selectedHobli || !selectedVillage) {
            setError('Please select all fields (District, Taluk, Hobli, and Village).');
            setShowTable(false);
            return;
        }
        if (!selectedHissaNo || !selectedSurnoc) {
            setError('Please select both Hissa Number and Surnoc.');
            setShowTable(false);
            return;
        }
        try {
            const result = await fetchRTCDetailsAPI({
                districtCode: selectedDistrict,
                talukCode: selectedTaluk,
                hobliCode: selectedHobli,
                villageCode: selectedVillage,
                landCode: landCode,
            });

            if (result.success) {
                setData(result.data);
                setShowTable(true);
                setError('');
            } else {
                setError('Error fetching data: ' + result.message);
                setShowTable(false);
            }
        } catch (err) {
            console.error('API Error:', err);
            setError('Error: ' + err.message);
            setShowTable(false);
        }

    };
    //final RTC details table
    const tableRTCRef = useRef(null);
    const handleViewRTC = (item) => {
        const exists = rtcAddedData.some(
            (data) =>
                data.survey_no === item.survey_no &&
                data.surnoc === item.surnoc &&
                data.hissa_no === item.hissa_no &&
                data.owner === item.owner &&
                data.father === item.father
        );

        if (exists) {
            Swal.fire("Duplicate!", "This record already exists in the table.", "warning");
        } else {
            const selectedDistrictObj = districts.find(
                d => String(d.districT_CODE) === String(selectedDistrict)
            ) || {};

            const districtName = selectedDistrictObj.districT_NAME || '';
            const districtCode = selectedDistrictObj.districT_CODE || '';

            const selectedTalukObj = taluks.find(
                t => String(t.talukA_CODE) === String(selectedTaluk)
            ) || {};

            const talukName = selectedTalukObj.displayName || '';
            const talukCode = selectedTalukObj.talukA_CODE || '';

            const selectedHobliObj = hoblis.find(
                h => String(h.hoblI_CODE) === String(selectedHobli)
            ) || {};

            const hobliName = selectedHobliObj.displayName || '';
            const hobliCode = selectedHobliObj.hoblI_CODE || '';

            const selectedVillageObj = villages.find(
                v => String(v.villagE_CODE) === String(selectedVillage)
            ) || {};

            const villageName = selectedVillageObj.displayName || '';
            const villageCode = selectedVillageObj.villagE_CODE || '';

            const itemWithLocation = {
                ...item,
                district: districtName,
                districtCode: districtCode,
                taluk: talukName,
                talukCode: talukCode,
                hobli: hobliName,
                hobliCode: hobliCode,
                village: villageName,
                villageCode: villageCode
            };

            setRtcAddedData((prev) => [...prev, itemWithLocation]);

            // ✅ Show success toast
            toast.success("Record Added!");


            // ✅ Scroll to the added table
            setTimeout(() => {
               tableRTCRef.current?.scrollIntoView({
  behavior: 'smooth',
  block: 'nearest',
});

            }, 300);
        }
    };


    //First block save API
    const handleSaveRTC = async () => {
        if (rtcAddedData.length === 0) {
            Swal.fire("No Data", "Please add at least one record before saving.", "warning");
            return;
        }

        console.log("RTC Data to be saved:", rtcAddedData);
        rtcAddedData.forEach(item => {
            console.log(item.district);
            console.log(item.districtCode);

        });

        // Correct state update to flatten array items
        setRtc_AddedData([...rtc_AddedData, ...rtcAddedData]);

        const payload = {
            lkrS_ID: 0,
            lkrS_LANDTYPE: "SurveyNo",
            lkrS_EPID: "9999999999",
            lkrS_SITEAREA_SQFT: 0,
            lkrS_SITEAREA_SQMT: 0,
            lkrS_REMARKS: "string",
            lkrS_ADDITIONALINFO: "string",
            lkrS_CREATEDBY: createdBy,
            lkrS_CREATEDNAME: createdName,
            lkrS_CREATEDROLE: roleID,
            khatA_DETAILS: null,
            khatA_OWNER_DETAILS: null,
            surveY_NUMBER_DETAILS: rtcAddedData.map(item => ({
                suR_ID: 0,
                suR_LKRS_ID: 0,
                suR_DISTRICT: item.districtCode,
                suR_TALUK: item.talukCode,
                suR_HOBLI: item.hobliCode,
                suR_VILLAGE: parseInt(item.villageCode),
                suR_SURVEYNO: item.survey_no,
                suR_SURNOC: item.surnoc,
                suR_HISSA: item.hissa_no,
                suR_LANDCODE: item.land_code,
                mainownerno: item.main_owner_no,
                ownerno: item.owner_no,
                suR_OWNERNAME: item.owner,
                suR_EXTACRE: item.ext_acre,
                suR_EXTGUNTA: item.ext_gunta,
                suR_EXTINSQFT: item.ext_in_sqft,
                suR_EXTINSQMT: item.ext_in_sqmt,
                suR_ISAADHAARSEEDED: 0,
                suR_REMARKS: "Remarks",
                suR_ADDITIONALINFO: "AdditionalInformation",
                suR_CREATEDBY: createdBy,
                suR_CREATEDNAME: createdName,
                suR_CREATEDROLE: roleID
            }))
        };

        console.log(payload);

        try {
            const response = await submitsurveyNoDetails(payload);

            if (response.responseStatus === true) {
                sessionStorage.setItem('LKRSID', response.lkrsid);
                Swal.fire({
                    title: response.responseMessage,
                    text: response.display_LKRSID,
                    icon: "success",
                    confirmButtonText: "OK",
                });
            } else {
                Swal.fire({
                    text: response.responseMessage || "Failed to save data",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        } catch (error) {
            console.error("Failed to insert data:", error);
            Swal.fire({
                text: "Something went wrong. Please try again later.",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    };

    const handleAddRTCRow = (apiDataRow) => {
        const selectedDistrictObj = districts.find(item => item.districT_CODE === selectedDistrict) || {};
        const districtName = selectedDistrictObj.districT_NAME || '';
        const districtCode = selectedDistrictObj.districT_CODE || 0;

        const selectedTalukObj = taluks.find(item => item.talukA_CODE === selectedTaluk) || {};
        const talukName = selectedTalukObj.talukA_NAME || '';
        const talukCode = selectedTalukObj.talukA_CODE || 0;

        const selectedHobliObj = hoblis.find(item => item.hoblI_CODE === selectedHobli) || {};
        const hobliName = selectedHobliObj.hoblI_NAME || '';
        const hobliCode = selectedHobliObj.hoblI_CODE || 0;

        const selectedVillageObj = villages.find(item => item.villagE_CODE === selectedVillage) || {};
        const villageName = selectedVillageObj.villagE_NAME || '';
        const villageCode = selectedVillageObj.villagE_CODE || 0;

        const newRow = {
            ...apiDataRow,
            district: districtName,
            districtcode: districtCode,
            taluk: talukName,
            talukCode: talukCode,
            hobli: hobliName,
            hobliCode: hobliCode,
            village: villageName,
            villageCode: villageCode
        };
        setRtcData((prevData) => [...prevData, newRow]);
    };
    //RTC Columns
    const rtc_columns = [
        {
            name: 'Action',
            cell: (row, index) => (
                <button className="btn btn-danger btn-sm" onClick={() => handleRemoveRTC(index)}>
                    <i className="fa fa-trash"></i>
                </button>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: '80px',
        },
        {
            name: 'S.No',
            cell: (row, index) => index + 1,

        },
        {
            name: 'District',
            selector: (row) => row.district,
            sortable: true,
            wrap: true,
            minWidth: '200px',
        },
        {
            name: 'Taluk',
            selector: (row) => row.taluk,
            sortable: true,
            wrap: true,
            minWidth: '200px',
        },
        {
            name: 'Hobli',
            selector: (row) => row.hobli,
            sortable: true,
            wrap: true,
            minWidth: '200px',
        },
        {
            name: 'Village',
            selector: (row) => row.village,
            sortable: true,
            wrap: true,
            minWidth: '200px',
        },
        {
            name: 'Owner Name',
            selector: row => row.owner,
            sortable: true,
            wrap: true,
            grow: 2,
            minWidth: '200px',
        },
        {
            name: 'Survey No/Surnoc/Hissa No',
            selector: row => `${row.survey_no}/${row.surnoc}/${row.hissa_no}`,
            sortable: true,
            wrap: true,
            grow: 2,
            minWidth: '200px',
        },
        {
            name: 'Extent (Acre.Gunta.Fgunta)',
            selector: row => `${row.ext_acre}.${row.ext_gunta}.${row.ext_fgunta}`,
            sortable: true,
            wrap: true,
            grow: 2,
            minWidth: '200px',
        },
        {
            name: 'SqFt',
            selector: row => {
                const acres = parseFloat(row.ext_acre) || 0;
                const gunta = parseFloat(row.ext_gunta) || 0;
                const fg = parseFloat(row.ext_fgunta) || 0;
                const sqft = (acres * 43560) + (gunta * 1089) + (fg * 68.0625);
                return sqft.toFixed(2);
            },
            sortable: true,
            wrap: true,
            grow: 2,
            minWidth: '200px',
        },
        {
            name: 'SqM',
            selector: row => {
                const acres = parseFloat(row.ext_acre) || 0;
                const gunta = parseFloat(row.ext_gunta) || 0;
                const fg = parseFloat(row.ext_fgunta) || 0;
                const sqft = (acres * 43560) + (gunta * 1089) + (fg * 68.0625);
                const sqm = sqft * 0.092903;
                return sqm.toFixed(2); // rounding to 2 decimal places
            },
            sortable: true,
            wrap: true,
            grow: 2,
            minWidth: '200px',
        },

    ];


    //Remove RTC details
    const handleRemoveRTC = (indexToRemove) => {
        setRtcAddedData(prev => prev.filter((_, index) => index !== indexToRemove));
    };


    const handleView = () => {
        Swal.fire({
            icon: 'info',
            title: 'Implementation in Progress',
            text: 'This feature is under development!',
            confirmButtonText: 'OK'
        });
    };

    const combinedData = [...rtcAddedData, ...rtcData];
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);


    let totalAcre = 0;
    let totalGunta = 0;
    let totalFGunta = 0;
    let totalSqFt = 0;
    let totalSqM = 0;

    combinedData.forEach(row => {
        const acre = parseFloat(row.ext_acre || 0);
        const gunta = parseFloat(row.ext_gunta || 0);
        const fgunta = parseFloat(row.ext_fgunta || 0);

        totalAcre += acre;
        totalGunta += gunta;
        totalFGunta += fgunta;

        const sqft = (acre * 43560) + (gunta * 1089) + (fgunta * 68.0625);
        totalSqFt += sqft;
        totalSqM += sqft * 0.092903;
    });

    // Normalize fgunta -> gunta and acre
    totalGunta += Math.floor(totalFGunta / 16);
    totalFGunta = totalFGunta % 16;

    totalAcre += Math.floor(totalGunta / 40);
    totalGunta = totalGunta % 40;

    const totalPages = Math.ceil(combinedData.length / rowsPerPage);

    const paginatedData = combinedData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handlePageSizeChange = (e) => {
        setRowsPerPage(Number(e.target.value));
        setCurrentPage(1); // Reset to first page when page size changes
    };

    return (
        <div className={`layout-form-container ${loading ? 'no-interaction' : ''}`}>
            {loading && <Loader />}
            <div className='row'>

                {/* District */}
                <div className="col-12 col-sm-12 col-md-6 col-lg-2 col-xl-2  mb-3">
                    <label className="form-label">District</label>
                    <select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)} // ✅ Add this

                        className="form-select"
                        disabled={isDistrictReadonly} // ✅ Freeze the dropdown
                    >
                        <option value="" disabled>{t('translation.dropdownValues.district')}</option>
                        {districts
                            .filter(item => item.districT_CODE === 20) // ✅ Only show Bengaluru
                            .map(item => (
                                <option key={item.districT_CODE} value={item.districT_CODE}>
                                    {item.displayName}
                                </option>
                            ))}
                    </select>
                </div>
                {/* Taluk Dropdown */}
                <div className="col-12 col-sm-12 col-md-6 col-lg-2 col-xl-2  mb-3">
                    <label className="form-label">Taluk</label>
                    <select value={selectedTaluk} onChange={handleTalukChange} className="form-select">
                        <option value="" disabled>{t('translation.dropdownValues.taluk')}</option>
                        {taluks.map((item) => (
                            <option key={item.talukA_CODE} value={item.talukA_CODE}>
                                {item.displayName}
                            </option>
                        ))}
                    </select>
                </div>
                {/* Hobli */}
                <div className="col-12 col-sm-12 col-md-6 col-lg-2 col-xl-2  mb-3">
                    <label className="form-label">Hobli</label>
                    <select value={selectedHobli} onChange={handleHobliChange} className="form-select" disabled={!selectedTaluk}>
                        <option value="" disabled>{t('translation.dropdownValues.hobli')}</option>
                        {hoblis.map((item) => (
                            <option key={item.hoblI_CODE} value={item.hoblI_CODE}>
                                {item.displayName}
                            </option>
                        ))}
                    </select>
                </div>
                {/* Village */}
                <div className="col-12 col-sm-12 col-md-6 col-lg-2 col-xl-2  mb-3">
                    <label className="form-label">Village</label>
                    <select value={selectedVillage} onChange={handleVillageChange} className="form-select" disabled={!selectedHobli}>
                        <option value="" disabled>{t('translation.dropdownValues.village')}</option>
                        {villages.map((item) => (
                            <option key={item.villagE_CODE} value={item.villagE_CODE}>
                                {item.displayName}
                            </option>
                        ))}
                    </select>
                </div>
                {/* Survey Number */}
                <div className="col-12 col-sm-12 col-md-6 col-lg-2 col-xl-2  mb-3">
                    <label className="form-label">Survey Number</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Survey Number"
                        value={surveyNumber}
                        onChange={(e) => setSurveyNumber(e.target.value)}
                        disabled={!selectedVillage}
                    />
                </div>
                {/* Go button  */}
                <div className="col-12 col-sm-12 col-md-6 col-lg-2 col-xl-2  ">
                    <label>&nbsp;</label>
                    <button className='btn btn-primary btn-block' disabled={!selectedVillage || !surveyNumber} onClick={handleFetchHissa}>
                        Go
                    </button>
                </div>
                {/* Surnoc */}
                <div className="col-12 col-sm-12 col-md-6 col-lg-3 col-xl-3 mb-3">
                    <label className="form-label">Surnoc</label>
                    <select
                        className="form-select"
                        value={selectedSurnoc}
                        onChange={(e) => {
                            setSelectedSurnoc(e.target.value);
                            setHissaEnabled(true); // Enable Hissa dropdown
                        }}
                        disabled={!surnocEnabled}
                    >
                        <option value="" disabled>Select Surnoc</option>
                        {surnocOptions.length > 0
                            ? surnocOptions.map((option, index) => (
                                <option key={index} value={option}>{option}</option>
                            ))
                            : <option disabled>{t('translation.dropdownValues.surnoc')}</option>}
                    </select>


                </div>
                {/* Hissa No */}
                <div className="col-12 col-sm-12 col-md-6 col-lg-3 col-xl-3 mb-3">
                    <label className="form-label">Hissa No</label>
                    <select
                        className="form-select"
                        value={selectedHissaNo}
                        onChange={(e) => setSelectedHissaNo(e.target.value)}
                        disabled={!hissaEnabled}
                    >
                        <option value="" disabled>Select Hissa No</option>
                        {hissaOptions.length > 0
                            ? hissaOptions.map((option, index) => (
                                <option key={index} value={option}>{option}</option>
                            ))
                            : <option disabled>{t('translation.dropdownValues.hissaNo')}</option>}
                    </select>


                </div>
                {/* Fetch button  */}
                <div className="col-12 col-sm-12 col-md-6 col-lg-2 col-xl-2  mb-3">
                    <label>&nbsp;</label>
                    <button className='btn btn-primary btn-block' onClick={fetchRTCDetails}>Fetch</button>
                </div>
                {/* View RTC button */}
                <div className='col-md-2 mb-3'>
                    <label>&nbsp;</label>
                    {showTable && (
                        <button className='btn btn-primary btn-block' onClick={handleViewRTC}>View RTC</button>
                    )}
                </div>

                {/* RTC Land Details Table */}
                {showTable && (
                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12" style={{ display: 'block' }}>
                        <hr />
                        <h4>RTC Land Details</h4>
                        <div className="table-responsive">
                            <table className="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <th>Survey No/Surnoc/Hissa No</th>
                                        <th>Owner</th>
                                        <th>Father</th>
                                        <th>Extent (Acre)</th>
                                        <th>Extent (Gunta)</th>
                                        <th>Extent (Fgunta)</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.length === 0 ? (
                                        <tr><td colSpan="7">No data available</td></tr>
                                    ) : (
                                        data.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.survey_no}/{item.surnoc}/{item.hissa_no}</td>
                                                <td>{item.owner}</td>
                                                <td>{item.father}</td>
                                                <td>{item.ext_acre}</td>
                                                <td>{item.ext_gunta}</td>
                                                <td>{item.ext_fgunta}</td>
                                                <td>
                                                    <button className='btn btn-primary btn-sm' onClick={() => handleViewRTC(item)}>Add</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <hr />
                {/* Added RTC Table */}
                {combinedData.length > 0 && (
                    <div className="col-12 mt-4" ref={tableRTCRef}>
                        <div className="card shadow-sm p-3 rounded">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="text-primary m-0">📄 Added RTC Details</h5>
                                <div className="d-flex align-items-center">
                                    <label className="me-2 mb-0">Rows per page:</label>
                                    <select
                                        className="form-select form-select-sm w-auto"
                                        value={rowsPerPage}
                                        onChange={handlePageSizeChange}
                                    >
                                        {[5, 10, 15, 20, 25, 30].map((size) => (
                                            <option key={size} value={size}>{size}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="table-responsive custom-scroll-table">
                                <table className="table table-striped table-hover table-bordered rounded-table">
                                    <thead className="table-primary sticky-header">
                                        <tr>
                                            <th>Action</th>
                                            <th>S.No</th>
                                            <th>District</th>
                                            <th>Taluk</th>
                                            <th>Hobli</th>
                                            <th>Village</th>
                                            <th>Owner Name</th>
                                            <th>Survey No / Surnoc / Hissa No</th>
                                            <th>Extent (Acre.Gunta.Fgunta)</th>
                                            <th>SqFt</th>
                                            <th>SqM</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedData.map((row, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveRTC(index + (currentPage - 1) * rowsPerPage)}>
                                                        <i className="fa fa-trash" />
                                                    </button>
                                                </td>
                                                <td>{index + 1 + (currentPage - 1) * rowsPerPage}</td>
                                                <td>{row.district}</td>
                                                <td>{row.taluk}</td>
                                                <td>{row.hobli}</td>
                                                <td>{row.village}</td>
                                                <td>{row.owner}</td>
                                                <td>{`${row.survey_no}/${row.surnoc}/${row.hissa_no}`}</td>
                                                <td>{`${row.ext_acre}.${row.ext_gunta}.${row.ext_fgunta}`}</td>
                                                <td>
                                                    {(
                                                        (parseFloat(row.ext_acre) * 43560) +
                                                        (parseFloat(row.ext_gunta) * 1089) +
                                                        (parseFloat(row.ext_fgunta) * 68.0625)
                                                    ).toFixed(2)}
                                                </td>
                                                <td>
                                                    {(
                                                        (
                                                            (parseFloat(row.ext_acre) * 43560) +
                                                            (parseFloat(row.ext_gunta) * 1089) +
                                                            (parseFloat(row.ext_fgunta) * 68.0625)
                                                        ) * 0.092903
                                                    ).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot >
                                        <tr>
                                            <th colSpan={6}></th>
                                            <th colSpan={2} className="text-end fw-bold">Total Area:</th>
                                            <th className="text-left fw-bold" >{`${totalAcre}.${totalGunta}.${totalFGunta}`}</th>
                                            <th className='fw-bold'>{totalSqFt.toFixed(2)}</th>
                                            <th className='fw-bold'>{totalSqM.toFixed(2)}</th>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Pagination Summary and Controls */}
                            <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
                                <div>
                                    Showing {Math.min((currentPage - 1) * rowsPerPage + 1, combinedData.length)}–{Math.min(currentPage * rowsPerPage, combinedData.length)} of {combinedData.length} records
                                </div>

                                <div>
                                    <button
                                        className="btn btn-outline-secondary btn-sm mx-1"
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </button>
                                    {[...Array(totalPages).keys()].map((num) => (
                                        <button
                                            key={num}
                                            className={`btn btn-sm mx-1 ${currentPage === num + 1 ? 'btn-primary' : 'btn-outline-primary'}`}
                                            onClick={() => goToPage(num + 1)}
                                        >
                                            {num + 1}
                                        </button>
                                    ))}
                                    <button
                                        className="btn btn-outline-secondary btn-sm mx-1"
                                        onClick={() => goToPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>

                            <div className="row mt-4">
                                <div className="col-md-10" />
                                <div className="col-md-2">
                                    <button className="btn btn-primary w-100" onClick={handleSaveRTC}>Save</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>

    );
};
//BBMP khata section
const BBMPKhata = () => {
    const { loading, start_loader, stop_loader } = useLoader(); // Use loader context
    const [epidNumber, setEpidNumber] = useState("");

    const epidNoRef = useRef(null);

    const [epidshowTable, setEPIDShowTable] = useState(false);
    const [epid_fetchedData, setEPID_FetchedData] = useState(null);


    const [phoneNumbers, setPhoneNumbers] = useState({});
    const [phoneErrors, setPhoneErrors] = useState({});
    const [otpSentIndex, setOtpSentIndex] = useState(null);

    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [timer, setTimer] = useState(120);
    const [resendEnabled, setResendEnabled] = useState(false);

    const [otpInputs, setOtpInputs] = useState({});
    const [verifiedNumbers, setVerifiedNumbers] = React.useState({});

    const fetchedEPIDData = Array.isArray(epid_fetchedData)
        ? epid_fetchedData
        : [epid_fetchedData];

    useEffect(() => {
        let interval = null;
        if (otpSent && timer > 0) {
            interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        } else if (timer <= 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [otpSent, timer]);

    const handlePhoneNumberChange = (e, index) => {
        const value = e.target.value;
        const updatedPhoneNumbers = { ...phoneNumbers };

        if (/^\d{0,10}$/.test(value)) {
            updatedPhoneNumbers[index] = value;
            setPhoneNumbers(updatedPhoneNumbers);

            const updatedErrors = { ...phoneErrors, [index]: '' };
            setPhoneErrors(updatedErrors);
        } else {
            const updatedErrors = { ...phoneErrors, [index]: 'Enter a valid 10-digit number' };
            setPhoneErrors(updatedErrors);
        }
    };

    const handleSendOtp = async (index, row) => {
        const phoneNumber =
            phoneNumbers[index] ??
            row.MobileNumber ??
            epid_fetchedData?.OwnerDetails?.[0]?.mobileNumber ??
            "";

        const phoneRegex = /^[1-9][0-9]{9}$/;

        if (!phoneRegex.test(phoneNumber)) {
            const updatedErrors = {
                ...phoneErrors,
                [index]: "Please enter a valid 10-digit phone number that does not start with zero",
            };
            setPhoneErrors(updatedErrors);
            return;
        }



        const phoneNo = "9999999999";
        // ✅ Call the API with the phone number
        try {
            const response = await sendOtpAPI(phoneNo);

            if (response.responseStatus === true) {
                Swal.fire({
                    text: response.responseMessage,
                    icon: "success",
                    timer: 2000,
                    confirmButtonText: "OK",
                })
                setPhoneErrors({ ...phoneErrors, [index]: "" });
                setOtpSentIndex(index);
                setOtpSent(true);
                setTimer(30);
                setResendEnabled(false);

            } else {

            }

        } catch (error) {
            console.error("Failed to send OTP:", error);
            // Optional: Handle error in UI
        }
    };
    const handleOtpChange = (e, index) => {
        setOtpInputs({ ...otpInputs, [index]: e.target.value });
    };
    const handleVerifyOtp = async (index, row) => {
        const mobileNumber =
            phoneNumbers[index] ??
            row.MobileNumber ??
            epid_fetchedData?.OwnerDetails?.[0]?.mobileNumber ??
            "";

        const otp = otpInputs[index];

        if (!otp || otp.length !== 6) {
            setPhoneErrors((prev) => ({ ...prev, [index]: "Enter a valid 6-digit OTP" }));
            return;
        }

        // Use real mobileNumber and otp here, currently hardcoded for demo
        const phoneno = "9999999999";
        const otp1 = "999999";

        try {
            const response = await verifyOtpAPI(phoneno, otp);
            console.log(response);

            if (response.responseStatus === true) {
                setVerifiedNumbers((prev) => ({ ...prev, [index]: true }));
                toast.success("OTP verified successfully!")
                setPhoneErrors((prev) => ({ ...prev, [index]: "" }));
                setOtpSentIndex(null);
                setTimer(0);
            } else {
                setPhoneErrors((prev) => ({
                    ...prev,
                    [index]: response.responseMessage || "OTP verification failed",
                }));
            }
        } catch (error) {
            console.error("Failed to verify OTP:", error);
            setPhoneErrors((prev) => ({ ...prev, [index]: "Error verifying OTP" }));
        }
    };

    useEffect(() => {
        if (epid_fetchedData?.OwnerDetails?.[0]?.mobileNumber) {
            setPhoneNumbers((prev = []) => {
                const updated = Array.isArray(prev) ? [...prev] : [];
                updated[0] = epid_fetchedData.OwnerDetails[0].mobileNumber;
                return updated;
            });
        }


    }, [epid_fetchedData]);

    const [createdBy, setCreatedBy] = useState(null);
    const [createdName, setCreatedName] = useState('');
    const [roleID, setRoleID] = useState('');

    useEffect(() => {
        const storedCreatedBy = sessionStorage.getItem('createdBy');
        const storedCreatedName = sessionStorage.getItem('createdName');
        const storedRoleID = sessionStorage.getItem('RoleID');

        setCreatedBy(storedCreatedBy);
        setCreatedName(storedCreatedName);
        setRoleID(storedRoleID);
    }, []);

    const handleResendOtp = async (index, row) => {
        // Reset OTP input & timer as before
        setOtp("");
        setTimer(30);
        setResendEnabled(false);

        // Determine the phone number to resend OTP to (same logic as handleSendOtp)
        const phoneNumber =
            phoneNumbers[index] ??
            row.MobileNumber ??
            epid_fetchedData?.OwnerDetails?.[0]?.mobileNumber ??
            "";

        const phoneRegex = /^[1-9][0-9]{9}$/;

        if (!phoneRegex.test(phoneNumber)) {
            const updatedErrors = {
                ...phoneErrors,
                [index]: "Please enter a valid 10-digit phone number that does not start with zero",
            };
            setPhoneErrors(updatedErrors);
            return;
        }
        const phoneNo = "9999999999";
        try {
            // Call the resend OTP API here (you can use the same sendOtpAPI if it supports resending)
            const response = await sendOtpAPI(phoneNo);

            if (response.responseStatus === true) {
                Swal.fire({
                    text: "OTP resent successfully!",
                    icon: "success",
                    timer: 2000,
                    confirmButtonText: "OK",
                });
                setPhoneErrors({ ...phoneErrors, [index]: "" });
                setOtpSentIndex(index);
                setOtpSent(true);
            } else {
                // Handle failure case (optional)
                Swal.fire({
                    text: response.responseMessage || "Failed to resend OTP",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        } catch (error) {
            console.error("Failed to resend OTP:", error);
            Swal.fire({
                text: "Error resending OTP. Please try again later.",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    };

    const [ownerTableData, setOwnerTableData] = useState([]);

    const handleFetchDetails = async () => {
        start_loader();

        if (!epidNumber.trim()) {
            stop_loader();
            Swal.fire("Error", "Please enter EPID Number!", "error");
            return;
        }

        const epidRegex = /^[1-9][0-9]{9}$/;
        if (!epidRegex.test(epidNumber)) {
            stop_loader();
            Swal.fire("Error", "Please enter a valid 10-digit EPID Number that does not start with 0!", "error");
            return;
        }

        try {
            sessionStorage.setItem('isTokenRequired', false);
            const fetchedData = await handleFetchEPIDDetails(epidNumber);
            console.log("Fetched Data:", fetchedData);
            sessionStorage.setItem("epid_JSON", JSON.stringify(fetchedData));
            if (fetchedData) {
                const {
                    propertyID,
                    propertyCategory,
                    propertyClassification,
                    wardNumber,
                    wardName,
                    streetName,
                    streetcode,
                    sasApplicationNumber,
                    isMuation,
                    kaveriRegistrationNumber,
                    assessmentNumber,
                    courtStay,
                    enquiryDispute,
                    checkBandi,
                    siteDetails,
                    ownerDetails,
                } = fetchedData;

                // ✅ Safely access and log the first owner's name
                if (Array.isArray(ownerDetails) && ownerDetails.length > 0) {
                    console.log("Owner Name:", ownerDetails[0].ownerName);
                } else {
                    console.warn("Owner details array is empty or invalid");
                }
                setOwnerTableData([]); // clear table data first
                setEPID_FetchedData({
                    PropertyID: propertyID,
                    PropertyCategory: propertyCategory,
                    PropertyClassification: propertyClassification,
                    WardNumber: wardNumber,
                    WardName: wardName,
                    StreetName: streetName,
                    Streetcode: streetcode,
                    SASApplicationNumber: sasApplicationNumber,
                    IsMuation: isMuation,
                    KaveriRegistrationNumber: kaveriRegistrationNumber,
                    AssessmentNumber: assessmentNumber,
                    courtStay,
                    enquiryDispute,
                    CheckBandi: checkBandi,
                    SiteDetails: siteDetails,
                    OwnerDetails: ownerDetails,
                });

                setOwnerTableData(ownerDetails);
                Swal.fire({
                    title: "Success",
                    text: "EPID Details fetched successfully!",
                    icon: "success",
                    confirmButtonText: "OK",
                }).then(() => {
                    setEpidNumber("");
                    setEPIDShowTable(true);
                });
            } else {
                Swal.fire({
                    title: "Error",
                    text: "EPID is invalid. Please provide a correct EPID",
                    icon: "error",
                    confirmButtonText: "OK",
                    allowOutsideClick: false,    // Prevent clicking outside to close
                    allowEscapeKey: false,       // Prevent pressing ESC to close
                }).then((result) => {
                    if (result.isConfirmed) {
                        // User clicked OK
                        setEpidNumber("");
                        setEPIDShowTable(false);
                    }
                });
            }
        } catch (error) {
            console.error("Error fetching EPID details:", error);
            Swal.fire({
                title: "Error",
                text: "Failed to fetch EPID Details.",
                icon: "error",
                confirmButtonText: "OK",
            });
        } finally {
            stop_loader();
        }

    };

    const customStyles = {
        headCells: {
            style: {
                fontWeight: 'bold',
                fontSize: '14px',
            },
        },
        cells: {
            style: {
                fontSize: '16px', // table data font size
            },
        },
    };
    const columns = [
        { name: 'S.No', selector: (row, index) => index + 1, width: '70px', center: true },
        { name: 'Property ID', width: '140px', selector: () => epid_fetchedData?.PropertyID, center: true },
        {
            name: 'Owner Name', center: true,

            cell: () => (
                <div style={{

                }}>
                    {epid_fetchedData?.OwnerDetails?.[0].ownerName || 'N/A'}
                </div>
            )
        },

        { name: 'ID Type', width: '120px', selector: () => epid_fetchedData?.OwnerDetails?.[0].idType || 'N/A', center: true },
        { name: 'ID Number', width: '220px', selector: () => epid_fetchedData?.OwnerDetails?.[0].idNumber || 'N/A', center: true },
        {
            name: 'Validate OTP',
            width: '250px',
            cell: (row, index) => (
                <div className='mb-3'><br />
                    <input
                        type="tel"
                        className="form-control mb-1"
                        placeholder="Mobile Number"
                        readOnly
                        value={
                            phoneNumbers[index] ??
                            row.MobileNumber ??
                            epid_fetchedData?.OwnerDetails?.[0]?.mobileNumber ??
                            ""
                        }
                        onChange={(e) => handlePhoneNumberChange(e, index)}
                        maxLength={10}
                        disabled={otpSentIndex === index}
                    />
                    {phoneErrors[index] && (
                        <label className="text-danger">{phoneErrors[index]}</label>
                    )}

                    {/* Show "PHONE NUMBER VERIFIED" if this index is verified */}
                    {verifiedNumbers[index] ? (
                        <div className="text-success font-weight-bold mt-2">
                            OTP Verified <i className="fa fa-check-circle"></i>
                        </div>
                    ) : (
                        // Else show OTP input, verify button, and timer or resend button
                        otpSentIndex !== index ? (
                            <button
                                className="btn btn-primary btn-sm mt-1"
                                onClick={() => handleSendOtp(index, row)}
                            >
                                Send OTP
                            </button>
                        ) : (
                            <>
                                <div className="mb-1">
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter OTP"
                                            value={otpInputs[index] || ""}
                                            onChange={(e) => handleOtpChange(e, index)}
                                            maxLength={6}
                                        />
                                    </div>
                                    <button
                                        className="btn btn-success btn-sm mt-2"
                                        disabled={timer <= 0}
                                        onClick={() => handleVerifyOtp(index, row)}
                                    >
                                        Verify OTP
                                    </button>
                                </div>
                                {timer > 0 ? (
                                    <p className="text-danger mb-0">Resend OTP in: {timer}s</p>
                                ) : (
                                    <button
                                        className="btn btn-warning btn-sm"
                                        onClick={() => handleResendOtp(index, row)}
                                    >
                                        Resend OTP
                                    </button>
                                )}
                            </>
                        )
                    )}
                </div>
            ), center: true
        }




    ];

    //EPID Save and proceed next button
    //   const handleSaveAndProceed = async (epidNumber) => {
    //     const totalRows = fetchedEPIDData?.[0]?.OwnerDetails?.length;

    //     if (totalRows > 0) {
    //         for (let i = 0; i < totalRows; i++) {
    //             if (!verifiedNumbers[i]) {
    //                 Swal.fire({
    //                     icon: 'error',
    //                     title: 'OTP Not Verified',
    //                     text: `Please verify OTP for record #${i + 1} before proceeding.`,
    //                 });
    //                 return;
    //             }
    //         }
    //     }

    //     console.log("All OTPs verified. Proceeding...");
    // const storedData = sessionStorage.getItem("epid_JSON");
    // let parsedData = "";
    // if (storedData) {
    //    parsedData = JSON.parse(storedData);
    //   console.log("Retrieved Fetched Data from session:", parsedData);

    // }
    //     // Prepare payload
    //     const payload = {
    //         lkrS_ID: 0,
    //         lkrS_LANDTYPE: "khata",
    //         lkrS_EPID: epid_fetchedData?.PropertyID,
    //         lkrS_SITEAREA_SQFT: 0,
    //         lkrS_SITEAREA_SQMT: 0,
    //         lkrS_REMARKS: "string",
    //         lkrS_ADDITIONALINFO: "string",
    //         lkrS_CREATEDBY: 0,
    //         lkrS_CREATEDNAME: "string",
    //         lkrS_CREATEDROLE: "string",
    //         khatA_DETAILS: {
    //             khatA_ID: 0,
    //             khatA_LKRS_ID: 0,
    //             khatA_EPID: epid_fetchedData?.PropertyID,
    //             khatA_JSON: parsedData,
    //             khatA_TYPE: "string",
    //             khatA_REMARKS: "string",
    //             khatA_ADDITIONALINFO: "string",
    //             khatA_CREATEDBY: 0,
    //             khatA_CREATEDNAME: "string",
    //             khatA_CREATEDROLE: "string"
    //         },
    //         khatA_OWNER_DETAILS: fetchedEPIDData?.[0]?.OwnerDetails.map(owner => ({
    //             owN_ID: 0,
    //             owN_LKRS_ID: 0,
    //             owN_NAME_KN: owner.owN_NAME_KN || "string",
    //             owN_NAME_EN: epid_fetchedData?.OwnerDetails?.[0].ownerName || "string",
    //             owN_IDTYPE: epid_fetchedData?.OwnerDetails?.[0].idType || "string",
    //             owN_IDNUMBER: epid_fetchedData?.OwnerDetails?.[0].idNumber ||  "string",
    //             owN_RELATIONTYPE: owner.owN_RELATIONTYPE || "string",
    //             owN_RELATIONNAME: owner.owN_RELATIONNAME || "string",
    //             owN_MOBILENUMBER:  epid_fetchedData?.OwnerDetails?.[0]?.mobileNumber || "string",
    //             owN_REMARKS: owner.owN_REMARKS || "string",
    //             owN_ADDITIONALINFO: owner.owN_ADDITIONALINFO || "string",
    //             owN_CREATEDBY: 0,
    //             owN_CREATEDNAME: "string",
    //             owN_CREATEDROLE: "string"
    //         })),
    //         surveY_NUMBER_DETAILS: null
    //     };
    // const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiYWRtaW4iLCJleHAiOjE3NDgyNjA3MTIsImlzcyI6IkxBWU9VVEtIQVRBQVBJSXNzdWVyIiwiYXVkIjoiTEFZT1VUS0hBVEFBUElBdWRpZW5jZSJ9.kBytfpwuMqLSOkueyLeMm9WYnJuUsF92IFmZoisTj_0";
    //     try {
    //         const response = await fetch('https://testapps.bbmpgov.in/LayoutKhataAPI/api/LKRS/fnInsertLKRSinfo', {
    //             method: 'POST',
    //             headers: {
    //                 'Accept': 'text/plain',
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${token}`
    //             },
    //             body: JSON.stringify(payload)
    //         });
    // console.log(payload);
    //         const result = await response.json();

    //         if (response.ok) {
    //             Swal.fire({
    //                 icon: 'success',
    //                 title: 'Success',
    //                 text: 'Data submitted successfully!',
    //             });
    //         } else {
    //             Swal.fire({
    //                 icon: 'error',
    //                 title: 'Error',
    //                 text: result?.message || 'Something went wrong.',
    //             });
    //         }
    //     } catch (error) {
    //         console.error("API Error:", error);
    //         Swal.fire({
    //             icon: 'error',
    //             title: 'Network Error',
    //             text: 'Failed to submit data. Please try again later.',
    //         });
    //     }
    // };

    const handleSaveAndProceed = async (epidNumber) => {
        const totalRows = fetchedEPIDData?.[0]?.OwnerDetails?.length;

        if (totalRows > 0) {
            for (let i = 0; i < totalRows; i++) {
                if (!verifiedNumbers[i]) {
                    Swal.fire({
                        icon: 'error',
                        title: 'OTP Not Verified',
                        text: `Please verify OTP for record #${i + 1} before proceeding.`,
                    });
                    return;
                }
            }
        }

        const storedData = sessionStorage.getItem("epid_JSON");
        let parsedData = storedData ? JSON.parse(storedData) : "";

        const payload = {
            lkrS_ID: 0,
            lkrS_LANDTYPE: "khata",
            lkrS_EPID: epid_fetchedData?.PropertyID,
            lkrS_SITEAREA_SQFT: 0,
            lkrS_SITEAREA_SQMT: 0,
            lkrS_REMARKS: "string",
            lkrS_ADDITIONALINFO: "string",
            lkrS_CREATEDBY: createdBy,
            lkrS_CREATEDNAME: createdName,
            lkrS_CREATEDROLE: roleID,
            khatA_DETAILS: {
                khatA_ID: 0,
                khatA_LKRS_ID: 0,
                khatA_EPID: epid_fetchedData?.PropertyID,
                khatA_JSON: storedData,
                khatA_TYPE: "string",
                khatA_REMARKS: "string",
                khatA_ADDITIONALINFO: "string",
                khatA_CREATEDBY: createdBy,
                khatA_CREATEDNAME: createdName,
                khatA_CREATEDROLE: roleID
            },
            khatA_OWNER_DETAILS: fetchedEPIDData?.[0]?.OwnerDetails.map(owner => ({
                owN_ID: 0,
                owN_LKRS_ID: 0,
                owN_NAME_KN: owner.owN_NAME_KN || "string",
                owN_NAME_EN: epid_fetchedData?.OwnerDetails?.[0].ownerName || "string",
                owN_IDTYPE: epid_fetchedData?.OwnerDetails?.[0].idType || "string",
                owN_IDNUMBER: epid_fetchedData?.OwnerDetails?.[0].idNumber || "string",
                owN_RELATIONTYPE: owner.owN_RELATIONTYPE || "string",
                owN_RELATIONNAME: owner.owN_RELATIONNAME || "string",
                owN_MOBILENUMBER: epid_fetchedData?.OwnerDetails?.[0]?.mobileNumber || "string",
                owN_REMARKS: owner.owN_REMARKS || "string",
                owN_ADDITIONALINFO: owner.owN_ADDITIONALINFO || "string",
                owN_CREATEDBY: createdBy,
                owN_CREATEDNAME: createdName,
                owN_CREATEDROLE: roleID
            })),
            surveY_NUMBER_DETAILS: null
        };

        try {
            const response = await submitEPIDDetails(payload);

            if (response.responseStatus === true) {
                sessionStorage.setItem('LKRSID', response.lkrsid);
                Swal.fire({
                    title: response.responseMessage,
                    text: response.display_LKRSID,
                    icon: "success",
                    confirmButtonText: "OK",
                });
            } else {

                Swal.fire({
                    text: response.responseMessage || "Failed to resend OTP",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        } catch (error) {
            console.error("Failed to insert a data:", error);
            Swal.fire({
                text: "Something went wrong. Please try again later.",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    };

    return (
        <div className="row g-3">
            {loading && <Loader />}

            <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4  mt-3">
                <div className="form-group mt-2">
                    <label className='form-label'>Enter EPID of eKhata of A-property <span className='mandatory_color'>*</span></label>
                    <input
                        type="text"
                        className="form-control"
                        value={epidNumber} ref={epidNoRef}
                        onChange={(e) => {
                            const onlyNums = e.target.value.replace(/\D/g, ""); // remove non-numeric chars
                            setEpidNumber(onlyNums);
                        }}
                        placeholder="Enter EPID of eKhata of A-property"
                        maxLength={10}
                    />

                </div>
            </div>
            <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4  mt-4">
                <div className="form-group mt-5">
                    <label></label>
                    <button className="btn btn-primary mt-2" onClick={handleFetchDetails}>
                        Fetch Details
                    </button>
                </div>
            </div>


            {/* Table Section */}
            {epidshowTable && epid_fetchedData && (
                <div>
                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 mt-3">
                        <h5>Property Owner details as per BBMP eKhata</h5>
                        <h6>Note: Plot-wise New Khata will be issued in owner's name. Hence, if owner has changed then first get Mutation done in eKhata.</h6>
                        {/* <h6>If there has been a change in ownership, the Mutation process in eKhata must be completed first, as the New Khata will be issued in the owner's name.</h6> */}
                        <DataTable
                            columns={columns}
                            data={epid_fetchedData?.OwnerDetails || []}
                            pagination
                            noHeader
                            dense={false}
                            customStyles={customStyles}
                        />

                    </div>

                    <div className='row'>
                        <div className="col-0 col-sm-0 col-md-6 col-lg-6 col-xl-6 "></div>
                        <div className="col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3 ">
                            <div className="form-group">
                                <label></label>
                                <button className='btn btn-primary btn-block'>View eKhata</button>
                            </div>
                        </div>
                        <div className="col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3">
                            <div className="form-group">
                                <label></label>
                                <button className='btn btn-primary btn-block' onClick={() => handleSaveAndProceed(epidNumber)}>Save and Proceed Next</button>
                            </div>
                        </div>
                    </div>

                </div>

            )}

        </div>
    );
};
//BDA secction
const BDA = ({ approval_details, setApprovalDetails, order_details, setOrderDetails }) => {
    const { t, i18n } = useTranslation();
    const [formData, setFormData] = useState({
        layoutApprovalNumber: "",
        approvalOrder: null,
        approvalMap: null,
        dateOfApproval: "",
        approvalAuthority: "",
    });
    const { loading, start_loader, stop_loader } = useLoader();
    const [errors, setErrors] = useState({});
    const [records, setRecords] = useState([]);
    const [editIndex, setEditIndex] = useState(null);
    const fileApprovalOrderInputRef = useRef(null);
    const fileApprovalMapInputRef = useRef(null);


    const [createdBy, setCreatedBy] = useState(null);
    const [createdName, setCreatedName] = useState('');
    const [roleID, setRoleID] = useState('');
    const [LKRSID, setLKRSID] = useState('');
    useEffect(() => {
        const storedCreatedBy = sessionStorage.getItem('createdBy');
        const storedCreatedName = sessionStorage.getItem('createdName');
        const storedRoleID = sessionStorage.getItem('RoleID');

        const LKRSID_session = sessionStorage.getItem('LKRSID');
        setLKRSID(LKRSID_session);
        setCreatedBy(storedCreatedBy);
        setCreatedName(storedCreatedName);
        setRoleID(storedRoleID);


    }, []);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: "" }); // Clear error on input
    };

    const handleFileApprovalMapChange = (e) => {
        if (!e || !e.target || !e.target.files) {
            console.error("Invalid event or no files found.");
            return;
        }
        const file = e.target.files[0];
        if (!file) {
            // User canceled file selection
            setFormData({ ...formData, approvalMap: null });
            setErrors({ ...errors, approvalMap: "No file selected." }); // Optional error
            return;
        }
        if (file.type !== "application/pdf") {
            setErrors({ ...errors, approvalMap: "Only PDF files are allowed." });
            return;
        }
        if (file.size > 50 * 1024 * 1024) {
            setErrors({ ...errors, approvalMap: "File size must be less than 50MB." });
            return;
        }
        setFormData({ ...formData, approvalMap: file });
        setErrors({ ...errors, approvalMap: "" }); // Clear previous errors
    };
    const handleFileApprovalOrderChange = (e) => {
        if (!e || !e.target || !e.target.files) {
            console.error("Invalid event or no files found.");
            return;
        }
        const file = e.target.files[0];
        if (!file) {
            // User clicked 'Choose File' but didn't pick any file (i.e., canceled the dialog)
            setFormData({ ...formData, approvalOrder: null });
            setErrors({ ...errors, approvalOrder: "No file selected." }); // Optional: show an error
            return;
        }
        if (file.type !== "application/pdf") {
            setErrors({ ...errors, approvalOrder: "Only PDF files are allowed." });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setErrors({ ...errors, approvalOrder: "File size must be less than 5MB." });
            return;
        }
        setFormData({ ...formData, approvalOrder: file });
        setErrors({ ...errors, approvalOrder: "" }); // Clear error on valid file
    };
    const validateForm = () => {
        let newErrors = {};
        if (!formData.layoutApprovalNumber.trim()) {
            newErrors.layoutApprovalNumber = "Layout Approval Number is required.";
        }
        if (!formData.approvalOrder) {
            newErrors.approvalOrder = "Please upload a valid PDF (max 5MB).";
        }
        if (!formData.approvalMap) {
            newErrors.approvalMap = "Please upload a valid PDF (max 50MB).";
        }
        if (!formData.dateOfApproval) {
            newErrors.dateOfApproval = "Date of approval is required.";
        } else if (new Date(formData.dateOfApproval) > new Date()) {
            newErrors.dateOfApproval = "Future dates are not allowed.";
        }
        if (!formData.approvalAuthority.trim()) {
            newErrors.approvalAuthority = "Approval authority designation is required.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    //Approval  Order Save button
    const handleSave = async () => {
        if (!validateForm()) return;
        const payload = {
            apR_ID: 0,
            apR_LKRS_ID: LKRSID,
            apR_APPROVAL_NO: formData.layoutApprovalNumber,
            apR_APPROVAL_DATE: new Date(formData.dateOfApproval).toISOString(),
            apR_REMARKS: "string",
            apR_ADDITIONALINFO: "string",
            apR_CREATEDBY: createdBy,
            apR_CREATEDNAME: createdName,
            apR_CREATEDROLE: roleID,
            apR_APPROVALDESIGNATION: formData.approvalAuthority,
        };

        try {
            const response = await insertApprovalInfo(payload);

            if (response.responseStatus === true) {
                Swal.fire({
                    title: response.responseMessage,
                    icon: "success",
                    confirmButtonText: "OK",
                }).then(async () => {
                    // Reset inputs and form
                    if (fileApprovalMapInputRef.current) fileApprovalMapInputRef.current.value = "";
                    if (fileApprovalOrderInputRef.current) fileApprovalOrderInputRef.current.value = "";

                    setFormData({
                        layoutApprovalNumber: "",
                        approvalOrder: null,
                        approvalMap: null,
                        dateOfApproval: "",
                        approvalAuthority: "",
                    });

                    setErrors({});
                    setEditIndex(null);

                    // Fetch list and update table
                    try {
                        const listPayload = {
                            level: 1,
                            aprLkrsId: 60,
                            aprId: 0,
                        };

                        const listResponse = await listApprovalInfo(listPayload);

                        if (Array.isArray(listResponse)) {
                            const formattedList = listResponse.map(item => {
                                // Try to match approval number with current formData if available
                                const isCurrent = item.apr_Approval_No === formData.layoutApprovalNumber;

                                return {
                                    layoutApprovalNumber: item.apr_Approval_No,
                                    dateOfApproval: item.apr_Approval_Date,
                                    approvalOrder: isCurrent ? formData.approvalOrder : null,
                                    approvalMap: isCurrent ? formData.approvalMap : null,
                                    approvalAuthority: item.apR_APPROVALDESIGNATION,
                                };
                            });

                            // Replace old records with fresh list from API
                            setRecords(formattedList);

                        }

                    } catch (error) {
                        console.error("Error fetching approval list:", error);
                    }
                });
            }

            else {
                Swal.fire({
                    title: response.responseMessage,
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        } catch (error) {
            console.error("Error saving approval info:", error);
        }
    };



    const handleEdit = (index) => {
        setEditIndex(index);
        const selectedRecord = records[index];

        setFormData({
            layoutApprovalNumber: selectedRecord.layoutApprovalNumber,
            approvalOrder: selectedRecord.approvalOrder,
            approvalMap: selectedRecord.approvalMap, // Keep file reference
            dateOfApproval: selectedRecord.dateOfApproval,
            approvalAuthority: selectedRecord.approvalAuthority,
        });
    };

    const handleDelete = (index) => {
        setRecords(records.filter((_, i) => i !== index));
    };
    const columns = [
        {
            name: t('translation.BDA.table.slno'),
            cell: (row, index) => index + 1,
            width: '80px',
        },
        {
            name: t('translation.BDA.table.approvalNo'),
            selector: row => row.layoutApprovalNumber,
            sortable: true,
        },
        {
            name: t('translation.BDA.table.dateOfApproval'),
            selector: row => {
                const date = new Date(row.dateOfApproval);

                // Ensure the date is valid
                if (isNaN(date)) {
                    return '';  // Handle invalid date by returning an empty string or a placeholder
                }

                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
                const year = date.getFullYear();

                return `${day}-${month}-${year}`;
            },
            sortable: true,
        },
        {
            name: t('translation.BDA.table.approvalOrder'),
            cell: row =>
                row.approvalOrder ? (
                    <a
                        href={URL.createObjectURL(row.approvalOrder)}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {row.approvalOrder.name}
                    </a>
                ) : (
                    'No file'
                ),
        },
        {
            name: t('translation.BDA.table.approvalMap'),
            cell: row =>
                row.approvalMap ? (
                    <a
                        href={URL.createObjectURL(row.approvalMap)}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {row.approvalMap.name}
                    </a>
                ) : (
                    'No file'
                ),
        },
        {
            name: t('translation.BDA.table.approvalAuthority'),
            selector: row => row.approvalAuthority,
            sortable: true,
        },
        {
            name: t('translation.BDA.table.action'),
            cell: (row, index) => (
                <div>
                    <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => handleEdit(index)} disabled={!isEditing}
                    >
                        <i className="fa fa-pencil"></i>
                    </button>
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(index)} disabled={!isEditing}
                    >
                        <i className="fa fa-trash"></i>
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];
    const customStyles = {
        headCells: {
            style: {
                backgroundColor: '#f0f0f0', // Light grey background
                color: '#333',              // Dark grey text
                fontWeight: 'bold',         // Bold text
            },
        },
    };
    const [isEditing, setIsEditing] = useState(true); // Controls edit mode
    const [savedRecords, setSavedRecords] = useState([]); // Stores saved records


    const handleSaveAndProceed = () => {
        if (records.length === 0) {
            Swal.fire("Error", "No records available to save!", "error");
            return;
        }

        // Update the selected record in the list
        const updatedRecords = records.map((record, index) => {
            if (index === editIndex) {
                return {
                    ...record,
                    layoutApprovalNumber: formData.layoutApprovalNumber,
                    approvalOrder: formData.approvalOrder,  // Updated file
                    approvalMap: formData.approvalMap,      // Updated file
                    dateOfApproval: formData.dateOfApproval,
                    approvalAuthority: formData.approvalAuthority,
                };
            }
            return record;
        });

        setRecords(updatedRecords); // Save the updated records
        setIsEditing(false); // Disable editing mode
        setApprovalDetails([...approval_details, records]);
        Swal.fire("Success!", "Data saved successfully!", "success");
    };

    const handleAddMore_again = () => {
        setIsEditing(true); // Enable editing mode
    };


    //Order of site Release
    const [release_formData, setRelease_FormData] = useState({
        layoutOrderNumber: "",
        release_Order: null,
        dateOfOrder: "",
        orderAuthority: "",
        releaseType: ''
    });
    const [release_errors, setRelease_Errors] = useState({});
    const [order_records, setOrder_Records] = useState([]);
    const [edit_OrderIndex, setEdit_OrderIndex] = useState(null);
    const fileReleaseOrderInputRef = useRef(null);
    const [isOrder_Editing, setIsOrder_Editing] = useState(true);
    const [savedOrder_Records, setSavedOrder_Records] = useState([]);

    const order_columns = [
        {
            name: t('translation.BDA.table1.slno'),
            cell: (row, index) => index + 1, // Adding 1 to start serial numbers from 1
            width: '80px', // Adjust width as needed
        },
        {
            name: t('translation.BDA.table1.siteOrderNo'),
            selector: row => row.layoutOrderNumber,
            sortable: true,
        },
        {
            name: t('translation.BDA.table1.dateOforder'),
            selector: row => {
                const date = new Date(row.dateOfOrder);

                // Ensure the date is valid
                if (isNaN(date)) {
                    return '';  // Handle invalid date by returning an empty string or a placeholder
                }

                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
                const year = date.getFullYear();

                return `${day}-${month}-${year}`;
            },
            sortable: true,
        },
        {
            name: t('translation.BDA.table1.siteOrder'),
            cell: row =>
                row.release_Order ? (
                    <a
                        href={URL.createObjectURL(row.release_Order)}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {row.release_Order.name}
                    </a>
                ) : (
                    'No file'
                ),
        },


        {
            name: t('translation.BDA.table1.approvalAuthority'),
            selector: row => row.orderAuthority,
            sortable: true,
        },
        {
            name: t('translation.BDA.table1.action'),
            cell: (row, index) => (
                <div>
                    <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => handleOrderEdit(index)} disabled={!isOrder_Editing}
                    >
                        <i className="fa fa-pencil"></i>
                    </button>
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleOrderDelete(index)} disabled={!isOrder_Editing}
                    >
                        <i className="fa fa-trash"></i>
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];
    const handleOrderEdit = (index) => {
        setEdit_OrderIndex(index);
        const selectedRecord = order_records[index];

        setRelease_FormData({
            layoutOrderNumber: selectedRecord.layoutOrderNumber,
            release_Order: selectedRecord.release_Order,
            dateOfOrder: selectedRecord.dateOfOrder,
            orderAuthority: selectedRecord.orderAuthority,
        });
    };
    const handleOrderDelete = (index) => {
        setOrder_Records(order_records.filter((_, i) => i !== index));
    };
    const handleOrderChange = (e) => {
        const { name, value } = e.target;
        setRelease_FormData({ ...release_formData, [name]: value });
        setRelease_Errors({ ...release_errors, [name]: "" }); // Clear error on input
    };
    const handleFilereleaseOrderChange = (e) => {
        if (!e || !e.target || !e.target.files) {
            console.error("Invalid event or no files found.");
            return;
        }

        const file = e.target.files[0];

        if (!file) {
            // User canceled file selection — clear old file and optionally show an error
            setRelease_FormData({ ...release_formData, release_Order: null });
            setRelease_Errors({ ...release_errors, release_Order: "No file selected." }); // Optional
            return;
        }

        if (file.type !== "application/pdf") {
            setRelease_Errors({ ...release_errors, release_Order: "Only PDF files are allowed." });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setRelease_Errors({ ...release_errors, release_Order: "File size must be less than 5MB." });
            return;
        }

        setRelease_FormData({ ...release_formData, release_Order: file });
        setRelease_Errors({ ...release_errors, release_Order: "" }); // Clear previous error
    };
    const validateOrderForm = () => {
        let newErrors = {};

        if (!release_formData.layoutOrderNumber.trim()) {
            newErrors.layoutOrderNumber = "Layout Order of site release Number is required.";
        }

        if (!release_formData.release_Order) {
            newErrors.release_Order = "Please upload a valid PDF (max 5MB).";
        }

        if (!release_formData.dateOfOrder) {
            newErrors.dateOfOrder = "Date of approval is required.";
        } else if (new Date(release_formData.dateOfOrder) > new Date()) {
            newErrors.dateOfOrder = "Future dates are not allowed.";
        }

        if (!release_formData.orderAuthority.trim()) {
            newErrors.orderAuthority = "Approval authority designation is required.";
        }

        if (!release_formData.releaseType) {
            newErrors.releaseType = "Please select a Release Type.";
        }

        setRelease_Errors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleOrderSave = async () => {

     


        if (!validateOrderForm()) return;
        const payload = {
            sitE_RELS_ID: 0,
            sitE_RELS_LKRS_ID: 60,
            sitE_RELS_ORDER_NO: release_formData.layoutOrderNumber,
            sitE_RELS_DATE: release_formData.dateOfOrder,
            sitE_RELS_REMARKS: "string",
            sitE_RELS_ADDITIONALINFO: "string",
            sitE_RELS_CREATEDBY: createdBy,
            sitE_RELS_CREATEDNAME: createdName,
            sitE_RELS_CREATEDROLE: roleID,
            sitE_RELS_APPROVALDESIGNATION: release_formData.orderAuthority,
        };

        try {
            const response = await insertReleaseInfo(payload);

            if (response.responseStatus === true) {
                Swal.fire({
                    title: response.responseMessage,
                    icon: "success",
                    confirmButtonText: "OK",
                }).then(async () => {
                    // Reset inputs and form
                    if (fileReleaseOrderInputRef.current) {
                        fileReleaseOrderInputRef.current.value = "";
                    }
                    // Reset form
                    setRelease_FormData({
                        layoutOrderNumber: "",
                        release_Order: null,
                        dateOfOrder: "",
                        orderAuthority: "",
                    });
                    setRelease_Errors({});

                    // Fetch list and update table
                    try {
                        const listPayload = {
                            level: 1,
                            lkrsId: 60,
                            siteRelsId: 0,
                        };

                        const listResponse = await listReleaseInfo(listPayload);

                        if (Array.isArray(listResponse)) {
                            const formattedList = listResponse.map(item => {
                                // Try to match approval number with current formData if available
                                const isCurrent = item.apr_Approval_No === release_formData.layoutApprovalNumber;

                                return {
                                    layoutApprovalNumber: item.apr_Approval_No,
                                    dateOfApproval: item.apr_Approval_Date,
                                    approvalOrder: isCurrent ? release_formData.approvalOrder : null,
                                    approvalMap: isCurrent ? release_formData.approvalMap : null,
                                    approvalAuthority: item.apR_APPROVALDESIGNATION,
                                };
                            });

                            // Replace old records with fresh list from API
                            setOrder_Records(formattedList);

                        }

                    } catch (error) {
                        console.error("Error fetching approval list:", error);
                    }
                });
            }

            else {
                Swal.fire({
                    title: response.responseMessage,
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        } catch (error) {
            console.error("Error saving approval info:", error);
        }

    };
    const handleAddMoreRelease_again = () => {
        setIsOrder_Editing(true); // Enable editing mode
    };
    const handleOrderSaveAndProceed = () => {

        if (order_records.length === 0) {
            Swal.fire("Error", "No records available to save!", "error");
            return;
        }

        setSavedOrder_Records(order_records); // Store the saved records
        setIsOrder_Editing(false); // Disable editing mode
        console.log("List of Records:", order_records);
        setOrderDetails([...order_details, order_records]);
        Swal.fire("Success!", "Data saved successfully!", "success");

    };

    return (
        <div className={`layout-form-container ${loading ? 'no-interaction' : ''}`}>
            {loading && <Loader />}
            <div className="card">
                <div className="card-header layout_btn_color" >
                    <h5 className="card-title" style={{ textAlign: 'center' }}>{t('translation.BDA.heading')}</h5>
                </div>
                <div className="card-body">
                    <h6 className='fw-normal fs-5 ' style={{ color: '#0077b6' }}>{t('translation.BDA.Subdivision.heading')}</h6>
                    <hr className='mt-1' style={{ border: '1px dashed #0077b6' }} />
                    <div className="mt-5">
                        <div className="row">
                            {/* Layout Approval Number */}
                            <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                <div className="form-group">
                                    <label className="form-label">
                                        {t('translation.BDA.Subdivision.approvalNo')} <span className="mandatory_color">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        placeholder={t('translation.BDA.Subdivision.approvalNoPlaceholder')}
                                        name="layoutApprovalNumber"
                                        value={formData.layoutApprovalNumber}
                                        onChange={handleChange}
                                        disabled={!isEditing} // Disable when not editing
                                    />
                                    {errors.layoutApprovalNumber && (
                                        <small className="text-danger">{errors.layoutApprovalNumber}</small>
                                    )}
                                </div>
                            </div>
                            {/* Date of Approval */}
                            <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                <div className="form-group">
                                    <label className="form-label">
                                        {t('translation.BDA.Subdivision.dateOfApproval')} <span className="mandatory_color">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        name="dateOfApproval"
                                        value={formData.dateOfApproval}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        max={new Date().toISOString().split("T")[0]} // Restrict to today or earlier
                                    />
                                    {errors.dateOfApproval && (
                                        <small className="text-danger">{errors.dateOfApproval}</small>
                                    )}

                                </div>
                            </div>
                            {/* Scan & Upload Layout Approval order */}
                            <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                <div className="form-group">
                                    <label className="form-label">
                                        {t('translation.BDA.Subdivision.scanUploadapproval')} <span className="mandatory_color">*</span>
                                    </label>
                                    <input
                                        type="file" accept=".pdf"
                                        className="form-control"
                                        onChange={handleFileApprovalOrderChange}
                                        ref={fileApprovalOrderInputRef}
                                        disabled={!isEditing} // Disable when not editing
                                    />
                                    {formData.approvalOrder && typeof formData.approvalOrder === "object" && (
                                        <div className="mt-2">
                                            {/* Display the document in a square iframe */}
                                            <div className="iframe-container" style={{ border: '1px solid #ddd', borderRadius: '5px', overflow: 'hidden', padding: '0', width: '120px', height: '120px' }}>
                                                <iframe
                                                    src={URL.createObjectURL(formData.approvalOrder)}
                                                    width="100%"
                                                    height="100%" // Ensures it is square by matching width and height
                                                    title="Approval Order"
                                                    onClick={() => window.open(URL.createObjectURL(formData.approvalOrder), '_blank')} // Open in new tab on click
                                                    style={{ cursor: 'pointer', border: 'none' }} // Borderless and clickable
                                                />
                                            </div>
                                            <p className="mt-1" style={{ fontSize: '0.875rem' }}>
                                                Current File:{" "}
                                                <a
                                                    href={URL.createObjectURL(formData.approvalOrder)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ textDecoration: 'underline', color: '#007bff', fontSize: '0.875rem' }}
                                                >
                                                    {formData.approvalOrder.name}
                                                </a>
                                            </p>
                                        </div>
                                    )}
                                    <span className="note_color">{t('translation.BDA.Subdivision.fileSize&format')}</span><br />
                                    {errors.approvalOrder && <small className="text-danger">{errors.approvalOrder}</small>}
                                </div>
                            </div>
                            {/* Upload Layout Approved Map */}
                            <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                <div className="form-group">
                                    <label className="form-label">
                                        {t('translation.BDA.Subdivision.scanUploadMap')} <span className="mandatory_color">*</span>
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        className="form-control"
                                        onChange={handleFileApprovalMapChange}
                                        ref={fileApprovalMapInputRef}
                                        disabled={!isEditing} // Disable when not editing
                                    />

                                    {formData.approvalMap && typeof formData.approvalMap === "object" && (
                                        <div className="mt-2">
                                            {/* Square iframe preview */}
                                            <div style={{ width: '120px', height: '120px', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
                                                <iframe
                                                    src={URL.createObjectURL(formData.approvalMap)}
                                                    title="Approval Map"
                                                    width="100%"
                                                    height="100%"
                                                    style={{ cursor: 'pointer', border: 'none' }}
                                                    onClick={() => window.open(URL.createObjectURL(formData.approvalMap), '_blank')}
                                                />
                                            </div>

                                            <p className="mt-1" style={{ fontSize: '0.875rem' }}>
                                                Current File:{" "}
                                                <a
                                                    href={URL.createObjectURL(formData.approvalMap)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ textDecoration: 'underline', color: '#007bff' }}
                                                >
                                                    {formData.approvalMap.name}
                                                </a>
                                            </p>
                                        </div>
                                    )}

                                    <span className="note_color">{t('translation.BDA.Subdivision.fileSize&format50')}</span><br />
                                    {errors.approvalMap && <small className="text-danger">{errors.approvalMap}</small>}
                                </div>
                            </div>
                            {/* Approval Authority */}
                            <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                <div className="form-group">
                                    <label className="form-label">
                                        {t('translation.BDA.Subdivision.designation')}
                                        <span className="mandatory_color">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder={t('translation.BDA.Subdivision.placeholderDesignation')}
                                        name="approvalAuthority"
                                        value={formData.approvalAuthority}
                                        onChange={handleChange}
                                        disabled={!isEditing} // Disable when not editing
                                    />
                                    {errors.approvalAuthority && (
                                        <small className="text-danger">{errors.approvalAuthority}</small>
                                    )}
                                </div>
                            </div><div className='col-0 col-sm-0 col-md-3 col-lg-3 col-xl-3'></div>
                            {/* Add More or Update Button */}
                            <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mt-4">
                                <div className="form-group">
                                    <button className="btn btn-primary btn-block" onClick={handleSave} disabled={!isEditing}>
                                        {editIndex !== null ? t('translation.buttons.update') : 'Save'}
                                    </button>
                                </div>
                            </div>


                            {/* Save Button */}
                            <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                <div className="form-group">


                                    {records.length > 0 && (
                                        <div className="mt-4">
                                            <h4>List of Layout Approval order</h4>
                                            <DataTable
                                                columns={columns}
                                                data={records}
                                                customStyles={customStyles}
                                                pagination
                                                highlightOnHover
                                                striped
                                            />
                                            {/* Save Approval order Button */}
                                            <div className='row'>
                                                <div className='col-0 col-sm-0 col-md-10 col-lg-10 col-xl-10'></div>
                                                <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 ">
                                                    <div className="form-group">
                                                        <button className="btn btn-primary btn-block" onClick={handleSaveAndProceed}>
                                                            {t('translation.buttons.save&proceed')}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Table to Display Records */}

                        </div>
                    </div>




                    <hr className='mt-1' />
                    <h6 className='fw-normal fs-5' style={{ color: '#0077b6' }}>{t('translation.BDA.Subdivision1.heading')}</h6>
                    <hr className='mt-1' style={{ border: '1px dashed #0077b6' }} />

                    <div className="mt-5">
                        <div className="row">
                            {/* release Order Number */}
                            <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                <div className="form-group">
                                    <label className="form-label">
                                        {t('translation.BDA.Subdivision1.orderNo')} <span className="mandatory_color">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        placeholder={t('translation.BDA.Subdivision1.orderNoPlaceholder')}
                                        name="layoutOrderNumber"  // <-- Corrected here
                                        value={release_formData.layoutOrderNumber}
                                        onChange={handleOrderChange}
                                        disabled={!isOrder_Editing}
                                    />
                                    {release_errors.layoutOrderNumber && (
                                        <small className="text-danger">{release_errors.layoutOrderNumber}</small>
                                    )}

                                </div>
                            </div>
                            {/* Date of order */}
                            <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                <div className="form-group">
                                    <label className="form-label">
                                        {t('translation.BDA.Subdivision1.dateofOrder')} <span className="mandatory_color">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        name="dateOfOrder"
                                        value={release_formData.dateOfOrder}
                                        max={new Date().toISOString().split("T")[0]}
                                        onChange={handleOrderChange}
                                        disabled={!isOrder_Editing} // Disable when not editing
                                    />
                                    {release_errors.dateOfOrder && (
                                        <small className="text-danger">{release_errors.dateOfOrder}</small>
                                    )}
                                </div>
                            </div>
                            {/* Scan & Upload Layout release order */}
                            <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                <div className="form-group">
                                    <label className="form-label">
                                        {t('translation.BDA.Subdivision1.scanUploadOrder')} <span className="mandatory_color">*</span>
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        className="form-control"
                                        onChange={handleFilereleaseOrderChange}
                                        ref={fileReleaseOrderInputRef}
                                        disabled={!isOrder_Editing} // Disable when not editing
                                    />

                                    {release_formData.release_Order && typeof release_formData.release_Order === "object" && (
                                        <div className="mt-2">
                                            {/* Square Iframe preview */}
                                            <div style={{ width: '120px', height: '120px', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
                                                <iframe
                                                    src={URL.createObjectURL(release_formData.release_Order)}
                                                    title="Release Order"
                                                    width="100%"
                                                    height="100%"
                                                    style={{ cursor: 'pointer', border: 'none' }}
                                                    onClick={() => window.open(URL.createObjectURL(release_formData.release_Order), '_blank')}
                                                />
                                            </div>

                                            <p className="mt-1" style={{ fontSize: '0.875rem' }}>
                                                Current File:{" "}
                                                <a
                                                    href={URL.createObjectURL(release_formData.release_Order)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ textDecoration: 'underline', color: '#007bff' }}
                                                >
                                                    {release_formData.release_Order.name}
                                                </a>
                                            </p>
                                        </div>
                                    )}

                                    <span className="note_color">{t('translation.BDA.Subdivision1.noteFile')}</span><br />
                                    {release_errors.release_Order && (
                                        <small className="text-danger">{release_errors.release_Order}</small>
                                    )}
                                </div>
                            </div>
                            {/* release Authority */}
                            <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                <div className="form-group">
                                    <label className="form-label">
                                        {t('translation.BDA.Subdivision1.designation')}
                                        <span className="mandatory_color">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder={t('translation.BDA.Subdivision1.placeholderDesignation')}
                                        name="orderAuthority"
                                        value={release_formData.orderAuthority}
                                        onChange={handleOrderChange}
                                        disabled={!isOrder_Editing} // Disable when not editing
                                    />
                                    {release_errors.orderAuthority && (
                                        <small className="text-danger">{release_errors.orderAuthority}</small>
                                    )}
                                </div>
                            </div>
                            {/* Release Type */}
                            <div className='col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3'>
                                <div className="form-group mt-2">
                                    <label className='form-label'>
                                        Release Type <span className='mandatory_color'>*</span>
                                    </label>
                                </div>
                                {release_errors.releaseType && (
                                    <small className="text-danger">{release_errors.releaseType}</small>
                                )}
                            </div>
                            <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3">
                                <div className="form-check">
                                    <input
                                        className="form-check-input me-2 radioStyle"
                                        type="radio"
                                        name="releaseType"
                                        value="100"
                                        checked={release_formData.releaseType === "100"}
                                        onChange={(e) =>
                                            setRelease_FormData({ ...release_formData, releaseType: e.target.value })
                                        }
                                    />
                                    <label className="form-check-label fw-bold">100</label>
                                </div>
                            </div>
                            <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3">
                                <div className="form-check">
                                    <input
                                        className="form-check-input me-2 radioStyle"
                                        type="radio"
                                        name="releaseType"
                                        value="60*40"
                                        checked={release_formData.releaseType === "60 * 40"}
                                        onChange={(e) =>
                                            setRelease_FormData({ ...release_formData, releaseType: e.target.value })
                                        }
                                    />
                                    <span className="form-check-label fw-bold">60 * 40</span>
                                </div>
                            </div>
                            <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3">
                                <div className="form-check">
                                    <input
                                        className="form-check-input me-2 radioStyle"
                                        type="radio"
                                        name="releaseType"
                                        value="40*30*30"
                                        checked={release_formData.releaseType === "40 * 30 * 30"}
                                        onChange={(e) =>
                                            setRelease_FormData({ ...release_formData, releaseType: e.target.value })
                                        }
                                    />
                                    <span className="form-check-label fw-bold">40 * 30 * 30</span>
                                </div>
                            </div>
                            <div className='col-md-10'></div>
                            {/* Save Button */}
                            <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 ">
                                <div className="form-group">
                                    <button className="btn btn-primary btn-block" onClick={handleOrderSave} disabled={!isOrder_Editing}>
                                        {edit_OrderIndex !== null ? t('translation.buttons.update') : t('translation.buttons.add_more')}
                                    </button>
                                </div>
                            </div>
                            {/* Save Button */}
                            <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                <div className="form-group">


                                    {order_records.length > 0 && (
                                        <div className="mt-4">
                                            <h4>{t('translation.BDA.table1.heading')}</h4>
                                            <DataTable
                                                columns={order_columns}
                                                data={order_records}
                                                customStyles={customStyles}
                                                pagination
                                                highlightOnHover
                                                striped
                                            />
                                            {/* Save Approval order Button */}
                                            <div className='row'>
                                                <div className='col-md-8'></div>
                                                <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 ">
                                                    <div className="form-group">
                                                        <button className="btn btn-primary btn-block" onClick={handleAddMoreRelease_again}>
                                                            {t('translation.buttons.add')}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 ">
                                                    <div className="form-group">
                                                        <button className="btn btn-primary btn-block" onClick={handleOrderSaveAndProceed}>
                                                            {t('translation.buttons.save&proceed')}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Table to Display Records */}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
//GPS and Individual Sites Components
const IndividualGPSBlock = () => {
    const { loading, start_loader, stop_loader } = useLoader(); // Use loader context
    const [shape, setShape] = useState("regular"); // Track selected shape

    const [side1Length, setSide1Length] = useState("");
    const [side2Length, setSide2Length] = useState("");
    const [side3Length, setSide3Length] = useState("");
    const [side4Length, setSide4Length] = useState("");

    const [side1RoadFacing, setSide1RoadFacing] = useState("");
    const [side1Error, setSide1Error] = useState('');
    const [side1RoadError, setSide1RoadError] = useState('');


    const [side2RoadFacing, setSide2RoadFacing] = useState("");
    const [side2Error, setSide2Error] = useState('');
    const [side2RoadError, setSide2RoadError] = useState('');


    const [side3RoadFacing, setSide3RoadFacing] = useState("");
    const [side3Error, setSide3Error] = useState('');
    const [side3RoadError, setSide3RoadError] = useState('');

    const [side4RoadFacing, setSide4RoadFacing] = useState("");
    const [side4Error, setSide4Error] = useState('');
    const [side4RoadError, setSide4RoadError] = useState('');

    //east-west varaiable
    const [eastwestFeet, setEastwestFeet] = useState('');
    const [eastwestMeter, setEastwestMeter] = useState('');
    const [eastwestError, setEastwestError] = useState('');
    const [eastwestRoadFacing, setEastwestRoadFacing] = useState(null);
    const [eastwestRoadError, setEastwestRoadError] = useState('');

    //north-south varaiable
    const [northsouthFeet, setNorthsouthFeet] = useState('');
    const [northsouthMeter, setNorthsouthMeter] = useState('');
    const [northsouthError, setNorthsouthError] = useState('');
    const [northsouthRoadFacing, setNorthsouthRoadFacing] = useState(null);
    const [northsouthRoadError, setNorthsouthRoadError] = useState('');

    //regular area calculation varaiable
    const [regularAreaSqFt, setRegularAreaSqFt] = useState('');
    const [regularAreaSqM, setRegularAreaSqM] = useState('');

    const [totalArea, setTotalArea] = useState(""); // Total Area Input

    const [cornerSite, setCornerSite] = useState(""); // Corner Site Selection (Yes/No)
    const [cornerSiteError, setCornerSiteError] = useState("");

    const [areaFeet, setAreaFeet] = useState(""); // Area in Feet Input

    const [siteType, setSiteType] = useState(""); // Dropdown for Site Type
    const [siteTypeError, setSiteTypeError] = useState('');

    const [numSides, setNumSides] = useState("");
    const [numSidesError, setNumSidesError] = useState('');
    const [sides, setSides] = useState([]);

    const [regular_siteNumber, setRegular_SiteNumber] = useState('');
    const [regular_siteNumberError, setRegular_SiteNumberError] = useState('');

    const [chakbandiEast, setChakbandiEast] = useState('');
    const [chakbandiEastError, setChakbandiEastError] = useState('');

    const [chakbandiWest, setChakbandiWest] = useState('');
    const [chakbandiWestError, setChakbandiWestError] = useState('');

    const [chakbandiSouth, setChakbandiSouth] = useState('');
    const [chakbandiSouthError, setChakbandiSouthError] = useState('');

    const [chakbandiNorth, setChakbandiNorth] = useState('');
    const [chakbandiNorthError, setChakbandiNorthError] = useState('');

    const [siteData, setSiteData] = useState([]);
    const [irregularsiteData, setIrregularSiteData] = useState([]);
    const [numSidesData, setNumSidesData] = useState("");


    const [blockArea, setBlockArea] = useState([]);
    const [blockAreaError, setBlockAreaError] = useState([]);

    const siteNumberRef = useRef(null);
    const blockAreaRef = useRef(null);
    const side1RoadRef = useRef(null);
    const side2RoadRef = useRef(null);
    const eastwestFeetRef = useRef(null);
    const northsouthFeetRef = useRef(null);
    const cornerSiteRef = useRef(null);
    const siteTypeRef = useRef(null);
    const chakbandiEastRef = useRef(null);
    const chakbandiWestRef = useRef(null);
    const chakbandiSouthRef = useRef(null);
    const chakbandiNorthRef = useRef(null);
    const latitudeRef = useRef(null);
    const longitudeRef = useRef(null);
    const resultTypeRef = useRef(null);



    const handleNumSidesChange = (e) => {
        const value = e.target.value;

        // Allow only 1-9 (single digits)
        if (/^[3-9]?$/.test(value)) {
            setNumSides(value);

            if (value) {
                setSides(
                    Array.from({ length: parseInt(value) }, (_, index) => ({
                        id: index + 1,
                        lengthInFeet: "",
                        lengthInMeter: "",
                        roadFacing: null,
                    }))
                );
            } else {
                setSides([]);
            }
        }
    };
    const handleLengthInFeetChange = (index, value) => {
        const updatedSides = [...sides];
        updatedSides[index].lengthInFeet = value;

        if (/^(?:[1-9][0-9]*)(?:\.\d*)?$/.test(value)) {
            updatedSides[index].lengthInMeter = feetToMeter(value);
        } else if (value === '') {
            updatedSides[index].lengthInMeter = '';
        }

        setSides(updatedSides);
    };
    const handleLengthInMeterChange = (index, value) => {
        const updatedSides = [...sides];
        updatedSides[index].lengthInMeter = value;

        if (/^(?:[1-9][0-9]*)(?:\.\d*)?$/.test(value)) {
            updatedSides[index].lengthInFeet = meterToFeet(value);
        } else if (value === '') {
            updatedSides[index].lengthInFeet = '';
        }

        setSides(updatedSides);
    };
    const handleRoadFacingChange = (index, value) => {
        const updatedSides = [...sides];
        updatedSides[index].roadFacing = value;
        setSides(updatedSides);
    };
    const handleRegular_SiteNumberChange = (e) => {
        const value = e.target.value.toUpperCase(); // Convert to uppercase automatically
        const allowedPattern = /^[0-9A-Z\/\-]*$/;

        if (value === '') {
            setRegular_SiteNumber(value);
            setRegular_SiteNumberError('Site Number is required');
        } else if (value.startsWith('0')) {
            setRegular_SiteNumber(value);
            setRegular_SiteNumberError("Site Number should not start with 0");
        } else if (!allowedPattern.test(value)) {
            setRegular_SiteNumber(value);
            setRegular_SiteNumberError("Only capital letters, numbers, '/' and '-' are allowed");
        } else {
            setRegular_SiteNumber(value);
            setRegular_SiteNumberError('');
        }
    };
    const handleRegular_BlockAreaChange = (e) => {
        const value = e.target.value;
        const allowedPattern = /^[a-zA-Z0-9\s\-]*$/; // Only letters, numbers, spaces, and hyphens

        if (value === '') {
            setBlockArea(value);
            setBlockAreaError('Block/Area is required');
        } else if (!allowedPattern.test(value)) {
            setBlockArea(value);
            setBlockAreaError('Only letters, numbers, spaces, and hyphens are allowed');
        } else {
            setBlockArea(value);
            setBlockAreaError('');  // Clear error when valid input
        }
    };
    //east-west feet to meter calculation values 
    // East-West feet change handler
    const handleEastwestFeetChange = (e) => {
        const value = e.target.value;
        if (/^(?!0)\d*(\.\d*)?$/.test(value) || value === "") {
            setEastwestFeet(value);

            if (value === "") {
                setEastwestError('East-West side length is required');
                setEastwestMeter('');
            } else {
                setEastwestError('');
                const feet = parseFloat(value);
                if (!isNaN(feet)) {
                    const meter = feet * 0.3048;
                    setEastwestMeter(meter.toFixed(2));
                }
            }
            // Recalculate Area
            calculateArea(value, northsouthFeet, null, null);
        }
    };
    // East-West meter change handler
    const handleEastwestMeterChange = (e) => {
        const value = e.target.value;
        if (/^(?!0)\d*(\.\d*)?$/.test(value) || value === "") {
            setEastwestMeter(value);

            if (value === "") {
                setEastwestError('East-West side length is required');
                setEastwestFeet('');
            } else {
                setEastwestError('');
                const meter = parseFloat(value);
                if (!isNaN(meter)) {
                    const feet = meter / 0.3048;
                    setEastwestFeet(feet.toFixed(2));
                }
            }

            // Recalculate Area
            calculateArea(null, null, value, northsouthMeter);
        }
    };
    //north-south feet or meter calculation function
    const feetToMeter = (feet) => (feet ? (parseFloat(feet) * 0.3048).toFixed(2) : '');
    const meterToFeet = (meter) => (meter ? (parseFloat(meter) / 0.3048).toFixed(2) : '');
    // North-South feet change handler
    const handleNorthsouthFeetChange = (e) => {
        const value = e.target.value;
        if (/^(?!0)\d*(\.\d{0,2})?$/.test(value) || value === '') {
            setNorthsouthFeet(value);
            setNorthsouthMeter(feetToMeter(value));
            setNorthsouthError(value ? '' : 'North-south length is required');
        }

        // Recalculate Area
        calculateArea(eastwestFeet, value, null, null);
    };
    // North-South meter change handler
    const handleNorthsouthMeterChange = (e) => {
        const value = e.target.value;
        if (/^(?!0)\d*(\.\d{0,2})?$/.test(value) || value === '') {
            setNorthsouthMeter(value);
            setNorthsouthFeet(meterToFeet(value));
            setNorthsouthError(value ? '' : 'North-south length is required');
        }

        // Recalculate Area
        calculateArea(null, null, eastwestMeter, value);
    };
    // Area Calculation Function (for regular-shaped site)
    const calculateArea = (lengthFt, widthFt, lengthM, widthM) => {
        if (lengthFt && widthFt) {
            const areaFeet = parseFloat(lengthFt) * parseFloat(widthFt);
            const areaMeter = areaFeet * 0.092903; // 1 sq.ft = 0.092903 sq.m
            setRegularAreaSqFt(areaFeet.toFixed(2));
            setRegularAreaSqM(areaMeter.toFixed(2));
        } else if (lengthM && widthM) {
            const areaMeter = parseFloat(lengthM) * parseFloat(widthM);
            const areaFeet = areaMeter * 10.7639; // 1 sq.m = 10.7639 sq.ft
            setRegularAreaSqM(areaMeter.toFixed(2));
            setRegularAreaSqFt(areaFeet.toFixed(2));
        } else {
            setRegularAreaSqFt('');
            setRegularAreaSqM('');
        }
    };
    const finalValidation = () => {
        let isValid = true;
        let firstErrorField = null;


        // Reset all error states
        setEastwestError('');
        setNorthsouthError('');
        setSide1RoadError('');
        setSide2RoadError('');
        setRegular_SiteNumberError('');
        setBlockAreaError('');
        setCornerSiteError('');
        setSiteTypeError('');
        setChakbandiEastError('');
        setChakbandiWestError('');
        setChakbandiSouthError('');
        setChakbandiNorthError('');
        setLatitudeError('');
        setLongitudeError('');

        // ✅ New: Validate Site Number
        if (!regular_siteNumber || regular_siteNumber.trim() === '') {
            setRegular_SiteNumberError('Site number is required');
            if (!firstErrorField) firstErrorField = siteNumberRef;
            isValid = false;
        }

        // ✅ New: Validate Block/Area
        if (!String(blockArea).trim()) {
            setBlockAreaError('Block/Area is required');
            if (!firstErrorField) firstErrorField = blockAreaRef;
            isValid = false;
        }

        // Validate road facing radios
        if (side1RoadFacing === '') {
            setSide1RoadError('Please select road facing option for Side 1');
            if (!firstErrorField) firstErrorField = side1RoadRef;
            isValid = false;
        }
        if (side2RoadFacing === '') {
            setSide2RoadError('Please select road facing option for Side 2');
            if (!firstErrorField) firstErrorField = side2RoadRef;
            isValid = false;
        }


        if ((!eastwestFeet || parseFloat(eastwestFeet) <= 0) && (!eastwestMeter || parseFloat(eastwestMeter) <= 0)) {
            setEastwestError('Please enter East-West side length in either Feet or Meter');
            if (!firstErrorField) firstErrorField = eastwestFeetRef;
            isValid = false;
        }

        if ((!northsouthFeet || parseFloat(northsouthFeet) <= 0) && (!northsouthMeter || parseFloat(northsouthMeter) <= 0)) {
            setNorthsouthError('Please enter North-South side length in either Feet or Meter');
            if (!firstErrorField) firstErrorField = northsouthFeetRef;
            isValid = false;
        }

        //corner Site validation
        if (cornerSite === '') {
            setCornerSiteError('Please select corner site option');
            if (!firstErrorField) firstErrorField = cornerSiteRef;
            isValid = false;
        }
        // ✅ Site Type Dropdown validation
        if (siteType === '') {
            setSiteTypeError('Please select a type of site');
            if (!firstErrorField) firstErrorField = siteTypeRef;
            isValid = false;
        }
        const chakbandiRegex = /^[a-zA-Z0-9.,\/\\#\s]*$/;

        // ✅ Validate Chakbandi Directions
        if (!chakbandiEast || chakbandiEast.trim() === '') {
            setChakbandiEastError("East side is required");
            if (!firstErrorField) firstErrorField = chakbandiEastRef;
            isValid = false;
        } else if (!chakbandiRegex.test(chakbandiEast)) {
            setChakbandiEastError("Only letters, numbers, space and . , / \\ # are allowed");
            if (!firstErrorField) firstErrorField = chakbandiEastRef;
            isValid = false;
        } else {
            setChakbandiEastError("");
        }

        if (!chakbandiWest || chakbandiWest.trim() === '') {
            setChakbandiWestError("West side is required");
            if (!firstErrorField) firstErrorField = chakbandiWestRef;
            isValid = false;
        } else if (!chakbandiRegex.test(chakbandiWest)) {
            setChakbandiWestError("Only letters, numbers, space and . , / \\ # are allowed");
            if (!firstErrorField) firstErrorField = chakbandiWestRef;
            isValid = false;
        } else {
            setChakbandiWestError("");
        }


        if (!chakbandiSouth || chakbandiSouth.trim() === '') {
            setChakbandiSouthError("South side is required");
            if (!firstErrorField) firstErrorField = chakbandiSouthRef;
            isValid = false;
        } else if (!chakbandiRegex.test(chakbandiSouth)) {
            setChakbandiSouthError("Only letters, numbers, space and . , / \\ # are allowed");
            if (!firstErrorField) firstErrorField = chakbandiSouthRef;
            isValid = false;
        } else {
            setChakbandiSouthError("");
        }

        if (!chakbandiNorth || chakbandiNorth.trim() === '') {
            setChakbandiNorthError("North side is required");
            if (!firstErrorField) firstErrorField = chakbandiNorthRef;
            isValid = false;
        } else if (!chakbandiRegex.test(chakbandiNorth)) {
            setChakbandiNorthError("Only letters, numbers, space and . , / \\ # are allowed");
            if (!firstErrorField) firstErrorField = chakbandiNorthRef;
            isValid = false;
        } else {
            setChakbandiNorthError("");
        }

        //Latitude Validation
        if (!latitude || latitude.trim() === '') {
            setLatitudeError('Latitude is required');
            if (!firstErrorField) firstErrorField = latitudeRef;
            isValid = false;
        }

        // Validate Longitude
        if (!longitude || longitude.trim() === '') {
            setLongitudeError('Longitude is required');
            if (!firstErrorField) firstErrorField = longitudeRef;
            isValid = false;
        }
        if (!resultType || resultType.trim() === '') {
            setResultTypeError('Result type is required');
            if (!firstErrorField) firstErrorField = resultTypeRef;
            isValid = false;
        }
        if (firstErrorField && firstErrorField.current) {
            firstErrorField.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstErrorField.current.focus();
        }

        return isValid;
    };
    // Function to clear the input fields
    const resetFormFields = () => {
        setRegular_SiteNumber('');
        setBlockArea('');
        setEastwestFeet('');
        setEastwestMeter('');
        setSide1RoadFacing('');
        setNorthsouthFeet('');
        setNorthsouthMeter('');
        setSide2RoadFacing('');
        setTotalArea('');
        setCornerSite('');
        setSiteType('');
        setChakbandiEast('');
        setChakbandiWest('');
        setChakbandiSouth('');
        setChakbandiNorth('');
        setLatitude('');
        setLongitude('');
        setResultType('');
        setRegularAreaSqFt('');
        setRegularAreaSqM('');
        setIsChecked(false);
    };
    // Function to fetch the previous data and populate the form fields
    const handleFetchPrevious = (e) => {
        if (e.target.checked) {
            const previousData = siteData[siteData.length - 1]; // Get the last added record

            if (previousData) {
                // Populate the input fields with the previous data
                setRegular_SiteNumber(previousData.siteNumber);
                setBlockArea(previousData.blockArea);
                setEastwestFeet(previousData.eastwestFeet);
                setEastwestMeter(previousData.eastwestMeter);
                setSide1RoadFacing(previousData.eastwestRoadFacing);
                setNorthsouthFeet(previousData.northsouthFeet);
                setNorthsouthMeter(previousData.northsouthMeter);
                setSide2RoadFacing(previousData.northsouthRoadFacing);
                setTotalArea(previousData.totalArea);
                setCornerSite(previousData.cornerSite);
                setSiteType(previousData.siteType);
                setChakbandiEast(previousData.chakbandiEast);
                setChakbandiWest(previousData.chakbandiWest);
                setChakbandiSouth(previousData.chakbandiSouth);
                setChakbandiNorth(previousData.chakbandiNorth);
                setLatitude(previousData.latitude);
                setLongitude(previousData.longitude);
                setResultType(previousData.resultType);

                // Update the Area fields with previous data if available
                setRegularAreaSqFt(previousData.regularAreaSqFt || ''); // Ensure default value if not present
                setRegularAreaSqM(previousData.regularAreaSqM || ''); // Ensure default value if not present
            }
        } else {
            // Clear the fields when checkbox is unchecked
            setRegular_SiteNumber('');
            setBlockArea('');
            setEastwestFeet('');
            setEastwestMeter('');
            setSide1RoadFacing('');
            setNorthsouthFeet('');
            setNorthsouthMeter('');
            setSide2RoadFacing('');
            setTotalArea('');
            setCornerSite('');
            setSiteType('');
            setChakbandiEast('');
            setChakbandiWest('');
            setChakbandiSouth('');
            setChakbandiNorth('');
            setLatitude('');
            setLongitude('');
            setResultType('');
            setRegularAreaSqFt('');
            setRegularAreaSqM('');
        }
    };
    //Irregular shape block variable
    const [irregular_siteNumber, setirregular_siteNumber] = useState('');
    const [irregular_siteNumberError, setirregular_siteNumberError] = useState('');

    const [irregular_blockArea, setirregular_blockArea] = useState('');
    const [irregular_blockAreaError, setirregular_blockAreaError] = useState('');


    const [irregularchakbandiEast, setIrregularChakbandiEast] = useState('');
    const [irregularchakbandiEastError, setIrregularChakbandiEastError] = useState('');

    const [irregularchakbandiWest, setIrregularChakbandiWest] = useState('');
    const [irregularchakbandiWestError, setIrregularChakbandiWestError] = useState('');

    const [irregularchakbandiSouth, setIrregularChakbandiSouth] = useState('');
    const [irregularchakbandiSouthError, setIrregularChakbandiSouthError] = useState('');

    const [irregularchakbandiNorth, setIrregularChakbandiNorth] = useState('');
    const [irregularchakbandiNorthError, setIrregularChakbandiNorthError] = useState('');

    const [irregularcornerSite, setIrregularCornerSite] = useState('no');
    const [irregularcornerSiteError, setIrregularCornerSiteError] = useState('');

    const [irregularsiteType, setIrregularsiteType] = useState('');
    const [irregularsiteTypeError, setIrregularsiteTypeError] = useState('');

    const [irregularAreaSqFt, setIrregularAreaSqFt] = useState('');
    const [irregularAreaSqM, setIrregularAreaSqM] = useState('');
    const [irregularAreaSqft_sqM_error, setIrregularAreaSqft_sqM_error] = useState('');

    const [sideErrors, setSideErrors] = useState([]);
    const [isChecked, setIsChecked] = useState(false);

    //Irregular Shape block
    const irregularFinalValidation = () => {
        let isValid = true;

        // Reset all error states
        setirregular_siteNumberError('');
        setBlockAreaError('');
        setIrregularAreaSqft_sqM_error('');
        setIrregularCornerSiteError('');
        setSiteTypeError('');
        setIrregularChakbandiEastError('');
        setIrregularChakbandiWestError('');
        setIrregularChakbandiSouthError('');
        setIrregularChakbandiNorthError('');
        setLatitudeError('');
        setLongitudeError('');
        setSideErrors([]);  // Add this line to reset side errors

        // ✅ New: Validate Site Number
        if (!irregular_siteNumber || irregular_siteNumber.trim() === '') {
            setirregular_siteNumberError('Site number is required');
            isValid = false;
        }

        // ✅ New: Validate Block/Area
        if (!irregular_blockArea || irregular_blockArea.trim() === '') {
            setirregular_blockAreaError('Block/Area is required');
            isValid = false;
        }

        //area calculation
        if ((!irregularAreaSqFt || parseFloat(irregularAreaSqFt) <= 0) && (!irregularAreaSqM || parseFloat(irregularAreaSqM) <= 0)) {
            setIrregularAreaSqft_sqM_error('Please enter Area  in either Sq.ft or Sq.M');
            isValid = false;
        }

        // corner Site validation
        if (irregularcornerSite === '') {
            setIrregularCornerSiteError('Please select corner site option');
            isValid = false;
        }

        // ✅ Site Type Dropdown validation
        if (irregularsiteType === '') {
            setIrregularsiteTypeError('Please select a type of site');
            isValid = false;
        }

        const chakbandiRegex = /^[a-zA-Z0-9.,\/\\#\s]*$/;

        // ✅ Validate Chakbandi Directions
        if (!irregularchakbandiEast || irregularchakbandiEast.trim() === '') {
            setIrregularChakbandiEastError("East side is required");
            isValid = false;
        } else if (!chakbandiRegex.test(irregularchakbandiEast)) {
            setIrregularChakbandiEastError("Only letters, numbers, space and . , / \\ # are allowed");
            isValid = false;
        }

        if (!irregularchakbandiWest || irregularchakbandiWest.trim() === '') {
            setIrregularChakbandiWestError("West side is required");
            isValid = false;
        } else if (!chakbandiRegex.test(irregularchakbandiWest)) {
            setIrregularChakbandiWestError("Only letters, numbers, space and . , / \\ # are allowed");
            isValid = false;
        }

        if (!irregularchakbandiSouth || irregularchakbandiSouth.trim() === '') {
            setIrregularChakbandiSouthError("South side is required");
            isValid = false;
        } else if (!chakbandiRegex.test(irregularchakbandiSouth)) {
            setIrregularChakbandiSouthError("Only letters, numbers, space and . , / \\ # are allowed");
            isValid = false;
        }

        if (!irregularchakbandiNorth || irregularchakbandiNorth.trim() === '') {
            setIrregularChakbandiNorthError("North side is required");
            isValid = false;
        } else if (!chakbandiRegex.test(irregularchakbandiNorth)) {
            setIrregularChakbandiNorthError("Only letters, numbers, space and . , / \\ # are allowed");
            isValid = false;
        }

        // Latitude Validation
        if (!latitude || latitude.trim() === '') {
            setLatitudeError('Latitude is required');
            isValid = false;
        }

        // Validate Longitude
        if (!longitude || longitude.trim() === '') {
            setLongitudeError('Longitude is required');
            isValid = false;
        }

        if (!resultType || resultType.trim() === '') {
            setResultTypeError('Result type is required');
            isValid = false;
        }

        // ✅ Validate Number of Sides
        if (!numSides || isNaN(numSides) || Number(numSides) < 3 || Number(numSides) > 9) {
            setNumSidesError('Please enter a valid number of sides (between 3 and 9)');
            isValid = false;
        } else {
            setNumSidesError('');  // Clear the error if the validation passes
        }

        const sideErrors = [];
        sides.forEach((side, index) => {
            const sideError = { length: '', roadFacing: '' };

            if (!side.lengthInFeet && !side.lengthInMeter) {
                sideError.length = `Side ${side.id}: Enter length in feet or meter.`;
                isValid = false;
            }

            if (side.roadFacing !== true && side.roadFacing !== false) {
                sideError.roadFacing = `Side ${side.id}: Select whether it's road facing.`;
                isValid = false;
            }

            sideErrors.push(sideError);
        });

        setSideErrors(sideErrors);

        return isValid;
    };
    const handleirRegular_BlockAreaChange = (e) => {
        const value = e.target.value; // Convert to uppercase automatically
        const allowedPattern = /^[0-9a-zA-Z\/\-]*$/;

        if (value === '') {
            setirregular_blockArea(value);
            setirregular_blockAreaError('Site Number is required');
        } else if (!allowedPattern.test(value)) {
            setirregular_blockArea(value);
            setirregular_blockAreaError("Only capital letters, numbers, '/' and '-' are allowed");
        } else {
            setirregular_blockArea(value);
            setirregular_blockAreaError('');
        }
    };
    const handleirRegular_SiteNumberChange = (e) => {
        const value = e.target.value.toUpperCase(); // Convert to uppercase automatically
        const allowedPattern = /^[0-9A-Z\/\-]*$/;

        if (value === '') {
            setirregular_siteNumber(value);
            setirregular_siteNumberError('Site Number is required');
        } else if (value.startsWith('0')) {
            setirregular_siteNumber(value);
            setirregular_siteNumberError("Site Number should not start with 0");
        } else if (!allowedPattern.test(value)) {
            setirregular_siteNumber(value);
            setirregular_siteNumberError("Only capital letters, numbers, '/' and '-' are allowed");
        } else {
            setirregular_siteNumber(value);
            setirregular_siteNumberError('');
        }
    };
    // Function to clear the input fields
    const resetIrregularFormFields = () => {
        setirregular_siteNumber('');
        setirregular_blockArea('');
        setNumSides(''); // Clears numSides
        setIrregularAreaSqFt('');
        setIrregularAreaSqM('');
        setIrregularCornerSite('');
        setIrregularsiteType('');
        setIrregularChakbandiEast('');
        setIrregularChakbandiWest('');
        setIrregularChakbandiSouth('');
        setIrregularChakbandiNorth('');
        setLatitude('');
        setLongitude('');
        setResultType('');
        setRegularAreaSqFt('');
        setRegularAreaSqM('');

        // Clear the sides array
        setSides([]); // Reset sides array
    };
    const handleSqFtChange = (e) => {
        const value = e.target.value;

        // Allow only numbers and optional decimal point
        const numericValue = value.replace(/[^0-9.]/g, '');

        setIrregularAreaSqFt(numericValue);

        if (!isNaN(numericValue) && numericValue !== '') {
            const sqm = (parseFloat(numericValue) * 0.092903).toFixed(2);
            setIrregularAreaSqM(sqm);
        } else {
            setIrregularAreaSqM('');
        }
    };
    const handleSqMChange = (e) => {
        const value = e.target.value;

        const numericValue = value.replace(/[^0-9.]/g, '');

        setIrregularAreaSqM(numericValue);

        if (!isNaN(numericValue) && numericValue !== '') {
            const sqft = (parseFloat(numericValue) * 10.7639).toFixed(2);
            setIrregularAreaSqFt(sqft);
        } else {
            setIrregularAreaSqFt('');
        }
    };
    const [layoutSiteCount, setLayoutSiteCount] = useState("");
    const [layoutSiteCountError, setLayoutSiteCountError] = useState("");
    const layoutSiteCountRef = useRef(null);

    const totalSitesCount = Number(layoutSiteCount);
    const totalAddedSites = siteData.length + irregularsiteData.length;

    const [allSites, setAllSites] = useState([]);


    const handleLayoutSiteCountChange = (e) => {
        const value = e.target.value;
        if (/^[0-9]*$/.test(value)) {
            setLayoutSiteCount(value);
            setLayoutSiteCountError(!value ? "Total number of sites is required" : "");
        } else {
            setLayoutSiteCountError("Only numeric values are allowed");
        }
    };

    const [siteIdCounter, setSiteIdCounter] = useState(1);
    const [isAddDisabled, setIsAddDisabled] = useState(false);


    const handle_AddRow = (shape) => {
        if (!layoutSiteCount || totalSitesCount <= 0) {
            setLayoutSiteCountError("Please enter a valid number of total sites");
            return;
        }

        const totalAddedSites = allSites.length;

        if (totalAddedSites == totalSitesCount) {
            setIsAddDisabled(true);
        }

        if (totalAddedSites >= totalSitesCount) {
            setIsAddDisabled(true); // ✅ Disable further addition
            Swal.fire({
                title: "Limit Reached",
                text: `Only ${totalSitesCount} sites allowed. Please update the total number of sites if needed.`,
                icon: "warning",
                confirmButtonText: "OK",
                allowOutsideClick: false,
                allowEscapeKey: true
            }).then(() => {
                layoutSiteCountRef.current.focus();
            });

            return;
        }

        // ✅ Move ID generation *inside* the shape-specific validation block
        if (shape === "regular" && finalValidation()) {
            const uniqueId = `REG-${String(siteIdCounter).padStart(3, '0')}`;
            setSiteIdCounter(prev => prev + 1); // ✅ increment only if validation passes

            const newRow = {
                id: uniqueId,
                regularShape: "Regular",
                siteNumber: regular_siteNumber,
                blockArea,
                eastwestFeet,
                eastwestMeter,
                eastwestRoadFacing: side1RoadFacing,
                northsouthFeet,
                northsouthMeter,
                northsouthRoadFacing: side2RoadFacing,
                totalArea,
                cornerSite,
                siteType,
                chakbandiEast,
                chakbandiWest,
                chakbandiSouth,
                chakbandiNorth,
                latitude,
                longitude,
                resultType,
                regularAreaSqFt,
                regularAreaSqM,
                currentDateTime: new Date().toISOString()
            };

            setAllSites(prev => [...prev, newRow]);
            setSiteData(prev => [...prev, newRow]);
            resetFormFields();

            Swal.fire({
                title: "Success!",
                text: "Regular site record saved successfully.",
                icon: "success",
                confirmButtonText: "OK",
                allowOutsideClick: false,
                allowEscapeKey: true
            });
        }

        if (shape === "irregular" && irregularFinalValidation()) {
            const uniqueId = `REG-${String(siteIdCounter).padStart(3, '0')}`;
            setSiteIdCounter(prev => prev + 1); // ✅ only increment when validation passes

            const newRow = {
                id: uniqueId,
                regularShape: "Irregular",
                siteNumber: irregular_siteNumber,
                blockArea: irregular_blockArea,
                totalArea,
                cornerSite: irregularcornerSite,
                siteType: irregularsiteType,
                chakbandiEast: irregularchakbandiEast,
                chakbandiWest: irregularchakbandiWest,
                chakbandiSouth: irregularchakbandiSouth,
                chakbandiNorth: irregularchakbandiNorth,
                latitude,
                longitude,
                resultType,
                irregularAreaSqFt,
                irregularAreaSqM,
                numberOfSides: numSides,
                sides: sides.map(side => ({
                    lengthInFeet: side.lengthInFeet,
                    lengthInMeter: side.lengthInMeter,
                    roadFacing: side.roadFacing
                })),
                currentDateTime: new Date().toISOString()
            };

            setAllSites(prev => [...prev, newRow]);
            setIrregularSiteData(prev => [...prev, newRow]);
            setNumSidesData(numSides);
            resetIrregularFormFields();

            Swal.fire({
                title: "Success!",
                text: "Irregular site record saved successfully.",
                icon: "success",
                confirmButtonText: "OK",
                allowOutsideClick: false,
                allowEscapeKey: true
            });
        }
    };
    const Save_Handler = () => {
        if (!layoutSiteCount) {
            setLayoutSiteCountError("Total number of sites is required");
            return;
        }

        if (totalSitesCount !== totalAddedSites) return;

        console.log("Saving data...");
        setIsAddDisabled(true);

    };

    const Edit_Handler = () => {
        setIsAddDisabled(false);
        console.log("Saving data...");

    };
    //map block
    const mapRef = useRef(null);
    const searchInputRef = useRef(null);
    const [latitude, setLatitude] = useState('N/A');
    const [latitudeerror, setLatitudeError] = useState('');
    const [longitude, setLongitude] = useState('N/A');
    const [longitudeerror, setLongitudeError] = useState('');
    const [resultType, setResultType] = useState('Please select a property on Google Maps: *');
    const [resultTypeError, setResultTypeError] = useState('');

    const markerRef = useRef(null);
    const mapInstance = useRef(null);
    const geocoder = useRef(null);
    const service = useRef(null);
    // const autocomplete = useRef(null);

    useEffect(() => {
        const initMap = () => {
            const center = { lat: 12.9716, lng: 77.5946 };

            const map = new window.google.maps.Map(mapRef.current, {
                center,
                zoom: 17,
                mapTypeId: 'hybrid',
            });

            mapInstance.current = map;

            const marker = new window.google.maps.Marker({
                map,
                draggable: true,
            });
            markerRef.current = marker;

            geocoder.current = new window.google.maps.Geocoder();
            service.current = new window.google.maps.places.PlacesService(map);



            map.addListener('click', (event) => {
                const location = event.latLng;
                moveMapTo(location, "");

                geocoder.current.geocode({ location }, (results, status) => {
                    if (status === 'OK' && results[0]) {
                        moveMapTo(location, "", results[0].formatted_address);
                    }
                });
            });

            marker.addListener('dragend', (event) => {
                const location = event.latLng;
                moveMapTo(location, "Dragged Result");

                geocoder.current.geocode({ location }, (results, status) => {
                    if (status === 'OK' && results[0]) {
                        moveMapTo(location, "Dragged Result", results[0].formatted_address);
                    }
                });
            });
        };

        if (window.google) {
            initMap();
        }
    }, []);

    const moveMapTo = (location, title, formatted_address = '') => {
        if (!location) return;
        mapInstance.current.setCenter(location);
        markerRef.current.setPosition(location);
        setLatitude(location.lat().toFixed(6));
        setLongitude(location.lng().toFixed(6));
        setResultType(`${title} ${formatted_address}`);
    };

    const handleSmartSearch = () => {
        const input = searchInputRef.current.value.trim();
        const latLngPattern = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
        const match = input.match(latLngPattern);

        if (match) {
            // Handle lat, lng
            const lat = parseFloat(match[1]);
            const lng = parseFloat(match[3]);

            if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                alert("Invalid latitude or longitude values.");
                return;
            }

            const location = new window.google.maps.LatLng(lat, lng);
            moveMapTo(location, "Coordinates Search");

            geocoder.current.geocode({ location }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    moveMapTo(location, "", results[0].formatted_address);
                }
            });
        } else {
            // Handle text address/landmark
            const request = {
                query: input,
                fields: ['name', 'geometry'],
            };

            service.current.findPlaceFromQuery(request, (results, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && results[0]) {
                    moveMapTo(results[0].geometry.location, "Landmark Search", results[0].name);
                } else {
                    setResultType("No results found. Please try again.");
                    setLatitude("N/A");
                    setLongitude("N/A");
                }
            });
        }
    };

    return (
        <div> {loading && <Loader />}
            <div className="card">
                <div className="card-header layout_btn_color" >
                    <h5 className="card-title" style={{ textAlign: 'center' }}>Layout & Individual sites Details</h5>
                </div>
                <div className="card-body">
                    <fieldset disabled={isAddDisabled}>
                        <div className="row align-items-center mb-3">
                            <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 mb-3">
                                <div className="form-group">
                                    <label htmlFor="totalArea" className="col-form-label fw-semibold">
                                        Total Area of the layout  <span className='mandatory_color'>*</span>
                                    </label>
                                    <div className="input-group">
                                        <input
                                            type="tel"
                                            className="form-control"
                                            placeholder="Enter the total are of the layout"
                                            value={eastwestFeet}
                                            maxLength={10}
                                            onChange={handleEastwestFeetChange}
                                        />
                                        <span className="input-group-text">Feet</span>

                                    </div>{eastwestError && <div className="text-danger">{eastwestError}</div>}
                                </div>
                            </div>

                            <div className='col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 mb-3'>
                                <div className="form-group mt-2">
                                    <label className='form-label'>
                                        Total number of sites <span className='mandatory_color'>*</span>
                                    </label>
                                    <input
                                        type="text" ref={layoutSiteCountRef}
                                        className="form-control"
                                        placeholder="Enter Total number of sites"
                                        value={layoutSiteCount}
                                        maxLength={15}
                                        onChange={handleLayoutSiteCountChange}
                                    />
                                    {layoutSiteCountError && (
                                        <small className="text-danger">{layoutSiteCountError}</small>
                                    )}
                                </div>
                            </div>

                        </div>


                        <hr className='mt-1' style={{ border: '1px dashed #0077b6' }} />
                        <h4 className='fw-bold fs-7'>Site / Plot wise Details &nbsp;&nbsp;<label className='text-danger' style={{ fontSize: '14px' }}>[ Note: Please enter Correctly as eKhata will be issued as per this ]</label></h4>


                        <div className="row mt-4">
                            <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 mb-3">
                                <div className="row ">
                                    <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 ">
                                        <div className="form-check">
                                            <input className="form-check-input me-2 radioStyle"
                                                type="radio"
                                                value="regular"
                                                checked={shape === "regular"}
                                                onChange={() => setShape("regular")}
                                            />
                                            <label className="form-check-label fw-bold">Regular Shape</label>
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 ">
                                        <div className="form-check">
                                            <input className="form-check-input me-2 radioStyle"
                                                type="radio"
                                                value="irregular"
                                                checked={shape === "irregular"}
                                                onChange={() => setShape("irregular")}
                                            />
                                            <span className="form-check-label fw-bold">Irregular Shape</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {shape === "regular" && (
                            <div className="container mt-3">
                                {/* Conditionally render the Fetch Previous checkbox with custom styling */}
                                {siteData.length > 0 && (
                                    <div className="row">
                                        <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                            <div className="form-check">
                                                <input
                                                    type="checkbox"
                                                    id="fetchPrevious"
                                                    className="form-check-input custom-checkbox"
                                                    checked={isChecked}
                                                    onChange={(e) => {
                                                        setIsChecked(e.target.checked);
                                                        handleFetchPrevious(e);
                                                    }}
                                                />
                                                <label className="form-check-label custom-label" htmlFor="fetchPrevious">
                                                    Same as Previous site details
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}



                                <div className="row align-items-center mb-3 mt-4">
                                    {/* Site Number */}
                                    <div className='col-md-6'>
                                        <div className="form-group mt-2">
                                            <label className='form-label'>
                                                Site Number <span className='mandatory_color'>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter site number"
                                                value={regular_siteNumber}
                                                maxLength={15}
                                                ref={siteNumberRef}
                                                onChange={handleRegular_SiteNumberChange}
                                            />
                                            {regular_siteNumberError && (
                                                <small className="text-danger">{regular_siteNumberError}</small>
                                            )}
                                        </div>
                                    </div>
                                    {/* Block/Area */}
                                    <div className='col-md-6'>
                                        <div className="form-group mt-2">
                                            <label className='form-label'>Block/Area <span className='mandatory_color'>*</span></label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter block/area"
                                                value={blockArea}
                                                ref={blockAreaRef}
                                                onChange={handleRegular_BlockAreaChange}
                                            />
                                            {blockAreaError && (
                                                <small className="text-danger">{blockAreaError}</small>
                                            )}
                                        </div>
                                    </div>
                                    <hr />
                                    <div className="container ">
                                        <h4 className="mb-4">Enter Side Details</h4>
                                        {/* East-west side length */}
                                        <div className='row mb-3'>

                                            <div className='col-12 col-sm-12 col-md-12 col-lg-2 col-xl-2 mb-3'>
                                                <label className="form-label fw-bold ">East-West side Length  <span className='mandatory_color'>*</span></label>
                                            </div>
                                            <div className="col-12 col-sm-12 col-md-5 col-lg-3 col-xl-3 mb-3">
                                                <div className="form-group">

                                                    <div className="input-group">
                                                        <input
                                                            type="tel"
                                                            className="form-control"
                                                            placeholder="Enter the east-west side length"
                                                            value={eastwestFeet}
                                                            ref={eastwestFeetRef}
                                                            maxLength={10}
                                                            onChange={handleEastwestFeetChange}
                                                        />
                                                        <span className="input-group-text">Feet</span>

                                                    </div>{eastwestError && <div className="text-danger">{eastwestError}</div>}
                                                </div>
                                            </div>
                                            <div className="col-6 col-sm-6 col-md-2 col-lg-1 col-xl-1 mb-3 text-center">
                                                <div className="form-group ">
                                                    <label className="form-label fw-bold">Or</label>
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-12 col-md-5 col-lg-3 col-xl-3 mb-3">
                                                <div className="form-group">

                                                    <div className="input-group">
                                                        <input
                                                            type="tel"
                                                            className="form-control"
                                                            placeholder="Enter the east-west side length"
                                                            value={eastwestMeter}
                                                            maxLength={10}
                                                            ref={eastwestFeetRef}
                                                            onChange={handleEastwestMeterChange}
                                                        />
                                                        <span className="input-group-text">Meter</span>

                                                    </div>
                                                    {eastwestError && <div className="text-danger">{eastwestError}</div>}
                                                </div>
                                            </div>
                                            <div className="col-6 col-sm-6 col-md-6 col-lg-1 col-xl-1 mb-3">
                                                <div className="form-group ">
                                                    <label className="form-label fw-bold">Road Facing  <span className='mandatory_color'>*</span></label>
                                                </div>
                                            </div>
                                            <div className="col-6 col-sm-6 col-md-6 col-lg-2 col-xl-2 mb-3">
                                                <div className="form-group ">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="form-check">

                                                            <input
                                                                type="radio"
                                                                className="form-check-input me-2 radioStyle"
                                                                name="roadFacingEastWest"  // Updated name
                                                                checked={side1RoadFacing === true}
                                                                ref={side1RoadRef}
                                                                onChange={() => {
                                                                    setSide1RoadFacing(true);
                                                                    setSide1RoadError('');
                                                                }}
                                                            />
                                                            <label className="form-check-label">Yes</label>
                                                        </div>
                                                        <div className="form-check">
                                                            <input
                                                                type="radio"
                                                                className="form-check-input me-2 radioStyle"
                                                                name="roadFacingEastWest"  // Updated name
                                                                ref={side1RoadRef}
                                                                checked={side1RoadFacing === false}
                                                                onChange={() => {
                                                                    setSide1RoadFacing(false);
                                                                    setSide1RoadError('');
                                                                }}
                                                            />
                                                            <label className="form-check-label">No</label>
                                                        </div>
                                                    </div>
                                                    {side1RoadError && <div className="text-danger">{side1RoadError}</div>}
                                                </div>
                                            </div>
                                        </div>
                                        {/* North-South side length */}
                                        <div className='row mb-3'>

                                            <div className='col-12 col-sm-12 col-md-12 col-lg-2 col-xl-2 mb-3'>
                                                <label className="form-label fw-bold ">North-South side Length  <span className='mandatory_color'>*</span></label>
                                            </div>
                                            <div className="col-12 col-sm-12 col-md-5 col-lg-3 col-xl-3 mb-3">
                                                <div className="form-group">

                                                    <div className="input-group">
                                                        <input
                                                            type="tel"
                                                            className="form-control"
                                                            placeholder="Enter the north-south side length"
                                                            value={northsouthFeet}
                                                            maxLength={10}
                                                            ref={northsouthFeetRef}
                                                            onChange={handleNorthsouthFeetChange}
                                                        />
                                                        <span className="input-group-text">feet</span>
                                                    </div>{northsouthError && <div className="text-danger">{northsouthError}</div>}
                                                </div>
                                            </div>
                                            <div className="col-6 col-sm-6 col-md-2 col-lg-1 col-xl-1 mb-3 text-center">
                                                <div className="form-group ">
                                                    <label className="form-label fw-bold">Or</label>

                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-12 col-md-5 col-lg-3 col-xl-3 mb-3">
                                                <div className="form-group">

                                                    <div className="input-group">
                                                        <input
                                                            type="tel"
                                                            className="form-control"
                                                            placeholder="Enter the north-south side length"
                                                            value={northsouthMeter}
                                                            ref={northsouthFeetRef}
                                                            maxLength={10}
                                                            onChange={handleNorthsouthMeterChange}
                                                        />
                                                        <span className="input-group-text">Meter</span>
                                                    </div>
                                                    {northsouthError && <div className="text-danger">{northsouthError}</div>}
                                                </div>
                                            </div>
                                            <div className="col-6 col-sm-6 col-md-6 col-lg-1 col-xl-1 mb-3">
                                                <div className="form-group ">
                                                    <label className="form-label fw-bold">Road Facing  <span className='mandatory_color'>*</span></label>
                                                </div>
                                            </div>
                                            <div className="col-6 col-sm-6 col-md-6 col-lg-2 col-xl-2 mb-3">
                                                <div className="form-group ">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="form-check">
                                                            <input
                                                                type="radio"
                                                                className="form-check-input me-2 radioStyle"
                                                                name="roadFacingNorthSouth"  // Updated name
                                                                checked={side2RoadFacing === true}
                                                                ref={side2RoadRef}
                                                                onChange={() => {
                                                                    setSide2RoadFacing(true);
                                                                    setSide2RoadError('');
                                                                }}
                                                            />
                                                            <label className="form-check-label">Yes</label>
                                                        </div>
                                                        <div className="form-check">
                                                            <input
                                                                type="radio"
                                                                className="form-check-input me-2 radioStyle"
                                                                name="roadFacingNorthSouth"  // Updated name
                                                                checked={side2RoadFacing === false}
                                                                ref={side2RoadRef}
                                                                onChange={() => {
                                                                    setSide2RoadFacing(false);
                                                                    setSide2RoadError('');
                                                                }}
                                                            />
                                                            <label className="form-check-label">No</label>
                                                        </div>
                                                    </div>
                                                    {side2RoadError && <div className="text-danger">{side2RoadError}</div>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row align-items-center mb-3">
                                        {/* Area */}
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-3 col-xl-3 mb-3">
                                            <label className="form-label">Area</label>
                                            <div className="input-group">
                                                <div className="input-group">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Area"
                                                        value={regularAreaSqFt}
                                                        readOnly
                                                    />
                                                    <span className="input-group-text">sq.ft</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-3 col-xl-3 mb-3">
                                            <label className="form-label">&nbsp;</label>
                                            <div className="input-group">
                                                <div className="input-group">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Area"
                                                        value={regularAreaSqM}
                                                        readOnly
                                                    />
                                                    <span className="input-group-text">sq.mtr</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Corner Site */}
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-3 col-xl-3 mb-3">
                                            <label className="form-label fw-bold">Corner Site <span className='mandatory_color'>*</span></label>
                                            <div className="d-flex align-items-center gap-3 text-center">
                                                <div className="row w-100">
                                                    <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 ">
                                                        <div className="form-check">
                                                            <input
                                                                type="radio"
                                                                className="form-check-input me-2 radioStyle"
                                                                name="cornerSite"
                                                                value="yes"
                                                                checked={cornerSite === "yes"}
                                                                ref={cornerSiteRef}
                                                                onChange={() => {
                                                                    setCornerSite("yes");
                                                                    setCornerSiteError('');
                                                                }}
                                                            />
                                                            <label className="form-check-label">Yes</label>
                                                        </div>
                                                    </div>
                                                    <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 ">
                                                        <div className="form-check">
                                                            <input
                                                                type="radio"
                                                                className="form-check-input me-2 radioStyle"
                                                                name="cornerSite"
                                                                value="no"
                                                                ref={cornerSiteRef}
                                                                checked={cornerSite === "no"}
                                                                onChange={() => {
                                                                    setCornerSite("no");
                                                                    setCornerSiteError('');
                                                                }}
                                                            />
                                                            <label className="form-check-label">No</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {cornerSiteError && <div className="text-danger">{cornerSiteError}</div>}
                                        </div>
                                        {/* Type of Site Dropdown */}
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-3 col-xl-3">
                                            <label className="form-label">Type of Site <span className='mandatory_color'>*</span></label>
                                            <div className="d-flex align-items-center gap-3">
                                                <select
                                                    className="form-select"
                                                    value={siteType}
                                                    ref={siteTypeRef}
                                                    onChange={(e) => {
                                                        setSiteType(e.target.value);
                                                        if (e.target.value !== '') {
                                                            setSiteTypeError('');
                                                        }
                                                    }}
                                                >
                                                    <option value="">Select Site Type</option>
                                                    <option value="civicamenity">Civic Amenity</option>
                                                    <option value="commercial">Commercial</option>
                                                    <option value="industrial">Industrial</option>
                                                    <option value="park">Park</option>
                                                    <option value="residential">Residential</option>
                                                    <option value="sump">Sump</option>
                                                </select>

                                            </div>
                                            {siteTypeError && (
                                                <small className="text-danger">{siteTypeError}</small>
                                            )}
                                        </div>
                                        {/* Chak Bandi details */}
                                        <h5 className='mt-5'>Chakbandi Details</h5>
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-3 col-xl-3 mt-3">
                                            <label className="form-label">East <span className='mandatory_color'>*</span></label>
                                            <div className="input-group">
                                                <input
                                                    type="text"
                                                    className="form-control" placeholder='Enter the chakbandi east side details'
                                                    value={chakbandiEast}
                                                    ref={chakbandiEastRef}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (/^[a-zA-Z0-9.,\/\\#\s]*$/.test(value)) {
                                                            setChakbandiEast(value);
                                                            setChakbandiEastError("");
                                                        } else {
                                                            setChakbandiEastError("Only letters, numbers, space and . , / \\ # are allowed");
                                                        }
                                                    }}
                                                />
                                            </div>
                                            {chakbandiEastError && (
                                                <small className="text-danger">{chakbandiEastError}</small>
                                            )}
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-3 col-xl-3 mt-3">
                                            <label className="form-label">West <span className='mandatory_color'>*</span></label>
                                            <div className="input-group">

                                                <input
                                                    type="text"
                                                    className="form-control" placeholder='Enter the chakbandi west side details'
                                                    value={chakbandiWest}
                                                    ref={chakbandiWestRef}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (/^[a-zA-Z0-9.,\/\\#\s]*$/.test(value)) {
                                                            setChakbandiWest(value);
                                                            setChakbandiWestError("");
                                                        } else {
                                                            setChakbandiWestError("Only letters, numbers, space and . , / \\ # are allowed");
                                                        }
                                                    }}
                                                />
                                            </div>
                                            {chakbandiWestError && (
                                                <small className="text-danger">{chakbandiWestError}</small>
                                            )}
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-3 col-xl-3 mt-3">
                                            <label className="form-label">South <span className='mandatory_color'>*</span></label>
                                            <div className="input-group">
                                                <input
                                                    type="text"
                                                    className="form-control" placeholder='Enter the chakbandi south side details'
                                                    value={chakbandiSouth}
                                                    ref={chakbandiSouthRef}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (/^[a-zA-Z0-9.,\/\\#\s]*$/.test(value)) {
                                                            setChakbandiSouth(value);
                                                            setChakbandiSouthError("");
                                                        } else {
                                                            setChakbandiSouthError("Only letters, numbers, space and . , / \\ # are allowed");
                                                        }
                                                    }}
                                                />
                                            </div>
                                            {chakbandiSouthError && (
                                                <small className="text-danger">{chakbandiSouthError}</small>
                                            )}
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-3 col-xl-3 mt-3">
                                            <label className="form-label">North <span className='mandatory_color'>*</span></label>
                                            <div className="input-group">

                                                <input
                                                    type="text"
                                                    className="form-control" placeholder='Enter the chakbandi north side details'
                                                    value={chakbandiNorth}
                                                    ref={chakbandiNorthRef}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (/^[a-zA-Z0-9.,\/\\#\s]*$/.test(value)) {
                                                            setChakbandiNorth(value);
                                                            setChakbandiNorthError("");
                                                        } else {
                                                            setChakbandiNorthError("Only letters, numbers, space and . , / \\ # are allowed");
                                                        }
                                                    }}
                                                />
                                            </div>
                                            {chakbandiNorthError && (
                                                <small className="text-danger">{chakbandiNorthError}</small>
                                            )}
                                        </div>
                                    </div>

                                </div>

                            </div>
                        )}
                        {shape === "irregular" && (
                            <div className="container mt-3">
                                <div className="row align-items-center mb-3">
                                    {/* Site Number */}
                                    <div className='col-md-6'>
                                        <div className="form-group mt-2">
                                            <label className='form-label'>
                                                Site / Plot No <span className='mandatory_color'>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter Site / Plot number"
                                                value={irregular_siteNumber}
                                                maxLength={15}
                                                onChange={handleirRegular_SiteNumberChange}
                                            />
                                            {irregular_siteNumberError && (
                                                <small className="text-danger">{irregular_siteNumberError}</small>
                                            )}
                                        </div>
                                    </div>
                                    {/* Block/Area */}
                                    <div className='col-md-6'>
                                        <div className="form-group mt-2">
                                            <label className='form-label'>Block/Area <span className='mandatory_color'>*</span></label>
                                            <input type="text"
                                                className="form-control"
                                                maxLength={100}
                                                placeholder="Enter block/area"
                                                value={irregular_blockArea}
                                                onChange={handleirRegular_BlockAreaChange} />
                                        </div>{irregular_blockAreaError && <p style={{ color: 'red' }}>{irregular_blockAreaError}</p>}
                                    </div>
                                    {/* No of sides of the sites or plot */}
                                    <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 ">
                                        <div className="form-group mt-2">
                                            <label className="form-label">No of sides of the site / plot <small style={{ color: 'gray' }}>(Can add a minimum of 3 sides and a maximum of 9 sides only.)</small><span className='mandatory_color'>*</span></label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter no of sides"
                                                value={numSides}
                                                onChange={handleNumSidesChange}
                                                maxLength="1"
                                            />{numSidesError && <small className="text-danger">{numSidesError}</small>}

                                        </div>

                                    </div>
                                    <div className=" mt-3">
                                        {sides.map((side, index) => (
                                            <div key={side.id} className='row'>

                                                {/* Label */}
                                                <div className='col-6 col-sm-6 col-md-2 col-lg-2 col-xl-2'>
                                                    <label className="form-label fw-bold">Side {side.id} Length <span className='mandatory_color'>*</span></label>
                                                </div>
                                                {/* Feet input */}
                                                <div className="col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3">
                                                    <div className="input-group">
                                                        <input
                                                            type="tel"
                                                            className="form-control"
                                                            placeholder={`Enter the side ${side.id} Length`}
                                                            value={side.lengthInFeet}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (/^(?:[1-9][0-9]*)(?:\.\d*)?$/.test(value) || value === "") {
                                                                    handleLengthInFeetChange(index, value);
                                                                }
                                                            }}
                                                        />
                                                        <span className="input-group-text">feet</span>
                                                    </div>
                                                    {sideErrors[index]?.length && (
                                                        <div className="text-danger mt-1">{sideErrors[index].length}</div>
                                                    )}
                                                </div>
                                                {/* "or" label */}
                                                <div className="col-12 col-sm-12 col-md-1 col-lg-1 col-xl-1  text-center">
                                                    <label className="form-label fw-bold">or</label>
                                                </div>

                                                {/* Meter input */}
                                                <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mb-3 ">
                                                    <div className="input-group">
                                                        <input
                                                            type="tel"
                                                            className="form-control" placeholder={`Enter the side ${side.id} Length`}
                                                            value={side.lengthInMeter}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (/^(?:[1-9][0-9]*)(?:\.\d*)?$/.test(value) || value === "") {
                                                                    handleLengthInMeterChange(index, value);
                                                                }
                                                            }}
                                                        />
                                                        <span className="input-group-text">meter</span>
                                                    </div>
                                                </div>

                                                {/* Road Facing */}
                                                <div className="col-6 col-sm-6 col-md-1 col-lg-1 col-xl-1 mb-3">
                                                    <label className="form-label fw-bold">Road Facing <span className='mandatory_color'>*</span></label>
                                                </div>
                                                <div className="col-6 col-sm-6 col-md-2 col-lg-2 col-xl-2 mb-3">
                                                    <div className="d-flex gap-2">
                                                        <div className="form-check">
                                                            <input
                                                                type="radio"
                                                                className="form-check-input"
                                                                name={`roadFacing${side.id}`}
                                                                checked={side.roadFacing === true}
                                                                onChange={() => handleRoadFacingChange(index, true)}
                                                            />
                                                            <label className="form-check-label">Yes</label>
                                                        </div>
                                                        <div className="form-check">
                                                            <input
                                                                type="radio"
                                                                className="form-check-input"
                                                                name={`roadFacing${side.id}`}
                                                                checked={side.roadFacing === false}
                                                                onChange={() => handleRoadFacingChange(index, false)}
                                                            />
                                                            <label className="form-check-label">No</label>
                                                        </div>
                                                    </div>
                                                    {sideErrors[index]?.roadFacing && (
                                                        <div className="text-danger mt-1">{sideErrors[index].roadFacing}</div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                    </div>
                                    {/* Area of site / plot */}
                                    <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mb-3">
                                        <label className="form-label">Area <span className='mandatory_color'>*</span></label>
                                        <div className="input-group">
                                            <input
                                                type="tel"
                                                className="form-control"
                                                placeholder="Area"
                                                value={irregularAreaSqFt}
                                                onChange={handleSqFtChange}
                                            />
                                            <span className="input-group-text">sq.ft</span>
                                        </div>
                                        {irregularAreaSqft_sqM_error && <small className='text-danger'>{irregularAreaSqft_sqM_error}</small>}
                                    </div>
                                    <div className="col-12 col-sm-12 col-md-1 col-lg-1 col-xl-1 mb-3 text-center">
                                        <div className="form-group "><br />
                                            <label className="form-label fw-bold">or</label>
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mb-3">
                                        <label className="form-label">&nbsp;</label>
                                        <div className="input-group">
                                            <input
                                                type="tel"
                                                className="form-control"
                                                placeholder="Area"
                                                value={irregularAreaSqM}
                                                onChange={handleSqMChange}
                                            />
                                            <span className="input-group-text">sq.mtr</span>
                                        </div>
                                    </div>
                                    {/* Corner Site */}
                                    <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 mb-3">
                                        <label className="form-label fw-bold">Corner Site <span className='mandatory_color'>*</span></label>
                                        <div className="d-flex align-items-center gap-3 text-center">
                                            <div className="row w-100">
                                                <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 ">
                                                    <div className="form-check">
                                                        <input
                                                            type="radio"
                                                            className="form-check-input me-2 radioStyle"
                                                            name="cornerSite"
                                                            value="yes"
                                                            checked={irregularcornerSite === "yes"}
                                                            onChange={() => {
                                                                setIrregularCornerSite("yes");
                                                                setIrregularCornerSiteError('');
                                                            }}
                                                        />
                                                        <label className="form-check-label">Yes</label>
                                                    </div>
                                                </div>
                                                <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 ">
                                                    <div className="form-check">
                                                        <input
                                                            type="radio"
                                                            className="form-check-input me-2 radioStyle"
                                                            name="cornerSite"
                                                            value="no"
                                                            checked={irregularcornerSite === "no"}
                                                            onChange={() => {
                                                                setIrregularCornerSite("no");
                                                                setIrregularCornerSiteError('');
                                                            }}
                                                        />
                                                        <label className="form-check-label">No</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {irregularcornerSiteError && <div className="text-danger">{irregularcornerSiteError}</div>}
                                    </div>
                                    {/* Type of Site Dropdown */}
                                    <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3">
                                        <label className="form-label">Type of Site <span className='mandatory_color'>*</span></label>
                                        <div className="d-flex align-items-center gap-3">
                                            <select
                                                className="form-select"
                                                value={irregularsiteType}
                                                onChange={(e) => {
                                                    setIrregularsiteType(e.target.value);
                                                    if (e.target.value !== '') {
                                                        setIrregularsiteTypeError('');
                                                    }
                                                }}
                                            >
                                                <option value="">Select Site Type</option>
                                                <option value="civicamenity">Civic Amenity</option>
                                                <option value="commercial">Commercial</option>
                                                <option value="industrial">Industrial</option>
                                                <option value="park">Park</option>
                                                <option value="residential">Residential</option>
                                                <option value="sump">Sump</option>
                                            </select>

                                        </div>
                                        {irregularsiteTypeError && (
                                            <small className="text-danger">{irregularsiteTypeError}</small>
                                        )}
                                    </div>

                                    <h5 className='mt-5'>Chakbandi Details</h5>
                                    {/* Chak Bandi details */}
                                    <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mt-3">
                                        <label className="form-label">East <span className='mandatory_color'>*</span></label>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control" placeholder='Enter the chakbandi east side details'
                                                value={irregularchakbandiEast}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (/^[a-zA-Z0-9.,\/\\#\s]*$/.test(value)) {
                                                        setIrregularChakbandiEast(value);
                                                        setIrregularChakbandiEastError("");
                                                    } else {
                                                        setIrregularChakbandiEastError("Only letters, numbers, space and . , / \\ # are allowed");
                                                    }
                                                }}
                                            />
                                        </div>
                                        {irregularchakbandiEastError && (
                                            <small className="text-danger">{irregularchakbandiEastError}</small>
                                        )}
                                    </div>
                                    <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mt-3">
                                        <label className="form-label">West <span className='mandatory_color'>*</span></label>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control" placeholder='Enter the chakbandi West side details'
                                                value={irregularchakbandiWest}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (/^[a-zA-Z0-9.,\/\\#\s]*$/.test(value)) {
                                                        setIrregularChakbandiWest(value);
                                                        setIrregularChakbandiWestError("");
                                                    } else {
                                                        setIrregularChakbandiWestError("Only letters, numbers, space and . , / \\ # are allowed");
                                                    }
                                                }}
                                            />
                                        </div>
                                        {irregularchakbandiWestError && (
                                            <small className="text-danger">{irregularchakbandiWestError}</small>
                                        )}
                                    </div>
                                    <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mt-3">
                                        <label className="form-label">North <span className='mandatory_color'>*</span></label>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control" placeholder='Enter the chakbandi North side details'
                                                value={irregularchakbandiNorth}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (/^[a-zA-Z0-9.,\/\\#\s]*$/.test(value)) {
                                                        setIrregularChakbandiNorth(value);
                                                        setIrregularChakbandiNorthError("");
                                                    } else {
                                                        setIrregularChakbandiNorthError("Only letters, numbers, space and . , / \\ # are allowed");
                                                    }
                                                }}
                                            />
                                        </div>
                                        {irregularchakbandiNorthError && (
                                            <small className="text-danger">{irregularchakbandiNorthError}</small>
                                        )}
                                    </div>
                                    <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mt-3">
                                        <label className="form-label">South <span className='mandatory_color'>*</span></label>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control" placeholder='Enter the chakbandi south side details'
                                                value={irregularchakbandiSouth}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (/^[a-zA-Z0-9.,\/\\#\s]*$/.test(value)) {
                                                        setIrregularChakbandiSouth(value);
                                                        setIrregularChakbandiSouthError("");
                                                    } else {
                                                        setIrregularChakbandiSouthError("Only letters, numbers, space and . , / \\ # are allowed");
                                                    }
                                                }}
                                            />
                                        </div>
                                        {irregularchakbandiSouthError && (
                                            <small className="text-danger">{irregularchakbandiSouthError}</small>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </fieldset>
                </div>
            </div>
            <div className="card">
                <div className="card-header layout_btn_color" >
                    <h5 className="card-title" style={{ textAlign: 'center' }}>Find Layout on Google Map & tap in middle of site to capture sites GPS</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
                            <b>Search using nearest landmark near your layout - once you zoom there then locate your individual layout & tap on top middle of your layout</b>
                            <br /><span>Note : Search nearest landmark & then find layout & site near the landmark</span>
                            <br />
                        </div>
                        <div className="col-md-12 col-lg-12 col-sm-12 mb-4 position-relative mt-2">
                            <div className='row'>
                                <div className="col-md-10 col-lg-10 col-sm-12 col-xl-10 col-12">
                                    <input ref={searchInputRef} className="form-control autocomplete-container" type="text" placeholder="Search nearest landmark near your layout" />
                                </div>
                                <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 ">
                                    <button onClick={handleSmartSearch} className="btn btn-primary">Search</button>
                                </div>
                            </div>


                        </div>
                        <div className="col-md-12 col-lg-12 col-sm-12 mb-3">
                            <div id="map" ref={mapRef} style={{ height: "500px" }}></div>
                        </div>
                        <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
                            <div className="row p-3  rounded shadow-sm">
                                {/* Result Type */}
                                <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 mb-2 text-center">
                                    <span id="resultType" className="fw-bold text-primary fs-5">{resultType}</span>
                                </div>
                                {resultTypeError && (
                                    <div className="text-danger text-center mt-1">{resultTypeError}</div>
                                )}

                                {/* Latitude */}
                                <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6   text-center mb-2">
                                    <span className="fw-semibold text-dark">
                                        Latitude: <label className="text-success" ref={latitudeRef}>{latitude}</label>
                                    </span>
                                </div>
                                {latitudeerror && <div className="text-danger">{latitudeerror}</div>}

                                {/* Longitude */}
                                <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6   text-center">
                                    <span className="fw-semibold text-dark">
                                        Longitude: <label className="text-success" ref={longitudeRef}>{longitude}</label>
                                    </span>
                                </div>
                                {longitudeerror && <div className="text-danger">{longitudeerror}</div>}
                                {/* Owner Name */}
                                <div className="col-md-12 col-lg-12 col-sm-12 text-center">
                                    <span className="fw-semibold text-dark">
                                        Owner Name : <label className="text-success">ownerName</label>
                                    </span>
                                </div>


                            </div>
                        </div>
                        <div className="col-0 col-sm-0 col-md-9 col-lg-9 col-xl-9 mt-3"></div>

                        <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mt-3">
                            <button className="btn btn-primary btn-block mt-3" onClick={() => handle_AddRow(shape)}>
                                Add Site
                            </button>
                        </div>


                    </div>

                </div>

            </div>

            {/* <IndividualRegularTable data={shape === "regular" ? siteData : irregularsiteData} /> */}
            {allSites.length > 0 && (
                <IndividualRegularTable
                    data={allSites} setData={setAllSites}
                    totalSitesCount={totalSitesCount}
                    onSave={Save_Handler}
                    onEdit={Edit_Handler}
                />
            )}


        </div>
    );
};
const IndividualRegularTable = ({ data, setData, totalSitesCount, onSave, onEdit }) => {

    useEffect(() => {
        console.log("🔍 Data received in IndividualRegularTable:", data);
    }, [data]);
    const { loading, start_loader, stop_loader } = useLoader(); // Use loader context

    const totalAddedSites = data.length;
    const handleDeleteRow = (id) => {
        console.log("Before deletion:", data);
        let updatedData = [];
        setData(prevData => {

            prevData.forEach(item => {
                if (item.id !== id) {
                    updatedData.push(item);
                }
            });
            return updatedData;
        });
        console.log("After deletion:", updatedData);

    };
    const columns = React.useMemo(
        () => [
            {
                Header: "Action",
                id: "delete",
                Cell: ({ row }) => {
                    console.log("Row original:", row.original.id);  // 👈 Add this for debugging
                    return (
                        <button
                            className='btn btn-danger'
                            onClick={() => handleDeleteRow(row.original.id)}
                        >
                            <i className="fa fa-trash"></i>
                        </button>
                    );
                },
            }, {
                Header: "S.No",
                id: "serialNo",
                accessor: (row, index) => index + 1,
            },


            {
                Header: "Shape",
                accessor: "regularShape",
            },
            {
                Header: "Site Number",
                accessor: "siteNumber",
            },
            {
                Header: "Block/Area",
                accessor: "blockArea",
            },
            {
                Header: "Number of sides",
                accessor: (row) => {
                    if (row.regularShape === "Irregular") {
                        return `${row.numberOfSides} `;
                    } else {
                        return `2`;
                    }
                },
            },
            {
                Header: "Dimension",
                accessor: (row) => {
                    if (row.regularShape === "Regular") {
                        return (
                            <>
                                {row.eastwestFeet} x {row.northsouthFeet} (ft)<br />
                                {row.eastwestMeter} x {row.northsouthMeter} (mtr)<br />
                                Road Facing: {row.eastwestRoadFacing ? "Yes" : "No"}, {row.northsouthRoadFacing ? "Yes" : "No"}
                            </>
                        );
                    } else if (row.regularShape === "Irregular" && Array.isArray(row.sides)) {
                        const feetString = row.sides.map(side => `${side.lengthInFeet} `).join(' x ');
                        const meterString = row.sides.map(side => `${side.lengthInMeter} `).join(' x ');
                        const roadFacingString = row.sides.map(side => side.roadFacing ? "Yes" : "No").join(', ');

                        return (
                            <div>
                                <div>{feetString} (ft)</div>
                                <div>{meterString} (m)</div>
                                <div>Road Facing: {roadFacingString}</div>
                            </div>
                        );
                    }
                    else {
                        return "N/A";
                    }
                },
            },

            {
                Header: "Total Area",
                accessor: (row) => {
                    if (row.regularShape === "Irregular") {
                        return `${row.irregularAreaSqFt} [Sq.ft], ${row.irregularAreaSqM} [Sq.mtr]`;
                    } else {
                        return `${row.regularAreaSqFt} [Sq.ft], ${row.regularAreaSqM} [Sq.mtr]`;
                    }
                },
            },
            {
                Header: "Corner Site",
                accessor: "cornerSite",
            },
            {
                Header: "Type of Site",
                accessor: "siteType",
            },
            {
                id: "chakbandi",  // 👈 you must add this
                Header: (
                    <>
                        Chakbandi<br />
                        [East | West | South | North]
                    </>
                ),
                accessor: (row) => {
                    return `${row.chakbandiEast} | ${row.chakbandiWest} | ${row.chakbandiSouth} | ${row.chakbandiNorth}`;
                },
            },
            {
                Header: "Latitude, Longitude",
                accessor: (row) => {
                    return `${row.latitude}, ${row.longitude}`;
                },
            },
        ],
        []
    );
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        page,
        prepareRow,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        state: { pageIndex, pageSize },
    } = useTable(
        {
            columns,
            data,
            initialState: { pageIndex: 0, pageSize: 5 },
        },
        usePagination
    );
    const paginationBtnStyle = {
        padding: "6px 12px",
        borderRadius: "6px",
        border: "1px solid #d1d5db",
        backgroundColor: "#f3f4f6",
        color: "#1f2937",
        cursor: "pointer",
        transition: "background-color 0.2s",
        fontWeight: "500",
        margin: "0 2px",
    };
    const disabledBtnStyle = {
        ...paginationBtnStyle,
        backgroundColor: "#e5e7eb",
        cursor: "not-allowed",
        opacity: 0.6,
    };

    return (
        <div className="card">
            {loading && <Loader />}
            <div className="card-header layout_btn_color" >
                <h5 className="card-title" style={{ textAlign: 'center' }}>Layout & Individual sites Details</h5>
            </div>
            <div className="card-body">
                <div style={{ overflowX: "auto", padding: "1rem" }}>
                    <table
                        {...getTableProps()}
                        style={{
                            borderCollapse: "collapse",
                            width: "100%",
                            minWidth: "1500px",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                        }}
                    >
                        <thead>
                            {headerGroups.map((headerGroup, idx) => (
                                <tr {...headerGroup.getHeaderGroupProps()} key={idx} style={{ backgroundColor: "#f9fafb" }}>
                                    {headerGroup.headers.map((column, i) => (
                                        <th
                                            {...column.getHeaderProps()}
                                            key={i}
                                            colSpan={column.columns ? column.columns.length : 1}
                                            style={{
                                                border: "1px solid #e5e7eb",
                                                padding: "12px 16px",
                                                fontWeight: "600",
                                                textAlign: "center",
                                                backgroundColor: "#f3f4f6",
                                                color: "#374151",
                                            }}
                                        >
                                            {column.render("Header")}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody {...getTableBodyProps()}>
                            {page.map((row, rowIndex) => {
                                prepareRow(row);
                                return (
                                    <tr
                                        {...row.getRowProps()}
                                        key={rowIndex}
                                        style={{
                                            backgroundColor: rowIndex % 2 === 0 ? "#ffffff" : "#f9fafb",
                                            transition: "background 0.3s",
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e5e7eb")}
                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = rowIndex % 2 === 0 ? "#ffffff" : "#f9fafb")}
                                    >
                                        {row.cells.map((cell, cellIndex) => (
                                            <td
                                                {...cell.getCellProps()}
                                                key={cellIndex}
                                                style={{
                                                    border: "1px solid #e5e7eb",
                                                    padding: "10px",
                                                    textAlign: "center",
                                                    color: "#374151",
                                                }}
                                            >
                                                {cell.render("Cell")}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    <div
                        style={{
                            marginTop: "1rem",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "10px",
                        }}
                    >
                        <div>
                            Page <strong>{pageIndex + 1} of {pageOptions.length}</strong>
                        </div>

                        <div style={{ display: "flex", gap: "5px" }}>
                            <button disabled={!canPreviousPage} onClick={() => gotoPage(0)} style={paginationBtnStyle}>{`<<`}</button>
                            <button disabled={!canPreviousPage} onClick={() => previousPage()} style={paginationBtnStyle}>{`<`}</button>
                            <button disabled={!canNextPage} onClick={() => nextPage()} style={paginationBtnStyle}>{`>`}</button>
                            <button disabled={!canNextPage} onClick={() => gotoPage(pageCount - 1)} style={paginationBtnStyle}>{`>>`}</button>
                        </div>

                        <div>
                            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc" }}>
                                {[5, 10, 20, 50].map(size => (
                                    <option key={size} value={size}>
                                        Show {size}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                <br />
                <div className='row'>
                    <div className="col-0 col-sm-0 col-md-6 col-lg-6 col-xl-6"></div>
                    <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3">
                        <div className="form-check">
                            <button
                                className='btn btn-primary btn-block'
                                disabled={totalSitesCount !== totalAddedSites}
                                onClick={onEdit}
                            >
                                Add More
                            </button>

                        </div>
                    </div>
                    <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3">
                        <div className="form-check">
                            <button
                                className='btn btn-primary btn-block'
                                disabled={totalSitesCount !== totalAddedSites}
                                onClick={onSave}
                            >
                                Save & proceed next
                            </button>
                            {totalSitesCount !== totalAddedSites && (
                                <small className="text-danger">
                                    Please add all {totalSitesCount} sites before proceeding.
                                </small>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

};

const ECDetailsBlock = () => {
    const [ecNumber, setECNumber] = useState("");
    const [ecNumberError, setEcNumberError] = useState('');
    const [hasJDA, setHasJDA] = useState('no');
    const [isRegistered, setIsRegistered] = useState('');
    const [deedNumber, setDeedNumber] = useState("");
    const [deedNumberError, setDeedNumberError] = useState('');

    const { loading, start_loader, stop_loader } = useLoader(); // Use loader context

    const [fetchJDA, setFetchJDA] = useState('false');

    const handleDeed_FetchDetails = () => {
        if (!deedNumber || deedNumber.trim() === '') {
            setDeedNumberError('JDA Registered Deed Number is required');
            return;
        } else {
            setDeedNumberError('');
        }

        Swal.fire({
            title: "Success",
            text: "EPID Details fetched successfully!",
            icon: "success",
            confirmButtonText: "OK",
        }).then(() => {
            setFetchJDA(true);
        });
    };

    const handleEC_FetchDetails = () => {
        const ecNumberPattern = /^[A-Z0-9-]+$/;

        if (!ecNumber) {
            setEcNumberError('EC Number is required');
            return;
        }

        if (!ecNumberPattern.test(ecNumber)) {
            setEcNumberError('Only uppercase letters, numbers, and hyphens are allowed');
            return;
        }

        if (/^0/.test(ecNumber)) {
            setEcNumberError('EC Number cannot start with zero');
            return;
        }

        if (/^0+$/.test(ecNumber.replace(/-/g, ''))) {
            setEcNumberError('EC Number cannot be all zeros');
            return;
        }

        // If all validations pass
        setEcNumberError('');
        console.log("Fetching details for EC Number:", ecNumber);

    };


    const handleEcNumberChange = (e) => {
        let value = e.target.value.toUpperCase(); // Convert to uppercase

        const ecNumberPattern = /^[A-Z0-9-]+$/;

        setECNumber(value);

        if (!ecNumberPattern.test(value)) {
            setEcNumberError('Only uppercase letters, numbers, and hyphens are allowed');
        } else if (/^0/.test(value)) {
            setEcNumberError('EC Number cannot start with zero');
        } else if (/^0+$/.test(value.replace(/-/g, ''))) {
            setEcNumberError('EC Number cannot be all zeros');
        } else {
            setEcNumberError('');
        }
    };

    const handleDeedNumberChange = (e) => {
        let value = e.target.value.toUpperCase(); // Convert to uppercase

        const deedNumberPattern = /^[A-Z0-9-]+$/;

        setDeedNumber(value);

        if (!deedNumberPattern.test(value)) {
            setDeedNumberError('Only uppercase letters, numbers, and hyphens are allowed');
        } else if (/^0/.test(value)) {
            setDeedNumberError('Deed Number cannot start with zero');
        } else if (/^0+$/.test(value.replace(/-/g, ''))) {
            setDeedNumberError('Deed Number cannot be all zeros');
        } else {
            setDeedNumberError('');
        }
    };

    return (
        <div>
            {loading && <Loader />}

            <div className="card">
                <div className="card-header layout_btn_color" >
                    <h5 className="card-title" style={{ textAlign: 'center' }}>EC Details & JDA Registration</h5>

                </div>
                <div className="card-body">
                    <div className='row'>
                        <h6 className='note_color'>Note : EC should be atleast 1 day before registered deed of property until 31-10-2024 or later. If sale / registered deed date is before 01-04-2004 then EC should be from 01-04-2004 to 31-10-2024 after</h6>
                        <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4  mt-3">
                            <div className="form-group mt-2">
                                <label className='form-label'>Enter EC Number of Mother Property</label>
                                <input
                                    type="text"
                                    className={`form-control ${ecNumberError ? 'is-invalid' : ''}`}
                                    placeholder="Enter EC Number of Mother Property"
                                    value={ecNumber} maxLength={20}
                                    onChange={handleEcNumberChange}
                                />
                                {ecNumberError && <div className="invalid-feedback">{ecNumberError}</div>}
                            </div>
                        </div>
                        <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4  mt-4">
                            <div className="form-group mt-5">
                                <label></label>
                                <button className="btn btn-primary mt-2" onClick={handleEC_FetchDetails}>
                                    Fetch Details
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6'>
                            <div className="d-flex align-items-center gap-3">
                                <label className="form-check-label">Is there a Joint Development Agreement?</label>
                                <div className="form-check">
                                    <input
                                        className="form-check-input me-2 radioStyle"
                                        type="radio"
                                        name="hasJDA"
                                        value="yes"
                                        checked={hasJDA === 'yes'}
                                        onChange={() => setHasJDA('yes')}
                                    />
                                    <label className="form-check-label">Yes</label>
                                </div>
                                <div className="form-check">
                                    <input
                                        className="form-check-input me-2 radioStyle"
                                        type="radio"
                                        name="hasJDA"
                                        value="no"
                                        checked={hasJDA === 'no'}
                                        onChange={() => {
                                            setHasJDA('no');
                                            setIsRegistered(''); // reset isRegistered
                                        }}
                                    />
                                    <label className="form-check-label">No</label>
                                </div>
                            </div>
                        </div>
                        <div className='col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6'>
                            {hasJDA === 'yes' && (
                                <div className="d-flex align-items-center gap-3 ">
                                    <label className="form-check-label">Is Joint Development Agreement Registered?</label>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input me-2 radioStyle"
                                            type="radio"
                                            name="isRegistered"
                                            value="yes"
                                            checked={isRegistered === 'yes'}
                                            onChange={() => setIsRegistered('yes')}
                                        />
                                        <label className="form-check-label">Yes</label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input me-2 radioStyle"
                                            type="radio"
                                            name="isRegistered"
                                            value="no"
                                            checked={isRegistered === 'no'}
                                            onChange={() => setIsRegistered('no')}
                                        />
                                        <label className="form-check-label">No</label>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>


                </div>
            </div>
            {(isRegistered === 'no' || isRegistered === 'yes' || hasJDA === 'no') && (
                <Owner_EKYCBlock />
            )}

            {['yes', 'no'].includes(isRegistered) && <JDA_EKYCBlock />}

        </div>
    );
};
//Owner EKYC Block
const Owner_EKYCBlock = () => {
    const [selectedOption, setSelectedOption] = useState('owner');

    const { loading, start_loader, stop_loader } = useLoader(); // Use loader context


    const [phone, setPhone] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [timer, setTimer] = useState(30);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [isVerifyDisabled, setIsVerifyDisabled] = useState(false);
    const [showResend, setShowResend] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const otpInputsRef = useRef([]);

    const handleRadioChange = (e) => {
        console.log("Selected:", e.target.value);
        setSelectedOption(e.target.value);
    };
    const handlePhoneChange = (e) => {
        const value = e.target.value;
        if (/^\d{0,10}$/.test(value)) {
            setPhone(value);
        }
    };
    const handleSendOtp = () => {
        if (phone.length === 10) {
            setIsOtpSent(true);
            startTimer();
        } else {
            alert('Please enter a valid 10-digit phone number');
        }
    };
    const startTimer = () => {
        setTimer(30);
        setIsTimerActive(true);
        setIsVerifyDisabled(false);
        setShowResend(false);
    };
    useEffect(() => {
        let interval = null;
        if (isTimerActive && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setIsTimerActive(false);
            setIsVerifyDisabled(true);
            setShowResend(true);
        }
        return () => clearInterval(interval);
    }, [isTimerActive, timer]);
    const handleResendOtp = () => {
        setOtp(['', '', '', '', '', '']);
        startTimer();
    };
    const handleOtpChange = (element, index) => {
        const value = element.value.replace(/\D/, '');
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            otpInputsRef.current[index + 1].focus();
        }
    };
    const handleOtpKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputsRef.current[index - 1].focus();
        }
    };
    const [phoneNo, setPhoneNo] = useState('');
    const [isOtpSent1, setIsOtpSent1] = useState(false);
    const [timer1, setTimer1] = useState(30);
    const [isTimerActive1, setIsTimerActive1] = useState(false);
    const [isVerifyDisabled1, setIsVerifyDisabled1] = useState(false);
    const [showResend1, setShowResend1] = useState(false);
    const [otp1, setOtp1] = useState(['', '', '', '', '', '']);
    const otpInputsRef1 = useRef([]);

    const [representatives, setRepresentatives] = useState([
        {
            name: '',
            phoneNo: '',
            otp: ['', '', '', '', '', ''],
            isOtpSent: false,
            isVerifyDisabled: true,
            timer: 0,
            showResend: false,
        },
    ]);
    const handlePhoneChange1 = (e) => {
        const value = e.target.value;
        if (/^\d{0,10}$/.test(value)) {
            setPhone(value);
        }
    };
    const handleSendOtp1 = () => {
        if (phoneNo.length === 10) {
            setIsOtpSent1(true);
            startTimer1();
        } else {
            alert('Please enter a valid 10-digit phone number');
        }
    };

    const startTimer1 = () => {
        setTimer1(30);
        setIsTimerActive1(true);
        setIsVerifyDisabled1(false);
        setShowResend1(false);
    };

    useEffect(() => {
        let interval1 = null;
        if (isTimerActive1 && timer1 > 0) {
            interval1 = setInterval(() => {
                setTimer1((prev) => prev - 1);
            }, 1000);
        } else if (timer1 === 0) {
            setIsTimerActive1(false);
            setIsVerifyDisabled1(true);
            setShowResend1(true);
        }
        return () => clearInterval(interval1);
    }, [isTimerActive1, timer1]);

    const handleResendOtp1 = () => {
        setOtp1(['', '', '', '', '', '']);
        startTimer1();
    };

    const handleOtpChange1 = (element, index) => {
        const value = element.value.replace(/\D/, '');
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp1(newOtp);

        if (value && index < 5) {
            otpInputsRef1.current[index + 1].focus();
        }
    };

    const handleOtpKeyDown1 = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputsRef1.current[index - 1].focus();
        }
    };

    //Add More button functionlity
    const handleAddRepresentative = () => {
        setRepresentatives([
            ...representatives,
            {
                name: '',
                phoneNo: '',
                otp: ['', '', '', '', '', ''],
                isOtpSent: false,
                isVerifyDisabled: true,
                timer: 0,
                showResend: false,
            },
        ]);
    };

    //remove btn functionlity
    const handleRemoveRepresentative = (indexToRemove) => {
        const updated = representatives.filter((_, index) => index !== indexToRemove);
        setRepresentatives(updated);
    };
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiYWRtaW4iLCJleHAiOjE3NDc5MzAwNjUsImlzcyI6IkxBWU9VVEtIQVRBQVBJSXNzdWVyIiwiYXVkIjoiTEFZT1VUS0hBVEFBUElBdWRpZW5jZSJ9.mdBXC-6CQS8EoKkjUmXVvuhAvgI33bvTyTeVBtiAURw";

    const handleDoEKYC = async () => {
        const swalResult = await Swal.fire({
            title: 'Redirecting for e-KYC Verification',
            text: 'You are being redirected to another tab for e-KYC verification. Once the e-KYC verification is complete, please return to this tab and click the verify e-KYC button.',
            icon: 'info',
            confirmButtonText: 'OK',
            allowOutsideClick: false
        });

        if (swalResult.isConfirmed) {
            try {
                const response = await fetch(
                    'https://localhost:7277/api/Bhoomi/RequestEKYC?OwnerNumber=1&BOOK_APP_NO=2&PROPERTY_CODE=1&Page=Search',
                    {
                        method: 'POST',
                        headers: {
                            Accept: 'text/plain',
                            Authorization: `Bearer ${token}`,
                        },
                        body: '',
                    }
                );

                const resultUrl = await response.text();

                console.log('Response URL:', resultUrl);

                if (resultUrl) {
                    window.open(resultUrl, '_blank');
                } else {
                    console.warn('No redirect URL returned');
                }
            } catch (error) {
                console.error('eKYC API call failed:', error);
            }
        }
    };


    const [txnno, setTxnno] = useState('');
    const [ekycData, setEkycData] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [ownerData, setOwnerData] = useState(null);

    const fetchEKYCOwnerDetails = async () => {
        try {
            const response = await axios.get(
                'https://localhost:7277/api/Bhoomi/GET_BBD_NCL_OWNER_BYEKYCTRANSACTION',
                {
                    params: {
                        transactionNumber: 83,
                        OwnerType: 'NEWOWNER',
                    },
                    headers: {
                        'accept': 'text/plain',
                        'Authorization': `Bearer ${token}`, // truncated
                    },
                }
            );

            setOwnerData(response.data); // assuming it's a single object
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };




    const [ownerList, setOwnerList] = useState([
        { name: 'John Doe', phone: '9876543210' },
        { name: 'Jane Smith', phone: '9123456789' },
        { name: 'Ravi Kumar', phone: '9988776655' },
    ]);
    const [selectedOwner, setSelectedOwner] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showInput, setShowInput] = useState(false);
    const [newOwnerName, setNewOwnerName] = useState('');
    const [ownerNameInput, setOwnerNameInput] = useState('');

    const handleAddOwner = (e) => {
        if (e.key === 'Enter' && newOwnerName.trim()) {
            const newOwner = { name: newOwnerName.trim(), phone: '' };
            const updatedList = [...ownerList, newOwner];
            setOwnerList(updatedList);
            setSelectedOwner(newOwner);
            setOwnerNameInput(newOwner.name);
            setNewOwnerName('');
            setShowInput(false);
            setIsDropdownOpen(false);
        }
    };
    const buttonRef = useRef(null);
    const [dropdownWidth, setDropdownWidth] = useState('auto');

    useEffect(() => {
        if (buttonRef.current) {
            setDropdownWidth(buttonRef.current.offsetWidth + "px");
        }
    }, [isDropdownOpen]); // update width when dropdown opens



    return (
        <div>


            <div className="card"> {loading && <Loader />}
                <div className="card-header layout_btn_color" >
                    <h5 className="card-title" style={{ textAlign: 'center' }}>Owner/Owner representative eKYC</h5>

                </div>
                <div className="card-body">
                    <div className='row'>
                        <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4 mb-3">
                            <label className="form-label">Select Owner / Owner representative : </label>
                        </div>
                        <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4" >
                            <div className="form-check">
                                <input
                                    className="form-check-input radioStyle"
                                    type="radio"
                                    name="userType"
                                    value="owner"
                                    checked={selectedOption === 'owner'}
                                    onChange={handleRadioChange}
                                />
                                <label>Owner</label>
                            </div>
                        </div>
                        <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4" >
                            <div className="form-check">
                                <input
                                    className="form-check-input radioStyle"
                                    type="radio"
                                    name="userType"
                                    value="representative"
                                    checked={selectedOption === 'representative'}
                                    onChange={handleRadioChange}
                                />
                                <label>Owner Representative</label>
                            </div>
                        </div>


                        <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 mt-3">
                            <div className='row'>
                                <div className="alert alert-info">[Note: Click on eKYC Status button once the ekyc is done to check verification status]</div>

                                <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mt-2" >
                                    <label className="form-label">Select Owner <span className='mandatory_color'>*</span></label>
                                </div>
                                <div className="col-12 col-sm-12 col-md-7 col-lg-7 col-xl-7 mt-2">
                                    <button
                                        className="form-control text-start"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        ref={buttonRef}  // attach ref here
                                    >
                                        {selectedOwner ? selectedOwner.name : "Select an owner"}
                                    </button>

                                    {isDropdownOpen && (
                                        <ul
                                            className="dropdown-menu show"
                                            style={{
                                                overflowY: "auto",
                                                width: dropdownWidth,  // set exact width to match button
                                                maxHeight: "250px", marginLeft: "13px",
                                            }}
                                        >
                                            {ownerList.map((owner, index) => (
                                                <li key={index}>
                                                    <button
                                                        className="dropdown-item"
                                                        onClick={() => {
                                                            setSelectedOwner(owner);
                                                            setOwnerNameInput(owner.name);
                                                            setIsDropdownOpen(false);
                                                        }}
                                                    >
                                                        {owner.name}
                                                    </button>
                                                </li>
                                            ))}

                                            {showInput && (
                                                <li className="px-3 py-2">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Enter owner name"
                                                        value={newOwnerName}
                                                        onChange={(e) => setNewOwnerName(e.target.value)}
                                                        onKeyDown={handleAddOwner}
                                                        autoFocus
                                                    />
                                                </li>
                                            )}

                                            <li>
                                                <button
                                                    className="dropdown-item text-primary"
                                                    onClick={() => setShowInput(true)}
                                                >
                                                    ➕ Add More
                                                </button>
                                            </li>
                                        </ul>
                                    )}
                                </div>
                                <div className="col-0 col-sm-0 col-md-2 col-lg-2 col-xl-2 mt-2" ></div>

                                <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mt-4" >
                                    <label className="form-label">{selectedOption === 'owner' ? "Owner Name" : "Representative Name"}   <span className='mandatory_color'>*</span></label>
                                </div>
                                <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mt-4" >
                                    <input
                                        type="text"
                                        readOnly
                                        className="form-control"
                                        placeholder={selectedOption === 'owner' ? "Enter the Owner Name" : "Enter the Representative Name"}
                                        value={ownerNameInput}
                                    />
                                </div>
                                <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 mt-4" >
                                    <button className='btn btn-info btn-block' onClick={handleDoEKYC}>Do eKYC</button>
                                </div>
                                <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 mt-4" >
                                    <button className='btn btn-info btn-block' onClick={fetchEKYCOwnerDetails}>eKYC Status</button>
                                </div>
                                <div className="col-0 col-sm-0 col-md-3 col-lg-3 col-xl-2" ></div>
                                {/* Phone Number and Verify OTP */}
                                <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 mt-3">
                                    <div className="row mt-3">
                                        <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3">
                                            <label className="form-label">{selectedOption === 'owner' ? "Owner's Phone Number" : "Representative's Phone Number"}  <span className='mandatory_color'>*</span></label>
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3">
                                            <input
                                                type="text"
                                                onChange={handlePhoneChange}
                                                maxLength={10}
                                                className="form-control"
                                                placeholder="Enter the Phone Number"
                                            />
                                            {isOtpSent && (
                                                <>
                                                    {isTimerActive && (
                                                        <div className="mb-2">
                                                            <strong>Resend OTP in : {timer} s</strong>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        <div className='col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2'>
                                            {!isOtpSent && (
                                                <button className="btn btn-info btn-block" onClick={handleSendOtp}>
                                                    Send OTP
                                                </button>
                                            )}
                                        </div>
                                    </div><br />
                                    <div className="row">
                                        <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3">

                                        </div>
                                        <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3">
                                            {isOtpSent && (
                                                <div className="d-flex gap-2">
                                                    {otp.map((digit, index) => (
                                                        <input
                                                            key={index}
                                                            type="text"
                                                            maxLength={1}
                                                            className="form-control text-center"
                                                            style={{ width: '40px' }}
                                                            value={digit}
                                                            onChange={(e) => handleOtpChange(e.target, index)}
                                                            onKeyDown={(e) => handleOtpKeyDown(e, index)}
                                                            ref={(el) => (otpInputsRef.current[index] = el)}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3">
                                            {isOtpSent && (
                                                <div className="row">
                                                    <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6" >
                                                        <button className="btn btn-success btn-block mb-2" disabled={isVerifyDisabled}>Verify OTP</button>
                                                    </div>
                                                    <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6" >
                                                        {showResend && (
                                                            <button className="btn btn-warning btn-block" onClick={handleResendOtp}>
                                                                Resend OTP
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            </div>


                        </div>

                    </div>

                </div>

            </div>
            <div className="card">
                <div className="card-header layout_btn_color" >
                    <h5 className="card-title" style={{ textAlign: 'center' }}>ಇಕೆವೈಸಿ ವಿವರಗಳು / EKYC DETAILS</h5>

                </div>
                <div className="card-body">

                    {/* Error Message */}
                    {errorMessage && <p className="text-danger text-center">{errorMessage}</p>}

                    {/* Table */}

                    <table className="table table-striped table-bordered table-hover shadow" style={{ fontFamily: 'Arial, sans-serif' }}>
                        <thead className="table-light">
                            <tr>
                                <th>ಫೋಟೋ / Photo</th>
                                <th>ಇಕೆವೈಸಿ ಪರಿಶೀಲಿಸಿದ ಆಧಾರ್ ಹೆಸರು / EKYC Verified Aadhar Name</th>
                                <th>ಇಕೆವೈಸಿ ಪರಿಶೀಲಿಸಿದ ಆಧಾರ್ ಸಂಖ್ಯೆ / EKYC Verified Aadhar Number</th>
                                <th>ಲಿಂಗ / Gender</th>
                                <th>ಹುಟ್ಟಿದ ದಿನಾಂಕ / DOB</th>
                                <th>ವಿಳಾಸ / Address</th>
                                <th>ಇಕೆವೈಸಿ ಸ್ಥಿತಿ / EKYC Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ownerData ? (
                                <tr>
                                    <td style={{ textAlign: 'center' }}> <img
                                        src={bbmplogo}
                                        alt="Owner"
                                        width="50"
                                        height="50"
                                    />
                                        {/* {ownerData.photoContent ? (
                                               
                                                <img
                                                    src={`data:image/jpeg;base64,${ownerData.photoContent}`}
                                                    alt="Owner"
                                                    width="50"
                                                    height="50"
                                                />
                                            ) : (
                                                'N/A'
                                            )} */}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>{ownerData.ownerNameEng || 'N/A'}</td>
                                    <td style={{ textAlign: 'center' }}>{ownerData.maskedAadhaar || 'N/A'}</td>
                                    <td style={{ textAlign: 'center' }}>{ownerData.gender || 'N/A'}</td>
                                    <td style={{ textAlign: 'center' }}>{ownerData.dateOfBirth || 'N/A'}</td>
                                    <td style={{ textAlign: 'center' }}>{ownerData.addressEng || 'N/A'}</td>
                                    <td style={{ textAlign: 'center' }}>{ownerData.aadhaarHash ? 'Verified' : 'Not Verified'}</td>
                                </tr>
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center">Loading...</td>
                                </tr>
                            )}
                        </tbody>
                    </table>


                </div>
            </div>
        </div>
    );
};
const JDA_EKYCBlock = () => {
    const [selectedOption, setSelectedOption] = useState('JDArepresentative');

    const { loading, start_loader, stop_loader } = useLoader(); // Use loader context

    const handleRadioChange = (e) => {
        setSelectedOption(e.target.value);
    };

    const [phone, setPhone] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [timer, setTimer] = useState(30);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [isVerifyDisabled, setIsVerifyDisabled] = useState(false);
    const [showResend, setShowResend] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const otpInputsRef = useRef([]);

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        if (/^\d{0,10}$/.test(value)) {
            setPhone(value);
        }
    };

    const handleSendOtp = () => {
        if (phone.length === 10) {
            setIsOtpSent(true);
            startTimer();
        } else {
            alert('Please enter a valid 10-digit phone number');
        }
    };

    const startTimer = () => {
        setTimer(30);
        setIsTimerActive(true);
        setIsVerifyDisabled(false);
        setShowResend(false);
    };

    useEffect(() => {
        let interval = null;
        if (isTimerActive && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setIsTimerActive(false);
            setIsVerifyDisabled(true);
            setShowResend(true);
        }
        return () => clearInterval(interval);
    }, [isTimerActive, timer]);

    const handleResendOtp = () => {
        setOtp(['', '', '', '', '', '']);
        startTimer();
    };

    const handleOtpChange = (element, index) => {
        const value = element.value.replace(/\D/, '');
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            otpInputsRef.current[index + 1].focus();
        }
    };

    const handleOtpKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputsRef.current[index - 1].focus();
        }
    };

    return (
        <div className="card"> {loading && <Loader />}
            <div className="card-header layout_btn_color" >
                <h5 className="card-title" style={{ textAlign: 'center' }}>JDA / JDA Representative eKYC</h5>

            </div>
            <div className="card-body">
                <div className='row'>
                    <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4 mb-3">
                        <label className="form-label">JDA / JDA Representative  </label>
                    </div>
                    <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4" >
                        <div className="form-check">
                            <input
                                className="form-check-input radioStyle"
                                type="radio"
                                name="userType"
                                value="representative"
                                checked={selectedOption === 'JDArepresentative'}
                                onChange={handleRadioChange}
                            />
                            <label> JDA Representative</label>
                        </div>
                    </div>
                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 mt-3">
                        <div className='row'>
                            <div className="alert alert-warning">[Note: Click on eKYC Status button once the ekyc is done to check verification status]</div>
                            <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3" >
                                <label className="form-label">JDA Representative Name</label>
                            </div>
                            <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4" >
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter the JDA Representative Name"
                                />
                            </div>
                            <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2" >
                                <button className='btn btn-info btn-block'>Do eKYC</button>
                            </div>
                            <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2" >
                                <button className='btn btn-info btn-block'>eKYC Status</button>
                            </div>
                            <div className="col-0 col-sm-0 col-md-3 col-lg-3 col-xl-2" ></div>
                        </div>
                    </div>
                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 mt-3">
                        <div className="row mt-3">
                            <div className="col-md-3">
                                <label className="form-label">Phone Number</label>
                            </div>
                            <div className="col-md-3">
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    maxLength={10}
                                    className="form-control"
                                    placeholder="Enter the Phone Number"
                                />
                                {isOtpSent && (
                                    <>
                                        {isTimerActive && (
                                            <div className="mb-2">
                                                <strong>Resend OTP in : {timer} s</strong>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            <div className='col-md-3'>
                                {!isOtpSent && (
                                    <button className="btn btn-info" onClick={handleSendOtp}>
                                        Send OTP
                                    </button>
                                )}
                            </div>
                        </div><br />
                        <div className="row">
                            <div className="col-md-3">

                            </div>
                            <div className="col-md-3">
                                {isOtpSent && (
                                    <div className="d-flex gap-2">
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                type="text"
                                                maxLength={1}
                                                className="form-control text-center"
                                                style={{ width: '40px' }}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(e.target, index)}
                                                onKeyDown={(e) => handleOtpKeyDown(e, index)}
                                                ref={(el) => (otpInputsRef.current[index] = el)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="col-md-3">
                                {isOtpSent && (
                                    <div className="row">
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6" >
                                            <button className="btn btn-success btn-block mb-2" disabled={isVerifyDisabled}>Verify OTP</button>
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6" >
                                            {showResend && (
                                                <button className="btn btn-warning btn-block" onClick={handleResendOtp}>
                                                    Resend OTP
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
//Declaration Block
const DeclarationBlock = ({ rtc_AddedData, approval_details, order_details }) => {
    const { t, i18n } = useTranslation();

    const { loading, start_loader, stop_loader } = useLoader(); // Use loader context

    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);


    let selectedLandType = "convertedRevenue";
    let individualShape = "Regular";
    const thStyle = {
        padding: "10px",
        textAlign: "center",
        fontWeight: "bold",
        border: "1px solid #ccc",
        fontFamily: "Georgia, serif",
    };

    const tdStyle = {
        padding: "10px",
        textAlign: "center",
        border: "1px solid #ccc",
        fontFamily: "Georgia, serif",
    };
    const buttonStyle = {
        padding: "10px 20px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "16px"
    };


    const handleDownloadPDF = async () => {
        const input = document.getElementById('modal-content');
        if (!input) {
            console.error('Element with ID "modal-content" not found.');
            return;
        }
        try {
            const canvas = await html2canvas(input, {
                scale: 2,
                useCORS: true,
                allowTaint: false,
            });

            const imgData = canvas.toDataURL('image/png');

            // Fix: create image object first
            const img = new Image();
            img.src = imgData;

            img.onload = () => {
                const pdf = new jsPDF('p', 'mm', 'a4');
                const imgWidth = 210;
                const pageHeight = 297;
                const imgHeight = (img.height * imgWidth) / img.width;

                let heightLeft = imgHeight;
                let position = 0;

                pdf.addImage(img, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;

                while (heightLeft > 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(img, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }

                const now = new Date();
                const dateString = now.toLocaleDateString('en-GB').split('/').reverse().join('-');
                const timeString = now.toTimeString().split(' ')[0].replace(/:/g, '-');
                const fileName = `${dateString}_${timeString}_layout_khata_details.pdf`;

                pdf.save(fileName);
            };

            img.onerror = (e) => {
                console.error('Failed to load image:', e);
            };

        } catch (error) {
            console.error('Error generating or saving PDF:', error);
        }
    };
    useEffect(() => {
        console.log("Updated RTC Data:", rtc_AddedData);
        console.log("Updated Approval Data:", approval_details);

        console.log("Updated order Data:", order_details);

    }, [rtc_AddedData, approval_details, order_details]);

    const flatData = Array.isArray(rtc_AddedData)
        ? rtc_AddedData.flat()
        : [];


    const approvalData = Array.isArray(approval_details)
        ? approval_details.flat()
        : [];


    const orderData = Array.isArray(order_details)
        ? order_details.flat()
        : [];


    const handleFileClick = (file) => {
        console.log(file);  // Check what the file contains
        if (file) {
            window.open(file, '_blank');
        } else {
            console.error("File is missing:", file);
        }
    };

    return (
        <div className="card"> {loading && <Loader />}
            <div className="card-header layout_btn_color" >
                <h5 className="card-title" style={{ textAlign: 'center' }}>{t('translation.LayoutDeclartion.heading')}</h5>

            </div>
            <div className="card-body">
                <div className="form-check">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="declarationCheckbox"
                    />
                    <label className="form-check-label" >
                        {t('translation.LayoutDeclartion.title1')}
                    </label>
                </div>
                <div className="form-check">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="declarationCheckbox"
                    />
                    <label className="form-check-label" >
                        {t('translation.LayoutDeclartion.title2')}
                    </label>
                </div>
                <div className="form-check">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="declarationCheckbox"
                    />
                    <label className="form-check-label" >
                        {t('translation.LayoutDeclartion.title3')}
                    </label>
                </div>
                <div className='row'>
                    <div className='col-md-3 mt-2'>
                        <button onClick={() => setIsModalOpen(true)} className='btn btn-warning btn-block'>Preview</button>
                    </div>
                    <div className='col-md-3 mt-2'>
                        <button className='btn btn-primary btn-block'>{t('translation.buttons.save&submit')}</button>
                    </div>
                </div>



                <div id="modal-content">
                    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                        <div style={{ padding: '20px' }}>
                            {selectedLandType === "convertedRevenue" && (

                                <div style={{ overflowX: "auto" }}>
                                    <table
                                        className="min-w-[600px] w-full border border-gray-300 table-fixed"
                                        style={{
                                            borderCollapse: "collapse",
                                            width: "100%",
                                            border: "1px solid #ccc",
                                            fontFamily: "Georgia, serif",
                                            tableLayout: "fixed",
                                            minWidth: "600px",
                                        }}
                                    >
                                        <thead>
                                            <tr style={{ backgroundColor: "#f5f5f5" }}>
                                                <th colSpan={7} style={{
                                                    padding: "10px",
                                                    textAlign: "center",
                                                    fontSize: "16px",
                                                    fontWeight: "bold",
                                                    fontFamily: "Georgia, serif",
                                                    color: "#000",
                                                    border: "1px solid #ccc"
                                                }}>
                                                    Converted Revenue Land Details
                                                </th>
                                            </tr>
                                            <tr style={{ backgroundColor: "#f2f2f2" }}>
                                                <th style={thStyle}>Survey Number / Surnoc / Hissa No</th>
                                                <th style={thStyle}>Extent [Acre.Gunta.Fgunta]</th>
                                                <th style={thStyle}>Owner Name</th>
                                                <th style={thStyle}>District</th>
                                                <th style={thStyle}>Taluk</th>
                                                <th style={thStyle}>Hobli</th>
                                                <th style={thStyle}>Village</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {flatData.length > 0 ? (
                                                flatData.map((item, index) => (
                                                    <tr key={index}>
                                                        <td style={tdStyle}>
                                                            {item.survey_no}/{item.surnoc}/{item.hissa_no}
                                                        </td>
                                                        <td style={tdStyle}>
                                                            {item.ext_acre}/{item.ext_gunta}/{item.ext_fgunta}
                                                        </td>
                                                        <td style={tdStyle}>{item.owner}</td>
                                                        <td style={tdStyle}>{item.district}</td>
                                                        <td style={tdStyle}>{item.taluk}</td>
                                                        <td style={tdStyle}>{item.hobli}</td>
                                                        <td style={tdStyle}>{item.village}</td>

                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} style={tdStyle}>
                                                        No data available
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                            )}

                            {(selectedLandType === "bbmpKhata") && (
                                <div style={{ overflowX: "auto" }}>

                                    <table
                                        className="min-w-[600px] w-full border border-gray-300 table-fixed"
                                        style={{
                                            borderCollapse: "collapse",
                                            width: "100%",
                                            border: "1px solid #ccc",
                                            fontFamily: "Georgia, serif",
                                            tableLayout: "fixed",
                                            minWidth: "600px",
                                        }}
                                    >
                                        <thead>
                                            <tr style={{ backgroundColor: "#f5f5f5" }}>
                                                <th colSpan={2} style={{
                                                    padding: "10px",
                                                    textAlign: "center",
                                                    fontSize: "16px",
                                                    fontWeight: "bold",
                                                    fontFamily: "Georgia, serif",
                                                    color: "#000",
                                                    border: "1px solid #ccc"
                                                }}>
                                                    Property Owner details as per BBMP eKhata
                                                </th>
                                            </tr>
                                            <tr style={{ backgroundColor: "#f2f2f2" }}>
                                                <th style={thStyle}>EPID Number</th>
                                                <th style={thStyle}>EPID</th>

                                            </tr>
                                        </thead>
                                        <tbody>

                                        </tbody>
                                    </table><br />
                                    <table
                                        className="min-w-[600px] w-full border border-gray-300 table-fixed"
                                        style={{
                                            borderCollapse: "collapse",
                                            width: "100%",
                                            border: "1px solid #ccc",
                                            fontFamily: "Georgia, serif",
                                            tableLayout: "fixed",
                                            minWidth: "600px",
                                        }}
                                    >
                                        <thead>

                                            <tr style={{ backgroundColor: "#f2f2f2" }}>
                                                <th style={thStyle}>S.No</th>
                                                <th style={thStyle}>Owner Name</th>
                                                <th style={thStyle}>Relationship Type</th>
                                                <th style={thStyle}>Relation Name</th>
                                                <th style={thStyle}>ID Type</th>
                                                <th style={thStyle}>ID Number</th>
                                                <th style={thStyle}>Phone Number</th>
                                            </tr>
                                        </thead>
                                        <tbody>

                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {/* Approval order table details */}
                            <br />
                            <div style={{ overflowX: "auto" }}>
                                <table
                                    className="min-w-[600px] w-full border border-gray-300 table-fixed"
                                    style={{
                                        borderCollapse: "collapse",
                                        width: "100%",
                                        border: "1px solid #ccc",
                                        fontFamily: "Georgia, serif",
                                        tableLayout: "fixed",
                                        minWidth: "600px",
                                    }}
                                >
                                    <thead>
                                        <tr style={{ backgroundColor: "#f5f5f5" }}>
                                            <th
                                                colSpan={5}
                                                style={{
                                                    padding: "10px",
                                                    textAlign: "center",
                                                    fontSize: "16px",
                                                    fontWeight: "bold",
                                                    fontFamily: "Georgia, serif",
                                                    color: "#000",
                                                    border: "1px solid #ccc",
                                                }}
                                            >
                                                Approval Order Details
                                            </th>
                                        </tr>
                                        <tr style={{ backgroundColor: "#f2f2f2" }}>
                                            <th style={thStyle}>Layout Approval Number</th>
                                            <th style={thStyle}>Date of Approval</th>
                                            <th style={thStyle}>Uploaded Layout Approval order</th>
                                            <th style={thStyle}>Uploaded Layout Approved Map</th>
                                            <th style={thStyle}>Designation of Approval Authority</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {approvalData.length > 0 ? (
                                            approvalData.map((item, index) => (
                                                <tr key={index}>
                                                    <td style={tdStyle}>{item.layoutApprovalNumber}</td>
                                                    <td style={tdStyle}>{item.dateOfApproval}</td>

                                                    <td style={tdStyle}>
                                                        {item.approvalOrder?.name ? (
                                                            <a
                                                                href={URL.createObjectURL(item.approvalOrder)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{ color: 'blue', textDecoration: 'underline' }}
                                                            >
                                                                {item.approvalOrder.name}
                                                            </a>
                                                        ) : (
                                                            "No file uploaded"
                                                        )}
                                                    </td>
                                                    <td style={tdStyle}>
                                                        {item.approvalMap?.name ? (
                                                            <a
                                                                href={URL.createObjectURL(item.approvalMap)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{ color: 'blue', textDecoration: 'underline' }}
                                                            >
                                                                {item.approvalMap.name}
                                                            </a>
                                                        ) : (
                                                            "No file uploaded"
                                                        )}
                                                    </td>
                                                    <td style={tdStyle}>{item.approvalAuthority}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} style={tdStyle}>
                                                    No data available
                                                </td>
                                            </tr>
                                        )}

                                    </tbody>
                                </table>
                            </div>
                            {/* released order table details */}
                            <br />
                            <div style={{ overflowX: "auto" }}>
                                <table
                                    className="min-w-[600px] w-full border border-gray-300 table-fixed"
                                    style={{
                                        borderCollapse: "collapse",
                                        width: "100%",
                                        border: "1px solid #ccc",
                                        fontFamily: "Georgia, serif",
                                        tableLayout: "fixed",
                                        minWidth: "600px",
                                    }}
                                >
                                    <thead>
                                        <tr style={{ backgroundColor: "#f5f5f5" }}>
                                            <th
                                                colSpan={4}
                                                style={{
                                                    padding: "10px",
                                                    textAlign: "center",
                                                    fontSize: "16px",
                                                    fontWeight: "bold",
                                                    fontFamily: "Georgia, serif",
                                                    color: "#000",
                                                    border: "1px solid #ccc",
                                                }}
                                            >
                                                Released Order Details
                                            </th>
                                        </tr>
                                        <tr style={{ backgroundColor: "#f2f2f2" }}>
                                            <th style={thStyle}>Release Order Number</th>
                                            <th style={thStyle}>Date of Order</th>
                                            <th style={thStyle}>Uploaded Order of site release</th>
                                            <th style={thStyle}>Designation of Authority issued site Release Order</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orderData.length > 0 ? (
                                            orderData.map((item, index) => (
                                                <tr key={index}>
                                                    <td style={tdStyle}>{item.layoutOrderNumber}</td>
                                                    <td style={tdStyle}>{item.dateOfOrder}</td>
                                                    <td style={tdStyle}>
                                                        {item.release_Order?.name ? (
                                                            <a
                                                                href={URL.createObjectURL(item.release_Order)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{ color: 'blue', textDecoration: 'underline' }}
                                                            >
                                                                {item.release_Order.name}
                                                            </a>
                                                        ) : (
                                                            "No file uploaded"
                                                        )}
                                                    </td>


                                                    <td style={tdStyle}>{item.orderAuthority}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} style={tdStyle}>
                                                    No data available
                                                </td>
                                            </tr>
                                        )}




                                    </tbody>
                                </table>
                            </div>
                            <hr />
                            <h4>Individual sites Details</h4>
                            {individualShape === "Regular" && (
                                <div style={{ overflowX: "auto" }}>
                                    <table
                                        className="min-w-[600px] w-full border border-gray-300 table-fixed"
                                        style={{
                                            borderCollapse: "collapse",
                                            width: "100%",
                                            border: "1px solid #ccc",
                                            fontFamily: "Georgia, serif",
                                            tableLayout: "fixed",
                                            minWidth: "600px",
                                        }}
                                    >
                                        <thead>
                                            <tr style={{ backgroundColor: "#f5f5f5" }}>
                                                <th
                                                    colSpan={10}
                                                    style={{
                                                        padding: "10px",
                                                        textAlign: "center",
                                                        fontSize: "16px",
                                                        fontWeight: "bold",
                                                        fontFamily: "Georgia, serif",
                                                        color: "#000",
                                                        border: "1px solid #ccc",
                                                    }}
                                                >
                                                    Individual sites - Regular Shape Details
                                                </th>
                                            </tr>
                                            <tr style={{ backgroundColor: "#f2f2f2" }}>
                                                <th style={thStyle}>Site Number</th>
                                                <th style={thStyle}>Block/Area</th>
                                                <th style={thStyle}>Dimension</th>
                                                <th style={thStyle}>Total Area</th>
                                                <th style={thStyle}>Corner Site</th>
                                                <th style={thStyle}>Type of Site</th>
                                                <th style={thStyle}>Chakbandi[East | West | South | North]</th>
                                                <th style={thStyle}>Latitude</th>
                                                <th style={thStyle}>Longitude</th>
                                                <th style={thStyle}>Address</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td style={tdStyle}></td>
                                                <td style={tdStyle}></td>
                                                <td style={tdStyle}></td>
                                                <td style={tdStyle}></td>
                                                <td style={tdStyle}></td>
                                                <td style={tdStyle}></td>
                                                <td style={tdStyle}></td>
                                                <td style={tdStyle}></td>
                                                <td style={tdStyle}></td>
                                                <td style={tdStyle}></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                            )}

                            <div className='row mt-4 no-print'>
                                <div className='col-md-6'></div>
                                <div className='col-md-2'>
                                    <button className='btn btn-block btn-success' onClick={handleDownloadPDF}>Download PDF</button>
                                </div>
                                <div className='col-md-2'>
                                    <button className='btn btn-block btn-info' onClick={() => window.print()}>Print</button>
                                </div>
                                <div className='col-md-2'>
                                    <button className='btn btn-block btn-danger' onClick={() => setIsModalOpen(false)}>Close</button>
                                </div>



                            </div>
                        </div>
                    </Modal>

                </div>


            </div>

        </div>
    );
};
const styles = {
    modal: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
    },
    modalContent: {
        position: 'relative',
        backgroundColor: '#fff',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '1500px',
        height: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
    },
    modalHeader: {
        position: 'sticky',
        background: 'linear-gradient(45deg,  #0077b6,#023e8a)',
        color: '#fff',
        top: 0,
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
        backgroundColor: '#fff',
        padding: '15px 20px',
        borderBottom: '1px solid #ddd',
        zIndex: 1,
    },
    modalBody: {
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
    },
    closeButton: {
        position: 'absolute',
        top: '5px',
        right: '20px',
        fontSize: '30px',
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        color: '#fff',
    },
    '@media (max-width: 768px)': {
        modalContent: {
            width: '95%',  // Make the modal content width responsive for smaller screens
            padding: '20px',  // Adjust padding for smaller screens
        },
        closeButton: {
            top: '10px',  // Adjust close button position for mobile view
            right: '15px',  // Adjust the right position
            fontSize: '24px',  // Smaller font size for mobile
        },
    },
};
const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) {
        console.error('modal-root not found');
        return null;
    }

    return ReactDOM.createPortal(
        <div style={styles.modal}>
            <div style={styles.modalContent}>
                <div style={styles.modalHeader}>
                    <h4 style={{ margin: 0 }}>Submitted Preview Application</h4>
                    <button style={styles.closeButton} onClick={onClose}>
                        &times;
                    </button>
                </div>
                <div style={styles.modalBody}>
                    {children}
                </div>
            </div>
        </div>,
        modalRoot
    );
};
export default BBMP_LayoutForm;



