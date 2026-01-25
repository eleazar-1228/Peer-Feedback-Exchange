import { FileText, ClipboardCheck, Clock, CheckCircle, Search, Filter, Eye, Star } from 'lucide-react';

interface DashboardProps {
  onNavigateToSubmission: () => void;
  onNavigateToReview: () => void;
}

export function Dashboard({ onNavigateToSubmission, onNavigateToReview }: DashboardProps) {
  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-900 mb-2">Student Dashboard</h2>
        <p className="text-gray-600">Manage your submissions and reviews</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Submissions</span>
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">3</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Reviews Completed</span>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">8</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Pending Reviews</span>
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">2</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Available to Review</span>
            <ClipboardCheck className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">15</p>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Submit Work */}
        <div className="bg-white p-8 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer" onClick={onNavigateToSubmission}>
          <FileText className="w-12 h-12 text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Submit Work</h3>
          <p className="text-gray-600 mb-4">Upload your assignment or project for peer review</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            New Submission
          </button>
        </div>

        {/* Review Assignments */}
        <div className="bg-white p-8 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors cursor-pointer" onClick={onNavigateToReview}>
          <ClipboardCheck className="w-12 h-12 text-purple-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Review Assignments</h3>
          <p className="text-gray-600 mb-4">Provide feedback on peer submissions</p>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Start Reviewing
          </button>
        </div>
      </div>

      {/* My Submissions List */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">My Submissions</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {[
            { title: 'Research Paper: AI Ethics', status: 'Under Review', reviews: '2/3', date: 'Jan 20, 2026' },
            { title: 'Code Project: React Dashboard', status: 'Completed', reviews: '3/3', date: 'Jan 15, 2026' },
            { title: 'Design Mockup: Mobile App', status: 'Draft', reviews: '0/3', date: 'Jan 22, 2026' },
          ].map((submission, idx) => (
            <div key={idx} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{submission.title}</h4>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>Status: {submission.status}</span>
                    <span>Reviews: {submission.reviews}</span>
                    <span>Submitted: {submission.date}</span>
                  </div>
                </div>
                <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assigned Reviews List */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Assigned Reviews</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {[
            { title: 'Peer Submission #A547', type: 'Academic Paper', due: 'Jan 26, 2026', status: 'Pending' },
            { title: 'Peer Submission #B892', type: 'Code Review', due: 'Jan 25, 2026', status: 'Pending' },
            { title: 'Peer Submission #C123', type: 'Design Work', due: 'Jan 28, 2026', status: 'Completed' },
          ].map((review, idx) => (
            <div key={idx} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>Type: {review.type}</span>
                    <span>Due: {review.due}</span>
                    <span className={review.status === 'Pending' ? 'text-orange-600' : 'text-green-600'}>
                      {review.status}
                    </span>
                  </div>
                </div>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  {review.status === 'Pending' ? 'Start Review' : 'View Review'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* My Completed Reviews */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">My Completed Reviews</h3>
            <p className="text-sm text-gray-600 mt-1">Reviews you have submitted</p>
          </div>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All
          </button>
        </div>
        <div className="divide-y divide-gray-200">
          {[
            { title: 'Peer Submission #D789', type: 'Academic Paper', reviewed: 'Jan 22, 2026', rating: 4 },
            { title: 'Peer Submission #E234', type: 'Code Project', reviewed: 'Jan 18, 2026', rating: 5 },
            { title: 'Peer Submission #F567', type: 'Design Work', reviewed: 'Jan 15, 2026', rating: 4 },
          ].map((review, idx) => (
            <div key={idx} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
                  <div className="flex gap-4 text-sm text-gray-600 items-center">
                    <span>Type: {review.type}</span>
                    <span>Reviewed: {review.reviewed}</span>
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
                <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  View Review
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Browse Previous Projects */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Browse Previous Projects</h3>
              <p className="text-sm text-gray-600 mt-1">Explore and review past submissions from your courses</p>
            </div>
          </div>
          
          {/* Search and Filter */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search previous projects..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Machine Learning Implementation', type: 'Code Project', course: 'CS 301', date: 'Dec 15, 2025', reviews: 5 },
              { title: 'Climate Change Research', type: 'Academic Paper', course: 'ENV 201', date: 'Dec 10, 2025', reviews: 4 },
              { title: 'Mobile Banking App Design', type: 'Design Work', course: 'DES 301', date: 'Nov 28, 2025', reviews: 6 },
              { title: 'Database Optimization Study', type: 'Academic Paper', course: 'CS 301', date: 'Nov 20, 2025', reviews: 3 },
              { title: 'E-commerce Platform', type: 'Code Project', course: 'CS 201', date: 'Nov 15, 2025', reviews: 5 },
              { title: 'Brand Identity Design', type: 'Design Work', course: 'DES 301', date: 'Nov 5, 2025', reviews: 4 },
            ].map((project, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1 text-sm">{project.title}</h4>
                    <p className="text-xs text-gray-600">{project.course}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    {project.type}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                  <span>{project.date}</span>
                  <span>{project.reviews} reviews</span>
                </div>
                <button className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" />
                  Review Project
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Load More Projects
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}