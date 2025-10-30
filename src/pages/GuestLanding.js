import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LogIn, Users, Calendar, AlertCircle, Loader2, Link2 } from 'lucide-react';
import useWebSocket from '../hooks/useWebSocket';
function GuestLanding() {
  const navigate = useNavigate();
  const { id, token } = useParams(); // Extract from URL: /meeting/:id/:token
  const [wsUrl, setWsUrl] = useState('ws://localhost:8080/ws');
  // Check if coming from a direct link
  const isDirectLink = !!(id && token);
  const ws = useRef(null);
  const { isConnected, messages, connect, disconnect, sendMessage } = useWebSocket();
  // Form state
  const [formData, setFormData] = useState({
    meetingId: id || '',
    meetingToken: token || '',
    firstName: '',
    lastName: ''
  });
  
  // Fetch meeting info on mount if direct link
  useEffect(() => {
    if (isDirectLink) {
      fetchMeetingInfo(token);
    }
  }, [isDirectLink, token]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [meetingInfo, setMeetingInfo] = useState(null);
  
  // Fetch meeting info (for direct links)
  const fetchMeetingInfo = async (meetingToken) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/meetings/${meetingToken}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );
      
      if (!response.ok) {
        throw new Error('Meeting not found');
      }
      
      const data = await response.json();
      setMeetingInfo(data);
    } catch (err) {
      console.error('Error fetching meeting:', err);
      setError('Invalid meeting link. Please check the URL.');
    }
  };
  
  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error on input change
  };
  
  // Validate form
  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('Please enter your first name');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Please enter your last name');
      return false;
    }
    // Only validate token if not a direct link
    if (!isDirectLink && !formData.meetingToken.trim()) {
      setError('Please enter the meeting token');
      return false;
    }
    return true;
  };
  
  // Handle form submission
  const handleJoinMeeting = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      let meetingData = meetingInfo; // Use existing if direct link
      
      // Step 1: Get meeting info (only if not already fetched)
      if (!isDirectLink) {
        const getMeetingResponse = await fetch(
          `http://localhost:8080/api/meetings/${formData.meetingToken}`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );
        
        if (!getMeetingResponse.ok) {
          throw new Error('Meeting not found. Please check your meeting token.');
        }
        
        meetingData = await getMeetingResponse.json();
        setMeetingInfo(meetingData);
      }
      
      // Step 2: Register as guest
      const registerResponse = await fetch(
        `http://localhost:8080/api/meetings/${formData.meetingToken}/register_guest`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim()
          })
        }
      );
      
      if (!registerResponse.ok) {
        const errorText = await registerResponse.text();
        throw new Error(errorText || 'Failed to join meeting');
      }
      
      const registerData = await registerResponse.json();
      
      // Step 3: Redirect to meeting room with data
      navigate(`/guest-meeting-join/${meetingData.id}/${meetingData.token}`, {
        state: {
          guestName: `${formData.firstName} ${formData.lastName}`,
          meetingInfo: meetingData,
          connectionToken: registerData.connectionToken
        }
      });
       setTimeout(() => connectWebSocket(meetingData.id, meetingData.token), 500);
      
    } catch (err) {
      console.error('Join error:', err);
      setError(err.message || 'Failed to join meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = (meetingId, token) => {
    connect({
      meetingId: meetingId,
      firstName: `${formData.firstName}`,
      lastName: `${formData.lastName}`,
      token: token
    });
  }


  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ChapterConnect
          </h1>
          <p className="text-gray-600">
            Join as a Guest
          </p>
        </div>
        
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Direct Link Indicator */}
          {isDirectLink && meetingInfo && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Link2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Joining: <strong>{meetingInfo.title}</strong>
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Meeting details have been pre-filled from your invitation link
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {isDirectLink ? 'Enter Your Name' : 'Join Meeting'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isDirectLink 
                ? 'Please introduce yourself to join the meeting' 
                : 'Enter your details to participate'
              }
            </p>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          {/* Form */}
          <form onSubmit={handleJoinMeeting} className="space-y-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                required
              />
            </div>
            
            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                required
              />
            </div>
            
            {/* Meeting Token */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Token *
                {isDirectLink && (
                  <span className="ml-2 text-xs text-green-600 font-normal">
                    ✓ Pre-filled
                  </span>
                )}
              </label>
              <input
                type="text"
                name="meetingToken"
                value={formData.meetingToken}
                onChange={handleChange}
                placeholder="abc123xyz789"
                disabled={loading || isDirectLink}
                className={`w-full px-4 py-3 border rounded-lg font-mono text-sm transition-colors ${
                  isDirectLink 
                    ? 'bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed' 
                    : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                required={!isDirectLink}
              />
              {!isDirectLink && (
                <p className="text-xs text-gray-500 mt-1">
                  The meeting organizer will provide this token
                </p>
              )}
            </div>
            
            {/* Meeting ID (Hidden for direct links, optional otherwise) */}
            {!isDirectLink && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting ID <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="meetingId"
                  value={formData.meetingId}
                  onChange={handleChange}
                  placeholder="Optional"
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                />
              </div>
            )}
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 transition-colors mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Join Meeting
                </>
              )}
            </button>
          </form>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Having trouble? Contact your meeting organizer
          </p>
        </div>
        
        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xs text-gray-600 font-medium">Collaborate</p>
          </div>
          <div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-xs text-gray-600 font-medium">Real-time</p>
          </div>
          <div>
            <div className="w-10 h-10 bg-green-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
              <LogIn className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-xs text-gray-600 font-medium">Easy Join</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuestLanding;
