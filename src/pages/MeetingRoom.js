import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Copy, Check, Video, LogOut } from 'lucide-react';

function MeetingRoom({ user }) {
  const { token } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    joinMeeting();
    // Poll for participants every 3 seconds
    const interval = setInterval(fetchParticipants, 3000);
    return () => clearInterval(interval);
  }, [token]);

  const joinMeeting = async () => {
    try {
      // Get meeting info
      const meetingResponse = await fetch(`http://localhost:8080/api/meetings/${token}`, {
        credentials: 'include',
      });

      if (!meetingResponse.ok) {
        throw new Error('Meeting not found');
      }

      const meetingData = await meetingResponse.json();
      setMeeting(meetingData);

      // Join the meeting
      const joinResponse = await fetch(`http://localhost:8080/api/meetings/${token}/join`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!joinResponse.ok) {
        throw new Error('Failed to join meeting');
      }

      // Fetch initial participants
      await fetchParticipants();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/meetings/${token}/participants`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setParticipants(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch participants:', err);
    }
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/meeting/${token}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const leaveMeeting = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Joining meeting...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Meeting Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{meeting?.title}</h1>
              <p className="text-sm text-gray-400">{participants.length} participant{participants.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <button
            onClick={leaveMeeting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Leave
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-4xl w-full">
            <div className="bg-gray-800 rounded-lg aspect-video flex items-center justify-center border-2 border-gray-700">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl text-white font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <p className="text-white text-lg font-semibold mb-2">{user?.name}</p>
                <p className="text-gray-400 text-sm">Video preview (Coming soon)</p>
              </div>
            </div>

            {/* Share Link */}
            <div className="mt-4 bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={`${window.location.origin}/meeting/${token}`}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white"
                />
                <button
                  onClick={copyShareLink}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Participants */}
        <aside className="w-80 bg-gray-800 border-l border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-white">
              Participants ({participants.length})
            </h2>
          </div>

          <div className="space-y-2">
            {participants.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">
                No participants yet
              </p>
            ) : (
              participants.map((participant) => (
                <div
                  key={participant.user_id}
                  className="bg-gray-700 rounded-lg p-3 flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold">
                      {participant.user_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {participant.user_name}
                      {participant.user_id === user?.id && (
                        <span className="text-blue-400 text-xs ml-2">(You)</span>
                      )}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {new Date(participant.joined_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default MeetingRoom;