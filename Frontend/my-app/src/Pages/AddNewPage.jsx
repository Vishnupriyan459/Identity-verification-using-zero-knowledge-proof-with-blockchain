import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
const AddNewPage = () => {
  const [documentType, setDocumentType] = useState('aadhaar');
  const [phone, setPhone] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    dob: '',
    aadhaarNumber: '',
    panNumber: '',
    address: '',
    age: '',
    otp: ''
  });
  const xheader = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleDocumentNumberSubmit = async () => {
    try {
      setError(null);
      const endpoint = documentType === 'aadhaar' 
        ? 'http://localhost:3000/api/Aadhaar/Phonegetter'
        : 'http://localhost:3000/api/Pancard/Phonegetter';
      
      const payload = documentType === 'aadhaar'
        ? { adhaarnumber: formData.aadhaarNumber }
        : { panNumber: formData.panNumber };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          
        },
        body: JSON.stringify(payload),

      });

      const data = await response.json();

if (!response.ok) {
  setError(`Error: ${data.message || 'Failed to fetch phone number'}`);
  return;
}

if (!data || !data.phoneNumber) {
  alert("No Record found");
  setError("Please check your ID");
  setShowPhoneInput(false);
} else {
  setPhone(String(data.phoneNumber));
  setShowPhoneInput(true);
}

    } catch (err) {
      setError(err.message || `Error fetching phone number for ${documentType}`);
    }
  };

  const sendOtp = async () => {
    try {
      setError(null);
      if (!phone) {
        setError('Please enter a valid phone number');
        return;
      }
      
      // Simulating OTP send - replace with your actual OTP sending logic
      setOtpSent(true);
      console.log('OTP sent to:', phone);
      
    } catch (err) {
      setError(err.message || 'Error sending OTP');
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      if (formData.otp) {
        // Replace with your actual OTP verification logic
        setOtpVerified(true);
        console.log('OTP verified successfully');
      }
    } catch (err) {
      setError(err.message || 'Error verifying OTP');
    }
  };

  const handleSubmitData = async () => {
    if (!otpVerified) {
      setError('Please verify OTP first');
      return;
    }
  
    try {
      const formatDob = (date) => {
        if (!date) return "";
        const dobDate = new Date(date);
        return (
          dobDate.getFullYear().toString() +
          String(dobDate.getMonth() + 1).padStart(2, "0") +
          String(dobDate.getDate()).padStart(2, "0")
        );
      };
  
      const formattedDob = formatDob(formData.dob);
  
      const endpoint =
        documentType === "aadhaar"
          ? "http://localhost:3000/proof/generateAadhaar"
          : "http://localhost:3000/proof/generatePancard";
  
      const payload =
        documentType === "aadhaar"
          ? {
              name: formData.name,
              address: formData.address,
              aadhaarNumber: formData.aadhaarNumber,
              fathername: formData.fatherName,
              dob: formattedDob, // Pass formatted DOB here
              age: formData.age,
            }
          : {
              panNumber: formData.panNumber,
              name: formData.name,
              fathername: formData.fatherName,
              dob: formattedDob, // Pass formatted DOB here
            };
  
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": xheader,
        },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
      if (data.message === "Token is not valid") {
        alert("Need to Login again");
        localStorage.removeItem("token");
        navigate("/Login");
      }
      navigate("/");
  
      console.log("Data submitted successfully:", data);
    } catch (err) {
      setError(err.message || "Error submitting data");
    }
  };
  const maskAadhaar = (number) => {
    if (!number) return '';
    const visibleDigits = number.slice(-4);
    const masked = '*'.repeat(number.length - 4);
    return masked + visibleDigits;
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setPhone(value);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-800 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-8 text-center">New Document Verification</h1>

          <div className="space-y-6">
            {/* Document Type Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Select Document Type</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="aadhaar">Aadhaar Card</option>
                <option value="pan">PAN Card</option>
              </select>
            </div>

            {/* Document Number Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                {documentType === 'aadhaar' ? 'Aadhaar Number' : 'PAN Number'}
              </label>
              <input
                type="text"
                name={documentType === 'aadhaar' ? 'aadhaarNumber' : 'panNumber'}
                value={documentType === 'aadhaar' ? formData.aadhaarNumber : formData.panNumber}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder={documentType === 'aadhaar' ? 'Enter Aadhaar Number' : 'Enter PAN Number'}
              />
              <button
                onClick={handleDocumentNumberSubmit}
                className="w-full mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Verify Document
              </button>
            </div>

            {/* Phone and OTP Section */}
            {showPhoneInput && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Phone Number</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={maskAadhaar(phone)}
                      onChange={handlePhoneChange}
                      className="flex-1 p-2 border rounded-r"
                      placeholder="Enter phone number"
                      maxLength="10"
                      disabled
                    />
                  </div>
                </div>

                <button
                  onClick={sendOtp}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Send OTP
                </button>

                {otpSent && (
                  <>
                    <input
                      type="password"
                      name="otp"
                      placeholder="Enter OTP"
                      value={formData.otp}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      maxLength="6"
                    />
                    <button
                      onClick={handleOtpSubmit}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Verify OTP
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Additional Details Form */}
            {otpVerified && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Additional Details</h2>
                
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
                
                <input
                  type="text"
                  name="fatherName"
                  placeholder="Father's Name"
                  value={formData.fatherName}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
                
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />

                {documentType === 'aadhaar' && (
                  <>
                    <input
                      type="text"
                      name="address"
                      placeholder="Address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    />
                    
                    <input
                      type="number"
                      name="age"
                      placeholder="Age"
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    />
                  </>
                )}

                <button
                  onClick={handleSubmitData}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Submit Details
                </button>
              </div>
            )}

            {error && (
              <div className="text-red-500 text-center p-2">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNewPage;