import { User } from "lucide-react";
import type { UserRole } from "./types";
import { TextField } from "./TextField";

export function SignupExtras({
  role,
  fullName,
  setFullName,
  idNumber,
  setIdNumber,
  acceptedTerms,
  setAcceptedTerms,
  errors,
}: {
  role: UserRole;
  fullName: string;
  setFullName: (v: string) => void;
  idNumber: string;
  setIdNumber: (v: string) => void;
  acceptedTerms: boolean;
  setAcceptedTerms: (v: boolean) => void;
  errors: Partial<Record<"fullName" | "idNumber" | "terms", string>>;
}) {
  return (
    <>
      <TextField
        label="Full Name"
        value={fullName}
        onChange={setFullName}
        placeholder="John Doe"
        leftIcon={<User className="w-5 h-5" />}
        error={errors.fullName}
        required
      />

      <TextField
        label={role === "student" ? "Student ID" : "Employee ID"}
        value={idNumber}
        onChange={setIdNumber}
        placeholder={role === "student" ? "e.g., A234" : "e.g., EMP001"}
        error={errors.idNumber}
        required
      />

      <div className="flex items-start">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
        />
        <label className="ml-2 text-sm text-gray-600">
          I agree to the{" "}
          <button type="button" className="text-blue-600 hover:text-blue-700 font-medium">
            Terms of Service
          </button>{" "}
          and{" "}
          <button type="button" className="text-blue-600 hover:text-blue-700 font-medium">
            Privacy Policy
          </button>
        </label>
      </div>

      {errors.terms ? <p className="text-sm text-red-600 -mt-3">{errors.terms}</p> : null}
    </>
  );
}
