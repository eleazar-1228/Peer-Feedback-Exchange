import { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock, Search, ChevronUp, ChevronDown, X, TrendingUp, Users, Award } from 'lucide-react';
import { FeedbackDisplay } from './FeedbackDisplay';
import { getAllSubmissionsFiltered, getDistinctCourses, type SubmissionRow } from '../lib/submissionService';
import { getSubmittedReviewsForSubmission, type ReviewDisplayRow } from '../lib/reviewService';

type SubmissionStatus = 'Pending' | 'Reviewed';

interface Submission {
  id: string;
  projectTitle: string;
  teamName: string;
  courseSemester: string;
  status: SubmissionStatus;
  numReviews: number;
  overallScore: number | null;
}

interface Review {
  reviewerName: string;
  overallRating: number;
  clarity: number | null;
  organization: number | null;
  technicalSoundness: number | null;
  usability: number | null;
  strengths: string;
  improvements: string;
  oneChange: string;
  otherObservations: string;
}

export function ProfessorView() {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');
  const [sortField, setSortField] = useState<keyof Submission | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  
  // Real data from Supabase
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [dbCourses, setDbCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<ReviewDisplayRow[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Load submissions from database
  useEffect(() => {
    async function loadSubmissions() {
      setLoading(true);
      try {
        const data = await getAllSubmissionsFiltered({
          course: filterCourse || undefined,
          teamName: filterTeam || undefined,
          status: (filterStatus as "Pending" | "Reviewed") || undefined,
          limit: 200,
          offset: 0,
        });

        setSubmissions(
          data.map((s) => ({
            id: s.id,
            projectTitle: s.project_title,
            teamName: s.project_team,
            courseSemester: s.course,
            status: s.status === "pending" ? "Pending" : "Reviewed",
            numReviews: 0, // TODO: Calculate from reviews
            overallScore: null, // TODO: Calculate from reviews
          }))
        );
      } catch (e) {
        console.error("Failed to load submissions:", e);
      } finally {
        setLoading(false);
      }
    }

    loadSubmissions();
  }, [filterCourse, filterTeam, filterStatus]);

  // Load courses
  useEffect(() => {
    async function loadCourses() {
      try {
        const courses = await getDistinctCourses();
        setDbCourses(courses);
      } catch (e) {
        console.error("Failed to load course list:", e);
      }
    }
    loadCourses();
  }, []);

  // Load reviews when submission is selected
  useEffect(() => {
    async function loadReviews() {
      if (!selectedSubmission) return;

      setReviewsLoading(true);
      try {
        const r = await getSubmittedReviewsForSubmission(selectedSubmission.id);
        setReviews(r);
      } catch (e) {
        console.error("Failed to load reviews:", e);
      } finally {
        setReviewsLoading(false);
      }
    }

    loadReviews();
  }, [selectedSubmission]);

  // REMOVED: Mock data - now using real database data
  /* const submissions_MOCK: Submission[] = [
    { id: '1', projectTitle: 'BU Peer Review Platform', teamName: 'Team Four', courseSemester: 'MET CS633 – Spring 1, 2026', status: 'Reviewed', numReviews: 3, overallScore: 4.2 },
    { id: '2', projectTitle: 'Mobile Banking App', teamName: 'Team Two', courseSemester: 'MET CS601 – Spring 1, 2026', status: 'Pending', numReviews: 1, overallScore: null },
    { id: '3', projectTitle: 'E-commerce Dashboard', teamName: 'Team Five', courseSemester: 'MET CS633 – Spring 1, 2026', status: 'Reviewed', numReviews: 3, overallScore: 3.8 },
    { id: '4', projectTitle: 'Healthcare Portal', teamName: 'Team One', courseSemester: 'MET CS601 – Spring 1, 2026', status: 'Reviewed', numReviews: 3, overallScore: 4.5 },
    { id: '5', projectTitle: 'Social Media Analytics', teamName: 'Team Three', courseSemester: 'MET CS633 – Spring 1, 2026', status: 'Pending', numReviews: 2, overallScore: null },
    { id: '6', projectTitle: 'Learning Management System', teamName: 'Team Six', courseSemester: 'MET CS601 – Spring 1, 2026', status: 'Reviewed', numReviews: 3, overallScore: 4.0 },
  ]; */

  // REMOVED: Mock reviews - now using real database data
  /* const mockReviews: Review[] = [
    {
      reviewerName: 'Alex Smith',
      overallRating: 4,
      clarity: 4,
      organization: 5,
      technicalSoundness: 4,
      usability: 3,
      strengths: 'The interface is clean and intuitive. Good use of visual hierarchy.',
      improvements: 'Some technical sections could be more detailed.',
      oneChange: 'Add more comprehensive error handling.',
      otherObservations: 'Overall solid work with room for refinement.'
    },
    {
      reviewerName: 'Jordan Lee',
      overallRating: 5,
      clarity: 5,
      organization: 4,
      technicalSoundness: 5,
      usability: 4,
      strengths: 'Excellent technical implementation and thorough documentation.',
      improvements: 'Could improve mobile responsiveness.',
      oneChange: 'Optimize performance for slower connections.',
      otherObservations: 'Very well executed project.'
    },
    {
      reviewerName: 'Sam Taylor',
      overallRating: 4,
      clarity: 3,
      organization: 4,
      technicalSoundness: 4,
      usability: 5,
      strengths: 'User experience is exceptional.',
      improvements: 'Documentation could be more comprehensive.',
      oneChange: 'Improve code comments for maintainability.',
      otherObservations: 'Strong project with minor areas for improvement.'
    }
  ]; */

  // Calculate stats from REAL data
  const totalSubmissions = submissions.length;
  const reviewsPending = submissions.reduce((acc, sub) => acc + Math.max(0, 3 - sub.numReviews), 0);
  const completedReviews = submissions.reduce((acc, sub) => acc + sub.numReviews, 0);

  // Get unique courses and teams for filter from REAL data
  const uniqueCourses = dbCourses;
  const uniqueTeams = Array.from(new Set(submissions.map(s => s.teamName))).sort();

  // Calculate analytics data
  // Top 5 Projects with Highest Number of Reviews
  const topProjectsByReviews = [...submissions]
    .sort((a, b) => b.numReviews - a.numReviews)
    .slice(0, 5);

  // Top 5 Courses/Semesters by Total Reviews
  const courseReviewCounts = submissions.reduce((acc, sub) => {
    acc[sub.courseSemester] = (acc[sub.courseSemester] || 0) + sub.numReviews;
    return acc;
  }, {} as Record<string, number>);

  const topCoursesByReviews = Object.entries(courseReviewCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Top 3 Students Who Provided Most Feedback (mock data)
  const studentFeedbackCounts = [
    { name: 'Sarah Chen', count: 12 },
    { name: 'Michael Rodriguez', count: 10 },
    { name: 'Alex Kim', count: 9 },
    { name: 'Jordan Lee', count: 8 },
    { name: 'Taylor Brown', count: 7 },
  ].slice(0, 3);

  // Filter and sort submissions
  const filteredSubmissions = submissions.filter(sub => {
    const matchesCourse = !filterCourse || sub.courseSemester === filterCourse;
    const matchesStatus = !filterStatus || sub.status === filterStatus;
    const matchesTeam = !filterTeam || sub.teamName.toLowerCase().includes(filterTeam.toLowerCase());
    return matchesCourse && matchesStatus && matchesTeam;
  });

  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    if (!sortField) return 0;
    
    let aVal = a[sortField];
    let bVal = b[sortField];
    
    // Handle null values for overallScore
    if (sortField === 'overallScore') {
      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return sortDirection === 'asc' ? 1 : -1;
      if (bVal === null) return sortDirection === 'asc' ? -1 : 1;
    }
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    return 0;
  });

  const handleSort = (field: keyof Submission) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: keyof Submission }) => {
    if (sortField !== field) return <ChevronUp className="w-4 h-4 text-gray-300" />;
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-blue-600" />
      : <ChevronDown className="w-4 h-4 text-blue-600" />;
  };

  const handleRowClick = (submission: Submission) => {
    setSelectedSubmission(submission);
  };

  const closeFeedbackDetails = () => {
    setSelectedSubmission(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-900 mb-2">Professor Dashboard</h2>
        <p className="text-gray-600">Monitor peer review progress and view submission feedback</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-1 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-4 px-1 border-b-2 transition-colors ${
              activeTab === 'analytics'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-600">Loading submissions...</p>
          </div>
        ) : (
        <div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Total Submissions</span>
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-semibold text-gray-900">{totalSubmissions}</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Reviews Pending</span>
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-2xl font-semibold text-gray-900">{reviewsPending}</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Completed Reviews</span>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-semibold text-gray-900">{completedReviews}</p>
            </div>
          </div>

          {/* Submissions List - scrollable container */}
          <div className="bg-white rounded-lg border border-gray-200 max-h-[600px] overflow-y-auto flex flex-col">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Submissions</h3>
              
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filter by submitter (team)..."
                    value={filterTeam}
                    onChange={(e) => setFilterTeam(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <select
                  value={filterCourse}
                  onChange={(e) => setFilterCourse(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All courses</option>
                  {uniqueCourses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Reviewed">Reviewed</option>
                </select>

                <button
                  onClick={() => {
                    setFilterCourse('');
                    setFilterStatus('');
                    setFilterTeam('');
                    setSortField(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto min-h-0">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th 
                      onClick={() => handleSort('projectTitle')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        Project Title
                        <SortIcon field="projectTitle" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('teamName')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        Submitted by (Team)
                        <SortIcon field="teamName" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('courseSemester')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        Course / Semester
                        <SortIcon field="courseSemester" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('status')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        Submission Status
                        <SortIcon field="status" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('numReviews')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        Number of Reviews
                        <SortIcon field="numReviews" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('overallScore')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        Overall Score
                        <SortIcon field="overallScore" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedSubmissions.map((submission) => (
                    <tr 
                      key={submission.id} 
                      onClick={() => handleRowClick(submission)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{submission.projectTitle}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {submission.teamName}
                      </td>
                      <td className="px-6 py-4 text-gray-900 text-sm">
                        {submission.courseSemester}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          submission.status === 'Reviewed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {submission.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {submission.numReviews}
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        {submission.overallScore !== null 
                          ? submission.overallScore.toFixed(1)
                          : '—'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {sortedSubmissions.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No submissions found matching the current filters.
              </div>
            )}
          </div>
        </div>
        )
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div>
          {/* Key Insights Section */}
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Key Insights</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top Projects by Reviews */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-700" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Top 5 Projects by Reviews</h4>
                </div>
                <div className="space-y-3">
                  {topProjectsByReviews.map((project, idx) => (
                    <div key={project.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                          {idx + 1}
                        </span>
                        <p className="text-sm text-gray-900 font-medium truncate">{project.projectTitle}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{project.numReviews}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Courses by Total Reviews */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileText className="w-5 h-5 text-green-700" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Top 5 Courses by Reviews</h4>
                </div>
                <div className="space-y-3">
                  {topCoursesByReviews.map(([course, count], idx) => (
                    <div key={course} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                          {idx + 1}
                        </span>
                        <p className="text-sm text-gray-900 font-medium truncate">{course}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Students by Feedback Provided */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Award className="w-5 h-5 text-purple-700" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Top 3 Reviewers</h4>
                </div>
                <div className="space-y-3">
                  {studentFeedbackCounts.map((student, idx) => (
                    <div key={student.name} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                          {idx + 1}
                        </span>
                        <p className="text-sm text-gray-900 font-medium">{student.name}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{student.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Details Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {selectedSubmission.projectTitle}
                </h3>
                <p className="text-sm text-gray-600">
                  Submitted by: {selectedSubmission.teamName} • {selectedSubmission.courseSemester}
                </p>
              </div>
              <button
                onClick={closeFeedbackDetails}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Submission Status</p>
                    <p className="font-semibold text-gray-900">{selectedSubmission.status}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Number of Reviews</p>
                    <p className="font-semibold text-gray-900">{selectedSubmission.numReviews}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Overall Score</p>
                    <p className="font-semibold text-gray-900">
                      {selectedSubmission.overallScore !== null 
                        ? selectedSubmission.overallScore.toFixed(1)
                        : '—'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Reviews List - scrollable like Feedback Received box */}
              <div>
                <h4 className="font-semibold text-gray-900 text-lg mb-1">Peer Reviews</h4>
                <p className="text-sm text-gray-600 mb-4">Feedback is attributed; reviewer names are shown below.</p>
                
                {reviewsLoading ? (
                  <div className="text-sm text-gray-600 p-4">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                  <div className="text-sm text-gray-600 p-4 border border-gray-200 rounded-lg">
                    No reviews submitted yet for this submission.
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg max-h-[600px] overflow-y-auto divide-y divide-gray-200">
                    {reviews.map((review, idx) => (
                      <div key={review.id ?? idx} className="p-4 first:rounded-t-lg last:rounded-b-lg">
                        <FeedbackDisplay 
                          review={{
                            reviewerName: review.reviewerName,
                            overallRating: review.overallRating,
                            clarity: review.clarity,
                            organization: review.organization,
                            technicalSoundness: review.technicalSoundness,
                            usability: review.usability,
                            strengths: review.strengths ?? "",
                            improvements: review.improvements ?? "",
                            oneChange: review.oneChange ?? "",
                            otherObservations: review.otherObservations ?? "",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={closeFeedbackDetails}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}