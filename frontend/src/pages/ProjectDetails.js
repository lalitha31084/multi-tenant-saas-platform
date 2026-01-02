import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const ProjectDetails = () => {
  const { id } = useParams();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium' });

  const fetchTasks = async () => {
    const res = await api.get(`/projects/${id}/tasks`);
    setTasks(res.data.data.tasks);
  };

  useEffect(() => {
    fetchTasks();
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/tasks`, newTask);
      setNewTask({ title: '', priority: 'medium' });
      fetchTasks();
    } catch (err) {
      alert('Error creating task');
    }
  };

  const updateStatus = async (taskId, newStatus) => {
    await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
    fetchTasks();
  };

  return (
    <div className="container main-content">
      <div className="card">
        <h2>Project Tasks</h2>
        <form onSubmit={handleCreateTask} style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <input 
            className="form-input" 
            placeholder="New Task Title" 
            value={newTask.title}
            onChange={(e) => setNewTask({...newTask, title: e.target.value})}
            required
          />
          <select 
            className="form-select"
            value={newTask.priority}
            onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
            style={{ width: '150px' }}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button type="submit" className="btn">Add Task</button>
        </form>
      </div>

      <div className="table-container card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id}>
                <td>{t.title}</td>
                <td><span className={`badge badge-${t.priority}`}>{t.priority}</span></td>
                <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
                <td>
                  {t.status !== 'completed' && (
                    <button onClick={() => updateStatus(t.id, 'completed')} className="btn btn-sm btn-success" style={{ marginRight: '5px' }}>
                      Complete
                    </button>
                  )}
                  {t.status === 'completed' && (
                    <button onClick={() => updateStatus(t.id, 'in_progress')} className="btn btn-sm btn-secondary">
                      Reopen
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {tasks.length === 0 && <tr><td colSpan="4" style={{textAlign: 'center'}}>No tasks yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectDetails;