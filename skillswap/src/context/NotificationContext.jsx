import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { jwtDecode } from 'jwt-decode'; // ✅ For decoding token

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);

  // ✅ Decode JWT and set user on initial mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (err) {
        console.error('❌ Failed to decode token:', err);
      }
    }
  }, []);

  // ✅ Connect socket and handle events when user is set
  useEffect(() => {
    if (!user?._id) return;

    const newSocket = io('http://localhost:5000', {
      query: { token: localStorage.getItem('token') },
    });

    newSocket.on('connect', () => {
      console.log('🔌 Connected to socket.io');
      newSocket.emit('joinRoom', user._id);
    });

    // ✅ Match request accepted
    newSocket.on('matchAccepted', (data) => {
      console.log('📨 matchAccepted received:', data);
      setNotifications((prev) => [
        ...prev,
        {
          type: 'matchAccepted',
          message: data.message || 'Your match request was accepted!',
          from: data.from,
          date: new Date(data.date) || new Date(),
        },
      ]);
    });

    // ✅ Incoming session request
    newSocket.on('sessionRequest', (data) => {
      console.log('📨 sessionRequest received:', data);
      setNotifications((prev) => [
        ...prev,
        {
          type: 'sessionRequest',
          message: `${data.username} sent you a session request.`,
          from: data._id,
          date: new Date(data.date) || new Date(),
        },
      ]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?._id]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        socket,
        notifications,
        setNotifications,
        user,
        setUser,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
