import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
   LogOut, Wifi, WifiOff, Play, Square,
  Send, FileText, ChevronLeft, ChevronRight, AlertCircle,
} from 'lucide-react';
import useWebSocket from '../hooks/useWebSocket';

function MeetingRoom({ user }) {
  const { token: meetingToken } = useParams(); 
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const { isConnected, messages, connect, disconnect, sendMessage } = useWebSocket();

  // WebSocket state
  const [wsConnected, setWsConnected] = useState(false);
  const ws = useRef(null);
  
  // Chairman controls
  const [isChairman, setIsChairman] = useState(false);
  const [meetingActive, setMeetingActive] = useState(false);

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('agenda'); // agenda, history, participants, notes
  const [message, setMessage] = useState('');
  const [messagess, setMessagess] = useState([]);

  // Mock agenda data (replace with real data later)
  const [agendaItems] = useState([
    { id: 1, title: 'Call to Order', status: 'active', duration: '5 min' },
    { id: 2, title: 'Reading of Minutes', status: 'pending', duration: '10 min' },
    { id: 3, title: 'Q4 Budget Approval', status: 'pending', duration: '30 min' },
    { id: 4, title: 'New Business', status: 'pending', duration: '20 min' },
    { id: 5, title: 'Committee Reports', status: 'pending', duration: '15 min' },
    { id: 6, title: 'Adjournment', status: 'pending', duration: '' },
  ]);

  useEffect(() => {
    joinMeeting();
    
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [meetingToken]);

    const joinMeeting = async () => {
    try {
      const jwtToken = localStorage.getItem('jwt');  // ✅ Rename to jwtToken
      
      // Fetch meeting by meetingToken
      const meetingResponse = await fetch(`http://localhost:8080/api/meetings/${meetingToken}`, {  // ✅ Use meetingToken
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,  // ✅ Use jwtToken for auth
          'Content-Type': 'application/json',
        },
      });
      
      if (!meetingResponse.ok) {
        throw new Error('Meeting not found');
      }

      const meetingData = await meetingResponse.json();
      setMeeting(meetingData);
      setMeetingActive(meetingData.status === 'active');

      const requestBody = {
        firstName: user?.name?.split(' ')[0] || 'Guest',
        lastName: user?.name?.split(' ').slice(1).join(' ') || 'User'
      };

      // Join meeting by meetingToken
      const joinResponse = await fetch(`http://localhost:8080/api/meetings/${meetingToken}/join`, {  // ✅ Use meetingToken
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,  // ✅ Add auth header
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!joinResponse.ok) {
        throw new Error('Failed to join meeting');
      }

      await fetchParticipants();
      
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
    connect({
      meetingId: meetingId,
      user,
      user,
      token: getCookie('auth_token')
    });
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
      const jwtToken = localStorage.getItem('jwt');  // ✅ Get JWT token
      const response = await fetch(`http://localhost:8080/api/meetings/${meetingToken}/participants`, {  // ✅ Use meetingToken
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,  // ✅ Add auth
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setParticipants(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch participants:', err);
    }
  };

  const startMeeting = async () => {
    try {
      const jwtToken = localStorage.getItem('jwt');  // ✅ Get JWT token
      const response = await fetch(`http://localhost:8080/api/meetings/${meetingToken}/start`, {  // ✅ Use meetingToken
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const data = await response.json();
      console.log('Meeting started:', data);
      
      setMeetingActive(true);
      connectWebSocket(meeting.id);
      
      alert('Meeting started! WebSocket enabled.');
    } catch (error) {
      console.error('Failed to start meeting:', error);
      alert('Failed to start meeting: ' + error.message);
    }
  };

  const endMeeting = async () => {
    if (!window.confirm('Are you sure you want to end the meeting? All participants will be disconnected.')) {
      return;
    }

    try {
      const jwtToken = localStorage.getItem('jwt');  // ✅ Get JWT token
      const response = await fetch(`http://localhost:8080/api/meetings/${meetingToken}/end`, {  // ✅ Use meetingToken
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
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
    const shareUrl = `${window.location.origin}/meeting/${meetingToken}`;  // ✅ Use meetingToken
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const leaveMeeting = async () => {
    if (ws.current) {
      ws.current.close();
    }

    try {
      const jwtToken = localStorage.getItem('jwt');  // ✅ Get JWT token
      await fetch(`http://localhost:8080/api/meetings/${meetingToken}/leave`, {  // ✅ Use meetingToken
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      console.error('Failed to leave meeting:', err);
    }

    navigate('/dashboard');
  };

  const sendMessageOne = () => {
    if (!message.trim()) return;
    
    // Add message to local state (replace with WebSocket send later)
    setMessagess([...messages, {
      id: Date.now(),
      user: user?.name,
      text: message,
      timestamp: new Date()
    }]);
    
    setMessage('');
  };

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return '';
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Joining meeting...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-white" />
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
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-gray-900">{meeting?.title}</h1>
                {isChairman && (
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                    Chairman
                  </span>
                )}
                {wsConnected ? (
                  <Wifi className="w-4 h-4 text-green-500" title="Connected" />
                ) : (
                  <WifiOff className="w-4 h-4 text-gray-400" title="Disconnected" />
                )}
              </div>
              <p className="text-sm text-gray-500">
                {participants.length} participant{participants.length !== 1 ? 's' : ''} • 
                {wsConnected ? ' Live' : ' Offline'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isChairman && (
              <>
                {!meetingActive ? (
                  <button
                    onClick={startMeeting}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Start Meeting
                  </button>
                ) : (
                  <button
                    onClick={endMeeting}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <Square className="w-4 h-4" />
                    End Meeting
                  </button>
                )}
              </>
            )}
            
            <button
              onClick={leaveMeeting}
              className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Leave
            </button>
          </div>
        </div>
      </header>

      {/* Meeting Status Banner */}
      {!meetingActive && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3">
          <p className="text-sm text-yellow-800 text-center">
            {isChairman 
              ? '⏸️ Meeting not started yet. Click "Start Meeting" to begin.' 
              : '⏸️ Waiting for the chairman to start the meeting...'}
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Section - Main Meeting Area */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'mr-80' : ''}`}>
          {/* Participants Bar */}
          <div className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500 font-medium">PARTICIPANTS ({participants.length})</p>
              <div className="flex items-center gap-2 ml-2 flex-wrap">
                {participants.slice(0, 8).map((participant) => (
                  <div
                    key={participant.user_id}
                    className="relative group"
                    title={participant.user_name}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white ${
                      participant.user_id === meeting?.created_by ? 'bg-yellow-500 ring-2 ring-yellow-300' : 'bg-blue-500'
                    }`}>
                      {getInitials(participant.user_name)}
                    </div>
                    {participant.user_id === user?.id && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                ))}
                {participants.length > 8 && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-700">
                    +{participants.length - 8}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Current Motion/Agenda Panel */}
          <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-bold text-gray-900">⚡ CURRENT AGENDA ITEM</h3>
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded">
                    In Progress
                  </span>
                </div>
                <p className="text-sm text-gray-900 font-medium">Item: Call to Order</p>
                <p className="text-xs text-gray-600 mt-1">
                  Opening remarks by Chairman • Time: 00:23 • Next: Reading of Minutes
                </p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors">
                  Vote Yes
                </button>
                <button className="px-3 py-1.5 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors">
                  Vote No
                </button>
                <button className="px-3 py-1.5 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors">
                  Abstain
                </button>
              </div>
            </div>
          </div>

          {/* Discussion Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Discussion Thread */}
            <div className="flex-1 flex flex-col bg-white border-r border-gray-200">
              <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">💬 DISCUSSION THREAD</h3>
                <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors">
                  Join Queue
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-400">No messages yet. Start the discussion!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-gray-900">{msg.user}</p>
                        <p className="text-xs text-gray-500">
                          {/* {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} */}
                        </p>
                      </div>
                      <p className="text-sm text-gray-700">{msg.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessageOne()}
                    placeholder="Type your message here..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!meetingActive}
                  />
                  <button
                    onClick={sendMessageOne}
                    disabled={!meetingActive || !message.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </div>
              </div>
            </div>

            {/* Parliamentary Actions Panel */}
            <div className="w-56 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
              <h3 className="text-sm font-bold text-gray-900 mb-3">⚖️ ACTIONS</h3>
              <div className="space-y-2">
                <button className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50 transition-colors text-left">
                  ✋ Raise Hand / Join Queue
                </button>
                <button className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50 transition-colors text-left">
                  📢 Point of Order
                </button>
                <button className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50 transition-colors text-left">
                  ❓ Point of Information
                </button>
                <button className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50 transition-colors text-left">
                  ⚡ Call the Question
                </button>
                <button className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50 transition-colors text-left">
                  📋 Table Motion
                </button>
                <button className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50 transition-colors text-left">
                  ✏️ Amend Motion
                </button>
                <button className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50 transition-colors text-left">
                  📤 Refer to Committee
                </button>
                <button className="w-full px-3 py-2 bg-blue-50 border border-blue-300 text-blue-700 rounded text-xs hover:bg-blue-100 transition-colors text-left">
                  ℹ️ View Rules Guide
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className={`fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-lg transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}>
          {/* Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -left-10 top-1/2 transform -translate-y-1/2 w-10 h-20 bg-white border border-gray-200 rounded-l-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            {sidebarOpen ? <ChevronRight className="w-5 h-5 text-gray-600" /> : <ChevronLeft className="w-5 h-5 text-gray-600" />}
          </button>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 flex-shrink-0">
            {['agenda', 'history', 'participants', 'notes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-3 text-xs font-semibold capitalize ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'agenda' && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-900 mb-3">📋 MEETING AGENDA</h3>
                {agendaItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border ${
                      item.status === 'active'
                        ? 'bg-yellow-50 border-yellow-300'
                        : item.status === 'completed'
                        ? 'bg-green-50 border-green-300'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-xs font-semibold text-gray-900">
                        {item.status === 'completed' && '✓ '}
                        {item.status === 'active' && '▶ '}
                        {item.id}. {item.title}
                      </p>
                      {item.status === 'active' && (
                        <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs rounded">Active</span>
                      )}
                    </div>
                    {item.duration && (
                      <p className="text-xs text-gray-600">Est. {item.duration}</p>
                    )}
                  </div>
                ))}

                {/* Meeting Stats */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-xs font-bold text-gray-900 mb-2">📊 STATISTICS</h4>
                  <div className="space-y-1 text-xs text-gray-700">
                    <p>Duration: 0:23</p>
                    <p>Motions: 0</p>
                    <p>Attendance: {participants.length}/{participants.length} (Quorum Met ✓)</p>
                  </div>
                </div>

                {/* Host Controls */}
                {isChairman && (
                  <div className="mt-6 p-4 bg-white border-2 border-red-300 rounded-lg">
                    <h4 className="text-xs font-bold text-red-600 mb-3">🔐 HOST CONTROLS</h4>
                    <div className="space-y-2">
                      <button className="w-full px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors">
                        ➕ New Motion
                      </button>
                      <button className="w-full px-3 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors">
                        🗳️ Start Voting
                      </button>
                      <button className="w-full px-3 py-2 bg-yellow-500 text-gray-900 text-xs rounded hover:bg-yellow-600 transition-colors">
                        ⏭️ Next Agenda Item
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'participants' && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-900 mb-3">👥 PARTICIPANTS</h3>
                {participants.map((participant) => (
                  <div key={participant.user_id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white ${
                        participant.user_id === meeting?.created_by ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}>
                        {getInitials(participant.user_name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {participant.user_name}
                          {participant.user_id === user?.id && (
                            <span className="text-blue-600 text-xs ml-2">(You)</span>
                          )}
                        </p>
                        {participant.user_id === meeting?.created_by && (
                          <span className="text-xs text-yellow-600">👑 Chairman</span>
                        )}
                        <p className="text-xs text-gray-500">
                          Joined: {new Date(participant.joined_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400">No motion history yet</p>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400">Meeting notes will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MeetingRoom;