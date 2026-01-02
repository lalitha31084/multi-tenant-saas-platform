import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const RegisterTenant = () => {
  const [formData, setFormData] = useState({ 
    tenantName: '', subdomain: '', adminEmail: '', adminPassword: '', adminFullName: '' 
  });
  const { registerTenant } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerTenant(formData);
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Register Organization</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Organization Name</label>
            <input className="form-input" required onChange={(e) => setFormData({...formData, tenantName: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Subdomain</label>
            <input className="form-input" required onChange={(e) => setFormData({...formData, subdomain: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Admin Name</label>
            <input className="form-input" required onChange={(e) => setFormData({...formData, adminFullName: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <input className="form-input" type="email" required onChange={(e) => setFormData({...formData, adminEmail: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" required onChange={(e) => setFormData({...formData, adminPassword: e.target.value})} />
          </div>
          <button type="submit" className="btn" style={{ width: '100%' }}>Register</button>
        </form>
        <p style={{ marginTop: '15px', textAlign: 'center' }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterTenant;