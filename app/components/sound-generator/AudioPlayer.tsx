"use client";

interface AudioPlayerProps {
  audioUrl: string;
  onReset: () => void;
}

export default function AudioPlayer({ audioUrl, onReset }: AudioPlayerProps) {
  return (
    <div className="animate-slide-up space-y-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-emerald-400"
          >
            <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-emerald-300">
            Sound Generated Successfully!
          </h3>
          <p className="text-xs text-zinc-500">
            Your sound effect is ready to play and download
          </p>
        </div>
      </div>

      {/* Audio player */}
      <div className="overflow-hidden rounded-lg bg-zinc-900/80 p-3">
        <audio
          controls
          preload="metadata"
          src={audioUrl}
          className="w-full [&::-webkit-media-controls-panel]:bg-zinc-800 [&::-webkit-media-controls-current-time-display]:text-zinc-300 [&::-webkit-media-controls-time-remaining-display]:text-zinc-400"
        >
          Your browser does not support the audio element.
        </audio>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <a
          href={audioUrl}
          download
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-700 hover:text-white"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" x2="12" y1="15" y2="3" />
          </svg>
          Download
        </a>
        <button
          onClick={onReset}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-violet-600/10 px-4 py-2.5 text-sm font-medium text-violet-300 transition-colors hover:bg-violet-600/20"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          New Sound
        </button>
      </div>
    </div>
  );
}
