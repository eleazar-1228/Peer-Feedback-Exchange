import { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { SubmissionFlow } from './components/SubmissionFlow';
import { ReviewFlow } from './components/ReviewFlow';
import { ProfessorView } from './components/ProfessorView';
import { SubmissionFeedback } from './components/SubmissionFeedback';
import { LogOut } from 'lucide-react';

type UserRole = 'student' | 'professor';
type View = 'dashboard' | 'submission' | 'review' | 'professor' | 'feedback';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedSubmission, setSelectedSubmission] = useState<string>('');

  const handleLogin = (role: UserRole) => {
    setCurrentRole(role);
    setIsLoggedIn(true);
    setCurrentView(role === 'professor' ? 'professor' : 'dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView('dashboard');
  };

  const handleNavigateToFeedback = (submissionTitle: string) => {
    setSelectedSubmission(submissionTitle);
    setCurrentView('feedback');
  };

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Role Switcher for Demo */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Peer Review Platform</h1>
          <div className="flex gap-2 items-center">
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

      {/* Main Content */}
      {currentRole === 'student' && currentView === 'dashboard' && (
        <Dashboard
          onNavigateToSubmission={() => setCurrentView('submission')}
          onNavigateToReview={() => setCurrentView('review')}
          onNavigateToFeedback={handleNavigateToFeedback}
        />
      )}

      {currentRole === 'student' && currentView === 'submission' && (
        <SubmissionFlow onBack={() => setCurrentView('dashboard')} />
      )}

      {currentRole === 'student' && currentView === 'review' && (
        <ReviewFlow onBack={() => setCurrentView('dashboard')} />
      )}

      {currentRole === 'student' && currentView === 'feedback' && (
        <SubmissionFeedback 
          onBack={() => setCurrentView('dashboard')}
          submissionTitle={selectedSubmission}
        />
      )}

      {currentRole === 'professor' && (
        <ProfessorView />
      )}
    </div>
  );
}