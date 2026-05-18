import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Clock, Calendar, StickyNote } from 'lucide-react';
import StatusSelect from '../components/StatusSelect';
import NotesPanel from '../components/NotesPanel';
import TaskTitle from '../components/TaskTitle';

const priorityStyles = {
  High: 'bg-red-500/15 text-red-400 ring-red-500/30',
  Hard: 'bg-red-500/15 text-red-400 ring-red-500/30',
  Medium: 'bg-amber-500/15 text-amber-400 ring-amber-500/30',
  Low: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30',
  Easy: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30',
};

const getNoteCount = (task) =>
  (task.notes?.filter((n) => n.type === 'text').length || 0) + (task.comments?.length || 0);

const UserDashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [tasks, setTasks] = useState([]);
  const [notesTaskId, setNotesTaskId] = useState(null);

  useEffect(() => {
    fetchTasks();

    if (socket) {
      socket.on('notification', fetchTasks);
    }

    return () => {
      if (socket) socket.off('notification', fetchTasks);
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
    <div className="space-y-8 max-w-6xl">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">My Tasks</h1>
        <p className="text-base text-gray-400 mt-2">
          {tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to you
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {tasks.map((task) => {
          const noteCount = getNoteCount(task);
          return (
            <article
              key={task._id}
              className="rounded-2xl border border-gray-800 bg-gray-800/40 p-6 flex flex-col gap-4 hover:border-gray-700 transition-colors"
            >
              <div className="flex justify-between items-start gap-4">
                <TaskTitle
                  task={task}
                  as="h3"
                  className="text-xl font-semibold text-white leading-snug"
                />
                <span
                  className={`text-sm px-3 py-1 rounded-full font-medium ring-1 flex-shrink-0 ${
                    priorityStyles[task.priority] || priorityStyles.Medium
                  }`}
                >
                  {task.priority}
                </span>
              </div>

              {task.description && (
                <p className="text-base text-gray-400 leading-relaxed line-clamp-3">{task.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-500" />
                  {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                </span>
                {task.assignedTo?.length > 0 && (
                  <span className="flex flex-wrap gap-2">
                    {task.assignedTo.map((u) => (
                      <span
                        key={u._id}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          u._id === user._id
                            ? 'bg-primary/20 text-primary'
                            : 'bg-gray-700/50 text-gray-300'
                        }`}
                      >
                        {u._id === user._id ? 'You' : u.name}
                      </span>
                    ))}
                  </span>
                )}
              </div>

              <div className="mt-auto pt-4 border-t border-gray-700/80 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setNotesTaskId(task._id)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-600 bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-200 hover:bg-gray-700 hover:border-gray-500 transition-colors"
                >
                  <StickyNote size={16} />
                  Notes
                  {noteCount > 0 && (
                    <span className="ml-1 rounded-full bg-primary/20 text-primary px-2 py-0.5 text-xs font-semibold">
                      {noteCount}
                    </span>
                  )}
                </button>

                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-sm text-gray-400">
                    <Clock size={16} />
                    Status
                  </span>
                  <StatusSelect
                    value={task.status}
                    onChange={(e) => updateStatus(task._id, e.target.value)}
                    className="text-sm py-2 pl-3 pr-8"
                  />
                </div>
              </div>
            </article>
          );
        })}

        {tasks.length === 0 && (
          <div className="col-span-full py-20 text-center rounded-2xl border border-dashed border-gray-700">
            <p className="text-base text-gray-400">You don&apos;t have any tasks assigned yet.</p>
          </div>
        )}
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

export default UserDashboard;

