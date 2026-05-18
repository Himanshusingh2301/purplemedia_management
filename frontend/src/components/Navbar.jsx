import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Sun, Moon, Bell, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ darkMode, setDarkMode }) => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAllRead, clearAll, removeNotification } = useNotifications();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const openNotifications = () => {
    const opening = !isNotificationsOpen;
    setIsNotificationsOpen(opening);
    if (opening) markAllRead();
  };

  const formatTime = (ts) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  return (
    <header className="glass sticky top-0 z-30 flex h-16 w-full items-center justify-between px-4 sm:px-6">
      <div className="flex items-center">
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
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun size={20} className="text-gray-200" /> : <Moon size={20} className="text-gray-600" />}
        </button>

        {user ? (
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={openNotifications}
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Notifications"
              >
                <Bell size={22} className="text-gray-600 dark:text-gray-200" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsNotificationsOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-xl dark:bg-gray-800 dark:border-gray-700 z-20 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                      <span className="font-semibold text-base text-gray-800 dark:text-gray-100">Notifications</span>
                      {notifications.length > 0 && (
                        <button onClick={clearAll} className="text-sm text-primary hover:underline">
                          Clear all
                        </button>
                      )}
                    </div>
                    <div className="max-h-[320px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-4 border-b border-gray-50 dark:border-gray-700/50 flex justify-between items-start gap-3 ${
                              !n.read ? 'bg-primary/5 dark:bg-primary/10' : ''
                            }`}
                          >
                            <div className="min-w-0">
                              <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">{n.message}</p>
                              {n.taskTitle && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{n.taskTitle}</p>
                              )}
                              <p className="text-xs text-gray-400 mt-1">{formatTime(n.createdAt)}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeNotification(n.id)}
                              className="text-gray-400 hover:text-red-500 rounded-full p-1 flex-none"
                            >
                              <X size={16} />
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
              <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex space-x-2">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md dark:text-gray-200 dark:hover:bg-gray-800">
              Log in
            </Link>
            <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md shadow-sm">
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
