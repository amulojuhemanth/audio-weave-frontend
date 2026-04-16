// ──────────────────────────────────────────────────────────────
// Sound Generator API Service Layer
// Uses ONLY the documented endpoints:
//   POST /sound_generator       → createSound
//   GET  /sound_generator/status → getSoundStatus
// Proxied via next.config.ts rewrites
// ──────────────────────────────────────────────────────────────

import type { SoundCreateRequest, SoundResponse, SoundStatusResponse } from "@/app/types/sound";

const API_BASE = "/api/sound_generator";

/**
 * Submit a new sound generation request.
 * POST /api/sound_generator → proxied to POST http://localhost:8000/sound_generator/
 */
export async function createSound(
  data: SoundCreateRequest
): Promise<SoundResponse> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    const message =
      errorBody?.detail || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return res.json();
}

/**
 * Poll the status of an existing sound generation job.
 * GET /api/sound_generator/status?user_id=...&task_id=...
 * → proxied to GET http://localhost:8000/sound_generator/status
 */
export async function getSoundStatus(
  userId: string,
  taskId: string
): Promise<SoundStatusResponse> {
  const params = new URLSearchParams({ user_id: userId, task_id: taskId });
  const res = await fetch(`${API_BASE}/status?${params.toString()}`);

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    const message =
      errorBody?.detail || `Status check failed with status ${res.status}`;
    throw new Error(message);
  }

  return res.json();
}
