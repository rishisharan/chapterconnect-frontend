import './App.css';
import React, { useState } from "react";

function App() {

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [socket, setSocket] = useState(null);

  const handleCreateClick = () => {
    setShowForm(true);
  };


  const handleSubmit = () => {
    if (!name) return alert("Please enter your name");

    const role = "Leader";
    const ws = new WebSocket("ws://localhost:8080/ws");

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "create_chapter", name, role }));
      console.log("WebSocket connected as Leader");
    };

    ws.onmessage = (msg) => {
      console.log("Received:", msg.data);
    };

    setSocket(ws);
    setShowForm(false);
  };
  
  return (
  <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">ChapterConnect</h1>
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-6">
        <p className="text-lg mb-4">Welcome to the ChapterConnect portal!</p>
        <button className="w-full bg-blue-600 text-white py-2 rounded-xl mb-2 hover:bg-blue-700">
          Join a Chapter
        </button>
        <button className="w-full border border-blue-600 text-blue-600 py-2 rounded-xl hover:bg-blue-50"  onClick={handleCreateClick}>
          Create a Chapter
        </button>

        
        {showForm && (
          <div className="mt-4">
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2 rounded mb-2"
            />
            <p className="mb-2 text-sm text-gray-600">Role: Leader</p>
            <button
              className="w-full bg-green-600 text-white py-2 rounded"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
