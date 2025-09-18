import React from 'react';

// Skeleton loading components
export const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="bg-gray-200 rounded-lg p-4 mb-4">
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
    </div>
  </div>
);

export const SkeletonList = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="bg-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
            <div className="h-6 bg-gray-300 rounded-full w-20"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonStats = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="bg-gray-200 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            </div>
            <div className="h-12 w-12 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonForm = () => (
  <div className="animate-pulse">
    <div className="bg-gray-200 rounded-lg shadow p-6 space-y-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i}>
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-gray-300 rounded w-full"></div>
        </div>
      ))}
    </div>
  </div>
);

export const LoadingSpinner = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };
  
  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}></div>
  );
};

export const LoadingPage = ({ message = "Loading..." }: { message?: string }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-xl text-gray-600">{message}</p>
    </div>
  </div>
);


