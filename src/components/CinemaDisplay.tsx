/**
 * CinemaDisplay.tsx — FeelEd மாயக் கற்றல் திரையரங்கம் v5
 *
 * Architecture:
 * - ALL act audios pre-generated on mount (parallel) → zero buffering mid-play
 * - Theatre is PERMANENT — always visible at top, quiz/end content scrolls below
 * - Stage: concept-keyword SVG animations synced to current act
 * - Control panel: autoplay, prev/next act, volume/mute, fullscreen, minimize
 * - No curtain questions — simple, luxury cinematic flow
 * - Acts auto-advance when audio ends (if autoplay on)
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CinemaStory, CinemaAct, CinemaActType } from '../types';
import { useAuth } from '../context/AuthContext';

interface Props {
    cinema: CinemaStory;
    language: string;
    onTryAnother: () => void;
}

// ── Audio helpers ─────────────────────────────────────────────────────────────
function b64ToBytes(b: string): Uint8Array {
    const s = atob(b); const out = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
    return out;
}
function pcmToAudioBuffer(bytes: Uint8Array, ctx: AudioContext): AudioBuffer {
    const i16 = new Int16Array(bytes.buffer);
    const buf = ctx.createBuffer(1, i16.length, 24000);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < i16.length; i++) ch[i] = i16[i] / 32768;
    return buf;
}

// ── Act colours ───────────────────────────────────────────────────────────────
const ACOLOR: Record<CinemaActType, string> = {
    hook: '#f59e0b', rising_action: '#3b82f6', climax: '#f43f5e',
    resolution: '#22c55e', exam_bridge: '#a855f7',
};
const ALABEL: Record<CinemaActType, string> = {
    hook: 'Hook', rising_action: 'Rising Action', climax: 'Climax',
    resolution: 'Resolution', exam_bridge: 'Exam Bridge',
};
const ABGGRAD: Record<CinemaActType, string> = {
    hook:          'radial-gradient(ellipse at 40% 35%,#1c0438 0%,#030009 75%)',
    rising_action: 'radial-gradient(ellipse at 55% 25%,#010c2e 0%,#030009 75%)',
    climax:        'radial-gradient(ellipse at 50% 30%,#200005 0%,#030009 75%)',
    resolution:    'radial-gradient(ellipse at 45% 35%,#001b09 0%,#030009 75%)',
    exam_bridge:   'radial-gradient(ellipse at 50% 30%,#0c0020 0%,#030009 75%)',
};

// ── Concept-specific SVG Stage ────────────────────────────────────────────────
function StageScene({ act, tick }: { act: CinemaAct; tick: number }) {
    const color = ACOLOR[act.act_type] ?? '#a78bfa';
    const els = act.stage_elements ?? [];
    const allText = els.map(e => `${e.name} ${e.description ?? ''}`).join(' ').toLowerCase();

    const hasWave    = /wave|light|sound|அலை|optic|electro/.test(allText);
    const hasForce   = /force|push|pull|விசை|arrow|motion|newton|inertia/.test(allText);
    const hasFormula = els.some(e => e.element_type === 'formula') || /formula|equation|f=|e=mc|v=u/.test(allText);
    const hasCell    = /cell|கலம்|nucleus|chloro|mitochond|biology|plant|leaf/.test(allText);
    const hasOrbit   = /orbit|planet|electron|atom|circular|solar|கிரக/.test(allText);
    const hasChem    = /molecule|bond|reaction|compound|அணு|chemical|element/.test(allText) && !hasOrbit;
    const hasMagnet  = /magnet|field|காந்த|flux|electric field|coil/.test(allText);
    const hasGraph   = /graph|chart|growth|velocity|rate|slope/.test(allText) && !hasWave;
    const hasBoat    = /boat|water|river|swim|row|நீர்|paddle/.test(allText);
    const hasRocket  = /rocket|launch|propel|thrust|missile/.test(allText);

    // Characters/objects for emoji overlay
    const chars = els.filter(e =>
        ['character','object','prop'].includes(e.element_type) || !['formula','diagram','label','effect'].includes(e.element_type)
    ).slice(0, 3);

    const charPositions = [{ x: 85, y: 155 }, { x: 315, y: 148 }, { x: 200, y: 165 }];

    function getEmoji(name: string): string {
        const n = name.toLowerCase();
        if (n.includes('newton') || n.includes('நியூட்டன்')) return '🧑‍🔬';
        if (n.includes('einstein')) return '👨‍🔬';
        if (n.includes('raman') || n.includes('ராமன்')) return '🔬';
        if (n.includes('ramanujan') || n.includes('ராமானுஜன்')) return '📐';
        if (n.includes('curie')) return '⚗️';
        if (n.includes('mendel')) return '🌱';
        if (n.includes('darwin')) return '🦎';
        if (n.includes('turing')) return '💻';
        if (n.includes('student') || n.includes('மாணவ')) return '🎓';
        if (n.includes('teacher') || n.includes('ஆசிரிய')) return '👩‍🏫';
        if (n.includes('apple') || n.includes('ஆப்பிள்')) return '🍎';
        if (n.includes('sun') || n.includes('சூரிய')) return '☀️';
        if (n.includes('moon') || n.includes('நிலா')) return '🌙';
        if (n.includes('earth') || n.includes('பூமி')) return '🌍';
        if (n.includes('bulb') || n.includes('lamp')) return '💡';
        if (n.includes('flask') || n.includes('chemical')) return '⚗️';
        if (n.includes('telescope')) return '🔭';
        if (n.includes('book') || n.includes('நூல்')) return '📖';
        if (n.includes('stone') || n.includes('rock') || n.includes('weight')) return '🪨';
        if (n.includes('water') || n.includes('நீர்') || n.includes('river')) return '💧';
        if (n.includes('car') || n.includes('வண்டி') || n.includes('bus')) return '🚌';
        if (n.includes('rocket')) return '🚀';
        if ((el => el.element_type === 'character')(els.find(e => e.name === name) ?? { element_type: '' } as any)) return '🧑';
        return '🔷';
    }

    return (
        <svg viewBox="0 0 400 280" width="100%" height="100%"
            style={{ display: 'block', position: 'absolute', inset: 0 }}
            xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="sg" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.14"/>
                    <stop offset="100%" stopColor={color} stopOpacity="0"/>
                </radialGradient>
                <filter id="b3"><feGaussianBlur stdDeviation="3"/></filter>
                <filter id="b6"><feGaussianBlur stdDeviation="6"/></filter>
                <marker id="ah" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                    <polygon points="0 0,8 3,0 6" fill={color}/>
                </marker>
            </defs>

            {/* Ambient glow */}
            <ellipse cx="200" cy="140" rx="175" ry="108"
                fill="url(#sg)" opacity={0.5 + 0.12 * Math.sin(tick * 0.04)}/>

            {/* Stars */}
            {[[28,22],[375,38],[12,205],[388,185],[200,12],[95,50],[315,58],[50,148],[342,138]].map(([x,y],i) => (
                <circle key={i} cx={x} cy={y} r={0.8 + (i % 3) * 0.5}
                    fill="white" opacity={0.18 + 0.32 * Math.sin(tick * 0.055 + i * 1.3)}/>
            ))}

            {/* ── CONCEPT ANIMATIONS ── */}

            {hasWave && (() => {
                const pts = Array.from({ length: 22 }, (_, j) => {
                    return `${30 + j * 16},${128 + Math.sin(j * 0.55 + tick * 0.1) * 32}`;
                }).join(' ');
                const pts2 = Array.from({ length: 22 }, (_, j) => {
                    return `${30 + j * 16},${168 + Math.sin(j * 0.55 + tick * 0.1 + Math.PI) * 22}`;
                }).join(' ');
                return (<>
                    <polyline points={pts} fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round"/>
                    <polyline points={pts} fill="none" stroke="#34d399" strokeWidth="7" filter="url(#b3)" opacity="0.18"/>
                    <polyline points={pts2} fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" opacity="0.55" strokeDasharray="4 3"/>
                    {/* wavelength marker */}
                    <line x1="30" y1="200" x2="78" y2="200" stroke="#6ee7b7" strokeWidth="1" strokeDasharray="2 2"/>
                    <text x="54" y="212" fill="#6ee7b7" fontSize="9" textAnchor="middle" opacity="0.7">λ</text>
                </>);
            })()}

            {hasForce && !hasBoat && !hasRocket && (() => {
                const len = 72 + 18 * Math.sin(tick * 0.06);
                const movX = 200 + 20 * Math.sin(tick * 0.04);
                return (<>
                    {/* Object being acted on */}
                    <rect x={movX - 22} y="120" width="44" height="30" rx="6"
                        fill="rgba(251,191,36,0.12)" stroke="#fbbf24" strokeWidth="1.5"/>
                    {/* Force arrow */}
                    <line x1={movX - len / 2 - 20} y1="135" x2={movX - 24} y2="135"
                        stroke={color} strokeWidth="3.5" markerEnd="url(#ah)"/>
                    <line x1={movX - len / 2 - 20} y1="135" x2={movX - 24} y2="135"
                        stroke={color} strokeWidth="8" filter="url(#b3)" opacity="0.22"/>
                    <text x={movX - len / 2 - 10} y="126" fill={color} fontSize="10" textAnchor="middle" opacity="0.8">F</text>
                    {/* Acceleration indicator */}
                    <line x1={movX + 26} y1="135" x2={movX + 65} y2="135"
                        stroke="#60a5fa" strokeWidth="2" markerEnd="url(#ah)" strokeDasharray="4 3" opacity="0.7"/>
                    <text x={movX + 46} y="126" fill="#60a5fa" fontSize="9" textAnchor="middle" opacity="0.7">a</text>
                </>);
            })()}

            {hasFormula && (() => {
                const formulaEl = els.find(e => e.element_type === 'formula');
                const formulaText = formulaEl?.name ?? 'F = ma';
                const ga = 0.55 + 0.3 * Math.sin(tick * 0.07);
                return (<>
                    <rect x="98" y="96" width="204" height="58" rx="14"
                        fill="rgba(240,171,252,0.07)" stroke="#f0abfc" strokeWidth="1.8" strokeOpacity={ga}/>
                    <rect x="98" y="96" width="204" height="58" rx="14"
                        fill="none" stroke="#f0abfc" strokeWidth="5" filter="url(#b6)" strokeOpacity={ga * 0.3}/>
                    <text x="200" y="131" fill="#f0abfc" fontSize="18" textAnchor="middle"
                        fontFamily="ui-monospace,monospace" fontWeight="bold" opacity={ga}>
                        {formulaText.length > 12 ? formulaText.slice(0, 12) : formulaText}
                    </text>
                </>);
            })()}

            {hasCell && (() => {
                const b = 1 + 0.04 * Math.sin(tick * 0.045);
                return (
                    <g transform={`translate(200,135) scale(${b})`}>
                        <ellipse cx="0" cy="0" rx="82" ry="60"
                            fill="rgba(52,211,153,0.06)" stroke="#34d399" strokeWidth="1.8"/>
                        <ellipse cx="10" cy="-5" rx="28" ry="20"
                            fill="rgba(134,239,172,0.12)" stroke="#86efac" strokeWidth="1.3"/>
                        {[[-35, 18], [30, 22], [-20, -28], [38, -15]].map(([ox, oy], i) => (
                            <ellipse key={i} cx={ox} cy={oy} rx={6} ry={4}
                                fill="rgba(52,211,153,0.45)"
                                opacity={0.5 + 0.3 * Math.sin(tick * 0.05 + i)}/>
                        ))}
                        {/* chloroplasts */}
                        <ellipse cx="-50" cy="10" rx="8" ry="5" fill="rgba(34,197,94,0.5)"
                            opacity={0.6 + 0.2 * Math.sin(tick * 0.06)}/>
                        <ellipse cx="45" cy="-20" rx="7" ry="4" fill="rgba(34,197,94,0.5)"
                            opacity={0.5 + 0.2 * Math.sin(tick * 0.08)}/>
                    </g>
                );
            })()}

            {hasOrbit && !hasCell && (() => {
                const a1 = tick * 0.045, a2 = tick * 0.027;
                return (<>
                    <circle cx="200" cy="135" r={13 + 2 * Math.sin(tick * 0.05)}
                        fill={color} opacity="0.85" filter="url(#b3)"/>
                    <circle cx="200" cy="135" r="10" fill={color} opacity="0.95"/>
                    <ellipse cx="200" cy="135" rx="76" ry="35" fill="none"
                        stroke={color} strokeWidth="0.9" strokeOpacity="0.32" strokeDasharray="5 4"/>
                    <ellipse cx="200" cy="135" rx="50" ry="28" fill="none"
                        stroke="#60a5fa" strokeWidth="0.9" strokeOpacity="0.32" strokeDasharray="5 4"
                        transform="rotate(58,200,135)"/>
                    <circle cx={200 + 76 * Math.cos(a1)} cy={135 + 35 * Math.sin(a1)} r="7"
                        fill="white" opacity="0.92"/>
                    <circle cx={200 + 50 * Math.cos(-a2 + 2)} cy={135 + 28 * Math.sin(-a2 + 2)} r="5"
                        fill="#93c5fd" opacity="0.88"
                        transform="rotate(58,200,135)"/>
                </>);
            })()}

            {hasChem && (() => {
                const w = Math.sin(tick * 0.04) * 4;
                const bonds = [[160, 130, 210, 130], [210, 130, 248, 108], [210, 130, 248, 152], [160, 130, 122, 108]];
                const atoms: [number, number, string, number][] = [[160, 130, '#f43f5e', 13], [210, 130, '#60a5fa', 13], [248, 108, '#34d399', 10], [248, 152, '#fbbf24', 10], [122, 108, '#a78bfa', 10]];
                return (<>
                    {bonds.map(([x1, y1, x2, y2], i) => (
                        <line key={i} x1={x1} y1={y1 + w * 0.5} x2={x2} y2={y2 + w}
                            stroke="#94a3b8" strokeWidth="2" opacity="0.6"/>
                    ))}
                    {atoms.map(([ax, ay, ac, r], i) => (
                        <circle key={i} cx={ax} cy={Number(ay) + w * (i % 2 === 0 ? 0.5 : 1)}
                            r={r} fill={String(ac)} opacity="0.88" filter="url(#b3)"/>
                    ))}
                </>);
            })()}

            {hasMagnet && (() => {
                const t = tick * 0.04;
                return (<>
                    <rect x="170" y="126" width="60" height="22" rx="5"
                        fill="none" stroke="#94a3b8" strokeWidth="1.5"/>
                    <rect x="170" y="126" width="30" height="22" rx="4" fill="rgba(239,68,68,0.5)"/>
                    <rect x="200" y="126" width="30" height="22" rx="4" fill="rgba(59,130,246,0.5)"/>
                    {[-1, 0, 1].map(k => {
                        const oy = k * 28;
                        const pts = Array.from({ length: 18 }, (_, j) => {
                            const fx = 55 + j * 16;
                            const fy = 137 + oy + Math.sin((fx - 200) * 0.026) * 18 * Math.sign(k || 1) * Math.sign(fx - 200) + 3 * Math.sin(t + k);
                            return `${fx},${fy}`;
                        }).join(' ');
                        return <polyline key={k} points={pts} fill="none"
                            stroke={color} strokeWidth="1.2" strokeOpacity="0.38" strokeDasharray="3 3"/>;
                    })}
                    <text x="185" y="141" fill="#fca5a5" fontSize="8" textAnchor="middle" fontWeight="bold">N</text>
                    <text x="215" y="141" fill="#93c5fd" fontSize="8" textAnchor="middle" fontWeight="bold">S</text>
                </>);
            })()}

            {hasBoat && (() => {
                const bobY = Math.sin(tick * 0.05) * 6;
                const waveY = (x: number) => 190 + Math.sin(x * 0.05 + tick * 0.08) * 8;
                const wPts = Array.from({ length: 20 }, (_, j) => `${20 + j * 19},${waveY(20 + j * 19)}`).join(' ');
                return (<>
                    <polyline points={wPts} fill="none" stroke="#60a5fa" strokeWidth="2" opacity="0.5"/>
                    {/* boat hull */}
                    <path d={`M140,${155 + bobY} L260,${155 + bobY} L250,${175 + bobY} L150,${175 + bobY} Z`}
                        fill="rgba(161,82,45,0.7)" stroke="#92400e" strokeWidth="1.5"/>
                    {/* oar */}
                    <line x1={148} y1={158 + bobY} x2={115} y2={185 + bobY}
                        stroke="#92400e" strokeWidth="3" strokeLinecap="round"/>
                    <ellipse cx="112" cy={188 + bobY} rx="10" ry="4"
                        fill="rgba(96,165,250,0.6)" stroke="#60a5fa" strokeWidth="1"/>
                    {/* reaction arrows */}
                    <line x1="112" y1={195 + bobY} x2="85" y2={210 + bobY}
                        stroke="#60a5fa" strokeWidth="2" markerEnd="url(#ah)" opacity="0.7"/>
                    <line x1="155" y1={178 + bobY} x2="185" y2={168 + bobY}
                        stroke={color} strokeWidth="2" markerEnd="url(#ah)" opacity="0.7"/>
                </>);
            })()}

            {hasRocket && (() => {
                const ry = -tick * 0.8 % 280;
                return (<>
                    {/* rocket body */}
                    <g transform={`translate(200,${200 + ry})`}>
                        <ellipse cx="0" cy="-20" rx="12" ry="20" fill="rgba(148,163,184,0.8)" stroke="#94a3b8" strokeWidth="1"/>
                        <polygon points="-12,0 12,0 0,-38" fill={color} opacity="0.9"/>
                        {/* exhaust */}
                        {[0, 1, 2].map(i => (
                            <ellipse key={i} cx={(i - 1) * 6} cy={8 + i * 4}
                                rx={3} ry={6 + 3 * Math.sin(tick * 0.15 + i)}
                                fill={i === 1 ? '#fbbf24' : '#f87171'} opacity={0.6 + 0.3 * Math.sin(tick * 0.2 + i)}/>
                        ))}
                    </g>
                </>);
            })()}

            {/* Default elegant particle field */}
            {!hasWave && !hasForce && !hasFormula && !hasCell && !hasOrbit && !hasChem && !hasMagnet && !hasBoat && !hasRocket && (
                <>
                    {[0, 60, 120, 180, 240, 300].map((deg, i) => {
                        const r = deg * Math.PI / 180;
                        const radius = 58 + 22 * Math.sin(tick * 0.04 + i * 0.7);
                        return (
                            <g key={i} transform={`translate(${200 + radius * Math.cos(r)},${132 + radius * 0.55 * Math.sin(r)})`}>
                                <circle r={4 + 2 * Math.sin(tick * 0.07 + i)} fill={color}
                                    opacity={0.45 + 0.3 * Math.sin(tick * 0.06 + i * 0.9)}/>
                            </g>
                        );
                    })}
                    <circle cx="200" cy="132" r={14 + 4 * Math.sin(tick * 0.05)} fill={color} opacity="0.15" filter="url(#b6)"/>
                    <circle cx="200" cy="132" r="9" fill={color} opacity="0.65"/>
                </>
            )}

            {/* Character/object emojis */}
            {chars.map((el, i) => {
                const pos = charPositions[i] ?? { x: 200, y: 160 };
                const floatY = Math.sin(tick * 0.035 + i * 1.2) * 7;
                const emoji = getEmoji(el.name);
                const sz = el.element_type === 'character' || ['teacher','student','newton','einstein','raman','ramanujan','mendel','curie','darwin','turing'].some(k => el.name.toLowerCase().includes(k)) ? 44 : 36;
                return (
                    <g key={i}>
                        {el.highlight && (
                            <circle cx={pos.x} cy={pos.y + floatY} r={sz * 0.78}
                                fill="none" stroke={color} strokeWidth="1.5"
                                strokeOpacity={0.45 + 0.28 * Math.sin(tick * 0.05)} filter="url(#b3)"/>
                        )}
                        <text x={pos.x} y={pos.y + floatY + sz * 0.38} fontSize={sz}
                            textAnchor="middle" style={{ userSelect: 'none' }}>{emoji}</text>
                    </g>
                );
            })}

            {/* Climax spotlight */}
            {act.act_type === 'climax' && (
                <ellipse cx={200 + 28 * Math.cos(tick * 0.03)} cy="278"
                    rx="55" ry="18" fill={color}
                    opacity={0.06 + 0.04 * Math.sin(tick * 0.05)} filter="url(#b6)"/>
            )}
        </svg>
    );
}

