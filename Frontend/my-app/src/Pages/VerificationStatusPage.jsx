import React, { useState, useEffect } from 'react';

const VerificationStatusPage = () => {
  const [verificationStatus, setVerificationStatus] = useState({
    aadhaar: { result: false, proofId: null },
    pan: { result: false, proofId: null }
  });
  const [showNewSubmission, setShowNewSubmission] = useState(false);
  const [documentType, setDocumentType] = useState('aadhaar');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phoneNo: '',
    identityNo: '',
    otp: ''
  });

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      const user = localStorage.getItem('user');
      
      const userdetails=JSON.parse(user)
      console.log(userdetails[0]._id);
      
      
      const response = await fetch(`http://localhost:3000/api/users/status/${userdetails[0]._id}`);
     
      
      const data = await response.json();
      setVerificationStatus(data);
    } catch (error) {
      console.error('Error checking verification status:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Add your submission logic here similar to AddNewPage
    setShowNewSubmission(false);
    await checkVerificationStatus(); // Refresh status after submission
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-800 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-8 text-center">Document Verification Status</h1>

        {/* Status Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Aadhaar Status</h2>
            <div className={`text-lg ${verificationStatus.aadhaar.result ? 'text-green-600' : 'text-red-600'}`}>
              {verificationStatus.aadhaar.result ? 'Verified' : 'Not Verified'}
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-semibold mb-2">PAN Status</h2>
            <div className={`text-lg ${verificationStatus.pan.result ? 'text-green-600' : 'text-red-600'}`}>
              {verificationStatus.pan.result ? 'Verified' : 'Not Verified'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setShowNewSubmission(true)}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Submit New Document
          </button>
          <button
            onClick={handleBackToHome}
            className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Back to Home
          </button>
        </div>

        {/* New Submission Form */}
        {showNewSubmission && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-6">Submit New Document</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Document Type</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="aadhaar">Aadhaar Card</option>
                  <option value="pan">PAN Card</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter Full Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {documentType === 'aadhaar' ? 'Aadhaar Number' : 'PAN Number'}
                </label>
                <input
                  type="text"
                  name="identityNo"
                  value={formData.identityNo}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder={`Enter ${documentType === 'aadhaar' ? 'Aadhaar' : 'PAN'} Number`}
                />
              </div>

              {documentType === 'aadhaar' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="Enter Address"
                    rows="3"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l">
                    +91
                  </span>
                  <input
                    type="tel"
                    name="phoneNo"
                    value={formData.phoneNo}
                    onChange={handleInputChange}
                    className="flex-1 p-2 border rounded-r"
                    placeholder="Enter phone number"
                    maxLength="10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">OTP</label>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter OTP"
                  maxLength="6"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewSubmission(false)}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationStatusPage;