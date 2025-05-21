import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import DashboardLayout from '../../Layout/DashboardLayout';
import { useTranslation } from "react-i18next";
import i18n from "../../localization/i18n";
import Swal from "sweetalert2";
import Loader from "../../Layout/Loader";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import DataTable from 'react-data-table-component';
import '../../Styles/CSS/ReleaseSiteSelection.css';
import { useTable, usePagination } from "react-table";




const ReleaseSiteSelection = () => {
  const [loading, setLoading] = useState(false);

  const start_loader = () => setLoading(true);
  const stop_loader = () => setLoading(false);

  const [zoomLevel] = useState(0.9);
  const [newLanguage, setNewLanguage] = useState(localStorage.getItem('selectedLanguage'));


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

  const handleCheckboxChange = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const columns = [

    {
      name: 'S.No',
      selector: row => row.sno,
      sortable: true,
      width: '100px',
    },
    {
      name: (<>
        Shape
      </>),
      selector: row => row.shape,
      minWidth: '150px',
      wrap: true,
      className: 'wrap-direction',
    },
    {
      name: (
        <>
          Site Number
        </>
      ),
      selector: row => row.siteNumber,
      minWidth: '120px',
      wrap: true,
      className: 'wrap-direction',
    },
    {
      name: (<>Block/Area</>),
      selector: row => row.blockArea,
      minWidth: '150px',
      wrap: true,
      className: 'wrap-direction',
    },
    {
      name: (
        <>
          No of sides
        </>
      ),
      selector: row => row.numberOfSides,
      minWidth: '140px',
      wrap: true,
      className: 'wrap-direction',
    },
    {
      name: (<>
        Dimension
      </>),
      selector: row => row.dimension,
      minWidth: '110px',
      wrap: true,
      className: 'wrap-direction',
    },
    {
      name: (<>Total Area</>),
      selector: row => row.totalArea,
      minWidth: '150px',
      wrap: true,
      className: 'wrap-direction',
    },
    {
      name: (<>Corner Site</>),
      selector: row => row.cornerSite,
      minWidth: '150px',
      wrap: true,
      className: 'wrap-direction',
    },
    {
      name: (<>Type of Site</>),
      selector: row => row.typeOfSite,
      minWidth: '150px',
      wrap: true,
      className: 'wrap-direction',
    },
    {
      name: (<>
        Chakbandi
      </>),
      selector: row => row.chakbandi,
      minWidth: '150px',
      wrap: true,
      className: 'wrap-direction',
    },
    {
      name: (
        <>
          East | West | South | North
        </>
      ),
      selector: row => row.directions,
      minWidth: '180px',
      wrap: true,
      className: 'wrap-direction',
    },
    {
      name: (<>Latitude, Longitude</>),
      selector: row => row.latLong,
      minWidth: '180px',
      wrap: true,
      className: 'wrap-direction',
    },
  ];


  // Sample data
  const [data, setData] = useState(Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    sno: i + 1,
    shape: 'Rectangle',
    siteNumber: `S-12${i}`,
    blockArea: 'Block A',
    numberOfSides: 4,
    dimension: '30x40',
    totalArea: '1200 sqft',
    cornerSite: 'Yes',
    typeOfSite: 'Residential',
    chakbandi: 'Done',
    directions: 'East: Road, West: House, South: Park, North: Empty',
    latLong: '12.9716, 77.5946',
  })));
  // Custom styling
  const customStyles = {
    headCells: {
      style: {
        fontWeight: 'bold',
        fontSize: '14px',
        whiteSpace: 'normal',
      },
    },
    cells: {
      style: {
        fontSize: '13px',
        whiteSpace: 'normal',
      },
    },
  };

  const [selectedValue, setSelectedValue] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [remainingRows, setRemainingRows] = useState([]);
  const [firstStepCompleted, setFirstStepCompleted] = useState(false);
  const [newTableData, setNewTableData] = useState([]);
