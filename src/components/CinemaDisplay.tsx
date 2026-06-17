import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CinemaStory, StageElement, StagePosition, ScreenplayLine, CinemaActType } from '../types';
import { QuizSection } from './StoryDisplay';
import { useAuth } from '../context/AuthContext';
import html2canvas from 'html2canvas';

interface CinemaDisplayProps {
    cinema: CinemaStory;
    language: string;
    onTryAnother: () => void;
}

// ── Static lookups ───────────────────────────────────────────────────────────
const ACT_TYPE_META: Record<CinemaActType, { label: string; color: string }> = {
    hook:          { label: 'Hook',          color: '#f59e0b' },
    rising_action: { label: 'Rising Action', color: '#3b82f6' },
    climax:        { label: 'Climax',        color: '#f43f5e' },
    resolution:    { label: 'Resolution',    color: '#22c55e' },
    exam_bridge:   { label: 'Exam Bridge',   color: '#a855f7' },
};

const ELEMENT_EMOJI: Record<StageElement['element_type'], string> = {
    character: '🧑', object: '🔶', formula: '∑', diagram: '📊', label: '🏷️', effect: '✨',
};

const ANIM_CLASS: Record<StageElement['animation'], string> = {
    enter: 'cn-enter', float: 'cn-float', pulse: 'cn-pulse',
    fall: 'cn-fall', rise: 'cn-rise', spin: 'cn-spin', glow: 'cn-glow',
};

// Pull a leading emoji out of a label, if the model put one there.
const EMOJI_RE = /^(\p{Extended_Pictographic})/u;
function splitEmoji(s: string): { emoji: string; rest: string } {
    const m = (s ?? '').match(EMOJI_RE);
    if (m) return { emoji: m[0], rest: (s.slice(m[0].length) || '').trim() };
    return { emoji: '', rest: s ?? '' };
}

function positionStyle(pos: StagePosition): React.CSSProperties {
    switch (pos) {
        case 'left':   return { left: '10%', top: '28%' };
        case 'center': return { left: '45%', top: '28%' };
        case 'right':  return { left: '75%', top: '28%' };
        case 'top':    return { left: '42%', top: '8%' };
        case 'bottom': return { left: '42%', bottom: '20%' };
        default:       return { left: '45%', top: '28%' };
    }
}

