import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, useSearchParams, Navigate } from 'react-router-dom';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { SubmissionFlow } from './components/SubmissionFlow';
import { ReviewFlow } from './components/ReviewFlow';
import { ProfessorView } from './components/ProfessorView';
import { SubmissionFeedback } from './components/SubmissionFeedback';
import { LogOut } from 'lucide-react';

/**
 * User role types for the application
 */
type UserRole = 'student' | 'professor';

/**
 * Main App Component
 *
 * Manages application state including:
 * - Authentication status
 * - User role (student/professor)
 * - URL-based routing for all views
 *
 * Route mappings:
 * - /login - Login page
 * - /student - Student dashboard
 * - /professor - Professor dashboard
 * - /submission - Submit work flow
 * - /feedback - Give feedback (review) flow
 * - /viewfeedback - View feedback for a submission
 */
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const navigate = useNavigate();
  const location = useLocation();

  // Sync role with URL when navigating via browser back/forward or direct links
  useEffect(() => {
    if (location.pathname === '/professor') {
      setCurrentRole('professor');
    } else if (['/student', '/submission', '/feedback', '/viewfeedback'].includes(location.pathname)) {
      setCurrentRole('student');
    }
  }, [location.pathname]);

  const handleLogin = (role: UserRole) => {
    setCurrentRole(role);
    setIsLoggedIn(true);
    navigate(role === 'professor' ? '/professor' : '/student');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentRole('student');
    navigate('/login');
  };

  const handleNavigateToFeedback = (submissionTitle: string) => {
    const params = new URLSearchParams({ title: submissionTitle });
    navigate(`/viewfeedback?${params.toString()}`);
  };

  // Show login page when not authenticated
  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Peer Review Platform</h1>
          <div className="flex gap-2 items-center">
            {/* Student View Button */}
            <button
              onClick={() => {
                setCurrentRole('student');
                navigate('/student');
              }}
              className={`px-4 py-2 rounded-lg ${
                currentRole === 'student'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Student View
            </button>
            {/* Professor View Button */}
            <button
              onClick={() => {
                setCurrentRole('professor');
                navigate('/professor');
              }}
              className={`px-4 py-2 rounded-lg ${
                currentRole === 'professor'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Professor View
            </button>
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - URL-based routing */}
      <Routes>
        <Route
          path="/student"
          element={
            <Dashboard
              onNavigateToSubmission={() => navigate('/submission')}
              onNavigateToReview={() => navigate('/feedback')}
              onNavigateToFeedback={handleNavigateToFeedback}
            />
          }
        />
        <Route
          path="/submission"
          element={
            currentRole === 'student' ? (
              <SubmissionFlow onBack={() => navigate('/student')} />
            ) : (
              <Navigate to="/professor" replace />
            )
          }
        />
        <Route
          path="/feedback"
          element={
            currentRole === 'student' ? (
              <ReviewFlow onBack={() => navigate('/student')} />
            ) : (
              <Navigate to="/professor" replace />
            )
          }
        />
        <Route
          path="/viewfeedback"
          element={
            currentRole === 'student' ? (
              <ViewFeedbackWrapper onBack={() => navigate('/student')} />
            ) : (
              <Navigate to="/professor" replace />
            )
          }
        />
        <Route
          path="/professor"
          element={
            currentRole === 'professor' ? (
              <ProfessorView />
            ) : (
              <Navigate to="/student" replace />
            )
          }
        />
        <Route path="/login" element={<Navigate to={currentRole === 'professor' ? '/professor' : '/student'} replace />} />
        <Route path="/" element={<Navigate to={currentRole === 'professor' ? '/professor' : '/student'} replace />} />
        <Route path="*" element={<Navigate to={currentRole === 'professor' ? '/professor' : '/student'} replace />} />
      </Routes>
    </div>
  );
}

/**
 * Wrapper to read submission title from URL search params for viewfeedback route
 */
function ViewFeedbackWrapper({ onBack }: { onBack: () => void }) {
  const [searchParams] = useSearchParams();
  const submissionTitle = searchParams.get('title') || '';

  return <SubmissionFeedback onBack={onBack} submissionTitle={submissionTitle} />;
}
