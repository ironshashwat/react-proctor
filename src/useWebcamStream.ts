import { useCallback, useEffect, useState } from 'react';
import type { UseWebcamStreamOptions, UseWebcamStreamReturn } from './types';

export function useWebcamStream(options: UseWebcamStreamOptions = {}): UseWebcamStreamReturn {
    const { autoStart = true, videoConstraints = { width: 320, height: 240, facingMode: 'user' } } = options;

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [isRequesting, setIsRequesting] = useState<boolean>(false);

    const start = useCallback(async (): Promise<MediaStream | null> => {
        if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
            const err = new Error('navigator.mediaDevices.getUserMedia is not supported in this browser environment.');
            setError(err);
            return null;
        }

        try {
            setIsRequesting(true);
            setError(null);

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: videoConstraints,
                audio: false,
            });

            setStream(mediaStream);
            return mediaStream;
        } catch (err) {
            const customError = err instanceof Error ? err : new Error(String(err));
            setError(customError);
            console.error('[react-proctor] Failed to acquire webcam stream:', customError);
            return null;
        } finally {
            setIsRequesting(false);
        }
    }, [videoConstraints]);

    const stop = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
    }, [stream]);

    useEffect(() => {
        if (autoStart) {
            start();
        }

        return () => {
            stop();
        };
    }, [autoStart]);

    return {
        stream,
        error,
        isRequesting,
        start,
        stop,
    };
}
