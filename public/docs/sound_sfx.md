# Sound Generation (SFX) — Feature Documentation

---

## 1. Overview

The Sound Generation (SFX) feature enables users to generate sound effects and audio content via an integrated MusicGPT API. Users submit generation requests with prompts and optional parameters, which are asynchronously processed. The system polls the external API, stores completed audio files in cloud storage, and provides status tracking endpoints.

**Key Capabilities:**
- Generate audio from text prompts
- Customize audio length (duration)
- Webhook notifications (optional)
- Async polling with timeout protection
- Cloud storage integration for audio files
- Status and progress tracking

---

## 2. Architecture Breakdown

### Model Layer (`models/sound_model.py`)

#### SoundCreate (Request Model)
**Fields:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `project_id` | string | Yes | — |
| `user_id` | string | Yes | Non-empty after strip; validated |
| `user_name` | string | Yes | — |
| `user_email` | string | Yes | — |
| `prompt` | string | Yes | — |
| `webhook_url` | string | No | Empty string converted to None |
| `audio_length` | int | No | >= 1 if provided |

**Validation Logic:**
- `user_id`: Must be non-null, non-empty string (whitespace trimmed)
- `webhook_url`: Empty strings converted to `None`
- `audio_length`: Must be positive if provided

#### SoundResponse (Response Model)
**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | int | Database row ID |
| `project_id` | string | Associated project |
| `user_id` | string | User identifier |
| `user_name` | string | User display name |
| `type` | string | Always "sfx" |
| `task_id` | string | MusicGPT task identifier |
| `conversion_id` | string | MusicGPT conversion identifier |
| `status` | string | Current state (IN_QUEUE, PROCESSING, COMPLETED, FAILED, ERROR) |
| `audio_url` | string | Public URL to generated audio (if completed) |
| `error_message` | string | Error details (if failed) |
| `created_at` | datetime | Record creation timestamp |
| `updated_at` | datetime | Last update timestamp |

---

### Router Layer (`routers/sound_router.py`)

**Prefix:** `/sound_generator`

#### Endpoint 1: Create Sound Generation
```
POST /sound_generator
```
**Request Body:**
```json
{
  "project_id": "proj_123",
  "user_id": "user_456",
  "user_name": "John Doe",
  "user_email": "john@example.com",
  "prompt": "Futuristic laser sound effect",
  "webhook_url": "https://example.com/webhook",
  "audio_length": 5
}
```

**Response (201):**
```json
{
  "id": 1,
  "project_id": "proj_123",
  "user_id": "user_456",
  "user_name": "John Doe",
  "type": "sfx",
  "task_id": "task_abc123",
  "conversion_id": "conv_xyz789",
  "status": "IN_QUEUE",
  "audio_url": null,
  "error_message": null,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**
| Status | Reason |
|--------|--------|
| 400 | Validation error (invalid user_id, etc.) |
| 500 | Server error (MusicGPT API failure, DB error) |

**Behavior:**
- Validates input
- Calls MusicGPT API to queue job
- Inserts record into `sound_generations` table with status `IN_QUEUE`
- **Queues background task** for polling (async)
- Returns immediately with task metadata

---

#### Endpoint 2: Get Sound Generation (with Status)
```
GET /sound_generator/status?user_id=user_456&task_id=task_abc123
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | User identifier |
| `task_id` | string | Yes | Task ID from creation response |

**Response (200):**
```json
{
  "success": true,
  "source_table": "sound_generations",
  "user_id": "user_456",
  "task_id": "task_abc123",
  "conversion_id": "conv_xyz789",
  "project_id": "proj_123",
  "status": "COMPLETED",
  "audio_url": "https://storage.example.com/user_456/task_abc123/conv_xyz789.mp3",
  "error_message": null,
  "is_completed": true,
  "has_audio": true,
  "ready_for_download": true,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:35:22Z"
}
```

**Error Responses:**
| Status | Reason |
|--------|--------|
| 404 | No record found for user_id + task_id |
| 500 | Server error |

**Convenience Fields:**
- `is_completed`: `status == "COMPLETED"`
- `has_audio`: `bool(audio_url)`
- `ready_for_download`: `is_completed && has_audio`

---

#### Endpoint 3: Fetch Sound Generation (Model Response)
```
GET /sound_generator?user_id=user_456&task_id=task_abc123
```

**Response Model:** `SoundResponse` (structured response)

**Error Responses:**
| Status | Reason |
|--------|--------|
| 404 | No record found |
| 500 | Server error |

