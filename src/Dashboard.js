import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MotionCard from "./MotionCard";
import { useNavigate } from "react-router-dom";

function Dashboard({ user, socket, onLogout }) {
  const [members, setMembers] = useState([]);
  const [motionText, setMotionText] = useState("");
  const [motions, setMotions] = useState([]);
  const { socket: reduxSocket, chapterId } = useSelector((state) => state.session);
  const [loggingOut, setLoggingOut] = useState(false);
  // Use socket from props or Redux
  const activeSocket = socket || reduxSocket;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    if (!activeSocket) return;

    activeSocket.onmessage = (event) => {
      const msg = event.data;
      try {
        const parsed = JSON.parse(msg);
        if (parsed.type === "member_joined") {
          setMembers((prev) => [...prev, parsed.name]);
        }

        if (parsed.type === "new_motion") {
          setMotions((prev) => [...prev, parsed.name]);
        } 
      } catch {
        console.log("Message:", msg);
      }
    };
  }, [socket]);

  const handleCreateMotion = () => {
    if (!motionText || !socket) return;
    console.log("Sending motion:", motionText, socket?.readyState)
    socket.send(
      JSON.stringify({
        type: "create_motion",
        name: motionText,
        role: "Leader"
      })
    );
    setMotionText("");
  };

  const handleShare = async () => {
    try {
      const res = await fetch(`/chapters/${chapterId}/share`, { method: "POST" });
      const data = await res.json();

      await navigator.clipboard.writeText(`http://${data.invite}`);
      alert("Link copied to clipboard!");
    } catch (err) {
      console.error("Share failed:", err);
      alert("Failed to generate share link.");
    }
  };

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
            onClick={onLogout}
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
      <div className="w-full max-w-md mb-6">
        <p className="mb-2 text-gray-600">Chapter Members:</p>
        <ul className="bg-white rounded shadow p-4">
          {members.length === 0 ? (
            <li className="text-gray-400">No members yet</li>
          ) : (
            members.map((member, idx) => <li key={idx}>{member}</li>)
          )}
        </ul>
      </div>

      <div className="w-full max-w-md mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Create Motion</h2>
        <input
          type="text"
          className="w-full border p-2 rounded mb-2"
          placeholder="Enter motion text"
          value={motionText}
          onChange={(e) => setMotionText(e.target.value)}
        />
        <button
          onClick={handleCreateMotion}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Submit Motion
        </button>
      </div>

      <div className="w-full max-w-md">
        <h2 className="text-lg font-semibold mb-2">Motions</h2>
        {motions.length === 0 ? (
          <p className="text-gray-400">No motions created yet</p>
        ) : (
          motions.map((motion, idx) => (
            <MotionCard key={idx} motion={motion}/>
          ))            
        )}
      </div>
    </div>
  );
}

export default Dashboard;