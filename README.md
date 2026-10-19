# @ironshashwat/react-proctor 👁️⚡

> **Zero-server-cost, privacy-first AI exam proctoring and presence monitoring for React applications using TensorFlow.js BlazeFace.**

[![npm version](https://img.shields.io/npm/v/@ironshashwat/react-proctor.svg?style=flat-square)](https://www.npmjs.com/package/@ironshashwat/react-proctor)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square)](https://www.typescriptlang.org/)
[![Privacy: 100% Local](https://img.shields.io/badge/Privacy-100%25%20On--Device-emerald?style=flat-square)](https://github.com/ironshashwat/react-proctor)

---

## ✨ Features

- 🛡️ **Zero-Server Costs**: Runs 100% locally in the candidate's browser via WebAssembly / WebGL. No video streams are ever uploaded to a server.
- ⚡ **Lightweight & Battery-Friendly**: Runs throttled detection cycles (default: 0.5Hz / every 2 seconds) so exam pages and code editors never lag.
- 👤 **Face Count Verification**:
  - Detects when the candidate leaves the camera (`no_face`).
  - Detects when an unauthorized second person enters the frame (`multiple_faces`).
- 🎛️ **Dual Architecture**:
  - **Headless Hook (`useProctoring`)**: Complete freedom to craft your own custom UI.
  - **Turnkey Component (`<ProctoringOverlay />`)**: Beautiful floating glassmorphic picture-in-picture overlay.
- 📷 **Built-in Camera Helper**: Includes `useWebcamStream()` to acquire webcam video permissions without writing boilerplate.
- 🔕 **False Alarm Filter**: Built-in consecutive violation threshold (debounce) so brief blinks or looking down at the keyboard don't trigger false flags.

---

## 📦 Installation

```bash
npm install @ironshashwat/react-proctor @tensorflow/tfjs @tensorflow-models/blazeface
# or
pnpm add @ironshashwat/react-proctor @tensorflow/tfjs @tensorflow-models/blazeface
# or
yarn add @ironshashwat/react-proctor @tensorflow/tfjs @tensorflow-models/blazeface
```

---

## 🚀 Quick Start

### Option 1: Turnkey Floating Overlay

Drop `<ProctoringOverlay />` into your exam or quiz layout:

```tsx
import React from 'react';
import { ProctoringOverlay, useWebcamStream } from '@ironshashwat/react-proctor';

export function ExamPage() {
    const { stream, error } = useWebcamStream();

    const handleViolation = (violation) => {
        console.warn('Security Alert:', violation.message);
        // Report violation to your backend API or append to candidate log:
        // logProctoringEvent({ type: violation.type, timestamp: violation.timestamp });
    };

    if (error) {
        return <div>Please enable your webcam to continue the exam.</div>;
    }

    return (
        <div className="relative min-h-screen">
            <h1>Midterm Examination</h1>
            {/* Exam questions, code editor, or quiz content */}

            {/* Floating Proctoring PiP */}
            <ProctoringOverlay
                stream={stream}
                position="bottom-right"
                intervalMs={2000}
                violationThreshold={2}
                onViolation={handleViolation}
            />
        </div>
    );
}
```

---

### Option 2: Headless Hook (`useProctoring`)

Build your own customized exam HUD:

```tsx
import React from 'react';
import { useProctoring, useWebcamStream } from '@ironshashwat/react-proctor';

export function CustomExamHUD() {
    const { stream } = useWebcamStream();

    const {
        videoRef,
        status,
        faceCount,
        lastViolation,
    } = useProctoring({
        stream,
        intervalMs: 1500,
        violationThreshold: 2,
        onViolation: (violation) => {
            alert(`Exam Violation: ${violation.message}`);
        },
    });

    return (
        <header className="flex items-center justify-between p-4 bg-slate-900 text-white">
            {/* Hidden video element required for BlazeFace detection */}
            <video ref={videoRef} autoPlay muted playsInline className="hidden" />

            <div>Status: {status === 'active' ? '🟢 Monitoring Active' : '🟡 Initializing AI...'}</div>
            <div>Candidate Count: {faceCount === 1 ? '✅ Verified' : '⚠️ Alert'}</div>
        </header>
    );
}
```

---

## 📖 API Reference

### `<ProctoringOverlay />` Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `stream` | `MediaStream \| null` | *Required* | Active camera stream from `useWebcamStream()` or `navigator.mediaDevices.getUserMedia()`. |
| `isActive` | `boolean` | `true` | Whether active AI face tracking is running. |
| `intervalMs` | `number` | `2000` | Milliseconds between detection frames (saves CPU). |
| `violationThreshold` | `number` | `2` | Number of consecutive detection cycles with a violation required before firing `onViolation`. |
| `onViolation` | `(v: ProctoringViolation) => void` | `undefined` | Callback fired when a verified violation occurs. |
| `position` | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left'` | `'bottom-right'` | Placement of the floating badge. |
| `showPreview` | `boolean` | `true` | Show video thumbnail inside the overlay. |
| `className` | `string` | `""` | Additional Tailwind / CSS class names. |

---

### `useProctoring(options)`

#### Options:
```ts
interface UseProctoringOptions {
    stream: MediaStream | null;
    isActive?: boolean;
    intervalMs?: number;
    violationThreshold?: number;
    onViolation?: (violation: ProctoringViolation) => void;
    onFaceCountChange?: (count: number) => void;
}
```

#### Returns:
```ts
interface UseProctoringReturn {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    status: 'idle' | 'loading' | 'active' | 'error';
    faceCount: number;
    isModelLoaded: boolean;
    lastViolation: ProctoringViolation | null;
    model: blazeface.BlazeFaceModel | null;
    errorMessage: string | null;
}
```

---

### `ProctoringViolation` Object

```ts
interface ProctoringViolation {
    type: 'no_face' | 'multiple_faces' | 'model_error';
    message: string;
    faceCount: number;
    timestamp: number;
}
```

---

## 🔒 Privacy & Performance

1. **100% Client-Side**: No video frames or biometric face vectors leave the student's computer. It complies with GDPR, FERPA, and strict student privacy mandates.
2. **CPU-Throttled**: Traditional ML models running at 30 or 60 FPS cause high CPU temperatures and tab freezes during exams. `@ironshashwat/react-proctor` runs at an optimized 0.5 Hz (every 2,000ms), keeping CPU utilization under 4% on modern devices.

---

## 📄 License

MIT © [Shashwat](https://github.com/ironshashwat)
