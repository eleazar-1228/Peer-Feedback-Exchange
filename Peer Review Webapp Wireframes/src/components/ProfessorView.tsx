import { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock, Search, ChevronUp, ChevronDown, X, TrendingUp, Award } from 'lucide-react';
import { FeedbackDisplay } from './FeedbackDisplay';
import { getMyProfile } from '../lib/profileService';
import { getAllSubmissionsFiltered, type SubmissionRow } from '../lib/submissionService';
import { getSubmittedReviewsForSubmission, type ReviewDisplayRow } from '../lib/reviewService';
import {
  getTopProjectsByReviews,
  getTopCoursesByReviews,
  getTopReviewers,
  getSubmissionReviewStats,
} from '../lib/analyticsService';

type SubmissionStatus = 'Pending' | 'Reviewed';

interface Submission {
  id: string;
  projectTitle: string;
  teamName: string;
  courseSemester: string;
  status: SubmissionStatus;
  numReviews: number;
  overallScore: number | null;
  authorName: string;
  submittedDate: string;
  submittedWorkUrl?: string;
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
  const [filterClass, setFilterClass] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  
  // Dynamic year options (only current year)
  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear];
  
  // Real data from Supabase
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<ReviewDisplayRow[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Analytics (Key Insights) - real data from DB
  const [topProjectsByReviews, setTopProjectsByReviews] = useState<{ id: string; projectTitle: string; course: string; teamName: string; reviewCount: number }[]>([]);
  const [topCoursesByReviews, setTopCoursesByReviews] = useState<{ course: string; reviewCount: number }[]>([]);
  const [topReviewers, setTopReviewers] = useState<{ reviewerId: string; reviewerName: string; reviewCount: number }[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Professor profile for welcome message
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);

  // Load professor profile for welcome message
  useEffect(() => {
    async function loadProfile() {
      try {
        const p = await getMyProfile();
        setProfile(p);
      } catch (e) {
        console.error("Failed to load professor profile:", e);
      }
    }
    loadProfile();
  }, []);

  // Load submissions from database with review stats (numReviews, overallScore)
  useEffect(() => {
    async function loadSubmissions() {
      setLoading(true);
      try {
        const [data, stats] = await Promise.all([
          getAllSubmissionsFiltered({
            teamName: filterTeam || undefined,
            limit: 200,
            offset: 0,
          }),
          getSubmissionReviewStats(),
        ]);

        console.log("Professor view - loaded submissions:", data);

        setSubmissions(
          data.map((s) => {
            const st = stats.get(s.id);
            
            // Get author name from profile
            const author = s.author;
            let authorName = "Unknown";
            if (author) {
              const fullName = `${author.first_name ?? ""} ${author.last_name ?? ""}`.trim();
              authorName = fullName || author.student_id || "Unknown";
            }
            
            // Format submission date
            const submittedDate = s.created_at
              ? new Date(s.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Unknown";
            
            return {
              id: s.id,
              projectTitle: s.project_title,
              teamName: s.project_team,
              courseSemester: s.course,
              status: st && st.reviewCount > 0 ? "Reviewed" : "Pending",
              numReviews: st?.reviewCount ?? 0,
              overallScore: st?.avgScore ?? null,
              authorName,
              submittedDate,
              submittedWorkUrl: s.project_document_url || ""
            };
          })
        );
      } catch (e) {
        console.error("Failed to load submissions:", e);
      } finally {
        setLoading(false);
      }
    }

    loadSubmissions();
  }, [filterTeam]);

  // Load analytics when Analytics tab is active
  useEffect(() => {
    if (activeTab !== "analytics") return;

    async function loadAnalytics() {
      setAnalyticsLoading(true);
      try {
        const [projects, courses, reviewers] = await Promise.all([
          getTopProjectsByReviews(5),
          getTopCoursesByReviews(5),
          getTopReviewers(3),
        ]);
        setTopProjectsByReviews(projects);
        setTopCoursesByReviews(courses);
        setTopReviewers(reviewers);
      } catch (e) {
        console.error("Failed to load analytics:", e);
      } finally {
        setAnalyticsLoading(false);
      }
    }

    loadAnalytics();
  }, [activeTab]);


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
  const reviewsPending = submissions.filter(sub => sub.status === "Pending").length;
  const completedReviews = submissions.reduce((acc, sub) => acc + sub.numReviews, 0);

  // Filter and sort submissions (client-side filtering for class, semester, year)
  const filteredSubmissions = submissions.filter(sub => {
    const courseStr = sub.courseSemester || "";
    
    // Class filter
    if (filterClass && !courseStr.includes(filterClass)) {
      return false;
    }
    
    // Semester filter
    if (filterSemester && !courseStr.includes(filterSemester)) {
      return false;
    }
    
    // Year filter
    if (filterYear && !courseStr.includes(filterYear)) {
      return false;
    }
    
    // Status filter
    if (filterStatus && sub.status !== filterStatus) {
      return false;
    }
    
    // Team filter
    if (filterTeam && !sub.teamName.toLowerCase().includes(filterTeam.toLowerCase())) {
      return false;
    }
    
    return true;
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
        <h2 className="text-3xl font-semibold text-gray-900 mb-2">
          Welcome Professor{profile?.last_name ? ` ${profile.last_name}` : ""} 👋
        </h2>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All classes</option>
                  <option value="CS 633 Software Quality Testing and Security Management">CS 633 Software Quality Testing and Security Management</option>
                  <option value="Other">Other</option>
                </select>

                <select
                  value={filterSemester}
                  onChange={(e) => setFilterSemester(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All semesters</option>
                  <option value="Spring 1">Spring 1</option>
                  <option value="Spring 2">Spring 2</option>
                  <option value="Summer 1">Summer 1</option>
                  <option value="Summer 2">Summer 2</option>
                  <option value="Fall 1">Fall 1</option>
                  <option value="Fall 2">Fall 2</option>
                </select>

                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All years</option>
                  {yearOptions.map((yr) => (
                    <option key={yr} value={yr.toString()}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filter by team name..."
                    value={filterTeam}
                    onChange={(e) => setFilterTeam(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

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
                    setFilterClass('');
                    setFilterSemester('');
                    setFilterYear('');
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
                      onClick={() => handleSort('authorName')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        Submitted By
                        <SortIcon field="authorName" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('submittedDate')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        Date Submitted
                        <SortIcon field="submittedDate" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('teamName')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        Team
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
                        Status
                        <SortIcon field="status" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('numReviews')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        Reviews
                        <SortIcon field="numReviews" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('overallScore')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        Score
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
                        {submission.authorName}
                      </td>
                      <td className="px-6 py-4 text-gray-900 text-sm">
                        {submission.submittedDate}
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
              {/* Top Projects by Reviews - real data from DB */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-700" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Top 5 Projects by Reviews</h4>
                </div>
                <div className="space-y-3">
                  {analyticsLoading ? (
                    <p className="text-sm text-gray-500 py-4">Loading...</p>
                  ) : topProjectsByReviews.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4">No projects with reviews yet.</p>
                  ) : (
                    topProjectsByReviews.map((project, idx) => (
                      <div key={project.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                            {idx + 1}
                          </span>
                          <p className="text-sm text-gray-900 font-medium truncate">{project.projectTitle}</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{project.reviewCount}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Top Courses by Reviews - real data from DB */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileText className="w-5 h-5 text-green-700" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Top 5 Courses by Reviews</h4>
                </div>
                <div className="space-y-3">
                  {analyticsLoading ? (
                    <p className="text-sm text-gray-500 py-4">Loading...</p>
                  ) : topCoursesByReviews.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4">No course reviews yet.</p>
                  ) : (
                    topCoursesByReviews.map((item, idx) => (
                      <div key={item.course} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                            {idx + 1}
                          </span>
                          <p className="text-sm text-gray-900 font-medium truncate">{item.course}</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{item.reviewCount}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Top Reviewers - real data from DB */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Award className="w-5 h-5 text-purple-700" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Top 3 Reviewers</h4>
                </div>
                <div className="space-y-3">
                  {analyticsLoading ? (
                    <p className="text-sm text-gray-500 py-4">Loading...</p>
                  ) : topReviewers.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4">No reviewers yet.</p>
                  ) : (
                    topReviewers.map((reviewer, idx) => (
                      <div key={reviewer.reviewerId} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                            {idx + 1}
                          </span>
                          <p className="text-sm text-gray-900 font-medium">{reviewer.reviewerName}</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{reviewer.reviewCount}</span>
                      </div>
                    ))
                  )}
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
                <p className="text-sm text-gray-600 mb-1">
                  Submitted by {selectedSubmission.authorName} on {selectedSubmission.submittedDate}
                </p>
                <p className="text-sm text-gray-600">
                  Team: {selectedSubmission.teamName} • {selectedSubmission.courseSemester}
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
                {/* Submission link - always visible */}
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-1">Submission link</p>
                  {selectedSubmission.submittedWorkUrl ? (
                    <a
                      href={selectedSubmission.submittedWorkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {selectedSubmission.submittedWorkUrl}
                    </a>
                  ) : (
                    <span className="text-gray-500 text-sm">No submission link available.</span>
                  )}
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