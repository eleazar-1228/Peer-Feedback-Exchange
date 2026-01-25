import { Mail, AlertCircle } from "lucide-react";

export function EmailField({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  error: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Email Address <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        <input
          type="email"
          placeholder="you@bu.edu"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error ? "border-red-300" : "border-gray-300"
          }`}
          required
        />
      </div>

      {error && (
        <div className="flex items-center gap-1 mt-1">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-1">
        Only Boston University (@bu.edu) email addresses are accepted
      </p>
    </div>
  );
}
