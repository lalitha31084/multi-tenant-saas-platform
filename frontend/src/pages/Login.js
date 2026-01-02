import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '', subdomain: '' });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(formData.email, formData.password, formData.subdomain);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Login</h2>
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Subdomain (Tenant)</label>
            <input 
              className="form-input"
              type="text" 
              placeholder="e.g. demo"
              value={formData.subdomain}
              onChange={(e) => setFormData({...formData, subdomain: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              className="form-input"
              type="email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              className="form-input"
              type="password" 
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <button type="submit" className="btn" style={{ width: '100%' }}>Login</button>
        </form>
        <p style={{ marginTop: '15px', textAlign: 'center' }}>
          No account? <Link to="/register">Register Tenant</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;