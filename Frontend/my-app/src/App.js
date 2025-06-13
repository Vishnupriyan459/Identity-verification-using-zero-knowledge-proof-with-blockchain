import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import './App.css';
import Home from './Pages/Home';
import Login from './Pages/Login';
import Register from './Pages/Register';
import { MdAccountCircle } from "react-icons/md";
import AddNewPage from './Pages/AddNewPage';
import PrivateRoute from "./component/PrivateRoute";
import { CiLogout } from "react-icons/ci";
import VerificationStatusPage from "./Pages/VerificationStatusPage";


function App() {
  const [token, setToken] = useState(Boolean(localStorage.getItem("token")));

  useEffect(() => {
    // Listen for localStorage changes
    const handleStorageChange = () => {
      setToken(Boolean(localStorage.getItem("token")));
    };

    // Listen for changes in localStorage
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(false);  // Update state
    window.location.href = "/login"; // Redirect to login page
  };

  return (
    <Router>
      <nav className="flex justify-between items-center bg-gradient-to-r from-[#0F2061] to-[#0F3852] p-2">
        <div>
          <img src="./SecureGo.png" alt="SecureGo" className="w-[3rem] h-[3rem] rounded-full" />
        </div>
        <ul className="flex items-center gap-10">
          <li className="text-[1rem] text-white"><Link to="/">Home</Link></li>
          {
            !token ? (
              <li><Link to="/Login"><MdAccountCircle className="text-[2rem] text-white"/> </Link></li>
            ) : (
              <li onClick={handleLogout}><CiLogout className="text-[1.5rem] text-white"/> </li>
            )
          }
        </ul>
      </nav>

      <Routes>
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Home />} />
        </Route>
        <Route path="/Register" element={<Register />} />
        <Route path="/Login" element={<Login />} />
        <Route path='/add' element={<AddNewPage />}/>
        <Route path='/government' element={<VerificationStatusPage />}/>
      </Routes>
    </Router>
  );
}

export default App;
