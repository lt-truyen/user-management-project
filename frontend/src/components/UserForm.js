import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function UserForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "user",

  });
  const [err, setErr] = useState(null);
  const nav = useNavigate();
  const { id } = useParams(); // nếu có id => edit mode

  // Nếu có id => load dữ liệu user để edit
  useEffect(() => {
    if (id) {
      axios
        .get(`/users/${id}`)
        .then((res) => {
          setForm({ ...res.data, password: "" }); // không hiển thị password
        })
        .catch((e) => setErr(e.response?.data?.message || "Error loading user"));
    }
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        // update user
        await axios.put(`/users/${id}`, form);
        alert("User updated!");
      } else {
        // create user
        await axios.post("/users", form);
        alert("User created!");
      }
      nav("/users");
    } catch (error) {
      setErr(error.response?.data?.message || "Save failed");
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <h3>{id ? "Edit User" : "Add User"}</h3>
        {err && <div className="alert alert-danger">{err}</div>}
        <form onSubmit={submit}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="form-control"
              required
              disabled={id} // không cho sửa email khi edit
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="form-control"
              placeholder={id ? "Leave blank to keep old password" : ""}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="form-control"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="post">Post</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Updated: {form.updated_at}</label>         
            
          </div>
          <button className="btn btn-success" type="submit">
            {id ? "Update" : "Create"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UserForm;
