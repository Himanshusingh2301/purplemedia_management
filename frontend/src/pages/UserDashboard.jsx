import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { CheckCircle, Clock, Link as LinkIcon, MessageSquare } from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [tasks, setTasks] = useState([]);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    fetchTasks();
    
    if (socket) {
      socket.on(`taskAssigned_${user._id}`, (data) => {
        setNotification(data.message);
        fetchTasks();
        setTimeout(() => setNotification(''), 5000);
      });
      socket.on('taskUpdated', fetchTasks);
    }
    
    return () => {
      if (socket) {
        socket.off(`taskAssigned_${user._id}`);
        socket.off('taskUpdated');
      }
    };
  }, [socket, user._id]);

  const fetchTasks = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get('/api/tasks', config);
      setTasks(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const updateStatus = async (taskId, status) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/tasks/${taskId}/status`, { status }, config);
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Tasks</h1>
      </div>

      {notification && (
        <div className="p-4 bg-green-100 text-green-800 rounded-lg shadow flex items-center gap-2">
          <CheckCircle size={20} />
          {notification}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map(task => (
          <div key={task._id} className="glass rounded-xl p-5 hover:shadow-lg transition-shadow border-t-4 border-t-primary">
            <div className="flex justify-between items-start mb-3">
              {task.documentLinks && task.documentLinks.length > 0 ? (
                <a 
                  href={task.documentLinks[0]} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-semibold text-lg text-primary hover:underline line-clamp-1 flex items-center gap-2"
                  title={task.title}
                >
                  {task.title}
                  <LinkIcon size={16} className="opacity-70" />
                </a>
              ) : (
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-1" title={task.title}>{task.title}</h3>
              )}
              <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                task.priority === 'High' || task.priority === 'Hard' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              }`}>
                {task.priority}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 min-h-[40px]">{task.description}</p>
            
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-4 gap-4">
              <div className="flex items-center gap-1">
                <Clock size={14} />
                {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare size={14} />
                {task.comments?.length || 0}
              </div>
              <div className="flex items-center gap-1">
                <LinkIcon size={14} />
                {task.documentLinks?.length || 0}
              </div>
            </div>

            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {task.assignedTo?.map(u => (
                  <span 
                    key={u._id} 
                    className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                      u._id === user._id 
                        ? 'bg-primary/10 text-primary border border-primary/20' 
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                    title={u.email}
                  >
                    {u._id === user._id ? 'You' : u.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <span className={`text-sm font-medium ${
                  task.status === 'Completed' ? 'text-green-600 dark:text-green-400' :
                  task.status === 'In Progress' ? 'text-blue-600 dark:text-blue-400' :
                  'text-gray-600 dark:text-gray-400'
              }`}>
                {task.status}
              </span>
              
              <select 
                className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={task.status}
                onChange={(e) => updateStatus(task._id, e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 glass rounded-xl">
            You don't have any tasks assigned yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
