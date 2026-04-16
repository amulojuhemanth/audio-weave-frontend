"use client";

import { useState } from "react";
import { useSoundGenerator } from "@/app/hooks/useSoundGenerator";
import PromptInput from "./PromptInput";
import AudioLengthInput from "./AudioLengthInput";
import GenerateButton from "./GenerateButton";
import StatusIndicator from "./StatusIndicator";
import AudioPlayer from "./AudioPlayer";
import ErrorBanner from "./ErrorBanner";

export default function SoundGenerator() {
  // Local form state
  const [prompt, setPrompt] = useState("");
  const [audioLength, setAudioLength] = useState("");
  const [userId, setUserId] = useState("");
  const [projectId, setProjectId] = useState("");

  // Hook state
  const {
    state,
    statusResponse,
    audioUrl,
    errorMessage,
    generate,
    retry,
    reset,
  } = useSoundGenerator();

  // Whether inputs should be disabled
  const isProcessing =
    state === "submitting" || state === "in_queue" || state === "processing";

  // Handle generate
  const handleGenerate = () => {
    if (!prompt.trim()) return;
    if (!userId.trim()) return;
    if (!projectId.trim()) return;

    const lengthVal = audioLength ? parseInt(audioLength, 10) : null;
    generate(prompt.trim(), lengthVal, userId.trim(), projectId.trim());
  };

  // Handle reset (new sound)
  const handleReset = () => {
    reset();
    setPrompt("");
    setAudioLength("");
  };

  // Validation
  const canGenerate =
    prompt.trim().length > 0 &&
    userId.trim().length > 0 &&
    projectId.trim().length > 0 &&
    !isProcessing;

  return (
    <div className="animate-slide-up space-y-6">
      {/* ── Main Panel ───────────────────────────────── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-lg">
        {/* Panel header */}
        <div className="mb-5 flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-violet-500" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Sound Generator
          </h2>
        </div>

        <div className="space-y-5">
          {/* ── User fields ──────────────────────── */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="sfx-user-id"
                className="text-xs font-medium uppercase tracking-wider text-zinc-500"
              >
                User ID
              </label>
              <input
                id="sfx-user-id"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                disabled={isProcessing}
                placeholder="user_abc123"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all duration-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="sfx-project-id"
                className="text-xs font-medium uppercase tracking-wider text-zinc-500"
              >
                Project ID
              </label>
              <input
                id="sfx-project-id"
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                disabled={isProcessing}
                placeholder="proj_xyz"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all duration-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-zinc-800" />

          {/* ── Prompt ───────────────────────────── */}
          <PromptInput
            value={prompt}
            onChange={setPrompt}
            disabled={isProcessing}
          />

          {/* ── Audio Length ──────────────────────── */}
          <AudioLengthInput
            value={audioLength}
            onChange={setAudioLength}
            disabled={isProcessing}
          />

          {/* ── Generate Button ──────────────────── */}
          <GenerateButton
            state={state}
            onClick={handleGenerate}
            disabled={!canGenerate}
          />
        </div>
      </div>

      {/* ── Status Area (below main panel) ──────────── */}
      {(state === "submitting" ||
        state === "in_queue" ||
        state === "processing") && (
        <StatusIndicator state={state} statusResponse={statusResponse} />
      )}

      {/* ── Completed: Audio Player ────────────────── */}
      {state === "completed" && audioUrl && (
        <AudioPlayer audioUrl={audioUrl} onReset={handleReset} />
      )}

      {/* ── Failed: Error Banner ───────────────────── */}
      {state === "failed" && errorMessage && (
        <ErrorBanner
          message={errorMessage}
          onRetry={retry}
          onDismiss={handleReset}
        />
      )}
    </div>
  );
}
