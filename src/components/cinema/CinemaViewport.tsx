/**
 * CinemaViewport — src/components/cinema/CinemaViewport.tsx
 *
 * The single React component that renders a lesson.
 * 100% dumb — no logic, no state, no engine calls.
 *
 * Input:  PresentationModel + CinemaControls
 * Output: 6 layers composed into a theatre viewport
 *
 * Rule: "React never decides. React only renders PresentationModel."
 *
 * Layer stack (bottom → top):
 *   StageLayer       — SVG scene visual
 *   SubtitleLayer    — Dialogue / concept text
 *   InteractionLayer — Quiz / predict / reflect UI
 *   MemoryLayer      — Anchor image + sentence
 *   EffectLayer      — Overlay flash, reveal pulse (CSS only)
 *   HUDLayer         — Progress bar, act dots, controls
 */
import React from 'react';
import { PresentationModel } from '../../cinema/presentation/PresentationModel';
import { CinemaControls } from '../../hooks/useCinemaEngine';
import StageLayer from './StageLayer';
import SubtitleLayer from './SubtitleLayer';
import InteractionLayer from './InteractionLayer';
import MemoryLayer from './MemoryLayer';
import EffectLayer from './EffectLayer';
import HUDLayer from './HUDLayer';

interface Props {
    model: PresentationModel;
    controls: CinemaControls;
    onExit?: () => void;
}

