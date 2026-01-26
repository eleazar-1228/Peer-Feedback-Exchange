import { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import type { UserRole } from "./components/auth/types";
import { LoginPage } from "./components/auth/LoginPage";
import { StudentDashboard } from "./components/student/Dashboard";

function RequireAuth({
  isLoggedIn,
  children,
}: {
  isLoggedIn: boolean;
  children: JSX.Element;
}) {
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
}

function LoginRoute({
  onLogin,
}: {
  onLogin: (role: UserRole) => void;
}) {
  // This wrapper exists so we can use useNavigate (hooks must be inside a component)
  const navigate = useNavigate();

  return (
    <LoginPage
      onLogin={(role) => {
        onLogin(role);
        navigate(role === "professor" ? "/professor" : "/dashboard");
      }}
    />
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-6 border">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Student Dashboard</h1>
          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            Logout
          </button>
        </div>
        <p className="mt-4 text-gray-600">
          Placeholder page. Next we’ll build your real dashboard UI.
        </p>
      </div>
    </div>
  );
}

function ProfessorView({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-6 border">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Professor View</h1>
          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            Logout
          </button>
        </div>
        <p className="mt-4 text-gray-600">
          Placeholder page. Next we’ll build professor tools (assignments, rubrics, analytics).
        </p>
      </div>
    </div>
  );
}


function StudentDashboardRoute({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* simple top bar */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Peer Review Platform</h1>
          <button
            onClick={() => {
              onLogout();
              navigate("/login");
            }}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Logout
          </button>
        </div>
      </div>

      <StudentDashboard
        onNavigateToSubmission={() => navigate("/submission")}
        onNavigateToReview={() => navigate("/review")}
        onNavigateToFeedback={(title) =>
          navigate(`/feedback/${encodeURIComponent(title)}`)
        }
      />
    </div>
  );
}



export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<UserRole>("student");

  const handleLogin = (r: UserRole) => {
    setRole(r);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <Routes>
      {/* Default route */}
      <Route
        path="/"
        element={
          isLoggedIn ? (
            <Navigate to={role === "professor" ? "/professor" : "/dashboard"} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Public */}
      <Route path="/login" element={<LoginRoute onLogin={handleLogin} />} />

      {/* Protected */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth isLoggedIn={isLoggedIn}>
            <StudentDashboardRoute onLogout={handleLogout} />
          </RequireAuth>
        }
      />

      <Route
        path="/submission"
        element={
          <RequireAuth isLoggedIn={isLoggedIn}>
            <div className="min-h-screen bg-gray-50 p-8">Submission page coming next.</div>
          </RequireAuth>
        }
      />

      <Route
        path="/review"
        element={
          <RequireAuth isLoggedIn={isLoggedIn}>
            <div className="min-h-screen bg-gray-50 p-8">Review flow coming next.</div>
          </RequireAuth>
        }
      />

      <Route
        path="/feedback/:title"
        element={
          <RequireAuth isLoggedIn={isLoggedIn}>
            <div className="min-h-screen bg-gray-50 p-8">Feedback page coming next.</div>
          </RequireAuth>
        }
      />


      <Route
        path="/professor"
        element={
          <RequireAuth isLoggedIn={isLoggedIn}>
            <ProfessorView onLogout={handleLogout} />
          </RequireAuth>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
