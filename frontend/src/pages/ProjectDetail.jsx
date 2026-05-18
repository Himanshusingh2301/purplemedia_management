import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../utils/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Task State
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [projData, taskData] = await Promise.all([
        fetchApi(`/projects/${id}`),
        fetchApi('/tasks')
      ]);
      setProject(projData);
      setTasks(taskData.filter(t => t.project?._id === id || t.project === id));
      
      if (user.role === 'Admin') {
        const usersData = await fetchApi('/auth/users');
        setUsers(usersData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await fetchApi('/tasks', {
        method: 'POST',
        body: JSON.stringify({ title, description, project: id, assignedTo, dueDate: dueDate || undefined })
      });
      setShowCreate(false);
      setTitle('');
      setDescription('');
      setAssignedTo('');
      setDueDate('');
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const updateStatus = async (taskId, status) => {
    try {
      await fetchApi(`/tasks/${taskId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div>Loading project details...</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>{project.name}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
        </div>
        {user.role === 'Admin' && (
          <Button onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? 'Cancel' : '+ New Task'}
          </Button>
        )}
      </div>

      {showCreate && (
        <Card style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Create New Task</h3>
          <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
            <Input label="Task Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <div style={{ marginBottom: '1rem' }}>
              <label>Description</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                required 
                rows={3}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Assign To</label>
              <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} required>
                <option value="">Select User</option>
                {users.map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Due Date</label>
              <input 
                type="date" 
                value={dueDate} 
                onChange={(e) => setDueDate(e.target.value)} 
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(15, 23, 42, 0.6)', color: 'var(--text-primary)' }}
              />
            </div>
            <div className="flex gap-4">
              <Button type="submit">Create Task</Button>
            </div>
          </form>
        </Card>
      )}

      <h2>Tasks</h2>
      <div className="flex flex-col gap-4">
        {tasks.map(task => (
          <Card key={task._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: 0, marginBottom: '0.5rem' }}>{task.title}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                {task.description}
              </p>
              <div className="flex gap-4 items-center" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span>Assignee: {task.assignedTo?.name || 'Unassigned'}</span>
                {task.dueDate && <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                <span className={`badge ${task.status.replace(' ', '').toLowerCase()}`}>{task.status}</span>
              </div>
            </div>
            
            {/* Action buttons for status update */}
            <div className="flex gap-2">
              {(user.role === 'Admin' || task.assignedTo?._id === user._id) && (
                <select 
                  value={task.status} 
                  onChange={(e) => updateStatus(task._id, e.target.value)}
                  style={{ width: 'auto', padding: '0.5rem' }}
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              )}
            </div>
          </Card>
        ))}
        {tasks.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No tasks in this project yet.</p>}
      </div>
    </div>
  );
};

export default ProjectDetail;
