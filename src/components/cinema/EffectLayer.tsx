/**
 * EffectLayer — src/components/cinema/EffectLayer.tsx
 *
 * Visual effects overlay. CSS only. Zero logic.
 * Input:  ProgressPresentation + AudioPresentation
 * Output: Audio visualiser bars + silence pulse + audio bars
 */
import React from 'react';
import { ProgressPresentation, AudioPresentation } from '../../cinema/presentation/PresentationModel';

interface Props {
    progress: ProgressPresentation;
    accentColor: string;
    audio: AudioPresentation;
}

const EffectLayer: React.FC<Props> = ({ progress, accentColor, audio }) => {
    return (
        <>
            {/* Audio visualiser bars (top-right) */}
            {audio.isPlaying && !audio.isMuted && (
                <div style={{
                    position: 'absolute',
                    top: 8, right: 10,
                    zIndex: 10,
                    display: 'flex',
                    gap: 2,
                    alignItems: 'flex-end',
                    height: 13,
                    pointerEvents: 'none',
                }}>
                    {audio.visualizerBars.map((h, j) => (
                        <div key={j} style={{
                            width: 3,
                            background: accentColor,
                            borderRadius: 2,
                            height: `${4 + h * 9}px`,
                            transition: 'height .08s',
                        }} />
                    ))}
                </div>
            )}

            {/* Silence phase pulse */}
            {audio.isSilence && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 8,
                    background: `radial-gradient(ellipse at 50% 50%, ${accentColor}08, transparent 70%)`,
                    pointerEvents: 'none',
                }} />
            )}

            {/* Loading spinner (top-left) */}
            {progress.playbackState === 'starting' && (
                <div style={{
                    position: 'absolute',
                    top: 8, left: 13,
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    pointerEvents: 'none',
                }}>
                    <style>{`@keyframes el-spin { to { transform: rotate(360deg); } }`}</style>
                    <div style={{
                        width: 8, height: 8,
                        border: `2px solid ${accentColor}40`,
                        borderTop: `2px solid ${accentColor}`,
                        borderRadius: '50%',
                        animation: 'el-spin 1s linear infinite',
                    }} />
                    <span style={{ color: '#374151', fontSize: '.48rem' }}>starting…</span>
                </div>
            )}
        </>
    );
};

export default EffectLayer;