const [originalTotal, setOriginalTotal] = useState(0);  

  const handleDropdownChange = (e) => {
    setSelectedValue(e.target.value);
    setSelectedRows([]);
    setRemainingRows([]);
    setFirstStepCompleted(false);
  };

  // const handleRowSelected = (selected) => {
  //   if (selectedValue === "60*40") {
  //     const total = data.length;
  //     const limit = firstStepCompleted ? Math.ceil(total * 0.4) : Math.floor(total * 0.6);

  //     if (selected.selectedRows.length > limit) {
  //       alert(`You can select only ${limit} rows`);
  //       return;
  //     }
  //   }
  //   setSelectedRows(selected.selectedRows);
  // };

 

 const [clearSelectionToggle, setClearSelectionToggle] = useState(false); // used to reset table checkboxes

  const handleRowSelected = (selected) => {
    const total = originalTotal || data.length;
    let limit = 0;

    if (selectedValue === "60*40") {
      if (!firstStepCompleted) {
        limit = Math.floor(total * 0.6);
      } else {
        limit = Math.ceil(total * 0.4);
      }

      // Debug
      console.log("Selected rows count:", selected.selectedRows.length);
      console.log("Current limit:", limit);
      console.log("Current visible data length:", data.length);

      if (selected.selectedRows.length > limit) {
        alert(`You can select only ${limit} rows (${firstStepCompleted ? '40' : '60'}% of ${total})`);
        return;
      }
    }

    // ✅ Update selection if within limit
    setSelectedRows(selected.selectedRows);
  };

  const handleSave = () => {
    if (selectedValue === '60*40') {
      if (!firstStepCompleted) {
        const total = data.length;
        const expected = Math.floor(total * 0.6);

        if (selectedRows.length !== expected) {
          alert(`Please select exactly 60% (${expected}) rows.`);
          return;
        }

        // ✅ Save selected 60% rows
        console.log('Selected 60% rows:', selectedRows);
        const newTableData = [...selectedRows];
        const updatedData = data.filter(row => !selectedRows.some(sel => sel.id === row.id));

        // ✅ Update state
        setOriginalTotal(total);
        setNewTableData(newTableData);
        setData(updatedData);
        setRemainingRows(updatedData);
        setFirstStepCompleted(true);

        // ✅ Clear selection
        setSelectedRows([]);
        setClearSelectionToggle(prev => !prev); // toggle to clear table checkbox UI

      } else {
        // Step 2 - Save 40%
        const expected = Math.ceil(originalTotal * 0.4);

        if (selectedRows.length !== expected) {
          alert(`Please select exactly 40% (${expected}) rows.`);
          return;
        }

        console.log('Final Save with 40% rows:', selectedRows);

        // Add your save logic for final 40% here
      }
    } else if (selectedValue === '100%') {
      if (selectedRows.length !== data.length) {
        alert("Please select all rows before saving.");
        return;
      }

      console.log("Saving all 100% data", selectedRows);

      // Add your save logic for 100% here
    }
  };



  const [showSiteReleaseFields, setShowSiteReleaseFields] = useState(false);

  const handleSubmitClick = () => {
    // Show the extra fields when the button is clicked
    setShowSiteReleaseFields(true);
  };


  return (
    <DashboardLayout>
      <div className={`layout-form-container ${loading ? 'no-interaction' : ''}`}> {loading && <Loader />}
        <div className="my-3 my-md-5">
          <div className="container mt-5">
            <div className="card">
              <div className="card-header layout_btn_color">
                <h5 className="card-title" style={{ textAlign: 'center' }}>Release Order</h5>
              </div>
              <div className="card-body">
                <div className='row'>
                  <div className='col-12 col-md-6'>
                    <div className="form-group mt-2">
                      <label className='form-label'>Enter the EPID or KRSID</label>
                      <input type="text" className="form-control" placeholder="Enter the EPID or KRSID" maxLength={15} />
                    </div>
                  </div>
                  <div className='col-12 col-md-2'>
                    <div className="form-group mt-6">
                      <button className='btn btn-primary btn-block'>Search</button>
                    </div>
                  </div>
                </div>
                <div className='row'>
                  <div className="form-group mt-2">
                    <label className='form-label'>Select Dimension</label>
                    <select className="form-control" value={selectedValue} onChange={handleDropdownChange}>
                      <option value="">-- Select Dimension --</option>
                      <option value="100%">100%</option>
                      <option value="60*40">60 * 40</option>
                      <option value="40*30*30">40 * 30 * 30</option>
                    </select>
                  </div>
                </div>
                {showSiteReleaseFields && (
                  <div className="mt-3">
                    <div className='row'>
                      {/* Site Release Order Number */}
                      <div className='col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4'>
                        <div className="form-group">
                          <label className='form-label'>Site Release Order Number</label>
                          <input type="text" className="form-control" placeholder="Enter Order Number" />
                        </div>
                      </div>
                      {/* Date Of Order */}
                      <div className='col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4'>
                        <div className="form-group">
                          <label className='form-label'>Date Of Order</label>
                          <input type="date" className="form-control" />
                        </div>
                      </div>
                      {/* Upload Order of Site Release */}
                      <div className='col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4'>
                        <div className="form-group">
                          <label className='form-label'>Scan & Upload Order of Site Release</label>
                          <input type="file" className="form-control" accept=".pdf,.jpg,.jpeg,.png" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Original table */}
                <div style={{ overflowX: "auto", padding: "1rem" }}>
                  <DataTable
                    title="Site Details"
                    columns={columns}
                    data={data}
                    pagination
                    selectableRows
                    onSelectedRowsChange={handleRowSelected}
                    persistTableHead
                    selectableRowsNoSelectAll={selectedValue !== "100%"}
                    selectableRowDisabled={row => {
                      if (selectedValue === "60*40") {
                        const total = data.length;
                        const limit = firstStepCompleted ? Math.ceil(total * 0.4) : Math.floor(total * 0.6);
                        return selectedRows.length >= limit && !selectedRows.some(r => r.id === row.id);
                      }
                      return false;
                    }}
                  />
                </div>
                <div className='row'>
                  <div className='col-md-10'></div>
                  <div className='col-md-2'>
                    <button className='btn btn-primary btn-block' onClick={handleSave}>Save</button>
                  </div>
                </div>



              </div>
            </div>

            {/* New table to display selected 60% rows without checkboxes */}


            {newTableData.length > 0 && (
              <div className="card">
                <div className="card-header layout_btn_color">
                  <h5 className="card-title" style={{ textAlign: 'center' }}>Release Order</h5>
                </div>
                <div className="card-body">
                  <div style={{ overflowX: "auto", padding: "1rem" }}>
                    <h5>New Table (60% Rows Selected)</h5>
                    <DataTable
                      title="New Site Details"
                      columns={columns}
                      data={newTableData}
                      pagination
                      selectableRows={false}
                    />
                  </div>
                  <div className='row'>
                    <div className='col-md-10'></div>
                    <div className='col-md-2'>
                      <button className='btn btn-primary btn-block' onClick={handleSubmitClick}>Submit</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ReleaseSiteSelection;