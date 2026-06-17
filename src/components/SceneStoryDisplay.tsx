import React, { useState, useRef, useEffect } from 'react';
import { SceneStory, StoryScene } from '../types';
import { QuizSection } from './StoryDisplay';
import { useAuth } from '../context/AuthContext';
import html2canvas from 'html2canvas';

// Scene-based story display for Grades 10-12 ("மாயக் கற்றல் உலகம்").
// Dark-purple theme consistent with StoryGeneratorForm. Reuses QuizSection from
// StoryDisplay; certificate is inlined. Grades 1-9 continue to use StoryDisplay.

const SCENE_META: Record<string, { icon: string; label: string; accent: string }> = {
    hook:         { icon: '🎬', label: 'Hook',         accent: '#f59e0b' },
    conflict:     { icon: '⚡', label: 'Conflict',     accent: '#ef4444' },
    discovery:    { icon: '💡', label: 'Discovery',    accent: '#fbbf24' },
    application:  { icon: '🔧', label: 'Application',  accent: '#22d3ee' },
    reflection:   { icon: '🌟', label: 'Reflection',   accent: '#a855f7' },
    exam_connect: { icon: '📝', label: 'Exam Connect', accent: '#34d399' },
};

const SceneCard: React.FC<{ scene: StoryScene }> = ({ scene }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    const [revealed, setRevealed] = useState(false);
    const meta = SCENE_META[scene.scene_type] ?? { icon: '🎬', label: scene.scene_type, accent: '#7c3aed' };

    // Fade in on scroll
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold: 0.15 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(40px)',
                transition: 'opacity 0.6s ease, transform 0.6s ease',
                background: 'rgba(20,16,45,0.6)',
                border: `1px solid ${meta.accent}40`,
                borderLeft: `4px solid ${meta.accent}`,
                borderRadius: 20,
                padding: 24,
                marginBottom: 24,
                backdropFilter: 'blur(8px)',
            }}
        >
            {/* Badge + setting pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${meta.accent}22`, border: `1px solid ${meta.accent}`, color: meta.accent, borderRadius: 999, padding: '6px 14px', fontSize: 13, fontWeight: 700 }}>
                    <span style={{ fontSize: 16 }}>{meta.icon}</span>
                    Scene {scene.scene_number} · {meta.label}
                </span>
                {scene.setting && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(99,102,241,0.4)', color: '#c4b5fd', borderRadius: 999, padding: '6px 14px', fontSize: 12, fontWeight: 600 }}>
                        📍 {scene.setting}
                    </span>
                )}
            </div>

            {/* Scene title */}
            <h3 style={{ color: '#eeeef8', fontSize: 24, fontWeight: 800, margin: '0 0 12px', letterSpacing: '-0.3px' }}>{scene.scene_title}</h3>

            {/* Character chips */}
            {scene.characters && scene.characters.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                    {scene.characters.map((c, i) => (
                        <span key={i} style={{ background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(167,139,250,0.35)', color: '#d8b4fe', borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>
                            👤 {c}
                        </span>
                    ))}
                </div>
            )}

            {/* Narrative */}
            <p style={{ color: '#d4d4e8', fontSize: 18, lineHeight: 1.7, margin: '0 0 20px' }}>{scene.narrative}</p>

            {/* Concept highlight — purple accent */}
            {scene.concept_highlight && (
                <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.18), rgba(79,70,229,0.12))', border: '1px solid rgba(167,139,250,0.4)', borderRadius: 14, padding: '14px 18px', marginBottom: 20 }}>
                    <div style={{ color: '#a855f7', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>💜 Concept</div>
                    <p style={{ color: '#e9d5ff', fontSize: 15, lineHeight: 1.6, margin: 0 }}>{scene.concept_highlight}</p>
                </div>
            )}

            {/* Socratic question — tap to reveal hint */}
            {scene.socratic_question && (
                <div style={{ background: 'rgba(13,13,28,0.6)', border: '1px solid #3a3a5a', borderRadius: 14, padding: '16px 18px' }}>
                    <div style={{ color: '#fbbf24', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>🤔 Think about it</div>
                    <p style={{ color: '#eeeef8', fontSize: 16, fontWeight: 600, lineHeight: 1.5, margin: '0 0 14px' }}>{scene.socratic_question}</p>
                    {!revealed ? (
                        <button
                            onClick={() => setRevealed(true)}
                            style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none', borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 700, padding: '8px 16px', cursor: 'pointer' }}
                        >
                            💡 Reveal answer hint
                        </button>
                    ) : (
                        <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.35)', borderRadius: 10, padding: '12px 14px', animation: 'sceneFadeIn 0.3s ease' }}>
                            <span style={{ color: '#34d399', fontWeight: 700, fontSize: 13 }}>Hint: </span>
                            <span style={{ color: '#d1fae5', fontSize: 14, lineHeight: 1.5 }}>{scene.student_response_hint}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

interface SceneStoryDisplayProps {
    sceneStory: SceneStory;
    onTryAnother: () => void;
}

const SceneStoryDisplay: React.FC<SceneStoryDisplayProps> = ({ sceneStory, onTryAnother }) => {
    const { user, userProfile } = useAuth();
    const certificateRef = useRef<HTMLDivElement>(null);
    const [quizScore, setQuizScore] = useState<number | null>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [toast, setToast] = useState('');

    const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2000); };

    const pill: React.CSSProperties = {
        background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(99,102,241,0.4)',
        color: '#c4b5fd', borderRadius: 999, padding: '6px 16px', fontSize: 13, fontWeight: 700,
    };

    const handleShareCertificate = async () => {
        if (!certificateRef.current) return;
        setIsSharing(true);
        try {
            const canvas = await html2canvas(certificateRef.current, { scale: 2, backgroundColor: null, logging: false, useCORS: true });
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
            if (!blob) throw new Error('Failed to render certificate');
            const file = new File([blob], 'certificate.png', { type: 'image/png' });
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], title: 'FeelEd AI Certificate', text: `I completed "${sceneStory.title}" on FeelEd AI! 🎓` });
            } else {
                const link = document.createElement('a');
                link.download = 'feeled-ai-certificate.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
                showToast('Certificate downloaded ✓');
            }
        } catch (e) {
            console.error('Sharing failed:', e);
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', width: '100%', background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 40%, #24243e 100%)', padding: '20px 0 80px' }}>
            <style>{`@keyframes sceneFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes sceneBounceIn{0%{opacity:0;transform:scale(0.92)}60%{transform:scale(1.03)}100%{opacity:1;transform:scale(1)}}`}</style>

            <div style={{ width: '100%', maxWidth: 860, margin: '0 auto', padding: '0 20px', boxSizing: 'border-box' }}>

                {/* Back */}
                <button onClick={onTryAnother} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#7c7ca8', fontSize: 13, fontWeight: 600, background: 'none', border: '0.5px solid #3a3a5a', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', marginBottom: 20 }}>
                    ← New Story
                </button>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(167,139,250,0.4)', borderRadius: 24, padding: '6px 16px', marginBottom: 16 }}>
                        <span>🎬</span>
                        <span style={{ color: '#c4b5fd', fontSize: 13, fontWeight: 600, letterSpacing: '0.5px' }}>மாயக் கற்றல் உலகம் · SCENE STORY</span>
                    </div>
                    <h1 style={{ fontSize: 'clamp(28px,6vw,44px)', fontWeight: 800, background: 'linear-gradient(135deg,#ffffff,#c4b5fd,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', margin: '0 0 12px', lineHeight: 1.2 }}>{sceneStory.title}</h1>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <span style={pill}>Grade {String(sceneStory.grade).replace(/\D/g, '') || sceneStory.grade}</span>
                        <span style={pill}>{sceneStory.subject}</span>
                    </div>
                    {sceneStory.curriculum_connection && (
                        <p style={{ color: 'rgba(196,181,253,0.7)', fontSize: 13, marginTop: 12 }}>📘 {sceneStory.curriculum_connection}</p>
                    )}
                </div>

                {/* Scenes */}
                {(sceneStory.scenes ?? []).map(scene => <SceneCard key={scene.scene_number} scene={scene} />)}

                {/* Exam tips */}
                {sceneStory.exam_tips && sceneStory.exam_tips.length > 0 && (
                    <div style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 20, padding: 24, marginTop: 8, marginBottom: 32 }}>
                        <h3 style={{ color: '#34d399', fontSize: 18, fontWeight: 800, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>📝 TN Board Exam Tips</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {sceneStory.exam_tips.map((tip, i) => (
                                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                    <span style={{ flexShrink: 0, width: 24, height: 24, borderRadius: '50%', background: '#059669', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>{i + 1}</span>
                                    <p style={{ color: '#d1fae5', fontSize: 15, lineHeight: 1.6, margin: 0 }}>{tip}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quiz — reused from StoryDisplay */}
                <QuizSection quiz={sceneStory.quiz} onQuizComplete={score => setQuizScore(score)} />

                {/* Certificate on quiz complete */}
                {quizScore !== null && (
                    <div style={{ marginTop: 40, animation: 'sceneBounceIn 0.5s ease' }}>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <h3 style={{ color: '#fff', fontSize: 28, fontWeight: 800, margin: '0 0 8px' }}>Congratulations! 🎊</h3>
                            <p style={{ color: 'rgba(196,181,253,0.7)', fontSize: 14, margin: 0 }}>You completed the scene journey and the quiz.</p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                            <div
                                ref={certificateRef}
                                style={{ width: '100%', maxWidth: 600, aspectRatio: '1.414 / 1', background: '#ffffff', border: '14px solid #4f46e5', padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', textAlign: 'center', boxSizing: 'border-box' }}
                            >
                                <div>
                                    <div style={{ width: 64, height: 64, background: '#4f46e5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 26, fontWeight: 900, margin: '0 auto 12px' }}>F</div>
                                    <div style={{ color: '#4f46e5', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: 12 }}>Certificate of Achievement</div>
                                </div>
                                <div>
                                    <p style={{ color: '#64748b', fontStyle: 'italic', margin: '0 0 8px' }}>This is to certify that</p>
                                    <h5 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', borderBottom: '4px solid #eef2ff', paddingBottom: 6, margin: '0 0 8px' }}>
                                        {userProfile?.displayName || user?.displayName || 'Academic Explorer'}
                                    </h5>
                                    <p style={{ color: '#475569', maxWidth: 420, margin: '0 auto' }}>
                                        successfully completed the scene-based learning journey on
                                        <span style={{ display: 'block', fontWeight: 800, color: '#4f46e5', marginTop: 6, fontSize: 18 }}>"{sceneStory.title}"</span>
                                    </p>
                                </div>
                                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div style={{ textAlign: 'left' }}>
                                        <p style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 800, color: '#94a3b8', margin: 0 }}>Score</p>
                                        <p style={{ fontSize: 22, fontWeight: 900, color: '#4f46e5', margin: 0 }}>{quizScore} / {sceneStory.quiz?.length ?? 0}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 800, color: '#94a3b8', margin: 0 }}>Verified By</p>
                                        <p style={{ fontWeight: 900, color: '#0f172a', margin: 0 }}>FeelEd AI</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button
                                onClick={handleShareCertificate}
                                disabled={isSharing}
                                style={{ background: '#4f46e5', color: 'white', border: 'none', borderRadius: 14, padding: '14px 32px', fontSize: 16, fontWeight: 800, cursor: isSharing ? 'default' : 'pointer', opacity: isSharing ? 0.6 : 1 }}
                            >
                                {isSharing ? 'Preparing…' : '📤 Share Certificate'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Restart */}
                <div style={{ textAlign: 'center', marginTop: 40 }}>
                    <button onClick={onTryAnother} style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none', borderRadius: 16, color: 'white', fontSize: 16, fontWeight: 700, padding: '16px 40px', cursor: 'pointer' }}>
                        ✨ Generate New Story
                    </button>
                </div>
            </div>

            {toast && (
                <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: '#1a1040', border: '0.5px solid #4f46e5', color: '#c4b5fd', padding: '10px 20px', borderRadius: 12, fontSize: 13, zIndex: 2000, boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>{toast}</div>
            )}
        </div>
    );
};

export default SceneStoryDisplay;
