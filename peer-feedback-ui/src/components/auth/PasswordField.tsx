import { Eye, EyeOff, Lock } from "lucide-react";

export function PasswordField({
  value,
  onChange,
  show,
  onToggle,
  label = "Password",
  error,
  showToggle = true,
}: {
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  label?: string;
  error?: string;
  showToggle?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      <div className="relative">
        <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />

        <input
          type={show ? "text" : "password"}
          placeholder="••••••••"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full pl-10 ${showToggle ? "pr-12" : "pr-4"} py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error ? "border-red-300" : "border-gray-300"
          }`}
          required
        />

        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>

      {error ? <p className="text-sm text-red-600 mt-1">{error}</p> : null}
    </div>
  );
}
