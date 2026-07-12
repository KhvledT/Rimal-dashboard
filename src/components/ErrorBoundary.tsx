import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught rendering error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-sand flex flex-col items-center justify-center p-6 select-none">
          <div className="max-w-md w-full bg-white shadow-md border-t-4 border-burgundy rounded p-8 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-navy mb-2 tracking-wide uppercase">
              System Rendering Error
            </h1>
            <p className="text-sm text-gray-600 mb-6 font-body">
              An unexpected layout crash occurred. The dashboard recovery
              mechanism caught it to protect your work context.
            </p>
            {this.state.error && (
              <div className="bg-sand border border-border text-left p-3 rounded mb-6 text-xs overflow-x-auto font-mono text-burgundy-deep max-h-40">
                {this.state.error.toString()}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-burgundy hover:bg-burgundy-deep text-white font-medium py-2.5 px-4 rounded text-sm transition-colors duration-150 shadow"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
