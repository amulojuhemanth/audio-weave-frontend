"use client";

import { useState } from "react";
import type { ActiveTool } from "@/app/types/sound";

interface SidebarProps {
  activeTool: ActiveTool;
  onToolChange: (tool: ActiveTool) => void;
}

export default function Sidebar({ activeTool, onToolChange }: SidebarProps) {
  const [toolsOpen, setToolsOpen] = useState(true);

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-[280px] flex-col border-r border-zinc-800 bg-zinc-900">
      {/* ── Logo ───────────────────────────────── */}
      <div className="flex items-center gap-3 border-b border-zinc-800 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 shadow-lg shadow-violet-600/20">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>
        <div>
          <h1 className="text-sm font-semibold text-zinc-100">SoundForge AI</h1>
          <p className="text-[11px] text-zinc-500">Audio Generation Platform</p>
        </div>
      </div>

      {/* ── Navigation ─────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {/* Dashboard link */}
        <div className="mb-1">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200">
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
              <rect width="7" height="9" x="3" y="3" rx="1" />
              <rect width="7" height="5" x="14" y="3" rx="1" />
              <rect width="7" height="9" x="14" y="12" rx="1" />
              <rect width="7" height="5" x="3" y="16" rx="1" />
            </svg>
            Dashboard
          </button>
        </div>

        {/* Tools section */}
        <div className="mt-4">
          <button
            onClick={() => setToolsOpen(!toolsOpen)}
            className="flex w-full items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 transition-colors hover:text-zinc-300"
          >
            <span>Tools</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-200 ${toolsOpen ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {toolsOpen && (
            <div className="mt-1 space-y-0.5">
              {/* Music Generator */}
              <button
                onClick={() => onToolChange("music")}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all ${
                  activeTool === "music"
                    ? "bg-violet-600/10 text-violet-300 shadow-sm"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                }`}
              >
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
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
                Music Generator
                {activeTool === "music" && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400" />
                )}
              </button>

              {/* Sound Generator (SFX) */}
              <button
                onClick={() => onToolChange("sound")}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all ${
                  activeTool === "sound"
                    ? "bg-violet-600/10 text-violet-300 shadow-sm"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                }`}
              >
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
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
                Sound Generator
                <span className="ml-1 rounded-md bg-violet-600/20 px-1.5 py-0.5 text-[10px] font-medium text-violet-400">
                  SFX
                </span>
                {activeTool === "sound" && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400" />
                )}
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ── Footer ─────────────────────────────── */}
      <div className="border-t border-zinc-800 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700 text-xs font-medium text-zinc-300">
            U
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-zinc-300">User</p>
            <p className="truncate text-[11px] text-zinc-500">Free Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
