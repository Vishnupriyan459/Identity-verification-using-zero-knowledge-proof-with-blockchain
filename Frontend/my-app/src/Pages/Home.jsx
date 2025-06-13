import { React, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Home = () => {
  const [identityData, setIdentityData] = useState([]);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Fetch the status of Aadhaar and Pan from the backend
      const id=user[0]._id
      
      const fetchStatus = async () => {
        try {
          const response = await fetch(`http://localhost:3000/api/users/status/${id}`);
          const data = await response.json();
          
          const updatedIdentityData = [
            {
              id: 1,
              type: 'Aadhar Card',
              status: data.aadhaar ? (data.aadhaar.result === 'true' ? 'Verified' : 'Canceled') : 'Pending',
              proofId: data.aadhaar ? data.aadhaar.proofId : null,
            },
            {
              id: 2,
              type: 'Pan Card',
              status: data.pan ? (data.pan.result === 'true' ? 'Verified' : 'Canceled') : 'Pending',
              proofId: data.pan ? data.pan.proofId : null,
            },
          ];

          setIdentityData(updatedIdentityData);
        } catch (error) {
          console.error('Error fetching identity status:', error);
        }
      };

      fetchStatus();
    }
  }, [user]);

  const handleButtonClick = (item) => {
    if (item.status === 'Verified' || item.status === 'Canceled') {
      // If the status is verified or canceled, navigate to the add page with "reupload" option
      navigate(`/add?proofId=${item.proofId}`);
    } else if (item.status === 'Pending') {
      // If status is pending, navigate to the add page with "upload" option
      navigate('/add');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-800 p-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Identity Card */}
        <div className="bg-blue-950 rounded-lg p-6 text-white text-center">
          <h2 className="text-xl mb-4">No of Identity</h2>
          <p className="text-4xl font-bold">2</p>
        </div>

        {/* Verified Identity Card */}
        <div className="bg-blue-950 rounded-lg p-6 text-white text-center">
          <h2 className="text-xl mb-4">No of Verified Identity</h2>
          <p className="text-4xl font-bold">{identityData.filter(item => item.status === 'Verified').length}</p>
        </div>

        {/* Info Card */}
        <div className="bg-blue-950 rounded-lg p-6 text-white">
          <h2 className="text-xl mb-4">Info</h2>
          <div className="space-y-2">
            <p>Username: {user && user[0].name}</p>
            <p>Phone no: +91 xxxxx xxxxx</p>
          </div>
        </div>
      </div>

      {/* Add New Button */}
      <div className="flex justify-end mb-8">
        <Link
          to='/add'
          className="bg-blue-950 text-white px-6 py-2 rounded-full hover:bg-blue-900 transition-colors"
        >
          Add New+
        </Link>
      </div>

      {/* Identity Table */}
      <div className="bg-white rounded-lg overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">S.No</th>
              <th className="p-4 text-left">Identity Name</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Proof ID</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {identityData.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="p-4">{item.id}</td>
                <td className="p-4">{item.type}</td>
                <td className="p-4">
                  <span className={`px-4 py-1 rounded-full ${
                    item.status === 'Verified'
                      ? 'bg-green-100 text-green-600'
                      : item.status === 'Canceled'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-4">{item.proofId}</td>
                <td className="p-4">
                  <button
                    onClick={() => handleButtonClick(item)}
                    className="bg-blue-950 text-white px-4 py-1 rounded-full hover:bg-blue-900 transition-colors"
                  >
                    {item.status === 'Pending' ? 'Upload' : 'Reupload'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
