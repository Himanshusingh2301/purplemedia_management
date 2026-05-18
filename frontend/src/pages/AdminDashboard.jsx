import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, CheckSquare, Clock, Edit, Trash2 } from 'lucide-react';
import TaskTitle from '../components/TaskTitle';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    fetchData();
    
    if (socket) {
      socket.on('taskCreated', fetchData);
      socket.on('taskUpdated', fetchData);
    }
    
    return () => {
      if (socket) {
        socket.off('taskCreated');
        socket.off('taskUpdated');
      }
    };
  }, [socket]);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [tasksRes, usersRes] = await Promise.all([
        axios.get('/api/tasks', config),
        axios.get('/api/users', config)
      ]);
      setTasks(tasksRes.data);
      setUsers(usersRes.data);

      // Calculate stats
      const pending = tasksRes.data.filter(t => t.status === 'Pending').length;
      const inProgress = tasksRes.data.filter(t => t.status === 'In Progress').length;
      const completed = tasksRes.data.filter(t => t.status === 'Completed').length;

      setStats([
        { name: 'Pending', count: pending },
        { name: 'In Progress', count: inProgress },
        { name: 'Completed', count: completed }
      ]);

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{users.length}</p>
          </div>
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900/30 dark:text-blue-400">
            <Users size={24} />
          </div>
        </div>
        <div className="glass p-6 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{tasks.length}</p>
          </div>
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg dark:bg-purple-900/30 dark:text-purple-400">
            <CheckSquare size={24} />
          </div>
        </div>
        <div className="glass p-6 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {tasks.filter(t => t.status === 'Completed').length}
            </p>
          </div>
          <div className="p-3 bg-green-100 text-green-600 rounded-lg dark:bg-green-900/30 dark:text-green-400">
            <Clock size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="glass p-6 rounded-xl">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Task Status Overview</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="glass p-6 rounded-xl overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Tasks</h2>
            <button className="text-sm text-primary hover:underline">View All</button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {tasks.slice(0, 5).map(task => (
              <div key={task._id} className="p-3 border border-gray-100 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <TaskTitle
                      task={task}
                      as="h3"
                      className="font-medium text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Assigned to: {task.assignedTo?.name || 'Unassigned'}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    task.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    task.status === 'In Progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
            {tasks.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No tasks found.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
