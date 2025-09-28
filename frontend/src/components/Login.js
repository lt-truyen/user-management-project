import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";

function Login({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(null);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });

      // ✅ Lưu token vào localStorage
      localStorage.setItem('token', res.data.token);

      // Nếu bạn vẫn muốn giữ state token
      setToken(res.data.token);

      nav('/users');
    } catch (error) {
      setErr(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <h3>Login</h3>
        {err && <div className="alert alert-danger">{err}</div>}
        <form onSubmit={submit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="form-control"
              type="email"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="form-control"
              type="password"
              required
            />
          </div>
          <button className="btn btn-primary" type="submit">Login</button>
          <Link className="nav-link" to="/users/forgot-password/">Forgot password</Link>
        </form>
      </div>
    </div>
  );
}

export default Login;