const CinemaViewport: React.FC<Props> = ({ model, controls, onExit }) => {
    const { scene, subtitle, interaction, memory, audio, progress, controls: ctrl } = model;

    const accentColor = scene?.accentColor ?? progress.accentColor;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: '#04000e',
            color: '#e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
        }}>
            <style>{`
                * { box-sizing: border-box; }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-thumb { background: rgba(124,58,237,.32); border-radius: 4px; }
            `}</style>

            {/* ── THEATRE AREA ─────────────────────────────── */}
            <div style={{
                flexShrink: 0,
                height: ctrl.isFullscreen
                    ? '100dvh'
                    : 'clamp(300px, 58dvh, 420px)',
                display: 'flex',
                flexDirection: 'column',
                borderBottom: `2px solid ${accentColor}2a`,
                transition: 'height .3s ease',
                position: 'relative',
            }}>

                {/* HUD — top bar */}
                <HUDLayer
                    lessonTitle={model.lessonTitle}
                    progress={progress}
                    audio={audio}
                    controls={controls}
                    ctrlPresentation={ctrl}
                    accentColor={accentColor}
                    onExit={onExit}
                />

                {/* STAGE — fills remaining height */}
                <div style={{
                    flex: 1,
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    {/* Layer 1: Stage (SVG scene) */}
                    {scene && (
                        <StageLayer scene={scene} />
                    )}

                    {/* Layer 2: Effect overlay */}
                    <EffectLayer
                        progress={progress}
                        accentColor={accentColor}
                        audio={audio}
                    />

                    {/* Layer 3: Memory anchor */}
                    {memory.visible && (
                        <MemoryLayer memory={memory} accentColor={accentColor} />
                    )}

                    {/* Loading state */}
                    {progress.playbackState === 'loading' && (
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 12,
                            background: 'rgba(4,0,14,.85)',
                            zIndex: 20,
                        }}>
                            <style>{`@keyframes cv-spin { to { transform: rotate(360deg); } }`}</style>
                            <div style={{
                                width: 28, height: 28,
                                border: `3px solid ${accentColor}40`,
                                borderTop: `3px solid ${accentColor}`,
                                borderRadius: '50%',
                                animation: 'cv-spin 1s linear infinite',
                            }} />
                            <span style={{ color: '#4b5563', fontSize: '.72rem' }}>
                                {model.lessonTitle ? `Preparing "${model.lessonTitle}"…` : 'Loading…'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Layer 4: Subtitle bar */}
                <SubtitleLayer subtitle={subtitle} accentColor={accentColor} />

                {/* Layer 5: Interaction overlay (above subtitle when active) */}
                {interaction.mode !== 'hidden' && (
                    <InteractionLayer
                        interaction={interaction}
                        accentColor={accentColor}
                        onRespond={controls.respondToInteraction}
                        onAcknowledge={controls.acknowledgeReflection}
                    />
                )}
            </div>

            {/* ── SCROLLABLE CONTENT (post-lesson) ─────────── */}
            {model.reflectionQuestions.length > 0 || model.examInsight || model.progress.lessonComplete ? (
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    background: 'rgba(4,0,12,.99)',
                    padding: '14px 16px 60px',
                }}>
                    {/* Reflection */}
                    {model.reflectionQuestions.length > 0 && (
                        <section style={{ marginBottom: 20 }}>
                            <h3 style={{
                                color: '#fff', fontWeight: 900,
                                fontSize: 'clamp(.84rem,2.5vw,1rem)',
                                marginBottom: 10,
                            }}>
                                💭 Reflect
                            </h3>
                            {model.reflectionQuestions.map((q, i) => (
                                <div key={i} style={{
                                    background: 'rgba(255,255,255,.02)',
                                    border: `1px solid ${accentColor}22`,
                                    borderRadius: 10,
                                    padding: '10px 13px',
                                    marginBottom: 8,
                                    color: '#e2e8f0',
                                    fontSize: 'clamp(.74rem,1.9vw,.86rem)',
                                    lineHeight: 1.5,
                                }}>
                                    {i + 1}. {q}
                                </div>
                            ))}
                        </section>
                    )}

                    {/* Exam Insight */}
                    {model.examInsight && (
                        <section style={{ marginBottom: 20 }}>
                            <div style={{
                                background: 'rgba(255,255,255,.02)',
                                border: '1px solid rgba(167,139,250,.18)',
                                borderRadius: 13,
                                padding: '13px 15px',
                            }}>
                                <h3 style={{
                                    color: '#fff', fontWeight: 900,
                                    fontSize: 'clamp(.84rem,2.5vw,1.05rem)',
                                    marginBottom: 10,
                                }}>
                                    📝 TN Board Insight
                                </h3>
                                <p style={{
                                    color: '#e2e8f0',
                                    fontSize: 'clamp(.74rem,1.9vw,.86rem)',
                                    lineHeight: 1.55,
                                    marginBottom: 8,
                                }}>
                                    {model.examInsight.tnBoardPattern}
                                </p>
                                <span style={{
                                    background: 'rgba(34,197,94,.09)',
                                    border: '1px solid rgba(34,197,94,.32)',
                                    color: '#86efac',
                                    borderRadius: 9999,
                                    padding: '4px 10px',
                                    fontWeight: 700,
                                    fontSize: '.72rem',
                                }}>
                                    🎯 {model.examInsight.marksTip}
                                </span>
                            </div>
                        </section>
                    )}

                    {/* Memory anchor reminder */}
                    {model.memoryAnchorReminder && (
                        <div style={{
                            textAlign: 'center',
                            padding: '12px 16px',
                            color: '#a78bfa',
                            fontSize: 'clamp(.74rem,1.9vw,.86rem)',
                            fontStyle: 'italic',
                            borderTop: `1px solid ${accentColor}22`,
                        }}>
                            🧠 {model.memoryAnchorReminder}
                        </div>
                    )}

                    {/* Exit */}
                    {model.progress.lessonComplete && onExit && (
                        <div style={{ textAlign: 'center', marginTop: 16 }}>
                            <button
                                onClick={onExit}
                                style={{
                                    background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                                    color: '#fff', border: 'none', borderRadius: 11,
                                    padding: '10px 24px', fontWeight: 900,
                                    fontSize: '.86rem', cursor: 'pointer',
                                }}
                            >
                                🎬 New Cinema
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div style={{
                    flex: 1,
                    background: 'rgba(4,0,12,.99)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <span style={{ color: '#1e293b', fontSize: '.6rem' }}>
                        {progress.playbackState === 'playing'
                            ? `Act ${progress.actIndex + 1} of ${progress.actTotal}`
                            : progress.playbackState === 'complete'
                            ? 'Lesson complete'
                            : ''}
                    </span>
                </div>
            )}
        </div>
    );
};

export default CinemaViewport;