// ── Single stage element ─────────────────────────────────────────────────────
const StageElementView: React.FC<{ el: StageElement }> = ({ el }) => {
    const animClass = ANIM_CLASS[el.animation] ?? '';

    let inner: React.ReactNode;
    if (el.element_type === 'formula') {
        inner = (
            <div style={{ fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace', fontSize: '1.4rem', color: '#f0abfc', background: 'rgba(13,13,28,0.85)', border: '1px solid rgba(240,171,252,0.5)', borderRadius: 12, padding: '10px 16px', boxShadow: '0 0 18px rgba(240,171,252,0.35)', whiteSpace: 'nowrap' }}>
                {el.name}
            </div>
        );
    } else if (el.element_type === 'diagram') {
        inner = (
            <div style={{ background: 'rgba(13,13,28,0.85)', border: '1px solid rgba(148,163,184,0.45)', borderRadius: 12, padding: '10px 14px', maxWidth: 200, textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem' }}>📊</div>
                <div style={{ color: '#e2e8f0', fontSize: '0.78rem', fontWeight: 700, marginTop: 4 }}>{el.name}</div>
                {el.description && <div style={{ color: '#94a3b8', fontSize: '0.68rem', marginTop: 2 }}>{el.description}</div>}
            </div>
        );
    } else if (el.element_type === 'label') {
        inner = (
            <div style={{ display: 'inline-block', background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(167,139,250,0.7)', color: '#ddd6fe', borderRadius: 9999, padding: '6px 14px', fontSize: '0.8rem', fontWeight: 700 }}>
                {el.name}
            </div>
        );
    } else if (el.element_type === 'effect') {
        inner = (
            <div style={{ color: 'rgba(226,232,240,0.55)', fontSize: '0.85rem', fontStyle: 'italic', letterSpacing: '0.05em', textAlign: 'center', textShadow: '0 0 12px rgba(167,139,250,0.5)' }}>
                {el.name || el.description}
            </div>
        );
    } else {
        // character / object
        const { emoji, rest } = splitEmoji(el.name);
        const shownEmoji = emoji || (el.element_type === 'character' ? '🧑' : ELEMENT_EMOJI[el.element_type] ?? '🔶');
        const fontSize = el.element_type === 'character' ? '3rem' : '2.5rem';
        inner = (
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize, lineHeight: 1 }}>{shownEmoji}</div>
                {rest && <div style={{ color: '#fcd34d', fontSize: '0.78rem', fontWeight: 800, marginTop: 6 }}>{rest}</div>}
                {el.element_type === 'object' && el.description && (
                    <div style={{ display: 'inline-block', marginTop: 4, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(148,163,184,0.4)', borderRadius: 9999, padding: '2px 10px', color: '#cbd5e1', fontSize: '0.65rem' }}>
                        {el.description}
                    </div>
                )}
            </div>
        );
    }

    const highlightStyle: React.CSSProperties = el.highlight
        ? { border: '2px solid #a78bfa', borderRadius: 14, padding: 6, filter: 'drop-shadow(0 0 12px rgba(167,139,250,0.85))', background: 'rgba(124,58,237,0.08)' }
        : {};

    return (
        <div style={{ position: 'absolute', ...positionStyle(el.position), zIndex: el.highlight ? 4 : 3, transform: el.highlight ? 'scale(1.05)' : undefined }}>
            <div className={animClass} style={highlightStyle}>
                {inner}
            </div>
        </div>
    );
};

// ── A single screenplay line ─────────────────────────────────────────────────
const ScreenplayLineView: React.FC<{ line: ScreenplayLine; protagonistName: string; protagonistEmoji: string }> = ({ line, protagonistName, protagonistEmoji }) => {
    if (line.is_concept_reveal) {
        return (
            <div className="cn-reveal" style={{ width: '100%', background: '#1a0a2e', border: '1px solid #f0abfc', borderRadius: 12, fontSize: '1.1rem', padding: 16, color: '#f8e1ff', margin: '10px 0', textAlign: 'center' }}>
                <span style={{ color: '#f0abfc', fontWeight: 800, fontSize: '0.7rem', letterSpacing: '0.15em', display: 'block', marginBottom: 6 }}>✦ CONCEPT REVEAL ✦</span>
                {line.text}
            </div>
        );
    }

    if (line.speaker === 'narrator') {
        return (
            <div style={{ color: '#a78bfa', fontStyle: 'italic', textAlign: 'center', margin: '8px 0', fontSize: '0.95rem' }}>
                {line.text}
            </div>
        );
    }

    if (line.speaker === 'protagonist') {
        return (
            <div style={{ display: 'flex', justifyContent: 'flex-start', margin: '8px 0' }}>
                <div style={{ maxWidth: '80%' }}>
                    <div style={{ color: '#fcd34d', fontWeight: 800, fontSize: '0.72rem', marginBottom: 3 }}>{protagonistEmoji} {protagonistName}</div>
                    <div style={{ background: 'rgba(252,211,77,0.1)', border: '1px solid rgba(252,211,77,0.35)', borderRadius: '4px 16px 16px 16px', padding: '10px 14px', color: '#fde68a' }}>
                        {line.text}
                    </div>
                </div>
            </div>
        );
    }

    if (line.speaker === 'student_voice') {
        return (
            <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '8px 0' }}>
                <div style={{ maxWidth: '80%' }}>
                    <div style={{ color: '#60a5fa', fontWeight: 800, fontSize: '0.72rem', marginBottom: 3, textAlign: 'right' }}>🎓 Student</div>
                    <div style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.35)', borderRadius: '16px 4px 16px 16px', padding: '10px 14px', color: '#bfdbfe' }}>
                        {line.text}
                    </div>
                </div>
            </div>
        );
    }

    // concept_voice (non-reveal)
    return (
        <div style={{ textAlign: 'center', color: '#f0abfc', fontSize: '1.05rem', margin: '10px 0', textShadow: '0 0 10px rgba(240,171,252,0.4)' }}>
            {line.text}
        </div>
    );
};

const CinemaDisplay: React.FC<CinemaDisplayProps> = ({ cinema, onTryAnother }) => {
    const { user, userProfile } = useAuth();
    const acts = cinema.acts ?? [];
    const lastActIndex = Math.max(0, acts.length - 1);

    const [currentAct, setCurrentAct] = useState(0);
    const [screenplayIndex, setScreenplayIndex] = useState(0);
    const [showCurtainQ, setShowCurtainQ] = useState(false);
    const [showInterval, setShowInterval] = useState(false);
    const [showExamSpotlight, setShowExamSpotlight] = useState(false);
    const [autoPlay, setAutoPlay] = useState(true);
    const [quizScore, setQuizScore] = useState<number | null>(null);
    const [isSharing, setIsSharing] = useState(false);

    const screenplayRef = useRef<HTMLDivElement>(null);
    const certificateRef = useRef<HTMLDivElement>(null);

    const act = acts[currentAct];
    const lines = act?.screenplay ?? [];
    const visibleLines = lines.slice(0, screenplayIndex + 1);

    // Reset per-act state whenever the act changes.
    useEffect(() => {
        setScreenplayIndex(0);
        setShowCurtainQ(false);
    }, [currentAct]);

    // Keep the screenplay panel scrolled to the newest line.
    useEffect(() => {
        const node = screenplayRef.current;
        if (node) node.scrollTop = node.scrollHeight;
    }, [screenplayIndex, showCurtainQ]);

    const handleContinue = useCallback(() => {
        setShowCurtainQ(false);
        if (currentAct === 2) {
            setShowInterval(true);          // interval between act 3 and act 4
        } else if (currentAct >= lastActIndex) {
            setShowExamSpotlight(true);     // after final act → exam spotlight
        } else {
            setCurrentAct(a => Math.min(a + 1, lastActIndex));
        }
    }, [currentAct, lastActIndex]);

    const handleIntervalContinue = useCallback(() => {
        setShowInterval(false);
        setCurrentAct(3);
    }, []);

    const advanceLine = useCallback(() => {
        if (showCurtainQ || showInterval || showExamSpotlight) return;
        if (screenplayIndex < lines.length - 1) setScreenplayIndex(i => i + 1);
        else setShowCurtainQ(true);
    }, [showCurtainQ, showInterval, showExamSpotlight, screenplayIndex, lines.length]);

    // Auto-play engine: advance screenplay lines (3s), then hold on the curtain
    // question; under auto-play continue to the next act after a short "think" pause.
    useEffect(() => {
        if (!autoPlay) return;
        if (showInterval || showExamSpotlight || quizScore !== null) return;

        if (!showCurtainQ) {
            if (screenplayIndex < lines.length - 1) {
                const t = setTimeout(() => setScreenplayIndex(i => i + 1), 3000);
                return () => clearTimeout(t);
            }
            const t = setTimeout(() => setShowCurtainQ(true), 3000);
            return () => clearTimeout(t);
        }
        const t = setTimeout(() => handleContinue(), 5000);
        return () => clearTimeout(t);
    }, [autoPlay, showCurtainQ, showInterval, showExamSpotlight, quizScore, screenplayIndex, lines.length, handleContinue]);

    const goToAct = useCallback((idx: number) => {
        setShowInterval(false);
        setShowExamSpotlight(false);
        setShowCurtainQ(false);
        const clamped = Math.max(0, Math.min(idx, lastActIndex));
        setCurrentAct(clamped);
        setScreenplayIndex(0);
    }, [lastActIndex]);

    const handleShareCertificate = useCallback(async () => {
        if (!certificateRef.current) return;
        setIsSharing(true);
        try {
            const canvas = await html2canvas(certificateRef.current, { scale: 2, backgroundColor: null, logging: false, useCORS: true });
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
            if (!blob) throw new Error('Failed to generate image');
            const file = new File([blob], 'feeled-cinema-certificate.png', { type: 'image/png' });
            const shareText = `I just completed a FeelEd Cinema experience on "${cinema.cinema_title}" and scored ${quizScore}/${cinema.quiz?.length ?? 0}! 🎬`;
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], title: 'FeelEd Cinema Certificate', text: shareText });
            } else {
                const link = document.createElement('a');
                link.download = 'feeled-cinema-certificate.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            }
        } catch (err) {
            console.error('Certificate share failed:', err);
        } finally {
            setIsSharing(false);
        }
    }, [cinema.cinema_title, cinema.quiz, quizScore]);

    const actMeta = act ? (ACT_TYPE_META[act.act_type] ?? { label: act.act_type, color: '#a855f7' }) : { label: '', color: '#a855f7' };
    const studentName = userProfile?.displayName || user?.displayName || 'Academic Explorer';

    return (
        <div style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e2e8f0', padding: '20px 16px 80px', width: '100%' }}>
            <style>{`
                @keyframes cnFall   {0%{transform:translateY(-100px);opacity:0}100%{transform:translateY(0);opacity:1}}
                @keyframes cnFloat  {0%,100%{transform:translateY(0)}50%{transform:translateY(-15px)}}
                @keyframes cnPulse  {0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
                @keyframes cnGlow   {0%,100%{box-shadow:0 0 6px rgba(167,139,250,0.4)}50%{box-shadow:0 0 22px rgba(167,139,250,0.95)}}
                @keyframes cnSpin   {0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
                @keyframes cnRise   {0%{transform:translateY(50px);opacity:0}100%{transform:translateY(0);opacity:1}}
                @keyframes cnEnter  {0%{opacity:0;transform:translateX(-20px)}100%{opacity:1;transform:translateX(0)}}
                @keyframes cnSlideUp{0%{opacity:0;transform:translateY(24px)}100%{opacity:1;transform:translateY(0)}}
                @keyframes cnTwinkle{0%,100%{opacity:0.25}50%{opacity:0.7}}
                @keyframes cnRevealPulse{0%,100%{box-shadow:0 0 0 rgba(240,171,252,0)}50%{box-shadow:0 0 20px rgba(240,171,252,0.6)}}
                @keyframes cnFadeIn {0%{opacity:0;transform:translateY(12px)}100%{opacity:1;transform:translateY(0)}}
                .cn-fall{animation:cnFall 1.2s ease}
                .cn-float{animation:cnFloat 3s ease-in-out infinite}
                .cn-pulse{animation:cnPulse 2s ease-in-out infinite}
                .cn-glow{animation:cnGlow 2s ease-in-out infinite}
                .cn-spin{animation:cnSpin 4s linear infinite}
                .cn-rise{animation:cnRise 1s ease}
                .cn-enter{animation:cnEnter 0.8s ease}
                .cn-board{animation:cnSlideUp 0.5s ease}
                .cn-reveal{animation:cnRevealPulse 2.5s ease-in-out infinite}
                .cn-fade{animation:cnFadeIn 0.5s ease}
                .cinema-screen{position:relative;aspect-ratio:16/9;background:#000;border:8px solid #1a0a2e;border-radius:10px;overflow:hidden;box-shadow:0 30px 80px -20px rgba(0,0,0,0.9);}
                .cinema-screen::before{content:'';position:absolute;top:6px;left:6px;width:28px;height:28px;border-top:3px solid #facc15;border-left:3px solid #facc15;z-index:6;pointer-events:none;}
                .cinema-screen::after{content:'';position:absolute;bottom:6px;right:6px;width:28px;height:28px;border-bottom:3px solid #facc15;border-right:3px solid #facc15;z-index:6;pointer-events:none;}
                .cinema-frame::before{content:'';position:absolute;top:6px;right:6px;width:28px;height:28px;border-top:3px solid #facc15;border-right:3px solid #facc15;z-index:6;pointer-events:none;}
                .cinema-frame::after{content:'';position:absolute;bottom:6px;left:6px;width:28px;height:28px;border-bottom:3px solid #facc15;border-left:3px solid #facc15;z-index:6;pointer-events:none;}
                .cinema-stars{position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(1px 1px at 20px 30px,#fff,transparent),radial-gradient(1px 1px at 40px 70px,rgba(255,255,255,0.8),transparent),radial-gradient(1px 1px at 90px 40px,#fff,transparent),radial-gradient(1.5px 1.5px at 130px 80px,rgba(255,255,255,0.9),transparent),radial-gradient(1px 1px at 160px 120px,#fff,transparent),radial-gradient(1px 1px at 180px 50px,rgba(255,255,255,0.7),transparent);background-repeat:repeat;background-size:200px 200px;animation:cnTwinkle 4s ease-in-out infinite;opacity:0.5;z-index:1;}
                .cinema-curtain{position:absolute;top:0;bottom:0;width:7%;z-index:5;pointer-events:none;}
                .cinema-curtain-l{left:0;background:linear-gradient(90deg,#4a0d12 0%,#7f1d1d 60%,transparent 100%);box-shadow:inset -10px 0 20px rgba(0,0,0,0.6);}
                .cinema-curtain-r{right:0;background:linear-gradient(270deg,#4a0d12 0%,#7f1d1d 60%,transparent 100%);box-shadow:inset 10px 0 20px rgba(0,0,0,0.6);}
                @media (max-width:640px){.cinema-screen{aspect-ratio:3/4;}}
                *{box-sizing:border-box;}
            `}</style>

            <div style={{ maxWidth: 960, margin: '0 auto' }}>
                {/* ── SECTION 1: CINEMA HEADER ───────────────────────────── */}
                <div style={{ marginBottom: 20 }}>
                    <span style={{ display: 'inline-block', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.08em', padding: '6px 12px', borderRadius: 9999, marginBottom: 14 }}>
                        🎬 FeelEd Cinema
                    </span>
                    <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 900, lineHeight: 1.05, margin: '0 0 14px', background: 'linear-gradient(135deg,#c4b5fd,#f0abfc,#fcd34d)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: '#f0abfc' }}>
                        {cinema.cinema_title}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: '2rem' }}>{cinema.protagonist?.avatar_emoji}</span>
                            <div>
                                <div style={{ fontWeight: 800, color: '#fde68a' }}>{cinema.protagonist?.name}</div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{cinema.protagonist?.era} · {cinema.protagonist?.role}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                            <span style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(167,139,250,0.5)', color: '#ddd6fe', borderRadius: 9999, padding: '4px 12px', fontSize: '0.72rem', fontWeight: 700 }}>Grade {cinema.grade}</span>
                            <span style={{ background: 'rgba(59,130,246,0.18)', border: '1px solid rgba(96,165,250,0.5)', color: '#bfdbfe', borderRadius: 9999, padding: '4px 12px', fontSize: '0.72rem', fontWeight: 700 }}>{cinema.subject}</span>
                        </div>
                    </div>
                </div>

                {/* ── SECTION 7+8: EXAM SPOTLIGHT → QUIZ → CERTIFICATE ───── */}
                {showExamSpotlight ? (
                    <div className="cn-fade">
                        {/* SECTION 7: EXAM SPOTLIGHT */}
                        <div style={{ background: '#0d0d1c', border: '1px solid rgba(167,139,250,0.35)', borderRadius: 18, padding: 24, marginBottom: 28 }}>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '0 0 18px', color: '#fff' }}>📝 TN Board Exam Spotlight</h2>

                            <div style={{ color: '#a78bfa', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', marginBottom: 6 }}>MOST ASKED QUESTION</div>
                            <div style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.45)', borderRadius: 12, padding: 16, color: '#f1f5f9', marginBottom: 20, fontSize: '1.02rem' }}>
                                {cinema.exam_spotlight?.most_asked_question}
                            </div>

                            <div style={{ color: '#a78bfa', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', marginBottom: 10 }}>MODEL ANSWER STRUCTURE</div>
                            <ol style={{ margin: '0 0 20px', paddingLeft: 0, listStyle: 'none' }}>
                                {(cinema.exam_spotlight?.model_answer_structure ?? []).map((step, i) => (
                                    <li key={i} style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'flex-start' }}>
                                        <span style={{ flexShrink: 0, width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                                        <span style={{ color: '#e2e8f0', paddingTop: 2 }}>{step}</span>
                                    </li>
                                ))}
                            </ol>

                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                                <span style={{ display: 'inline-block', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.5)', color: '#86efac', borderRadius: 9999, padding: '8px 16px', fontWeight: 700, fontSize: '0.85rem' }}>
                                    🎯 {cinema.exam_spotlight?.marks_tip}
                                </span>
                            </div>
                            {cinema.exam_spotlight?.previous_year_hint && (
                                <div style={{ marginTop: 16, color: '#fbbf24', fontStyle: 'italic', fontSize: '0.9rem' }}>
                                    📅 {cinema.exam_spotlight.previous_year_hint}
                                </div>
                            )}
                        </div>

                        {/* SECTION 8: QUIZ (reused) */}
                        <QuizSection quiz={cinema.quiz} onQuizComplete={(score) => setQuizScore(score)} />

                        {/* concept_connection per quiz question */}
                        <div style={{ background: '#0d0d1c', border: '1px solid rgba(96,165,250,0.3)', borderRadius: 18, padding: 24, marginTop: 24 }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, margin: '0 0 16px', color: '#fff' }}>🔗 Concept Connections</h3>
                            {(cinema.quiz ?? []).map((q, i) => (
                                <div key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: i < (cinema.quiz?.length ?? 0) - 1 ? '1px solid rgba(148,163,184,0.15)' : 'none' }}>
                                    <div style={{ color: '#93c5fd', fontWeight: 800, fontSize: '0.85rem', marginBottom: 4 }}>Q{i + 1}. {q.question}</div>
                                    {q.explanation && <div style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: 4 }}>{q.explanation}</div>}
                                    <div style={{ color: '#60a5fa', fontSize: '0.8rem', fontStyle: 'italic' }}>🔗 {q.concept_connection}</div>
                                </div>
                            ))}
                        </div>

                        {/* CERTIFICATE (same design as StoryDisplay) */}
                        {quizScore !== null && (
                            <div style={{ marginTop: 32 }} className="cn-fade">
                                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                    <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', margin: '0 0 6px' }}>Congratulations! 🎊</h3>
                                    <p style={{ color: '#94a3b8', margin: 0 }}>You've completed this FeelEd Cinema experience.</p>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                                    <div ref={certificateRef} className="w-full max-w-2xl aspect-[1.414/1] bg-white border-[16px] border-indigo-600 p-12 flex flex-col items-center justify-between text-center shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-indigo-200"></div>
                                        <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-indigo-200"></div>
                                        <div className="space-y-4">
                                            <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-black mx-auto mb-4">F</div>
                                            <h4 className="text-indigo-600 font-black uppercase tracking-[0.3em] text-sm">Certificate of Achievement</h4>
                                        </div>
                                        <div className="space-y-6">
                                            <p className="text-slate-500 italic">This is to certify that</p>
                                            <h5 className="text-4xl font-black text-slate-900 border-b-4 border-slate-100 pb-2 px-8">{studentName}</h5>
                                            <p className="text-slate-600 max-w-md">
                                                has successfully completed the FeelEd Cinema experience on
                                                <span className="block font-bold text-indigo-600 mt-2 text-xl">"{cinema.cinema_title}"</span>
                                            </p>
                                        </div>
                                        <div className="w-full flex justify-between items-end mt-8">
                                            <div className="text-left">
                                                <p className="text-[10px] uppercase font-black text-slate-400">Score Achieved</p>
                                                <p className="text-2xl font-black text-indigo-600">{quizScore} / {cinema.quiz?.length ?? 0}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] uppercase font-black text-slate-400">Verified By</p>
                                                <p className="font-black text-slate-900">FeelEd AI Affective Engine</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <button onClick={handleShareCertificate} disabled={isSharing} style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none', borderRadius: 16, padding: '16px 32px', fontWeight: 900, fontSize: '1rem', cursor: 'pointer', opacity: isSharing ? 0.6 : 1 }}>
                                        {isSharing ? 'Preparing…' : '📤 Share Certificate'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Try another */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 36 }}>
                            <button onClick={onTryAnother} style={{ background: 'transparent', color: '#c4b5fd', border: '1px solid #4f46e5', borderRadius: 16, padding: '14px 28px', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer' }}>
                                🎬 New Cinema Experience
                            </button>
                        </div>
                    </div>
                ) : showInterval ? (
                    /* ── SECTION 6: INTERVAL CARD ───────────────────────── */
                    <div className="cn-fade" style={{ background: 'linear-gradient(135deg,#1a0a2e,#0d0d1c)', border: '1px solid rgba(252,211,77,0.35)', borderRadius: 18, padding: '48px 28px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2.6rem', fontWeight: 900, letterSpacing: '0.1em', color: '#fcd34d', marginBottom: 24 }}>🍿 INTERVAL</div>
                        <div style={{ maxWidth: 620, margin: '0 auto' }}>
                            <div style={{ color: '#a78bfa', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', marginBottom: 6 }}>SO FAR…</div>
                            <p style={{ color: '#e2e8f0', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: 22 }}>{cinema.interval_card?.recap}</p>
                            <div style={{ color: '#fbbf24', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', marginBottom: 6 }}>COMING UP…</div>
                            <p style={{ color: '#fde68a', fontSize: '1.05rem', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 30 }}>{cinema.interval_card?.teaser}</p>
                            <button onClick={handleIntervalContinue} style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none', borderRadius: 14, padding: '14px 28px', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer' }}>
                                Continue to Act 4 →
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* ── SECTION 2: THEATRE SCREEN ──────────────────── */}
                        <div className="cinema-screen" onClick={advanceLine} style={{ cursor: 'pointer' }}>
                            <div className="cinema-frame" style={{ position: 'absolute', inset: 0, zIndex: 6, pointerEvents: 'none' }} />
                            <div className="cinema-stars" />
                            <div className="cinema-curtain cinema-curtain-l" />
                            <div className="cinema-curtain cinema-curtain-r" />

                            {/* A) STAGE (top 60%) */}
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60%', zIndex: 2 }}>
                                {(act?.stage_elements ?? []).map((el, i) => (
                                    <StageElementView key={`${currentAct}-${i}`} el={el} />
                                ))}
                                {/* setting label */}
                                <div style={{ position: 'absolute', top: 8, left: '9%', right: '9%', textAlign: 'center', color: 'rgba(226,232,240,0.55)', fontSize: '0.7rem', fontStyle: 'italic', zIndex: 2 }}>
                                    📍 {act?.setting?.place} · {act?.setting?.time_of_day}
                                </div>
                            </div>

                            {/* B) SCREENPLAY (bottom 40%) */}
                            <div ref={screenplayRef} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'rgba(0,0,0,0.7)', borderTop: '1px solid rgba(167,139,250,0.2)', padding: '14px 24px', overflowY: 'auto', zIndex: 3 }}>
                                {visibleLines.map((line, i) => (
                                    <ScreenplayLineView key={i} line={line} protagonistName={cinema.protagonist?.name ?? ''} protagonistEmoji={cinema.protagonist?.avatar_emoji ?? '🧑'} />
                                ))}
                                {!showCurtainQ && screenplayIndex >= lines.length - 1 && (
                                    <div style={{ textAlign: 'center', color: 'rgba(148,163,184,0.5)', fontSize: '0.68rem', marginTop: 6 }}>— end of scene —</div>
                                )}
                            </div>

                            {/* tap hint */}
                            <div style={{ position: 'absolute', bottom: 6, right: 12, color: 'rgba(148,163,184,0.5)', fontSize: '0.62rem', zIndex: 4 }}>tap to advance →</div>
                        </div>

                        {/* ── SECTION 3: ACT NAVIGATION ──────────────────── */}
                        <div style={{ marginTop: 18, textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
                                {acts.map((_, i) => (
                                    <button key={i} onClick={() => goToAct(i)} aria-label={`Act ${i + 1}`} style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid #7c3aed', background: i === currentAct ? '#a855f7' : 'transparent', cursor: 'pointer', padding: 0, transition: 'all 0.3s ease' }} />
                                ))}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                                <span style={{ fontWeight: 800, color: '#fff' }}>Act {act?.act_number}: {act?.act_title}</span>
                                <span style={{ background: `${actMeta.color}22`, border: `1px solid ${actMeta.color}`, color: actMeta.color, borderRadius: 9999, padding: '3px 10px', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{actMeta.label}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                                <button onClick={() => goToAct(currentAct - 1)} disabled={currentAct === 0} style={{ background: '#0d0d1c', color: '#c4b5fd', border: '1px solid #4f46e5', borderRadius: 12, padding: '8px 16px', fontWeight: 700, fontSize: '0.82rem', cursor: currentAct === 0 ? 'not-allowed' : 'pointer', opacity: currentAct === 0 ? 0.4 : 1 }}>⏮ Prev Act</button>
                                <button onClick={() => setAutoPlay(a => !a)} style={{ background: autoPlay ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : '#0d0d1c', color: autoPlay ? '#fff' : '#c4b5fd', border: '1px solid #4f46e5', borderRadius: 12, padding: '8px 16px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>{autoPlay ? '⏸ Auto-play: ON' : '▶ Auto-play: OFF'}</button>
                                <button onClick={() => goToAct(currentAct + 1)} disabled={currentAct >= lastActIndex} style={{ background: '#0d0d1c', color: '#c4b5fd', border: '1px solid #4f46e5', borderRadius: 12, padding: '8px 16px', fontWeight: 700, fontSize: '0.82rem', cursor: currentAct >= lastActIndex ? 'not-allowed' : 'pointer', opacity: currentAct >= lastActIndex ? 0.4 : 1 }}>Next Act ⏭</button>
                            </div>
                        </div>

                        {/* ── SECTION 4: CONCEPT BOARD ───────────────────── */}
                        <div key={currentAct} className="cn-board" style={{ marginTop: 20, background: '#0d0d1c', borderLeft: '4px solid #7c3aed', borderRadius: 12, padding: 20 }}>
                            <h3 style={{ color: '#fff', fontWeight: 900, fontSize: '1.05rem', margin: '0 0 10px' }}>{act?.concept_board?.title}</h3>
                            {act?.concept_board?.formula && (
                                <div style={{ fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace', color: '#f0abfc', fontSize: '1.15rem', background: 'rgba(240,171,252,0.07)', borderRadius: 8, padding: '10px 14px', marginBottom: 12, overflowX: 'auto' }}>
                                    {act.concept_board.formula}
                                </div>
                            )}
                            <ul style={{ margin: '0 0 12px', paddingLeft: 20, color: '#e2e8f0' }}>
                                {(act?.concept_board?.key_points ?? []).map((pt, i) => (
                                    <li key={i} style={{ marginBottom: 6, lineHeight: 1.5 }}>{pt}</li>
                                ))}
                            </ul>
                            {act?.concept_board?.tamil_analogy && (
                                <div style={{ color: '#fbbf24', fontStyle: 'italic', fontSize: '0.92rem', lineHeight: 1.5 }}>
                                    🌾 Tamil Context: {act.concept_board.tamil_analogy}
                                </div>
                            )}
                        </div>

                        {/* ── SECTION 5: CURTAIN QUESTION ────────────────── */}
                        {showCurtainQ && act?.curtain_question && (
                            <div className="cn-fade" style={{ marginTop: 20, background: 'linear-gradient(135deg,#1a0a2e,#0d0d1c)', border: '1px solid rgba(167,139,250,0.4)', borderRadius: 16, padding: 28, textAlign: 'center' }}>
                                <p style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.5, margin: '0 0 8px' }}>{act.curtain_question}</p>
                                <p style={{ color: '#a78bfa', fontSize: '0.85rem', fontStyle: 'italic', margin: '0 0 20px' }}>💭 Think about it…</p>
                                <button onClick={handleContinue} style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none', borderRadius: 14, padding: '12px 26px', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer' }}>
                                    {currentAct === 2 ? 'Continue →' : currentAct >= lastActIndex ? 'See Exam Spotlight →' : 'Tap to continue →'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CinemaDisplay;
