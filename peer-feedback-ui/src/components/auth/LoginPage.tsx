import React, { useState } from "react";
import { BookOpen, Mail, User } from "lucide-react";
import type { AuthMode, UserRole } from "./types";
import { AuthShell } from "./AuthShell";
import { AuthTabs } from "./AuthTabs";
import { RoleSelector } from "./RoleSelector";
import { EmailField } from "./EmailField";
import { PasswordField } from "./PasswordField";
import { SignupExtras } from "./SignupExtras";
import { SocialButtons } from "./SocialButtons";
import { Notice } from "./Notice";
import { VerifyEmail } from "./VerifyEmail";

interface LoginPageProps {
  onLogin: (role: UserRole) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<UserRole>("student");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [socialLoginError, setSocialLoginError] = useState("");

  // NEW: controlled form fields
  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // NEW: field-level errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});


  const validateEmail = (emailValue: string) => {
    if (!emailValue.endsWith("@bu.edu")) {
      setEmailError("Only @bu.edu email addresses are allowed");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value) validateEmail(value);
    else setEmailError("");
  };

  const handleSocialLogin = (provider: "google" | "github") => {
    setSocialLoginError(
      `Please sign in with your Boston University (@bu.edu) ${
        provider === "google" ? "Google" : "GitHub"
      } account. Other email addresses are not permitted.`
    );
    setTimeout(() => setSocialLoginError(""), 5000);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Email rules
    if (!email) errors.email = "Email is required";
    else if (!email.endsWith("@bu.edu"))
      errors.email = "Only @bu.edu email addresses are allowed";

    // Password rules
    if (!password) errors.password = "Password is required";

    // Signup-only rules
    if (mode === "signup") {
      if (!fullName.trim()) errors.fullName = "Full name is required";
      if (!idNumber.trim())
        errors.idNumber =
          userType === "student"
            ? "Student ID is required"
            : "Employee ID is required";

      if (password.length < 8)
        errors.password = "Password must be at least 8 characters";

      if (!confirmPassword)
        errors.confirmPassword = "Please confirm your password";
      else if (password !== confirmPassword)
        errors.confirmPassword = "Passwords do not match";

      if (!acceptedTerms) errors.terms = "You must accept the terms to continue";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (mode === "signup") setMode("verify");
    if (mode === "login") onLogin(userType);
  };

  const handleVerification = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(userType);
  };

  if (mode === "verify") {
    return (
      <VerifyEmail
        email={email}
        verificationCode={verificationCode}
        setVerificationCode={setVerificationCode}
        onVerify={handleVerification}
        onBackToLogin={() => setMode("login")}
      />
    );
  }

  return (
    <AuthShell>
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12">
          {/* Logo + Branding */}
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
              A comprehensive platform for students and professors to manage peer
              reviews, provide constructive feedback, and enhance learning
              outcomes.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Pill icon={<BookOpen className="w-4 h-4 text-blue-600" />} text="Submit Work" bg="bg-blue-50" textColor="text-blue-900" />
              <Pill icon={<User className="w-4 h-4 text-purple-600" />} text="Review Peers" bg="bg-purple-50" textColor="text-purple-900" />
              <Pill icon={<Mail className="w-4 h-4 text-green-600" />} text="Track Progress" bg="bg-green-50" textColor="text-green-900" />
            </div>
          </div>

          <div className="border-t border-gray-200 mb-8" />

          <AuthTabs mode={mode} onChange={(m) => setMode(m)} />

          <div className="text-center mb-6">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              {mode === "login" ? "Welcome back!" : "Create an account"}
            </h3>
            <p className="text-gray-600">
              {mode === "login"
                ? "Enter your credentials to access your account"
                : "Sign up to start your peer review journey"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 max-w-md mx-auto">
            <RoleSelector role={userType} onChange={setUserType} />

            {mode === "signup" && (
              <SignupExtras
                role={userType}
                fullName={fullName}
                setFullName={setFullName}
                idNumber={idNumber}
                setIdNumber={setIdNumber}
                acceptedTerms={acceptedTerms}
                setAcceptedTerms={setAcceptedTerms}
                errors={{
                  fullName: fieldErrors.fullName,
                  idNumber: fieldErrors.idNumber,
                  terms: fieldErrors.terms,
                }}
              />
            )}

            <EmailField
              value={email}
              onChange={handleEmailChange}
              error={fieldErrors.email ?? emailError}
            />

            <PasswordField
              value={password}
              onChange={setPassword}
              show={showPassword}
              onToggle={() => setShowPassword((s) => !s)}
              error={fieldErrors.password}
            />
            {mode === "signup" && (
              <PasswordField
                value={confirmPassword}
                onChange={setConfirmPassword}
                show={showPassword}
                onToggle={() => setShowPassword((s) => !s)}
                label="Confirm Password"
                error={fieldErrors.confirmPassword}
                showToggle={false}
              />
            )}


            {mode === "login" && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-medium"
            >
              {mode === "login" ? "Log In" : "Create Account"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <SocialButtons
            onGoogle={() => handleSocialLogin("google")}
            onGithub={() => handleSocialLogin("github")}
          />

          {socialLoginError && (
            <div className="mt-4">
              <Notice variant="error">{socialLoginError}</Notice>
            </div>
          )}

          <div className="mt-4">
            <Notice variant="info">
              Social login accounts must be associated with a @bu.edu email
              address
            </Notice>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </AuthShell>
  );
}

function Pill({
  icon,
  text,
  bg,
  textColor,
}: {
  icon: React.ReactNode;
  text: string;
  bg: string;
  textColor: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${bg} px-4 py-2 rounded-full`}>
      {icon}
      <span className={`text-sm font-medium ${textColor}`}>{text}</span>
    </div>
  );
}
