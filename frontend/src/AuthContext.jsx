import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [accesstype, setAccesstype] = useState('');

  useEffect(() => {
    // Check localStorage for loggedIn status and accesstype on component mount
    const storedLoggedIn = localStorage.getItem('loggedIn');
    const storedAccesstype = localStorage.getItem('accesstype');

    if (storedLoggedIn) {
      setLoggedIn(true);
      setAccesstype(storedAccesstype);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('accesstype');
    setLoggedIn(false);
    setAccesstype('');
  };

  const contextValue = {
    loggedIn,
    accesstype,
    login: () => setLoggedIn(true),
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
