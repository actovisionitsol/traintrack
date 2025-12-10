import React, { useState, useEffect } from "react";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('rail_user');
    const savedToken = localStorage.getItem('rail_token');
    if (savedUser && savedToken) {
      setUser(savedUser);
      setToken(savedToken);
    }
  }, []);

  const handleLogin = (username, accessToken) => {
    setUser(username);
    setToken(accessToken);
    localStorage.setItem('rail_user', username);
    localStorage.setItem('rail_token', accessToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('rail_user');
    localStorage.removeItem('rail_token');
  };

  if (!user || !token) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <Dashboard user={user} token={token} onLogout={handleLogout} />;
}