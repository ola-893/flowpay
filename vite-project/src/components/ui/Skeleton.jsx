import React from 'react';

// Base Skeleton Component with Shimmer
export function Skeleton({ className = '', variant = 'default' }) {
  const variants = {
    default: 'bg-white/5',
    light: 'bg-white/10',
    dark: 'bg-surface-700',
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-lg
        ${variants[variant]}
        ${className}
      `}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

// Text Skeleton
export function SkeletonText({ lines = 1, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {[...Array(lines)].map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

// Avatar Skeleton
export function SkeletonAvatar({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };

  return <Skeleton className={`${sizes[size]} rounded-full ${className}`} />;
}

// Card Skeleton
export function SkeletonCard({ className = '' }) {
  return (
    <div className={`card-glass p-4 md:p-6 space-y-4 ${className}`}>
      <div className="flex items-center gap-3">
        <SkeletonAvatar size="md" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonText lines={3} />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-20 rounded-lg" />
        <Skeleton className="h-9 w-20 rounded-lg" />
      </div>
    </div>
  );
}

// Stream Card Skeleton
export function SkeletonStreamCard({ className = '' }) {
  return (
    <div className={`card-glass p-5 ${className}`}>
      <div className="flex items-start gap-4">
        {/* Progress Ring Skeleton */}
        <Skeleton className="w-20 h-20 rounded-full flex-shrink-0" />
        
        {/* Content */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-2/3" />
          <div className="flex items-baseline gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-8" />
          </div>
          <Skeleton className="h-3 w-1/2" />
        </div>

        {/* Right side */}
        <div className="text-right space-y-1">
          <Skeleton className="h-3 w-16 ml-auto" />
          <Skeleton className="h-5 w-20 ml-auto" />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center justify-between">
        <Skeleton className="h-4 w-16" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Stats Card Skeleton
export function SkeletonStatsCard({ className = '' }) {
  return (
    <div className={`card-glass p-4 text-center ${className}`}>
      <Skeleton className="h-8 w-16 mx-auto mb-2" />
      <Skeleton className="h-3 w-20 mx-auto" />
    </div>
  );
}

// Dashboard Skeleton
export function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <SkeletonStatsCard key={i} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Stream List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        {[...Array(3)].map((_, i) => (
          <SkeletonStreamCard key={i} />
        ))}
      </div>
    </div>
  );
}

// Agent Console Skeleton
export function SkeletonAgentConsole() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card-glass p-6">
        <div className="flex items-start gap-4">
          <SkeletonAvatar size="lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 rounded-xl glass">
              <Skeleton className="h-4 w-8 mb-2" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-3 w-12 mt-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Spending Limits */}
      <div className="card-glass p-6 space-y-4">
        <Skeleton className="h-5 w-32" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Decision Log Skeleton
export function SkeletonDecisionLog() {
  return (
    <div className="card-glass p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="relative pl-8">
            <Skeleton className="absolute left-0 top-1 w-6 h-6 rounded-full" />
            <div className="p-4 rounded-xl glass space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Table Skeleton
export function SkeletonTable({ rows = 5, cols = 4, className = '' }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr>
            {[...Array(cols)].map((_, i) => (
              <th key={i} className="p-3 text-left">
                <Skeleton className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, rowIndex) => (
            <tr key={rowIndex} className="border-t border-white/5">
              {[...Array(cols)].map((_, colIndex) => (
                <td key={colIndex} className="p-3">
                  <Skeleton className={`h-4 ${colIndex === 0 ? 'w-24' : 'w-16'}`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
