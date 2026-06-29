/**
 * HUDLayer — src/components/cinema/HUDLayer.tsx
 *
 * Heads-Up Display. Zero logic.
 * Input:  ProgressPresentation + AudioPresentation + CinemaControls
 * Output: Top bar (title + act dots + fullscreen) + Control bar (play/pause/vol/progress)
 */
import React, { useState } from 'react';
import {
    ProgressPresentation,
    AudioPresentation,
    ControlsPresentation,
} from '../../cinema/presentation/PresentationModel';
import { CinemaControls } from '../../hooks/useCinemaEngine';

const ACT_COLORS = ['#f59e0b', '#60a5fa', '#f43f5e', '#34d399', '#a78bfa'];

interface Props {
    lessonTitle: string;
    progress: ProgressPresentation;
    audio: AudioPresentation;
    controls: CinemaControls;
    ctrlPresentation: ControlsPresentation;
    accentColor: string;
    onExit?: () => void;
}

const HUDLayer: React.FC<Props> = ({
    lessonTitle,
    progress,
    audio,
    controls,
    ctrlPresentation,
    accentColor,
    onExit,
}) => {
    const isPlaying = progress.playbackState === 'playing';
    const isLoading = progress.playbackState === 'loading' || progress.playbackState === 'starting';
    const [confirmExit, setConfirmExit] = useState(false);

    const handleExitClick = () => setConfirmExit(true);
    const handleExitConfirm = () => { setConfirmExit(false); onExit?.(); };
    const handleExitCancel = () => setConfirmExit(false);

    return (
        <>
            {/* ── EXIT CONFIRMATION OVERLAY ───────────────────── */}
            {confirmExit && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 100,
                    background: 'rgba(4,0,14,.92)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 16,
                }}>
                    <div style={{ fontSize: '2rem' }}>🎬</div>
                    <p style={{
                        color: '#e2e8f0',
                        fontSize: '.9rem',
                        fontWeight: 700,
                        textAlign: 'center',
                        margin: 0,
                    }}>
                        Lesson is still playing.
                    </p>
                    <p style={{
                        color: '#6b7280',
                        fontSize: '.75rem',
                        textAlign: 'center',
                        margin: 0,
                    }}>
                        Are you sure you want to exit?
                    </p>
                    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                        <button
                            onClick={handleExitCancel}
                            style={{
                                background: `${accentColor}20`,
                                border: `1px solid ${accentColor}60`,
                                borderRadius: 8,
                                padding: '8px 20px',
                                color: accentColor,
                                fontWeight: 700,
                                fontSize: '.8rem',
                                cursor: 'pointer',
                            }}
                        >
                            ▶ Continue
                        </button>
                        <button
                            onClick={handleExitConfirm}
                            style={{
                                background: 'rgba(239,68,68,.12)',
                                border: '1px solid rgba(239,68,68,.4)',
                                borderRadius: 8,
                                padding: '8px 20px',
                                color: '#ef4444',
                                fontWeight: 700,
                                fontSize: '.8rem',
                                cursor: 'pointer',
                            }}
                        >
                            Exit Lesson
                        </button>
                    </div>
                </div>
            )}

            {/* ── TOP BAR ────────────────────────────────────── */}
            <div style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 12px',
                background: 'rgba(4,0,14,.97)',
                borderBottom: `1px solid ${accentColor}18`,
            }}>
                <span style={{ fontSize: '.9rem' }}>🎬</span>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        fontWeight: 900,
                        fontSize: 'clamp(.6rem,2vw,.78rem)',
                        color: '#fff',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}>
                        {lessonTitle}
                    </div>
                    <div style={{ fontSize: '.5rem', color: '#4b5563' }}>
                        {progress.actLabel} · Act {progress.actIndex + 1}/{progress.actTotal}
                    </div>
                </div>

                {/* Act dots */}
                <div style={{ display: 'flex', gap: 4 }}>
                    {Array.from({ length: progress.actTotal }, (_, i) => {
                        const c2 = ACT_COLORS[i] ?? accentColor;
                        const done = progress.actsCompleted.includes(i);
                        const current = i === progress.actIndex;
                        return (
                            <div
                                key={i}
                                title={`Act ${i + 1}`}
                                style={{
                                    width: current ? 18 : 6,
                                    height: 6,
                                    borderRadius: 9999,
                                    transition: 'all .3s',
                                    background: current ? c2 : done ? `${c2}55` : 'rgba(255,255,255,.14)',
                                }}
                            />
                        );
                    })}
                </div>

                {onExit && (
                    <button
                        onClick={handleExitClick}
                        title="Exit lesson"
                        style={{
                            background: 'none',
                            border: '1px solid rgba(148,163,184,.14)',
                            borderRadius: 6,
                            padding: '3px 7px',
                            color: '#374151',
                            cursor: 'pointer',
                            fontSize: '.56rem',
                            fontWeight: 700,
                        }}
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* ── CONTROL BAR ────────────────────────────────── */}
            <div style={{
                position: 'absolute',
                bottom: 54,
                left: 0, right: 0,
                zIndex: 15,
                flexShrink: 0,
                background: 'rgba(5,0,14,.99)',
                borderTop: `1px solid ${accentColor}18`,
                padding: '5px 12px',
                display: 'flex',
                gap: 6,
                alignItems: 'center',
            }}>
                <button
                    onClick={isPlaying ? controls.pause : controls.play}
                    disabled={isLoading}
                    style={{
                        background: `${accentColor}20`,
                        border: `1px solid ${accentColor}60`,
                        borderRadius: 6,
                        padding: '4px 12px',
                        color: accentColor,
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        fontSize: '.88rem',
                        opacity: isLoading ? 0.5 : 1,
                    }}
                >
                    {isLoading ? '⏳' : isPlaying ? '⏸' : '▶'}
                </button>

                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span style={{ color: accentColor, fontSize: '.5rem', fontWeight: 800 }}>
                            {progress.actLabel}
                        </span>
                        <span style={{ color: '#1f2937', fontSize: '.5rem' }}>
                            {progress.actIndex + 1}/{progress.actTotal}
                        </span>
                    </div>
                    <div style={{ height: 2.5, background: 'rgba(255,255,255,.07)', borderRadius: 9999 }}>
                        <div style={{
                            height: '100%',
                            background: accentColor,
                            borderRadius: 9999,
                            width: `${progress.progressPercent}%`,
                            transition: 'width .4s',
                        }} />
                    </div>
                </div>

                <button
                    onClick={() => controls.setMuted(!audio.isMuted)}
                    style={{
                        background: 'rgba(255,255,255,.04)',
                        border: '1px solid rgba(148,163,184,.12)',
                        borderRadius: 6,
                        padding: '4px 7px',
                        color: audio.isMuted ? '#4b5563' : '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '.78rem',
                    }}
                >
                    {audio.isMuted ? '🔇' : '🔊'}
                </button>

                <input
                    type="range" min="0" max="1" step="0.05"
                    value={audio.isMuted ? 0 : audio.volume}
                    onChange={e => {
                        const v = +e.target.value;
                        controls.setVolume(v);
                        if (v === 0) controls.setMuted(true);
                        else controls.setMuted(false);
                    }}
                    style={{ width: 50, accentColor, cursor: 'pointer' }}
                />
            </div>
        </>
    );
};

export default HUDLayer;
