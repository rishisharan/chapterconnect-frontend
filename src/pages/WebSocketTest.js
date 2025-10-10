// FILE: src/components/WebSocketTest.js
// Fixed version with proper meeting join flow

import React, { useState, useEffect, useRef } from 'react';
import { Wifi, WifiOff, Send, Trash2, Play, Square, RefreshCw, LogIn } from 'lucide-react';

function WebSocketTest() {
  const [wsUrl, setWsUrl] = useState('ws://localhost:8080/ws');
  const [meetingId, setMeetingId] = useState('');
  const [meetingToken, setMeetingToken] = useState(''); // Token from URL
  const [token, setToken] = useState('test-token');
  const [userName, setUserName] = useState('Test User');
  
  const [isConnected, setIsConnected] = useState(false);
  const [isJoined, setIsJoined] = useState(false); // NEW: Track if joined meeting
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [meetingStatus, setMeetingStatus] = useState(null);
  const [meetingInfo, setMeetingInfo] = useState(null); // NEW: Store meeting details
  
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (type, text) => {
    const time = new Date().toLocaleTimeString();
    setMessages(prev => [...prev, { type, text, time, id: Date.now() }]);
  };

  // NEW: Join meeting through API
  const joinMeeting = async () => {
    if (!meetingToken.trim()) {
      addMessage('error', 'Please enter a meeting token');
      return;
    }

    try {
      addMessage('info', `Joining meeting with token: ${meetingToken}...`);
      
      // First, get meeting info
      const getMeetingResponse = await fetch(`http://localhost:8080/api/meetings/${meetingToken}`, {
        credentials: 'include',
      });

      if (!getMeetingResponse.ok) {
        throw new Error('Meeting not found');
      }

      const meetingData = await getMeetingResponse.json();
      setMeetingInfo(meetingData);
      setMeetingId(meetingData.id); // Set the actual meeting ID
      
      addMessage('success', `Found meeting: ${meetingData.title}`);

      // Now join the meeting
      const joinResponse = await fetch(`http://localhost:8080/api/meetings/${meetingToken}/join`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!joinResponse.ok) {
        throw new Error('Failed to join meeting');
      }

      const joinData = await joinResponse.json();
      addMessage('success', `✅ Successfully joined meeting!`);
      setIsJoined(true);

    } catch (error) {
      addMessage('error', `Failed to join meeting: ${error.message}`);
      console.error('Join error:', error);
    }
  };

  const connectWebSocket = () => {
    if (!isJoined) {
      addMessage('error', 'Please join the meeting first!');
      return;
    }

    if (ws.current?.readyState === WebSocket.OPEN) {
      addMessage('warning', 'Already connected');
      return;
    }

    addMessage('system', `Connecting to ${wsUrl}...`);
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      addMessage('success', 'WebSocket connected! Sending auth...');
      
      // Get real auth token from cookie
      const authToken = getAuthToken();
      
      // Send AUTH message with actual meeting ID
      ws.current.send(JSON.stringify({
        type: 'AUTH',
        payload: {
          token: authToken || token,
          meetingId: meetingId // Use actual meeting ID from join
        },
        timestamp: new Date().toISOString()
      }));
    };

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleMessage(message);
      } catch (error) {
        addMessage('error', `Failed to parse: ${event.data}`);
      }
    };

    ws.current.onerror = (error) => {
      addMessage('error', 'WebSocket error occurred');
      console.error('WebSocket error:', error);
    };

    ws.current.onclose = (event) => {
      addMessage('system', `Connection closed (Code: ${event.code})`);
      setIsConnected(false);
    };
  };

  const handleMessage = (message) => {
    console.log('Received:', message);

    switch (message.type) {
      case 'CONNECTED':
        setIsConnected(true);
        addMessage('success', '✅ WebSocket authenticated!');
        break;

      case 'ERROR':
        const errorPayload = JSON.parse(message.payload || '{}');
        addMessage('error', `❌ Error: ${errorPayload.error}`);
        break;

      case 'MESSAGE':
        const msgPayload = JSON.parse(message.payload || '{}');
        addMessage('message', `${msgPayload.from}: ${msgPayload.text}`);
        break;

      case 'USER_JOINED':
        const joinPayload = JSON.parse(message.payload || '{}');
        addMessage('info', `👋 ${joinPayload.userName} joined the meeting`);
        break;

      case 'USER_LEFT':
        const leftPayload = JSON.parse(message.payload || '{}');
        addMessage('info', `👋 ${leftPayload.userName} left the meeting`);
        break;

      case 'PARTICIPANT_LIST':
        const listPayload = JSON.parse(message.payload || '{}');
        addMessage('info', `📋 Participants: ${listPayload.participants?.length || 0}`);
        break;

      case 'MEETING_ENDED':
        addMessage('warning', '🛑 Meeting has ended');
        setIsConnected(false);
        setIsJoined(false);
        break;

      case 'PONG':
        addMessage('system', '🏓 Pong received');
        break;

      default:
        addMessage('system', `Received: ${message.type}`);
    }
  };

  const disconnectWebSocket = () => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
      addMessage('system', 'Disconnected by user');
    }
  };

  const sendMessage = (type, payload) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      addMessage('error', 'Not connected!');
      return;
    }

    ws.current.send(JSON.stringify({
      type,
      payload,
      timestamp: new Date().toISOString()
    }));

    addMessage('sent', `Sent: ${type}`);
  };

  const sendTestMessage = () => {
    if (messageInput.trim()) {
      sendMessage('MESSAGE', { text: messageInput });
      setMessageInput('');
    }
  };

  const sendPing = () => {
    sendMessage('PING', {});
  };

  const startMeeting = async () => {
    if (!meetingId) {
      addMessage('error', 'Please join a meeting first');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/test/start-meeting?id=${meetingId}`);
      const data = await response.json();
      addMessage('success', `✅ Meeting started (WebSocket enabled)`);
      checkMeetingStatus();
    } catch (error) {
      addMessage('error', `Failed to start meeting: ${error.message}`);
    }
  };

  const endMeeting = async () => {
    if (!meetingId) {
      addMessage('error', 'No active meeting');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/test/end-meeting?id=${meetingId}`);
      const data = await response.json();
      addMessage('warning', `🛑 Meeting ended`);
      checkMeetingStatus();
      setIsJoined(false);
    } catch (error) {
      addMessage('error', `Failed to end meeting: ${error.message}`);
    }
  };

  const checkMeetingStatus = async () => {
    if (!meetingId) return;

    try {
      const response = await fetch(`http://localhost:8080/test/meeting-status?id=${meetingId}`);
      const data = await response.json();
      setMeetingStatus(data);
      addMessage('info', `Status: ${data.isActive ? 'Active ✅' : 'Inactive ❌'}, ${data.participants} participants`);
    } catch (error) {
      addMessage('error', `Failed to check status: ${error.message}`);
    }
  };

  const getAuthToken = () => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'auth_token') {
        return value;
      }
    }
    return '';
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const getMessageClass = (type) => {
    const baseClass = "p-3 rounded-lg border-l-4 mb-2";
    switch (type) {
      case 'success':
        return `${baseClass} bg-green-50 border-green-500 text-green-800`;
      case 'error':
        return `${baseClass} bg-red-50 border-red-500 text-red-800`;
      case 'warning':
        return `${baseClass} bg-yellow-50 border-yellow-500 text-yellow-800`;
      case 'info':
        return `${baseClass} bg-blue-50 border-blue-500 text-blue-800`;
      case 'message':
        return `${baseClass} bg-white border-blue-500 text-gray-800`;
      case 'sent':
        return `${baseClass} bg-gray-50 border-gray-400 text-gray-600`;
      default:
        return `${baseClass} bg-gray-50 border-gray-500 text-gray-700`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🔌 WebSocket Test Console
            </h1>
            <p className="text-gray-600">
              Test your WebSocket connection with real meeting authentication
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <h3 className="font-bold text-blue-900 mb-2">📋 Updated Flow:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
              <li>Login to your app first (so you have auth cookies)</li>
              <li>Create a meeting in your dashboard and copy the token</li>
              <li>Paste the meeting token below and click "Join Meeting"</li>
              <li>Click "Start Meeting" to enable WebSocket</li>
              <li>Click "Connect" to establish WebSocket connection</li>
              <li>Open this page in another tab to test multiple users</li>
            </ol>
          </div>

          {/* Status Bar */}
          <div className={`flex items-center justify-between p-4 rounded-lg mb-6 ${
            isConnected ? 'bg-green-100' : isJoined ? 'bg-yellow-100' : 'bg-red-100'
          }`}>
            <div className="flex items-center gap-3">
              {isConnected ? (
                <Wifi className="w-6 h-6 text-green-600" />
              ) : (
                <WifiOff className="w-6 h-6 text-red-600" />
              )}
              <div>
                <p className="font-bold text-gray-900">
                  {isConnected ? '🟢 Connected' : isJoined ? '🟡 Joined (not connected)' : '⚫ Not Joined'}
                </p>
                {meetingInfo && (
                  <p className="text-sm text-gray-600">
                    Meeting: {meetingInfo.title}
                  </p>
                )}
                {meetingStatus && (
                  <p className="text-sm text-gray-600">
                    WebSocket: {meetingStatus.isActive ? '✅ Enabled' : '❌ Disabled'} • 
                    Participants: {meetingStatus.participants}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={checkMeetingStatus}
              className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Status
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Controls */}
            <div className="lg:col-span-1 space-y-6">
              {/* Step 1: Join Meeting */}
              <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-3">Step 1: Join Meeting</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meeting Token (from URL):
                    </label>
                    <input
                      type="text"
                      value={meetingToken}
                      onChange={(e) => setMeetingToken(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-mono"
                      placeholder="abc123xyz..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Get this from your meeting URL: /meeting/<strong>token</strong>
                    </p>
                  </div>

                  <button
                    onClick={joinMeeting}
                    disabled={isJoined}
                    className={`w-full py-2 rounded font-medium flex items-center justify-center gap-2 ${
                      isJoined
                        ? 'bg-green-500 text-white cursor-default'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    <LogIn className="w-4 h-4" />
                    {isJoined ? '✅ Joined' : 'Join Meeting'}
                  </button>
                </div>
              </div>

              {/* Step 2: Start WebSocket */}
              <div className={`border-2 rounded-lg p-4 ${
                isJoined ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-100 border-gray-300'
              }`}>
                <h3 className="font-bold text-gray-900 mb-3">Step 2: Enable WebSocket</h3>
                <button
                  onClick={startMeeting}
                  disabled={!isJoined}
                  className={`w-full px-4 py-2 rounded flex items-center justify-center gap-2 ${
                    isJoined
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Play className="w-4 h-4" />
                  Start Meeting (Enable WS)
                </button>
              </div>

              {/* Step 3: Connect */}
              <div className={`border-2 rounded-lg p-4 ${
                isJoined ? 'bg-blue-50 border-blue-300' : 'bg-gray-100 border-gray-300'
              }`}>
                <h3 className="font-bold text-gray-900 mb-3">Step 3: Connect WebSocket</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      WebSocket URL:
                    </label>
                    <input
                      type="text"
                      value={wsUrl}
                      onChange={(e) => setWsUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={connectWebSocket}
                      disabled={isConnected || !isJoined}
                      className={`w-full py-2 rounded font-medium ${
                        isConnected
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : !isJoined
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      🔗 Connect
                    </button>
                    <button
                      onClick={disconnectWebSocket}
                      disabled={!isConnected}
                      className={`w-full py-2 rounded font-medium ${
                        !isConnected
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      ❌ Disconnect
                    </button>
                  </div>
                </div>
              </div>

              {/* Test Actions */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-3">Test Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={sendPing}
                    disabled={!isConnected}
                    className={`w-full px-4 py-2 rounded text-sm ${
                      isConnected
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    🏓 Send Ping
                  </button>
                  <button
                    onClick={() => sendMessage('REQUEST_RECOGNITION', {})}
                    disabled={!isConnected}
                    className={`w-full px-4 py-2 rounded text-sm ${
                      isConnected
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    ✋ Request Recognition
                  </button>
                </div>
              </div>

              {/* End Meeting */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-3">End Meeting</h3>
                <button
                  onClick={endMeeting}
                  disabled={!isJoined}
                  className={`w-full px-4 py-2 rounded flex items-center justify-center gap-2 ${
                    isJoined
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Square className="w-4 h-4" />
                  End Meeting
                </button>
              </div>
            </div>

            {/* Right Column - Messages */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900">📨 Messages</h3>
                  <button
                    onClick={clearMessages}
                    className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-2 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4 h-[600px] overflow-y-auto">
                  {messages.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                      No messages yet. Follow the steps to connect!
                    </p>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className={getMessageClass(msg.type)}>
                        <span className="text-xs font-mono text-gray-500 mr-2">
                          [{msg.time}]
                        </span>
                        <span className="text-sm">{msg.text}</span>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Send Message */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Send Test Message:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendTestMessage()}
                      disabled={!isConnected}
                      placeholder={isConnected ? "Type a message..." : "Connect first..."}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-200"
                    />
                    <button
                      onClick={sendTestMessage}
                      disabled={!isConnected || !messageInput.trim()}
                      className={`px-4 py-2 rounded font-medium flex items-center gap-2 ${
                        !isConnected || !messageInput.trim()
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      <Send className="w-4 h-4" />
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WebSocketTest;