---

### Service Layer (`services/sound_service.py`)

#### 1. `get_sound_generation(user_id: str, task_id: str) → dict`

**Purpose:** Retrieve a sound generation record from the database.

**Logic:**
- Query `sound_generations` table
- Filter by `user_id` and `task_id`
- Fetch selected fields
- Raise `ValueError` if not found

**Database Query:**
```sql
SELECT project_id, user_id, user_name, type, task_id, conversion_id,
       status, audio_url, error_message, created_at, updated_at
FROM sound_generations
WHERE user_id = ? AND task_id = ?
LIMIT 1
```

---

#### 2. `create_sound(data: SoundCreate) → dict` (Async)

**Purpose:** Submit a sound generation request to MusicGPT API and create a DB record.

**Flow:**

1. **Validate** `user_id` (non-null, non-empty)

2. **Build MusicGPT Payload:**
   ```json
   {
     "prompt": "user prompt text",
     "webhook_url": "optional_url",
     "audio_length": 5
   }
   ```

3. **Call MusicGPT API:**
   - **Endpoint:** `POST https://api.musicgpt.com/api/public/v1/sound_generator`
   - **Headers:** `Authorization: <REDACTED>`
   - **Timeout:** 30 seconds
   - **Fallback:** If response status is 400, 415, or 422, retry with JSON payload instead of form data

4. **Parse MusicGPT Response:**
   ```json
   {
     "task_id": "task_abc123",
     "conversion_id": "conv_xyz789",
     "eta": 15
   }
   ```

5. **Insert Database Record:**
   ```json
   {
     "project_id": "proj_123",
     "user_id": "user_456",
     "user_name": "John Doe",
     "type": "sfx",
     "task_id": "task_abc123",
     "conversion_id": "conv_xyz789",
     "status": "IN_QUEUE",
     "audio_url": null,
     "error_message": null
   }
   ```

6. **Return** the inserted database record

**Error Handling:**
- Raises `ValueError` if `user_id` invalid
- Raises `HTTPException` (400) on validation errors
- Raises `HTTPException` (400) on API/DB failures

---

#### 3. `poll_and_store(task_id: str, conversion_id: str, user_id: str)` (Async Background Task)

**Purpose:** Asynchronously poll MusicGPT for completion, download audio, and update the database.

**Configuration:**
| Setting | Value | Purpose |
|---------|-------|---------|
| `POLL_INTERVAL_SECONDS` | 5 | Wait time between API polls |
| `MAX_POLL_DURATION_SECONDS` | 300 | Max polling time (5 minutes) |
| `TERMINAL_STATUSES` | {COMPLETED, ERROR, FAILED} | Stop polling on these states |

**Flow:**

1. **Initialize Polling:**
   - Set up async HTTP client (30s timeout, 120s read timeout)
   - Elapsed time = 0

2. **Poll Loop (Until Terminal State or Timeout):**

   a. **Call MusicGPT `/byId` Endpoint:**
   ```
   GET https://api.musicgpt.com/api/public/v1/byId
   ?conversionType=SOUND_GENERATOR
   &task_id=task_abc123
   &conversion_id=conv_xyz789
   ```
   
   b. **Parse Response:**
   ```json
   {
     "conversion": {
       "status": "PROCESSING",
       "conversion_path": "https://...",
       "message": "..."
     }
   }
   ```
   
   c. **Check Status:**
   - If not terminal: Sleep 5s, increment elapsed, continue loop
   - If terminal: Proceed to update

3. **Terminal State Handling:**

   **If Status = `COMPLETED`:**
   - Extract `conversion_path` (audio file URL)
   - Raise error if missing
   - **Download audio file** from MusicGPT
   - **Detect file type** (extension: `.wav` or `.mp3`)
   - **Upload to Supabase Storage:**
     - Bucket: `sfx` (or configured value)
     - Path: `{user_id}/{task_id}/{conversion_id}.{extension}`
     - Content-Type: `audio/mpeg` or `audio/wav`
   - **Get public URL** from Supabase
   - Update DB: `status = "COMPLETED"`, `audio_url = public_url`, `error_message = null`

   **If Status = `ERROR` or `FAILED`:**
   - Update DB: `status = status`, `error_message = conversion.message or "Sound generation failed"`

4. **Timeout Handling:**
   - If elapsed time exceeds 300s without terminal state
   - Update DB: `status = "FAILED"`, `error_message = "Polling timed out after 300 seconds"`

