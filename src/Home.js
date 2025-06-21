import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Dashboard from "./Dashboard";

function Home({ setSocket, setUser }) {

  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!name) return alert("Enter your name");
    const role = "Leader";
    const ws = new WebSocket("ws://localhost:8080/wsCreate");

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "create_chapter", name, role }));
      setSocket(ws);
      setUser({name, role});
      navigate("/dashboard",{
        state: {
          name,
          role,
          socket: ws,
        },
      });
    };

  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">ChapterConnect</h1>
      <input
        className="border p-2 mb-2 rounded"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">
        Create Chapter
      </button>
    </div>
  );
}

export default Home;