import React, { useState } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";

import axios from "axios";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  //const token = searchParams.get("token");
  const  {token} = useParams();

  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`/users/reset-password/${token}`, {
        password,
      });
      setMsg(res.data.message);
      setErr(null);
      setTimeout(() => navigate("/login"), 2000); // quay về login sau 2s
    } catch (error) {
      setErr(error.response?.data?.message || "Something went wrong");
      setMsg(null);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <h3>Reset Password</h3>
        {msg && <div className="alert alert-success">{msg}</div>}
        {err && <div className="alert alert-danger">{err}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-success">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
