import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Sun, Moon, Bell, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ darkMode, setDarkMode }) => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    if (socket && user) {
      const handleNotification = (data) => {
        setNotifications(prev => [{ id: Date.now(), message: data.message }, ...prev]);
      };
      
      socket.on(`taskAssigned_${user._id}`, handleNotification);
      
      return () => {
        socket.off(`taskAssigned_${user._id}`, handleNotification);
      };
    }
  }, [socket, user]);

  const removeNotification = (id, e) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <header className="glass sticky top-0 z-30 flex h-16 w-full items-center justify-between px-4 sm:px-6">
      <div className="flex items-center">
        {/* Mobile menu button could go here */}
        <button className="md:hidden mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <Menu size={24} />
        </button>
        <Link to="/" className="text-xl font-bold text-primary flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <span className="font-bold">T</span>
          </div>
          <span className="hidden sm:inline-block">TaskFlow</span>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {darkMode ? <Sun size={20} className="text-gray-200" /> : <Moon size={20} className="text-gray-600" />}
        </button>

        {user ? (
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Bell size={20} className="text-gray-600 dark:text-gray-200" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white dark:border-gray-900"></span>
                )}
              </button>
              
              {isNotificationsOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsNotificationsOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg dark:bg-gray-800 dark:border-gray-700 z-20 overflow-hidden">
                    <div className="p-3 border-b border-gray-100 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-200 flex justify-between items-center">
                      <span>Notifications</span>
                      {notifications.length > 0 && (
                        <button onClick={() => setNotifications([])} className="text-xs text-primary hover:underline">Clear all</button>
                      )}
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                          No new notifications
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className="p-3 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex justify-between items-start gap-2 group">
                            <span className="text-sm text-gray-600 dark:text-gray-300">{n.message}</span>
                            <button 
                              onClick={(e) => removeNotification(n.id, e)}
                              className="text-gray-400 hover:text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity flex-none"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-3 border-l pl-4 border-gray-200 dark:border-gray-700">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{user.role}</span>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold cursor-pointer">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex space-x-2">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md dark:text-gray-200 dark:hover:bg-gray-800">Log in</Link>
            <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md shadow-sm">Sign up</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
