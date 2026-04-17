# Sound SFX — Frontend Specification (Production-Ready)

---

## 1. FEATURE OVERVIEW

The Sound SFX feature allows users to generate sound effects from text prompts using an asynchronous backend system.

The frontend must:

* Submit generation requests
* Track progress via polling
* Handle async state transitions
* Display audio output
* Recover session on reload

---

## 2. SCREEN INTEGRATION (STITCH ALIGNMENT)

This feature is NOT a separate page.

It is integrated into the main landing layout:

* Left Sidebar → unchanged
* Main Hero Section → reused
* Input Panel → becomes Sound Generator UI

---

## 3. UI ELEMENTS

### Input Panel

* Prompt Textarea
* Audio Length Input (optional number)
* Generate Button

---

### Status Area

* Status Text (Queued / Generating / Completed / Failed)
* Progress Indicator (animated)
* ETA display (if available)
* Last updated timestamp

---

### Result Area

* Audio Player
* Download Button
* Retry Button

---

## 4. USER FLOW

1. User enters prompt

2. Clicks "Generate Sound"

3. API call:
   POST /sound_generator

4. Receive:

   * task_id
   * conversion_id
   * status = IN_QUEUE

5. Immediately show:

   * "Queued..." (optimistic UI)

6. Start polling:
   GET /sound_generator/status

7. Update UI:

* IN_QUEUE → "Queued..."
* PROCESSING → "Generating sound..."
* COMPLETED → Show audio player
* FAILED / ERROR → Show error

8. Stop polling when terminal state reached

---

## 5. API MAPPING

### Create Sound

POST /sound_generator

Request:

```json
{
  "project_id": "string",
  "user_id": "string",
  "user_name": "string",
  "user_email": "string",
  "prompt": "string",
  "webhook_url": null,
  "audio_length": 5
}
```

Response:

```json
{
  "task_id": "string",
  "conversion_id": "string",
  "status": "IN_QUEUE"
}
```

---

### Poll Status

GET /sound_generator/status

Query:

* user_id
* task_id

Response:

```json
{
  "status": "IN_QUEUE | PROCESSING | COMPLETED | FAILED | ERROR",
  "audio_url": "string | null",
  "error_message": "string | null",
  "is_completed": boolean,
  "has_audio": boolean,
  "ready_for_download": boolean,
  "updated_at": "timestamp"
}
```

---

## 6. STATE MACHINE

States:

* IDLE
* SUBMITTING
* IN_QUEUE
* PROCESSING
* COMPLETED
* FAILED

---

### Transitions:

IDLE → SUBMITTING → IN_QUEUE
IN_QUEUE → PROCESSING
PROCESSING → COMPLETED
PROCESSING → FAILED
IN_QUEUE → FAILED (timeout)

---

## 7. UI STATE BEHAVIOR

### SUBMITTING

* Disable button
* Show loader

---

### IN_QUEUE

* Show "Queued..."
* Show ETA countdown (if available)
* Poll every 5 seconds

---

### PROCESSING

* Show "Generating sound..."
* Animated progress bar
* Poll every 3–5 seconds

---

### COMPLETED

* Stop polling
* Show audio player
* Show download button
* Smooth transition (fade-in)

---

### FAILED / ERROR

* Stop polling
* Show error message
* Show retry button

---

## 8. POLLING STRATEGY

* Default interval: 5 seconds
* Optional optimization:

  * IN_QUEUE → 5s
  * PROCESSING → 3s

Stop polling when:

* status === COMPLETED
* status === FAILED
* status === ERROR

Cancel polling on:

* component unmount
* navigation change

---

## 9. SESSION RECOVERY

Persist in localStorage:

```json
{
  "task_id": "string",
  "user_id": "string"
}
```

On reload:

* If task exists and not completed
  → Resume polling automatically

---

## 10. ERROR HANDLING

### Types:

1. Validation Error

   * Show inline error

2. API Error

   * Show toast + retry

3. Generation Failure

   * Show error_message

4. Timeout

   * "Generation took too long. Try again."

---

## 11. RETRY LOGIC

Retry button:

* Calls POST /sound_generator again
* Resets state
* Starts new polling cycle

---

## 12. AUDIO PLAYER

```html
<audio src="{audio_url}" controls />
```

---

### Behavior:

* Disabled until COMPLETED
* Enabled when ready
* preload = metadata
* autoplay = false

---

## 13. COMPONENTS

* PromptInput
* AudioLengthInput
* GenerateButton
* StatusIndicator
* ProgressBar
* AudioPlayer
* ErrorBanner
* RetryButton

---

## 14. UX ENHANCEMENTS

* Optimistic UI (show queued instantly)
* Smooth transitions between states
* Show last updated timestamp
* Prevent duplicate submissions
* Skeleton / loader states

---

## 15. PERFORMANCE

* Avoid duplicate polling calls
* Cancel polling on unmount
* Debounce input
* Lazy load audio player

---

## 16. ACCESSIBILITY

* Keyboard accessible inputs
* ARIA labels for player
* Clear status messages

---

## 17. ANTI-HALLUCINATION RULES

* Use ONLY defined APIs
* Do NOT invent endpoints
* Follow exact backend schema
* Respect async behavior

---

## 18. SUCCESS CRITERIA

Frontend must:

* Match Stitch layout
* Correctly implement async flow
* Handle all states
* Recover after reload
* Work without backend changes

---
