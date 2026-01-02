import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (user && user.tenant_id) {
        try {
          const res = await api.get(`/tenants/${user.tenant_id}`);
          setStats(res.data.data.stats);
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchStats();
  }, [user]);

  return (
    <div className="container main-content">
      <div className="card">
        <h1>Welcome, {user?.fullName}</h1>
        <p className="form-label">Tenant: {user?.tenant?.name || 'Loading...'}</p>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Projects</h3>
            <div className="stat-number">{stats.totalProjects}</div>
          </div>
          <div className="stat-card">
            <h3>Tasks</h3>
            <div className="stat-number">{stats.totalTasks}</div>
          </div>
          <div className="stat-card">
            <h3>Users</h3>
            <div className="stat-number">{stats.totalUsers}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;