'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppSelector, useAppDispatch } from '@/redux/store';
import { logout } from '@/redux/slices/authSlice';
import { toast } from 'react-toastify';
// You might need a library like 'js-cookie' to easily read the token
import Cookies from 'js-cookie';

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoggedIn } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Only attempt to connect if the user is logged in
    if (isLoggedIn && user) {
      // 1. Get the token from the cookie
      const token = Cookies.get('token'); // Assumes your token is stored in a cookie named 'token'

      // 2. Create the socket instance WITH the auth token
      const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000', {
        auth: {
          token: token
        }
      });

      setSocket(newSocket);

      // Listen for the 'banned' event
      newSocket.on('banned', (data) => {
        toast.error(data.message || "You have been banned by an administrator.");
        dispatch(logout());
      });

      newSocket.on('unbanned', (data) => {
        toast.success(data.message || "Your account has been unbanned.");
      });
      
      // Emit 'join' after a successful connection
      newSocket.emit('join', user._id);


      // Cleanup on component unmount or when user logs out
      return () => {
        newSocket.disconnect();
      };
    }
  }, [isLoggedIn, user, dispatch]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};