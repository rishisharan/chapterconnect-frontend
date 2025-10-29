import { useState, useEffect, useRef, useCallback } from 'react';

const useWebSocket = (url = 'ws://localhost:8080/ws') => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const ws = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const [connectionConfig, setConnectionConfig] = useState(null);

  // Connect to WebSocket
  const connect = useCallback((config) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      console.log('[WS] Already connected');
      return;
    }

    console.log('[WS] Connecting to:', url, config, config.firstName, config.lastName);
    setConnectionConfig(config);
    const fullUrl = `ws://localhost:8080/ws?meetingId=${config.meetingId}&guestName=${encodeURIComponent(config.firstName+config.lastName)}`;
    ws.current = new WebSocket(fullUrl);

    ws.current.onopen = () => {
      console.log('[WS] Connected successfully');
      setIsConnected(true);

      // Send AUTH message immediately
      if (config) {
        sendAuth(config);
      }
    };

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('[WS] Received:', message);
        setLastMessage(message);
        setMessages((prev) => [...prev, message]);
      } catch (error) {
        console.error('[WS] Failed to parse message:', error);
      }
    };

    ws.current.onerror = (error) => {
      console.error('[WS] Error:', error);
    };

    ws.current.onclose = (event) => {
      console.log(`[WS] Connection closed (Code: ${event.code})`);
      setIsConnected(false);

      // Auto-reconnect after 3 seconds if config exists
      if (config && event.code !== 1000) {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('[WS] Attempting reconnect...');
          connect(config);
        }, 3000);
      }
    };
  }, [url]);

  // Send AUTH message
  const sendAuth = useCallback((config) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      console.error('[WS] Cannot send AUTH - not connected');
      return;
    }

    const authMessage = {
      type: 'AUTH',
      payload: {
        token: config.token || 'guest-token',
        meetingId: config.meetingId,
        firstName: config.firstName,
        lastName: config.lastName,
        displayName: `${config.firstName} ${config.lastName}`
      },
      timestamp: new Date().toISOString()
    };

    console.log('[WS] Sending AUTH:', authMessage);
    ws.current.send(JSON.stringify(authMessage));
  }, []);

  // Send any message
  const sendMessage = useCallback((type, payload) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      console.error('[WS] Cannot send message - not connected');
      return false;
    }

    const message = {
      type,
      payload: typeof payload === 'string' ? payload : JSON.stringify(payload),
      timestamp: new Date().toISOString()
    };

    ws.current.send(JSON.stringify(message));
    return true;
  }, []);

  // Disconnect
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (ws.current) {
      ws.current.close(1000, 'Client disconnect');
      ws.current = null;
    }
    setIsConnected(false);
    setConnectionConfig(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws.current) {
        ws.current.close(1000, 'Component unmount');
      }
    };
  }, []);

  return {
    isConnected,
    lastMessage,
    messages,
    connect,
    disconnect,
    sendMessage,
    clearMessages: () => setMessages([])
  };
};

export default useWebSocket;


// ============================================
// USAGE EXAMPLE 1: Test Console Component
// ============================================
/*
import React, { useState } from 'react';
import useWebSocket from './hooks/useWebSocket';

function WebSocketTestConsole() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [meetingToken, setMeetingToken] = useState('');
  const [meetingId, setMeetingId] = useState('');
  
  const { isConnected, messages, connect, disconnect, sendMessage } = useWebSocket();

  const joinMeeting = async () => {
    // Get meeting info
    const response = await fetch(`http://localhost:8080/api/meetings/${meetingToken}`);
    const meetingData = await response.json();
    setMeetingId(meetingData.id);

    // Join meeting
    await fetch(`http://localhost:8080/api/meetings/${meetingToken}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName })
    });

    // Connect WebSocket
    connect({
      meetingId: meetingData.id,
      firstName,
      lastName,
      token: getCookie('auth_token')
    });
  };

  const sendChatMessage = () => {
    sendMessage('MESSAGE', { text: 'Hello everyone!' });
  };

  return (
    <div>
      <h1>WebSocket Test Console</h1>
      <p>Status: {isConnected ? '🟢 Connected' : '⚫ Disconnected'}</p>
      
      <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" />
      <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" />
      <input value={meetingToken} onChange={(e) => setMeetingToken(e.target.value)} placeholder="Meeting Token" />
      
      <button onClick={joinMeeting}>Join Meeting</button>
      <button onClick={disconnect}>Leave Meeting</button>
      <button onClick={sendChatMessage} disabled={!isConnected}>Send Message</button>

      <div>
        {messages.map((msg, i) => (
          <div key={i}>{msg.type}: {msg.payload}</div>
        ))}
      </div>
    </div>
  );
}
*/


// ============================================
// USAGE EXAMPLE 2: Meeting Room Component
// ============================================
/*
import React, { useEffect } from 'react';
import useWebSocket from './hooks/useWebSocket';

function MeetingRoom({ meetingId, userName }) {
  const { isConnected, lastMessage, sendMessage, connect, disconnect } = useWebSocket();

  useEffect(() => {
    // Auto-connect when component mounts
    connect({
      meetingId,
      firstName: userName.split(' ')[0],
      lastName: userName.split(' ')[1],
      token: getCookie('auth_token')
    });

    // Cleanup on unmount
    return () => disconnect();
  }, [meetingId, userName, connect, disconnect]);

  // Handle specific message types
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case 'USER_JOINED':
        console.log('User joined:', lastMessage.payload);
        break;
      case 'MESSAGE':
        console.log('New message:', lastMessage.payload);
        break;
    }
  }, [lastMessage]);

  return (
    <div>
      <h2>Meeting Room</h2>
      <p>Connection: {isConnected ? 'Active' : 'Inactive'}</p>
      <button onClick={() => sendMessage('MESSAGE', { text: 'Hi!' })}>
        Send Message
      </button>
    </div>
  );
}
*/