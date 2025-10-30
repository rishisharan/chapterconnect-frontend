import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft,
  Calendar,
  User,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  MinusCircle,
  Clock,
  MessageSquare,
  Download,
  Share2
} from 'lucide-react';

function MotionDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { motionId } = useParams();
  const [motion, setMotion] = useState(null);
  const [loading, setLoading] = useState(true);
  const fromView = location.state?.from || 'home';
  // Mock data - replace with actual API call
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setMotion({
        id: motionId,
        title: "Approve Budget Increase",
        fullText: "Motion to approve a 15% increase in the annual operating budget for fiscal year 2025-2026 to account for inflation and expanded operations.",
        proposer: {
          name: "John Smith",
          role: "Treasurer",
          avatar: "JS"
        },
        seconder: {
          name: "Mary Johnson",
          role: "Board Member",
          avatar: "MJ"
        },
        meeting: {
          id: "1",
          title: "Board Meeting",
          date: "2025-10-28",
          time: "10:00 AM"
        },
        status: "Approved",
        votingResults: {
          totalVoters: 11,
          yes: 8,
          no: 2,
          abstain: 1,
          percentageApproved: 73
        },
        voters: [
          { name: "John Smith", vote: "yes", timestamp: "10:15 AM" },
          { name: "Mary Johnson", vote: "yes", timestamp: "10:15 AM" },
          { name: "Robert Brown", vote: "yes", timestamp: "10:16 AM" },
          { name: "Sarah Davis", vote: "no", timestamp: "10:16 AM" },
          { name: "Michael Wilson", vote: "yes", timestamp: "10:16 AM" },
          { name: "Emily Taylor", vote: "abstain", timestamp: "10:17 AM" },
          { name: "David Martinez", vote: "yes", timestamp: "10:17 AM" },
          { name: "Lisa Anderson", vote: "no", timestamp: "10:17 AM" },
          { name: "James Thomas", vote: "yes", timestamp: "10:18 AM" },
          { name: "Jennifer White", vote: "yes", timestamp: "10:18 AM" },
          { name: "Christopher Lee", vote: "yes", timestamp: "10:18 AM" }
        ],
        timeline: [
          { time: "10:12 AM", event: "Motion proposed by John Smith" },
          { time: "10:13 AM", event: "Seconded by Mary Johnson" },
          { time: "10:14 AM", event: "Discussion opened" },
          { time: "10:15 AM", event: "Voting period opened" },
          { time: "10:18 AM", event: "Voting period closed" },
          { time: "10:19 AM", event: "Motion approved" }
        ],
        discussion: [
          { 
            user: "Sarah Davis", 
            timestamp: "10:14 AM", 
            comment: "I have concerns about the percentage increase. Could we consider a phased approach?" 
          },
          { 
            user: "John Smith", 
            timestamp: "10:14 AM", 
            comment: "The increase is necessary to maintain our current service levels given the economic conditions." 
          },
          { 
            user: "Michael Wilson", 
            timestamp: "10:14 AM", 
            comment: "I support this motion. Our reserves are healthy and this is a prudent adjustment." 
          }
        ],
        attachments: [
          { name: "Budget_Analysis_2025.pdf", size: "2.4 MB", type: "PDF" },
          { name: "Financial_Projections.xlsx", size: "856 KB", type: "Excel" }
        ],
        relatedMotions: [
          { id: 2, title: "Approve Q1 Budget Report", status: "Approved", date: "2025-07-15" }
        ],
        proposedDate: "2025-10-28",
        resolvedDate: "2025-10-28"
      });
      setLoading(false);
    }, 500);
  }, [motionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading motion details...</p>
        </div>
      </div>
    );
  }

  if (!motion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Motion not found</p>
          <button
            onClick={() => navigate('/dashboard')}
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
      'Approved': 'bg-green-100 text-green-700 border-green-200',
      'Rejected': 'bg-red-100 text-red-700 border-red-200',
      'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Withdrawn': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return styles[status] || styles.Pending;
  };

  const getVoteIcon = (vote) => {
    switch (vote) {
      case 'yes':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'no':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'abstain':
        return <MinusCircle className="w-5 h-5 text-gray-500" />;
      default:
        return null;
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
                  <h1 className="text-2xl font-bold text-gray-900">{motion.title}</h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(motion.status)}`}>
                    {motion.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Motion #{motion.id} • Proposed on {motion.proposedDate}
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
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Motion Text */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Motion Text
              </h2>
              <p className="text-gray-700 leading-relaxed">{motion.fullText}</p>
            </div>

            {/* Voting Results */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Voting Results</h2>
              
              {/* Vote Breakdown */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-3xl font-bold text-green-600">{motion.votingResults.yes}</div>
                  <div className="text-sm text-gray-600 mt-1">Yes</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-3xl font-bold text-red-600">{motion.votingResults.no}</div>
                  <div className="text-sm text-gray-600 mt-1">No</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-3xl font-bold text-gray-600">{motion.votingResults.abstain}</div>
                  <div className="text-sm text-gray-600 mt-1">Abstain</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Approval Rate</span>
                  <span className="font-semibold text-gray-900">{motion.votingResults.percentageApproved}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all"
                    style={{ width: `${motion.votingResults.percentageApproved}%` }}
                  ></div>
                </div>
              </div>

              {/* Individual Votes */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Vote Details ({motion.votingResults.totalVoters})</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {motion.voters.map((voter, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-semibold">
                          {voter.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{voter.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{voter.timestamp}</span>
                        {getVoteIcon(voter.vote)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Discussion */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Discussion ({motion.discussion.length})
              </h2>
              <div className="space-y-4">
                {motion.discussion.map((comment, index) => (
                  <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-gray-900">{comment.user}</span>
                      <span className="text-xs text-gray-500">{comment.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.comment}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Attachments */}
            {motion.attachments && motion.attachments.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Attachments ({motion.attachments.length})</h2>
                <div className="space-y-2">
                  {motion.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{file.type} • {file.size}</p>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-gray-200 rounded">
                        <Download className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Meeting Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Meeting Details</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{motion.meeting.title}</p>
                    <p className="text-xs text-gray-500">{motion.meeting.date} at {motion.meeting.time}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/meeting/${motion.meeting.id}`)}
                  className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  View Meeting
                </button>
              </div>
            </div>

            {/* Proposer & Seconder */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Motion Sponsors</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Proposed by</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {motion.proposer.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{motion.proposer.name}</p>
                      <p className="text-xs text-gray-500">{motion.proposer.role}</p>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Seconded by</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {motion.seconder.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{motion.seconder.name}</p>
                      <p className="text-xs text-gray-500">{motion.seconder.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Timeline
              </h3>
              <div className="space-y-3">
                {motion.timeline.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      {index < motion.timeline.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 my-1"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-xs text-gray-500">{item.time}</p>
                      <p className="text-sm text-gray-700">{item.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Motions */}
            {motion.relatedMotions && motion.relatedMotions.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Related Motions</h3>
                <div className="space-y-2">
                  {motion.relatedMotions.map((related) => (
                    <button
                      key={related.id}
                      onClick={() => navigate(`/motion/${related.id}`)}
                      className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-900">{related.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{related.status} • {related.date}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MotionDetails;