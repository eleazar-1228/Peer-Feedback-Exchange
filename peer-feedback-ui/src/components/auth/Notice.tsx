import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

type Variant = "info" | "error";

export function Notice({
  variant = "info",
  children,
}: {
  variant?: Variant;
  children: ReactNode;
}) {
  const styles =
    variant === "error"
      ? "bg-red-50 border-red-200 text-red-700"
      : "bg-blue-50 border-blue-200 text-blue-800";

  const iconColor = variant === "error" ? "text-red-500" : "text-blue-600";

  return (
    <div className={`border rounded-lg p-3 ${styles}`}>
      <div className="flex gap-2">
        <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}
