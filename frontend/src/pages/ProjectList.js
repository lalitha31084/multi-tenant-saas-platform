import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  const fetchProjects = async () => {
    const res = await api.get('/projects');
    setProjects(res.data.data.projects);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      setShowModal(false);
      setNewProject({ name: '', description: '' });
      fetchProjects();
    } catch (err) {
      alert('Error creating project');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete project?')) {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    }
  };

  return (
    <div className="container main-content">
      <div className="card-header">
        <h2>Projects</h2>
        <button className="btn" onClick={() => setShowModal(true)}>+ New Project</button>
      </div>

      {showModal && (
        <div className="card" style={{ marginBottom: '20px', border: '2px solid var(--primary)' }}>
          <h3>Create Project</h3>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <input 
                className="form-input" 
                placeholder="Project Name" 
                value={newProject.name}
                onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <textarea 
                className="form-textarea" 
                placeholder="Description"
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
              />
            </div>
            <button type="submit" className="btn">Save</button>
            <button type="button" className="btn btn-secondary" style={{marginLeft: '10px'}} onClick={() => setShowModal(false)}>Cancel</button>
          </form>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Tasks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link to={`/projects/${p.id}`} style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                    {p.name}
                  </Link>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>{p.description}</div>
                </td>
                <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                <td>{p.task_count || 0}</td>
                <td>
                  <button onClick={() => handleDelete(p.id)} className="btn btn-sm btn-danger">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectList;