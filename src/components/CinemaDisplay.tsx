import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CinemaStory, StageElement, ScreenplayLine, CinemaActType } from '../types';
import { useAuth } from '../context/AuthContext';

interface CinemaDisplayProps {
    cinema: CinemaStory;
    language: string;
    onTryAnother: () => void;
}

// ── Gemini PCM audio helpers ─────────────────────────────────────────────────
function b64ToUint8(b64: string): Uint8Array {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
}
function pcmToBuffer(data: Uint8Array, ctx: AudioContext): AudioBuffer {
    const i16 = new Int16Array(data.buffer);
    const buf = ctx.createBuffer(1, i16.length, 24000);
    const ch  = buf.getChannelData(0);
    for (let i = 0; i < i16.length; i++) ch[i] = i16[i] / 32768;
    return buf;
}

// ── ACT META ─────────────────────────────────────────────────────────────────
const ACT_META: Record<CinemaActType, { label: string; color: string; stageBg: string }> = {
    hook:          { label: 'Hook',          color: '#f59e0b', stageBg: 'radial-gradient(ellipse at 40% 30%, #1a0535 0%, #000008 70%)' },
    rising_action: { label: 'Rising Action', color: '#3b82f6', stageBg: 'radial-gradient(ellipse at 60% 20%, #000a25 0%, #000008 70%)' },
    climax:        { label: 'Climax',        color: '#f43f5e', stageBg: 'radial-gradient(ellipse at 50% 25%, #1a0008 0%, #000008 70%)' },
    resolution:    { label: 'Resolution',    color: '#22c55e', stageBg: 'radial-gradient(ellipse at 45% 30%, #001a0a 0%, #000008 70%)' },
    exam_bridge:   { label: 'Exam Bridge',   color: '#a855f7', stageBg: 'radial-gradient(ellipse at 50% 30%, #0d0020 0%, #000008 70%)' },
};

// ── STAGE VISUAL ─────────────────────────────────────────────────────────────
function StageVisual({ el }: { el: StageElement }) {
    const posStyle: Record<string, React.CSSProperties> = {
        left:   { left: '8%',  top: '18%' },
        center: { left: '50%', top: '12%', transform: 'translateX(-50%)' },
        right:  { right: '8%', top: '18%' },
        top:    { left: '50%', top: '5%',  transform: 'translateX(-50%)' },
        bottom: { left: '50%', top: '58%', transform: 'translateX(-50%)' },
    };
    const animStyle: Record<string, React.CSSProperties> = {
        enter:  { animation: 'cd-enter 0.9s cubic-bezier(.22,1,.36,1) both' },
        float:  { animation: 'cd-float 4s ease-in-out infinite' },
        pulse:  { animation: 'cd-pulse 2.2s ease-in-out infinite' },
        fall:   { animation: 'cd-fall 1s cubic-bezier(.22,1,.36,1) both' },
        rise:   { animation: 'cd-rise 1s cubic-bezier(.22,1,.36,1) both' },
        spin:   { animation: 'cd-glow 2.5s ease-in-out infinite' }, // replaced spin with glow
        glow:   { animation: 'cd-glow 2.5s ease-in-out infinite' },
    };
    const pos  = posStyle[el.position] ?? posStyle['center'];
    const anim = animStyle[el.animation] ?? {};
    const highlight = el.highlight;

    let inner: React.ReactNode;
    const name = el.name?.toLowerCase() ?? '';

    if (el.element_type === 'formula') {
        inner = (
            <div style={{ fontFamily: '"SF Mono",ui-monospace,Menlo,monospace', fontSize: 'clamp(0.95rem,2.2vw,1.5rem)', color: '#f0abfc', background: 'rgba(10,0,22,0.94)', border: `1.5px solid ${highlight ? '#f0abfc' : 'rgba(240,171,252,0.35)'}`, borderRadius: 12, padding: '10px 18px', whiteSpace: 'nowrap', boxShadow: highlight ? '0 0 24px rgba(240,171,252,0.55)' : 'none', letterSpacing: '0.03em' }}>
                {el.name}
                {el.description && <div style={{ fontSize: '0.58em', color: '#c4b5fd', marginTop: 4 }}>{el.description}</div>}
            </div>
        );
    } else if (el.element_type === 'diagram') {
        // Semantic SVG based on name keywords
        let svg: React.ReactNode;
        if (name.includes('wave') || name.includes('light') || name.includes('sound') || name.includes('வெளிச்ச') || name.includes('அலை')) {
            svg = <svg width="140" height="60" viewBox="0 0 140 60"><path d="M5,30 Q22,5 40,30 Q57,55 75,30 Q92,5 110,30 Q128,55 138,30" stroke="#34d399" strokeWidth="2.5" fill="none"/><text x="70" y="56" fill="#6ee7b7" fontSize="10" textAnchor="middle">{el.name}</text></svg>;
        } else if (name.includes('force') || name.includes('arrow') || name.includes('விசை') || name.includes('direction')) {
            svg = <svg width="130" height="70" viewBox="0 0 130 70"><defs><marker id="ah" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#60a5fa"/></marker></defs><line x1="10" y1="35" x2="108" y2="35" stroke="#60a5fa" strokeWidth="3" markerEnd="url(#ah)"/><text x="65" y="26" fill="#93c5fd" fontSize="10" textAnchor="middle">{el.name}</text></svg>;
        } else if (name.includes('cell') || name.includes('nucleus') || name.includes('கலம்')) {
            svg = <svg width="110" height="100" viewBox="0 0 110 100"><ellipse cx="55" cy="50" rx="48" ry="40" stroke="#34d399" strokeWidth="2" fill="rgba(52,211,153,0.08)"/><ellipse cx="55" cy="50" rx="18" ry="14" stroke="#86efac" strokeWidth="1.5" fill="rgba(134,239,172,0.14)"/><text x="55" y="96" fill="#86efac" fontSize="9" textAnchor="middle">{el.name}</text></svg>;
        } else if (name.includes('graph') || name.includes('chart') || name.includes('வரை')) {
            svg = <svg width="120" height="90" viewBox="0 0 120 90"><line x1="15" y1="75" x2="110" y2="75" stroke="#94a3b8" strokeWidth="1.5"/><line x1="15" y1="10" x2="15" y2="75" stroke="#94a3b8" strokeWidth="1.5"/><polyline points="15,65 35,50 55,35 75,22 95,18 110,15" stroke="#a78bfa" strokeWidth="2" fill="none"/><text x="60" y="88" fill="#7c6fad" fontSize="9" textAnchor="middle">{el.name}</text></svg>;
        } else {
            svg = <svg width="120" height="70" viewBox="0 0 120 70"><rect x="8" y="8" width="104" height="44" rx="10" stroke="#a78bfa" strokeWidth="1.8" fill="rgba(124,58,237,0.1)"/><text x="60" y="34" fill="#c4b5fd" fontSize="11" textAnchor="middle" dominantBaseline="middle">{el.name}</text><text x="60" y="62" fill="#6b63a0" fontSize="8.5" textAnchor="middle">{el.description?.slice(0,32)}</text></svg>;
        }
        inner = <div style={{ background: 'rgba(0,0,10,0.85)', border: `1px solid ${highlight ? '#a78bfa' : 'rgba(148,163,184,0.2)'}`, borderRadius: 12, padding: '8px 12px', boxShadow: highlight ? '0 0 20px rgba(167,139,250,0.5)' : 'none' }}>{svg}</div>;
    } else if (el.element_type === 'label') {
        inner = <div style={{ background: 'rgba(79,46,220,0.18)', border: '1px solid rgba(167,139,250,0.7)', color: '#ddd6fe', borderRadius: 9999, padding: '7px 16px', fontSize: 'clamp(0.72rem,1.8vw,0.9rem)', fontWeight: 700, boxShadow: highlight ? '0 0 16px rgba(167,139,250,0.45)' : 'none' }}>{el.name}</div>;
    } else if (el.element_type === 'effect') {
        inner = <div style={{ color: 'rgba(253,230,138,0.88)', fontSize: 'clamp(0.72rem,1.8vw,0.92rem)', fontStyle: 'italic', letterSpacing: '0.07em', textAlign: 'center', textShadow: '0 0 18px rgba(253,230,138,0.55)', maxWidth: 200 }}>✦ {el.name || el.description}</div>;
    } else {
        // character / object — keyword emoji mapping
        let emoji = (el.name.match(/^\p{Extended_Pictographic}/u) ?? [])[0] ?? '';
        const rest = emoji ? el.name.slice(emoji.length).trim() : el.name;
        if (!emoji) {
            if (name.includes('newton') || name.includes('நியூட்டன்')) emoji = '🧑‍🔬';
            else if (name.includes('einstein') || name.includes('ஐன்ஸ்டீன்')) emoji = '👨‍🔬';
            else if (name.includes('raman') || name.includes('ராமன்')) emoji = '🔬';
            else if (name.includes('mendel')) emoji = '🌱';
            else if (name.includes('curie')) emoji = '⚗️';
            else if (name.includes('darwin')) emoji = '🦎';
            else if (name.includes('ramanujan') || name.includes('ராமானுஜன்')) emoji = '🔢';
            else if (name.includes('student') || name.includes('மாணவ')) emoji = '🎓';
            else if (name.includes('apple') || name.includes('ஆப்பிள்')) emoji = '🍎';
            else if (name.includes('book') || name.includes('நூல்')) emoji = '📖';
            else if (name.includes('sun') || name.includes('சூரிய')) emoji = '☀️';
            else if (name.includes('moon') || name.includes('நிலா')) emoji = '🌙';
            else if (name.includes('plant') || name.includes('leaf') || name.includes('இலை')) emoji = '🌿';
            else if (name.includes('earth') || name.includes('planet') || name.includes('பூமி')) emoji = '🌍';
            else if (name.includes('bulb') || name.includes('light') || name.includes('lamp')) emoji = '💡';
            else if (name.includes('magnet') || name.includes('காந்த')) emoji = '🧲';
            else if (name.includes('flask') || name.includes('chemical')) emoji = '⚗️';
            else if (name.includes('telescope')) emoji = '🔭';
            else if (name.includes('atom') || name.includes('அணு')) emoji = '⚛️';
            else if (name.includes('car') || name.includes('வண்டி')) emoji = '🚗';
            else if (name.includes('water') || name.includes('நீர்')) emoji = '💧';
            else emoji = el.element_type === 'character' ? '🧑' : '🔶';
        }
        inner = (
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: el.element_type === 'character' ? 'clamp(2.4rem,6vw,3.8rem)' : 'clamp(1.8rem,4.5vw,3rem)', lineHeight: 1, filter: highlight ? 'drop-shadow(0 0 18px rgba(167,139,250,0.9))' : undefined }}>
                    {emoji}
                </div>
                {rest && <div style={{ color: '#fcd34d', fontSize: 'clamp(0.62rem,1.5vw,0.8rem)', fontWeight: 800, marginTop: 6, textShadow: '0 1px 8px rgba(0,0,0,0.9)', maxWidth: 140 }}>{rest}</div>}
                {el.element_type === 'object' && el.description && (
                    <div style={{ marginTop: 4, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(148,163,184,0.3)', borderRadius: 9999, padding: '2px 10px', color: '#cbd5e1', fontSize: '0.62rem' }}>{el.description}</div>
                )}
            </div>
        );
    }

    return (
        <div style={{ position: 'absolute', ...pos, zIndex: highlight ? 5 : 3 }}>
            <div style={anim}>{inner}</div>
        </div>
    );
}

