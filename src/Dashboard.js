import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  Plus,
  ChevronRight,
  FileText
} from "lucide-react";
import CreateMotionModal from "./components/CreateMotionModal"; // Import the modal

function Dashboard({ user, socket }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeView, setActiveView] = useState('home');
  const [isCreateMotionModalOpen, setIsCreateMotionModalOpen] = useState(false);
  
  const [meetings, setMeetings] = useState({
    active: [],
    scheduled: [],
    past: [],
    motions: []
  });

  // Restore view from navigation state
  useEffect(() => {
    if (location.state?.returnToView) {
      setActiveView(location.state.returnToView);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Mock data - replace with actual API calls
  useEffect(() => {
    setMeetings({
      active: [
        { id: 1, title: "Board Meeting", participants: 5, startTime: "10:00 AM", status: "In Progress" },
        { id: 2, title: "Team Standup", participants: 8, startTime: "11:30 AM", status: "In Progress" }
      ],
      scheduled: [
        { id: 3, title: "Client Review", participants: 3, scheduledFor: "2025-10-31 2:00 PM" },
        { id: 4, title: "Project Planning", participants: 6, scheduledFor: "2025-11-01 9:00 AM" }
      ],
      past: [
        { id: 5, title: "Q4 Review", participants: 12, completedAt: "2025-10-28", duration: "45 min" },
        { id: 6, title: "Design Discussion", participants: 4, completedAt: "2025-10-27", duration: "30 min" }
      ],
      motions: [
        { id: 1, title: "Approve Budget Increase", proposer: "John Smith", meetingTitle: "Board Meeting", status: "Approved", votesYes: 8, votesNo: 2, votesAbstain: 1, proposedDate: "2025-10-28" },
        { id: 2, title: "Table Discussion on New Office", proposer: "Sarah Johnson", meetingTitle: "Board Meeting", status: "Pending", votesYes: 0, votesNo: 0, votesAbstain: 0, proposedDate: "2025-10-30" },
        { id: 3, title: "Amend Bylaw Section 5", proposer: "Mike Chen", meetingTitle: "Q4 Review", status: "Rejected", votesYes: 3, votesNo: 9, votesAbstain: 2, proposedDate: "2025-10-28" },
        { id: 4, title: "Approve New Hiring Policy", proposer: "Emily Davis", meetingTitle: "Team Standup", status: "Approved", votesYes: 7, votesNo: 1, votesAbstain: 0, proposedDate: "2025-10-30" }
      ]
    });
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8080/api/auth/google/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("jwt");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  const handleMotionCreated = (newMotion) => {
    // Add the new motion to the list
    setMeetings(prev => ({
      ...prev,
      motions: [
        {
          id: newMotion.id,
          title: newMotion.title,
          proposer: newMotion.proposerName,
          meetingTitle: newMotion.meetingTitle,
          status: newMotion.status,
          votesYes: newMotion.votesYes,
          votesNo: newMotion.votesNo,
          votesAbstain: newMotion.votesAbstain,
          proposedDate: new Date(newMotion.proposedAt).toISOString().split('T')[0]
        },
        ...prev.motions
      ]
    }));

    // Switch to motions view to show the new motion
    setActiveView('motions');
  };

  const menuItems = [
    { id: 'active', label: 'Active Meetings', icon: Users, count: meetings.active.length },
    { id: 'scheduled', label: 'Scheduled', icon: Calendar, count: meetings.scheduled.length },
    { id: 'past', label: 'Past Meetings', icon: CheckCircle, count: meetings.past.length },
    { id: 'motions', label: 'Motions', icon: FileText, count: meetings.motions.length }
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'active':
        return <ActiveMeetingsTable meetings={meetings.active} navigate={navigate} />;
      case 'scheduled':
        return <ScheduledMeetingsTable meetings={meetings.scheduled} navigate={navigate} />;
      case 'past':
        return <PastMeetingsTable meetings={meetings.past} navigate={navigate} />;
      case 'motions':
        return <MotionsTable motions={meetings.motions} navigate={navigate} onCreateMotion={() => setIsCreateMotionModalOpen(true)} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-12 h-12 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}!</h2>
              <p className="text-gray-600 mb-8">Ready to start your next meeting?</p>
            </div>
            <button
              onClick={() => navigate('/create-meeting')}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg flex items-center gap-3 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-6 h-6" />
              Create New Meeting
            </button>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 w-full max-w-2xl">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">{meetings.active.length}</div>
                <div className="text-sm text-gray-600">Active Now</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">{meetings.scheduled.length}</div>
                <div className="text-sm text-gray-600">Scheduled</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 text-center">
                <div className="text-3xl font-bold text-gray-600 mb-1">{meetings.past.length}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="w-full bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ChapterConnect</h1>
              <p className="text-sm text-gray-500">Leader Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">Chairman</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto h-full">
            {renderContent()}
          </div>
        </div>

        {/* Right Menu */}
        <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Navigation
            </h3>
            
            {/* Home Button */}
            <button
              onClick={() => setActiveView('home')}
              className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors flex items-center justify-between ${
                activeView === 'home'
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Plus className="w-5 h-5" />
                <span>Create Meeting</span>
              </div>
              {activeView === 'home' && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Meetings
            </h3>
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
                      activeView === item.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.count > 0 && (
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          activeView === item.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {item.count}
                        </span>
                      )}
                      {activeView === item.id && <ChevronRight className="w-4 h-4" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Quick Actions
            </h3>
            <button
              onClick={() => navigate('/create-meeting')}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 mb-2"
            >
              <Plus className="w-5 h-5" />
              New Meeting
            </button>
            <button
              onClick={() => setIsCreateMotionModalOpen(true)}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" />
              New Motion
            </button>
          </div>
        </div>
      </div>

      {/* Create Motion Modal */}
      <CreateMotionModal
        isOpen={isCreateMotionModalOpen}
        onClose={() => setIsCreateMotionModalOpen(false)}
        onSuccess={handleMotionCreated}
      />
    </div>
  );
}

// Active Meetings Table Component
function ActiveMeetingsTable({ meetings, navigate }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          Active Meetings
        </h2>
        <p className="text-sm text-gray-600 mt-1">Currently in progress</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Meeting Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Participants
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Start Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {meetings.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  No active meetings at the moment
                </td>
              </tr>
            ) : (
              meetings.map((meeting) => (
                <tr key={meeting.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{meeting.title}</td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {meeting.participants}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{meeting.startTime}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      {meeting.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(`/meeting/${meeting.id}`)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Join
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Scheduled Meetings Table Component
function ScheduledMeetingsTable({ meetings, navigate }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          Scheduled Meetings
        </h2>
        <p className="text-sm text-gray-600 mt-1">Upcoming meetings</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Meeting Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Participants
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Scheduled For
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {meetings.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                  No scheduled meetings
                </td>
              </tr>
            ) : (
              meetings.map((meeting) => (
                <tr key={meeting.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{meeting.title}</td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {meeting.participants}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {meeting.scheduledFor}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(`/meeting/${meeting.id}`)}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Past Meetings Table Component
function PastMeetingsTable({ meetings, navigate }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-blue-600" />
          Past Meetings
        </h2>
        <p className="text-sm text-gray-600 mt-1">Completed meetings</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Meeting Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Participants
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Completed On
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {meetings.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  No past meetings
                </td>
              </tr>
            ) : (
              meetings.map((meeting) => (
                <tr key={meeting.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{meeting.title}</td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {meeting.participants}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{meeting.completedAt}</td>
                  <td className="px-6 py-4 text-gray-600">{meeting.duration}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(`/meeting/${meeting.id}/history`, { state: { from: 'past' } })}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      View History
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Motions Table Component
function MotionsTable({ motions, navigate, onCreateMotion }) {
  const getStatusBadge = (status) => {
    const statusStyles = {
      'Approved': 'bg-green-100 text-green-700',
      'Rejected': 'bg-red-100 text-red-700',
      'Pending': 'bg-yellow-100 text-yellow-700',
      'Withdrawn': 'bg-gray-100 text-gray-700'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-700'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Motions
          </h2>
          <p className="text-sm text-gray-600 mt-1">Track all motions across meetings</p>
        </div>
        <button
          onClick={onCreateMotion}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Motion
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Motion
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Proposer
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Meeting
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Votes
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {motions.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                  No motions recorded
                </td>
              </tr>
            ) : (
              motions.map((motion) => (
                <tr key={motion.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{motion.title}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{motion.proposer}</td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {motion.meetingTitle}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-green-600 font-medium">✓ {motion.votesYes}</span>
                      <span className="text-red-600 font-medium">✗ {motion.votesNo}</span>
                      <span className="text-gray-500">⊘ {motion.votesAbstain}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(motion.status)}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{motion.proposedDate}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(`/motion/${motion.id}`, { state: { from: 'motions' } })}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;