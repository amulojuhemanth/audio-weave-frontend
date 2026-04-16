"use client";

import type { GeneratorState, SoundStatusResponse } from "@/app/types/sound";

interface StatusIndicatorProps {
  state: GeneratorState;
  statusResponse: SoundStatusResponse | null;
}

export default function StatusIndicator({
  state,
  statusResponse,
}: StatusIndicatorProps) {
  if (state === "idle" || state === "completed" || state === "failed") {
    return null;
  }

  const getStatusConfig = () => {
    switch (state) {
      case "submitting":
        return {
          label: "Submitting request...",
          color: "text-violet-400",
          dotColor: "bg-violet-400",
          progressColor: "bg-violet-500",
          bgColor: "bg-violet-500/10 border-violet-500/20",
        };
      case "in_queue":
        return {
          label: "Queued — waiting to start...",
          color: "text-amber-400",
          dotColor: "bg-amber-400",
          progressColor: "bg-amber-500",
          bgColor: "bg-amber-500/10 border-amber-500/20",
        };
      case "processing":
        return {
          label: "Generating your sound effect...",
          color: "text-blue-400",
          dotColor: "bg-blue-400",
          progressColor: "bg-blue-500",
          bgColor: "bg-blue-500/10 border-blue-500/20",
        };
      default:
        return {
          label: "Processing...",
          color: "text-zinc-400",
          dotColor: "bg-zinc-400",
          progressColor: "bg-zinc-500",
          bgColor: "bg-zinc-500/10 border-zinc-500/20",
        };
    }
  };

  const config = getStatusConfig();
  const updatedAt = statusResponse?.updated_at;

  return (
    <div
      className={`animate-slide-up rounded-xl border p-4 ${config.bgColor}`}
    >
      {/* Status row */}
      <div className="mb-3 flex items-center gap-3">
        <span
          className={`h-2.5 w-2.5 rounded-full ${config.dotColor} animate-pulse-dot`}
        />
        <span className={`text-sm font-medium ${config.color}`}>
          {config.label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full w-1/4 rounded-full ${config.progressColor} animate-progress`}
        />
      </div>

      {/* Meta info */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500">
        <span>
          Status:{" "}
          <span className="font-medium text-zinc-400">
            {statusResponse?.status || state.toUpperCase()}
          </span>
        </span>
        {updatedAt && (
          <span>
            Updated: {new Date(updatedAt).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}
