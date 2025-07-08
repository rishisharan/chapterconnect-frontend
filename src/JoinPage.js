import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const JoinPage = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const [tokenValid, setTokenValid] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    fetch(`/join/${chapterId}?token=${token}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        if (data.chapterId === chapterId) {
          setTokenValid(true);
        } else {
          navigate("/invalid-link");
        }
      })
      .catch(() => {
        navigate("/invalid-link");
      });
  }, [chapterId, navigate]);

  const handleJoin = (e) => {
    e.preventDefault();
    const socket = new WebSocket('ws://localhost:8080/wsCreate');

    socket.onopen = () => {
      socket.send(JSON.stringify({
        type: 'join_chapter',
        name: guestName,
        Role: 'Member',
        chapterId,
      }));
    };

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      console.log("WS message:", msg);
      // You can store msg.participants in state if needed
    };

    setWs(socket);
    // Redirect to dashboard or show joined view
    navigate("/dashboard");
  };

  if (!tokenValid) return <p>Validating link...</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md mt-8">
        <h2 className="text-2xl font-semibold text-center mb-6">Join Chapter</h2>

        <form onSubmit={handleJoin} className="space-y-4">
            <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Enter your name"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
            >
            Join
            </button>
        </form>
        </div>
    </div>
    );

};

export default JoinPage;
