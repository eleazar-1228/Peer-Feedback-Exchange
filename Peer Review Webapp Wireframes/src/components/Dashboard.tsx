import { useEffect, useState } from 'react';
import { FileText, ClipboardCheck, CheckCircle, FileInput, ClipboardList, Calendar, BookOpen, Clock, ChevronUp, ChevronDown, X, Star, Search, ChevronLeft } from 'lucide-react';
import { FeedbackReceivedModal } from './FeedbackReceivedModal';
import { FeedbackProvidedModal } from './FeedbackProvidedModal';
import { Badge } from './ui/badge';
import { FeedbackDisplay } from './FeedbackDisplay';
import { getMyProfile } from '../lib/profileService';
import { 
  getMySubmissions, 
  getAllSubmissionsFiltered,
  getDistinctCourses
} from "../lib/submissionService";
import { 
  getSubmittedReviewsForSubmission, 
  getReviewStatsForSubmissions, 
  getMyCompletedReviewsCount,
  getMyFeedbackReceived,
  getMyFeedbackProvided
} from "../lib/reviewService";
import type { ReviewDisplayRow, FeedbackReceivedItem, FeedbackProvidedItem } from "../lib/reviewService";



interface DashboardProps {
  onNavigateToSubmission: () => void;
  onNavigateToReview: () => void;
  onNavigateToFeedback: (submissionTitle: string) => void;
}

type SortField = 'projectTitle' | 'course' | 'week' | 'status' | 'numReviews' | 'overallScore';
type AllSubmissionsSortField = 'projectTitle' | 'teamName' | 'courseSemester' | 'status' | 'numReviews' | 'overallScore';

interface StudentSubmission {
  id: string;
  projectTitle: string;
  course: string;
  week: string;
  projectTeam: string;
  submittedDate: string;
  status: string;
  numReviews: number;
  overallScore: number | null;
  reviews: Array<{
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
  }>;
}

interface AllSubmission {
  id: string;
  projectTitle: string;
  teamName: string;
  courseSemester: string;
  status: 'Pending' | 'Reviewed';
  numReviews: number;
  overallScore: number | null;
  reviews: Array<{
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
  }>;
}

