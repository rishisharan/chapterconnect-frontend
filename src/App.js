import './App.css';
import React, { useState, useEffect  } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import Home from "./Home";
import Login from "./pages/Login";
import ProtectedRoute from './hooks/ProtectedRoute';
import CreateMeeting from './pages/CreateMeeting';
import MeetingRoom from './pages/MeetingRoom';
import WebSocketTest from './pages/WebSocketTest';
import GuestLanding from './pages/GuestLanding';
import GuestMeeting from './pages/GuestMeeting';

function App() {

  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await fetch('http://localhost:8080/api/me', {
          headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8080/api/auth/google/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      setIsAuthenticated(false);
      setSocket(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} />
        <Route path="/" element={isAuthenticated ? <Home user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard socket={socket} user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        <Route path="/test/websocket" element={<WebSocketTest />} />
        <Route path="/create-meeting" element={isAuthenticated ? <CreateMeeting user={user} /> : <Navigate to="/login" />} />
        <Route path="/meeting/:id/:token" element={isAuthenticated ? <MeetingRoom user={user} /> : <Navigate to="/login" />}  />
        <Route path="/join" element={<GuestLanding />} />
        <Route path="/guest-meeting/:id/:token" element={<GuestLanding />} />
        <Route path="/guest-meeting-join/:id/:token" element={<GuestMeeting />} />
      </Routes>
    </Router>
  );
}

export default App;
