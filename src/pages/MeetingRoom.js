import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Users,
  Clock,
  FileText,
  MessageSquare,
  Minus,
  ChevronRight,
  Calendar,
  BarChart3,
  History as HistoryIcon,
  CheckCircle,
  Circle,
  XCircle,
  X
} from 'lucide-react';

function MeetingRoom() {
  const { id, token } = useParams();
  
  // Tabs: agenda, history, participants, notes
  const [activeTab, setActiveTab] = useState('agenda');
  
  // Mock meeting data
  const [meeting, setMeeting] = useState({
    id: id,
    title: "House Of Dragons S1",
    status: "offline",
    participantCount: 0
  });

  // Mock agenda items
  const [agendaItems, setAgendaItems] = useState([
    { id: 1, title: "Call to Order", duration: "5 min", status: "completed" },
    { id: 2, title: "Reading of Minutes", duration: "10 min", status: "completed" },
    { id: 3, title: "Q4 Budget Approval", duration: "30 min", status: "active" },
    { id: 4, title: "Motion and Voting", duration: "30 min", status: "pending" },
    { id: 5, title: "Committee Reports", duration: "15 min", status: "pending" },
    { id: 6, title: "New Business", duration: "20 min", status: "pending" },
    { id: 7, title: "Adjournment", duration: "5 min", status: "pending" },
    { id: 8, title: "Post-Meeting", duration: "0 min", status: "pending" }
  ]);

  // Mock motions data - linked to agenda items
  const [motions, setMotions] = useState([
    {
      id: 1,
      agendaItemId: 3,
      title: "Approve Budget Increase",
      proposer: "John Smith",
      seconder: "Mary Johnson",
      status: "approved",
      votesYes: 8,
      votesNo: 2,
      votesAbstain: 1,
      totalVoters: 11,
      proposedAt: "10:25",
      fullText: "Motion to approve a 15% increase in the Q4 budget to account for unexpected operational costs."
    },
    {
      id: 2,
      agendaItemId: 3,
      title: "Approve Additional Marketing Budget",
      proposer: "Sarah Johnson",
      seconder: "Mike Chen",
      status: "pending",
      votesYes: 0,
      votesNo: 0,
      votesAbstain: 0,
      totalVoters: 0,
      proposedAt: "10:35",
      fullText: "Motion to allocate an additional $50,000 to the marketing budget for Q4 promotional campaigns."
    },
    {
      id: 3,
      agendaItemId: 4,
      title: "Amend Bylaw Section 5",
      proposer: "Mike Chen",
      seconder: "Emily Davis",
      status: "rejected",
      votesYes: 3,
      votesNo: 9,
      votesAbstain: 2,
      totalVoters: 14,
      proposedAt: "11:05",
      fullText: "Motion to amend Bylaw Section 5 to allow remote voting in all circumstances."
    },
    {
      id: 4,
      agendaItemId: 6,
      title: "Approve New Hiring Policy",
      proposer: "Emily Davis",
      status: "pending",
      votesYes: 0,
      votesNo: 0,
      votesAbstain: 0,
      totalVoters: 0,
      proposedAt: "11:45",
      fullText: "Motion to approve the new hiring policy that includes remote work options and flexible schedules."
    }
  ]);

  // Current agenda item
  const [currentAgendaItem, setCurrentAgendaItem] = useState({
    id: 3,
    title: "Q4 Budget Approval",
    status: "In Progress",
    speaker: "Treasurer",
    timeStarted: "10:01",
    nextItem: "Motion and Voting"
  });

  // Current motion being discussed/voted on
  const [currentMotion, setCurrentMotion] = useState(null);

  // Meeting history/timeline
  const [meetingHistory, setMeetingHistory] = useState([
    {
      id: 1,
      timestamp: "00:00",
      type: "meeting_start",
      description: "Meeting started",
      user: "System"
    },
    {
      id: 2,
      timestamp: "10:01",
      type: "agenda_change",
      description: "Started: Q4 Budget Approval",
      user: "Chairman",
      agendaItemId: 3
    }
  ]);

  // Statistics
  const [statistics, setStatistics] = useState({
    duration: "0:23",
    motions: 0,
    attendance: 0,
    quorumMet: false
  });

  // Update statistics when motions change
  useEffect(() => {
    setStatistics(prev => ({
      ...prev,
      motions: motions.length
    }));
  }, [motions]);

  // Handle agenda item click
  const handleAgendaItemClick = (item) => {
    const updatedAgendaItems = agendaItems.map(agendaItem => {
      if (agendaItem.id === item.id) {
        return { ...agendaItem, status: 'active' };
      } else if (agendaItem.id < item.id) {
        return { ...agendaItem, status: 'completed' };
      } else {
        return { ...agendaItem, status: 'pending' };
      }
    });
    setAgendaItems(updatedAgendaItems);

    const nextItemIndex = updatedAgendaItems.findIndex(a => a.id === item.id) + 1;
    const nextItem = nextItemIndex < updatedAgendaItems.length 
      ? updatedAgendaItems[nextItemIndex].title 
      : "None";

    const newCurrentItem = {
      id: item.id,
      title: item.title,
      status: "In Progress",
      speaker: getSpeakerForAgendaItem(item.title),
      timeStarted: getCurrentTime(),
      nextItem: nextItem
    };
    setCurrentAgendaItem(newCurrentItem);

    setCurrentMotion(null);

    const historyEntry = {
      id: meetingHistory.length + 1,
      timestamp: getCurrentTime(),
      type: "agenda_change",
      description: `Started: ${item.title}`,
      user: "Chairman",
      agendaItemId: item.id
    };
    setMeetingHistory([...meetingHistory, historyEntry]);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle motion selection from history
  const handleMotionSelect = (motion) => {
    setCurrentMotion(motion);
    
    const historyEntry = {
      id: meetingHistory.length + 1,
      timestamp: getCurrentTime(),
      type: "motion_selected",
      description: `Selected motion: ${motion.title}`,
      user: "Chairman",
      motionId: motion.id
    };
    setMeetingHistory([...meetingHistory, historyEntry]);

    setActiveTab('agenda');
  };

  const getSpeakerForAgendaItem = (title) => {
    const speakerMap = {
      "Call to Order": "Chairman",
      "Reading of Minutes": "Secretary",
      "Q4 Budget Approval": "Treasurer",
      "Motion and Voting": "Chairman",
      "Committee Reports": "Committee Chair",
      "New Business": "Chairman",
      "Adjournment": "Chairman",
      "Post-Meeting": "All"
    };
    return speakerMap[title] || "Chairman";
  };

  const getCurrentTime = () => {
    const now = new Date();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-700 border-green-200',
      completed: 'bg-blue-100 text-blue-700 border-blue-200',
      pending: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return styles[status] || styles.pending;
  };

  const getStatusIcon = (status) => {
    if (status === 'active') return <Circle className="w-4 h-4 fill-green-500 text-green-500" />;
    if (status === 'completed') return <CheckCircle className="w-4 h-4 text-blue-500" />;
    return <Circle className="w-4 h-4 text-gray-400" />;
  };

  const handleRaiseHand = () => {
    const historyEntry = {
      id: meetingHistory.length + 1,
      timestamp: getCurrentTime(),
      type: "hand_raised",
      description: "Hand raised",
      user: "Participant"
    };
    setMeetingHistory([...meetingHistory, historyEntry]);
  };

  const handlePointOfOrder = () => {
    const historyEntry = {
      id: meetingHistory.length + 1,
      timestamp: getCurrentTime(),
      type: "point_of_order",
      description: "Point of Order raised",
      user: "Participant"
    };
    setMeetingHistory([...meetingHistory, historyEntry]);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{meeting.title}</h1>
            <p className="text-sm text-gray-500">
              {meeting.participantCount} participants • {meeting.status}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Current Agenda Item Section */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <div>
                  <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Current Agenda Item</h2>
                  <h3 className="text-lg font-bold text-gray-900">{currentAgendaItem.title}</h3>
                </div>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                {currentAgendaItem.status}
              </span>
            </div>
            <div className="text-xs text-gray-600">
              <p>Opening remarks by {currentAgendaItem.speaker} • Time: {currentAgendaItem.timeStarted} • Next: {currentAgendaItem.nextItem}</p>
            </div>
          </div>

          {/* Current Motion Display OR List of Motions */}
          {currentMotion ? (
            <div className="bg-white rounded-lg border-2 border-purple-300 shadow-lg mb-4">
              <div className="px-6 py-4 bg-purple-50 border-b border-purple-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-6 h-6 text-purple-600" />
                    <h3 className="font-bold text-gray-900">Current Motion</h3>
                    <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded-full text-xs font-semibold">
                      Active Discussion
                    </span>
                  </div>
                  <button
                    onClick={() => setCurrentMotion(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{currentMotion.title}</h4>
                    <p className="text-gray-700 leading-relaxed mb-4">{currentMotion.fullText}</p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium ml-4 flex-shrink-0 ${
                    currentMotion.status === 'approved' 
                      ? 'bg-green-100 text-green-700'
                      : currentMotion.status === 'rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {currentMotion.status.charAt(0).toUpperCase() + currentMotion.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Proposed by</p>
                    <p className="font-semibold text-gray-900">{currentMotion.proposer}</p>
                  </div>
                  {currentMotion.seconder && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Seconded by</p>
                      <p className="font-semibold text-gray-900">{currentMotion.seconder}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Time Proposed</p>
                    <p className="font-semibold text-gray-900">{currentMotion.proposedAt}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Agenda Item</p>
                    <p className="font-semibold text-gray-900">
                      {agendaItems.find(item => item.id === currentMotion.agendaItemId)?.title}
                    </p>
                  </div>
                </div>

                {currentMotion.totalVoters > 0 ? (
                  <div className="mb-4">
                    <h5 className="font-semibold text-gray-900 mb-3">Voting Results</h5>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-green-600">{currentMotion.votesYes}</div>
                        <div className="text-xs text-gray-600">Yes</div>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-red-600">{currentMotion.votesNo}</div>
                        <div className="text-xs text-gray-600">No</div>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-gray-600">{currentMotion.votesAbstain}</div>
                        <div className="text-xs text-gray-600">Abstain</div>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Total Votes: {currentMotion.totalVoters}</span>
                        <span className="font-semibold text-gray-900">
                          {Math.round((currentMotion.votesYes / currentMotion.totalVoters) * 100)}% Approval
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div className="h-full flex">
                          <div 
                            className="bg-green-500"
                            style={{ width: `${(currentMotion.votesYes / currentMotion.totalVoters) * 100}%` }}
                          ></div>
                          <div 
                            className="bg-red-500"
                            style={{ width: `${(currentMotion.votesNo / currentMotion.totalVoters) * 100}%` }}
                          ></div>
                          <div 
                            className="bg-gray-400"
                            style={{ width: `${(currentMotion.votesAbstain / currentMotion.totalVoters) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800">
                      📢 Voting not started. Waiting for votes...
                    </p>
                  </div>
                )}

                {currentMotion.status === 'pending' && (
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-3">Cast Your Vote</h5>
                    <div className="flex gap-3">
                      <button className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Vote Yes
                      </button>
                      <button className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                        <XCircle className="w-5 h-5" />
                        Vote No
                      </button>
                      <button className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                        <Minus className="w-5 h-5" />
                        Abstain
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            motions.filter(m => m.agendaItemId === currentAgendaItem.id).length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 mb-4">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <h3 className="font-bold text-gray-900">
                      Motions for {currentAgendaItem.title}
                    </h3>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                      {motions.filter(m => m.agendaItemId === currentAgendaItem.id).length}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Go to History tab to select a motion for voting
                  </p>
                </div>
                <div className="divide-y divide-gray-200">
                  {motions
                    .filter(m => m.agendaItemId === currentAgendaItem.id)
                    .map((motion) => (
                      <div key={motion.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{motion.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{motion.fullText}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {motion.proposer}
                              </span>
                              {motion.seconder && <span>• {motion.seconder}</span>}
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {motion.proposedAt}
                              </span>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ml-4 ${
                            motion.status === 'approved' 
                              ? 'bg-green-100 text-green-700'
                              : motion.status === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {motion.status.charAt(0).toUpperCase() + motion.status.slice(1)}
                          </span>
                        </div>
                        
                        {motion.totalVoters > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-3 text-sm">
                            <span className="text-green-600 font-medium">✓ {motion.votesYes}</span>
                            <span className="text-red-600 font-medium">✗ {motion.votesNo}</span>
                            <span className="text-gray-500">⊘ {motion.votesAbstain}</span>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )
          )}

          {/* Discussion Thread - Below Motion */}
          <div className="bg-white rounded-lg border border-gray-200 mb-4">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900">Discussion Thread</h3>
              </div>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">
                Join Queue
              </button>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                No messages yet
              </div>
            </div>
          </div>

          {/* Actions Panel */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎯</span>
                <h3 className="font-bold text-gray-900">Actions</h3>
              </div>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              <button 
                onClick={handleRaiseHand}
                className="px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left border border-gray-200"
              >
                <span className="text-lg mb-1 block">✋</span>
                <span className="text-sm font-medium text-gray-900">Raise Hand / Join Queue</span>
              </button>
              <button 
                onClick={handlePointOfOrder}
                className="px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left border border-gray-200"
              >
                <span className="text-lg mb-1 block">📢</span>
                <span className="text-sm font-medium text-gray-900">Point of Order</span>
              </button>
              <button className="px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left border border-gray-200">
                <span className="text-lg mb-1 block">❓</span>
                <span className="text-sm font-medium text-gray-900">Point of Information</span>
              </button>
              <button className="px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left border border-gray-200">
                <span className="text-lg mb-1 block">⚡</span>
                <span className="text-sm font-medium text-gray-900">Call the Question</span>
              </button>
              <button className="px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left border border-gray-200">
                <span className="text-lg mb-1 block">📋</span>
                <span className="text-sm font-medium text-gray-900">Table Motion</span>
              </button>
              <button className="px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left border border-gray-200">
                <span className="text-lg mb-1 block">✏️</span>
                <span className="text-sm font-medium text-gray-900">Amend Motion</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {[
              { id: 'agenda', label: 'Agenda', icon: FileText },
              { id: 'history', label: 'History', icon: HistoryIcon },
              { id: 'participants', label: 'Participants', icon: Users },
              { id: 'notes', label: 'Notes', icon: FileText }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'agenda' && (
              <div>
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-gray-900">Meeting Agenda</h3>
                  </div>
                </div>

                <div className="space-y-2">
                  {agendaItems.map((item, index) => {
                    const itemMotionCount = motions.filter(m => m.agendaItemId === item.id).length;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleAgendaItemClick(item)}
                        className={`w-full text-left p-4 rounded-lg border transition-all hover:shadow-md ${
                          item.status === 'active'
                            ? 'bg-yellow-50 border-yellow-300 shadow-sm'
                            : item.status === 'completed'
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            {getStatusIcon(item.status)}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 mb-1">
                                {index + 1}. {item.title}
                              </p>
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-gray-500">Est. {item.duration}</p>
                                {itemMotionCount > 0 && (
                                  <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                    <FileText className="w-3 h-3" />
                                    {itemMotionCount} motion{itemMotionCount > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {item.status === 'active' && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                              Active
                            </span>
                          )}
                          {item.status === 'completed' && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                              Done
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Statistics */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-gray-900">Statistics</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{statistics.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Motions:</span>
                      <span className="font-medium">{statistics.motions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Attendance:</span>
                      <span className="font-medium">{statistics.attendance}/0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quorum Met:</span>
                      <span className={`font-medium ${statistics.quorumMet ? 'text-green-600' : 'text-red-600'}`}>
                        {statistics.quorumMet ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <HistoryIcon className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-gray-900">All Motions</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Click on any motion to discuss and vote
                </p>

                <div className="space-y-3">
                  {motions.map((motion) => {
                    const agendaItem = agendaItems.find(item => item.id === motion.agendaItemId);
                    const isSelected = currentMotion?.id === motion.id;
                    
                    return (
                      <button
                        key={motion.id}
                        onClick={() => handleMotionSelect(motion)}
                        className={`w-full text-left p-4 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-purple-50 border-purple-300 shadow-md ring-2 ring-purple-200'
                            : 'bg-white border-gray-200 hover:border-purple-200 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                              {isSelected && <span className="text-purple-600">▶</span>}
                              {motion.title}
                            </h4>
                            <p className="text-xs text-gray-500 mb-2">
                              📂 {agendaItem?.title || 'Unknown Agenda Item'}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${
                            motion.status === 'approved' 
                              ? 'bg-green-100 text-green-700'
                              : motion.status === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {motion.status.charAt(0).toUpperCase() + motion.status.slice(1)}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {motion.fullText}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {motion.proposer}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {motion.proposedAt}
                          </span>
                        </div>

                        {motion.totalVoters > 0 ? (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-green-600 font-medium">✓ {motion.votesYes}</span>
                            <span className="text-red-600 font-medium">✗ {motion.votesNo}</span>
                            <span className="text-gray-500">⊘ {motion.votesAbstain}</span>
                            <span className="text-gray-400">|</span>
                            <span className="text-gray-600">{motion.totalVoters} votes</span>
                          </div>
                        ) : (
                          <div className="text-xs text-amber-600 font-medium">
                            📢 Waiting for votes
                          </div>
                        )}

                        {isSelected && (
                          <div className="mt-2 pt-2 border-t border-purple-200">
                            <span className="text-xs font-medium text-purple-700">
                              Currently discussing
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {motions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No motions proposed yet
                  </div>
                )}

                {/* Meeting Events Timeline */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Meeting Timeline
                  </h4>
                  <div className="space-y-3">
                    {meetingHistory.slice().reverse().map((event, index) => (
                      <div key={event.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            event.type === 'motion_selected' ? 'bg-purple-600' :
                            event.type === 'agenda_change' ? 'bg-blue-600' :
                            event.type === 'hand_raised' ? 'bg-yellow-600' :
                            event.type === 'point_of_order' ? 'bg-red-600' :
                            'bg-gray-400'
                          }`}></div>
                          {index < meetingHistory.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-200 my-1"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold text-gray-900">{event.user}</span>
                              <span className="text-xs text-gray-500">{event.timestamp}</span>
                            </div>
                            <p className="text-sm text-gray-700">{event.description}</p>
                            {event.type === 'motion_selected' && (
                              <span className="inline-block mt-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                                Motion Selected
                              </span>
                            )}
                            {event.type === 'agenda_change' && (
                              <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                Agenda Change
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'participants' && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-gray-900">Participants (0)</h3>
                </div>
                <div className="text-center text-gray-500 py-8">
                  No participants yet
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-gray-900">Meeting Notes</h3>
                </div>
                <textarea
                  className="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Type your notes here..."
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MeetingRoom;