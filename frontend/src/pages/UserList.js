import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const UserList = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ email: '', fullName: '', password: '', role: 'user' });

  // Fetch users for this tenant
  const fetchUsers = async () => {
    if (user && user.tenant_id) {
      try {
        // The API route is /api/tenants/:tenantId/users
        const res = await api.get(`/tenants/${user.tenant_id}/users`);
        setUsers(res.data.data.users);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/tenants/${user.tenant_id}/users`, formData);
      setShowModal(false);
      setFormData({ email: '', fullName: '', password: '', role: 'user' });
      fetchUsers(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add user');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${userId}`);
        fetchUsers();
      } catch (err) {
        alert('Failed to delete user');
      }
    }
  };

  return (
    <div className="container main-content">
      <div className="card-header">
        <h2>Team Members</h2>
        <button className="btn" onClick={() => setShowModal(true)}>+ Add User</button>
      </div>

      {showModal && (
        <div className="card" style={{ border: '2px solid var(--primary)', marginBottom: '20px' }}>
          <h3>Add New User</h3>
          <form onSubmit={handleAddUser}>
            <div className="form-group">
              <input className="form-input" placeholder="Full Name" required 
                value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
            </div>
            <div className="form-group">
              <input className="form-input" type="email" placeholder="Email" required 
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="form-group">
              <input className="form-input" type="password" placeholder="Password" required 
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            <div className="form-group">
              <select className="form-select" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="user">Regular User</option>
                <option value="tenant_admin">Tenant Admin</option>
              </select>
            </div>
            <button type="submit" className="btn">Create User</button>
            <button type="button" className="btn btn-secondary" style={{ marginLeft: '10px' }} onClick={() => setShowModal(false)}>Cancel</button>
          </form>
        </div>
      )}

      <div className="table-container card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.full_name}</td>
                <td>{u.email}</td>
                <td><span className="badge badge-in_progress">{u.role}</span></td>
                <td>
                  {u.id !== user.id && (
                    <button onClick={() => handleDelete(u.id)} className="btn btn-sm btn-danger">Remove</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;