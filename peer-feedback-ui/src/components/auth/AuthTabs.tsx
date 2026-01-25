import type { AuthMode } from "./types";

export function AuthTabs({
  mode,
  onChange,
}: {
  mode: AuthMode;
  onChange: (mode: Exclude<AuthMode, "verify">) => void;
}) {
  return (
    <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-lg max-w-md mx-auto">
      <button
        type="button"
        onClick={() => onChange("login")}
        className={`flex-1 py-2 px-4 rounded-md transition-all ${
          mode === "login"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        Log In
      </button>
      <button
        type="button"
        onClick={() => onChange("signup")}
        className={`flex-1 py-2 px-4 rounded-md transition-all ${
          mode === "signup"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        Sign Up
      </button>
    </div>
  );
}
