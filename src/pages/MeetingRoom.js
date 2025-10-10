import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Copy, Check, Video, LogOut, Wifi, WifiOff, Play, Square } from 'lucide-react';

function MeetingRoom({ user }) {
  const { token } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  
  // WebSocket state
  const [wsConnected, setWsConnected] = useState(false);
  const ws = useRef(null);
  
  // Chairman controls
  const [isChairman, setIsChairman] = useState(false);
  const [meetingActive, setMeetingActive] = useState(false);

  useEffect(() => {
    joinMeeting();
    
    // Cleanup WebSocket on unmount
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
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
      
      // Check if current user is the chairman
      setIsChairman(meetingData.created_by === user?.id);
      setMeetingActive(meetingData.status === 'active');

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
      
      // Connect to WebSocket if meeting is active
      if (meetingData.status === 'active') {
        connectWebSocket(meetingData.id);
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = (meetingId) => {
    // Get auth token from cookie
    const authToken = getCookie('auth_token');
    
    ws.current = new WebSocket('ws://localhost:8080/ws');

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      
      // Send authentication
      ws.current.send(JSON.stringify({
        type: 'AUTH',
        payload: {
          token: authToken || 'session-token',
          meetingId: meetingId
        },
        timestamp: new Date().toISOString()
      }));
    };

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setWsConnected(false);
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      setWsConnected(false);
    };
  };

  const handleWebSocketMessage = (message) => {
    switch (message.type) {
      case 'CONNECTED':
        console.log('WebSocket authenticated');
        setWsConnected(true);
        break;

      case 'USER_JOINED':
        console.log('User joined:', message.payload);
        fetchParticipants();
        break;

      case 'USER_LEFT':
        console.log('User left:', message.payload);
        fetchParticipants();
        break;

      case 'MEETING_ENDED':
        alert('The meeting has been ended by the chairman');
        navigate('/dashboard');
        break;

      case 'ERROR':
        const errorPayload = JSON.parse(message.payload || '{}');
        console.error('WebSocket error:', errorPayload.error);
        break;

      default:
        console.log('Unknown message type:', message.type);
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

  // CHAIRMAN ONLY: Start the meeting
  const startMeeting = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/meetings/${token}/start`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const data = await response.json();
      console.log('Meeting started:', data);
      
      setMeetingActive(true);
      
      // Connect WebSocket now that meeting is active
      connectWebSocket(meeting.id);
      
      alert('Meeting started! WebSocket enabled.');
    } catch (error) {
      console.error('Failed to start meeting:', error);
      alert('Failed to start meeting: ' + error.message);
    }
  };

  // CHAIRMAN ONLY: End the meeting
  const endMeeting = async () => {
    if (!window.confirm('Are you sure you want to end the meeting? All participants will be disconnected.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/meetings/${token}/end`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      alert('Meeting ended successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to end meeting:', error);
      alert('Failed to end meeting: ' + error.message);
    }
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/meeting/${token}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const leaveMeeting = async () => {
    // Close WebSocket
    if (ws.current) {
      ws.current.close();
    }

    // Call leave API
    try {
      await fetch(`http://localhost:8080/api/meetings/${token}/leave`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Failed to leave meeting:', err);
    }

    navigate('/dashboard');
  };

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return '';
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
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">{meeting?.title}</h1>
                {isChairman && (
                  <span className="px-2 py-1 bg-yellow-500 text-yellow-900 text-xs font-bold rounded">
                    CHAIRMAN
                  </span>
                )}
                {/* WebSocket Status Indicator */}
                {wsConnected ? (
                  <Wifi className="w-4 h-4 text-green-500" title="Connected" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" title="Disconnected" />
                )}
              </div>
              <p className="text-sm text-gray-400">
                {participants.length} participant{participants.length !== 1 ? 's' : ''}
                {wsConnected && <span className="ml-2 text-green-400">• Live</span>}
                {!meetingActive && <span className="ml-2 text-yellow-400">• Not Started</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Chairman Controls */}
            {isChairman && (
              <>
                {!meetingActive ? (
                  <button
                    onClick={startMeeting}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Start Meeting
                  </button>
                ) : (
                  <button
                    onClick={endMeeting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <Square className="w-4 h-4" />
                    End Meeting
                  </button>
                )}
              </>
            )}
            
            <button
              onClick={leaveMeeting}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Leave
            </button>
          </div>
        </div>
      </header>

      {/* Meeting Status Banner */}
      {!meetingActive && (
        <div className="bg-yellow-600 text-white px-6 py-3 text-center">
          <p className="font-medium">
            {isChairman 
              ? '⏸️ Meeting not started yet. Click "Start Meeting" to begin.' 
              : '⏸️ Waiting for the chairman to start the meeting...'}
          </p>
        </div>
      )}

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
                <p className="text-gray-400 text-sm">
                  {meetingActive ? 'Meeting in progress' : 'Waiting to start'}
                </p>
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
            {wsConnected && (
              <div className="ml-auto">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            )}
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
                      {participant.user_id === meeting?.created_by && (
                        <span className="text-yellow-400 text-xs ml-2">👑 Chairman</span>
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