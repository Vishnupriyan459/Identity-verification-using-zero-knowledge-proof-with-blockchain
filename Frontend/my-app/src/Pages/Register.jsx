import React, { useState } from "react";
import { useNavigate,Link } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/api/users/register", formData);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        const user =  response.data.account
        localStorage.setItem("user", JSON.stringify(user)); // Store token
        navigate("/Login");
      }
    } catch (err) {
      setError("Registration failed",err);
    }
  };

  return (
    <div className="min-h-screen bg-blue-900 flex items-center justify-center p-4">
      <div className="bg-slate-400/30 backdrop-blur-sm rounded-3xl p-8 w-full max-w-md">
        <h1 className="text-2xl text-white text-center font-serif mb-8">Register</h1>
        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full bg-transparent border-b border-white/50 py-2 text-white placeholder-white/70 focus:outline-none"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full bg-transparent border-b border-white/50 py-2 text-white placeholder-white/70 focus:outline-none"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="tel"
            placeholder="Phone Number"
            className="w-full bg-transparent border-b border-white/50 py-2 text-white placeholder-white/70 focus:outline-none"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-transparent border-b border-white/50 py-2 text-white placeholder-white/70 focus:outline-none"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <button type="submit" className="w-full bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-800">
            Register Now
          </button>
        </form>
        <div className="text-white font-[300]">Do you have an account? <Link  to='/Login' className="font-[500] cursor-pointer" >Login</Link></div>

      </div>
    </div>
  );
};

export default Register;
