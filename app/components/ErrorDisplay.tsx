interface ErrorDisplayProps {
  error: string | Error | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  title?: string;
  className?: string;
}

export function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  title = "Error",
  className = "",
}: ErrorDisplayProps) {
  if (!error) return null;

  const errorMessage =
    typeof error === "string" ? error : error.message || "Unknown error";

  return (
    <div
      className={`bg-red-500/10 border border-red-500/30 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-300 mb-1">{title}</h3>
          <p className="text-sm text-red-200">{errorMessage}</p>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-red-300 hover:text-red-100 transition-colors"
            aria-label="Dismiss error"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 text-sm text-red-300 hover:text-red-100 font-medium underline transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}
