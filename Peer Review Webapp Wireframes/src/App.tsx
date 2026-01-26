import { useState } from 'react';
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
 * Available view types for navigation
 */
type View = 'dashboard' | 'submission' | 'review' | 'professor' | 'feedback';

/**
 * Main App Component
 * 
 * Manages application state including:
 * - Authentication status
 * - User role (student/professor)
 * - Current view/page
 * - Selected submission for feedback view
 * 
 * Handles routing between different views based on user role and actions
 */
export default function App() {
  // Authentication state - tracks if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Current user role - determines which views are accessible
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  
  // Current view/page being displayed
  const [currentView, setCurrentView] = useState<View>('dashboard');
  
  // Selected submission title for feedback view
  const [selectedSubmission, setSelectedSubmission] = useState<string>('');

  /**
   * Handles user login
   * Sets the user role and navigates to appropriate view based on role
   * @param role - The role of the user logging in (student or professor)
   */
  const handleLogin = (role: UserRole) => {
    setCurrentRole(role);
    setIsLoggedIn(true);
    // Professors go directly to professor view, students to dashboard
    setCurrentView(role === 'professor' ? 'professor' : 'dashboard');
  };

  /**
   * Handles user logout
   * Resets authentication state and returns to default view
   */
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView('dashboard');
    setCurrentRole('student');
    setSelectedSubmission('');
  };

  /**
   * Navigates to feedback view for a specific submission
   * @param submissionTitle - The title of the submission to view feedback for
   */
  const handleNavigateToFeedback = (submissionTitle: string) => {
    setSelectedSubmission(submissionTitle);
    setCurrentView('feedback');
  };

  // Show login page if user is not authenticated
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header - Role Switcher for Demo */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Peer Review Platform</h1>
          <div className="flex gap-2 items-center">
            {/* Student View Button - Switches to student role and dashboard */}
            <button
              onClick={() => {
                setCurrentRole('student');
                setCurrentView('dashboard');
              }}
              className={`px-4 py-2 rounded-lg ${
                currentRole === 'student'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Student View
            </button>
            {/* Professor View Button - Switches to professor role and professor view */}
            <button
              onClick={() => {
                setCurrentRole('professor');
                setCurrentView('professor');
              }}
              className={`px-4 py-2 rounded-lg ${
                currentRole === 'professor'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Professor View
            </button>
            {/* Logout Button - Clears authentication and returns to login */}
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

      {/* Main Content Area - Conditionally renders views based on role and current view */}
      
      {/* Student Dashboard View */}
      {currentRole === 'student' && currentView === 'dashboard' && (
        <Dashboard
          onNavigateToSubmission={() => setCurrentView('submission')}
          onNavigateToReview={() => setCurrentView('review')}
          onNavigateToFeedback={handleNavigateToFeedback}
        />
      )}

      {/* Student Submission Flow View */}
      {currentRole === 'student' && currentView === 'submission' && (
        <SubmissionFlow onBack={() => setCurrentView('dashboard')} />
      )}

      {/* Student Review Flow View */}
      {currentRole === 'student' && currentView === 'review' && (
        <ReviewFlow onBack={() => setCurrentView('dashboard')} />
      )}

      {/* Student Feedback View - Shows feedback for selected submission */}
      {currentRole === 'student' && currentView === 'feedback' && (
        <SubmissionFeedback 
          onBack={() => setCurrentView('dashboard')}
          submissionTitle={selectedSubmission}
        />
      )}

      {/* Professor View - Only accessible when role is professor */}
      {currentRole === 'professor' && (
        <ProfessorView />
      )}
    </div>
  );
}