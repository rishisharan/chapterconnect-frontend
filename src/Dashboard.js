import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import MotionCard from "./MotionCard";

function Dashboard() {
  const [members, setMembers] = useState([]);
  const [motionText, setMotionText] = useState("");
  const [motions, setMotions] = useState([]);
  const { user, socket, chapterId } = useSelector((state) => state.session);
  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
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


  return (
       <div className="min-h-screen flex flex-col items-center p-4 bg-gray-100">
        <header className="w-full text-center py-4 bg-white shadow mb-6">
          <h1 className="text-3xl font-bold">Leader Dashboard: {user?.name}</h1>
          <button
            onClick={handleShare}
            className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 text-sm"
          >
             Share Chapter
          </button>
        </header>
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
          )
          }
        </div>
      </div>
  );
}

export default Dashboard;