// ── Quiz ──────────────────────────────────────────────────────────────────────
function QuizPanel({ quiz, studentName }: { quiz: CinemaStory['quiz']; studentName: string }) {
    const [ans, setAns]   = useState<Record<number, string>>({});
    const [sub, setSub]   = useState(false);
    const score = sub ? quiz.filter((q, i) => ans[i] === q.answer).length : 0;
    const ok = Object.keys(ans).length >= quiz.length;
    return (
        <div style={{ padding: '0 0 32px' }}>
            <h3 style={{ color: '#fff', fontWeight: 900, fontSize: 'clamp(.95rem,3vw,1.2rem)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                🎯 Quick Quiz
            </h3>
            {quiz.map((q, i) => (
                <div key={i} style={{ marginBottom: 16, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(148,163,184,.12)', borderRadius: 13, padding: '13px 15px' }}>
                    <p style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: 10, lineHeight: 1.5, fontSize: 'clamp(.8rem,2vw,.92rem)' }}>{i + 1}. {q.question}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                        {q.options.map((opt, j) => {
                            const chosen = ans[i] === opt;
                            const correct = sub && opt === q.answer;
                            const wrong = sub && chosen && opt !== q.answer;
                            return (
                                <button key={j} disabled={sub} onClick={() => setAns(a => ({ ...a, [i]: opt }))}
                                    style={{ padding: '8px 10px', borderRadius: 9, fontSize: 'clamp(.7rem,1.8vw,.83rem)', fontWeight: 600, textAlign: 'left', cursor: sub ? 'default' : 'pointer', lineHeight: 1.4,
                                        background: correct ? 'rgba(34,197,94,.15)' : wrong ? 'rgba(239,68,68,.15)' : chosen ? 'rgba(79,70,229,.18)' : 'rgba(255,255,255,.04)',
                                        border: correct ? '1.5px solid #22c55e' : wrong ? '1.5px solid #ef4444' : chosen ? '1.5px solid #6366f1' : '1px solid rgba(148,163,184,.17)',
                                        color: correct ? '#86efac' : wrong ? '#fca5a5' : chosen ? '#c7d2fe' : '#cbd5e1' }}>
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                    {sub && <div style={{ marginTop: 8, fontSize: '.76rem', color: '#94a3b8', lineHeight: 1.5 }}>💡 {q.explanation}</div>}
                </div>
            ))}
            {!sub
                ? <button disabled={!ok} onClick={() => setSub(true)}
                    style={{ width: '100%', padding: 12, background: ok ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : '#1e1b4b', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: '.92rem', cursor: ok ? 'pointer' : 'not-allowed', opacity: ok ? 1 : 0.5 }}>
                    Submit Answers
                  </button>
                : <div style={{ textAlign: 'center', padding: 12, background: 'rgba(79,70,229,.12)', border: '1px solid #4f46e5', borderRadius: 12 }}>
                    <div style={{ color: '#fcd34d', fontWeight: 900, fontSize: 'clamp(1.1rem,3vw,1.4rem)', marginBottom: 4 }}>
                        {score}/{quiz.length} {score === quiz.length ? '🏆' : score >= quiz.length / 2 ? '✅' : '📖'}
                    </div>
                    <div style={{ color: '#a78bfa', fontSize: '.82rem' }}>Well done, {studentName}!</div>
                  </div>
            }
        </div>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────
const CinemaDisplay: React.FC<Props> = ({ cinema, language, onTryAnother }) => {
    const { user, userProfile } = useAuth();
    const containerRef = useRef<HTMLDivElement>(null);
    const bottomRef    = useRef<HTMLDivElement>(null);
    const acts = cinema.acts ?? [];
    const lastIdx = Math.max(0, acts.length - 1);

    // ── UI state ──────────────────────────────────────────────────────────────
    const [actIdx,       setActIdx]       = useState(0);
    const [showEnd,      setShowEnd]      = useState(false);
    const [tick,         setTick]         = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [autoPlay,     setAutoPlay]     = useState(false);
    const [showTranscript, setShowTranscript] = useState(false);

    // ── Audio state ───────────────────────────────────────────────────────────
    const [volume,       setVolume]       = useState(1);
    const [muted,        setMuted]        = useState(false);
    const [isPlaying,    setIsPlaying]    = useState(false);
    const [loadingActs,  setLoadingActs]  = useState<Set<number>>(new Set());
    // All acts are visually ready immediately — audio readiness tracked separately
    const [audioReadyActs, setAudioReadyActs] = useState<Set<number>>(new Set());

    const audioCacheRef = useRef<Record<number, string>>({}); // actIdx → base64
    const audioCtxRef   = useRef<AudioContext | null>(null);
    const audioSrcRef   = useRef<AudioBufferSourceNode | null>(null);
    const gainRef       = useRef<GainNode | null>(null);

    const act   = acts[actIdx];
    const color = act ? (ACOLOR[act.act_type] ?? '#a78bfa') : '#a78bfa';

    // ── Subtitle state ────────────────────────────────────────────────────────
    const [subLineIdx, setSubLineIdx] = useState(0);
    const lines = act?.screenplay ?? [];
    const currentSub = lines[subLineIdx];

    // ── Animation tick ────────────────────────────────────────────────────────
    useEffect(() => {
        const id = setInterval(() => setTick(t => t + 1), 50);
        return () => clearInterval(id);
    }, []);

    // ── Fullscreen ────────────────────────────────────────────────────────────
    const enterFS = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;
        const fn = el.requestFullscreen ?? (el as any).webkitRequestFullscreen;
        fn?.call(el).catch(() => {});
    }, []);
    const exitFS = useCallback(() => {
        (document.exitFullscreen ?? (document as any).webkitExitFullscreen)?.call(document).catch(() => {});
    }, []);

    useEffect(() => {
        setTimeout(enterFS, 150);
        const onChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onChange);
        document.addEventListener('webkitfullscreenchange', onChange);
        return () => {
            document.removeEventListener('fullscreenchange', onChange);
            document.removeEventListener('webkitfullscreenchange', onChange);
            if (document.fullscreenElement) exitFS();
        };
    }, [enterFS, exitFS]);

    // ── Audio: generate all acts in parallel on mount ─────────────────────────
    const getAudioCtx = useCallback(() => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            gainRef.current = audioCtxRef.current.createGain();
            gainRef.current.connect(audioCtxRef.current.destination);
        }
        return audioCtxRef.current;
    }, []);

    const generateActAudio = useCallback(async (idx: number) => {
        if (audioCacheRef.current[idx]) return;
        const a = acts[idx];
        if (!a) return;

        setLoadingActs(s => new Set(s).add(idx));

        // Use narrator + concept lines only for speed (key pedagogical lines)
        const text = a.screenplay
            .filter(l => l.speaker === 'narrator' || l.is_concept_reveal || l.speaker === 'concept_voice')
            .map(l => l.text).join('. ').slice(0, 450);

        const voice = language === 'Tamil'
            ? (a.act_type === 'climax' ? 'Fenrir' : 'Zephyr')
            : (a.act_type === 'climax' ? 'Charon' : 'Kore');
        const tone = a.act_type === 'climax' ? 'dramatic and intense'
            : a.act_type === 'hook' ? 'curious and engaging'
            : a.act_type === 'resolution' ? 'warm and satisfied'
            : 'clear and educational';

        try {
            const res = await fetch('/api/audio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullStoryText: text, language, narratorVoice: voice, emotionTone: tone }),
            });
            if (!res.ok) return;
            const { base64Audio } = await res.json();
            if (base64Audio) {
                audioCacheRef.current[idx] = base64Audio;
                setAudioReadyActs(s => new Set(s).add(idx));
            }
        } catch (_) {}
        finally {
            setLoadingActs(s => { const n = new Set(s); n.delete(idx); return n; });
        }
    }, [acts, language]);

    // Generate ALL act audios in parallel on mount
    useEffect(() => {
        acts.forEach((_, idx) => generateActAudio(idx));
    }, []); // eslint-disable-line

    // ── Audio: play/stop ──────────────────────────────────────────────────────
    const stopAudio = useCallback(() => {
        if (audioSrcRef.current) {
            try { audioSrcRef.current.stop(); } catch (_) {}
            audioSrcRef.current = null;
        }
        setIsPlaying(false);
    }, []);

    const playActAudio = useCallback((idx: number, onEnded?: () => void) => {
        const b64 = audioCacheRef.current[idx];
        if (!b64 || muted) return;
        stopAudio();
        try {
            const ctx = getAudioCtx();
            if (ctx.state === 'suspended') ctx.resume();
            const buf = pcmToAudioBuffer(b64ToBytes(b64), ctx);
            const src = ctx.createBufferSource();
            src.buffer = buf;
            if (gainRef.current) {
                gainRef.current.gain.value = volume;
                src.connect(gainRef.current);
            } else {
                src.connect(ctx.destination);
            }
            src.onended = () => { setIsPlaying(false); onEnded?.(); };
            src.start();
            audioSrcRef.current = src;
            setIsPlaying(true);
        } catch (_) {}
    }, [muted, volume, stopAudio, getAudioCtx]);

    // Apply volume changes live
    useEffect(() => {
        if (gainRef.current) gainRef.current.gain.value = muted ? 0 : volume;
    }, [volume, muted]);

    // ── Play act: reset subtitles, play audio ─────────────────────────────────
    const playAct = useCallback((idx: number) => {
        setActIdx(idx);
        setSubLineIdx(0);
        stopAudio();

        const doPlay = (onEnded?: () => void) => {
            if (audioCacheRef.current[idx]) {
                playActAudio(idx, onEnded);
            } else {
                // Wait for audio to be ready
                const poll = setInterval(() => {
                    if (audioCacheRef.current[idx]) {
                        clearInterval(poll);
                        playActAudio(idx, onEnded);
                    }
                }, 300);
                setTimeout(() => clearInterval(poll), 30000);
            }
        };

        if (autoPlay && idx < acts.length) {
            doPlay(() => {
                // Auto-advance to next act when audio ends
                if (idx < lastIdx) {
                    setTimeout(() => playAct(idx + 1), 800);
                } else {
                    setShowEnd(true);
                }
            });
        } else {
            doPlay();
        }
    }, [autoPlay, acts.length, lastIdx, stopAudio, playActAudio]);

    // Subtitle auto-advance synced to act change
    useEffect(() => {
        setSubLineIdx(0);
        if (!lines.length) return;
        const interval = Math.max(2500, (lines.length > 0 ? 12000 / lines.length : 3000));
        const id = setInterval(() => {
            setSubLineIdx(i => (i < lines.length - 1 ? i + 1 : i));
        }, interval);
        return () => clearInterval(id);
    }, [actIdx, lines.length]);

    // When autoPlay toggled on, start playing current act
    useEffect(() => {
        if (autoPlay && !isPlaying) {
            const onEnded = () => {
                if (actIdx < lastIdx) setTimeout(() => playAct(actIdx + 1), 800);
                else setShowEnd(true);
            };
            if (audioCacheRef.current[actIdx]) playActAudio(actIdx, onEnded);
        }
        if (!autoPlay) stopAudio();
    }, [autoPlay]); // eslint-disable-line

    const studentName = userProfile?.displayName || user?.displayName || 'Explorer';
    const subColor = currentSub?.speaker === 'narrator' ? '#c4b5fd'
        : currentSub?.speaker === 'protagonist' ? '#fde68a'
        : currentSub?.speaker === 'student_voice' ? '#bfdbfe' : '#f0abfc';

    const allReady = audioReadyActs.size >= acts.length;
    const currentReady = true; // Theatre never blocks on audio
    const currentAudioReady = audioReadyActs.has(actIdx);

    return (
        <div ref={containerRef}
            style={{ position: 'fixed', inset: 0, background: '#030009', color: '#e2e8f0',
                display: 'flex', flexDirection: 'column', zIndex: 1000, overflow: 'hidden' }}>
            <style>{`
                @keyframes cd-fadein  { from{opacity:0;transform:translateY(7px)} to{opacity:1;transform:none} }
                @keyframes cd-slideup { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:none} }
                @keyframes cd-revpulse{ 0%,100%{box-shadow:0 0 10px rgba(240,171,252,.16)} 50%{box-shadow:0 0 26px rgba(240,171,252,.5)} }
                @keyframes cd-blink   { 0%,100%{opacity:.28} 50%{opacity:.7} }
                @keyframes cd-spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
                @keyframes cd-loading { 0%{width:0%} 100%{width:100%} }
                * { box-sizing:border-box; }
                ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent}
                ::-webkit-scrollbar-thumb{background:rgba(124,58,237,.4);border-radius:4px}
            `}</style>

            {/* ── PERMANENT THEATRE (always visible at top) ─────────────── */}
            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column',
                height: isFullscreen ? '100vh' : 'min(62vh, 420px)' }}>

                {/* TOP BAR */}
                <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px',
                    background: 'rgba(3,0,9,.96)', borderBottom: `1px solid ${color}22`, zIndex: 20 }}>
                    <span style={{ fontSize: '.95rem' }}>🎬</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 900, fontSize: 'clamp(.65rem,2vw,.82rem)', color: '#fff',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {cinema.cinema_title}
                        </div>
                        <div style={{ fontSize: '.54rem', color: '#6b5fad' }}>
                            {cinema.protagonist?.avatar_emoji} {cinema.protagonist?.name} · Gr.{cinema.grade} · {cinema.subject}
                        </div>
                    </div>
                    {/* Act progress dots */}
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        {acts.map((a, i) => {
                            const c = ACOLOR[a.act_type] ?? '#a78bfa';
                            const active = i === actIdx;
                            const ready = audioReadyActs.has(i);
                            const loading = loadingActs.has(i);
                            return (
                                <button key={i} onClick={() => playAct(i)} title={a.act_title}
                                    style={{ width: active ? 20 : 7, height: 7, borderRadius: 9999, border: 'none',
                                        cursor: 'pointer', padding: 0, position: 'relative',
                                        background: active ? c : i < actIdx ? `${c}55` : 'rgba(255,255,255,.14)',
                                        transition: 'all .3s',
                                        boxShadow: loading ? `0 0 6px ${c}` : 'none',
                                        opacity: loading ? 0.6 : 1 }}>
                                    {!ready && !loading && <span style={{ position: 'absolute', inset: 0, borderRadius: 9999, background: 'rgba(0,0,0,.3)' }}/>}
                                </button>
                            );
                        })}
                    </div>
                    {/* Fullscreen/minimize */}
                    <button onClick={() => isFullscreen ? exitFS() : enterFS()}
                        style={{ background: 'rgba(255,255,255,.06)', border: `1px solid ${color}44`, borderRadius: 7,
                            padding: '4px 8px', color: '#94a3b8', cursor: 'pointer', fontSize: '.82rem' }}>
                        {isFullscreen ? '⊡' : '⛶'}
                    </button>
                    <button onClick={onTryAnother}
                        style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(148,163,184,.15)',
                            borderRadius: 7, padding: '4px 8px', color: '#475569', cursor: 'pointer', fontSize: '.62rem', fontWeight: 700 }}>
                        ✕
                    </button>
                </div>

                {/* STAGE */}
                <div style={{ flex: 1, position: 'relative',
                    background: act ? ABGGRAD[act.act_type] : ABGGRAD['hook'],
                    overflow: 'hidden' }}>

                    {/* Non-blocking audio indicator */}
                    {loadingActs.has(actIdx) && (
                        <div style={{ position: 'absolute', top: 8, left: 14, zIndex: 10,
                            display: 'flex', alignItems: 'center', gap: 5, pointerEvents: 'none' }}>
                            <div style={{ width: 10, height: 10,
                                border: `2px solid ${color}44`, borderTop: `2px solid ${color}`,
                                borderRadius: '50%', animation: 'cd-spin 1s linear infinite' }}/>
                            <span style={{ color: '#64748b', fontSize: '.52rem' }}>audio loading…</span>
                        </div>
                    )}

                                        {/* Red curtains */}
                    <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '5%',
                        background: 'linear-gradient(90deg,#3d0a0e,#7f1d1d 65%,transparent)',
                        boxShadow: 'inset -10px 0 18px rgba(0,0,0,.6)', pointerEvents: 'none', zIndex: 8 }}/>
                    <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '5%',
                        background: 'linear-gradient(270deg,#3d0a0e,#7f1d1d 65%,transparent)',
                        boxShadow: 'inset 10px 0 18px rgba(0,0,0,.6)', pointerEvents: 'none', zIndex: 8 }}/>

                    {/* Corner frames */}
                    {[{ top: 5, left: 5 }, { top: 5, right: 5 }, { bottom: 5, left: 5 }, { bottom: 5, right: 5 }].map((pos, i) => (
                        <div key={i} style={{ position: 'absolute', ...pos, width: 18, height: 18,
                            borderTop: i < 2 ? '2px solid #facc15' : undefined,
                            borderBottom: i >= 2 ? '2px solid #facc15' : undefined,
                            borderLeft: i % 2 === 0 ? '2px solid #facc15' : undefined,
                            borderRight: i % 2 === 1 ? '2px solid #facc15' : undefined,
                            pointerEvents: 'none', zIndex: 9 }}/>
                    ))}

                    {act && <StageScene act={act} tick={tick}/>}

                    {/* Audio playing bars */}
                    {isPlaying && (
                        <div style={{ position: 'absolute', top: 8, right: 10, zIndex: 10,
                            display: 'flex', gap: 2, alignItems: 'flex-end', height: 14, pointerEvents: 'none' }}>
                            {[0, 1, 2, 3].map(j => (
                                <div key={j} style={{ width: 3, background: color, borderRadius: 2,
                                    height: `${4 + 10 * Math.abs(Math.sin(tick * 0.12 + j * 0.9))}px`,
                                    transition: 'height .08s' }}/>
                            ))}
                        </div>
                    )}

                    {/* Act label */}
                    <div style={{ position: 'absolute', bottom: 7, left: 10, zIndex: 10, pointerEvents: 'none',
                        display: 'flex', gap: 5, alignItems: 'center' }}>
                        <span style={{ background: `${color}1a`, border: `1px solid ${color}77`, color,
                            borderRadius: 9999, padding: '2px 8px', fontSize: '.55rem',
                            fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                            {act ? ALABEL[act.act_type] : ''}
                        </span>
                        <span style={{ color: 'rgba(226,232,240,.33)', fontSize: '.54rem' }}>
                            Act {(act?.act_number ?? actIdx + 1)}: {act?.act_title}
                        </span>
                    </div>
                </div>

                {/* SUBTITLE BAR */}
                <div style={{ flexShrink: 0, minHeight: 58, maxHeight: 90,
                    background: currentSub?.is_concept_reveal
                        ? 'linear-gradient(135deg,rgba(26,0,53,.97),rgba(10,0,24,.97))'
                        : 'rgba(3,0,9,.92)',
                    borderTop: `2px solid ${currentSub?.is_concept_reveal ? '#f0abfc' : color + '44'}`,
                    padding: '7px 14px', display: 'flex', flexDirection: 'column',
                    justifyContent: 'center',
                    ...(currentSub?.is_concept_reveal ? { animation: 'cd-revpulse 3s infinite' } : {}) }}>
                    {currentSub ? (
                        <>
                            <div style={{ color: subColor, fontSize: '.56rem', fontWeight: 800, opacity: .65, marginBottom: 2 }}>
                                {currentSub.is_concept_reveal ? '✦ CONCEPT REVEAL ✦'
                                    : currentSub.speaker === 'narrator' ? '🎙 Narrator'
                                    : currentSub.speaker === 'protagonist' ? `${cinema.protagonist?.avatar_emoji ?? '🧑'} ${cinema.protagonist?.name ?? ''}`
                                    : currentSub.speaker === 'student_voice' ? '🎓 Student'
                                    : `${cinema.protagonist?.avatar_emoji ?? '🧑'} ${currentSub.speaker}`}
                            </div>
                            <p style={{ color: subColor, fontSize: 'clamp(.78rem,2.1vw,.95rem)',
                                lineHeight: 1.52, margin: 0,
                                fontStyle: currentSub.speaker === 'narrator' ? 'italic' : 'normal',
                                fontWeight: currentSub.is_concept_reveal ? 700 : 500,
                                animation: 'cd-fadein .3s ease' }}>
                                {currentSub.text}
                            </p>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', color: 'rgba(148,163,184,.35)', fontSize: '.7rem', fontStyle: 'italic' }}>
                            {act?.setting?.place} · {act?.setting?.time_of_day}
                        </div>
                    )}
                </div>

                {/* CONTROL PANEL */}
                <div style={{ flexShrink: 0, background: 'rgba(5,0,14,.99)',
                    borderTop: `1px solid ${color}22`, padding: '6px 12px',
                    display: 'flex', gap: 7, alignItems: 'center' }}>

                    {/* Prev act */}
                    <button onClick={() => { if (actIdx > 0) playAct(actIdx - 1); }}
                        disabled={actIdx === 0}
                        style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(148,163,184,.15)',
                            borderRadius: 8, padding: '5px 10px', color: actIdx === 0 ? '#374151' : '#94a3b8',
                            cursor: actIdx === 0 ? 'not-allowed' : 'pointer', fontSize: '.72rem',
                            fontWeight: 700, opacity: actIdx === 0 ? 0.38 : 1 }}>
                        ◀
                    </button>

                    {/* Play/Pause current */}
                    <button onClick={() => {
                            if (isPlaying) { stopAudio(); }
                            else { playActAudio(actIdx); }
                        }}
                        style={{ background: `${color}22`,
                            border: `1px solid ${color}66`,
                            borderRadius: 8, padding: '5px 11px',
                            color, cursor: 'pointer', fontSize: '1rem' }}>
                        {loadingActs.has(actIdx) ? '⏳' : isPlaying ? '⏸' : '▶'}
                    </button>

                    {/* Next act */}
                    <button onClick={() => {
                            if (actIdx < lastIdx) playAct(actIdx + 1);
                            else setShowEnd(true);
                        }}
                        style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(148,163,184,.15)',
                            borderRadius: 8, padding: '5px 10px', color: '#94a3b8',
                            cursor: 'pointer', fontSize: '.72rem', fontWeight: 700 }}>
                        ▶
                    </button>

                    {/* Progress bar + act info */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color, fontSize: '.56rem', fontWeight: 800 }}>
                                {act ? ALABEL[act.act_type] : ''}
                            </span>
                            <span style={{ color: '#475569', fontSize: '.56rem' }}>
                                {actIdx + 1}/{acts.length} {allReady ? '✓' : `(${audioReadyActs.size}/${acts.length} ready)`}
                            </span>
                        </div>
                        <div style={{ height: 3, background: 'rgba(255,255,255,.08)', borderRadius: 9999 }}>
                            <div style={{ height: '100%', background: color, borderRadius: 9999,
                                width: `${((actIdx + 1) / acts.length) * 100}%`, transition: 'width .4s' }}/>
                        </div>
                    </div>

                    {/* Autoplay toggle */}
                    <button onClick={() => setAutoPlay(a => !a)}
                        style={{ background: autoPlay ? `${color}22` : 'rgba(255,255,255,.05)',
                            border: `1px solid ${autoPlay ? color + '66' : 'rgba(148,163,184,.14)'}`,
                            borderRadius: 8, padding: '5px 9px',
                            color: autoPlay ? color : '#6b7280',
                            cursor: 'pointer', fontSize: '.62rem', fontWeight: 800 }}>
                        {autoPlay ? '⏸ AUTO' : '▶ AUTO'}
                    </button>

                    {/* Volume */}
                    <button onClick={() => setMuted(m => !m)}
                        style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(148,163,184,.14)',
                            borderRadius: 8, padding: '5px 8px', color: muted ? '#6b7280' : '#94a3b8',
                            cursor: 'pointer', fontSize: '.85rem' }}>
                        {muted ? '🔇' : volume > 0.5 ? '🔊' : '🔉'}
                    </button>
                    <input type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume}
                        onChange={e => { setVolume(Number(e.target.value)); setMuted(Number(e.target.value) === 0); }}
                        style={{ width: 56, accentColor: color, cursor: 'pointer' }}/>

                    {/* Transcript toggle */}
                    <button onClick={() => { setShowTranscript(s => !s); setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); }}
                        style={{ background: showTranscript ? `${color}22` : 'rgba(255,255,255,.05)',
                            border: `1px solid ${showTranscript ? color + '55' : 'rgba(148,163,184,.14)'}`,
                            borderRadius: 8, padding: '5px 8px', color: showTranscript ? color : '#64748b',
                            cursor: 'pointer', fontSize: '.62rem', fontWeight: 700 }}>
                        📜
                    </button>
                </div>

                {/* CONCEPT BOARD STRIP */}
                {act?.concept_board && (
                    <div style={{ flexShrink: 0, background: 'rgba(8,0,18,.99)',
                        borderTop: `1.5px solid ${color}28`, padding: '5px 12px',
                        display: 'flex', gap: 10, alignItems: 'center', overflow: 'hidden' }}>
                        <span style={{ color, fontWeight: 900, fontSize: 'clamp(.6rem,1.6vw,.74rem)', flexShrink: 0 }}>
                            {act.concept_board.title}
                        </span>
                        {act.concept_board.formula && (
                            <span style={{ fontFamily: '"SF Mono",ui-monospace,monospace', color: '#f0abfc',
                                fontSize: 'clamp(.66rem,1.7vw,.8rem)', background: 'rgba(240,171,252,.07)',
                                borderRadius: 6, padding: '2px 7px', flexShrink: 0 }}>
                                {act.concept_board.formula}
                            </span>
                        )}
                        {act.concept_board.tamil_analogy && (
                            <span style={{ color: '#fbbf24', fontSize: 'clamp(.58rem,1.4vw,.68rem)',
                                fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                🌾 {act.concept_board.tamil_analogy}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* ── SCROLLABLE CONTENT BELOW THEATRE ─────────────────────── */}
            <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(3,0,9,.98)' }}>

                {/* Transcript panel */}
                {showTranscript && (
                    <div style={{ padding: '12px 14px', borderBottom: `1px solid ${color}22` }}>
                        <h3 style={{ color: '#fff', fontWeight: 900, fontSize: '.88rem', marginBottom: 12 }}>📜 Full Screenplay</h3>
                        {acts.map((a, ai) => (
                            <div key={ai} style={{ marginBottom: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6,
                                    position: 'sticky', top: 0, background: 'rgba(3,0,9,.97)', padding: '3px 0', zIndex: 2 }}>
                                    <span style={{ background: `${ACOLOR[a.act_type] ?? '#a78bfa'}22`,
                                        border: `1px solid ${ACOLOR[a.act_type] ?? '#a78bfa'}66`,
                                        color: ACOLOR[a.act_type] ?? '#a78bfa', borderRadius: 9999,
                                        padding: '2px 8px', fontSize: '.55rem', fontWeight: 800, textTransform: 'uppercase' }}>
                                        {ALABEL[a.act_type]}
                                    </span>
                                    <span style={{ color: 'rgba(226,232,240,.45)', fontSize: '.6rem', fontWeight: 700 }}>
                                        Act {a.act_number}: {a.act_title}
                                    </span>
                                    <button onClick={() => playAct(ai)}
                                        style={{ marginLeft: 'auto', background: 'rgba(255,255,255,.05)',
                                            border: '1px solid rgba(148,163,184,.14)', borderRadius: 6,
                                            padding: '2px 7px', color: '#64748b', cursor: 'pointer', fontSize: '.56rem' }}>
                                        ▶ Go
                                    </button>
                                </div>
                                <div style={{ color: 'rgba(148,163,184,.42)', fontSize: '.58rem', fontStyle: 'italic', marginBottom: 6 }}>
                                    📍 {a.setting?.place} · {a.setting?.tamil_parallel}
                                </div>
                                {a.screenplay.map((line, li) => {
                                    const lc = line.speaker === 'narrator' ? '#a78bfa'
                                        : line.speaker === 'protagonist' ? '#fde68a'
                                        : line.speaker === 'student_voice' ? '#bfdbfe' : '#f0abfc';
                                    return (
                                        <div key={li} style={{ marginBottom: 6, paddingLeft: 8,
                                            borderLeft: `2px solid ${lc}44`,
                                            ...(line.is_concept_reveal ? { background: 'rgba(240,171,252,.05)', borderRadius: '0 6px 6px 0', padding: '4px 8px' } : {}) }}>
                                            {line.is_concept_reveal && (
                                                <div style={{ color: '#f0abfc', fontSize: '.52rem', fontWeight: 900, letterSpacing: '.1em', marginBottom: 2 }}>✦ CONCEPT</div>
                                            )}
                                            <span style={{ color: '#64748b', fontSize: '.55rem', marginRight: 4 }}>
                                                {line.speaker === 'narrator' ? '🎙' : line.speaker === 'protagonist' ? (cinema.protagonist?.avatar_emoji ?? '🧑') : line.speaker === 'student_voice' ? '🎓' : '💡'}
                                            </span>
                                            <span style={{ color: lc, fontSize: 'clamp(.7rem,1.8vw,.82rem)', lineHeight: 1.5, fontStyle: line.speaker === 'narrator' ? 'italic' : 'normal' }}>
                                                {line.text}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                )}

                {/* End content — always below theatre when session ends */}
                {showEnd && (
                    <div style={{ padding: '16px 14px 40px', maxWidth: 700, margin: '0 auto', width: '100%' }}>

                        {/* Exam Spotlight */}
                        <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(167,139,250,.2)',
                            borderRadius: 18, padding: '16px 18px', marginBottom: 16, animation: 'cd-slideup .5s ease' }}>
                            <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 'clamp(.9rem,3vw,1.2rem)', marginBottom: 12 }}>
                                📝 TN Board Exam Spotlight
                            </h2>
                            <div style={{ color: '#a78bfa', fontSize: '.6rem', fontWeight: 800, letterSpacing: '.12em', marginBottom: 4 }}>MOST ASKED QUESTION</div>
                            <div style={{ background: 'rgba(168,85,247,.09)', border: '1px solid rgba(168,85,247,.35)',
                                borderRadius: 12, padding: '11px 14px', color: '#f1f5f9',
                                marginBottom: 14, lineHeight: 1.6, fontSize: 'clamp(.78rem,2vw,.9rem)' }}>
                                {cinema.exam_spotlight?.most_asked_question}
                            </div>
                            <div style={{ color: '#a78bfa', fontSize: '.6rem', fontWeight: 800, letterSpacing: '.12em', marginBottom: 8 }}>MODEL ANSWER</div>
                            {(cinema.exam_spotlight?.model_answer_structure ?? []).map((step, i) => (
                                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 7, alignItems: 'flex-start' }}>
                                    <span style={{ flexShrink: 0, width: 20, height: 20, borderRadius: '50%',
                                        background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff',
                                        fontWeight: 900, fontSize: '.64rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {i + 1}
                                    </span>
                                    <span style={{ color: '#e2e8f0', lineHeight: 1.5, fontSize: 'clamp(.76rem,2vw,.88rem)', paddingTop: 1 }}>
                                        {step}
                                    </span>
                                </div>
                            ))}
                            <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                                <span style={{ background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.38)',
                                    color: '#86efac', borderRadius: 9999, padding: '5px 12px', fontWeight: 700, fontSize: '.76rem' }}>
                                    🎯 {cinema.exam_spotlight?.marks_tip}
                                </span>
                                {cinema.exam_spotlight?.previous_year_hint && (
                                    <span style={{ color: '#fbbf24', fontStyle: 'italic', fontSize: '.78rem' }}>
                                        📅 {cinema.exam_spotlight.previous_year_hint}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Quiz */}
                        <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(148,163,184,.12)',
                            borderRadius: 18, padding: '16px 18px', marginBottom: 16, animation: 'cd-slideup .6s ease' }}>
                            <QuizPanel quiz={cinema.quiz ?? []} studentName={studentName}/>
                        </div>

                        {/* New cinema button */}
                        <div style={{ textAlign: 'center', padding: '8px 0 8px', animation: 'cd-slideup .7s ease' }}>
                            <button onClick={onTryAnother}
                                style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff',
                                    border: 'none', borderRadius: 14, padding: '12px 28px',
                                    fontWeight: 900, fontSize: '.9rem', cursor: 'pointer' }}>
                                🎬 New Cinema Experience
                            </button>
                        </div>
                    </div>
                )}

                {!showEnd && (
                    <div style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <div style={{ color: 'rgba(148,163,184,.25)', fontSize: '.62rem' }}>
                            {allReady ? '✓ All acts ready · Press ▶ AUTO to play through' : `Preparing audio… ${acts.length - audioReadyActs.size} remaining…`}
                        </div>
                    </div>
                )}

                <div ref={bottomRef}/>
            </div>
        </div>
    );
};

export default CinemaDisplay;