5. **Exception Handling:**
   - Catch all exceptions during polling
   - Log error with task_id and conversion_id
   - Update DB: `status = "FAILED"`, `error_message = str(exception)`

---

#### Helper Methods

**`_get_file_extension(audio_url: str) → str`**
- Parses URL path
- Returns `"wav"` if URL ends with `.wav`
- Returns `"mp3"` by default

**`_get_content_type(file_extension: str) → str`**
- Returns `"audio/wav"` for `.wav`
- Returns `"audio/mpeg"` for `.mp3`

**`_submit_sound_request(client, headers, payload) → httpx.Response`**
- Submits POST request to MusicGPT with form data
- If response is 400, 415, or 422: Retry with JSON payload
- Return response

---

## 3. API CONTRACTS (Summary Table)

| Method | Endpoint | Purpose | Auth | Body | Params | Response |
|--------|----------|---------|------|------|--------|----------|
| POST | `/sound_generator` | Create job | None | SoundCreate | — | SoundResponse |
| GET | `/sound_generator/status` | Get status | None | — | user_id, task_id | JSON object |
| GET | `/sound_generator` | Fetch record | None | — | user_id, task_id | SoundResponse |

---

## 4. COMPLETE FLOW

### User Request Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Frontend: POST /sound_generator                              │
│    (prompt, audio_length, webhook_url, user_id, ...)           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────┐
        │ 2. Router: create_sound()           │
        │    - Validate SoundCreate           │
        │    - Call SoundService.create_sound │
        └────────────┬─────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────┐
        │ 3. Service: create_sound()          │
        │    - Call MusicGPT API              │
        │    - Get task_id, conversion_id    │
        │    - Insert record (IN_QUEUE)      │
        │    - Return record                  │
        └────────────┬─────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────┐
        │ 4. Router: Queue Background Task    │
        │    - poll_and_store(...)            │
        │    - Return immediately             │
        └────────────┬─────────────────────────┘
                     │
        ┌────────────┴──────────────┐
        │ (Async)                   │
        ▼                           ▼
    ┌─────────────────┐   ┌──────────────────┐
    │ 5. Background   │   │ 6. Frontend Poll │
    │    Poll Loop    │   │    GET /status   │
    │    (5s intervals)   │    (polling)     │
    │    Until terminal   │                  │
    └────────┬────────┘   └────────┬─────────┘
             │                     │
             ▼                     │
    ┌─────────────────┐            │
    │ 7. Download     │            │
    │    Audio Asset  │            │
    │ (if COMPLETED)  │            │
    └────────┬────────┘            │
             │                     │
             ▼                     │
    ┌─────────────────┐            │
    │ 8. Upload to    │            │
    │    Supabase     │            │
    │    Storage      │            │
    └────────┬────────┘            │
             │                     │
             ▼                     │
    ┌─────────────────┐            │
    │ 9. Update DB    │            │
    │    (COMPLETED,  │            │
    │     audio_url)  │            │
    └────────┬────────┘            │
             │                     │
             └─────────┬───────────┘
                       │
                       ▼
          ┌─────────────────────────┐
          │ 10. Frontend: Display   │
          │     Audio + Play Button │
          │     (ready_for_download)│
          └─────────────────────────┘
```

### Key Points:
- **Step 1-4:** Synchronous (request/response within 30s)
- **Step 5-9:** Asynchronous (background processing, up to 5 minutes)
- **Step 6:** Frontend polls status endpoint until completion
- **Step 10:** Frontend displays playable audio URL

---

## 5. ASYNC PROCESSING

### Polling Strategy

| Parameter | Value | Meaning |
|-----------|-------|---------|
| Poll Interval | 5 seconds | Wait between API calls to MusicGPT |
| Max Duration | 300 seconds (5 min) | Stop polling if job doesn't complete |
| Timeout (HTTP) | 30s (connect), 120s (read) | Network timeout per request |

### Terminal States

```
IN_QUEUE
   ↓
[Polling starts]
   ↓
(Status not terminal?) → [Sleep 5s] → [Poll again]
   ↓
(Status = COMPLETED) → [Download audio] → [Upload storage] → [Update DB]
(Status = ERROR)     → [Update DB with error]
(Status = FAILED)    → [Update DB with error]
   ↓
[Polling ends]
```

### Failure Scenarios

| Scenario | Result |
|----------|--------|
| Poll exceeds 300s | DB updated: FAILED + "Polling timed out" |
| MusicGPT API error | DB updated: FAILED + error message |
| Missing conversion_path | DB updated: FAILED + error message |
| Storage upload fails | Exception logged, DB updated: FAILED |
| Network timeout | Exception logged, DB updated: FAILED |

---

## 6. DATABASE DESIGN

### Table: `sound_generations`

```sql
CREATE TABLE sound_generations (
  id BIGINT PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  type TEXT NOT NULL,  -- Always "sfx"
  task_id TEXT NOT NULL UNIQUE,
  conversion_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,  -- IN_QUEUE, PROCESSING, COMPLETED, ERROR, FAILED
  audio_url TEXT,  -- NULL until COMPLETED
  error_message TEXT,  -- NULL unless ERROR/FAILED
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sound_gen_user_task ON sound_generations(user_id, task_id);
```

### Record Lifecycle

```
INSERT → {status: IN_QUEUE}
           ↓
POLL → [async: poll_and_store()]
           ↓
COMPLETED → {status: COMPLETED, audio_url: "..."}
OR
FAILED → {status: FAILED, error_message: "..."}
```

### Selected Fields (Queries)
```
project_id, user_id, user_name, type, task_id, conversion_id,
status, audio_url, error_message, created_at, updated_at
```

---

## 7. EXTERNAL SERVICES

### MusicGPT API

**Base URL:** `https://api.musicgpt.com/api/public/v1`

**Authentication:** Header `Authorization: <REDACTED>`

#### Endpoint 1: Submit Sound Job
```
POST /sound_generator
Content-Type: application/x-www-form-urlencoded (or application/json on retry)

Payload:
{
  "prompt": "Futuristic laser sound",
  "audio_length": 5,
  "webhook_url": "https://example.com/webhook"  // optional
}

Response:
{
  "task_id": "task_abc123",
  "conversion_id": "conv_xyz789",
  "eta": 15  // estimated seconds
}

Status Codes:
- 200: Success
- 400, 415, 422: Retry with JSON (form data failed)
```

#### Endpoint 2: Poll Job Status
```
GET /byId?conversionType=SOUND_GENERATOR&task_id=...&conversion_id=...

Response:
{
  "conversion": {
    "status": "PROCESSING",  // or COMPLETED, ERROR, FAILED
    "conversion_path": "https://...",  // URL to audio file
    "message": "..."  // error details if failed
  }
}

Status Codes:
- 200: Success
```

### Supabase

**Database:** PostgreSQL-compatible
- Table: `sound_generations`
- Operations: `insert()`, `select()`, `update()`

**Storage:** Object storage (`sfx` bucket)
- Upload: `storage.from_("sfx").upload(path, content, {content-type})`
- Public URL: `storage.from_("sfx").get_public_url(path)`

---

## 8. EDGE CASES

| Case | Handling |
|------|----------|
| **user_id is empty string** | Validation error in SoundCreate, 400 response |
| **user_id is whitespace** | Stripped, validated as empty, 400 response |
| **webhook_url is empty string** | Converted to None, not sent to MusicGPT |
| **audio_length is 0 or negative** | Validation error, 400 response |
| **MusicGPT API timeout** | Exception caught, logged, background task fails (DB: FAILED) |
| **MusicGPT returns 400/415/422** | Automatic retry with JSON payload |
| **conversion_path missing** | ValueError raised, DB: FAILED + error message |
| **Polling exceeds 300s** | DB: FAILED + "Polling timed out after 300 seconds" |
| **Audio download fails** | Exception logged, DB: FAILED |
| **Storage upload fails** | Exception logged, DB: FAILED |
| **Duplicate task_id/conversion_id** | DB constraint violation (unique fields) |
| **User queries before polling complete** | Returns IN_QUEUE status |
| **User queries after polling timeout** | Returns FAILED status + timeout message |

---

## 9. FRONTEND MAPPING

### Feature 1: Create Sound Generation

**API Call:**
```javascript
POST /sound_generator
Content-Type: application/json

{
  "project_id": "proj_123",
  "user_id": "user_456",
  "user_name": "John Doe",
  "user_email": "john@example.com",
  "prompt": "Futuristic laser sound effect",
  "webhook_url": "https://example.com/webhook",
  "audio_length": 5
}
```

**States (UI):**
1. **Idle** → User clicks "Generate"
2. **Loading** → Request in progress (show spinner)
3. **Success** → task_id received
   - Store `task_id` and `conversion_id` for polling
   - Show message: "Sound generation queued! ETA: ~{eta}s"
   - Transition to polling
4. **Error** → Show error message + retry button

---

### Feature 2: Poll Sound Status

**API Call (Repeated):**
```javascript
GET /sound_generator/status?user_id=user_456&task_id=task_abc123
```

**States (UI):**
1. **Polling** → Show progress bar + "Generating..."
   - Repeat every 2-5 seconds
   - Stop when `is_completed === true` or `status === "FAILED"`
2. **Completed** → `ready_for_download === true`
   - Show audio player with `audio_url`
   - Show download button
3. **Failed** → `status === "FAILED"` or `status === "ERROR"`
   - Show error message from `error_message` field
   - Show retry button

**Response Mapping:**
| API Field | UI Use |
|-----------|--------|
| `status` | Display current state |
| `audio_url` | Audio player source |
| `error_message` | Error display |
| `is_completed` | Stop polling |
| `has_audio` | Show download button |
| `ready_for_download` | Enable playback |
| `updated_at` | Show last update time |

---

### Feature 3: Playback & Download

**Use Cases:**
1. **Play Audio:**
   ```html
   <audio src="{audio_url}" controls />
   ```

2. **Download Audio:**
   ```javascript
   <a href="{audio_url}" download>Download</a>
   ```

3. **Share:**
   ```javascript
   // audio_url is public and shareable
   Copy to clipboard / generate share link
   ```

---

## 10. STATE MACHINE

### States

```
┌──────────────────────────────────────────────────────────┐
│                    IN_QUEUE                              │
│  (Job submitted to MusicGPT, waiting to start)           │
│  ↓ [Polling starts]                                      │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                    PROCESSING                            │
│  (MusicGPT generating audio)                             │
│  ↓ [Polling continues]                                   │
└──────────────────────────────────────────────────────────┘

                    ┌─────────────────┐
                    │  COMPLETED  ✓   │
                    │  (Audio ready,  │
                    │   audio_url set)│
                    └─────────────────┘

                    ┌─────────────────┐
                    │   FAILED    ✗   │
                    │  (error_message │
                    │       set)      │
                    └─────────────────┘

                    ┌─────────────────┐
                    │   ERROR     ✗   │
                    │  (API error)    │
                    └─────────────────┘
```

### Transition Rules

| From | To | Trigger | Data Changes |
|------|----|---------| ------------|
| IN_QUEUE | PROCESSING | Polling detects MusicGPT status change | (status updated) |
| PROCESSING | COMPLETED | Poll detects status=COMPLETED | audio_url set, error_message = null |
| PROCESSING | FAILED | Poll detects status=FAILED | error_message set |
| PROCESSING | ERROR | Poll detects status=ERROR | error_message set |
| IN_QUEUE/PROCESSING | FAILED | Polling exceeds 300s | error_message = "Polling timed out..." |
| ANY | FAILED | Background task exception | error_message set |

### Important Notes:
- **No backward transitions** (states only move forward)
- **COMPLETED, FAILED, ERROR** are terminal states (polling stops)
- **Status field** always matches MusicGPT's response (except timeout/exception)
- **Database always updated** even on failures

---

## Security & Best Practices

### Redacted Sensitive Data
- API Key: `<REDACTED>` (stored in `MUSICGPT_API_KEY` env var)
- Supabase credentials: Not exposed in code
- Webhook URLs: User-provided, logged only for debugging

### Validation
- User input sanitized (strip whitespace on user_id)
- Audio length constraints enforced (>= 1)
- All external API responses validated

### Storage
- Audio files stored with user/task/conversion path hierarchy
- Files uploaded with correct MIME type
- Public URLs generated only for completed files

### Error Handling
- All exceptions caught and logged with context
- Database always updated with meaningful error messages
- No stack traces exposed to frontend

---

## Monitoring & Debugging

### Key Logs (from logger.info/error)
- Sound request received (project_id, prompt excerpt, audio_length)
- MusicGPT API calls (task_id, conversion_id, eta)
- Job submitted (task_id, conversion_id)
- Polling started/ongoing (5s intervals, elapsed time, status)
- Audio download/upload (conversion_id, file_path)
- DB updates (task_id, conversion_id, status)
- Polling timeout/failure (task_id, conversion_id, error)

### Metrics to Track
- Avg generation time
- Success/failure rate
- Timeout rate
- Storage usage (audio files)
- API response time (MusicGPT)
- Polling cycles per job

---
