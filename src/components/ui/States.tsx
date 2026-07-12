import React from "react";

interface LoadingProps {
  message?: string;
}

interface EmptyProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onActionClick?: () => void;
}

interface ErrorProps {
  message?: string;
  onRetry?: () => void;
}

export const States = {
  LoadingState: ({ message = "Loading content data..." }: LoadingProps) => (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-burgundy mb-4"></div>
      <p className="text-sm text-gray-500 font-medium font-body">{message}</p>
    </div>
  ),

  EmptyState: ({
    title = "No records found",
    description = "There is currently no data in this module section.",
    actionLabel,
    onActionClick,
  }: EmptyProps) => (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white border border-dashed border-border rounded-lg shadow-sm">
      <div className="w-12 h-12 text-gold mb-4 flex items-center justify-center rounded-full bg-sand">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
          />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-navy uppercase mb-1 tracking-wider">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6 font-body">{description}</p>
      {actionLabel && onActionClick && (
        <button
          onClick={onActionClick}
          className="bg-burgundy hover:bg-burgundy-deep text-white font-medium text-xs py-2 px-4 rounded transition-colors shadow"
        >
          {actionLabel}
        </button>
      )}
    </div>
  ),

  ErrorState: ({
    message = "Failed to load requested page content.",
    onRetry,
  }: ErrorProps) => (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-red-50 border border-red-100 rounded-lg">
      <div className="w-12 h-12 text-red-600 mb-4 flex items-center justify-center rounded-full bg-red-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
          />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-red-800 uppercase mb-1 tracking-wider">Error Occurred</h3>
      <p className="text-sm text-red-700 max-w-sm mb-6 font-body">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-red-800 hover:bg-red-900 text-white font-medium text-xs py-2 px-4 rounded transition-colors shadow"
        >
          Try Again
        </button>
      )}
    </div>
  ),

  TableSkeleton: ({ columns = 5, rows = 5 }: { columns?: number; rows?: number }) => (
    <div className="w-full animate-pulse divide-y divide-border border border-border rounded-lg bg-white overflow-hidden">
      <div className="h-10 bg-sand/80 px-6 py-3 flex gap-4">
        {Array.from({ length: columns }).map((_, idx) => (
          <div key={idx} className="h-4 bg-border/40 rounded-sm flex-1"></div>
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="h-14 px-6 py-3 flex items-center gap-4">
          {Array.from({ length: columns }).map((_, cIdx) => (
            <div key={cIdx} className="h-3.5 bg-sand rounded flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  ),

  MetricSkeleton: () => (
    <div className="bg-white rounded border border-border p-6 shadow-sm flex items-center justify-between animate-pulse">
      <div className="space-y-2.5 flex-1">
        <div className="h-3 bg-sand rounded w-24"></div>
        <div className="h-7 bg-sand rounded w-12"></div>
        <div className="h-3 bg-sand rounded w-32"></div>
      </div>
      <div className="w-12 h-12 bg-sand rounded-full flex-shrink-0 ml-4"></div>
    </div>
  ),

  CardSkeleton: () => (
    <div className="bg-white rounded border border-border p-5 shadow-sm space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-sand rounded-full flex-shrink-0"></div>
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 bg-sand rounded w-28"></div>
          <div className="h-2.5 bg-sand rounded w-20"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-sand rounded w-full"></div>
        <div className="h-3 bg-sand rounded w-5/6"></div>
      </div>
      <div className="flex gap-2 pt-2">
        <div className="h-6 bg-sand rounded w-16"></div>
        <div className="h-6 bg-sand rounded w-16"></div>
      </div>
    </div>
  ),

  FormSkeleton: () => (
    <div className="bg-white rounded border border-border p-6 shadow-sm space-y-5 animate-pulse">
      <div className="h-4 bg-sand rounded w-1/4 pb-2"></div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="space-y-2">
            <div className="h-3 bg-sand rounded w-24"></div>
            <div className="h-9 bg-sand rounded w-full"></div>
          </div>
        ))}
      </div>
      <div className="flex justify-end pt-2">
        <div className="h-9 bg-sand rounded w-28"></div>
      </div>
    </div>
  ),
};
