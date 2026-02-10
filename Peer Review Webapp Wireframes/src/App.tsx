import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { SubmissionFlow } from './components/SubmissionFlow';
import { ReviewFlow } from './components/ReviewFlow';
import { ProfessorView } from './components/ProfessorView';
import { SubmissionFeedback } from './components/SubmissionFeedback';
import { LogOut } from 'lucide-react';
import { supabase } from "./lib/supabaseClient";
import { useEffect } from "react";

type UserRole = 'student' | 'professor';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const [selectedSubmission, setSelectedSubmission] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();

  // Persist login: check session on load and listen for auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setIsLoggedIn(true);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = (role: UserRole) => {
    setCurrentRole(role);
    setIsLoggedIn(true);
    navigate(role === 'professor' ? '/professor' : '/students');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
  };

  const handleNavigateToFeedback = (submissionTitle: string) => {
    setSelectedSubmission(submissionTitle);
    navigate('/students/feedback', { state: { submissionTitle } });
  };

  // Not logged in: only allow /login, otherwise redirect to login
  if (!isLoggedIn) {
    if (location.pathname === '/login') {
      return <LoginPage onLogin={handleLogin} />;
    }
    return <Navigate to="/login" replace />;
  }

  // Logged in on /login: redirect to role-specific home
  if (location.pathname === '/login') {
    return <Navigate to={currentRole === 'professor' ? '/professor' : '/students'} replace />;
  }

  // Student routes: require student role
  if (location.pathname.startsWith('/students')) {
    if (currentRole !== 'student') {
      return <Navigate to="/professor" replace />;
    }
  }

  // Professor route: require professor role
  if (location.pathname.startsWith('/professor')) {
    if (currentRole !== 'professor') {
      return <Navigate to="/students" replace />;
    }
  }

  const submissionTitleFromState = (location.state as { submissionTitle?: string } | null)?.submissionTitle ?? selectedSubmission;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Role Switcher for Demo */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Peer Review Platform</h1>
          <div className="flex gap-2 items-center">
            {currentRole === 'student' && (
              <button
                onClick={() => navigate('/students')}
                className={`px-4 py-2 rounded-lg ${location.pathname === '/students' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Student View
              </button>
            )}
            {currentRole === 'professor' && (
              <button
                onClick={() => navigate('/professor')}
                className={`px-4 py-2 rounded-lg ${location.pathname.startsWith('/professor') ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Professor View
              </button>
            )}
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

      <Routes>
        <Route
          path="/students"
          element={
            <Dashboard
              onNavigateToSubmission={() => navigate('/students/submit')}
              onNavigateToReview={() => navigate('/students/review')}
              onNavigateToFeedback={handleNavigateToFeedback}
            />
          }
        />
        <Route path="/students/submit" element={<SubmissionFlow onBack={() => navigate('/students')} />} />
        <Route path="/students/review" element={<ReviewFlow onBack={() => navigate('/students')} />} />
        <Route
          path="/students/feedback"
          element={
            <SubmissionFeedback
              onBack={() => navigate('/students')}
              submissionTitle={submissionTitleFromState || 'Submission'}
            />
          }
        />
        <Route path="/professor" element={<ProfessorView />} />
        <Route path="/" element={<Navigate to={currentRole === 'professor' ? '/professor' : '/students'} replace />} />
        <Route path="*" element={<Navigate to={currentRole === 'professor' ? '/professor' : '/students'} replace />} />
      </Routes>
    </div>
  );
}
