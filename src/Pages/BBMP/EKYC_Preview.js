import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../../Layout/DashboardLayout';
import '../../Styles/CSS/EKYC_Preview.css';



const EKYC_Preview = () => {
    const location = useLocation();
    const [txnno, setTxnno] = useState('');
    const [ekycData, setEkycData] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');



    return (
        <DashboardLayout>
            <div className="h-100 gradient-dashboard mt-3">
                {/* Main Content Area */}
                <div className="main-content" style={{ overflowY: 'auto', height: 'calc(100vh - 80px)' }}>
                    {/* {txnno && (
          <div className="text-center mb-4">
            <h5>Transaction Number: {txnno}</h5>
          </div>
        )} */}
                    <div className="container-fluid py-3" >
                        <h3 className="text-center mb-4 text-black">ಇಕೆವೈಸಿ ವಿವರಗಳು / EKYC DETAILS</h3>

                        {/* Error Message */}
                        {errorMessage && <p className="text-danger text-center">{errorMessage}</p>}

                        {/* Table */}
                        {/* {ekycData && ( */}
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
  {/* <tbody>
    <tr style={{ backgroundColor: '#fff' }}>
      <td style={{ textAlign: 'center' }}>
        {ekycData.photo ? (
          <img
            src={`data:image/jpeg;base64,${ekycData.photo}`}
            alt="Aadhar"
            style={{ width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover', boxShadow: '0 0 5px rgba(0,0,0,0.3)' }}
          />
        ) : (
          <span className="text-muted">N/A</span>
        )}
      </td>
      <td><center>{ekycData.aadharName || <span className="text-muted">N/A</span>}</center></td>
      <td><center>{ekycData.aadharNumber ? `XXXXXXXX${ekycData.aadharNumber.slice(-4)}` : <span className="text-muted">N/A</span>}</center></td>
      <td><center>{ekycData.gender || <span className="text-muted">N/A</span>}</center></td>
      <td><center>{ekycData.dob || <span className="text-muted">N/A</span>}</center></td>
      <td><center>{ekycData.address || <span className="text-muted">N/A</span>}</center></td>
      <td>
        <center>
          <span
            style={{
              color: ekycData.ekycStatus === 'Y' ? 'green' : 'red',
              fontWeight: 'bold',
              fontSize: '16px',
              backgroundColor: ekycData.ekycStatus === 'Y' ? '#e6ffe6' : '#ffe6e6',
              padding: '4px 10px',
              borderRadius: '5px',
              display: 'inline-block'
            }}
          >
            {ekycData.ekycStatus === 'Y' ? 'SUCCESS' : ekycData.ekycStatus || 'N/A'}
          </span>
        </center>
      </td>
    </tr>
  </tbody> */}
</table>

                        {/* )} */}
                    </div>
                </div>
            </div>
        </DashboardLayout>

    );
};

export default EKYC_Preview;
