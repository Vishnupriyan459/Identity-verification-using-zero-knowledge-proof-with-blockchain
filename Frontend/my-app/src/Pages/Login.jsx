import React, { useState } from "react";
import { useNavigate,Link } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/api/users/login", formData);

      if (response) {
        localStorage.setItem("token", response.data.token);
        const user = response.data.account;
        localStorage.setItem("user", JSON.stringify(user));
        document.cookie = "token=" + encodeURIComponent(JSON.stringify({ token: response.data.token })) + "; path=/; SameSite=None; Secure";

         // Fixed line

        navigate("/"); // Redirect to home page
      }
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen bg-blue-900 flex items-center justify-center p-4">
      <div className="bg-slate-400/30 backdrop-blur-sm rounded-3xl p-8 w-full max-w-md">
        <h1 className="text-2xl text-white text-center font-serif mb-8">Login</h1>
        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Username or number"
            className="w-full bg-transparent border-b border-white/50 py-2 text-white placeholder-white/70 focus:outline-none"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-transparent border-b border-white/50 py-2 text-white placeholder-white/70 focus:outline-none"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <button type="submit" className="w-full bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-800">
            Login
          </button>
          <div className="text-white font-[300]">Don't you have an account? <Link  to='/Register' className="font-[500] cursor-pointer" >create one</Link></div>
        </form>
      </div>
    </div>
  );
};

export default Login;
