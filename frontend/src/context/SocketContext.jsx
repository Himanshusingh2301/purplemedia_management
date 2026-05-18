import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const url =
        import.meta.env.VITE_SOCKET_URL ||
        (import.meta.env.PROD ? window.location.origin : 'http://localhost:5000');
      const newSocket = io(url, { transports: ['websocket', 'polling'] });
      const userId = user._id || user.id;

      const onConnect = () => {
        if (userId) newSocket.emit('register', userId);
      };

      newSocket.on('connect', onConnect);
      if (newSocket.connected) onConnect();

      setSocket(newSocket);
      return () => newSocket.close();
    } else {
      setSocket(null);
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
