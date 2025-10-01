import { useState } from "react";

interface ErrorDisplayProps {
  message?: string;
  details?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

function ErrorDisplay({
  message = "An unexpected error occurred.",
  details,
  onRetry,
  onDismiss,
}: ErrorDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-base-200 text-base-content">
      <div className="w-full max-w-2xl text-center">
        <div className="text-error mb-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto h-24 w-24"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <title>Error Icon</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-error mb-4">
          Something Went Wrong
        </h1>
        <p className="text-xl mb-6">{message}</p>

        {/* Details (Collapsible) */}
        {details && (
          <div className="w-full mt-4">
            <button
              type="button"
              className="btn btn-sm btn-ghost justify-center mb-2"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? "Hide Details" : "Show Details"}
            </button>
            {showDetails && (
              <pre className="p-4 bg-base-300 rounded-md text-sm text-left whitespace-pre-wrap break-all max-h-48 overflow-y-auto">
                {details}
              </pre>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
          {onRetry && (
            <button
              type="button"
              className="btn btn-primary w-full md:w-auto"
              onClick={onRetry}
            >
              Retry
            </button>
          )}
          {onDismiss && (
            <button
              type="button"
              className="btn btn-outline w-full md:w-auto"
              onClick={onDismiss}
            >
              Dismiss
            </button>
          )}
          {!onRetry && !onDismiss && (
            <button
              type="button"
              className="btn btn-outline w-full md:w-auto"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorDisplay;
