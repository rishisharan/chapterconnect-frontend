import './App.css';
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import Home from "./Home";
function App() {

  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home setSocket={setSocket} setUser={setUser} />} />
        <Route path="/dashboard" element={<Dashboard socket={socket} user={user} />} />
      </Routes>
    </Router>
  );
}

export default App;
