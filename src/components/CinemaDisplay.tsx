/**
 * CinemaDisplay.tsx  —  FeelEd Cinema Theatre
 *
 * Architecture:
 * - Launches fullscreen automatically via Fullscreen API
 * - Stage = pure animated SVG visuals ONLY (zero text on stage)
 * - Subtitles = below stage like a movie, fade in per line
 * - Audio = full act narration pre-generated once per act via /api/audio
 *           plays as one continuous track while visuals & subtitles animate
 * - Each act: generate audio → play → animate stage → show subtitles in sync
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CinemaStory, StageElement, CinemaActType } from '../types';
import { useAuth } from '../context/AuthContext';

// ─── Props ────────────────────────────────────────────────────────────────────
interface CinemaDisplayProps {
    cinema: CinemaStory;
    language: string;
    onTryAnother: () => void;
}

// ─── PCM audio helpers ────────────────────────────────────────────────────────
function b64ToBytes(b64: string): Uint8Array {
    const s = atob(b64);
    const out = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
    return out;
}
function pcmToBuffer(bytes: Uint8Array, ctx: AudioContext): AudioBuffer {
    const i16 = new Int16Array(bytes.buffer);
    const buf = ctx.createBuffer(1, i16.length, 24000);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < i16.length; i++) ch[i] = i16[i] / 32768;
    return buf;
}

// ─── Act meta ─────────────────────────────────────────────────────────────────
const ACT_COLOR: Record<CinemaActType, string> = {
    hook:          '#f59e0b',
    rising_action: '#3b82f6',
    climax:        '#f43f5e',
    resolution:    '#22c55e',
    exam_bridge:   '#a855f7',
};
const ACT_LABEL: Record<CinemaActType, string> = {
    hook: 'Hook', rising_action: 'Rising Action', climax: 'Climax',
    resolution: 'Resolution', exam_bridge: 'Exam Bridge',
};
const STAGE_BG: Record<CinemaActType, string> = {
    hook:          'radial-gradient(ellipse at 40% 35%, #180430 0%, #020008 75%)',
    rising_action: 'radial-gradient(ellipse at 55% 25%, #01082a 0%, #020008 75%)',
    climax:        'radial-gradient(ellipse at 50% 30%, #1a0005 0%, #020008 75%)',
    resolution:    'radial-gradient(ellipse at 45% 35%, #001508 0%, #020008 75%)',
    exam_bridge:   'radial-gradient(ellipse at 50% 30%, #0a0018 0%, #020008 75%)',
};

// ─── Stage Visual ─────────────────────────────────────────────────────────────
// Pure animated SVG — ZERO text on the stage canvas itself.
// The element's label appears only in the subtitle bar below.
function StageScene({ elements, actType, tick }: {
    elements: StageElement[];
    actType: CinemaActType;
    tick: number;
}) {
    const color = ACT_COLOR[actType] ?? '#a78bfa';

    return (
        <svg
            viewBox="0 0 400 280"
            width="100%" height="100%"
            style={{ display: 'block', position: 'absolute', inset: 0 }}
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <radialGradient id="glow1" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.18"/>
                    <stop offset="100%" stopColor={color} stopOpacity="0"/>
                </radialGradient>
                <filter id="blur4"><feGaussianBlur stdDeviation="4"/></filter>
                <filter id="blur2"><feGaussianBlur stdDeviation="2"/></filter>
                <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                    <polygon points="0 0,8 3,0 6" fill={color}/>
                </marker>
            </defs>

            {/* Ambient glow behind elements */}
            <ellipse cx="200" cy="140" rx="160" ry="100" fill="url(#glow1)" opacity={0.6 + 0.1 * Math.sin(tick * 0.04)}/>

            {/* Stars */}
            {[
                [30,25],[370,40],[15,200],[385,190],[200,15],[100,55],[310,60],
                [55,150],[340,140],[180,265],[240,270],[80,260],[330,265],
            ].map(([x,y],i)=>(
                <circle key={i} cx={x} cy={y} r={1 + (i%3)*0.5}
                    fill="white"
                    opacity={0.25 + 0.35 * Math.sin(tick*0.05 + i*1.3)}/>
            ))}

            {/* Render each element as a meaningful SVG shape */}
            {elements.slice(0, 4).map((el, i) => {
                // Distribute positions across the stage
                const positions = [
                    { cx: 100, cy: 120 },
                    { cx: 300, cy: 110 },
                    { cx: 200, cy: 150 },
                    { cx: 160, cy: 190 },
                ];
                const { cx, cy } = positions[i] ?? { cx: 200, cy: 140 };
                const floatY = Math.sin(tick * 0.035 + i * 1.1) * 8;
                const pulseR = 1 + 0.06 * Math.sin(tick * 0.05 + i * 0.8);

                if (el.element_type === 'formula') {
                    // Glowing box with formula visual (no rendered text — represented by symbol)
                    const glowA = 0.5 + 0.3 * Math.sin(tick * 0.06 + i);
                    return (
                        <g key={i} transform={`translate(${cx},${cy + floatY})`}>
                            <rect x="-52" y="-22" width="104" height="44" rx="10"
                                fill="rgba(240,171,252,0.08)" stroke="#f0abfc" strokeWidth="1.5" strokeOpacity={glowA}/>
                            <rect x="-52" y="-22" width="104" height="44" rx="10"
                                fill="none" stroke="#f0abfc" strokeWidth="4" filter="url(#blur4)" strokeOpacity={glowA*0.4}/>
                            {/* Mathematical symbol representing formula */}
                            {el.highlight && <circle cx="0" cy="0" r="30" fill="rgba(240,171,252,0.06)" filter="url(#blur2)"/>}
                            {/* Simple equals / formula indicator icons */}
                            <line x1="-20" y1="-6" x2="20" y2="-6" stroke="#f0abfc" strokeWidth="2.5" opacity={0.8}/>
                            <line x1="-20" y1="6" x2="20" y2="6" stroke="#f0abfc" strokeWidth="2.5" opacity={0.8}/>
                            <circle cx="-32" cy="0" r="4" fill={color} opacity={0.7}/>
                            <circle cx="32" cy="0" r="4" fill={color} opacity={0.7}/>
                        </g>
                    );
                }

                if (el.element_type === 'diagram') {
                    const name = el.name.toLowerCase();
                    if (name.includes('wave') || name.includes('அலை') || name.includes('light') || name.includes('sound')) {
                        // Animated sine wave
                        const pts = Array.from({length: 20}, (_,j) => {
                            const x2 = -60 + j*7;
                            const y2 = Math.sin((j*0.6 + tick*0.08)) * 18;
                            return `${x2},${y2}`;
                        }).join(' ');
                        return (
                            <g key={i} transform={`translate(${cx},${cy})`}>
                                <polyline points={pts} fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round"/>
                                <polyline points={pts} fill="none" stroke="#34d399" strokeWidth="6" filter="url(#blur2)" opacity={0.25}/>
                            </g>
                        );
                    }
                    if (name.includes('force') || name.includes('arrow') || name.includes('விசை')) {
                        // Animated force arrow
                        const arrowLen = 55 + 15 * Math.sin(tick * 0.06);
                        return (
                            <g key={i} transform={`translate(${cx - arrowLen/2},${cy})`}>
                                <line x1="0" y1="0" x2={arrowLen} y2="0"
                                    stroke={color} strokeWidth="3.5" markerEnd="url(#arrow)"/>
                                <line x1="0" y1="0" x2={arrowLen} y2="0"
                                    stroke={color} strokeWidth="8" filter="url(#blur2)" opacity={0.3}/>
                            </g>
                        );
                    }
                    if (name.includes('graph') || name.includes('chart') || name.includes('வரை')) {
                        const chartH = 40;
                        return (
                            <g key={i} transform={`translate(${cx},${cy})`}>
                                <line x1="-50" y1="0" x2="50" y2="0" stroke="#475569" strokeWidth="1.5"/>
                                <line x1="-50" y1="0" x2="-50" y2={-chartH} stroke="#475569" strokeWidth="1.5"/>
                                {[0,1,2,3,4].map(j=>{
                                    const bh = (j+1)*7 + 2*Math.sin(tick*0.04+j);
                                    return <rect key={j} x={-40+j*20} y={-bh} width="14" height={bh}
                                        fill={color} opacity={0.7} rx="2"/>;
                                })}
                            </g>
                        );
                    }
                    if (name.includes('cell') || name.includes('கலம்') || name.includes('nucleus')) {
                        const breathe = 1 + 0.04 * Math.sin(tick * 0.04);
                        return (
                            <g key={i} transform={`translate(${cx},${cy + floatY}) scale(${breathe})`}>
                                <ellipse cx="0" cy="0" rx="48" ry="36" fill="rgba(52,211,153,0.07)" stroke="#34d399" strokeWidth="1.8"/>
                                <ellipse cx="6" cy="-4" rx="18" ry="13" fill="rgba(134,239,172,0.12)" stroke="#86efac" strokeWidth="1.4"/>
                                {/* organelles */}
                                <circle cx="-18" cy="10" r="4" fill="rgba(52,211,153,0.4)"/>
                                <circle cx="20" cy="12" r="3" fill="rgba(52,211,153,0.35)"/>
                            </g>
                        );
                    }
                    // Generic orbit diagram
                    const orbitR = 38;
                    const moonX = cx + orbitR * Math.cos(tick * 0.045);
                    const moonY = cy + orbitR * 0.45 * Math.sin(tick * 0.045);
                    return (
                        <g key={i}>
                            <ellipse cx={cx} cy={cy} rx={orbitR} ry={orbitR*0.45}
                                fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.35" strokeDasharray="4 4"/>
                            <circle cx={cx} cy={cy} r={18 * pulseR} fill={`${color}18`} stroke={color} strokeWidth="1.5"/>
                            <circle cx={moonX} cy={moonY} r="7" fill={color} opacity="0.8"/>
                        </g>
                    );
                }

                if (el.element_type === 'effect') {
                    // Particle burst / sparkle effect
                    return (
                        <g key={i} transform={`translate(${cx},${cy})`}>
                            {[0,60,120,180,240,300].map((deg,j)=>{
                                const rad = deg * Math.PI / 180;
                                const r = 28 + 12 * Math.sin(tick * 0.07 + j);
                                return (
                                    <g key={j} transform={`translate(${r*Math.cos(rad)},${r*Math.sin(rad)})`}>
                                        <circle r="3.5" fill="#fde68a" opacity={0.6 + 0.4*Math.sin(tick*0.09+j*0.7)}/>
                                    </g>
                                );
                            })}
                            <circle cx="0" cy="0" r="10" fill={color} opacity={0.25 + 0.15*Math.sin(tick*0.05)}/>
                        </g>
                    );
                }

                if (el.element_type === 'label') {
                    // Glowing pill label — just shape, no text
                    return (
                        <g key={i} transform={`translate(${cx},${cy + floatY})`}>
                            <rect x="-38" y="-14" width="76" height="28" rx="14"
                                fill={`${color}18`} stroke={color} strokeWidth="1.5"
                                strokeOpacity={0.7 + 0.3 * Math.sin(tick*0.05+i)}/>
                            <rect x="-38" y="-14" width="76" height="28" rx="14"
                                fill="none" stroke={color} strokeWidth="4" filter="url(#blur4)" opacity="0.3"/>
                        </g>
                    );
                }

                // character / object — animated emoji-like blob
                const name = el.name.toLowerCase();
                let emoji = (el.name.match(/^\p{Extended_Pictographic}/u) ?? [])[0] ?? '';
                if (!emoji) {
                    if (name.includes('newton') || name.includes('நியூட்டன்')) emoji = '🧑‍🔬';
                    else if (name.includes('einstein')) emoji = '👨‍🔬';
                    else if (name.includes('raman') || name.includes('ராமன்')) emoji = '🔬';
                    else if (name.includes('apple') || name.includes('ஆப்பிள்')) emoji = '🍎';
                    else if (name.includes('student') || name.includes('மாணவ')) emoji = '🎓';
                    else if (name.includes('sun') || name.includes('சூரிய')) emoji = '☀️';
                    else if (name.includes('moon') || name.includes('நிலா')) emoji = '🌙';
                    else if (name.includes('plant') || name.includes('leaf') || name.includes('இலை')) emoji = '🌿';
                    else if (name.includes('earth') || name.includes('பூமி')) emoji = '🌍';
                    else if (name.includes('atom') || name.includes('அணு')) emoji = '⚛️';
                    else if (name.includes('bulb') || name.includes('lamp')) emoji = '💡';
                    else if (name.includes('magnet') || name.includes('காந்த')) emoji = '🧲';
                    else if (name.includes('water') || name.includes('நீர்')) emoji = '💧';
                    else if (name.includes('car') || name.includes('வண்டி')) emoji = '🚗';
                    else if (name.includes('book') || name.includes('நூல்')) emoji = '📖';
                    else if (name.includes('telescope')) emoji = '🔭';
                    else if (name.includes('flask') || name.includes('chemical')) emoji = '⚗️';
                    else emoji = el.element_type === 'character' ? '🧑' : '🔶';
                }

                const emojiSize = el.element_type === 'character' ? 52 : 42;
                const highlightGlow = el.highlight
                    ? <circle cx={cx} cy={cy + floatY} r={emojiSize * 0.8}
                        fill="none" stroke={color} strokeWidth="2"
                        strokeOpacity={0.5 + 0.3*Math.sin(tick*0.05)}
                        filter="url(#blur2)"/>
                    : null;

                return (
                    <g key={i}>
                        {highlightGlow}
                        <text
                            x={cx} y={cy + floatY + emojiSize * 0.38}
                            fontSize={emojiSize}
                            textAnchor="middle"
                            style={{ userSelect: 'none' }}
                        >
                            {emoji}
                        </text>
                    </g>
                );
            })}

            {/* Concept highlight beam (for climax act) */}
            {actType === 'climax' && (
                <line
                    x1="200" y1="0"
                    x2={200 + 60*Math.cos(tick*0.03)} y2={280}
                    stroke={color} strokeWidth="0.8" opacity={0.12 + 0.08*Math.sin(tick*0.04)}
                    filter="url(#blur4)"
                />
            )}
        </svg>
    );
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────
function QuizPanel({ quiz, onDone }: { quiz: CinemaStory['quiz']; onDone: (s: number) => void }) {
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const score = submitted ? quiz.filter((q, i) => answers[i] === q.answer).length : 0;
    const allDone = Object.keys(answers).length >= quiz.length;
    return (
        <div>
            <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 'clamp(1rem,3vw,1.3rem)', marginBottom: 18 }}>🎯 Quick Quiz</h2>
            {quiz.map((q, i) => (
                <div key={i} style={{ marginBottom: 18, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(148,163,184,.12)', borderRadius: 14, padding: '14px 16px' }}>
                    <p style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: 10, lineHeight: 1.5, fontSize: 'clamp(.82rem,2vw,.95rem)' }}>{i+1}. {q.question}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                        {q.options.map((opt, j) => {
                            const chosen = answers[i] === opt;
                            const correct = submitted && opt === q.answer;
                            const wrong   = submitted && chosen && opt !== q.answer;
                            return (
                                <button key={j} disabled={submitted} onClick={() => setAnswers(a => ({ ...a, [i]: opt }))}
                                    style={{ padding: '9px 11px', borderRadius: 10, fontSize: 'clamp(.72rem,1.8vw,.85rem)', fontWeight: 600, textAlign: 'left', cursor: submitted ? 'default' : 'pointer', lineHeight: 1.4,
                                        background: correct ? 'rgba(34,197,94,.15)' : wrong ? 'rgba(239,68,68,.15)' : chosen ? 'rgba(79,70,229,.18)' : 'rgba(255,255,255,.04)',
                                        border: correct ? '1.5px solid #22c55e' : wrong ? '1.5px solid #ef4444' : chosen ? '1.5px solid #6366f1' : '1px solid rgba(148,163,184,.17)',
                                        color: correct ? '#86efac' : wrong ? '#fca5a5' : chosen ? '#c7d2fe' : '#cbd5e1' }}>
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                    {submitted && <div style={{ marginTop: 9, fontSize: '.78rem', color: '#94a3b8', lineHeight: 1.5 }}>💡 {q.explanation}</div>}
                </div>
            ))}
            {!submitted
                ? <button disabled={!allDone} onClick={() => { setSubmitted(true); onDone(quiz.filter((q,i) => answers[i]===q.answer).length); }}
                    style={{ width: '100%', padding: 13, background: allDone ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : '#1e1b4b', color: '#fff', border: 'none', borderRadius: 13, fontWeight: 800, fontSize: '.95rem', cursor: allDone ? 'pointer' : 'not-allowed', opacity: allDone ? 1 : 0.5 }}>
                    Submit Answers
                  </button>
                : <div style={{ textAlign: 'center', padding: 13, background: 'rgba(79,70,229,.12)', border: '1px solid #4f46e5', borderRadius: 13, color: '#c7d2fe', fontWeight: 800, fontSize: '1.05rem' }}>
                    {score}/{quiz.length} correct {score===quiz.length?'🏆':score>=quiz.length/2?'✅':'📖'}
                  </div>
            }
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const CinemaDisplay: React.FC<CinemaDisplayProps> = ({ cinema, language, onTryAnother }) => {
    const { user, userProfile } = useAuth();
    const acts = cinema.acts ?? [];
    const lastActIdx = Math.max(0, acts.length - 1);
    const containerRef = useRef<HTMLDivElement>(null);

    // ── State ─────────────────────────────────────────────────────────────────
    const [actIdx,       setActIdx]       = useState(0);
    const [lineIdx,      setLineIdx]      = useState(-1);   // -1 = stage only (pre-dialogue)
    const [showCurtainQ, setShowCurtainQ] = useState(false);
    const [showInterval, setShowInterval] = useState(false);
    const [showEnd,      setShowEnd]      = useState(false);
    const [quizScore,    setQuizScore]    = useState<number | null>(null);
    const [tick,         setTick]         = useState(0);    // animation clock
    const [isPlaying,    setIsPlaying]    = useState(false);
    const [audioLoading, setAudioLoading] = useState(false);
    const [audioOn,      setAudioOn]      = useState(true);

    // Per-act audio cache: actIdx → base64 string
    const audioCacheRef = useRef<Record<number, string>>({});
    const audioCtxRef   = useRef<AudioContext | null>(null);
    const audioSrcRef   = useRef<AudioBufferSourceNode | null>(null);

    const act   = acts[actIdx];
    const lines = act?.screenplay ?? [];
    const color = act ? (ACT_COLOR[act.act_type] ?? '#a78bfa') : '#a78bfa';

    // ── Animation tick ────────────────────────────────────────────────────────
    useEffect(() => {
        const id = setInterval(() => setTick(t => t + 1), 50);
        return () => clearInterval(id);
    }, []);

    // ── Fullscreen on mount ───────────────────────────────────────────────────
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const req = el.requestFullscreen
            ?? (el as any).webkitRequestFullscreen
            ?? (el as any).mozRequestFullScreen;
        if (req) req.call(el).catch(() => {});
        return () => {
            if (document.fullscreenElement) {
                document.exitFullscreen?.().catch(() => {});
            }
        };
    }, []);

    // ── Audio: generate full act narration ───────────────────────────────────
    const generateActAudio = useCallback(async (idx: number) => {
        if (!audioOn) return;
        if (audioCacheRef.current[idx]) return; // already cached

        const a = acts[idx];
        if (!a) return;

        // Concatenate all screenplay lines into one narration text
        const narrationText = a.screenplay
            .map(l => l.text)
            .join(' ')
            .slice(0, 480); // Gemini TTS safe limit

        const voiceName = language === 'Tamil'
            ? (a.act_type === 'climax' ? 'Fenrir' : 'Zephyr')
            : (a.act_type === 'climax' ? 'Charon' : 'Kore');

        const emotionTone = a.act_type === 'climax' ? 'dramatic and intense'
            : a.act_type === 'hook' ? 'curious and engaging'
            : a.act_type === 'resolution' ? 'warm and satisfied'
            : 'clear and engaging';

        try {
            setAudioLoading(true);
            const res = await fetch('/api/audio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullStoryText: narrationText, language, narratorVoice: voiceName, emotionTone }),
            });
            if (!res.ok) return;
            const { base64Audio } = await res.json();
            if (base64Audio) audioCacheRef.current[idx] = base64Audio;
        } catch (_) {
            // silently continue — cinema works without audio
        } finally {
            setAudioLoading(false);
        }
    }, [audioOn, language, acts]);

    // ── Audio: play cached act audio ─────────────────────────────────────────
    const playActAudio = useCallback((idx: number) => {
        const b64 = audioCacheRef.current[idx];
        if (!b64 || !audioOn) return;

        if (audioSrcRef.current) { try { audioSrcRef.current.stop(); } catch (_) {} }
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioCtxRef.current;
        try {
            const buf = pcmToBuffer(b64ToBytes(b64), ctx);
            const src = ctx.createBufferSource();
            src.buffer = buf;
            src.connect(ctx.destination);
            src.onended = () => setIsPlaying(false);
            src.start();
            audioSrcRef.current = src;
            setIsPlaying(true);
        } catch (_) {}
    }, [audioOn]);

    const stopAudio = useCallback(() => {
        if (audioSrcRef.current) { try { audioSrcRef.current.stop(); } catch (_) {} }
        setIsPlaying(false);
    }, []);

    // ── On act change: reset, generate audio, start subtitle progression ──────
    useEffect(() => {
        setLineIdx(-1);
        setShowCurtainQ(false);

        // Generate audio for this act (and pre-fetch next)
        generateActAudio(actIdx).then(() => {
            playActAudio(actIdx);
        });
        if (actIdx + 1 <= lastActIdx) generateActAudio(actIdx + 1);

        // Begin subtitle progression after brief stage-only intro
        const introDelay = setTimeout(() => setLineIdx(0), 1800);
        return () => {
            clearTimeout(introDelay);
            stopAudio();
        };
    }, [actIdx]); // eslint-disable-line

    // ── Auto subtitle advance ─────────────────────────────────────────────────
    // Estimate reading/listening time per line: ~70 words/min ≈ 850ms/word, min 3s
    useEffect(() => {
        if (lineIdx < 0 || showCurtainQ) return;
        if (lineIdx >= lines.length) { setShowCurtainQ(true); return; }

        const wordCount = (lines[lineIdx]?.text ?? '').split(' ').length;
        const delay = Math.max(3000, wordCount * 380);
        const t = setTimeout(() => {
            if (lineIdx < lines.length - 1) setLineIdx(l => l + 1);
            else setShowCurtainQ(true);
        }, delay);
        return () => clearTimeout(t);
    }, [lineIdx, showCurtainQ, lines]);

    // ── Navigation ────────────────────────────────────────────────────────────
    const handleContinue = useCallback(() => {
        stopAudio();
        setShowCurtainQ(false);
        if (actIdx === 2) setShowInterval(true);
        else if (actIdx >= lastActIdx) setShowEnd(true);
        else setActIdx(a => a + 1);
    }, [actIdx, lastActIdx, stopAudio]);

    const goToAct = useCallback((idx: number) => {
        stopAudio();
        setShowInterval(false); setShowEnd(false); setShowCurtainQ(false);
        setActIdx(Math.max(0, Math.min(idx, lastActIdx)));
    }, [lastActIdx, stopAudio]);

    const handleTapStage = useCallback(() => {
        if (showCurtainQ || showInterval || showEnd) return;
        if (lineIdx < lines.length - 1) setLineIdx(l => l + 1);
        else setShowCurtainQ(true);
    }, [showCurtainQ, showInterval, showEnd, lineIdx, lines.length]);

    const studentName = userProfile?.displayName || user?.displayName || 'Academic Explorer';

    // ── Current subtitle ──────────────────────────────────────────────────────
    const currentLine = lineIdx >= 0 && lineIdx < lines.length ? lines[lineIdx] : null;
    const subtitleBg = currentLine?.is_concept_reveal
        ? 'linear-gradient(135deg,rgba(26,0,53,.97),rgba(10,0,24,.97))'
        : 'rgba(2,0,8,.88)';
    const subtitleBorder = currentLine?.is_concept_reveal ? '#f0abfc' : `${color}55`;
    const subtitleColor = currentLine?.speaker === 'narrator' ? '#c4b5fd'
        : currentLine?.speaker === 'protagonist' ? '#fde68a'
        : currentLine?.speaker === 'student_voice' ? '#bfdbfe'
        : '#f0abfc';

    return (
        <div
            ref={containerRef}
            style={{ position: 'fixed', inset: 0, background: '#020008', color: '#e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', zIndex: 1000 }}
        >
            <style>{`
                @keyframes cd-fadein { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
                @keyframes cd-slideup { from{opacity:0;transform:translateY(26px)} to{opacity:1;transform:none} }
                @keyframes cd-revpulse { 0%,100%{box-shadow:0 0 10px rgba(240,171,252,.18)} 50%{box-shadow:0 0 30px rgba(240,171,252,.55)} }
                @keyframes cd-blink { 0%,100%{opacity:.3} 50%{opacity:.7} }
                * { box-sizing:border-box; }
                ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(124,58,237,.4);border-radius:4px}
            `}</style>

            {/* ── TOP BAR ──────────────────────────────────────────────── */}
            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px', background: 'rgba(2,0,8,.95)', borderBottom: `1px solid ${color}22`, zIndex: 20 }}>
                <span style={{ fontSize: '1.1rem' }}>🎬</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 900, fontSize: 'clamp(.7rem,2vw,.88rem)', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cinema.cinema_title}</div>
                    <div style={{ fontSize: '.58rem', color: '#6b5fad' }}>{cinema.protagonist?.avatar_emoji} {cinema.protagonist?.name} · Grade {cinema.grade} · {cinema.subject}</div>
                </div>
                {/* Act dots */}
                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                    {acts.map((a, i) => {
                        const c = ACT_COLOR[a.act_type] ?? '#a78bfa';
                        const active = i === actIdx && !showEnd && !showInterval;
                        return (
                            <button key={i} onClick={() => goToAct(i)} title={`Act ${i+1}: ${a.act_title}`}
                                style={{ width: active ? 22 : 7, height: 7, borderRadius: 9999, border: 'none', cursor: 'pointer',
                                    background: active ? c : i < actIdx || showEnd ? `${c}55` : 'rgba(255,255,255,.15)',
                                    transition: 'all .3s ease', padding: 0 }} />
                        );
                    })}
                </div>
                {/* Controls */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => { setAudioOn(a => !a); if (isPlaying) stopAudio(); }}
                        style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(148,163,184,.18)', borderRadius: 7, padding: '4px 8px', color: audioOn ? color : '#6b7280', cursor: 'pointer', fontSize: '.85rem' }}>
                        {audioLoading ? '⏳' : audioOn ? '🔊' : '🔇'}
                    </button>
                    <button onClick={onTryAnother}
                        style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(148,163,184,.18)', borderRadius: 7, padding: '4px 9px', color: '#64748b', cursor: 'pointer', fontSize: '.62rem', fontWeight: 700 }}>
                        ✕
                    </button>
                </div>
            </div>

            {/* ── MAIN AREA ─────────────────────────────────────────────── */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                {showEnd ? (
                /* ── END SCREEN ─────────────────────────────────────────── */
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 40px', maxWidth: 700, margin: '0 auto', width: '100%' }}>

                    {/* Exam Spotlight */}
                    <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(167,139,250,.2)', borderRadius: 18, padding: '16px 18px', marginBottom: 18, animation: 'cd-slideup .5s ease' }}>
                        <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 'clamp(.95rem,3vw,1.25rem)', marginBottom: 12 }}>📝 TN Board Exam Spotlight</h2>
                        <div style={{ color: '#a78bfa', fontSize: '.62rem', fontWeight: 800, letterSpacing: '.12em', marginBottom: 4 }}>MOST ASKED QUESTION</div>
                        <div style={{ background: 'rgba(168,85,247,.09)', border: '1px solid rgba(168,85,247,.35)', borderRadius: 12, padding: '11px 14px', color: '#f1f5f9', marginBottom: 14, lineHeight: 1.6, fontSize: 'clamp(.8rem,2vw,.92rem)' }}>
                            {cinema.exam_spotlight?.most_asked_question}
                        </div>
                        <div style={{ color: '#a78bfa', fontSize: '.62rem', fontWeight: 800, letterSpacing: '.12em', marginBottom: 9 }}>MODEL ANSWER</div>
                        {(cinema.exam_spotlight?.model_answer_structure ?? []).map((step, i) => (
                            <div key={i} style={{ display: 'flex', gap: 9, marginBottom: 8, alignItems: 'flex-start' }}>
                                <span style={{ flexShrink: 0, width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', fontWeight: 900, fontSize: '.68rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i+1}</span>
                                <span style={{ color: '#e2e8f0', lineHeight: 1.5, fontSize: 'clamp(.78rem,2vw,.9rem)', paddingTop: 1 }}>{step}</span>
                            </div>
                        ))}
                        <div style={{ marginTop: 11, display: 'flex', gap: 9, flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{ background: 'rgba(34,197,94,.11)', border: '1px solid rgba(34,197,94,.4)', color: '#86efac', borderRadius: 9999, padding: '5px 13px', fontWeight: 700, fontSize: '.78rem' }}>🎯 {cinema.exam_spotlight?.marks_tip}</span>
                            {cinema.exam_spotlight?.previous_year_hint && <span style={{ color: '#fbbf24', fontStyle: 'italic', fontSize: '.8rem' }}>📅 {cinema.exam_spotlight.previous_year_hint}</span>}
                        </div>
                    </div>

                    {/* Quiz */}
                    <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(148,163,184,.12)', borderRadius: 18, padding: '16px 18px', marginBottom: 18, animation: 'cd-slideup .6s ease' }}>
                        <QuizPanel quiz={cinema.quiz ?? []} onDone={setQuizScore} />
                    </div>

                    {/* Certificate */}
                    {quizScore !== null && (
                        <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(252,211,77,.25)', borderRadius: 18, padding: '22px 18px', textAlign: 'center', animation: 'cd-slideup .5s ease', marginBottom: 18 }}>
                            <div style={{ fontSize: 'clamp(1.8rem,5vw,2.5rem)', marginBottom: 6 }}>🏆</div>
                            <div style={{ fontWeight: 900, fontSize: 'clamp(1rem,3vw,1.3rem)', color: '#fff', marginBottom: 3 }}>Congratulations, {studentName}!</div>
                            <div style={{ color: '#94a3b8', marginBottom: 12, fontSize: 'clamp(.78rem,2vw,.9rem)' }}>Completed <em>{cinema.cinema_title}</em></div>
                            <div style={{ fontSize: 'clamp(1.3rem,4vw,1.8rem)', fontWeight: 900, color: '#fcd34d', marginBottom: 20 }}>{quizScore} / {cinema.quiz?.length ?? 0}</div>
                            <button onClick={onTryAnother} style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none', borderRadius: 14, padding: '12px 28px', fontWeight: 900, fontSize: '.92rem', cursor: 'pointer' }}>
                                🎬 New Cinema Experience
                            </button>
                        </div>
                    )}
                </div>

                ) : showInterval ? (
                /* ── INTERVAL ────────────────────────────────────────────── */
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <div style={{ textAlign: 'center', maxWidth: 500, animation: 'cd-slideup .5s ease' }}>
                        <div style={{ fontSize: 'clamp(1.6rem,5vw,2.8rem)', fontWeight: 900, color: '#fcd34d', marginBottom: 16, letterSpacing: '.08em' }}>🍿 INTERVAL</div>
                        <div style={{ color: '#a78bfa', fontSize: '.63rem', fontWeight: 800, letterSpacing: '.14em', marginBottom: 4 }}>SO FAR…</div>
                        <p style={{ color: '#e2e8f0', lineHeight: 1.65, marginBottom: 18, fontSize: 'clamp(.85rem,2.2vw,1rem)' }}>{cinema.interval_card?.recap}</p>
                        <div style={{ color: '#fbbf24', fontSize: '.63rem', fontWeight: 800, letterSpacing: '.14em', marginBottom: 4 }}>COMING UP…</div>
                        <p style={{ color: '#fde68a', fontStyle: 'italic', lineHeight: 1.65, marginBottom: 26, fontSize: 'clamp(.85rem,2.2vw,1rem)' }}>{cinema.interval_card?.teaser}</p>
                        <button onClick={() => { setShowInterval(false); setActIdx(3); }}
                            style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none', borderRadius: 14, padding: '12px 28px', fontWeight: 800, fontSize: '.92rem', cursor: 'pointer' }}>
                            Continue → Act 4
                        </button>
                    </div>
                </div>

                ) : (
                /* ── THEATRE ─────────────────────────────────────────────── */
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                    {/* ── STAGE: pure animation, fills most of screen ────── */}
                    <div
                        onClick={handleTapStage}
                        style={{ flex: 1, position: 'relative', background: act ? STAGE_BG[act.act_type] : STAGE_BG['hook'], cursor: 'pointer', overflow: 'hidden' }}
                    >
                        {/* Red cinema curtains */}
                        <div style={{ position:'absolute', top:0, left:0, bottom:0, width:'5.5%', background:'linear-gradient(90deg,#3d0a0e,#7f1d1d 65%,transparent)', boxShadow:'inset -10px 0 18px rgba(0,0,0,.6)', pointerEvents:'none', zIndex:8 }}/>
                        <div style={{ position:'absolute', top:0, right:0, bottom:0, width:'5.5%', background:'linear-gradient(270deg,#3d0a0e,#7f1d1d 65%,transparent)', boxShadow:'inset 10px 0 18px rgba(0,0,0,.6)', pointerEvents:'none', zIndex:8 }}/>

                        {/* Corner frames */}
                        {[{top:6,left:6},{top:6,right:6},{bottom:6,left:6},{bottom:6,right:6}].map((pos,i)=>(
                            <div key={i} style={{ position:'absolute', ...pos, width:22, height:22,
                                borderTop: i<2 ? '2px solid #facc15' : undefined,
                                borderBottom: i>=2 ? '2px solid #facc15' : undefined,
                                borderLeft: i%2===0 ? '2px solid #facc15' : undefined,
                                borderRight: i%2===1 ? '2px solid #facc15' : undefined,
                                pointerEvents:'none', zIndex:9 }}/>
                        ))}

                        {/* Animated SVG stage */}
                        <StageScene
                            elements={act?.stage_elements ?? []}
                            actType={act?.act_type ?? 'hook'}
                            tick={tick}
                        />

                        {/* Act label — bottom left */}
                        <div style={{ position:'absolute', bottom:8, left:12, zIndex:10, display:'flex', gap:6, alignItems:'center', pointerEvents:'none' }}>
                            <span style={{ background:`${color}1a`, border:`1px solid ${color}77`, color, borderRadius:9999, padding:'2px 9px', fontSize:'.58rem', fontWeight:800, letterSpacing:'.08em', textTransform:'uppercase' }}>
                                {act ? ACT_LABEL[act.act_type] : ''}
                            </span>
                            <span style={{ color:'rgba(226,232,240,.38)', fontSize:'.58rem' }}>Act {act?.act_number}: {act?.act_title}</span>
                        </div>

                        {/* Audio indicator */}
                        {isPlaying && (
                            <div style={{ position:'absolute', top:10, right:12, zIndex:10, display:'flex', gap:3, alignItems:'flex-end', height:14, pointerEvents:'none' }}>
                                {[1,2,3].map(j=>(
                                    <div key={j} style={{ width:3, background:color, borderRadius:2,
                                        height: `${6 + 6*Math.sin(tick*0.15 + j*0.8)}px`,
                                        transition:'height .1s ease' }}/>
                                ))}
                            </div>
                        )}

                        {/* Tap hint */}
                        <div style={{ position:'absolute', bottom:9, right:12, zIndex:10, color:'rgba(148,163,184,.35)', fontSize:'.55rem', pointerEvents:'none', animation:'cd-blink 2.5s ease-in-out infinite' }}>
                            tap →
                        </div>
                    </div>

                    {/* ── SUBTITLE BAR ───────────────────────────────────── */}
                    <div style={{
                        flexShrink: 0,
                        minHeight: 72,
                        maxHeight: 120,
                        background: subtitleBg,
                        borderTop: `2px solid ${subtitleBorder}`,
                        padding: '10px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        animation: currentLine ? 'cd-fadein .35s ease' : undefined,
                        ...(currentLine?.is_concept_reveal ? { animation: 'cd-fadein .35s ease, cd-revpulse 3s ease-in-out infinite' } : {}),
                    }}>
                        {!currentLine && lineIdx < 0 && (
                            <div style={{ textAlign:'center', color:'rgba(148,163,184,.4)', fontSize:'.75rem', fontStyle:'italic' }}>
                                {act?.setting?.place} · {act?.setting?.time_of_day}
                            </div>
                        )}
                        {currentLine && (
                            <>
                                <div style={{ display:'flex', gap:6, alignItems:'center', marginBottom:4 }}>
                                    {currentLine.is_concept_reveal && <span style={{ color:'#f0abfc', fontSize:'.6rem', fontWeight:900, letterSpacing:'.15em' }}>✦ CONCEPT REVEAL ✦</span>}
                                    {!currentLine.is_concept_reveal && (
                                        <span style={{ color:subtitleColor, fontSize:'.6rem', fontWeight:800, opacity:.7 }}>
                                            {currentLine.speaker === 'narrator' ? '🎙 Narrator'
                                                : currentLine.speaker === 'protagonist' ? `${cinema.protagonist?.avatar_emoji} ${cinema.protagonist?.name}`
                                                : currentLine.speaker === 'student_voice' ? '🎓 Student'
                                                : '💡 Concept'}
                                        </span>
                                    )}
                                </div>
                                <p style={{ color: subtitleColor, fontSize:'clamp(.82rem,2.2vw,1rem)', lineHeight:1.55, margin:0, fontStyle: currentLine.speaker==='narrator' ? 'italic' : 'normal', fontWeight: currentLine.is_concept_reveal ? 700 : 500 }}>
                                    {currentLine.text}
                                </p>
                            </>
                        )}
                    </div>

                    {/* ── CONCEPT BOARD STRIP ────────────────────────────── */}
                    {act?.concept_board && (
                        <div style={{ flexShrink:0, background:'rgba(8,0,18,.98)', borderTop:`1.5px solid ${color}33`, padding:'6px 14px', display:'flex', gap:12, alignItems:'center' }}>
                            <div style={{ flex:1, minWidth:0 }}>
                                <span style={{ color:color, fontWeight:900, fontSize:'clamp(.65rem,1.7vw,.78rem)', marginRight:8 }}>{act.concept_board.title}</span>
                                {act.concept_board.formula && (
                                    <span style={{ fontFamily:'"SF Mono",ui-monospace,monospace', color:'#f0abfc', fontSize:'clamp(.7rem,1.8vw,.85rem)', background:'rgba(240,171,252,.07)', borderRadius:6, padding:'2px 8px', marginRight:8 }}>
                                        {act.concept_board.formula}
                                    </span>
                                )}
                                {act.concept_board.tamil_analogy && (
                                    <span style={{ color:'#fbbf24', fontSize:'clamp(.6rem,1.5vw,.72rem)', fontStyle:'italic' }}>🌾 {act.concept_board.tamil_analogy}</span>
                                )}
                            </div>
                            {act.concept_board.key_points?.[0] && (
                                <div style={{ flexShrink:0, color:'#94a3b8', fontSize:'clamp(.58rem,1.4vw,.68rem)', maxWidth:140, lineHeight:1.4 }}>
                                    <span style={{ color:color }}>▸ </span>{act.concept_board.key_points[0]}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── CURTAIN QUESTION overlay ───────────────────────── */}
                    {showCurtainQ && act?.curtain_question && (
                        <div style={{ position:'absolute', bottom:0, left:0, right:0, zIndex:30, background:'linear-gradient(135deg,rgba(13,0,32,.98),rgba(2,0,8,.98))', borderTop:'1px solid rgba(167,139,250,.3)', padding:'16px 18px', animation:'cd-fadein .4s ease' }}>
                            <p style={{ color:'#fff', fontSize:'clamp(.85rem,2.2vw,1.05rem)', fontWeight:700, lineHeight:1.55, margin:'0 0 4px', textAlign:'center' }}>{act.curtain_question}</p>
                            <p style={{ color:'#a78bfa', fontSize:'.75rem', fontStyle:'italic', margin:'0 0 12px', textAlign:'center' }}>💭 Think about it…</p>
                            <button onClick={handleContinue}
                                style={{ display:'block', margin:'0 auto', background:'linear-gradient(135deg,#4f46e5,#7c3aed)', color:'#fff', border:'none', borderRadius:12, padding:'10px 28px', fontWeight:800, fontSize:'.88rem', cursor:'pointer' }}>
                                {actIdx===2 ? '🍿 Interval →' : actIdx>=lastActIdx ? '📝 Exam Spotlight →' : 'Next Act →'}
                            </button>
                        </div>
                    )}
                </div>
                )}
            </div>
        </div>
    );
};

export default CinemaDisplay;
