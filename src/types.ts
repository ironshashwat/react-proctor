import type * as blazeface from '@tensorflow-models/blazeface';

export type ProctoringStatus = 'idle' | 'loading' | 'active' | 'error';

export type ViolationType = 'no_face' | 'multiple_faces' | 'model_error';

export interface ProctoringViolation {
    type: ViolationType;
    message: string;
    faceCount: number;
    timestamp: number;
}

export interface UseProctoringOptions {
    /**
     * Active MediaStream from the webcam.
     */
    stream: MediaStream | null;

    /**
     * Whether monitoring is currently enabled.
     * @default true
     */
    isActive?: boolean;

    /**
     * Interval in milliseconds between face detection checks.
     * Throttling saves CPU and prevents exam tab stutter.
     * @default 2000
     */
    intervalMs?: number;

    /**
     * Number of consecutive detection cycles with a violation before triggering onViolation.
     * Prevents false alarms from momentary head movements or blinks.
     * @default 2
     */
    violationThreshold?: number;

    /**
     * Callback triggered when a security violation occurs.
     */
    onViolation?: (violation: ProctoringViolation) => void;

    /**
     * Optional callback fired whenever the detected face count changes.
     */
    onFaceCountChange?: (count: number) => void;
}

export interface UseProctoringReturn {
    /**
     * Ref to attach to the `<video>` element consuming the MediaStream.
     */
    videoRef: React.RefObject<HTMLVideoElement | null>;

    /**
     * Current state of the AI model and detection lifecycle.
     */
    status: ProctoringStatus;

    /**
     * Number of faces currently detected in frame.
     */
    faceCount: number;

    /**
     * Whether the BlazeFace model has loaded successfully.
     */
    isModelLoaded: boolean;

    /**
     * The most recent security violation event.
     */
    lastViolation: ProctoringViolation | null;

    /**
     * Reference to the underlying BlazeFace model.
     */
    model: blazeface.BlazeFaceModel | null;

    /**
     * Error message if the model failed to initialize or execute.
     */
    errorMessage: string | null;
}

export interface ProctoringOverlayProps {
    /**
     * Active MediaStream from the webcam.
     */
    stream: MediaStream | null;

    /**
     * Whether monitoring is active.
     * @default true
     */
    isActive?: boolean;

    /**
     * Detection interval in milliseconds.
     * @default 2000
     */
    intervalMs?: number;

    /**
     * Consecutive violations required before alert triggers.
     * @default 2
     */
    violationThreshold?: number;

    /**
     * Callback triggered on security violation.
     */
    onViolation?: (violation: ProctoringViolation) => void;

    /**
     * On-screen position of the floating overlay.
     * @default 'bottom-right'
     */
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

    /**
     * Optional additional CSS class names.
     */
    className?: string;

    /**
     * Whether to show the live webcam video feed or just the status indicators.
     * @default true
     */
    showPreview?: boolean;
}

export interface UseWebcamStreamOptions {
    /**
     * Whether to automatically request the webcam on mount.
     * @default true
     */
    autoStart?: boolean;

    /**
     * MediaTrackConstraints for video.
     */
    videoConstraints?: MediaTrackConstraints;
}

export interface UseWebcamStreamReturn {
    stream: MediaStream | null;
    error: Error | null;
    isRequesting: boolean;
    start: () => Promise<MediaStream | null>;
    stop: () => void;
}
