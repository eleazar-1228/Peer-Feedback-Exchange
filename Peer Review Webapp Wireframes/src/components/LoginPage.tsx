import { useState } from 'react';
import { BookOpen, Mail, Lock, User, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { startSignupOtp, loginWithPassword, setPassword as setUserPassword } from "../services/auth";
import { supabase } from "../lib/supabaseClient";
import { verifyEmailOtp } from '../services/auth';
import { env } from "../lib/env";


/**
 * Props for the LoginPage component
 */
interface LoginPageProps {
  /** Callback function called when user successfully logs in */
  onLogin: (role: 'student' | 'professor') => void;
}

/**
 * LoginPage Component
 * 
 * Handles user authentication including:
 * - Login and signup modes
 * - Email verification for signup
 * - Social login (Google/GitHub) with @bu.edu validation
 * - Form validation and error handling
 * 
 * Only accepts @bu.edu email addresses for authentication
 */
export function LoginPage({ onLogin }: LoginPageProps) {
  // Current mode: login, signup, or email verification
  const [mode, setMode] = useState<'login' | 'signup' | 'verify'>('login');
  
  // Toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  
  // User password component
  const [password, setPassword] = useState("");

  // User type selection (student or professor)
  const [userType, setUserType] = useState<'student' | 'professor'>('student');
  
  // Email input value
  const [email, setEmail] = useState('');
  
  // Email validation error message
  const [emailError, setEmailError] = useState('');
  
  // Verification code input for email verification
  const [verificationCode, setVerificationCode] = useState('');
  
  // Error message for social login attempts
  const [socialLoginError, setSocialLoginError] = useState('');

  // User Login Credential components
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [studentId, setStudentId] = useState("");


  /**
   * Validates email address to ensure it ends with @bu.edu
   * @param emailValue - The email address to validate
   * @returns true if valid, false otherwise
   */
  const validateEmail = (emailValue: string) => {
    if (!emailValue.endsWith('@bu.edu')) {
      setEmailError('Only @bu.edu email addresses are allowed');
      return false;
    }
    setEmailError('');
    return true;
    
  };

  /**
   * Handles email input changes and validates in real-time
   * @param e - Change event from email input
   */
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    // Validate email if user has entered something
    if (value) {
      validateEmail(value);
    } else {
      // Clear error if field is empty
      setEmailError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) return;

    if (mode === "signup") {
      const { error } = await startSignupOtp(email);

      if (error) {
        setSocialLoginError(error.message);
        return;
      }

      setMode("verify");
      return;
    }

    if (mode === "login") {
      const { error } = await loginWithPassword(email, password);

      if (error) {
        setSocialLoginError(error.message);
        return;
      }

      onLogin(userType);
    }
  };



  /**
   * Handles email verification code submission
   * @param e - Form submit event
   */
  const handleVerification = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    
    console.log("VERIFY CLICKED", { email, verificationCode, password });

    const { data, error } = await verifyEmailOtp(email, verificationCode);

    if (!data?.session || !data?.user) {
      setSocialLoginError("OTP verified, but no session/user returned. Check verifyOtp type.");
      return;
    }
    console.log("VERIFY RESULT", { data, error });


    if (error) {
      setSocialLoginError(error.message);
      return;
    }

    const { error: pwErr } = await setUserPassword(password);

    if (pwErr) {
      setSocialLoginError(pwErr.message);
      return;
    }


    const user = data.user;
    if (!user) {
      setSocialLoginError("Verification failed");
      return;
    }

    console.log({ firstName, lastName, studentId, email });
    // 🔥 INSERT PROFILE INTO DATABASE
    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      role: userType,
      first_name: firstName,     // ← replace with your state names
      last_name: lastName,       // ← replace with your state names
      student_id: studentId,     // ← replace with your state names
    });

    if (profileError) {
      setSocialLoginError(profileError.message);
      return;
    }

    // success → go dashboard
    onLogin(userType);
  };

  // Render email verification screen if in verify mode
  if (mode === 'verify') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            {/* Email Icon */}
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">
              Verify Your Email
            </h2>
            <p className="text-gray-600 text-center mb-6">
              We've sent a verification link to <span className="font-medium text-gray-900">{email}</span>
            </p>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Check your email</p>
                  <p className="text-blue-800">
                    Click the verification link in the email to activate your account. 
                    The link will expire in 24 hours.
                  </p>
                </div>
              </div>
            </div>

            {/* Verification Code Input Form */}
            <form onSubmit={handleVerification} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or enter verification code manually
                </label>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest font-mono"
                  maxLength={6}
                />
              </div>

              {/* Submit Verification Button */}
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-medium"
              >
                Verify & Continue
              </button>
            </form>

            {/* Resend Verification Email Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-2">
                Didn't receive the email?
              </p>
              <button
                type="button"
                onClick={() => {
                  // In production, would trigger resend email API call
                  alert('Verification email resent!');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Resend verification email
              </button>
            </div>

            {/* Back to Login Navigation */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <button
                onClick={() => setMode('login')}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back to login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Login/Signup Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12">
          {/* Logo and Branding */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">PeerReview</h1>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Collaborative Learning Through Peer Feedback
            </h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              A comprehensive platform for students and professors to manage peer reviews,
              provide constructive feedback, and enhance learning outcomes.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Submit Work</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full">
                <User className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Review Peers</span>
              </div>
              <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
                <Mail className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Track Progress</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 mb-8"></div>

          {/* Mode Toggle */}
          <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-lg max-w-md mx-auto">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 px-4 rounded-md transition-all ${
                mode === 'login'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 px-4 rounded-md transition-all ${
                mode === 'signup'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              {mode === 'login' ? 'Welcome back!' : 'Create an account'}
            </h3>
            <p className="text-gray-600">
              {mode === 'login'
                ? 'Enter your credentials to access your account'
                : 'Sign up to start your peer review journey'}
            </p>
          </div>

          {/* Main Login/Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-5 max-w-md mx-auto">
            {/* User Type Selection - Student or Professor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Student Selection Button */}
                <button
                  type="button"
                  onClick={() => setUserType('student')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    userType === 'student'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <User className={`w-6 h-6 mx-auto mb-2 ${userType === 'student' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <p className={`text-sm font-medium ${userType === 'student' ? 'text-blue-900' : 'text-gray-700'}`}>
                    Student
                  </p>
                </button>

                {/* Professor Selection Button */}
                <button
                  type="button"
                  onClick={() => setUserType('professor')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    userType === 'professor'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <BookOpen className={`w-6 h-6 mx-auto mb-2 ${userType === 'professor' ? 'text-purple-600' : 'text-gray-400'}`} />
                  <p className={`text-sm font-medium ${userType === 'professor' ? 'text-purple-900' : 'text-gray-700'}`}>
                    Professor
                  </p>
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>
            )}

            {/* Student/Employee ID Input - Only shown during signup */}
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="you@bu.edu"
                  value={email}
                  onChange={handleEmailChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    emailError ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                />
              </div>
              {emailError && (
                <div className="flex items-center gap-1 mt-1">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-500">{emailError}</p>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Only Boston University (@bu.edu) email addresses are accepted
              </p>
            </div>

            {/* Password Input with Show/Hide Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                {/* Toggle Password Visibility Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Input - Only shown during signup */}
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            )}

            {/* Remember Me / Forgot Password */}
            {mode === 'login' && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <button type="button" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Forgot password?
                </button>
              </div>
            )}

            {/* Terms (Signup only) */}
            {mode === 'signup' && (
              <div className="flex items-start">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                  required
                />
                <label className="ml-2 text-sm text-gray-600">
                  I agree to the{' '}
                  <button type="button" className="text-blue-600 hover:text-blue-700 font-medium">
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button type="button" className="text-blue-600 hover:text-blue-700 font-medium">
                    Privacy Policy
                  </button>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-medium"
            >
              {mode === 'login' ? 'Log In' : 'Create Account'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
}