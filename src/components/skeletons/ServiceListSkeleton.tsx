"use client";

export function ServiceListSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-6">
        <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex gap-4">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-28"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        </div>

        {/* Table Rows */}
        {[...Array(10)].map((_, index) => (
          <div
            key={index}
            className="px-6 py-4 border-b border-gray-100 flex items-center gap-4"
          >
            {/* Avatar */}
            <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>

            {/* Name */}
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>

            {/* Status Badge */}
            <div className="h-6 bg-gray-200 rounded-full w-24"></div>

            {/* Date */}
            <div className="h-4 bg-gray-200 rounded w-28"></div>

            {/* Action Button */}
            <div className="h-9 bg-gray-200 rounded-lg w-28"></div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="mt-4 flex justify-between items-center">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="flex gap-2">
          <div className="h-8 bg-gray-200 rounded w-8"></div>
          <div className="h-8 bg-gray-200 rounded w-8"></div>
          <div className="h-8 bg-gray-200 rounded w-8"></div>
        </div>
      </div>
    </div>
  );
}
