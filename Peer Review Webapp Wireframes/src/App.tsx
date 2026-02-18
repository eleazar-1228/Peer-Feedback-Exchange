import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { SubmissionFlow } from './components/SubmissionFlow';
import { ReviewFlow } from './components/ReviewFlow';
import { ProfessorView } from './components/ProfessorView';
import { SubmissionFeedback } from './components/SubmissionFeedback';
import { AccountSettings } from './components/AccountSettings';
import { LogOut, Settings } from 'lucide-react';
import { supabase } from "./lib/supabaseClient";
import { useEffect, useMemo, useRef} from "react";

type UserRole = 'student' | 'professor';

export default function App() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();

  const didInitRef = useRef(false);


  // Persist login: check session on load and listen for auth changes
  useEffect(() => {
    // ✅ prevents StrictMode double-run in dev
    if (didInitRef.current) return;
    didInitRef.current = true;

    let unsub: { subscription: { unsubscribe: () => void } } | null = null;
    let mounted = true;

    async function init() {
      try {
        const { data } = await supabase.auth.getSession();
        const hasSession = !!data.session;

        if (!mounted) return;

        setIsLoggedIn(hasSession);

        if (hasSession) {
          await loadRoleFromProfile();
        }

        const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state change:', event, 'has session:', !!session);
          const loggedIn = !!session;
          
          // Only reload role on actual auth changes, not token refreshes
          if (event === 'SIGNED_IN') {
            console.log('SIGNED_IN event - loading role');
            setIsLoggedIn(true);
            await loadRoleFromProfile();
          } else if (event === 'SIGNED_OUT') {
            console.log('SIGNED_OUT event');
            setIsLoggedIn(false);
            setCurrentRole(null);
          } else if (event === 'TOKEN_REFRESHED') {
            // Session refreshed, but we're already logged in - do nothing
            console.log('TOKEN_REFRESHED event - maintaining current state');
          } else if (event === 'INITIAL_SESSION') {
            // Initial session check - do nothing, already handled above
            console.log('INITIAL_SESSION event - skipping');
          } else {
            // For other events, just update login state
            console.log('Other auth event:', event);
            setIsLoggedIn(loggedIn);
          }
        });

        unsub = sub;
      } catch (e) {
        console.error("Session init failed:", e);
      } finally {
        if (mounted) setSessionChecked(true);
      }
    }

    init();

    return () => {
      mounted = false;
      unsub?.subscription.unsubscribe();
    };
  }, []);






  async function loadRoleFromProfile() {
    setRoleLoading(true);
    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      console.log("loadRoleFromProfile - user:", user?.id, "error:", userErr);
      
      if (userErr || !user) {
        console.log("No user found, setting role to null");
        setCurrentRole(null);
        return;
      }

      const { data: profile, error: profErr } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      console.log("loadRoleFromProfile - profile:", profile, "error:", profErr);

      if (profErr) {
        console.error("Profile fetch error:", profErr);
        setCurrentRole("student"); // safe fallback
        return;
      }

      if (!profile?.role) {
        console.warn("No profile found for user, using fallback role");
        setCurrentRole("student"); // safe fallback
        return;
      }

      console.log("Setting role to:", profile.role);
      setCurrentRole(profile.role as UserRole);
    } catch (e) {
      console.error("loadRoleFromProfile failed:", e);
      setCurrentRole("student"); // safe fallback
    } finally {
      setRoleLoading(false);
    }
  }


  const handleLogin = async (_roleFromUI: UserRole) => {
    // role is now sourced from profiles, not the UI
    setIsLoggedIn(true);
    await loadRoleFromProfile();

    navigate(currentRole === "professor" ? "/professor" : "/students");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
  };

  const handleNavigateToFeedback = (submissionTitle: string) => {
    setSelectedSubmission(submissionTitle);
    navigate('/students/feedback', { state: { submissionTitle } });
  };

  const isAuthRoute = location.pathname === "/login";

  // Wait until we've checked session once
  if (!sessionChecked) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Loading…</div>;
  }

  // Not logged in: always go to login except /login itself
  if (!isLoggedIn && !isAuthRoute) {
    return <Navigate to="/login" replace />;
  }

  if (!isLoggedIn && isAuthRoute) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Logged in but role not loaded yet
  if (isLoggedIn && (roleLoading || !currentRole) && !isAuthRoute) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", fontFamily: "sans-serif" }}>
        <p style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>
          To see the latest updates, please refresh the page.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "0.75rem 1.5rem",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "500"
          }}
        >
          Refresh Page
        </button>
      </div>
    );
  }

  // Logged in and on /login → redirect away
  if (isLoggedIn && isAuthRoute) {
    return <Navigate to={currentRole === "professor" ? "/professor" : "/students"} replace />;
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

  function RequireRole({
    allowed,
    children,
  }: {
    allowed: UserRole[];
    children: React.ReactNode;
  }) {
    if (!currentRole) return null;
    if (!allowed.includes(currentRole)) {
      return <Navigate to={currentRole === "professor" ? "/professor" : "/students"} replace />;
    }
    return <>{children}</>;
  }

  const submissionTitleFromState = (location.state as { submissionTitle?: string } | null)?.submissionTitle ?? selectedSubmission;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Role Switcher for Demo */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Peer Feedback Exchange Platform</h1>
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
              onClick={() => navigate('/settings')}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
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

      <Routes>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />

        <Route
          path="/students"
          element={
            <RequireRole allowed={["student"]}>
              <Dashboard
                onNavigateToSubmission={() => navigate("/students/submit")}
                onNavigateToReview={() => navigate("/students/review")}
                onNavigateToFeedback={handleNavigateToFeedback}
              />
            </RequireRole>
          }
        />

        <Route
          path="/students/submit"
          element={
            <RequireRole allowed={["student"]}>
              <SubmissionFlow onBack={() => navigate("/students")} />
            </RequireRole>
          }
        />

        <Route
          path="/students/review"
          element={
            <RequireRole allowed={["student"]}>
              <ReviewFlow onBack={() => navigate("/students")} />
            </RequireRole>
          }
        />

        <Route
          path="/students/feedback"
          element={
            <RequireRole allowed={["student"]}>
              <SubmissionFeedback
                onBack={() => navigate("/students")}
                submissionTitle={submissionTitleFromState || "Submission"}
              />
            </RequireRole>
          }
        />

        <Route
          path="/settings"
          element={
            <RequireRole allowed={["student", "professor"]}>
              <AccountSettings onBack={() => navigate(currentRole === "professor" ? "/professor" : "/students")} />
            </RequireRole>
          }
        />

        <Route
          path="/professor"
          element={
            <RequireRole allowed={["professor"]}>
              <ProfessorView />
            </RequireRole>
          }
        />

        <Route path="/" element={<Navigate to={currentRole === "professor" ? "/professor" : "/students"} replace />} />
        <Route path="*" element={<Navigate to={currentRole === "professor" ? "/professor" : "/students"} replace />} />
      </Routes>

    </div>
  );
}
