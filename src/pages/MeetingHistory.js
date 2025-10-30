import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  MessageSquare,
  Download,
  Share2,
  User,
  Flag,
  TrendingUp,
  Eye
} from 'lucide-react';

function MeetingHistory() {
  const navigate = useNavigate();
  const location = useLocation();
  const { meetingId } = useParams();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, agenda, motions, discussion, participants

  const fromView = location.state?.from || 'past';

  // Mock data - replace with actual API call
  useEffect(() => {
    setTimeout(() => {
      setMeeting({
        id: meetingId,
        title: "Q4 Review",
        description: "Quarterly business review and planning session",
        date: "2025-10-28",
        startTime: "10:00 AM",
        endTime: "10:45 AM",
        duration: "45 min",
        status: "Completed",
        chairman: {
          name: "John Smith",
          role: "Chairman",
          avatar: "JS"
        },
        statistics: {
          totalParticipants: 12,
          totalMotions: 3,
          totalVotes: 28,
          agendaItemsCompleted: 5,
          totalAgendaItems: 5
        },
        participants: [
          { id: 1, name: "John Smith", role: "Chairman", joinedAt: "10:00 AM", leftAt: "10:45 AM", avatar: "JS", status: "Present" },
          { id: 2, name: "Mary Johnson", role: "Secretary", joinedAt: "10:00 AM", leftAt: "10:45 AM", avatar: "MJ", status: "Present" },
          { id: 3, name: "Robert Brown", role: "Treasurer", joinedAt: "10:02 AM", leftAt: "10:45 AM", avatar: "RB", status: "Present" },
          { id: 4, name: "Sarah Davis", role: "Board Member", joinedAt: "10:00 AM", leftAt: "10:30 AM", avatar: "SD", status: "Left Early" },
          { id: 5, name: "Michael Wilson", role: "Board Member", joinedAt: "10:05 AM", leftAt: "10:45 AM", avatar: "MW", status: "Joined Late" },
          { id: 6, name: "Emily Taylor", role: "Guest", joinedAt: "10:00 AM", leftAt: "10:45 AM", avatar: "ET", status: "Present" },
          { id: 7, name: "David Martinez", role: "Board Member", joinedAt: "10:00 AM", leftAt: "10:45 AM", avatar: "DM", status: "Present" },
          { id: 8, name: "Lisa Anderson", role: "Board Member", joinedAt: "10:00 AM", leftAt: "10:45 AM", avatar: "LA", status: "Present" },
          { id: 9, name: "James Thomas", role: "Board Member", joinedAt: "10:00 AM", leftAt: "10:45 AM", avatar: "JT", status: "Present" },
          { id: 10, name: "Jennifer White", role: "Board Member", joinedAt: "10:00 AM", leftAt: "10:45 AM", avatar: "JW", status: "Present" },
          { id: 11, name: "Christopher Lee", role: "Board Member", joinedAt: "10:00 AM", leftAt: "10:45 AM", avatar: "CL", status: "Present" },
          { id: 12, name: "Patricia Garcia", role: "Guest", joinedAt: "10:00 AM", leftAt: "10:45 AM", avatar: "PG", status: "Present" }
        ],
        agenda: [
          { 
            id: 1, 
            title: "Call to Order", 
            duration: "2 min", 
            status: "Completed",
            speaker: "John Smith",
            startTime: "10:00 AM",
            endTime: "10:02 AM"
          },
          { 
            id: 2, 
            title: "Reading of Minutes", 
            duration: "5 min", 
            status: "Completed",
            speaker: "Mary Johnson",
            startTime: "10:02 AM",
            endTime: "10:07 AM"
          },
          { 
            id: 3, 
            title: "Q4 Financial Report", 
            duration: "15 min", 
            status: "Completed",
            speaker: "Robert Brown",
            startTime: "10:07 AM",
            endTime: "10:22 AM"
          },
          { 
            id: 4, 
            title: "New Business Discussion", 
            duration: "18 min", 
            status: "Completed",
            speaker: "John Smith",
            startTime: "10:22 AM",
            endTime: "10:40 AM"
          },
          { 
            id: 5, 
            title: "Adjournment", 
            duration: "5 min", 
            status: "Completed",
            speaker: "John Smith",
            startTime: "10:40 AM",
            endTime: "10:45 AM"
          }
        ],
        motions: [
          { 
            id: 1, 
            title: "Approve Q4 Budget", 
            proposer: "Robert Brown",
            status: "Approved",
            votesYes: 10,
            votesNo: 1,
            votesAbstain: 1,
            time: "10:25 AM"
          },
          { 
            id: 2, 
            title: "Approve New Vendor Contract", 
            proposer: "Mary Johnson",
            status: "Approved",
            votesYes: 11,
            votesNo: 0,
            votesAbstain: 1,
            time: "10:32 AM"
          },
          { 
            id: 3, 
            title: "Table Discussion on Office Expansion", 
            proposer: "David Martinez",
            status: "Approved",
            votesYes: 9,
            votesNo: 2,
            votesAbstain: 1,
            time: "10:38 AM"
          }
        ],
        discussion: [
          { id: 1, user: "John Smith", time: "10:00 AM", message: "Good morning everyone. Let's begin." },
          { id: 2, user: "Mary Johnson", time: "10:02 AM", message: "I move to approve the minutes from last meeting." },
          { id: 3, user: "Robert Brown", time: "10:03 AM", message: "I second that motion." },
          { id: 4, user: "John Smith", time: "10:07 AM", message: "Robert, please present the Q4 financial report." },
          { id: 5, user: "Robert Brown", time: "10:08 AM", message: "Thank you. Our Q4 revenue exceeded projections by 12%..." },
          { id: 6, user: "Sarah Davis", time: "10:15 AM", message: "Can you provide more details on the expense increase?" },
          { id: 7, user: "Robert Brown", time: "10:16 AM", message: "Certainly. The main drivers were..." },
          { id: 8, user: "Michael Wilson", time: "10:20 AM", message: "Impressive results. Well done team." }
        ],
        attachments: [
          { name: "Q4_Financial_Report.pdf", size: "3.2 MB", type: "PDF", uploadedBy: "Robert Brown" },
          { name: "Meeting_Minutes.docx", size: "124 KB", type: "Word", uploadedBy: "Mary Johnson" },
          { name: "Budget_Presentation.pptx", size: "5.8 MB", type: "PowerPoint", uploadedBy: "Robert Brown" }
        ],
        meetingNotes: "The Q4 review meeting was highly productive. All agenda items were completed on schedule. Robert Brown presented an excellent financial report showing 12% growth over projections. Three motions were passed unanimously or with strong majority support. The team demonstrated excellent engagement and all major decisions were made collaboratively."
      });
      setLoading(false);
    }, 500);
  }, [meetingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading meeting history...</p>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Meeting not found</p>
          <button
            onClick={() => navigate('/dashboard', { state: { returnToView: fromView } })}
            className="mt-4 text-blue-600 hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const styles = {
      'Completed': 'bg-green-100 text-green-700 border-green-200',
      'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
      'Cancelled': 'bg-red-100 text-red-700 border-red-200'
    };
    return styles[status] || styles.Completed;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'agenda':
        return <AgendaTab agenda={meeting.agenda} />;
      case 'motions':
        return <MotionsTab motions={meeting.motions} navigate={navigate} />;
      case 'discussion':
        return <DiscussionTab discussion={meeting.discussion} />;
      case 'participants':
        return <ParticipantsTab participants={meeting.participants} />;
      default:
        return <OverviewTab meeting={meeting} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard', { state: { returnToView: fromView } })}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{meeting.title}</h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(meeting.status)}`}>
                    {meeting.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {meeting.date} • {meeting.startTime} - {meeting.endTime} • {meeting.duration}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 text-sm font-medium">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium">
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6 border-b border-gray-200">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'agenda', label: 'Agenda', icon: FileText },
              { id: 'motions', label: 'Motions', icon: Flag },
              { id: 'discussion', label: 'Discussion', icon: MessageSquare },
              { id: 'participants', label: 'Participants', icon: Users }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 font-medium border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {renderContent()}
      </div>
    </div>
  );
}

// Overview Tab
function OverviewTab({ meeting }) {
  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{meeting.statistics.totalParticipants}</div>
          <div className="text-sm text-gray-600">Participants</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Flag className="w-8 h-8 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{meeting.statistics.totalMotions}</div>
          <div className="text-sm text-gray-600">Motions</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{meeting.statistics.totalVotes}</div>
          <div className="text-sm text-gray-600">Total Votes</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{meeting.statistics.agendaItemsCompleted}/{meeting.statistics.totalAgendaItems}</div>
          <div className="text-sm text-gray-600">Agenda Items</div>
        </div>
      </div>

      {/* Meeting Details & Notes */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Meeting Summary</h2>
          <p className="text-gray-700 leading-relaxed mb-6">{meeting.meetingNotes}</p>
          
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Key Highlights</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">All {meeting.statistics.agendaItemsCompleted} agenda items completed successfully</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{meeting.statistics.totalMotions} motions proposed and voted on</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">100% attendance from board members</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Meeting completed on schedule ({meeting.duration})</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          {/* Chairman Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Presiding Officer</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {meeting.chairman.avatar}
              </div>
              <div>
                <p className="font-medium text-gray-900">{meeting.chairman.name}</p>
                <p className="text-sm text-gray-500">{meeting.chairman.role}</p>
              </div>
            </div>
          </div>

          {/* Attachments */}
          {meeting.attachments && meeting.attachments.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Attachments ({meeting.attachments.length})</h3>
              <div className="space-y-2">
                {meeting.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{file.size}</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Agenda Tab
function AgendaTab({ agenda }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Agenda Items</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {agenda.map((item, index) => (
          <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold">{index + 1}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">Speaker: {item.speaker}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    {item.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {item.startTime} - {item.endTime}
                  </span>
                  <span>•</span>
                  <span>Duration: {item.duration}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Motions Tab
function MotionsTab({ motions, navigate }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Motions</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Motion</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Proposer</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Time</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Votes</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {motions.map((motion) => (
              <tr key={motion.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{motion.title}</td>
                <td className="px-6 py-4 text-gray-600">{motion.proposer}</td>
                <td className="px-6 py-4 text-gray-600">{motion.time}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-600">✓ {motion.votesYes}</span>
                    <span className="text-red-600">✗ {motion.votesNo}</span>
                    <span className="text-gray-500">⊘ {motion.votesAbstain}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    motion.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {motion.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => navigate(`/motion/${motion.id}`)}
                    className="text-blue-600 hover:underline text-sm font-medium"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Discussion Tab
function DiscussionTab({ discussion }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Discussion History</h2>
      <div className="space-y-4">
        {discussion.map((msg) => (
          <div key={msg.id} className="flex gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
              {msg.user.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-900">{msg.user}</span>
                <span className="text-xs text-gray-500">{msg.time}</span>
              </div>
              <p className="text-sm text-gray-700">{msg.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Participants Tab
function ParticipantsTab({ participants }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Participants ({participants.length})</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Left</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {participants.map((participant) => (
              <tr key={participant.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                      {participant.avatar}
                    </div>
                    <span className="font-medium text-gray-900">{participant.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{participant.role}</td>
                <td className="px-6 py-4 text-gray-600">{participant.joinedAt}</td>
                <td className="px-6 py-4 text-gray-600">{participant.leftAt}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    participant.status === 'Present' 
                      ? 'bg-green-100 text-green-700' 
                      : participant.status === 'Left Early'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {participant.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MeetingHistory;