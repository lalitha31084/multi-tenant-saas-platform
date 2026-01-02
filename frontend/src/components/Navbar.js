import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand">SaaS Platform</Link>
      <div className="nav-links">
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
        <Link to="/projects" className="nav-link">Projects</Link>
        {user.role === 'tenant_admin' && (
           <Link to="/users" className="nav-link">Users</Link>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="badge badge-in_progress">{user.role}</span>
          <button onClick={handleLogout} className="btn btn-sm btn-secondary">Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;