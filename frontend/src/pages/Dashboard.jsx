import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../utils/api';
import Card from '../components/Card';
import Button from '../components/Button';
import { LayoutDashboard, CheckCircle, Clock, AlertCircle, PlayCircle, ListTodo, Folder } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [taskData, projData] = await Promise.all([
          fetchApi('/tasks'),
          fetchApi('/projects')
        ]);
        setTasks(taskData);
        setProjects(projData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'To Do').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    done: tasks.filter(t => t.status === 'Done').length,
    overdue: tasks.filter(t => t.status !== 'Done' && t.dueDate && new Date(t.dueDate) < new Date()).length
  };

  const progress = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
        <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <LayoutDashboard size={32} color="var(--primary-color)" /> Dashboard
        </h1>
        {user.role === 'Admin' && (
          <Link to="/projects"><Button>+ Manage Projects</Button></Link>
        )}
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Welcome back, <strong style={{ color: 'var(--text-primary)' }}>{user.name}</strong>!</p>
      <p style={{ color: 'var(--primary-hover)', fontSize: '0.875rem', marginBottom: '2.5rem' }}>{currentDate}</p>
      
      {/* Progress Bar */}
      {stats.total > 0 && (
        <Card style={{ marginBottom: '2.5rem', padding: '1.25rem 1.5rem', background: 'rgba(30, 41, 59, 0.4)' }}>
          <div className="flex justify-between" style={{ marginBottom: '0.75rem', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Overall Task Completion</span>
            <span style={{ fontWeight: 'bold', color: 'var(--success)' }}>{progress}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--success)', transition: 'width 1s ease-in-out' }}></div>
          </div>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <Card style={{ borderLeft: '4px solid var(--warning)' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Folder size={16} /> Active Projects
          </h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{projects.length}</div>
        </Card>
        <Card style={{ borderLeft: '4px solid var(--primary-color)' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ListTodo size={16} /> Total Tasks
          </h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.total}</div>
        </Card>
        <Card style={{ borderLeft: '4px solid var(--text-secondary)' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={16} /> To Do
          </h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.todo}</div>
        </Card>
        <Card style={{ borderLeft: '4px solid var(--primary-hover)' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlayCircle size={16} /> In Progress
          </h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.inProgress}</div>
        </Card>
        <Card style={{ borderLeft: '4px solid var(--success)' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={16} /> Done
          </h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.done}</div>
        </Card>
        <Card style={{ borderLeft: '4px solid var(--danger)', background: stats.overdue > 0 ? 'rgba(239, 68, 68, 0.05)' : '' }}>
          <h3 style={{ color: 'var(--danger)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} /> Overdue
          </h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--danger)' }}>{stats.overdue}</div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div>
          <h2>Recent Projects</h2>
          {loading ? <p>Loading...</p> : (
            <div className="flex flex-col gap-4">
              {projects.slice(0, 4).map(project => (
                <Card key={project._id} style={{ padding: '1rem 1.5rem' }}>
                  <h4 style={{ margin: 0 }}>{project.name}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {project.description}
                  </p>
                  <Link to={`/projects/${project._id}`} style={{ fontSize: '0.75rem', marginTop: '0.5rem', display: 'inline-block' }}>View Details &rarr;</Link>
                </Card>
              ))}
              {projects.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No projects found.</p>}
            </div>
          )}
        </div>

        <div>
          <h2>Recent Tasks</h2>
          {loading ? <p>Loading...</p> : (
            <div className="flex flex-col gap-4">
              {tasks.slice(0, 4).map(task => (
                <Card key={task._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem' }}>
                  <div>
                    <h4 style={{ margin: 0 }}>{task.title}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      Project: {task.project?.name}
                    </p>
                  </div>
                  <span className={`badge ${task.status.replace(' ', '').toLowerCase()}`}>{task.status}</span>
                </Card>
              ))}
              {tasks.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No tasks found.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
