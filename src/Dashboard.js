import React, { useState } from "react";
import { useDispatch,  } from "react-redux";
import { useNavigate } from "react-router-dom";

function Dashboard({ user, socket }) {

  const [loggingOut, setLoggingOut] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      // Close WebSocket connection gracefully
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }

      // Call logout API
      const response = await fetch('http://localhost:8080/api/auth/google/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Logout response status:', response.status);
      console.log('Logout response ok:', response.ok);
      
      if (response.ok) {
        // Clear local storage
        localStorage.removeItem('user');
        sessionStorage.clear();
        
        // Clear Redux state
        dispatch({ type: 'LOGOUT' });
        
        // Redirect to login page
        window.location.href = '/login';
      } else {
        const errorData = await response.json();
        console.error('Logout failed:', errorData);
        alert('Logout failed. Please try again.');
        setLoggingOut(false);
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('Logout error: ' + error.message);
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-gray-100">
      <header className="w-full bg-white shadow-md mb-6">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Leader Dashboard: {user?.name}</h1>
          
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Logout
          </button>
        </div>
      </header>
      <button
        onClick={() => navigate('/create-meeting')}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
      >
        Create New Meeting
      </button>
    </div>
  );
}

export default Dashboard;