export function Dashboard({ onNavigateToSubmission, onNavigateToReview, onNavigateToFeedback }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'overview' | 'feedback'>('all');
  const [selectedFeedbackReceived, setSelectedFeedbackReceived] = useState<number | null>(null);
  const [selectedFeedbackProvided, setSelectedFeedbackProvided] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedSubmissionForDetails, setSelectedSubmissionForDetails] = useState<StudentSubmission | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dbCourses, setDbCourses] = useState<string[]>([]);

  // Generate year options: only current year (no past, no future)
  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear];


  
  // All Feedback tab state
  const [allSortField, setAllSortField] = useState<AllSubmissionsSortField | null>(null);
  const [allSortDirection, setAllSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterClass, setFilterClass] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [selectedAllSubmission, setSelectedAllSubmission] = useState<AllSubmission | null>(null);
  const [myDbSubmissions, setMyDbSubmissions] = useState<StudentSubmission[]>([]);
  const [allDbSubmissions, setAllDbSubmissions] = useState<AllSubmission[]>([]);
  const [subsLoading, setSubsLoading] = useState(true);
  //const [submissionReviews, setSubmissionReviews] = useState<Record<string, any[]>>({});
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviews, setReviews] = useState<ReviewDisplayRow[]>([]);
  const [reviewPage, setReviewPage] = useState(0);
  const [selectedReviewForDetails, setSelectedReviewForDetails] = useState<ReviewDisplayRow | null>(null);
  const [myCompletedReviewsCount, setMyCompletedReviewsCount] = useState(0);
  const [feedbackReceived, setFeedbackReceived] = useState<FeedbackReceivedItem[]>([]);
  const [feedbackProvided, setFeedbackProvided] = useState<FeedbackProvidedItem[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);




  useEffect(() => {
    async function loadProfile() {
      try {
        const p = await getMyProfile();
        setProfile(p);
      } catch (err) {
        console.error("Profile load failed:", err);
      } finally {
        setLoading(false);
      }
    }
  
    loadProfile();
  }, []);

  useEffect(() => {
    async function loadSubmissions() {
      setSubsLoading(true);
      try {
        // Combine filters into course string if any are selected
        let courseFilter = undefined;
        if (filterClass || filterSemester || filterYear) {
          const parts = [];
          if (filterClass) parts.push(filterClass);
          if (filterSemester) parts.push(filterSemester);
          if (filterYear) parts.push(filterYear);
          courseFilter = parts.join(' ');
        }

        const [mine, all] = await Promise.all([
          getMySubmissions(),
          getAllSubmissionsFiltered({
            course: courseFilter,
            teamName: filterTeam || undefined,
            status: (filterStatus as "Pending" | "Reviewed") || undefined,
            limit: 200,
            offset: 0,
          }),
        ]);

        // Get review stats (counts and average scores) for all submissions
        const allSubmissionIds = [...(mine || []).map(s => s.id), ...(all || []).map(s => s.id)];
        const reviewStats = await getReviewStatsForSubmissions(allSubmissionIds);

        setMyDbSubmissions(
          mine.map((s) => {
            const stats = reviewStats[s.id] || { numReviews: 0, overallScore: null };
            // Status is "Reviewed" if there's at least one review, otherwise "Pending"
            const status = stats.numReviews > 0 ? "Reviewed" : "Pending";
            return {
              id: s.id,
              projectTitle: s.project_title,
              course: s.course,
              week: s.week,
              projectTeam: s.project_team,
              submittedDate: new Date(s.created_at).toLocaleDateString(),
              status,
              numReviews: stats.numReviews,
              overallScore: stats.overallScore,
              reviews: [],
            };
          })
        );

        setAllDbSubmissions(
          all.map((s) => {
            const stats = reviewStats[s.id] || { numReviews: 0, overallScore: null };
            // Status is "Reviewed" if there's at least one review, otherwise "Pending"
            const status = stats.numReviews > 0 ? "Reviewed" : "Pending";
            return {
              id: s.id,
              projectTitle: s.project_title,
              teamName: s.project_team,
              courseSemester: s.course,
              status,
              numReviews: stats.numReviews,
              overallScore: stats.overallScore,
              reviews: [],
            };
          })
        );
      } catch (e) {
        console.error("Failed to load submissions:", e);
      } finally {
        setSubsLoading(false);
      }
    }

    loadSubmissions();

    // Poll for updates every 30 seconds
    const pollInterval = setInterval(() => {
      loadSubmissions();
    }, 30000); // 30 seconds

    // Cleanup interval on unmount or when dependencies change
    return () => clearInterval(pollInterval);
  }, [filterClass, filterSemester, filterYear, filterTeam, filterStatus]);


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

  useEffect(() => {
    async function loadMyReviewsCount() {
      try {
        const count = await getMyCompletedReviewsCount();
        console.log("Setting my completed reviews count to:", count);
        setMyCompletedReviewsCount(count);
      } catch (e) {
        console.error("Failed to load my reviews count:", e);
      }
    }
    
    loadMyReviewsCount();

    // Poll for updates every 30 seconds
    const pollInterval = setInterval(() => {
      loadMyReviewsCount();
    }, 30000);

    return () => clearInterval(pollInterval);
  }, []);

  useEffect(() => {
    async function loadFeedbackDetails() {
      if (activeTab !== 'feedback') return;
      
      setFeedbackLoading(true);
      try {
        const [received, provided] = await Promise.all([
          getMyFeedbackReceived(),
          getMyFeedbackProvided(),
        ]);
        setFeedbackReceived(received);
        setFeedbackProvided(provided);
      } catch (e) {
        console.error("Failed to load feedback details:", e);
      } finally {
        setFeedbackLoading(false);
      }
    }
    
    loadFeedbackDetails();

    // Poll for updates every 30 seconds when on feedback tab
    let pollInterval: NodeJS.Timeout | null = null;
    if (activeTab === 'feedback') {
      pollInterval = setInterval(() => {
        loadFeedbackDetails();
      }, 30000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [activeTab]);


  useEffect(() => {
    async function loadReviews() {
      if (!selectedSubmissionForDetails) {
        setReviews([]); // Clear reviews when modal closes
        return;
      }

      setReviewsLoading(true);
      setReviews([]); // Clear previous reviews before loading new ones
      try {
        const r = await getSubmittedReviewsForSubmission(
          selectedSubmissionForDetails.id
        );
        setReviews(r);
      } catch (e) {
        console.error("Failed to load reviews:", e);
      } finally {
        setReviewsLoading(false);
      }
    }

    loadReviews();
  }, [selectedSubmissionForDetails]);


  useEffect(() => {
    async function loadAllModalReviews() {
      if (!selectedAllSubmission) {
        setReviews([]); // Clear reviews when modal closes
        return;
      }

      setReviewsLoading(true);
      setReviews([]); // Clear previous reviews before loading new ones
      try {
        const r = await getSubmittedReviewsForSubmission(selectedAllSubmission.id);
        setReviews(r);
      } catch (e) {
        console.error("Failed to load reviews (all modal):", e);
      } finally {
        setReviewsLoading(false);
      }
    }

    loadAllModalReviews();
  }, [selectedAllSubmission]);





  
  // REMOVED: All mock data arrays have been deleted
  // The dashboard now uses only real database data:
  // - myDbSubmissions (from getMySubmissions())
  // - allDbSubmissions (from getAllSubmissionsFiltered())
  // - reviews (from getSubmittedReviewsForSubmission())

  // Calculate stats from REAL data only
  const totalSubmissions = myDbSubmissions.length;
  const reviewsPending = 0; // TODO: Calculate from actual review assignments (would need a review_assignments table)
  const completedReviews = myCompletedReviewsCount;

  // REMOVED: Mock data - using only real database data now

  // Get unique courses and teams from REAL data
  const uniqueCourses = Array.from(new Set(allDbSubmissions.map(s => s.courseSemester))).sort();
  const uniqueTeams = Array.from(new Set(allDbSubmissions.map(s => s.teamName))).sort();
  // Filter and sort all submissions
    const filteredAllSubmissions = allDbSubmissions.filter(sub => {
    const matchesCourse = !filterCourse || sub.courseSemester === filterCourse;
    const matchesStatus = !filterStatus || sub.status === filterStatus;
    const matchesTeam = !filterTeam || sub.teamName.toLowerCase().includes(filterTeam.toLowerCase());
    return matchesCourse && matchesStatus && matchesTeam;
  });

  const sortedAllSubmissions = [...filteredAllSubmissions].sort((a, b) => {
    if (!allSortField) return 0;
    
    let aVal = a[allSortField];
    let bVal = b[allSortField];
    
    // Handle null values for overallScore
    if (allSortField === 'overallScore') {
      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return allSortDirection === 'asc' ? 1 : -1;
      if (bVal === null) return allSortDirection === 'asc' ? -1 : 1;
    }
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return allSortDirection === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return allSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    return 0;
  });

  // Calculate stats for all submissions
  const totalAllSubmissions = allDbSubmissions.length;
  // Only count submissions with status "Pending" (no reviews yet)
  const allReviewsPending = allDbSubmissions.filter(sub => sub.status === "Pending").length;
  const allCompletedReviews = allDbSubmissions.reduce((acc, sub) => acc + sub.numReviews, 0);

  const handleAllSort = (field: AllSubmissionsSortField) => {
    if (allSortField === field) {
      setAllSortDirection(allSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setAllSortField(field);
      setAllSortDirection('asc');
    }
  };

  const AllSortIcon = ({ field }: { field: AllSubmissionsSortField }) => {
    if (allSortField !== field) return <ChevronUp className="w-4 h-4 text-gray-300" />;
    return allSortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-blue-600" />
      : <ChevronDown className="w-4 h-4 text-blue-600" />;
  };

  


  const closeAllDetailsModal = () => {
    setSelectedAllSubmission(null);
    setReviewPage(0);
    setSelectedReviewForDetails(null);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp className="w-4 h-4 text-gray-300" />;
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-blue-600" />
      : <ChevronDown className="w-4 h-4 text-blue-600" />;
  };

  const sortedSubmissions = [...myDbSubmissions].sort((a, b) => {
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

  const handleRowClick = (submission: StudentSubmission) => {
    setSelectedSubmissionForDetails(submission);
  };

  const handleAllRowClick = (submission: AllSubmission) => {
    setSelectedAllSubmission(submission);
  };



  const closeDetailsModal = () => {
    setSelectedSubmissionForDetails(null);
    setReviewPage(0);
    setSelectedReviewForDetails(null);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          Loading your profile...
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          No profile found. Please log in again.
        </div>
      </div>
    );
  }

  if (subsLoading || loading) {
  return <div className="max-w-7xl mx-auto p-8">Loading dashboard…</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-900 mb-2">
          Welcome{profile?.first_name ? `, ${profile.first_name}` : ""} 👋
        </h2>

        <p className="text-gray-600">
          {profile?.course
            ? `Course: ${profile.course}`
            : "Manage your submissions and reviews"}
        </p>

        {profile?.student_id && (
          <p className="text-sm text-gray-500 mt-1">
            Student ID: {profile.student_id}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-4 px-1 border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            All Feedback
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-1 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            My Feedback Overview
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`pb-4 px-1 border-b-2 transition-colors ${
              activeTab === 'feedback'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            My Feedback Details
          </button>
        </div>
      </div>

      {/* All Feedback Tab */}
      {activeTab === 'all' && (
        <div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Total Submissions</span>
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-semibold text-gray-900">{totalAllSubmissions}</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Reviews Pending</span>
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-2xl font-semibold text-gray-900">{allReviewsPending}</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Completed Reviews</span>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-semibold text-gray-900">{allCompletedReviews}</p>
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
                    setAllSortField(null);
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
                      onClick={() => handleAllSort('projectTitle')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        Project Title
                        <AllSortIcon field="projectTitle" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleAllSort('teamName')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        Team Name
                        <AllSortIcon field="teamName" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleAllSort('courseSemester')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        Course / Semester
                        <AllSortIcon field="courseSemester" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleAllSort('status')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        Status
                        <AllSortIcon field="status" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleAllSort('numReviews')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        Number of Reviews
                        <AllSortIcon field="numReviews" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleAllSort('overallScore')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        Overall Score
                        <AllSortIcon field="overallScore" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedAllSubmissions.map((submission) => (
                    <tr 
                      key={submission.id} 
                      onClick={() => handleAllRowClick(submission)}
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
          </div>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">My Submissions</span>
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

            {/* Give Feedback */}
            <div className="bg-white p-8 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors cursor-pointer" onClick={onNavigateToReview}>
              <ClipboardCheck className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Give Feedback</h3>
              <p className="text-gray-600 mb-4">Provide reviews on peer submissions</p>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Start Reviewing
              </button>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">My Submissions</h3>
            </div>

            {/* Table - scrollable submissions list */}
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
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
                      onClick={() => handleSort('course')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        Course / Semester
                        <SortIcon field="course" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('week')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        Week / Module
                        <SortIcon field="week" />
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
                      <td className="px-6 py-4 text-gray-900 text-sm">
                        {submission.course}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {submission.week}
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
          </div>
        </div>
      )}

      {/* Feedback Tab */}
      {activeTab === 'feedback' && (
        <div>
          {feedbackLoading ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-600">Loading feedback...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Feedback Received Section */}
              <div className="bg-white rounded-lg border-2 border-green-200 shadow-sm">
                <div className="bg-green-50 p-6 border-b border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <FileInput className="w-6 h-6 text-green-700" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Feedback Received</h3>
                      <p className="text-sm text-gray-600">Reviews on your submitted work</p>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                  {feedbackReceived.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      No submissions yet
                    </div>
                  ) : (
                    feedbackReceived.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          const submission = myDbSubmissions.find(s => s.id === item.id);
                          if (submission) setSelectedSubmissionForDetails(submission);
                        }}
                        className={`p-5 hover:bg-gray-50 transition-colors ${
                          item.status === 'Feedback Received' ? 'cursor-pointer' : 'cursor-default opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 text-base pr-2">{item.projectTitle}</h4>
                          <Badge 
                            variant={item.status === 'Feedback Received' ? 'default' : 'secondary'}
                            className={item.status === 'Feedback Received' ? 'bg-green-100 text-green-800 border-green-300' : ''}
                          >
                            {item.status}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <BookOpen className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{item.course}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <ClipboardList className="w-4 h-4 flex-shrink-0" />
                            <span>{item.week}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span>Submitted: {item.submittedDate}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Star className="w-4 h-4 flex-shrink-0 text-yellow-500" />
                            <span>{item.numReviews} review{item.numReviews !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs font-medium text-green-700 bg-green-50 inline-block px-2 py-1 rounded">
                            You are the Author
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Feedback Provided Section */}
              <div className="bg-white rounded-lg border-2 border-purple-200 shadow-sm">
                <div className="bg-purple-50 p-6 border-b border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <ClipboardList className="w-6 h-6 text-purple-700" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Feedback Provided</h3>
                      <p className="text-sm text-gray-600">Reviews you submitted for peers</p>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                  {feedbackProvided.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      No reviews submitted yet
                    </div>
                  ) : (
                    feedbackProvided.map((item) => (
                      <div
                        key={item.reviewId}
                        className="p-5 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 text-base pr-2">{item.projectTitle}</h4>
                          <Badge variant="default" className="bg-purple-100 text-purple-800 border-purple-300">
                            {item.status}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <BookOpen className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{item.course}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <ClipboardList className="w-4 h-4 flex-shrink-0" />
                            <span>{item.week}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span>Reviewed: {item.reviewedDate}</span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs font-medium text-purple-700 bg-purple-50 inline-block px-2 py-1 rounded">
                            You are the Reviewer
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* REMOVED: Old Feedback Tab with mock data */}
      {false && activeTab === 'feedback' && (
        <div>
          {/* Primary Feedback Sections - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Feedback Received Section */}
            <div className="bg-white rounded-lg border-2 border-green-200 shadow-sm">
              <div className="bg-green-50 p-6 border-b border-green-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <FileInput className="w-6 h-6 text-green-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Feedback Received</h3>
                    <p className="text-sm text-gray-600">Reviews on your submitted work</p>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {[].map((item: any) => (
                  <div
                    key={item.id}
                    onClick={() => item.status === 'Feedback Received' && setSelectedFeedbackReceived(item.id)}
                    className={`p-5 hover:bg-gray-50 transition-colors ${
                      item.status === 'Feedback Received' ? 'cursor-pointer' : 'cursor-default opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 text-base pr-2">{item.projectTitle}</h4>
                      <Badge 
                        variant={item.status === 'Feedback Received' ? 'default' : 'secondary'}
                        className={item.status === 'Feedback Received' ? 'bg-green-100 text-green-800 border-green-300' : ''}
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BookOpen className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{item.course}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <ClipboardList className="w-4 h-4 flex-shrink-0" />
                        <span>{item.week}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>Submitted: {item.submittedDate}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs font-medium text-green-700 bg-green-50 inline-block px-2 py-1 rounded">
                        You are the Author
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback Provided Section */}
            <div className="bg-white rounded-lg border-2 border-purple-200 shadow-sm">
              <div className="bg-purple-50 p-6 border-b border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <ClipboardList className="w-6 h-6 text-purple-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Feedback Provided</h3>
                    <p className="text-sm text-gray-600">Reviews you submitted for peers</p>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {[].map((item: any) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedFeedbackProvided(item.id)}
                    className="p-5 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 text-base pr-2">{item.projectTitle}</h4>
                      <Badge variant="default" className="bg-purple-100 text-purple-800 border-purple-300">
                        {item.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BookOpen className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{item.course}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <ClipboardList className="w-4 h-4 flex-shrink-0" />
                        <span>{item.week}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>Reviewed: {item.reviewedDate}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs font-medium text-purple-700 bg-purple-50 inline-block px-2 py-1 rounded">
                        You are the Reviewer
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submission Details Modal (from Overview table) */}
      {selectedSubmissionForDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {selectedSubmissionForDetails.projectTitle}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedSubmissionForDetails.projectTeam} • {selectedSubmissionForDetails.course}
                </p>
              </div>
              <button
                onClick={closeDetailsModal}
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
                    <p className="font-semibold text-gray-900">{selectedSubmissionForDetails.status}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Number of Reviews</p>
                    <p className="font-semibold text-gray-900">{selectedSubmissionForDetails.numReviews}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Overall Score</p>
                    <p className="font-semibold text-gray-900">
                      {selectedSubmissionForDetails.overallScore !== null 
                        ? selectedSubmissionForDetails.overallScore.toFixed(1)
                        : '—'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Reviews List or Detail View */}
              <div className="space-y-6">
                {selectedReviewForDetails ? (
                  <>
                    {/* Back Button */}
                    <button
                      onClick={() => setSelectedReviewForDetails(null)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      Back to Reviews List
                    </button>

                    {/* Review Details */}
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">Review by {selectedReviewForDetails.reviewerName}</h4>
                      <p className="text-sm text-gray-600">
                        Submitted on {new Date(selectedReviewForDetails.submittedAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>

                    <FeedbackDisplay
                      review={{
                        reviewerName: selectedReviewForDetails.reviewerName,
                        overallRating: selectedReviewForDetails.overallRating,
                        clarity: selectedReviewForDetails.clarity,
                        organization: selectedReviewForDetails.organization,
                        technicalSoundness: selectedReviewForDetails.technicalSoundness,
                        usability: selectedReviewForDetails.usability,
                        strengths: selectedReviewForDetails.strengths ?? "",
                        improvements: selectedReviewForDetails.improvements ?? "",
                        oneChange: selectedReviewForDetails.oneChange ?? "",
                        otherObservations: selectedReviewForDetails.otherObservations ?? "",
                      }}
                    />
                  </>
                ) : (
                  <>
                    <h4 className="font-semibold text-gray-900 text-lg">Peer Reviews ({reviews.length})</h4>

                    {reviewsLoading ? (
                      <div className="text-sm text-gray-600">Loading reviews...</div>
                    ) : reviews.length === 0 ? (
                      <div className="text-sm text-gray-600">No submitted reviews yet.</div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          {reviews.slice(reviewPage * 10, (reviewPage + 1) * 10).map((r, idx) => (
                            <div 
                              key={r.id ?? idx} 
                              onClick={() => setSelectedReviewForDetails(r)}
                              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-gray-900">{r.reviewerName}</p>
                                  <p className="text-sm text-gray-600">
                                    {new Date(r.submittedAt).toLocaleDateString('en-US', { 
                                      year: 'numeric', 
                                      month: 'long', 
                                      day: 'numeric' 
                                    })}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    <span className="text-sm font-medium text-gray-900">{r.overallRating}/5</span>
                                  </div>
                                  <ChevronDown className="w-5 h-5 text-gray-400 rotate-[-90deg]" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Pagination */}
                        {reviews.length > 10 && (
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <button
                              onClick={() => setReviewPage(Math.max(0, reviewPage - 1))}
                              disabled={reviewPage === 0}
                              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                                reviewPage === 0
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              <ChevronUp className="w-4 h-4 rotate-[-90deg]" />
                              Previous
                            </button>

                            <span className="text-sm text-gray-600">
                              Page {reviewPage + 1} of {Math.ceil(reviews.length / 10)}
                            </span>

                            <button
                              onClick={() => setReviewPage(Math.min(Math.ceil(reviews.length / 10) - 1, reviewPage + 1))}
                              disabled={reviewPage >= Math.ceil(reviews.length / 10) - 1}
                              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                                reviewPage >= Math.ceil(reviews.length / 10) - 1
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              Next
                              <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={closeDetailsModal}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Submissions Details Modal (from All Feedback table) */}
      {selectedAllSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {selectedAllSubmission.projectTitle}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedAllSubmission.teamName} • {selectedAllSubmission.courseSemester}
                </p>
              </div>
              <button
                onClick={closeAllDetailsModal}
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
                    <p className="font-semibold text-gray-900">{selectedAllSubmission.status}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Number of Reviews</p>
                    <p className="font-semibold text-gray-900">{selectedAllSubmission.numReviews}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Overall Score</p>
                    <p className="font-semibold text-gray-900">
                      {selectedAllSubmission.overallScore !== null 
                        ? selectedAllSubmission.overallScore.toFixed(1)
                        : '—'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Reviews List or Detail View */}
              {selectedReviewForDetails ? (
                <>
                  {/* Back Button */}
                  <button
                    onClick={() => setSelectedReviewForDetails(null)}
                    className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back to Reviews List
                  </button>

                  {/* Review Details */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 text-lg">Review by {selectedReviewForDetails.reviewerName}</h4>
                    <p className="text-sm text-gray-600">
                      Submitted on {new Date(selectedReviewForDetails.submittedAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>

                  <FeedbackDisplay
                    review={{
                      reviewerName: selectedReviewForDetails.reviewerName,
                      overallRating: selectedReviewForDetails.overallRating,
                      clarity: selectedReviewForDetails.clarity,
                      organization: selectedReviewForDetails.organization,
                      technicalSoundness: selectedReviewForDetails.technicalSoundness,
                      usability: selectedReviewForDetails.usability,
                      strengths: selectedReviewForDetails.strengths ?? "",
                      improvements: selectedReviewForDetails.improvements ?? "",
                      oneChange: selectedReviewForDetails.oneChange ?? "",
                      otherObservations: selectedReviewForDetails.otherObservations ?? "",
                    }}
                  />
                </>
              ) : (
                <>
                  <h4 className="font-semibold text-gray-900 text-lg mb-4">
                    Peer Reviews ({reviews.length})
                  </h4>

                  {reviewsLoading ? (
                    <div className="text-sm text-gray-600">Loading reviews...</div>
                  ) : reviews.length === 0 ? (
                    <div className="text-sm text-gray-600">No submitted reviews yet.</div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {reviews.slice(reviewPage * 10, (reviewPage + 1) * 10).map((r, idx) => (
                          <div 
                            key={r.id ?? idx} 
                            onClick={() => setSelectedReviewForDetails(r)}
                            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-gray-900">{r.reviewerName}</p>
                                <p className="text-sm text-gray-600">
                                  {new Date(r.submittedAt).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                  <span className="text-sm font-medium text-gray-900">{r.overallRating}/5</span>
                                </div>
                                <ChevronDown className="w-5 h-5 text-gray-400 rotate-[-90deg]" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pagination */}
                      {reviews.length > 10 && (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => setReviewPage(Math.max(0, reviewPage - 1))}
                            disabled={reviewPage === 0}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                              reviewPage === 0
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            <ChevronUp className="w-4 h-4 rotate-[-90deg]" />
                            Previous
                          </button>

                          <span className="text-sm text-gray-600">
                            Page {reviewPage + 1} of {Math.ceil(reviews.length / 10)}
                          </span>

                          <button
                            onClick={() => setReviewPage(Math.min(Math.ceil(reviews.length / 10) - 1, reviewPage + 1))}
                            disabled={reviewPage >= Math.ceil(reviews.length / 10) - 1}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                              reviewPage >= Math.ceil(reviews.length / 10) - 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            Next
                            <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={closeAllDetailsModal}
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