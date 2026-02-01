import { FileText, ClipboardCheck, CheckCircle, Eye, Star } from 'lucide-react';

/**
 * Props for the Dashboard component
 */
interface DashboardProps {
  /** Callback to navigate to submission flow */
  onNavigateToSubmission: () => void;
  /** Callback to navigate to review flow */
  onNavigateToReview: () => void;
  /** Callback to navigate to edit a specific completed review */
  onNavigateToEditReview: (review: { title: string; type: string }) => void;
  /** Callback to navigate to feedback view for a specific submission */
  onNavigateToFeedback: (submissionTitle: string) => void;
}

/**
 * Dashboard Component
 * 
 * Main student dashboard displaying:
 * - Statistics (submissions, completed reviews, available reviews)
 * - Quick action cards (Submit Work, Give Feedback)
 * - List of user's submissions with feedback links
 * - List of completed reviews
 * 
 * All interactive elements are functional and navigate to appropriate views
 */
export function Dashboard({ onNavigateToSubmission, onNavigateToReview, onNavigateToEditReview, onNavigateToFeedback }: DashboardProps) {
  // Mock data for submissions - in production, this would come from API/state management
  const submissions = [
    { title: 'Research Paper: AI Ethics', date: 'Jan 20, 2026', module: '1' },
    { title: 'Code Project: React Dashboard', date: 'Jan 15, 2026', module: '3' },
    { title: 'Design Mockup: Mobile App', date: 'Jan 22, 2026', module: '5' },
  ];

  // Mock data for completed reviews - in production, this would come from API/state management
  const completedReviews = [
    { title: 'Peer Submission #D789', type: 'Academic Paper', reviewed: 'Jan 22, 2026', rating: 4 },
    { title: 'Peer Submission #E234', type: 'Code Project', reviewed: 'Jan 18, 2026', rating: 5 },
    { title: 'Peer Submission #F567', type: 'Design Work', reviewed: 'Jan 15, 2026', rating: 4 },
  ];

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-900 mb-2">Student Dashboard</h2>
        <p className="text-gray-600">Manage your submissions and reviews</p>
      </div>

      {/* Statistics Cards - Display key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Total Submissions Card */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Submissions</span>
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">{submissions.length}</p>
        </div>

        {/* Completed Reviews Card */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Reviews Completed</span>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">{completedReviews.length}</p>
        </div>

        {/* Available Reviews Card */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Available to Review</span>
            <ClipboardCheck className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">15</p>
        </div>
      </div>

      {/* Quick Action Cards - Primary actions for students */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Submit Work Action Card */}
        <div 
          className="bg-white p-8 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer" 
          onClick={onNavigateToSubmission}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigateToSubmission();
            }
          }}
        >
          <FileText className="w-12 h-12 text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Submit Work</h3>
          <p className="text-gray-600 mb-4">Upload your assignment or project for peer review</p>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={(e) => {
              e.stopPropagation();
              onNavigateToSubmission();
            }}
          >
            New Submission
          </button>
        </div>

        {/* Give Feedback Action Card */}
        <div 
          className="bg-white p-8 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors cursor-pointer" 
          onClick={onNavigateToReview}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigateToReview();
            }
          }}
        >
          <ClipboardCheck className="w-12 h-12 text-purple-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Give Feedback</h3>
          <p className="text-gray-600 mb-4">Provide reviews on peer submissions</p>
          <button 
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            onClick={(e) => {
              e.stopPropagation();
              onNavigateToReview();
            }}
          >
            Start Reviewing
          </button>
        </div>
      </div>

      {/* My Submissions List - Shows all user's submitted work */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">My Submissions</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {submissions.map((submission, idx) => (
            <div key={idx} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{submission.title}</h4>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>Module: {submission.module}</span>
                    <span>Submitted: {submission.date}</span>
                  </div>
                </div>
                {/* View Feedback Button - Navigates to feedback view */}
                <button 
                  onClick={() => onNavigateToFeedback(submission.title)}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  View Feedback
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* My Completed Reviews - Shows reviews the user has submitted */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">My Completed Reviews</h3>
            <p className="text-sm text-gray-600 mt-1">Reviews you have submitted</p>
          </div>
          {/* View All Button - In production, would show all reviews in a separate view */}
          <button 
            onClick={() => {
              // In production, would navigate to full reviews list
              alert('View all reviews feature - would show complete list');
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </button>
        </div>
        <div className="divide-y divide-gray-200">
          {completedReviews.map((review, idx) => (
            <div key={idx} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
                  <div className="flex gap-4 text-sm text-gray-600 items-center">
                    <span>Type: {review.type}</span>
                    <span>Reviewed: {review.reviewed}</span>
                    {/* Star Rating Display */}
                    <div className="flex items-center gap-1">
                      <span>Your Rating:</span>
                      <div className="flex">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Edit Review Button - Navigates to /feedback with the selected review */}
                <button 
                  onClick={() => onNavigateToEditReview({ title: review.title, type: review.type })}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Edit Review
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}