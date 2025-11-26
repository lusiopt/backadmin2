"use client";

import { ServiceStatus } from "@/lib/types";
import { getStatusColor } from "@/lib/utils";

interface StatusBadgeProps {
  status: ServiceStatus | string | null;
  className?: string;
}

const colorClasses = {
  blue: "bg-blue-100 text-blue-800 border-blue-200",
  yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
  green: "bg-green-100 text-green-800 border-green-200",
  red: "bg-red-100 text-red-800 border-red-200",
  orange: "bg-orange-100 text-orange-800 border-orange-200",
  purple: "bg-purple-100 text-purple-800 border-purple-200",
  indigo: "bg-indigo-100 text-indigo-800 border-indigo-200",
  cyan: "bg-cyan-100 text-cyan-800 border-cyan-200",
  teal: "bg-teal-100 text-teal-800 border-teal-200",
  violet: "bg-violet-100 text-violet-800 border-violet-200",
  gray: "bg-gray-100 text-gray-800 border-gray-200",
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  if (!status) {
    return (
      <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${colorClasses.gray} ${className}`}>
        Sem Status
      </span>
    );
  }

  const color = getStatusColor(status);
  const colorClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.gray;

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${colorClass} ${className}`}>
      {status}
    </span>
  );
}
