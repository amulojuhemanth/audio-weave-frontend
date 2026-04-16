"use client";

import type { GeneratorState } from "@/app/types/sound";

interface GenerateButtonProps {
  state: GeneratorState;
  onClick: () => void;
  disabled: boolean;
}

export default function GenerateButton({
  state,
  onClick,
  disabled,
}: GenerateButtonProps) {
  const isLoading = state === "submitting";
  const isActive = state === "in_queue" || state === "processing";

  const getLabel = () => {
    if (isLoading) return "Submitting...";
    if (isActive) return "Generating...";
    return "Generate Sound";
  };

  return (
    <button
      id="sfx-generate-btn"
      onClick={onClick}
      disabled={disabled || isLoading || isActive}
      className="group relative w-full overflow-hidden rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-all duration-200 hover:bg-violet-700 hover:shadow-violet-600/30 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-900 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:active:scale-100"
    >
      {/* Background shimmer on hover */}
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

      <span className="relative flex items-center justify-center gap-2">
        {/* Spinner */}
        {(isLoading || isActive) && (
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {/* Sparkle icon */}
        {!isLoading && !isActive && (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
          </svg>
        )}

        {getLabel()}
      </span>
    </button>
  );
}
