import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Hand, 
  MessageSquare, 
  Users, 
  BookOpen,
  Bell,
  Info,
  Clock,
  CheckCircle,
  XCircle,
  MinusCircle
} from 'lucide-react';

function GuestMeeting() {
  // State management
  const [activeTab, setActiveTab] = useState('discussion');
  const [participants, setParticipants] = useState([
    { id: 1, name: 'SuneelBikkasani', role: 'Chairman', avatar: 'S', color: 'bg-blue-500' },
    { id: 2, name: 'ShrikaMotay', role: 'Guest', avatar: 'S', color: 'bg-purple-500' },
    { id: 3, name: 'John Doe', role: 'Guest', avatar: 'JD', color: 'bg-blue-400', isYou: true }
  ]);
  
  const [messages, setMessages] = useState([
    { id: 1, user: 'Chairman', text: "Let's begin with the call to order.", time: '10:30 AM', isChairman: true },
    { id: 2, user: 'ShrikaMotay', text: 'Good morning everyone!', time: '10:31 AM' }
  ]);
  
  const [messageInput, setMessageInput] = useState('');
  const [handRaised, setHandRaised] = useState(false);
  const [speakingQueue, setSpeakingQueue] = useState([]);
  const [votingActive, setVotingActive] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  
  const messagesEndRef = useRef(null);
  
  // Current agenda item
  const currentAgenda = {
    title: 'Call to Order',
    speaker: 'Chairman',
    time: '00:23',
    status: 'In Progress',
    description: 'Opening remarks by Chairman • Time: 00:23 • Next: Reading of Minutes'
  };
  
  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handlers
  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const newMessage = {
        id: messages.length + 1,
        user: 'You',
        text: messageInput,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isYou: true
      };
      setMessages([...messages, newMessage]);
      setMessageInput('');
    }
  };
  
  const handleRaiseHand = () => {
    setHandRaised(!handRaised);
    if (!handRaised) {
      // Add to speaking queue
      setSpeakingQueue([...speakingQueue, 'You']);
    } else {
      // Remove from queue
      setSpeakingQueue(speakingQueue.filter(name => name !== 'You'));
    }
  };
  
  const handleVote = (vote) => {
    setHasVoted(true);
    // Send vote to backend
    console.log('Voted:', vote);
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">📄</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Some Review</h1>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                    Guest
                  </span>
                  <span>•</span>
                  <span>3 participants</span>
                  <span>•</span>
                  <span className="text-red-500 flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    Live
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Participant avatars */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className={`${p.color} w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm border-2 border-white`}
                  title={p.name}
                >
                  {p.avatar}
                </div>
              ))}
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="bg-white border-b border-gray-200">
            <div className="flex px-6">
              <button
                className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === 'agenda'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('agenda')}
              >
                Agenda
              </button>
              <button
                className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === 'discussion'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('discussion')}
              >
                Discussion
              </button>
              <button
                className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === 'history'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('history')}
              >
                History
              </button>
            </div>
          </div>
          
          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Current Agenda Item - View Only */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900">
                    📋 CURRENT AGENDA ITEM
                  </h2>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                    View Only
                  </span>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  {currentAgenda.status}
                </span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Item</p>
                  <p className="text-xl font-semibold text-gray-900">{currentAgenda.title}</p>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Speaker: {currentAgenda.speaker}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Time: {currentAgenda.time}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600">
                  {currentAgenda.description}
                </p>
              </div>
              
              {/* Voting Section (when active) */}
              {votingActive && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Cast Your Vote:
                  </p>
                  {!hasVoted ? (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleVote('yes')}
                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Vote Yes
                      </button>
                      <button
                        onClick={() => handleVote('no')}
                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        Vote No
                      </button>
                      <button
                        onClick={() => handleVote('abstain')}
                        className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium flex items-center justify-center gap-2"
                      >
                        <MinusCircle className="w-5 h-5" />
                        Abstain
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                      <p className="text-green-700 font-medium">✓ You have voted</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Quick Actions */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex gap-3">
                  <button
                    onClick={handleRaiseHand}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                      handRaised
                        ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-400'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Hand className="w-5 h-5" />
                    {handRaised ? 'Hand Raised ✋' : 'Raise Hand'}
                  </button>
                  <button className="flex-1 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center justify-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Request to Speak
                  </button>
                </div>
                
                {/* Queue Status */}
                {speakingQueue.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Speaking Queue:</strong> {speakingQueue.length} person(s) waiting
                      {speakingQueue.includes('You') && (
                        <span className="ml-2 font-semibold">• You are #{speakingQueue.indexOf('You') + 1} in queue</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Discussion Thread */}
            <div className="bg-white rounded-lg border border-gray-200 h-[500px] flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  💬 DISCUSSION THREAD
                </h3>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.isYou ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                      msg.isChairman ? 'bg-blue-500' : msg.isYou ? 'bg-blue-400' : 'bg-purple-500'
                    }`}>
                      {msg.user.charAt(0)}
                    </div>
                    <div className={`flex-1 ${msg.isYou ? 'text-right' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-semibold ${msg.isChairman ? 'text-blue-600' : 'text-gray-900'}`}>
                          {msg.user}
                          {msg.isChairman && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                              Chairman
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-gray-500">{msg.time}</span>
                      </div>
                      <p className={`text-sm p-3 rounded-lg inline-block ${
                        msg.isYou 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        {msg.text}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message here..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Sendd
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          {/* Participants */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              PARTICIPANTS
            </h3>
            <div className="space-y-2">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    participant.isYou ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`${participant.color} w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold`}>
                    {participant.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {participant.name}
                      {participant.isYou && (
                        <span className="ml-2 text-blue-600 text-sm">(You)</span>
                      )}
                    </p>
                    <p className={`text-xs ${
                      participant.role === 'Chairman' ? 'text-blue-600 font-medium' : 'text-gray-500'
                    }`}>
                      {participant.role === 'Chairman' && '👔 '}
                      {participant.role}
                    </p>
                  </div>
                  {participant.isYou && handRaised && (
                    <Hand className="w-5 h-5 text-yellow-600" />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex-1 p-4 overflow-y-auto">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              ✋ QUICK ACTIONS
            </h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-left flex items-center gap-3 text-gray-700">
                <Hand className="w-5 h-5" />
                <span className="font-medium">Raise Hand</span>
              </button>
              <button className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-left flex items-center gap-3 text-gray-700">
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium">Request to Speak</span>
              </button>
              <button className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-left flex items-center gap-3 text-gray-700">
                <Info className="w-5 h-5" />
                <span className="font-medium">Point of Information</span>
              </button>
              <button className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-left flex items-center gap-3 text-gray-700">
                <BookOpen className="w-5 h-5" />
                <span className="font-medium">View Meeting Rules</span>
              </button>
              <button className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-left flex items-center gap-3 text-gray-700">
                <Bell className="w-5 h-5" />
                <span className="font-medium">Toggle Notifications</span>
              </button>
            </div>
            
            {/* Help Text */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>💡 Tip:</strong> Raise your hand to participate in the discussion. The chairman will call on you when it's your turn.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuestMeeting;