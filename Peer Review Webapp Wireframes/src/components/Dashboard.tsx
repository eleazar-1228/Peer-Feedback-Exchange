import { useEffect, useState } from 'react';
import { FileText, ClipboardCheck, CheckCircle, FileInput, ClipboardList, Calendar, BookOpen, Clock, ChevronUp, ChevronDown, X, Star, Search } from 'lucide-react';
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



interface DashboardProps {
  onNavigateToSubmission: () => void;
  onNavigateToReview: () => void;
  onNavigateToFeedback: (submissionTitle: string) => void;
}

type SortField = 'projectTitle' | 'course' | 'week' | 'status' | 'numReviews' | 'overallScore';
type AllSubmissionsSortField = 'projectTitle' | 'teamName' | 'courseSemester' | 'status' | 'numReviews' | 'overallScore';

interface StudentSubmission {
  id: number;
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


  
  // All Feedback tab state
  const [allSortField, setAllSortField] = useState<AllSubmissionsSortField | null>(null);
  const [allSortDirection, setAllSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [selectedAllSubmission, setSelectedAllSubmission] = useState<AllSubmission | null>(null);
  const [myDbSubmissions, setMyDbSubmissions] = useState<StudentSubmission[]>([]);
  const [allDbSubmissions, setAllDbSubmissions] = useState<AllSubmission[]>([]);
  const [subsLoading, setSubsLoading] = useState(true);


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
        const [mine, all] = await Promise.all([
          getMySubmissions(),
          getAllSubmissionsFiltered({
            course: filterCourse || undefined,
            teamName: filterTeam || undefined,
            status: (filterStatus as "Pending" | "Reviewed") || undefined,
            limit: 200,
            offset: 0,
          }),
        ]);

        setMyDbSubmissions(
          mine.map((s) => ({
            id: Number.NaN, // later switch your UI id types to string
            projectTitle: s.project_title,
            course: s.course,
            week: s.week,
            projectTeam: s.project_team,
            submittedDate: new Date(s.created_at).toLocaleDateString(),
            status: s.status === "pending" ? "Pending" : "Reviewed",
            numReviews: 0,
            overallScore: null,
            reviews: [],
          }))
        );

        setAllDbSubmissions(
          all.map((s) => ({
            id: s.id,
            projectTitle: s.project_title,
            teamName: s.project_team,
            courseSemester: s.course,
            status: s.status === "pending" ? "Pending" : "Reviewed",
            numReviews: 0,
            overallScore: null,
            reviews: [],
          }))
        );
      } catch (e) {
        console.error("Failed to load submissions:", e);
      } finally {
        setSubsLoading(false);
      }
    }

    loadSubmissions();
  }, [filterCourse, filterTeam, filterStatus]);


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



  

  // Mock data for student's submissions with reviews
  const mySubmissionsData: StudentSubmission[] = [
    {
      id: 1,
      projectTitle: 'Research Paper: AI Ethics',
      course: 'MET CS633 – Spring 1, 2026',
      week: 'Week 3',
      projectTeam: 'Sarah Chen, Michael Rodriguez',
      submittedDate: 'Jan 20, 2026',
      status: 'Reviewed',
      numReviews: 3,
      overallScore: 4.3,
      reviews: [
        {
          reviewerName: 'Reviewer A',
          overallRating: 4,
          clarity: 4,
          organization: 5,
          technicalSoundness: 4,
          usability: 3,
          strengths: 'Clear and well-structured argument. Good use of supporting evidence. Strong introduction and conclusion.',
          improvements: 'Could expand on the methodology section. Some citations need proper formatting.',
          oneChange: 'Add a more detailed methodology section.',
          otherObservations: 'Overall solid work with thorough research.',
        },
        {
          reviewerName: 'Reviewer B',
          overallRating: 5,
          clarity: 5,
          organization: 5,
          technicalSoundness: 4,
          usability: 4,
          strengths: 'Excellent research depth and innovative approach. Strong critical analysis.',
          improvements: 'Minor grammatical errors in section 3. Could benefit from visual aids.',
          oneChange: 'Add charts or diagrams to illustrate complex concepts.',
          otherObservations: 'Exceptional submission with impressive depth.',
        },
        {
          reviewerName: 'Reviewer C',
          overallRating: 4,
          clarity: 4,
          organization: 4,
          technicalSoundness: 5,
          usability: 3,
          strengths: 'Comprehensive literature review. Balanced perspective on ethical considerations.',
          improvements: 'Abstract could be more concise. Some technical terms need explanation.',
          oneChange: 'Strengthen the conclusion with concrete recommendations.',
          otherObservations: 'Well-researched paper with good pacing.',
        },
      ],
    },
    {
      id: 2,
      projectTitle: 'Code Project: React Dashboard',
      course: 'MET CS601 – Spring 1, 2026',
      week: 'Week 2',
      projectTeam: 'Sarah Chen',
      submittedDate: 'Jan 15, 2026',
      status: 'Reviewed',
      numReviews: 2,
      overallScore: 4.5,
      reviews: [
        {
          reviewerName: 'Reviewer D',
          overallRating: 5,
          clarity: 5,
          organization: 5,
          technicalSoundness: 4,
          usability: 5,
          strengths: 'Excellent code organization and component structure. Well-implemented responsive design.',
          improvements: 'Could add more comprehensive error handling. Consider adding unit tests.',
          oneChange: 'Implement comprehensive test coverage.',
          otherObservations: 'Very impressive work with modern React patterns.',
        },
        {
          reviewerName: 'Reviewer E',
          overallRating: 4,
          clarity: 4,
          organization: 5,
          technicalSoundness: 4,
          usability: 4,
          strengths: 'Clean code architecture. Good use of hooks and state management.',
          improvements: 'Performance optimization needed for large datasets.',
          oneChange: 'Implement memoization for expensive computations.',
          otherObservations: 'Solid implementation with room for optimization.',
        },
      ],
    },
    {
      id: 3,
      projectTitle: 'Design Mockup: Mobile App',
      course: 'MET CS633 – Spring 1, 2026',
      week: 'Week 4',
      projectTeam: 'Sarah Chen, Alex Kim, Jordan Lee',
      submittedDate: 'Jan 22, 2026',
      status: 'Pending',
      numReviews: 1,
      overallScore: null,
      reviews: [
        {
          reviewerName: 'Reviewer F',
          overallRating: 4,
          clarity: 4,
          organization: 4,
          technicalSoundness: 4,
          usability: 5,
          strengths: 'Intuitive user interface. Good visual hierarchy.',
          improvements: 'Some navigation elements could be more discoverable.',
          oneChange: 'Add interactive onboarding for first-time users.',
          otherObservations: 'Strong design with good UX understanding.',
        },
      ],
    },
  ];

  // Mock data for Feedback Received (User is Author)
  const feedbackReceivedData = [
    {
      id: 1,
      projectTitle: 'Research Paper: AI Ethics',
      course: 'MET CS633 – Spring 1, 2026',
      week: 'Week 3',
      projectTeam: 'Sarah Chen, Michael Rodriguez',
      submittedWorkUrl: 'https://drive.google.com/document/d/example123',
      submittedDate: 'Jan 20, 2026',
      status: 'Feedback Received',
      feedback: {
        reviewerName: 'Alex Smith',
        reviewedDate: 'Jan 21, 2026',
        rating: 4,
        strengths: 'Clear and well-structured argument. Good use of supporting evidence. Strong introduction and conclusion.',
        improvements: 'Could expand on the methodology section. Some citations need proper formatting. Consider adding more recent sources.',
        oneChange: 'Add a more detailed methodology section to strengthen the research approach.',
        otherObservations: 'Overall a solid piece of work with thorough research and clear writing.',
        clarity: 4,
        organization: 5,
        technicalSoundness: 4,
        usability: 3,
      },
    },
    {
      id: 2,
      projectTitle: 'Code Project: React Dashboard',
      course: 'MET CS601 – Spring 1, 2026',
      week: 'Week 2',
      projectTeam: 'Sarah Chen',
      submittedWorkUrl: 'https://github.com/example/react-dashboard',
      submittedDate: 'Jan 15, 2026',
      status: 'Feedback Received',
      feedback: {
        reviewerName: 'Jordan Lee',
        reviewedDate: 'Jan 18, 2026',
        rating: 5,
        strengths: 'Excellent code organization and component structure. Well-implemented responsive design.',
        improvements: 'Could add more comprehensive error handling. Consider adding unit tests.',
        oneChange: 'Implement comprehensive test coverage for critical components.',
        otherObservations: 'Very impressive work with modern React patterns and clean code.',
        clarity: 5,
        organization: 5,
        technicalSoundness: 4,
        usability: 5,
      },
    },
    {
      id: 3,
      projectTitle: 'Design Mockup: Mobile App',
      course: 'MET CS633 – Spring 1, 2026',
      week: 'Week 4',
      projectTeam: 'Sarah Chen, Alex Kim, Jordan Lee',
      submittedWorkUrl: 'https://figma.com/file/example789',
      submittedDate: 'Jan 22, 2026',
      status: 'Pending Review',
      feedback: {
        reviewerName: '',
        reviewedDate: '',
        rating: 0,
        strengths: '',
        improvements: '',
        oneChange: '',
        otherObservations: '',
        clarity: 0,
        organization: 0,
        technicalSoundness: 0,
        usability: 0,
      },
    },
  ];

  // Mock data for Feedback Provided (User is Reviewer)
  const feedbackProvidedData = [
    {
      id: 1,
      projectTitle: 'E-commerce Platform Redesign',
      course: 'MET CS633 – Spring 1, 2026',
      week: 'Week 3',
      projectTeam: 'Team Alpha',
      submittedWorkUrl: 'https://drive.google.com/document/d/peer123',
      submittedDate: 'Jan 18, 2026',
      reviewedDate: 'Jan 22, 2026',
      status: 'Review Submitted',
      yourFeedback: {
        rating: 4,
        strengths: 'Strong visual hierarchy and user flow. Good attention to accessibility considerations.',
        improvements: 'Navigation could be simplified. Some color choices may have contrast issues.',
        oneChange: 'Simplify the main navigation structure to reduce cognitive load.',
        otherObservations: 'Well thought out design with good understanding of UX principles.',
        clarity: 4,
        organization: 4,
        technicalSoundness: 5,
        usability: 3,
      },
    },
    {
      id: 2,
      projectTitle: 'Data Visualization Dashboard',
      course: 'MET CS601 – Spring 1, 2026',
      week: 'Week 2',
      projectTeam: 'Team Beta',
      submittedWorkUrl: 'https://github.com/example/viz-dashboard',
      submittedDate: 'Jan 14, 2026',
      reviewedDate: 'Jan 18, 2026',
      status: 'Review Submitted',
      yourFeedback: {
        rating: 5,
        strengths: 'Excellent use of D3.js for interactive visualizations. Clean and efficient code.',
        improvements: 'Could benefit from better data caching. Loading states could be more polished.',
        oneChange: 'Implement data caching to improve performance with large datasets.',
        otherObservations: 'Outstanding technical implementation with impressive interactivity.',
        clarity: 5,
        organization: 5,
        technicalSoundness: 5,
        usability: 4,
      },
    },
    {
      id: 3,
      projectTitle: 'Mobile Fitness Tracker',
      course: 'MET CS633 – Spring 1, 2026',
      week: 'Week 1',
      projectTeam: 'Team Gamma',
      submittedWorkUrl: 'https://figma.com/file/fitness-tracker',
      submittedDate: 'Jan 10, 2026',
      reviewedDate: 'Jan 15, 2026',
      status: 'Review Submitted',
      yourFeedback: {
        rating: 4,
        strengths: 'Intuitive interface design. Good use of data visualization for fitness metrics.',
        improvements: 'Some interactions could be more discoverable. Consider adding onboarding flow.',
        oneChange: 'Add an interactive onboarding experience for first-time users.',
        otherObservations: 'Solid design with good understanding of the fitness app domain.',
        clarity: 4,
        organization: 4,
        technicalSoundness: 4,
        usability: 4,
      },
    },
  ];

  // Calculate stats
  const totalSubmissions = myDbSubmissions.length;
  const reviewsPending = mySubmissionsData.reduce((acc, sub) => acc + Math.max(0, 3 - sub.numReviews), 0);
  const completedReviews = mySubmissionsData.reduce((acc, sub) => acc + sub.numReviews, 0);

  const selectedFeedbackReceivedItem = feedbackReceivedData.find(item => item.id === selectedFeedbackReceived);
  const selectedFeedbackProvidedItem = feedbackProvidedData.find(item => item.id === selectedFeedbackProvided);

  // Mock data for All Feedback tab (all submissions from all students, similar to professor view)
  const allSubmissionsData: AllSubmission[] = [
    { id: '1', projectTitle: 'BU Peer Review Platform', teamName: 'Team Four', courseSemester: 'MET CS633 – Spring 1, 2026', status: 'Reviewed', numReviews: 3, overallScore: 4.2, reviews: [
      {
        reviewerName: 'Student A',
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
        reviewerName: 'Student B',
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
        reviewerName: 'Student C',
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
    ]},
    { id: '2', projectTitle: 'Mobile Banking App', teamName: 'Team Two', courseSemester: 'MET CS601 – Spring 1, 2026', status: 'Pending', numReviews: 1, overallScore: null, reviews: [
      {
        reviewerName: 'Student D',
        overallRating: 4,
        clarity: 4,
        organization: 4,
        technicalSoundness: 4,
        usability: 4,
        strengths: 'Good security implementation. Clean UI design.',
        improvements: 'Need more features for account management.',
        oneChange: 'Add biometric authentication.',
        otherObservations: 'Promising start, needs more development.'
      }
    ]},
    { id: '3', projectTitle: 'E-commerce Dashboard', teamName: 'Team Five', courseSemester: 'MET CS633 – Spring 1, 2026', status: 'Reviewed', numReviews: 3, overallScore: 3.8, reviews: [
      {
        reviewerName: 'Student E',
        overallRating: 4,
        clarity: 4,
        organization: 3,
        technicalSoundness: 4,
        usability: 4,
        strengths: 'Good data visualization. Responsive layout.',
        improvements: 'Performance issues with large datasets.',
        oneChange: 'Implement data pagination.',
        otherObservations: 'Solid dashboard with room for optimization.'
      }
    ]},
    { id: '4', projectTitle: 'Healthcare Portal', teamName: 'Team One', courseSemester: 'MET CS601 – Spring 1, 2026', status: 'Reviewed', numReviews: 3, overallScore: 4.5, reviews: []},
    { id: '5', projectTitle: 'Social Media Analytics', teamName: 'Team Three', courseSemester: 'MET CS633 – Spring 1, 2026', status: 'Pending', numReviews: 2, overallScore: null, reviews: []},
    { id: '6', projectTitle: 'Learning Management System', teamName: 'Team Six', courseSemester: 'MET CS601 – Spring 1, 2026', status: 'Reviewed', numReviews: 3, overallScore: 4.0, reviews: []},
  ];

  // Get unique courses for filter
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
  const allReviewsPending = allDbSubmissions.reduce((acc, sub) => acc + Math.max(0, 3 - sub.numReviews), 0);
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

  const handleAllRowClick = (submission: AllSubmission) => {
    setSelectedAllSubmission(submission);
  };

  const closeAllDetailsModal = () => {
    setSelectedAllSubmission(null);
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

  const closeDetailsModal = () => {
    setSelectedSubmissionForDetails(null);
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  value={filterCourse}
                  onChange={(e) => setFilterCourse(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All courses</option>
                  {dbCourses.map(course => (
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
                {feedbackReceivedData.map((item) => (
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
                {feedbackProvidedData.map((item) => (
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

      {/* Modals for Feedback Sections */}
      {selectedFeedbackReceivedItem && selectedFeedbackReceivedItem.status === 'Feedback Received' && (
        <FeedbackReceivedModal
          isOpen={selectedFeedbackReceived !== null}
          onClose={() => setSelectedFeedbackReceived(null)}
          submission={selectedFeedbackReceivedItem}
        />
      )}

      {selectedFeedbackProvidedItem && (
        <FeedbackProvidedModal
          isOpen={selectedFeedbackProvided !== null}
          onClose={() => setSelectedFeedbackProvided(null)}
          review={selectedFeedbackProvidedItem}
        />
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

              {/* Reviews List */}
              <div className="space-y-6">
                <h4 className="font-semibold text-gray-900 text-lg">Peer Reviews</h4>
                {selectedSubmissionForDetails.reviews.map((review, idx) => (
                  <FeedbackDisplay key={idx} review={review} />
                ))}
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

              {/* Reviews List */}
              <div className="space-y-6">
                <h4 className="font-semibold text-gray-900 text-lg">Peer Reviews</h4>
                {selectedAllSubmission.reviews.map((review, idx) => (
                  <FeedbackDisplay key={idx} review={review} />
                ))}
              </div>
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