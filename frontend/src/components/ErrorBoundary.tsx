'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-3xl font-bold text-white mb-4">Something went wrong</h1>
            <p className="text-gray-300 mb-6">
              We encountered an error while loading this page. Please try again.
            </p>
            {this.state.error && (
              <details className="text-left bg-gray-800 p-4 rounded-lg mb-6">
                <summary className="text-yellow-500 cursor-pointer mb-2">Error Details</summary>
                <pre className="text-red-400 text-sm overflow-auto">
                  {this.state.error.message}
                  {this.state.error.stack && `\n\n${this.state.error.stack}`}
                </pre>
              </details>
            )}
            <button
              onClick={this.resetError}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional component wrapper for easier use
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
) => {
  return (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
};