// ── SCREENPLAY LINE ───────────────────────────────────────────────────────────
function LineView({ line, protagonistName, protagonistEmoji, isNew }: {
    line: ScreenplayLine; protagonistName: string; protagonistEmoji: string; isNew: boolean;
}) {
    const appear: React.CSSProperties = isNew ? { animation: 'cd-fadein 0.4s ease both' } : {};

    if (line.is_concept_reveal) return (
        <div style={{ ...appear, background: 'linear-gradient(135deg,#1a0535,#0d001a)', border: '1.5px solid #f0abfc', borderRadius: 14, padding: '14px 18px', color: '#f8e1ff', margin: '10px 0', textAlign: 'center', boxShadow: '0 0 28px rgba(240,171,252,0.38)', animation: `${isNew ? 'cd-fadein 0.4s ease both,' : ''}cd-revglow 3s ease-in-out infinite` }}>
            <span style={{ display: 'block', color: '#f0abfc', fontWeight: 900, fontSize: '0.62rem', letterSpacing: '0.2em', marginBottom: 6 }}>✦ CONCEPT REVEAL ✦</span>
            <span style={{ fontSize: 'clamp(0.88rem,2.2vw,1.08rem)', lineHeight: 1.6 }}>{line.text}</span>
        </div>
    );
    if (line.speaker === 'narrator') return (
        <div style={{ ...appear, color: '#a78bfa', fontStyle: 'italic', textAlign: 'center', margin: '8px 0', fontSize: 'clamp(0.8rem,2vw,0.95rem)', lineHeight: 1.6 }}>{line.text}</div>
    );
    if (line.speaker === 'protagonist') return (
        <div style={{ ...appear, display: 'flex', gap: 10, margin: '8px 0', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.35rem', flexShrink: 0, marginTop: 2 }}>{protagonistEmoji}</span>
            <div>
                <div style={{ color: '#fcd34d', fontWeight: 800, fontSize: '0.66rem', marginBottom: 3 }}>{protagonistName}</div>
                <div style={{ background: 'rgba(252,211,77,0.08)', border: '1px solid rgba(252,211,77,0.28)', borderRadius: '4px 14px 14px 14px', padding: '10px 14px', color: '#fde68a', fontSize: 'clamp(0.8rem,2vw,0.95rem)', lineHeight: 1.6 }}>{line.text}</div>
            </div>
        </div>
    );
    if (line.speaker === 'student_voice') return (
        <div style={{ ...appear, display: 'flex', gap: 10, margin: '8px 0', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
            <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#60a5fa', fontWeight: 800, fontSize: '0.66rem', marginBottom: 3 }}>🎓 Student</div>
                <div style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.28)', borderRadius: '14px 4px 14px 14px', padding: '10px 14px', color: '#bfdbfe', fontSize: 'clamp(0.8rem,2vw,0.95rem)', lineHeight: 1.6 }}>{line.text}</div>
            </div>
            <span style={{ fontSize: '1.35rem', flexShrink: 0, marginTop: 2 }}>🎓</span>
        </div>
    );
    return (
        <div style={{ ...appear, textAlign: 'center', color: '#f0abfc', fontSize: 'clamp(0.88rem,2.2vw,1.05rem)', margin: '10px 0', textShadow: '0 0 14px rgba(240,171,252,0.45)', lineHeight: 1.6 }}>
            💡 {line.text}
        </div>
    );
}

// ── QUIZ ─────────────────────────────────────────────────────────────────────
function QuizPanel({ quiz, onDone }: { quiz: CinemaStory['quiz']; onDone: (s: number) => void }) {
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const score = submitted ? quiz.filter((q, i) => answers[i] === q.answer).length : 0;
    const allAnswered = Object.keys(answers).length >= quiz.length;

    return (
        <div>
            <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 'clamp(1.1rem,3vw,1.4rem)', marginBottom: 20 }}>🎯 Quick Quiz</h2>
            {quiz.map((q, i) => (
                <div key={i} style={{ marginBottom: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(148,163,184,0.14)', borderRadius: 14, padding: '16px 18px' }}>
                    <p style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: 12, lineHeight: 1.55, fontSize: 'clamp(0.85rem,2vw,0.98rem)' }}>{i + 1}. {q.question}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {q.options.map((opt, j) => {
                            const chosen = answers[i] === opt;
                            const correct = submitted && opt === q.answer;
                            const wrong   = submitted && chosen && opt !== q.answer;
                            return (
                                <button key={j} disabled={submitted} onClick={() => setAnswers(a => ({ ...a, [i]: opt }))}
                                    style={{ padding: '10px 12px', borderRadius: 10, fontSize: 'clamp(0.75rem,1.8vw,0.88rem)', fontWeight: 600, textAlign: 'left', cursor: submitted ? 'default' : 'pointer', lineHeight: 1.4,
                                        background: correct ? 'rgba(34,197,94,0.16)' : wrong ? 'rgba(239,68,68,0.16)' : chosen ? 'rgba(79,70,229,0.2)' : 'rgba(255,255,255,0.04)',
                                        border: correct ? '1.5px solid #22c55e' : wrong ? '1.5px solid #ef4444' : chosen ? '1.5px solid #6366f1' : '1px solid rgba(148,163,184,0.18)',
                                        color: correct ? '#86efac' : wrong ? '#fca5a5' : chosen ? '#c7d2fe' : '#cbd5e1' }}>
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                    {submitted && <div style={{ marginTop: 10, fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>💡 {q.explanation}</div>}
                </div>
            ))}
            {!submitted
                ? <button onClick={() => { setSubmitted(true); onDone(quiz.filter((q, i) => answers[i] === q.answer).length); }} disabled={!allAnswered}
                    style={{ width: '100%', padding: 14, background: allAnswered ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : '#1e1b4b', color: '#fff', border: 'none', borderRadius: 14, fontWeight: 800, fontSize: '1rem', cursor: allAnswered ? 'pointer' : 'not-allowed', opacity: allAnswered ? 1 : 0.5 }}>
                    Submit Answers
                  </button>
                : <div style={{ textAlign: 'center', padding: 14, background: 'rgba(79,70,229,0.12)', border: '1px solid #4f46e5', borderRadius: 14, color: '#c7d2fe', fontWeight: 800, fontSize: '1.1rem' }}>
                    {score}/{quiz.length} correct {score === quiz.length ? '🏆' : score >= quiz.length / 2 ? '✅' : '📖'}
                  </div>
            }
        </div>
    );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
const CinemaDisplay: React.FC<CinemaDisplayProps> = ({ cinema, language, onTryAnother }) => {
    const { user, userProfile } = useAuth();
    const acts      = cinema.acts ?? [];
    const lastActIdx = Math.max(0, acts.length - 1);

    const [actIdx,       setActIdx]       = useState(0);
    const [lineIdx,      setLineIdx]      = useState(0);
    const [showCurtainQ, setShowCurtainQ] = useState(false);
    const [showInterval, setShowInterval] = useState(false);
    const [showEnd,      setShowEnd]      = useState(false);
    const [quizScore,    setQuizScore]    = useState<number | null>(null);
    const [autoPlay,     setAutoPlay]     = useState(true);

    // Audio
    const [audioOn,      setAudioOn]      = useState(true);
    const [audioLoading, setAudioLoading] = useState(false);
    const audioCtxRef  = useRef<AudioContext | null>(null);
    const audioSrcRef  = useRef<AudioBufferSourceNode | null>(null);
    const lastSpokenRef = useRef('');

    const screenplayRef = useRef<HTMLDivElement>(null);

    const act   = acts[actIdx];
    const lines = act?.screenplay ?? [];
    const meta  = act ? (ACT_META[act.act_type] ?? ACT_META['hook']) : ACT_META['hook'];

    // Gemini voice selection
    const voiceName = language === 'Tamil'
        ? (act?.act_type === 'climax' ? 'Fenrir' : 'Zephyr')
        : (act?.act_type === 'climax' ? 'Charon' : 'Kore');

    useEffect(() => { setLineIdx(0); setShowCurtainQ(false); }, [actIdx]);
    useEffect(() => { const n = screenplayRef.current; if (n) n.scrollTop = n.scrollHeight; }, [lineIdx, showCurtainQ]);

    // ── Gemini TTS per line ───────────────────────────────────────────────────
    const speakLine = useCallback(async (text: string) => {
        if (!audioOn || !text || lastSpokenRef.current === text) return;
        lastSpokenRef.current = text;
        try {
            setAudioLoading(true);
            const res = await fetch('/api/audio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullStoryText: text.slice(0, 500),
                    language,
                    narratorVoice: voiceName,
                    emotionTone: act?.act_type === 'climax' ? 'dramatic' : act?.act_type === 'hook' ? 'curious' : 'calm',
                }),
            });
            if (!res.ok) return;
            const { base64Audio } = await res.json();
            if (!base64Audio) return;
            if (audioSrcRef.current) { try { audioSrcRef.current.stop(); } catch (_) {} }
            if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
                audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            const ctx = audioCtxRef.current;
            const buf = pcmToBuffer(b64ToUint8(base64Audio), ctx);
            const src = ctx.createBufferSource();
            src.buffer = buf;
            src.connect(ctx.destination);
            src.start();
            audioSrcRef.current = src;
        } catch (_) {
            // silent fail — cinema continues without audio
        } finally {
            setAudioLoading(false);
        }
    }, [audioOn, language, voiceName, act?.act_type]);

    const stopAudio = useCallback(() => {
        if (audioSrcRef.current) { try { audioSrcRef.current.stop(); } catch (_) {} }
        lastSpokenRef.current = '';
    }, []);

    // Speak current line
    useEffect(() => {
        if (showCurtainQ || showInterval || showEnd) return;
        const line = lines[lineIdx];
        if (line?.text) speakLine(line.text);
    }, [lineIdx, actIdx, speakLine, showCurtainQ, showInterval, showEnd]);

    // ── Navigation ────────────────────────────────────────────────────────────
    const handleContinue = useCallback(() => {
        stopAudio();
        setShowCurtainQ(false);
        if (actIdx === 2)         setShowInterval(true);
        else if (actIdx >= lastActIdx) setShowEnd(true);
        else setActIdx(a => Math.min(a + 1, lastActIdx));
    }, [actIdx, lastActIdx, stopAudio]);

    const advance = useCallback(() => {
        if (showCurtainQ || showInterval || showEnd) return;
        if (lineIdx < lines.length - 1) setLineIdx(i => i + 1);
        else setShowCurtainQ(true);
    }, [showCurtainQ, showInterval, showEnd, lineIdx, lines.length]);

    const goToAct = useCallback((idx: number) => {
        stopAudio();
        setShowInterval(false); setShowEnd(false); setShowCurtainQ(false);
        setActIdx(Math.max(0, Math.min(idx, lastActIdx)));
    }, [lastActIdx, stopAudio]);

    // Auto-play
    useEffect(() => {
        if (!autoPlay || showInterval || showEnd) return;
        if (showCurtainQ) {
            const t = setTimeout(handleContinue, 5000); return () => clearTimeout(t);
        }
        // Wait a bit longer when audio is on so speech can finish
        const delay = audioOn ? 5000 : 3000;
        const t = setTimeout(() => {
            if (lineIdx < lines.length - 1) setLineIdx(i => i + 1);
            else setShowCurtainQ(true);
        }, delay);
        return () => clearTimeout(t);
    }, [autoPlay, showCurtainQ, showInterval, showEnd, lineIdx, lines.length, handleContinue, audioOn]);

    const studentName = userProfile?.displayName || user?.displayName || 'Academic Explorer';

    return (
        <div style={{ position: 'fixed', inset: 0, background: '#000008', color: '#e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', zIndex: 1000 }}>
            <style>{`
                @keyframes cd-enter  { from{opacity:0;transform:translateX(-30px)}  to{opacity:1;transform:none} }
                @keyframes cd-float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-13px)} }
                @keyframes cd-pulse  { 0%,100%{transform:scale(1);opacity:.85} 50%{transform:scale(1.09);opacity:1} }
                @keyframes cd-fall   { from{opacity:0;transform:translateY(-38px)} to{opacity:1;transform:none} }
                @keyframes cd-rise   { from{opacity:0;transform:translateY(38px)}  to{opacity:1;transform:none} }
                @keyframes cd-glow   { 0%,100%{filter:drop-shadow(0 0 5px rgba(167,139,250,.3))} 50%{filter:drop-shadow(0 0 20px rgba(167,139,250,.9))} }
                @keyframes cd-fadein { from{opacity:0;transform:translateY(9px)} to{opacity:1;transform:none} }
                @keyframes cd-revglow{ 0%,100%{box-shadow:0 0 10px rgba(240,171,252,.18)} 50%{box-shadow:0 0 30px rgba(240,171,252,.6)} }
                @keyframes cd-stars  { 0%,100%{opacity:.18} 50%{opacity:.55} }
                @keyframes cd-slideup{ from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:none} }
                @keyframes cd-blink  { 0%,100%{opacity:.35} 50%{opacity:.7} }
                * { box-sizing:border-box; }
                ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(124,58,237,.4);border-radius:4px}
            `}</style>

            {/* ── TOP BAR ────────────────────────────────────────────────── */}
            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10, padding: '7px 14px', background: 'rgba(0,0,8,.95)', borderBottom: '1px solid rgba(167,139,250,.14)', zIndex: 20 }}>
                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>🎬</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 900, fontSize: 'clamp(.72rem,2vw,.92rem)', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cinema.cinema_title}</div>
                    <div style={{ fontSize: '.62rem', color: '#7c6fad' }}>{cinema.protagonist?.avatar_emoji} {cinema.protagonist?.name} · Grade {cinema.grade} · {cinema.subject}</div>
                </div>
                <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
                    <button onClick={() => setAudioOn(a => !a)} title={audioOn ? 'Mute audio' : 'Enable audio'}
                        style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(148,163,184,.2)', borderRadius: 8, padding: '5px 9px', color: audioOn ? '#c4b5fd' : '#6b7280', cursor: 'pointer', fontSize: '.95rem' }}>
                        {audioLoading ? '⏳' : audioOn ? '🔊' : '🔇'}
                    </button>
                    <button onClick={() => setAutoPlay(a => !a)}
                        style={{ background: autoPlay ? 'rgba(79,70,229,.22)' : 'rgba(255,255,255,.06)', border: `1px solid ${autoPlay ? '#4f46e5' : 'rgba(148,163,184,.2)'}`, borderRadius: 8, padding: '5px 9px', color: autoPlay ? '#c4b5fd' : '#6b7280', cursor: 'pointer', fontSize: '.68rem', fontWeight: 700 }}>
                        {autoPlay ? '⏸ AUTO' : '▶ AUTO'}
                    </button>
                    <button onClick={onTryAnother}
                        style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(148,163,184,.2)', borderRadius: 8, padding: '5px 9px', color: '#94a3b8', cursor: 'pointer', fontSize: '.68rem', fontWeight: 700 }}>
                        ✕ Exit
                    </button>
                </div>
            </div>

            {/* ── ACT PROGRESS DOTS ──────────────────────────────────────── */}
            <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 7, padding: '5px 0', background: 'rgba(0,0,8,.8)' }}>
                {acts.map((a, i) => {
                    const m = ACT_META[a.act_type] ?? ACT_META['hook'];
                    const active = i === actIdx && !showEnd && !showInterval;
                    return (
                        <button key={i} onClick={() => goToAct(i)} title={`Act ${i+1}: ${a.act_title}`}
                            style={{ width: active ? 26 : 9, height: 9, borderRadius: 9999, border: 'none', cursor: 'pointer', background: active ? m.color : i < actIdx || showEnd ? `${m.color}55` : 'rgba(255,255,255,.12)', transition: 'all .3s ease', padding: 0 }} />
                    );
                })}
                {showEnd && <span style={{ color: '#a855f7', fontSize: '.65rem', fontWeight: 800, marginLeft: 6 }}>✓ Complete</span>}
            </div>

            {/* ── MAIN ───────────────────────────────────────────────────── */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>

                {/* ── END SCREEN (persistent) ──────────────────────────── */}
                {showEnd ? (
                    <div style={{ flex: 1, overflowY: 'auto', padding: '18px 16px 40px', maxWidth: 700, margin: '0 auto', width: '100%' }}>

                        {/* Exam Spotlight */}
                        <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(167,139,250,.22)', borderRadius: 18, padding: '18px 18px 20px', marginBottom: 20, animation: 'cd-slideup .5s ease' }}>
                            <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 'clamp(1rem,3vw,1.3rem)', marginBottom: 14 }}>📝 TN Board Exam Spotlight</h2>
                            <div style={{ color: '#a78bfa', fontSize: '.65rem', fontWeight: 800, letterSpacing: '.12em', marginBottom: 5 }}>MOST ASKED QUESTION</div>
                            <div style={{ background: 'rgba(168,85,247,.1)', border: '1px solid rgba(168,85,247,.38)', borderRadius: 12, padding: '12px 14px', color: '#f1f5f9', marginBottom: 16, lineHeight: 1.6, fontSize: 'clamp(.82rem,2vw,.95rem)' }}>
                                {cinema.exam_spotlight?.most_asked_question}
                            </div>
                            <div style={{ color: '#a78bfa', fontSize: '.65rem', fontWeight: 800, letterSpacing: '.12em', marginBottom: 10 }}>MODEL ANSWER STRUCTURE</div>
                            {(cinema.exam_spotlight?.model_answer_structure ?? []).map((step, i) => (
                                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 9, alignItems: 'flex-start' }}>
                                    <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', fontWeight: 900, fontSize: '.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i+1}</span>
                                    <span style={{ color: '#e2e8f0', lineHeight: 1.5, fontSize: 'clamp(.8rem,2vw,.92rem)', paddingTop: 1 }}>{step}</span>
                                </div>
                            ))}
                            <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                                <span style={{ background: 'rgba(34,197,94,.12)', border: '1px solid rgba(34,197,94,.42)', color: '#86efac', borderRadius: 9999, padding: '6px 14px', fontWeight: 700, fontSize: '.8rem' }}>🎯 {cinema.exam_spotlight?.marks_tip}</span>
                                {cinema.exam_spotlight?.previous_year_hint && <span style={{ color: '#fbbf24', fontStyle: 'italic', fontSize: '.82rem' }}>📅 {cinema.exam_spotlight.previous_year_hint}</span>}
                            </div>
                        </div>

                        {/* Quiz */}
                        <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(148,163,184,.14)', borderRadius: 18, padding: '18px 18px 20px', marginBottom: 20, animation: 'cd-slideup .6s ease' }}>
                            <QuizPanel quiz={cinema.quiz ?? []} onDone={setQuizScore} />
                        </div>

                        {/* Certificate */}
                        {quizScore !== null && (
                            <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(252,211,77,.28)', borderRadius: 18, padding: '24px 18px', textAlign: 'center', animation: 'cd-slideup .5s ease', marginBottom: 20 }}>
                                <div style={{ fontSize: 'clamp(2rem,5vw,2.8rem)', marginBottom: 8 }}>🏆</div>
                                <div style={{ fontWeight: 900, fontSize: 'clamp(1.1rem,3vw,1.4rem)', color: '#fff', marginBottom: 4 }}>Congratulations, {studentName}!</div>
                                <div style={{ color: '#94a3b8', marginBottom: 14, fontSize: 'clamp(.8rem,2vw,.92rem)' }}>Completed <em>{cinema.cinema_title}</em></div>
                                <div style={{ fontSize: 'clamp(1.4rem,4vw,1.9rem)', fontWeight: 900, color: '#fcd34d', marginBottom: 22 }}>{quizScore} / {cinema.quiz?.length ?? 0}</div>
                                <button onClick={onTryAnother} style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none', borderRadius: 14, padding: '13px 30px', fontWeight: 900, fontSize: '.95rem', cursor: 'pointer' }}>
                                    🎬 New Cinema Experience
                                </button>
                            </div>
                        )}

                        {/* Concept connections */}
                        <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(96,165,250,.18)', borderRadius: 18, padding: '18px 18px', animation: 'cd-slideup .7s ease' }}>
                            <h3 style={{ color: '#fff', fontWeight: 900, fontSize: '.95rem', marginBottom: 12 }}>🔗 Concept Connections</h3>
                            {(cinema.quiz ?? []).map((q, i) => (
                                <div key={i} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: i < (cinema.quiz?.length ?? 0) - 1 ? '1px solid rgba(148,163,184,.1)' : 'none' }}>
                                    <div style={{ color: '#93c5fd', fontWeight: 700, fontSize: '.8rem', marginBottom: 2 }}>{q.question}</div>
                                    <div style={{ color: '#60a5fa', fontSize: '.75rem', fontStyle: 'italic' }}>🔗 {q.concept_connection}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                ) : showInterval ? (
                    /* ── INTERVAL ────────────────────────────────────────── */
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                        <div style={{ textAlign: 'center', maxWidth: 540, animation: 'cd-slideup .5s ease' }}>
                            <div style={{ fontSize: 'clamp(1.8rem,5vw,3rem)', fontWeight: 900, color: '#fcd34d', marginBottom: 18, letterSpacing: '.08em' }}>🍿 INTERVAL</div>
                            <div style={{ color: '#a78bfa', fontSize: '.66rem', fontWeight: 800, letterSpacing: '.14em', marginBottom: 5 }}>SO FAR…</div>
                            <p style={{ color: '#e2e8f0', lineHeight: 1.65, marginBottom: 20, fontSize: 'clamp(.88rem,2.2vw,1.02rem)' }}>{cinema.interval_card?.recap}</p>
                            <div style={{ color: '#fbbf24', fontSize: '.66rem', fontWeight: 800, letterSpacing: '.14em', marginBottom: 5 }}>COMING UP…</div>
                            <p style={{ color: '#fde68a', fontStyle: 'italic', lineHeight: 1.65, marginBottom: 28, fontSize: 'clamp(.88rem,2.2vw,1.02rem)' }}>{cinema.interval_card?.teaser}</p>
                            <button onClick={() => { setShowInterval(false); setActIdx(3); }}
                                style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none', borderRadius: 14, padding: '13px 30px', fontWeight: 800, fontSize: '.95rem', cursor: 'pointer' }}>
                                Continue → Act 4
                            </button>
                        </div>
                    </div>

                ) : (
                    /* ── THEATRE ─────────────────────────────────────────── */
                    <>
                        {/* STAGE */}
                        <div onClick={advance} style={{ flex: '0 0 44%', position: 'relative', cursor: 'pointer', background: meta.stageBg, overflow: 'hidden', borderBottom: `2px solid ${meta.color}28` }}>

                            {/* Starfield */}
                            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(1px 1px at 12% 18%,#fff,transparent),radial-gradient(1px 1px at 67% 9%,rgba(255,255,255,.7),transparent),radial-gradient(1.5px 1.5px at 38% 72%,#fff,transparent),radial-gradient(1px 1px at 82% 38%,rgba(255,255,255,.6),transparent),radial-gradient(1px 1px at 4% 58%,#fff,transparent),radial-gradient(1px 1px at 94% 78%,rgba(255,255,255,.5),transparent)', animation: 'cd-stars 4s ease-in-out infinite', pointerEvents: 'none', opacity: .45, zIndex: 1 }} />

                            {/* Cinema frame corners */}
                            {[{t:'8px',l:'8px',bt:'2.5px solid #facc15',bl:'2.5px solid #facc15'},{t:'8px',r:'8px',bt:'2.5px solid #facc15',br:'2.5px solid #facc15'},{b:'8px',l:'8px',bb:'2.5px solid #facc15',bl:'2.5px solid #facc15'},{b:'8px',r:'8px',bb:'2.5px solid #facc15',br:'2.5px solid #facc15'}].map((c,i)=>(
                                <div key={i} style={{ position:'absolute', ...Object.fromEntries(Object.entries(c).map(([k,v])=>[k==='bt'?'borderTop':k==='bl'?'borderLeft':k==='br'?'borderRight':k==='bb'?'borderBottom':k,v])), width:26, height:26, pointerEvents:'none', zIndex:8 }} />
                            ))}

                            {/* Curtains */}
                            <div style={{ position:'absolute', top:0, left:0, bottom:0, width:'6%', background:'linear-gradient(90deg,#4a0d12,#7f1d1d 60%,transparent)', boxShadow:'inset -10px 0 18px rgba(0,0,0,.5)', pointerEvents:'none', zIndex:6 }} />
                            <div style={{ position:'absolute', top:0, right:0, bottom:0, width:'6%', background:'linear-gradient(270deg,#4a0d12,#7f1d1d 60%,transparent)', boxShadow:'inset 10px 0 18px rgba(0,0,0,.5)', pointerEvents:'none', zIndex:6 }} />

                            {/* Setting label */}
                            <div style={{ position:'absolute', top:9, left:'8%', right:'8%', textAlign:'center', color:'rgba(226,232,240,.4)', fontSize:'clamp(.58rem,1.4vw,.7rem)', fontStyle:'italic', zIndex:2, pointerEvents:'none' }}>
                                📍 {act?.setting?.place} · {act?.setting?.time_of_day}
                            </div>

                            {/* Stage elements */}
                            {(act?.stage_elements ?? []).map((el, i) => (
                                <StageVisual key={`${actIdx}-${i}`} el={el} />
                            ))}

                            {/* Act badge */}
                            <div style={{ position:'absolute', bottom:8, left:12, zIndex:7, pointerEvents:'none', display:'flex', gap:6, alignItems:'center' }}>
                                <span style={{ background:`${meta.color}20`, border:`1px solid ${meta.color}88`, color:meta.color, borderRadius:9999, padding:'3px 10px', fontSize:'.6rem', fontWeight:800, letterSpacing:'.08em', textTransform:'uppercase' }}>{meta.label}</span>
                                <span style={{ color:'rgba(226,232,240,.45)', fontSize:'.6rem' }}>Act {act?.act_number}: {act?.act_title}</span>
                            </div>

                            {/* Tap hint */}
                            <div style={{ position:'absolute', bottom:9, right:12, zIndex:7, color:'rgba(148,163,184,.4)', fontSize:'.58rem', pointerEvents:'none', animation:'cd-blink 2.5s ease-in-out infinite' }}>tap →</div>
                        </div>

                        {/* SCREENPLAY */}
                        <div ref={screenplayRef} onClick={advance} style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 6px', cursor: 'pointer', background: 'rgba(0,0,6,.96)', borderTop: `1px solid ${meta.color}28` }}>
                            {lines.slice(0, lineIdx + 1).map((line, i) => (
                                <LineView key={`${actIdx}-${i}`} line={line} protagonistName={cinema.protagonist?.name ?? ''} protagonistEmoji={cinema.protagonist?.avatar_emoji ?? '🧑'} isNew={i === lineIdx} />
                            ))}
                            {!showCurtainQ && lineIdx >= lines.length - 1 && (
                                <div style={{ textAlign:'center', color:'rgba(148,163,184,.3)', fontSize:'.6rem', marginTop:6 }}>— end of scene —</div>
                            )}
                            {showCurtainQ && act?.curtain_question && (
                                <div style={{ margin:'14px 0', background:'linear-gradient(135deg,#0d0020,#000008)', border:'1px solid rgba(167,139,250,.32)', borderRadius:14, padding:'16px 18px', textAlign:'center', animation:'cd-fadein .4s ease' }}>
                                    <p style={{ color:'#fff', fontSize:'clamp(.88rem,2.2vw,1.08rem)', fontWeight:700, lineHeight:1.55, margin:'0 0 5px' }}>{act.curtain_question}</p>
                                    <p style={{ color:'#a78bfa', fontSize:'.78rem', fontStyle:'italic', margin:'0 0 13px' }}>💭 Think about it…</p>
                                    <button onClick={e => { e.stopPropagation(); handleContinue(); }}
                                        style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)', color:'#fff', border:'none', borderRadius:12, padding:'10px 24px', fontWeight:800, fontSize:'.88rem', cursor:'pointer' }}>
                                        {actIdx === 2 ? '🍿 Interval →' : actIdx >= lastActIdx ? '📝 Exam Spotlight →' : 'Next Act →'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* CONCEPT BOARD — fixed strip at bottom */}
                        {act?.concept_board && (
                            <div style={{ flexShrink:0, background:'rgba(10,0,22,.98)', borderTop:`2px solid ${meta.color}44`, padding:'7px 14px', display:'flex', gap:12, alignItems:'flex-start' }}>
                                <div style={{ flex:1, minWidth:0 }}>
                                    <div style={{ color:meta.color, fontWeight:900, fontSize:'clamp(.7rem,1.8vw,.82rem)', marginBottom:2 }}>{act.concept_board.title}</div>
                                    {act.concept_board.formula && (
                                        <div style={{ fontFamily:'"SF Mono",ui-monospace,Menlo,monospace', color:'#f0abfc', fontSize:'clamp(.76rem,1.9vw,.9rem)', background:'rgba(240,171,252,.07)', borderRadius:7, padding:'3px 10px', marginBottom:3, display:'inline-block' }}>
                                            {act.concept_board.formula}
                                        </div>
                                    )}
                                    {act.concept_board.tamil_analogy && (
                                        <div style={{ color:'#fbbf24', fontSize:'clamp(.64rem,1.6vw,.76rem)', fontStyle:'italic', lineHeight:1.4 }}>🌾 {act.concept_board.tamil_analogy}</div>
                                    )}
                                </div>
                                <div style={{ flexShrink:0, maxWidth:155 }}>
                                    {(act.concept_board.key_points ?? []).slice(0,2).map((pt, i) => (
                                        <div key={i} style={{ color:'#e2e8f0', fontSize:'clamp(.62rem,1.5vw,.72rem)', marginBottom:3, display:'flex', gap:5, alignItems:'flex-start', lineHeight:1.4 }}>
                                            <span style={{ color:meta.color, flexShrink:0 }}>▸</span>{pt}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CinemaDisplay;
