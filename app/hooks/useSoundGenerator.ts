// ──────────────────────────────────────────────────────────────
// useSoundGenerator — Custom hook for the Sound Generator feature
//
// State machine:
//   idle → submitting → in_queue → processing → completed
//                     ↘ failed   ↗ failed      ↗ failed
//
// Polling: 5s for IN_QUEUE, 3s for PROCESSING
// Session recovery: localStorage persists task_id + user_id
// ──────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createSound, getSoundStatus } from "@/app/services/soundApi";
import type {
  GeneratorState,
  SoundStatusResponse,
  SoundCreateRequest,
} from "@/app/types/sound";

// localStorage keys
const LS_TASK_ID = "sfx_task_id";
const LS_USER_ID = "sfx_user_id";

// Polling intervals in ms
const POLL_INTERVAL_QUEUE = 5000;
const POLL_INTERVAL_PROCESSING = 3000;

// Terminal statuses that stop polling
const TERMINAL_STATUSES = new Set(["COMPLETED", "FAILED", "ERROR"]);

interface UseSoundGeneratorReturn {
  state: GeneratorState;
  statusResponse: SoundStatusResponse | null;
  audioUrl: string | null;
  errorMessage: string | null;
  generate: (
    prompt: string,
    audioLength: number | null,
    userId: string,
    projectId: string
  ) => Promise<void>;
  retry: () => void;
  reset: () => void;
  /** Last prompt + audioLength used (for retry) */
  lastPrompt: string;
  lastAudioLength: number | null;
  lastUserId: string;
  lastProjectId: string;
}

export function useSoundGenerator(): UseSoundGeneratorReturn {
  const [state, setState] = useState<GeneratorState>("idle");
  const [statusResponse, setStatusResponse] =
    useState<SoundStatusResponse | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Store last request params for retry
  const [lastPrompt, setLastPrompt] = useState("");
  const [lastAudioLength, setLastAudioLength] = useState<number | null>(null);
  const [lastUserId, setLastUserId] = useState("");
  const [lastProjectId, setLastProjectId] = useState("");

  // Polling refs
  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const isPollingRef = useRef(false);

  // ── Cleanup on unmount ────────────────────────────────
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Stop polling ──────────────────────────────────────
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }
    isPollingRef.current = false;
  }, []);

  // ── Clear session storage ─────────────────────────────
  const clearSession = useCallback(() => {
    try {
      localStorage.removeItem(LS_TASK_ID);
      localStorage.removeItem(LS_USER_ID);
    } catch {
      // localStorage may be unavailable
    }
  }, []);

  // ── Save session storage ──────────────────────────────
  const saveSession = useCallback((taskId: string, userId: string) => {
    try {
      localStorage.setItem(LS_TASK_ID, taskId);
      localStorage.setItem(LS_USER_ID, userId);
    } catch {
      // localStorage may be unavailable
    }
  }, []);

  // ── Poll loop ─────────────────────────────────────────
  const startPolling = useCallback(
    (userId: string, taskId: string) => {
      if (isPollingRef.current) return;
      isPollingRef.current = true;

      const poll = async () => {
        if (!isMountedRef.current || !isPollingRef.current) return;

        try {
          const response = await getSoundStatus(userId, taskId);
          if (!isMountedRef.current) return;

          setStatusResponse(response);

          if (response.status === "COMPLETED" && response.ready_for_download) {
            setState("completed");
            setAudioUrl(response.audio_url);
            setErrorMessage(null);
            clearSession();
            stopPolling();
            return;
          }

          if (
            response.status === "FAILED" ||
            response.status === "ERROR"
          ) {
            setState("failed");
            setErrorMessage(
              response.error_message || "Sound generation failed"
            );
            clearSession();
            stopPolling();
            return;
          }

          if (response.status === "PROCESSING") {
            setState("processing");
          } else {
            setState("in_queue");
          }

          // Schedule next poll
          const interval =
            response.status === "PROCESSING"
              ? POLL_INTERVAL_PROCESSING
              : POLL_INTERVAL_QUEUE;
          pollingRef.current = setTimeout(poll, interval);
        } catch (err) {
          if (!isMountedRef.current) return;

          // Network error during polling — don't fail, retry
          console.error("Polling error:", err);
          pollingRef.current = setTimeout(poll, POLL_INTERVAL_QUEUE);
        }
      };

      // First poll immediately
      poll();
    },
    [clearSession, stopPolling]
  );

  // ── Session recovery on mount ─────────────────────────
  useEffect(() => {
    try {
      const savedTaskId = localStorage.getItem(LS_TASK_ID);
      const savedUserId = localStorage.getItem(LS_USER_ID);

      if (savedTaskId && savedUserId) {
        setState("in_queue");
        startPolling(savedUserId, savedTaskId);
      }
    } catch {
      // localStorage may be unavailable
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Generate ──────────────────────────────────────────
  const generate = useCallback(
    async (
      prompt: string,
      audioLength: number | null,
      userId: string,
      projectId: string
    ) => {
      // Prevent duplicate submissions
      if (state === "submitting" || state === "in_queue" || state === "processing") {
        return;
      }

      // Save params for retry
      setLastPrompt(prompt);
      setLastAudioLength(audioLength);
      setLastUserId(userId);
      setLastProjectId(projectId);

      // Reset previous state
      stopPolling();
      setAudioUrl(null);
      setErrorMessage(null);
      setStatusResponse(null);
      setState("submitting");

      try {
        const requestBody: SoundCreateRequest = {
          project_id: projectId,
          user_id: userId,
          user_name: "User",
          user_email: "user@example.com",
          prompt,
          audio_length: audioLength,
        };

        const response = await createSound(requestBody);

        if (!isMountedRef.current) return;

        // Optimistic UI — show queued immediately
        setState("in_queue");
        saveSession(response.task_id, userId);
        startPolling(userId, response.task_id);
      } catch (err) {
        if (!isMountedRef.current) return;
        setState("failed");
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to submit request"
        );
      }
    },
    [state, stopPolling, saveSession, startPolling]
  );

  // ── Retry ─────────────────────────────────────────────
  const retry = useCallback(() => {
    if (lastPrompt && lastUserId && lastProjectId) {
      generate(lastPrompt, lastAudioLength, lastUserId, lastProjectId);
    }
  }, [lastPrompt, lastAudioLength, lastUserId, lastProjectId, generate]);

  // ── Reset ─────────────────────────────────────────────
  const reset = useCallback(() => {
    stopPolling();
    clearSession();
    setState("idle");
    setStatusResponse(null);
    setAudioUrl(null);
    setErrorMessage(null);
  }, [stopPolling, clearSession]);

  return {
    state,
    statusResponse,
    audioUrl,
    errorMessage,
    generate,
    retry,
    reset,
    lastPrompt,
    lastAudioLength,
    lastUserId,
    lastProjectId,
  };
}
