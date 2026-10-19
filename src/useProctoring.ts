import * as blazeface from '@tensorflow-models/blazeface';
import * as tf from '@tensorflow/tfjs';
import { useEffect, useRef, useState } from 'react';
import type {
    ProctoringStatus,
    ProctoringViolation,
    UseProctoringOptions,
    UseProctoringReturn,
    ViolationType,
} from './types';

let cachedModelPromise: Promise<blazeface.BlazeFaceModel> | null = null;

async function getBlazeFaceModel(): Promise<blazeface.BlazeFaceModel> {
    if (!cachedModelPromise) {
        cachedModelPromise = (async () => {
            await tf.ready();
            return await blazeface.load();
        })();
    }
    return cachedModelPromise;
}

export function useProctoring({
    stream,
    isActive = true,
    intervalMs = 2000,
    violationThreshold = 2,
    onViolation,
    onFaceCountChange,
}: UseProctoringOptions): UseProctoringReturn {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [model, setModel] = useState<blazeface.BlazeFaceModel | null>(null);
    const [status, setStatus] = useState<ProctoringStatus>('loading');
    const [faceCount, setFaceCount] = useState<number>(0);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [lastViolation, setLastViolation] = useState<ProctoringViolation | null>(null);

    const lastCheckTime = useRef<number>(0);
    const consecutiveViolations = useRef<{ type: ViolationType | null; count: number }>({
        type: null,
        count: 0,
    });

    // 1. Initialize TensorFlow & BlazeFace model once
    useEffect(() => {
        let isCancelled = false;

        setStatus('loading');
        setErrorMessage(null);

        getBlazeFaceModel()
            .then((loadedModel) => {
                if (!isCancelled) {
                    setModel(loadedModel);
                    setStatus('active');
                }
            })
            .catch((err) => {
                if (!isCancelled) {
                    const message = err instanceof Error ? err.message : 'Failed to load BlazeFace AI model';
                    setErrorMessage(message);
                    setStatus('error');
                    console.error('[react-proctor] Model load error:', err);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, []);

    // 2. Attach incoming stream to video element
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    // 3. Run throttled detection loop
    useEffect(() => {
        if (!isActive || !model || !videoRef.current || !stream) {
            return;
        }

        let animationFrameId: number;

        const checkFrame = async (time: number) => {
            if (time - lastCheckTime.current >= intervalMs) {
                lastCheckTime.current = time;

                try {
                    const video = videoRef.current;
                    if (video && video.readyState >= 2) {
                        const predictions = await model.estimateFaces(video, false);
                        const count = predictions.length;

                        setFaceCount(count);
                        onFaceCountChange?.(count);

                        let currentViolationType: ViolationType | null = null;
                        let violationMessage = '';

                        if (count === 0) {
                            currentViolationType = 'no_face';
                            violationMessage = 'No face detected. Please ensure you are visible to the camera.';
                        } else if (count > 1) {
                            currentViolationType = 'multiple_faces';
                            violationMessage = `Multiple faces detected (${count}). Only the registered candidate should be present.`;
                        }

                        // Handle threshold debounce
                        if (currentViolationType) {
                            if (consecutiveViolations.current.type === currentViolationType) {
                                consecutiveViolations.current.count += 1;
                            } else {
                                consecutiveViolations.current.type = currentViolationType;
                                consecutiveViolations.current.count = 1;
                            }

                            if (consecutiveViolations.current.count >= violationThreshold) {
                                const violation: ProctoringViolation = {
                                    type: currentViolationType,
                                    message: violationMessage,
                                    faceCount: count,
                                    timestamp: Date.now(),
                                };
                                setLastViolation(violation);
                                onViolation?.(violation);
                            }
                        } else {
                            consecutiveViolations.current = { type: null, count: 0 };
                        }
                    }
                } catch (err) {
                    console.error('[react-proctor] Detection cycle error:', err);
                }
            }

            animationFrameId = requestAnimationFrame(checkFrame);
        };

        animationFrameId = requestAnimationFrame(checkFrame);

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [isActive, model, stream, intervalMs, violationThreshold, onViolation, onFaceCountChange]);

    return {
        videoRef,
        status,
        faceCount,
        isModelLoaded: status === 'active',
        lastViolation,
        model,
        errorMessage,
    };
}
