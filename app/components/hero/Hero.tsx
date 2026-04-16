"use client";

import type { ActiveTool } from "@/app/types/sound";

interface HeroProps {
  activeTool: ActiveTool;
}

export default function Hero({ activeTool }: HeroProps) {
  const isSound = activeTool === "sound";

  return (
    <section className="mb-8 animate-fade-in">
      {/* Badge */}
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/60 px-4 py-1.5 backdrop-blur-sm">
        <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse-dot" />
        <span className="text-xs font-medium text-zinc-300">
          {isSound ? "Sound Effects Generator" : "Music Generator"}
        </span>
      </div>

      {/* Title */}
      <h1 className="mb-3 text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl">
        {isSound ? (
          <>
            AI{" "}
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Sound Generator
            </span>
          </>
        ) : (
          <>
            AI{" "}
            <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              Music Generator
            </span>
          </>
        )}
      </h1>

      {/* Subtitle */}
      <p className="max-w-lg text-base text-zinc-400 leading-relaxed">
        {isSound
          ? "Create stunning sound effects from text descriptions. Powered by advanced AI for cinematic, game, and creative audio."
          : "Generate original music tracks with AI. Describe your vision and let the AI compose it for you."}
      </p>

      {/* Gradient line */}
      <div className="mt-6 h-px w-full max-w-xs bg-gradient-to-r from-violet-600/60 via-fuchsia-500/30 to-transparent" />
    </section>
  );
}
