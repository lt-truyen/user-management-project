import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./components/Login";
import UserList from "./components/UserList";
import UserForm from "./components/UserForm";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import axios from "axios";

function App() {
  const [token, setToken] = useState(null);

  // ✅ Load token từ localStorage khi app khởi động
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  // ✅ Cấu hình axios: luôn gửi token trong header
  useEffect(() => {
    axios.defaults.baseURL = "http://localhost:5000/api";
    axios.interceptors.request.use((config) => {
      const t = localStorage.getItem("token");
      if (t) {
        config.headers.Authorization = `Bearer ${t}`;
      }
      return config;
    });
  }, []);

  // ✅ Logout: xoá token
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <Router>
      <div className="container mt-4">
        <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
          <div className="container-fluid">
            <Link className="navbar-brand" to="/">Gara</Link>
            <div className="collapse navbar-collapse">
              <ul className="navbar-nav ms-auto">
                {token ? (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/users">Users</Link>
                    </li>
                    <li className="nav-item">
                      <button className="btn btn-outline-danger ms-2" onClick={handleLogout}>
                        Logout
                      </button>
                    </li>
                  </>
                ) : (
                  <li className="nav-item">
                    <Link className="nav-link" to="/login">Login</Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/users/forgot-password" element={<ForgotPassword />} />
          <Route path="/users/reset-password/:token" element={<ResetPassword />} />
          {token && (
            <>
              <Route path="/users" element={<UserList />} />
              <Route path="/users/new" element={<UserForm />} />
              <Route path="/users/:id" element={<UserForm />} /> {/* ✅ edit mode */}
            </>
          )}
        </Routes>        
        
      </div>
    </Router>
  );
}

export default App;
