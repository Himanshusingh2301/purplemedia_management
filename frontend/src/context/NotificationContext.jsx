import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  markAllRead: () => {},
  clearAll: () => {},
  removeNotification: () => {},
});

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const userId = user?._id || user?.id;

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!userId) return;
    try {
      const saved = localStorage.getItem(`notifications_${userId}`);
      if (saved) setNotifications(JSON.parse(saved));
    } catch {
      setNotifications([]);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      localStorage.setItem(`notifications_${userId}`, JSON.stringify(notifications));
    }
  }, [notifications, userId]);

  useEffect(() => {
    if (!socket || !userId) return;

    const handleNotification = (data) => {
      setNotifications((prev) => [
        {
          id: Date.now(),
          message: data.message,
          taskTitle: data.task?.title,
          createdAt: data.createdAt || Date.now(),
          read: false,
        },
        ...prev,
      ].slice(0, 30));
    };

    socket.on('notification', handleNotification);
    return () => socket.off('notification', handleNotification);
  }, [socket, userId]);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAllRead,
        clearAll,
        removeNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
