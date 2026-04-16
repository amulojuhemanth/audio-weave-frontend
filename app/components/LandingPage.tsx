"use client";

import { useState } from "react";
import Sidebar from "@/app/components/layout/Sidebar";
import Hero from "@/app/components/hero/Hero";
import SoundGenerator from "@/app/components/sound-generator/SoundGenerator";
import type { ActiveTool } from "@/app/types/sound";

export default function LandingPage() {
  const [activeTool, setActiveTool] = useState<ActiveTool>("sound");

  return (
    <div className="min-h-screen bg-[#0c0c0e]">
      {/* ── Sidebar ──────────────────────────────────── */}
      <Sidebar activeTool={activeTool} onToolChange={setActiveTool} />

      {/* ── Main Content ─────────────────────────────── */}
      <main
        className="min-h-screen px-8 py-8 lg:px-12 lg:py-10"
        style={{ marginLeft: "280px" }}
      >
        <div className="mx-auto max-w-2xl">
          {/* Hero */}
          <Hero activeTool={activeTool} />

          {/* Tool Content */}
          <div className="mt-2">
            {activeTool === "sound" ? (
              <SoundGenerator />
            ) : (
              /* Music Generator Placeholder */
              <div className="animate-slide-up rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center shadow-lg">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600/10">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-violet-400"
                  >
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-zinc-200">
                  Music Generator
                </h3>
                <p className="text-sm text-zinc-500 max-w-sm mx-auto leading-relaxed">
                  AI-powered music generation is available through the existing
                  backend. Switch to{" "}
                  <button
                    onClick={() => setActiveTool("sound")}
                    className="text-violet-400 underline underline-offset-2 hover:text-violet-300 transition-colors"
                  >
                    Sound Generator
                  </button>{" "}
                  to create sound effects.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
