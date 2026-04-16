// ──────────────────────────────────────────────────────────────
// Sound Generator (SFX) — TypeScript Interfaces
// Maps exactly to the backend models in models/sound_model.py
// and the API contracts in routers/sound_router.py
// ──────────────────────────────────────────────────────────────

/** Request body for POST /sound_generator — maps to SoundCreate */
export interface SoundCreateRequest {
  project_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  prompt: string;
  webhook_url?: string | null;
  audio_length?: number | null;
}

/** Response from POST /sound_generator — maps to SoundResponse */
export interface SoundResponse {
  id: number;
  project_id: string;
  user_id: string;
  user_name: string;
  type: string; // always "sfx"
  task_id: string;
  conversion_id: string;
  status: SoundStatus;
  audio_url: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

/** Response from GET /sound_generator/status — extended status payload */
export interface SoundStatusResponse {
  success: boolean;
  source_table: string;
  user_id: string;
  task_id: string;
  conversion_id: string;
  project_id: string;
  status: SoundStatus;
  audio_url: string | null;
  error_message: string | null;
  is_completed: boolean;
  has_audio: boolean;
  ready_for_download: boolean;
  created_at: string;
  updated_at: string;
}

/** Backend status values — matches TERMINAL_STATUSES in sound_service.py */
export type SoundStatus =
  | "IN_QUEUE"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "ERROR";

/** Frontend-only UI states */
export type GeneratorState =
  | "idle"
  | "submitting"
  | "in_queue"
  | "processing"
  | "completed"
  | "failed";

/** Active tool selection */
export type ActiveTool = "music" | "sound";
