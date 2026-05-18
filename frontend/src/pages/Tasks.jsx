import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Trash2, Link as LinkIcon, Plus, ChevronDown, X } from 'lucide-react';
import StatusSelect from '../components/StatusSelect';
import NotesPanel from '../components/NotesPanel';
import TaskTitle from '../components/TaskTitle';

const Tasks = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  // Form State
  const [title, setTitle] = useState('');
  const [documentLink, setDocumentLink] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [assignedTo, setAssignedTo] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [openRowDropdownId, setOpenRowDropdownId] = useState(null);
  const [notesTaskId, setNotesTaskId] = useState(null);

  useEffect(() => {
    fetchTasks();
    fetchUsers();

    if (socket) {
      socket.on('taskCreated', fetchTasks);
      socket.on('taskUpdated', fetchTasks);
    }
    
    return () => {
      if (socket) {
        socket.off('taskCreated');
        socket.off('taskUpdated');
      }
    };
  }, [socket]);

  const fetchTasks = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get('/api/tasks', config);
      setTasks(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUsers = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get('/api/users', config);
      setUsers(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`/api/tasks/${id}`, config);
        fetchTasks();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const updateTaskStatus = async (id, status) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/tasks/${id}/status`, { status }, config);
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const updateTaskAssignees = async (id, newAssignedToArray) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/tasks/${id}`, { assignedTo: newAssignedToArray }, config);
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const payload = {
        title,
        priority,
        assignedTo: assignedTo.length > 0 ? assignedTo : [],
        documentLinks: documentLink ? [documentLink] : []
      };
      await axios.post('/api/tasks', payload, config);
      
      setTitle('');
      setDocumentLink('');
      setPriority('Medium');
      setAssignedTo([]);
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Task Management</h1>
      </div>

      {/* Quick Add Task Form */}
      <div className="glass p-4 rounded-xl border border-gray-200 dark:border-gray-800 relative z-30">
        <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Task Title *</label>
            <input 
              type="text" 
              required 
              placeholder="e.g. Update Homepage Design"
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-700 dark:text-white" 
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Google Doc Link</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LinkIcon size={14} className="text-gray-400" />
              </div>
              <input 
                type="url" 
                placeholder="https://docs.google.com/..."
                value={documentLink} 
                onChange={e => setDocumentLink(e.target.value)} 
                className="w-full pl-10 pr-3 py-2 text-sm border rounded-lg focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-700 dark:text-white" 
              />
            </div>
          </div>
          <div className="flex-1 w-full md:w-32 flex-none">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Rating/Difficulty</label>
            <select 
              value={priority}
              onChange={e => setPriority(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div className="flex-1 w-full md:w-48 flex-none relative">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Assign To</label>
            <button 
              type="button" 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg text-left bg-white dark:bg-gray-800 dark:text-white flex justify-between items-center focus:ring-1 focus:ring-primary focus:border-primary"
            >
              <span className="truncate pr-2 text-gray-700 dark:text-gray-300">
                {assignedTo.length === 0 ? 'Select users...' : `${assignedTo.length} user(s) selected`}
              </span>
              <ChevronDown size={14} className="text-gray-400 flex-none" />
            </button>
            
            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700 overflow-y-auto" style={{ maxHeight: '300px' }}>
                  <div className="p-1 flex flex-col">
                    {users.map(u => (
                      <label key={u._id} className="flex items-center px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-md cursor-pointer transition-colors">
                        <input 
                          type="checkbox" 
                          className="mr-3 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
                          checked={assignedTo.includes(u._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAssignedTo([...assignedTo, u._id]);
                            } else {
                              setAssignedTo(assignedTo.filter(id => id !== u._id));
                            }
                          }}
                        />
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{u.name || 'Unnamed User'}</span>
                          <span className="text-xs text-gray-400">{u.email}</span>
                        </div>
                      </label>
                    ))}
                    {users.length === 0 && (
                      <div className="px-3 py-2 text-sm text-gray-500 text-center">No users available</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          <button type="submit" className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} />
            Add
          </button>
        </form>
      </div>

      <div className="glass rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="w-full overflow-visible">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 font-semibold text-sm text-gray-700 dark:text-gray-300">Task Title & Document</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-700 dark:text-gray-300">Assigned To</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-700 dark:text-gray-300">Status</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-700 dark:text-gray-300">Notes</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-700 dark:text-gray-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {tasks.map((t) => (
                <tr key={t._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <TaskTitle
                      task={t}
                      as="span"
                      className="font-medium text-gray-900 dark:text-white"
                    />
                    {t.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{t.description}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 relative group">
                    <div className="flex flex-wrap gap-2 items-center min-h-[32px] w-full">
                      {t.assignedTo && t.assignedTo.length > 0 ? (
                        t.assignedTo.map((u, i) => (
                          <span key={u._id || i} className="bg-gray-200 dark:bg-gray-700 pl-2 pr-1 py-1 rounded text-xs flex items-center gap-1 group/badge">
                            {u.name}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const newAssignedTo = t.assignedTo.filter(x => x._id !== u._id).map(x => x._id);
                                updateTaskAssignees(t._id, newAssignedTo);
                              }}
                              className="text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 p-0.5 transition-colors"
                              title="Remove user"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 italic">Unassigned</span>
                      )}
                      
                      <button 
                        onClick={() => setOpenRowDropdownId(openRowDropdownId === t._id ? null : t._id)}
                        className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 p-1 rounded transition-colors flex items-center justify-center min-h-[24px] min-w-[24px]"
                        title="Add user"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    
                    {openRowDropdownId === t._id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenRowDropdownId(null)}></div>
                        <div className="absolute z-20 w-48 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700 overflow-y-auto" style={{ maxHeight: '200px' }}>
                          <div className="p-1 flex flex-col">
                            {(() => {
                              const unassignedUsers = users.filter(u => !t.assignedTo.some(assignedUser => assignedUser._id === u._id));
                              if (unassignedUsers.length === 0) {
                                return <div className="px-3 py-2 text-sm text-gray-500 text-center">All users assigned</div>;
                              }
                              return unassignedUsers.map(u => (
                                <button
                                  key={u._id}
                                  onClick={() => {
                                    const newAssignedTo = [...t.assignedTo.map(x => x._id), u._id];
                                    updateTaskAssignees(t._id, newAssignedTo);
                                    setOpenRowDropdownId(null);
                                  }}
                                  className="w-full text-left flex flex-col px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors rounded-md"
                                >
                                  <span className="text-sm text-gray-700 dark:text-gray-300">{u.name || 'Unnamed User'}</span>
                                  <span className="text-xs text-gray-400">{u.email}</span>
                                </button>
                              ));
                            })()}
                          </div>
                        </div>
                      </>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <StatusSelect
                      value={t.status}
                      onChange={(e) => updateTaskStatus(t._id, e.target.value)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => setNotesTaskId(t._id)}
                      className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      Notes
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(t._id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tasks.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No tasks found. Create one above!
            </div>
          )}
        </div>
      </div>

      <NotesPanel
        task={tasks.find((t) => t._id === notesTaskId)}
        open={!!notesTaskId}
        onClose={() => setNotesTaskId(null)}
        onUpdate={fetchTasks}
      />
    </div>
  );
};

export default Tasks;
