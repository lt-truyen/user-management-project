import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserForm from './UserForm';
import { Link } from "react-router-dom";


function UserList({ onLogout }) {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page:1, limit:10, pages:1, total:0 });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const res = await axios.get('/users', { params: { page, limit } });
      setData(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      if (err.response?.status === 401) {
        alert('Session expired. Please login again.');
        onLogout();
      } else {
        alert('Error fetching users');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{ fetchUsers(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Confirm delete this user?')) return;
    await axios.delete(`/users/${id}`);
    fetchUsers(pagination.page, pagination.limit);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const openCreate = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const onSaved = () => {
    setShowForm(false);
    fetchUsers(pagination.page, pagination.limit);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Users</h3>
        <div>
          <button className="btn btn-success me-2" onClick={openCreate}>Add user</button>
        </div>
      </div>

      {showForm && (
        <div className="card mb-3 p-3">
          <UserForm editingUser={editingUser} onSaved={onSaved} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {loading ? <p>Loading...</p> : (
        <>
          <table className="table table-striped">
            <thead>
              <tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Created</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {data.map((u, idx) => (
                <tr key={u.id}>
                  <td>{(pagination.page-1)*pagination.limit + idx + 1}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone}</td>
                  <td>{u.role}</td>
                  <td>{new Date(u.created_at).toLocaleString()}</td>
                  <td>
                    <Link to={`/users/${u.id}`} className="btn btn-sm btn-primary me-2">Edit</Link>
                    <button className="btn btn-sm btn-danger" onClick={()=>handleDelete(u.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="d-flex justify-content-between align-items-center">
            <div>Showing page {pagination.page} / {pagination.pages} — total {pagination.total}</div>
            <div>
              <button className="btn btn-sm btn-outline-primary me-1" disabled={pagination.page<=1} onClick={()=>fetchUsers(1)}>First</button>
              <button className="btn btn-sm btn-outline-primary me-1" disabled={pagination.page<=1} onClick={()=>fetchUsers(pagination.page-1)}>Prev</button>
              <button className="btn btn-sm btn-outline-primary me-1" disabled={pagination.page>=pagination.pages} onClick={()=>fetchUsers(pagination.page+1)}>Next</button>
              <button className="btn btn-sm btn-outline-primary" disabled={pagination.page>=pagination.pages} onClick={()=>fetchUsers(pagination.pages)}>Last</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default UserList;
