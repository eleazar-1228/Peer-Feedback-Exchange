import { BookOpen, User } from "lucide-react";
import type { UserRole } from "./types";

export function RoleSelector({
  role,
  onChange,
}: {
  role: UserRole;
  onChange: (role: UserRole) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        I am a...
      </label>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange("student")}
          className={`p-4 border-2 rounded-lg transition-all ${
            role === "student"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <User
            className={`w-6 h-6 mx-auto mb-2 ${
              role === "student" ? "text-blue-600" : "text-gray-400"
            }`}
          />
          <p
            className={`text-sm font-medium ${
              role === "student" ? "text-blue-900" : "text-gray-700"
            }`}
          >
            Student
          </p>
        </button>

        <button
          type="button"
          onClick={() => onChange("professor")}
          className={`p-4 border-2 rounded-lg transition-all ${
            role === "professor"
              ? "border-purple-600 bg-purple-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <BookOpen
            className={`w-6 h-6 mx-auto mb-2 ${
              role === "professor" ? "text-purple-600" : "text-gray-400"
            }`}
          />
          <p
            className={`text-sm font-medium ${
              role === "professor" ? "text-purple-900" : "text-gray-700"
            }`}
          >
            Professor
          </p>
        </button>
      </div>
    </div>
  );
}
