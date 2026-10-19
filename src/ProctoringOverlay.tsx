import type { ProctoringOverlayProps } from './types';
import { useProctoring } from './useProctoring';

const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
};

// Lightweight inline SVG icons to ensure zero external icon library dependencies
function UserIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}

function UsersIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

function ShieldAlertIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
        </svg>
    );
}

export function ProctoringOverlay({
    stream,
    isActive = true,
    intervalMs = 2000,
    violationThreshold = 2,
    onViolation,
    position = 'bottom-right',
    className = '',
    showPreview = true,
}: ProctoringOverlayProps) {
    const { videoRef, status, faceCount } = useProctoring({
        stream,
        isActive,
        intervalMs,
        violationThreshold,
        onViolation,
    });

    const posClass = positionClasses[position] || positionClasses['bottom-right'];

    return (
        <div
            className={`fixed ${posClass} z-[9999] transition-all duration-300 pointer-events-auto select-none ${className}`}
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        >
            <div className="relative group overflow-hidden rounded-2xl border-2 border-white/20 bg-black/60 backdrop-blur-xl shadow-2xl ring-1 ring-black/10">
                {/* Webcam Preview Area */}
                <div className="relative w-48 h-36 bg-zinc-950/80 overflow-hidden">
                    {showPreview ? (
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover grayscale opacity-75 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-500">
                            <video ref={videoRef} autoPlay muted playsInline className="hidden" />
                            <span className="text-xs font-mono">Stream Active</span>
                        </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {status === 'loading' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/30 text-blue-200 border border-blue-400/30 backdrop-blur-md animate-pulse">
                                Initializing AI...
                            </span>
                        ) : status === 'active' ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/25 text-emerald-200 border border-emerald-400/30 backdrop-blur-md">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Monitoring
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-500/30 text-red-200 border border-red-400/30 backdrop-blur-md">
                                AI Offline
                            </span>
                        )}
                    </div>

                    {/* Face Detection & Verification Footer */}
                    <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center px-1">
                        <div className="flex gap-1">
                            {faceCount === 1 ? (
                                <div
                                    title="1 Candidate Verified"
                                    className="h-7 w-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30 transition-transform transform group-hover:scale-105"
                                >
                                    <UserIcon className="h-4 w-4" />
                                </div>
                            ) : faceCount > 1 ? (
                                <div
                                    title="Multiple Faces Detected"
                                    className="h-7 w-7 rounded-lg bg-red-500/25 flex items-center justify-center text-red-400 border border-red-500/40 animate-bounce"
                                >
                                    <UsersIcon className="h-4 w-4" />
                                </div>
                            ) : (
                                <div
                                    title="No Face in Frame"
                                    className="h-7 w-7 rounded-lg bg-amber-500/25 flex items-center justify-center text-amber-300 border border-amber-500/40"
                                >
                                    <ShieldAlertIcon className="h-4 w-4" />
                                </div>
                            )}
                        </div>

                        <div
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shadow-sm transition-all duration-200 ${
                                faceCount === 1
                                    ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                                    : 'bg-red-500 text-white animate-pulse shadow-red-500/40'
                            }`}
                        >
                            {faceCount === 1 ? 'Secure' : faceCount > 1 ? 'Multiple' : 'No Face'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
