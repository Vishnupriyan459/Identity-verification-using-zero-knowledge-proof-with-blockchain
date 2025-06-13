import React, { useState, useEffect } from "react";
import { Upload } from "lucide-react";

const IdentityVerificationForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    idType: "",
    idNumber: "",
    address: "",
    phone: "",
    otp: "",
  });

  const [apiData, setApiData] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [type, setType] = useState();

  const fetchProofData = async (idType) => {
    //const token = localStorage.getItem("token");
    function getCookie(name) {
      const cookies = document.cookie.split("; ");
      for (let i = 0; i < cookies.length; i++) {
        let [key, value] = cookies[i].split("=");
        if (key === name) return decodeURIComponent(value);
      }
      return null;
    }

    // Retrieve the token from cookies
    const token = getCookie("token");

    if (token) {
      console.log("Token:", token);
    } else {
      console.log("Token not found in cookies");
    }

    if (!token) {
      alert("Please connect with SecureGo website");
      return;
    }

    try {
      const toker = JSON.parse(token);

      const response = await fetch(
        `http://localhost:3000/proof/check/${idType}`,
        {
          headers: {
            "x-auth-token": toker.token,
          },
        }
      );
      const result = await response.json();

      if (result.messaging) {
        setApiData(result.data);
        // Populate form based on ID type
        if (idType === "Aadhaar") {
          setFormData({
            fullName: result.data.Name,
            idType: "aadhaar",
            idNumber: result.data.Aadhaar.toString(),
            address: result.data.Address,
            phone: result.data.Phone.toString(),
            otp: "",
          });
        } else if (idType === "Pan") {
          setFormData({
            fullName: result.data.name,
            idType: "pan",
            idNumber: result.data.panNumber,
            address: result.data.Address,
            phone: result.data.Phone.toString(),
            otp: "",
          });
        }
        setIsVerified(true);
      } else {
        setIsVerified(false);
        alert("You need to reupload the data");
      }
    } catch (error) {
      console.error("Error fetching proof data:", error);
      alert("Error connecting to the server");
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    if (id === "idType") {
      if (value === "aadhaar") {
        // fetchProofData('Aadhaar');
        setType("Aadhaar");
      } else if (value === "pan") {
        // fetchProofData('Pan');
        setType("Pan");
      }
    }
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isVerified) {
        alert("Document verified successfully!");
      } else {
        alert("You need to reupload the data");
      }
    }
  };

  const sendOTP = () => {
    if (formData.phone) {
      console.log("Sending OTP to:", formData.phone);
      alert("OTP sent successfully!");
    } else {
      alert("Please enter a phone number first");
    }
  };
  const verifyhandlesubmit = () => {
    alert("Datas are verified");
    console.log("verifed ");
  };
  const handlesubmit = () => {
    alert("Please wait we need manual verification");
    console.log("wait,verifed ");
  };

  const handleVerify = () => {
    if (!type) {
      alert("Please select an ID type first");
      return;
    }

    fetchProofData(type); // Fetch proof data based on selected type

    setFormData((prev) => ({
      ...prev,
      idType: type, // Ensures formData correctly reflects the selected type
    }));

    console.log("Updated Form Data:", { ...formData, idType: type });
  };

  return (
    <div className="w-[100%] mx-auto p-4">
      <header className="flex items-center gap-5 mb-8">
        <img
          src="/gov.png"
          alt="Registration Department Logo"
          className="h-12"
        />
      </header>

      <h1 className="text-2xl font-bold mb-6">Proof of Identity</h1>

      <div className="bg-[#C2EBC9] rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="space-y-2">
            <label
              htmlFor="fullName"
              className="font-semibold text-gray-700 block"
            >
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              className="w-full px-4 py-2 rounded-lg border bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter the Full name as per doc"
              value={formData.fullName}
              onChange={handleInputChange}
              readOnly={isVerified}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="idType"
              className="font-semibold text-gray-700 block"
            >
              Identity Type
            </label>
            <select
              id="idType"
              className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.idType}
              onChange={handleInputChange}
            >
              <option value="">Choose the Id Type</option>
              <option value="aadhaar">Aadhaar</option>
              <option value="pan">PAN</option>
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="idNumber"
              className="font-semibold text-gray-700 block"
            >
              Identity No:
            </label>
            <input
              type="text"
              id="idNumber"
              className="w-full px-4 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter the Id as per type"
              value={formData.idNumber}
              onChange={handleInputChange}
              readOnly={isVerified}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="address"
              className="font-semibold text-gray-700 block"
            >
              Address
            </label>
            <textarea
              id="address"
              className="w-full px-4 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 h-24"
              placeholder="Enter the Full name as per doc"
              value={formData.address}
              onChange={handleInputChange}
              readOnly={isVerified}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="phone"
              className="font-semibold text-gray-700 block"
            >
              Phone No:
            </label>
            <input
              type="tel"
              id="phone"
              className="w-full px-4 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Number in your Id"
              value={formData.phone}
              onChange={handleInputChange}
              readOnly={isVerified}
            />
          </div>

          {/* <div className="space-y-2">
            <label htmlFor="otp" className="font-semibold text-gray-700 block">
              OTP No:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="otp"
                className="flex-1 px-4 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Number in your otp"
                value={formData.otp}
                onChange={handleInputChange} 
              />
              <button
                onClick={sendOTP}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                OTP
              </button>
            </div>
          </div> */}
        </div>
        {/* {!isVerified?} */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-200">
          {/* {!isVerified?<div>
            <h3 className="font-semibold mb-4">UPLOAD YOUR ID</h3>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center cursor-pointer hover:bg-gray-50 bg-white"
              onClick={() => document.getElementById('fileInput').click()}
            >
              <Upload className="mx-auto mb-4 text-gray-600" size={32} />
              <input
                id="fileInput"
                type="file"
                className="hidden bg-white"
                accept="image/*"
                onChange={handleFileUpload}
              />
             
            </div>
            <button
              className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              UPLOAD
            </button>
            <button
          className=" mt-2 mx-10 px-1 py-1 bg-green-600 text-white flex jusitfy-center items-center rounded-lg hover:bg-green-700 transition-colors"
          onSubmit={handlesubmit}
        >
          submit
        </button>
          </div>:
          <button
          className=" px-1 py-1 bg-green-600 text-white flex jusitfy-center items-center rounded-lg hover:bg-green-700 transition-colors"
          onSubmit={verifyhandlesubmit}
        >
          submit
        </button>
            
          } */}
          {!isVerified ? (
            <div>
              <h3 className="font-semibold mb-4">UPLOAD YOUR ID</h3>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center cursor-pointer hover:bg-gray-50 bg-white"
                onClick={() => document.getElementById("fileInput").click()}
              >
                <Upload className="mx-auto mb-4 text-gray-600" size={32} />
                <input
                  id="fileInput"
                  type="file"
                  className="hidden bg-white"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </div>

              <button
                className="w-full mt-4 px-6 py-2 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all duration-300 shadow-md"
                onClick={handleFileUpload}
              >
                UPLOAD
              </button>

              <button
                className="w-full mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-md"
                onClick={handlesubmit}
              >
                Submit for Manual Verification
              </button>
            </div>
          ) : (
            <button
              className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all duration-300 shadow-md"
              onClick={verifyhandlesubmit}
            >
              Verify and Submit
            </button>
          )}

          <div className="flex flex-col items-center justify-center">
            <h2 className="text-xl font-semibold mb-4 text-center">
              One step to verify
              <br />
              without waiting time
            </h2>
            <button
              onClick={handleVerify}
              className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors "
            >
              Connect with SecureGo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdentityVerificationForm;
