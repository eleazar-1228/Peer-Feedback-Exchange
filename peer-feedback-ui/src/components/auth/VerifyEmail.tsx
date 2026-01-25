import { Mail } from "lucide-react";
import { AuthShell } from "./AuthShell";
import { Notice } from "./Notice";

export function VerifyEmail({
  email,
  verificationCode,
  setVerificationCode,
  onVerify,
  onBackToLogin,
}: {
  email: string;
  verificationCode: string;
  setVerificationCode: (v: string) => void;
  onVerify: (e: React.FormEvent) => void;
  onBackToLogin: () => void;
}) {
  return (
    <AuthShell>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">
            Verify Your Email
          </h2>

          <p className="text-gray-600 text-center mb-6">
            We&apos;ve sent a verification link to{" "}
            <span className="font-medium text-gray-900">{email}</span>
          </p>

          <Notice variant="info">
            <p className="font-medium mb-1">Check your email</p>
            <p>
              Click the verification link in the email to activate your account.
              The link will expire in 24 hours.
            </p>
          </Notice>

          <form onSubmit={onVerify} className="space-y-5 mt-6">
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

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-medium"
            >
              Verify &amp; Continue
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Didn&apos;t receive the email?
            </p>
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Resend verification email
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <button
              onClick={onBackToLogin}
              className="text-sm text-gray-600 hover:text-gray-900"
              type="button"
            >
              ← Back to login
            </button>
          </div>
        </div>
      </div>
    </AuthShell>
  );
}
