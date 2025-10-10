// ============================================
// FILE: src/contexts/WebSocketContext.js
// ============================================
// WebSocket Context Provider (Better for production)

import React, { createContext, useContext, useRef, useState, useCallback } from 'react';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children, url = 'ws://localhost:8080/ws' }) => {
  const ws = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentMeetingId, setCurrentMeetingId] = useState(null);
  const eventHandlers = useRef(new Map());

  const connect = useCallback((meetingId, token) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      console.log('Already connected');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        
        // Send auth
        ws.current.send(JSON.stringify({
          type: 'AUTH',
          payload: { token, meetingId },
          timestamp: new Date().toISOString()
        }));
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'CONNECTED') {
            setIsConnected(true);
            setCurrentMeetingId(meetingId);
            resolve();
          } else if (message.type === 'ERROR') {
            reject(new Error(JSON.parse(message.payload || '{}').error));
          }

          // Trigger registered event handlers
          const handlers = eventHandlers.current.get(message.type) || [];
          handlers.forEach(handler => handler(message.payload));

          // Trigger wildcard handlers
          const wildcardHandlers = eventHandlers.current.get('*') || [];
          wildcardHandlers.forEach(handler => handler(message));
          
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      ws.current.onclose = () => {
        console.log('WebSocket closed');
        setIsConnected(false);
        setCurrentMeetingId(null);
      };
    });
  }, [url]);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
      setIsConnected(false);
      setCurrentMeetingId(null);
    }
  }, []);

  const send = useCallback((type, payload) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type,
        payload,
        timestamp: new Date().toISOString()
      }));
      return true;
    }
    return false;
  }, []);

  const on = useCallback((eventType, handler) => {
    if (!eventHandlers.current.has(eventType)) {
      eventHandlers.current.set(eventType, []);
    }
    eventHandlers.current.get(eventType).push(handler);

    // Return cleanup function
    return () => {
      const handlers = eventHandlers.current.get(eventType);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    };
  }, []);

  const value = {
    isConnected,
    currentMeetingId,
    connect,
    disconnect,
    send,
    on
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider');
  }
  return context;
};
