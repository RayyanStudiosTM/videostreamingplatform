import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebase';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        localStorage.setItem('token', token);
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    return signOut(auth);
  };

  const adminLogin = async (email, password) => {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/admin/login`, {
      email,
      password
    });
    
    localStorage.setItem('adminToken', response.data.token);
    setCurrentUser({ ...response.data.user, isAdmin: true });
    return response.data;
  };

  const value = {
    currentUser,
    signup,
    login,
    logout,
    adminLogin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};