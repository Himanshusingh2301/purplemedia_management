import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../utils/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create Project State
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await fetchApi('/projects');
      setProjects(data);
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

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await fetchApi('/projects', {
        method: 'POST',
        body: JSON.stringify({ name, description, members })
      });
      setShowCreate(false);
      setName('');
      setDescription('');
      setMembers([]);
      loadProjects();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <h1>Projects</h1>
        {user.role === 'Admin' && (
          <Button onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? 'Cancel' : '+ New Project'}
          </Button>
        )}
      </div>

      {showCreate && (
        <Card style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Create New Project</h3>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <Input label="Project Name" value={name} onChange={(e) => setName(e.target.value)} required />
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
              <label>Members (Hold Ctrl/Cmd to select multiple)</label>
              <select 
                multiple 
                value={members} 
                onChange={(e) => setMembers(Array.from(e.target.selectedOptions, option => option.value))}
                style={{ height: '100px' }}
              >
                {users.map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>
            <div className="flex gap-4">
              <Button type="submit">Create</Button>
              <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? <p>Loading projects...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {projects.map(project => (
            <Card key={project._id} style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>{project.name}</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', flex: 1 }}>{project.description}</p>
              <div className="flex justify-between items-center">
                <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  {project.members?.length || 0} Members
                </span>
                <Link to={`/projects/${project._id}`}>
                  <Button variant="secondary" style={{ padding: '0.5rem 1rem' }}>View Details</Button>
                </Link>
              </div>
            </Card>
          ))}
          {projects.length === 0 && <p style={{ color: 'var(--text-secondary)', gridColumn: '1 / -1' }}>No projects found.</p>}
        </div>
      )}
    </div>
  );
};

export default Projects;
