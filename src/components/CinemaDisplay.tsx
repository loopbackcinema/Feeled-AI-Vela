/**
 * CinemaDisplay.tsx — மாயக் கற்றல் திரையரங்கம் v7
 *
 * FIXES from v6:
 * 1. Audio BEFORE subtitles: fetch audio first, THEN start subtitles + play together
 * 2. Theatre stays visible always: no isFS height toggling, simple layout
 * 3. Sequential acts: audio.onended triggers next act (not subtitle timer)
 * 4. Minimize = just exit fullscreen, theatre stays on screen normally
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CinemaStory, CinemaAct, CinemaActType } from '../types';
import { useAuth } from '../context/AuthContext';

interface Props { cinema: CinemaStory; language: string; onTryAnother: () => void; }

// ── PCM Audio ─────────────────────────────────────────────────────────────────
function b64ToBytes(b: string) {
    const s = atob(b); const u = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u;
}
function makePCMBuffer(bytes: Uint8Array, ctx: AudioContext) {
    const i16 = new Int16Array(bytes.buffer);
    const buf = ctx.createBuffer(1, i16.length, 24000);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < i16.length; i++) ch[i] = i16[i] / 32768;
    return buf;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const COLOR: Record<CinemaActType, string> = {
    hook:'#f59e0b', rising_action:'#60a5fa', climax:'#f43f5e',
    resolution:'#34d399', exam_bridge:'#a78bfa',
};
const LABEL: Record<CinemaActType, string> = {
    hook:'Hook', rising_action:'Rising Action',
    climax:'Climax', resolution:'Resolution', exam_bridge:'Exam Bridge',
};
const STAGE_BG: Record<CinemaActType, string> = {
    hook:          'radial-gradient(ellipse at 38% 40%,#1c0540,#04000e)',
    rising_action: 'radial-gradient(ellipse at 62% 30%,#000d30,#04000e)',
    climax:        'radial-gradient(ellipse at 50% 35%,#250008,#04000e)',
    resolution:    'radial-gradient(ellipse at 45% 40%,#001e0a,#04000e)',
    exam_bridge:   'radial-gradient(ellipse at 50% 35%,#0e0028,#04000e)',
};

// ── SVG Stage ─────────────────────────────────────────────────────────────────
function Stage({ act, tick }: { act: CinemaAct; tick: number }) {
    const c = COLOR[act.act_type] ?? '#a78bfa';
    const txt = act.screenplay.map(l => l.text).join(' ').toLowerCase()
        + ' ' + (act.stage_elements ?? []).map(e => e.name + ' ' + e.description).join(' ').toLowerCase();
    const t = tick * 0.05;

    const isForce   = /force|inertia|newton|f=ma|momentum|accelerat|push|pull/.test(txt);
    const isWave    = /wave|light|sound|frequency|wavelength|optic/.test(txt);
    const isCell    = /cell|nucleus|chloro|mitochond|biology|membrane|organism/.test(txt);
    const isChem    = /molecule|bond|reaction|compound|atom|valence|periodic/.test(txt);
    const isElec    = /current|circuit|voltage|resistance|ohm|electric|battery/.test(txt);
    const isGravity = /gravity|orbit|planet|satellite|solar|stellar/.test(txt);
    const isMath    = /equation|graph|parabola|trigon|calculus|algebr|function/.test(txt);
    const isThermo  = /heat|temperature|thermodynam|entropy|carnot|kelvin/.test(txt);

    function charEmoji(name: string) {
        const n = name.toLowerCase();
        if (/newton/.test(n)) return '🧑‍🔬';
        if (/einstein/.test(n)) return '👨‍🔬';
        if (/raman/.test(n)) return '🔬';
        if (/ramanujan/.test(n)) return '📐';
        if (/curie/.test(n)) return '⚗️';
        if (/mendel|darwin/.test(n)) return '🌱';
        if (/teacher|ஆசிரிய/.test(n)) return '👩‍🏫';
        if (/student|மாணவ/.test(n)) return '🎓';
        if (/apple/.test(n)) return '🍎';
        if (/earth|பூமி/.test(n)) return '🌍';
        if (/sun/.test(n)) return '☀️';
        if (/moon/.test(n)) return '🌙';
        if (/rocket/.test(n)) return '🚀';
        if (/stone|rock|weight/.test(n)) return '🪨';
        if (/bulb|lamp/.test(n)) return '💡';
        if (/magnet/.test(n)) return '🧲';
        if (/water|நீர்/.test(n)) return '💧';
        if (/book/.test(n)) return '📖';
        return '✨';
    }

    const chars = (act.stage_elements ?? []).slice(0, 3);
    const cpos = [{ x: 88, y: 148 }, { x: 312, y: 142 }, { x: 200, y: 160 }];

    return (
        <svg viewBox="0 0 400 280" width="100%" height="100%"
            style={{ position: 'absolute', inset: 0 }} xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="sg" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={c} stopOpacity="0.14"/>
                    <stop offset="100%" stopColor={c} stopOpacity="0"/>
                </radialGradient>
                <filter id="f3"><feGaussianBlur stdDeviation="3"/></filter>
                <filter id="f6"><feGaussianBlur stdDeviation="6"/></filter>
                <marker id="ar" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                    <polygon points="0 0,8 3,0 6" fill={c}/>
                </marker>
                <marker id="ar2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                    <polygon points="0 0,8 3,0 6" fill="#60a5fa"/>
                </marker>
            </defs>

            <ellipse cx="200" cy="135" rx="180" ry="112" fill="url(#sg)"
                opacity={0.5 + 0.12 * Math.sin(t)}/>

            {[[25,20],[378,35],[10,202],[390,182],[200,10],[92,48],[318,55],[48,145],[345,135]].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={0.7 + (i % 3) * 0.4} fill="white"
                    opacity={0.15 + 0.28 * Math.sin(t * 1.1 + i * 1.3)}/>
            ))}

            {/* FORCE / NEWTON'S LAWS */}
            {isForce && !isGravity && (() => {
                const ox = 185 + 16 * Math.sin(t * 0.7);
                const fl = 60 + 14 * Math.sin(t * 0.8);
                return (<>
                    <line x1="60" y1="193" x2="340" y2="193" stroke="#1e293b" strokeWidth="1.5"/>
                    <rect x={ox - 24} y="163" width="48" height="28" rx="6"
                        fill={`${c}14`} stroke={c} strokeWidth="1.8"/>
                    <text x={ox} y="181" fill={c} fontSize="11" textAnchor="middle" fontWeight="bold">m</text>
                    <line x1={ox - fl - 26} y1="177" x2={ox - 26} y2="177"
                        stroke={c} strokeWidth="3.5" markerEnd="url(#ar)"/>
                    <line x1={ox - fl - 26} y1="177" x2={ox - 26} y2="177"
                        stroke={c} strokeWidth="9" filter="url(#f3)" opacity="0.18"/>
                    <text x={ox - fl / 2 - 26} y="166" fill={c} fontSize="12" textAnchor="middle" fontWeight="bold">F</text>
                    <line x1={ox + 28} y1="177" x2={ox + 78} y2="177"
                        stroke="#60a5fa" strokeWidth="2.5" markerEnd="url(#ar2)" strokeDasharray="5 3"/>
                    <text x={ox + 54} y="166" fill="#60a5fa" fontSize="10" textAnchor="middle">a</text>
                    <rect x="132" y="206" width="136" height="26" rx="7"
                        fill="rgba(0,0,10,.75)" stroke={c} strokeWidth="1.2" strokeOpacity="0.45"/>
                    <text x="200" y="223" fill="#f0abfc" fontSize="14" textAnchor="middle"
                        fontFamily="ui-monospace,monospace" fontWeight="bold">F = ma</text>
                </>);
            })()}

            {/* WAVE / LIGHT / SOUND */}
            {isWave && (() => {
                const w1 = Array.from({ length: 24 }, (_, j) =>
                    `${22 + j * 15},${112 + Math.sin(j * 0.52 + t * 1.2) * 32}`).join(' ');
                const w2 = Array.from({ length: 24 }, (_, j) =>
                    `${22 + j * 15},${162 + Math.sin(j * 0.52 + t * 1.2 + Math.PI) * 20}`).join(' ');
                return (<>
                    <polyline points={w1} fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round"/>
                    <polyline points={w1} fill="none" stroke="#34d399" strokeWidth="7" filter="url(#f3)" opacity="0.16"/>
                    <polyline points={w2} fill="none" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" opacity="0.55"/>
                    <line x1="22" y1="200" x2="77" y2="200" stroke="#6ee7b7" strokeWidth="1" strokeDasharray="2 2"/>
                    <line x1="22" y1="197" x2="22" y2="203" stroke="#6ee7b7" strokeWidth="1"/>
                    <line x1="77" y1="197" x2="77" y2="203" stroke="#6ee7b7" strokeWidth="1"/>
                    <text x="50" y="213" fill="#6ee7b7" fontSize="10" textAnchor="middle">λ</text>
                    <rect x="132" y="216" width="136" height="24" rx="7"
                        fill="rgba(0,0,10,.75)" stroke="#34d399" strokeWidth="1" strokeOpacity="0.4"/>
                    <text x="200" y="232" fill="#86efac" fontSize="11" textAnchor="middle"
                        fontFamily="ui-monospace,monospace">v = fλ</text>
                </>);
            })()}

            {/* CELL BIOLOGY */}
            {isCell && (() => {
                const b = 1 + 0.04 * Math.sin(t * 0.9);
                return (
                    <g transform={`translate(200,128) scale(${b})`}>
                        <ellipse cx="0" cy="0" rx="88" ry="64" fill="rgba(52,211,153,0.05)" stroke="#34d399" strokeWidth="2"/>
                        <ellipse cx="8" cy="-5" rx="30" ry="22" fill="rgba(134,239,172,0.1)" stroke="#86efac" strokeWidth="1.5"/>
                        <text x="8" y="-1" fill="#86efac" fontSize="7" textAnchor="middle" opacity="0.65">nucleus</text>
                        {[[-46, 22], [-56, -9], [36, 30], [48, -18]].map(([ox, oy], i) => (
                            <ellipse key={i} cx={ox} cy={oy} rx="9" ry="5"
                                fill="rgba(251,146,60,0.5)" opacity={0.5 + 0.3 * Math.sin(t + i * 0.9)}/>
                        ))}
                        {[[-30, -36], [20, -30], [-60, 4]].map(([ox, oy], i) => (
                            <ellipse key={i} cx={ox} cy={oy} rx="8" ry="5"
                                fill="rgba(34,197,94,0.6)" opacity={0.5 + 0.3 * Math.sin(t * 1.1 + i)}/>
                        ))}
                        <ellipse cx="30" cy="18" rx="16" ry="12" fill="rgba(96,165,250,0.14)" stroke="#60a5fa" strokeWidth="0.8"/>
                    </g>
                );
            })()}

            {/* CHEMISTRY */}
            {isChem && !isCell && (() => {
                const w = Math.sin(t * 0.8) * 5;
                return (<>
                    {([[200, 126, '#f43f5e', 14, 'O'], [154, 157, '#60a5fa', 12, 'H'], [246, 157, '#60a5fa', 12, 'H']] as [number,number,string,number,string][]).map(([ax, ay, ac, r, lb], i) => (<g key={i}>
                        <line x1="200" y1={126 + w} x2={ax} y2={Number(ay) + w} stroke="#64748b" strokeWidth="2.5" opacity={i > 0 ? 0.7 : 0}/>
                        <circle cx={ax} cy={Number(ay) + w} r={r} fill={String(ac)} opacity="0.9" filter="url(#f3)"/>
                        <text x={ax} y={Number(ay) + w + 4} fill="white" fontSize="9" textAnchor="middle" fontWeight="bold">{lb}</text>
                    </g>))}
                    <ellipse cx="200" cy={126 + w * 0.3} rx="68" ry="48" fill="none" stroke={c} strokeWidth="0.7" strokeOpacity="0.2" strokeDasharray="3 3"/>
                    <rect x="132" y="210" width="136" height="24" rx="7" fill="rgba(0,0,10,.75)" stroke={c} strokeWidth="1" strokeOpacity="0.4"/>
                    <text x="200" y="226" fill="#f0abfc" fontSize="11" textAnchor="middle" fontFamily="ui-monospace,monospace">H₂O</text>
                </>);
            })()}

            {/* ELECTRICITY */}
            {isElec && (() => {
                const flow = (tick * 2) % 240;
                const glow = 0.3 + 0.6 * Math.abs(Math.sin(t * 2));
                return (<>
                    <rect x="80" y="88" width="240" height="108" rx="8" fill="none" stroke="#1e293b" strokeWidth="2"/>
                    <rect x="80" y="128" width="4" height="28" fill="#fbbf24"/>
                    <rect x="88" y="122" width="4" height="40" fill="#fbbf24" opacity="0.6"/>
                    <text x="70" y="146" fill="#fbbf24" fontSize="9" textAnchor="middle">+</text>
                    <text x="70" y="165" fill="#60a5fa" fontSize="9" textAnchor="middle">−</text>
                    {Array.from({ length: 6 }, (_, i) => (
                        <line key={i} x1={198 + i * 8} y1={i % 2 === 0 ? 88 : 78} x2={206 + i * 8} y2={i % 2 === 0 ? 78 : 88}
                            stroke={c} strokeWidth="2"/>
                    ))}
                    <circle cx="320" cy="142" r="18" fill={`rgba(251,191,36,${glow * 0.12})`} stroke="#fbbf24" strokeWidth="1.5" opacity={glow}/>
                    <circle cx="320" cy="142" r="10" fill="#fde68a" filter="url(#f3)" opacity={glow * 0.7}/>
                    <circle cx={80 + flow} cy="88" r="5" fill="#60a5fa" opacity="0.9" filter="url(#f3)"/>
                    <text x="200" y="222" fill="#94a3b8" fontSize="10" textAnchor="middle">V = IR</text>
                </>);
            })()}

            {/* GRAVITY / ORBITS */}
            {isGravity && (() => {
                const a1 = t * 0.9, a2 = t * 0.55;
                return (<>
                    <circle cx="200" cy="128" r={15 + 2 * Math.sin(t * 0.8)} fill="#fbbf24" opacity="0.95" filter="url(#f3)"/>
                    <circle cx="200" cy="128" r="12" fill="#fcd34d"/>
                    <ellipse cx="200" cy="128" rx="78" ry="38" fill="none" stroke={c} strokeWidth="0.9" strokeOpacity="0.3" strokeDasharray="4 4"/>
                    <circle cx={200 + 78 * Math.cos(a1)} cy={128 + 38 * Math.sin(a1)} r="9" fill="#60a5fa" filter="url(#f3)"/>
                    <ellipse cx="200" cy="128" rx="118" ry="55" fill="none" stroke="#60a5fa" strokeWidth="0.8" strokeOpacity="0.2" strokeDasharray="4 4"/>
                    <circle cx={200 + 118 * Math.cos(-a2)} cy={128 + 55 * Math.sin(-a2)} r="6" fill="#f43f5e" filter="url(#f3)"/>
                    <line x1={200 + 78 * Math.cos(a1)} y1={128 + 38 * Math.sin(a1)}
                        x2={200 + 58 * Math.cos(a1)} y2={128 + 30 * Math.sin(a1)}
                        stroke={c} strokeWidth="1.5" markerEnd="url(#ar)" opacity="0.55"/>
                    <text x="200" y="213" fill="#fcd34d" fontSize="10" textAnchor="middle" fontFamily="ui-monospace,monospace">F = GMm/r²</text>
                </>);
            })()}

            {/* MATHEMATICS */}
            {isMath && !isForce && !isWave && (() => {
                const pts = Array.from({ length: 40 }, (_, i) => {
                    const x = -4 + i * 0.2;
                    return `${50 + i * 7.5},${238 - x * x * 8}`;
                }).join(' ');
                const movI = tick % 40;
                const mx = -4 + movI * 0.2;
                return (<>
                    <line x1="50" y1="238" x2="340" y2="238" stroke="#1e293b" strokeWidth="1.5" markerEnd="url(#ar)"/>
                    <line x1="50" y1="238" x2="50" y2="68" stroke="#1e293b" strokeWidth="1.5" markerEnd="url(#ar)"/>
                    <text x="348" y="242" fill="#334155" fontSize="9">x</text>
                    <text x="43" y="64" fill="#334155" fontSize="9">y</text>
                    <polyline points={pts} fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
                    <polyline points={pts} fill="none" stroke={c} strokeWidth="7" filter="url(#f3)" opacity="0.13"/>
                    <circle cx={50 + movI * 7.5} cy={238 - mx * mx * 8} r="5" fill="#fbbf24" filter="url(#f3)"/>
                    <text x="200" y="215" fill={c} fontSize="12" textAnchor="middle" fontFamily="ui-monospace,monospace">y = x²</text>
                </>);
            })()}

            {/* THERMODYNAMICS */}
            {isThermo && (() => {
                const heat = 0.5 + 0.5 * Math.sin(t * 0.8);
                return (<>
                    <rect x="118" y="88" width="162" height="128" rx="8"
                        fill={`rgba(251,113,133,${0.04 + heat * 0.08})`} stroke="#f43f5e" strokeWidth="1.5"/>
                    {Array.from({ length: 12 }, (_, i) => {
                        const px = 128 + ((i * 37 + tick * (1 + heat) * 2) % 142);
                        const py = 98 + ((i * 29 + tick * (1 + heat) * 1.5) % 108);
                        return <circle key={i} cx={px} cy={py} r={3 + heat * 2} fill={c} opacity={0.5 + heat * 0.4}/>;
                    })}
                    <rect x="294" y="98" width="12" height="98" rx="6" fill="rgba(10,0,22,.7)" stroke="#334155" strokeWidth="1"/>
                    <rect x="294" y={196 - heat * 88} width="12" height={heat * 88 + 10} rx="6" fill="#f43f5e"/>
                    <text x="300" y="210" fill="#f87171" fontSize="8" textAnchor="middle">T</text>
                    <text x="200" y="238" fill={c} fontSize="11" textAnchor="middle" fontFamily="ui-monospace,monospace">ΔU = Q − W</text>
                </>);
            })()}

            {/* DEFAULT elegant */}
            {!isForce && !isWave && !isCell && !isChem && !isElec && !isGravity && !isMath && !isThermo && (
                <>
                    <circle cx="200" cy="128" r={20 + 5 * Math.sin(t * 0.7)} fill={c} opacity="0.1" filter="url(#f6)"/>
                    <circle cx="200" cy="128" r="12" fill={c} opacity="0.75"/>
                    {[0, 51, 103, 154, 205, 257, 308].map((deg, i) => {
                        const r2 = deg * Math.PI / 180 + t * 0.6;
                        const rad = 54 + 18 * Math.sin(t * 0.5 + i * 0.7);
                        return (
                            <circle key={i} cx={200 + rad * Math.cos(r2)} cy={128 + rad * 0.55 * Math.sin(r2)}
                                r={3.5 + 1.5 * Math.sin(t * 0.8 + i)} fill={c}
                                opacity={0.38 + 0.3 * Math.sin(t * 0.6 + i * 0.8)}/>
                        );
                    })}
                </>
            )}

            {/* CHARACTERS */}
            {chars.map((el, i) => {
                const pos = cpos[i] ?? { x: 200, y: 155 };
                const fy = Math.sin(t * 0.7 + i * 1.2) * 7;
                const em = charEmoji(el.name);
                const sz = /teacher|student|newton|einstein|raman|ramanujan|curie|mendel/.test(el.name.toLowerCase()) ? 46 : 36;
                return (
                    <g key={i}>
                        {el.highlight && (
                            <circle cx={pos.x} cy={pos.y + fy} r={sz * 0.78}
                                fill="none" stroke={c} strokeWidth="1.5"
                                strokeOpacity={0.38 + 0.26 * Math.sin(t * 0.7)} filter="url(#f3)"/>
                        )}
                        <text x={pos.x} y={pos.y + fy + sz * 0.38} fontSize={sz}
                            textAnchor="middle" style={{ userSelect: 'none' }}>{em}</text>
                    </g>
                );
            })}

            {act.act_type === 'climax' && (
                <ellipse cx={200 + 24 * Math.cos(t * 0.5)} cy="276" rx="48" ry="15"
                    fill={c} opacity={0.07 + 0.04 * Math.sin(t * 0.6)} filter="url(#f6)"/>
            )}
        </svg>
    );
}

// ── Quiz ──────────────────────────────────────────────────────────────────────
function Quiz({ items }: { items: CinemaStory['quiz'] }) {
    const [picks, setPicks] = useState<Record<number, string>>({});
    const [done, setDone] = useState(false);
    const score = done ? items.filter((q, i) => picks[i] === q.answer).length : 0;
    return (
        <div>
            {items.map((q, i) => (
                <div key={i} style={{ marginBottom: 14, background: 'rgba(255,255,255,.025)',
                    border: '1px solid rgba(148,163,184,.1)', borderRadius: 12, padding: '12px 14px' }}>
                    <p style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: 9, lineHeight: 1.5,
                        fontSize: 'clamp(.76rem,1.9vw,.88rem)' }}>{i + 1}. {q.question}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                        {q.options.map((opt, j) => {
                            const chosen = picks[i] === opt;
                            const correct = done && opt === q.answer;
                            const wrong = done && chosen && opt !== q.answer;
                            return (
                                <button key={j} disabled={done} onClick={() => setPicks(p => ({ ...p, [i]: opt }))}
                                    style={{ padding: '8px 10px', borderRadius: 8, textAlign: 'left', cursor: done ? 'default' : 'pointer',
                                        fontSize: 'clamp(.68rem,1.7vw,.8rem)', fontWeight: 600, lineHeight: 1.4,
                                        background: correct ? 'rgba(34,197,94,.14)' : wrong ? 'rgba(239,68,68,.14)' : chosen ? 'rgba(79,70,229,.16)' : 'rgba(255,255,255,.03)',
                                        border: correct ? '1.5px solid #22c55e' : wrong ? '1.5px solid #ef4444' : chosen ? '1.5px solid #6366f1' : '1px solid rgba(148,163,184,.15)',
                                        color: correct ? '#86efac' : wrong ? '#fca5a5' : chosen ? '#c7d2fe' : '#94a3b8' }}>
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                    {done && <p style={{ marginTop: 7, fontSize: '.72rem', color: '#64748b', lineHeight: 1.5 }}>💡 {q.explanation}</p>}
                </div>
            ))}
            {!done
                ? <button disabled={Object.keys(picks).length < items.length}
                    onClick={() => setDone(true)}
                    style={{ width: '100%', padding: 11, fontWeight: 800, fontSize: '.88rem', cursor: 'pointer',
                        color: '#fff', border: 'none', borderRadius: 11,
                        background: Object.keys(picks).length >= items.length ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : '#1e1b4b',
                        opacity: Object.keys(picks).length >= items.length ? 1 : 0.45 }}>
                    Submit
                  </button>
                : <div style={{ textAlign: 'center', padding: 11, background: 'rgba(79,70,229,.12)',
                    border: '1px solid #4f46e5', borderRadius: 11, color: '#c7d2fe', fontWeight: 800, fontSize: '1rem' }}>
                    {score}/{items.length} correct {score === items.length ? '🏆' : '✅'}
                  </div>
            }
        </div>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────
const CinemaDisplay: React.FC<Props> = ({ cinema, language, onTryAnother }) => {
    useAuth();
    const containerRef = useRef<HTMLDivElement>(null);
    const acts = cinema.acts ?? [];
    const lastIdx = acts.length - 1;

    const [actIdx,    setActIdx]    = useState(0);
    const [subIdx,    setSubIdx]    = useState(0);
    const [autoPlay,  setAutoPlay]  = useState(true);
    const [muted,     setMuted]     = useState(false);
    const [volume,    setVolume]    = useState(0.9);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading,   setLoading]   = useState(false);
    const [showEnd,   setShowEnd]   = useState(false);
    const [tick,      setTick]      = useState(0);
    const [isFS,      setIsFS]      = useState(false);

    const audioCache  = useRef<Record<number, string>>({});
    const ctxRef      = useRef<AudioContext | null>(null);
    const srcRef      = useRef<AudioBufferSourceNode | null>(null);
    const gainRef     = useRef<GainNode | null>(null);
    const subRef      = useRef<ReturnType<typeof setInterval> | null>(null);
    const playingIdx  = useRef(-1); // which act is currently playing

    const act   = acts[actIdx];
    const lines = act?.screenplay ?? [];
    const color = act ? COLOR[act.act_type] : '#a78bfa';

    // Tick
    useEffect(() => {
        const id = setInterval(() => setTick(t => t + 1), 50);
        return () => clearInterval(id);
    }, []);

    // Audio context
    function getCtx() {
        if (!ctxRef.current || ctxRef.current.state === 'closed') {
            ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            gainRef.current = ctxRef.current.createGain();
            gainRef.current.gain.value = muted ? 0 : volume;
            gainRef.current.connect(ctxRef.current.destination);
        }
        return ctxRef.current;
    }

    function stopAudio() {
        if (srcRef.current) { try { srcRef.current.stop(); } catch (_) {} srcRef.current = null; }
        setIsPlaying(false);
    }

    function stopSubs() {
        if (subRef.current) { clearInterval(subRef.current); subRef.current = null; }
    }

    // ── PLAY AUDIO + SUBTITLES TOGETHER ──────────────────────────────────────
    // Called AFTER audio is ready. Both start at the same time.
    const startActPlayback = useCallback((idx: number, b64: string | null) => {
        const a = acts[idx];
        if (!a) return;
        const lineCount = a.screenplay.length;

        stopSubs();
        setSubIdx(0);

        // ① Play audio
        if (b64 && !muted) {
            try {
                const ctx = getCtx();
                if (ctx.state === 'suspended') ctx.resume();
                gainRef.current!.gain.value = muted ? 0 : volume;
                const buf = makePCMBuffer(b64ToBytes(b64), ctx);
                const src = ctx.createBufferSource();
                src.buffer = buf;
                src.connect(gainRef.current!);
                src.onended = () => {
                    setIsPlaying(false);
                    // Auto-advance to next act when audio finishes
                    if (autoPlay && playingIdx.current === idx) {
                        if (idx < lastIdx) {
                            playAct(idx + 1);
                        } else {
                            setShowEnd(true);
                        }
                    }
                };
                src.start();
                srcRef.current = src;
                setIsPlaying(true);
            } catch (_) {}
        }

        // ② Run subtitle ticker in parallel (spread evenly across ~audio duration)
        // Estimate: ~4s per line
        const msPerLine = Math.max(3000, b64
            ? (b64ToBytes(b64).length / 2 / 24000 * 1000) / Math.max(lineCount, 1)
            : 4000);

        let cur = 0;
        subRef.current = setInterval(() => {
            cur++;
            if (cur < lineCount) {
                setSubIdx(cur);
            } else {
                stopSubs();
                // If no audio (muted/failed), auto-advance via subtitle timer
                if ((!b64 || muted) && autoPlay && playingIdx.current === idx) {
                    if (idx < lastIdx) playAct(idx + 1);
                    else setShowEnd(true);
                }
            }
        }, msPerLine);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [acts, lastIdx, autoPlay, muted, volume]);

    // ── PLAY ACT: fetch audio FIRST, then start playback ─────────────────────
    const playAct = useCallback(async (idx: number) => {
        if (idx > lastIdx) { setShowEnd(true); return; }

        stopAudio();
        stopSubs();
        setActIdx(idx);
        setSubIdx(0);
        setShowEnd(false);
        playingIdx.current = idx;

        const a = acts[idx];
        if (!a) return;

        // Check cache first
        if (audioCache.current[idx]) {
            startActPlayback(idx, audioCache.current[idx]);
            return;
        }

        // Fetch audio → THEN start (no delay between audio and subtitles)
        const text = a.screenplay
            .filter(l => l.speaker === 'narrator' || l.is_concept_reveal || l.speaker === 'concept_voice')
            .map(l => l.text).join('. ').slice(0, 440);

        if (!text.trim()) { startActPlayback(idx, null); return; }

        const narratorVoice = language === 'Tamil' ? 'Female' : (a.act_type === 'climax' ? 'Male' : 'Female');
        const emotionTone = a.act_type === 'climax' ? 'dramatic'
            : a.act_type === 'hook' ? 'curious and engaging'
            : a.act_type === 'resolution' ? 'warm and clear' : 'clear and educational';

        setLoading(true);
        try {
            const res = await fetch('/api/audio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullStoryText: text, language, narratorVoice, emotionTone }),
            });
            const b64 = res.ok ? (await res.json()).base64Audio ?? null : null;
            if (b64) audioCache.current[idx] = b64;
            // Only start if this act is still the active one
            if (playingIdx.current === idx) startActPlayback(idx, b64);
        } catch (_) {
            if (playingIdx.current === idx) startActPlayback(idx, null);
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [acts, lastIdx, language, startActPlayback]);

    // ── MOUNT: auto-start act 0 ───────────────────────────────────────────────
    useEffect(() => {
        playAct(0);
        return () => { stopAudio(); stopSubs(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Volume/mute live update
    useEffect(() => {
        if (gainRef.current) gainRef.current.gain.value = muted ? 0 : volume;
    }, [volume, muted]);

    // ── FULLSCREEN ────────────────────────────────────────────────────────────
    const enterFS = () => {
        const el = containerRef.current;
        if (!el) return;
        (el.requestFullscreen ?? (el as any).webkitRequestFullscreen)?.call(el).catch(() => {});
    };
    const exitFS = () => {
        (document.exitFullscreen ?? (document as any).webkitExitFullscreen)?.call(document).catch(() => {});
    };
    useEffect(() => {
        setTimeout(enterFS, 200);
        const fn = () => setIsFS(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', fn);
        document.addEventListener('webkitfullscreenchange', fn);
        return () => {
            document.removeEventListener('fullscreenchange', fn);
            document.removeEventListener('webkitfullscreenchange', fn);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const currentLine = lines[subIdx] ?? null;
    const subColor = !currentLine ? '#334155'
        : currentLine.is_concept_reveal ? '#f0abfc'
        : currentLine.speaker === 'narrator' ? '#c4b5fd'
        : currentLine.speaker === 'protagonist' ? '#fde68a'
        : currentLine.speaker === 'student_voice' ? '#bfdbfe' : '#f0abfc';

    const speakerTag = !currentLine ? ''
        : currentLine.is_concept_reveal ? '✦ CONCEPT ✦'
        : currentLine.speaker === 'narrator' ? '🎙 Narrator'
        : currentLine.speaker === 'protagonist' ? `${cinema.protagonist?.avatar_emoji ?? '🧑'} ${cinema.protagonist?.name ?? ''}`
        : currentLine.speaker === 'student_voice' ? '🎓 Student'
        : `${cinema.protagonist?.avatar_emoji ?? ''} ${currentLine.speaker}`;

    return (
        <div ref={containerRef} style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: '#04000e', color: '#e2e8f0',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
            <style>{`
                @keyframes cd-spin { to { transform: rotate(360deg); } }
                @keyframes cd-in   { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
                @keyframes cd-up   { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:none; } }
                @keyframes cd-glow { 0%,100%{box-shadow:0 0 8px rgba(240,171,252,.14)} 50%{box-shadow:0 0 22px rgba(240,171,252,.46)} }
                * { box-sizing: border-box; }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-thumb { background: rgba(124,58,237,.32); border-radius: 4px; }
            `}</style>

            {/* ══════════════════════════════════════
                THEATRE — fixed height, NEVER removed
            ══════════════════════════════════════ */}
            <div style={{
                flexShrink: 0,
                height: isFS ? '100dvh' : 'clamp(300px, 58dvh, 420px)',
                display: 'flex', flexDirection: 'column',
                borderBottom: `2px solid ${color}2a`,
                transition: 'height .3s ease',
            }}>

                {/* TOP BAR */}
                <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8,
                    padding: '5px 12px', background: 'rgba(4,0,14,.97)',
                    borderBottom: `1px solid ${color}18` }}>
                    <span style={{ fontSize: '.9rem' }}>🎬</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 900, fontSize: 'clamp(.6rem,2vw,.78rem)', color: '#fff',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {cinema.cinema_title}
                        </div>
                        <div style={{ fontSize: '.5rem', color: '#4b5563' }}>
                            {cinema.protagonist?.avatar_emoji} {cinema.protagonist?.name} · {cinema.subject} · Gr.{cinema.grade}
                        </div>
                    </div>
                    {/* Act dots */}
                    <div style={{ display: 'flex', gap: 4 }}>
                        {acts.map((a, i) => {
                            const c2 = COLOR[a.act_type] ?? '#a78bfa';
                            return (
                                <button key={i} onClick={() => playAct(i)} title={a.act_title}
                                    style={{ width: i === actIdx ? 18 : 6, height: 6, borderRadius: 9999,
                                        border: 'none', cursor: 'pointer', padding: 0, transition: 'all .3s',
                                        background: i === actIdx ? c2 : i < actIdx ? `${c2}55` : 'rgba(255,255,255,.14)' }}/>
                            );
                        })}
                    </div>
                    <button onClick={() => isFS ? exitFS() : enterFS()}
                        style={{ background: 'rgba(255,255,255,.06)', border: `1px solid ${color}44`,
                            borderRadius: 6, padding: '3px 7px', color: '#94a3b8', cursor: 'pointer', fontSize: '.78rem' }}>
                        {isFS ? '⊡' : '⛶'}
                    </button>
                    <button onClick={onTryAnother}
                        style={{ background: 'none', border: '1px solid rgba(148,163,184,.14)',
                            borderRadius: 6, padding: '3px 7px', color: '#374151', cursor: 'pointer',
                            fontSize: '.56rem', fontWeight: 700 }}>✕</button>
                </div>

                {/* STAGE */}
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden',
                    background: act ? STAGE_BG[act.act_type] : STAGE_BG['hook'] }}>

                    {/* Curtains */}
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 9 }}>
                        {[{ side: 'left' }, { side: 'right' }].map(({ side }, i) => (
                            <div key={i} style={{ position: 'absolute', top: 0, bottom: 0,
                                [side]: 0, width: '5%',
                                background: `linear-gradient(${i ? 270 : 90}deg,#3d0a0e,#7f1d1d 62%,transparent)`,
                                boxShadow: `inset ${i ? '' : '-'}11px 0 18px rgba(0,0,0,.55)` }}/>
                        ))}
                        {/* Corner frames */}
                        {[{ top: 5, left: 5 }, { top: 5, right: 5 }, { bottom: 5, left: 5 }, { bottom: 5, right: 5 }].map((p, i) => (
                            <div key={i} style={{ position: 'absolute', ...p, width: 15, height: 15,
                                borderTop: i < 2 ? '2px solid #facc15' : undefined,
                                borderBottom: i >= 2 ? '2px solid #facc15' : undefined,
                                borderLeft: i % 2 === 0 ? '2px solid #facc15' : undefined,
                                borderRight: i % 2 === 1 ? '2px solid #facc15' : undefined }}/>
                        ))}
                    </div>

                    {act && <Stage act={act} tick={tick}/>}

                    {/* Loading spinner — tiny, top-left */}
                    {loading && (
                        <div style={{ position: 'absolute', top: 8, left: 13, zIndex: 10,
                            display: 'flex', alignItems: 'center', gap: 4, pointerEvents: 'none' }}>
                            <div style={{ width: 8, height: 8, border: `2px solid ${color}40`,
                                borderTop: `2px solid ${color}`, borderRadius: '50%',
                                animation: 'cd-spin 1s linear infinite' }}/>
                            <span style={{ color: '#374151', fontSize: '.48rem' }}>loading audio…</span>
                        </div>
                    )}

                    {/* Audio bars */}
                    {isPlaying && !muted && (
                        <div style={{ position: 'absolute', top: 8, right: 10, zIndex: 10,
                            display: 'flex', gap: 2, alignItems: 'flex-end', height: 13, pointerEvents: 'none' }}>
                            {[0, 1, 2, 3].map(j => (
                                <div key={j} style={{ width: 3, background: color, borderRadius: 2,
                                    height: `${4 + 9 * Math.abs(Math.sin(tick * 0.13 + j * 0.9))}px`,
                                    transition: 'height .08s' }}/>
                            ))}
                        </div>
                    )}

                    {/* Act label */}
                    <div style={{ position: 'absolute', bottom: 6, left: 9, zIndex: 10, pointerEvents: 'none',
                        display: 'flex', gap: 5, alignItems: 'center' }}>
                        <span style={{ background: `${color}1c`, border: `1px solid ${color}60`, color,
                            borderRadius: 9999, padding: '1px 7px', fontSize: '.5rem',
                            fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                            {act ? LABEL[act.act_type] : ''}
                        </span>
                        <span style={{ color: 'rgba(226,232,240,.28)', fontSize: '.48rem' }}>{act?.act_title}</span>
                    </div>
                </div>

                {/* SUBTITLE */}
                <div style={{ flexShrink: 0, minHeight: 54, maxHeight: 86,
                    background: currentLine?.is_concept_reveal
                        ? 'linear-gradient(135deg,rgba(26,0,53,.98),rgba(10,0,24,.98))'
                        : 'rgba(4,0,12,.95)',
                    borderTop: `2px solid ${currentLine?.is_concept_reveal ? '#f0abfc44' : color + '2e'}`,
                    padding: '6px 14px',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    ...(currentLine?.is_concept_reveal ? { animation: 'cd-glow 3s ease-in-out infinite' } : {}) }}>
                    {currentLine ? (
                        <>
                            <span style={{ fontSize: '.5rem', fontWeight: 800, color: subColor,
                                opacity: .6, marginBottom: 2, letterSpacing: '.04em' }}>
                                {speakerTag}
                            </span>
                            <p key={`${actIdx}-${subIdx}`} style={{ margin: 0, color: subColor,
                                fontSize: 'clamp(.76rem,2.1vw,.93rem)', lineHeight: 1.52,
                                fontStyle: currentLine.speaker === 'narrator' ? 'italic' : 'normal',
                                fontWeight: currentLine.is_concept_reveal ? 700 : 500,
                                animation: 'cd-in .3s ease' }}>
                                {currentLine.text}
                            </p>
                        </>
                    ) : (
                        <p style={{ margin: 0, textAlign: 'center', color: '#1e293b',
                            fontSize: '.66rem', fontStyle: 'italic' }}>
                            {act?.setting?.place} · {act?.setting?.time_of_day}
                        </p>
                    )}
                </div>

                {/* CONTROL BAR */}
                <div style={{ flexShrink: 0, background: 'rgba(5,0,14,.99)',
                    borderTop: `1px solid ${color}18`,
                    padding: '5px 12px', display: 'flex', gap: 6, alignItems: 'center' }}>

                    <button onClick={() => { if (actIdx > 0) playAct(actIdx - 1); }}
                        disabled={actIdx === 0}
                        style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(148,163,184,.13)',
                            borderRadius: 6, padding: '4px 10px', color: actIdx === 0 ? '#1f2937' : '#94a3b8',
                            cursor: actIdx === 0 ? 'not-allowed' : 'pointer', fontSize: '.65rem',
                            fontWeight: 700, opacity: actIdx === 0 ? 0.3 : 1 }}>
                        ◀
                    </button>

                    <button onClick={() => {
                        if (isPlaying) stopAudio();
                        else playAct(actIdx);
                    }} style={{ background: `${color}20`, border: `1px solid ${color}60`,
                        borderRadius: 6, padding: '4px 12px', color, cursor: 'pointer', fontSize: '.88rem' }}>
                        {loading ? '⏳' : isPlaying ? '⏸' : '▶'}
                    </button>

                    <button onClick={() => { if (actIdx < lastIdx) playAct(actIdx + 1); else setShowEnd(true); }}
                        style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(148,163,184,.13)',
                            borderRadius: 6, padding: '4px 10px', color: '#94a3b8',
                            cursor: 'pointer', fontSize: '.65rem', fontWeight: 700 }}>
                        ▶
                    </button>

                    {/* Progress */}
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                            <span style={{ color, fontSize: '.5rem', fontWeight: 800 }}>
                                {act ? LABEL[act.act_type] : ''}
                            </span>
                            <span style={{ color: '#1f2937', fontSize: '.5rem' }}>{actIdx + 1}/{acts.length}</span>
                        </div>
                        <div style={{ height: 2.5, background: 'rgba(255,255,255,.07)', borderRadius: 9999 }}>
                            <div style={{ height: '100%', background: color, borderRadius: 9999,
                                width: `${((actIdx + 1) / acts.length) * 100}%`, transition: 'width .4s' }}/>
                        </div>
                    </div>

                    <button onClick={() => {
                        const next = !autoPlay;
                        setAutoPlay(next);
                        if (next && !isPlaying && !loading) playAct(actIdx);
                    }} style={{ background: autoPlay ? `${color}20` : 'rgba(255,255,255,.04)',
                        border: `1px solid ${autoPlay ? color + '55' : 'rgba(148,163,184,.12)'}`,
                        borderRadius: 6, padding: '4px 8px',
                        color: autoPlay ? color : '#4b5563', cursor: 'pointer',
                        fontSize: '.58rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
                        {autoPlay ? '⏸ AUTO' : '▶ AUTO'}
                    </button>

                    <button onClick={() => setMuted(m => !m)}
                        style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(148,163,184,.12)',
                            borderRadius: 6, padding: '4px 7px', color: muted ? '#4b5563' : '#94a3b8',
                            cursor: 'pointer', fontSize: '.78rem' }}>
                        {muted ? '🔇' : '🔊'}
                    </button>

                    <input type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume}
                        onChange={e => { const v = +e.target.value; setVolume(v); setMuted(v === 0); }}
                        style={{ width: 50, accentColor: color, cursor: 'pointer' }}/>
                </div>

                {/* CONCEPT BOARD */}
                {act?.concept_board?.title && (
                    <div style={{ flexShrink: 0, background: 'rgba(8,0,20,.99)',
                        borderTop: `1px solid ${color}1c`, padding: '4px 12px',
                        display: 'flex', gap: 10, alignItems: 'center', overflow: 'hidden' }}>
                        <span style={{ color, fontWeight: 900,
                            fontSize: 'clamp(.54rem,1.4vw,.66rem)', flexShrink: 0 }}>
                            {act.concept_board.title}
                        </span>
                        {act.concept_board.formula && (
                            <code style={{ color: '#f0abfc', fontSize: 'clamp(.6rem,1.5vw,.72rem)',
                                background: 'rgba(240,171,252,.07)', borderRadius: 4, padding: '1px 6px', flexShrink: 0 }}>
                                {act.concept_board.formula}
                            </code>
                        )}
                        {act.concept_board.tamil_analogy && (
                            <span style={{ color: '#fbbf24', fontSize: 'clamp(.52rem,1.3vw,.62rem)',
                                fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                🌾 {act.concept_board.tamil_analogy}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* ══════════════════════════════════════
                SCROLLABLE CONTENT
            ══════════════════════════════════════ */}
            <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(4,0,12,.99)' }}>

                {/* Transcript */}
                <div style={{ padding: '10px 13px 6px' }}>
                    <div style={{ color: '#1e293b', fontSize: '.52rem', fontWeight: 800,
                        letterSpacing: '.1em', marginBottom: 8, textTransform: 'uppercase' }}>Screenplay</div>
                    {acts.map((a, ai) => (
                        <div key={ai} style={{ marginBottom: 12, opacity: ai === actIdx ? 1 : 0.38, transition: 'opacity .4s' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5,
                                cursor: 'pointer' }} onClick={() => playAct(ai)}>
                                <span style={{ background: `${COLOR[a.act_type] ?? '#a78bfa'}1e`,
                                    border: `1px solid ${COLOR[a.act_type] ?? '#a78bfa'}50`,
                                    color: COLOR[a.act_type] ?? '#a78bfa',
                                    borderRadius: 9999, padding: '1px 7px',
                                    fontSize: '.5rem', fontWeight: 800, textTransform: 'uppercase' }}>
                                    {LABEL[a.act_type]}
                                </span>
                                <span style={{ color: 'rgba(226,232,240,.28)', fontSize: '.52rem' }}>{a.act_title}</span>
                                <span style={{ marginLeft: 'auto', color: '#1e293b', fontSize: '.5rem' }}>▶</span>
                            </div>
                            {a.screenplay.map((line, li) => {
                                const lc = line.speaker === 'narrator' ? '#7c3aed'
                                    : line.speaker === 'protagonist' ? '#92400e'
                                    : line.speaker === 'student_voice' ? '#1e40af' : '#701a75';
                                const isActive = ai === actIdx && li === subIdx;
                                return (
                                    <div key={li} style={{ display: 'flex', gap: 6, marginBottom: 4,
                                        padding: '3px 6px 3px 7px', borderRadius: 5,
                                        background: isActive ? `${COLOR[a.act_type] ?? '#a78bfa'}0e` : 'transparent',
                                        borderLeft: `2px solid ${isActive ? (COLOR[a.act_type] ?? '#a78bfa') + 'cc' : lc + '33'}`,
                                        transition: 'all .25s' }}>
                                        <span style={{ color: '#334155', fontSize: '.5rem', flexShrink: 0, paddingTop: 1 }}>
                                            {line.speaker === 'narrator' ? '🎙'
                                                : line.speaker === 'protagonist' ? (cinema.protagonist?.avatar_emoji ?? '🧑')
                                                : line.speaker === 'student_voice' ? '🎓' : '💡'}
                                        </span>
                                        <span style={{ color: isActive ? '#e2e8f0' : '#4b5563',
                                            fontSize: 'clamp(.66rem,1.7vw,.78rem)', lineHeight: 1.48,
                                            fontStyle: line.speaker === 'narrator' ? 'italic' : 'normal',
                                            fontWeight: isActive ? 700 : 400, transition: 'all .25s' }}>
                                            {line.text}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Exam + Quiz after last act */}
                {showEnd && (
                    <div style={{ padding: '10px 13px 40px' }}>
                        <div style={{ height: 1,
                            background: `linear-gradient(90deg,transparent,${color}55,transparent)`,
                            marginBottom: 14 }}/>

                        {/* Exam spotlight */}
                        <div style={{ background: 'rgba(255,255,255,.02)',
                            border: '1px solid rgba(167,139,250,.18)',
                            borderRadius: 13, padding: '13px 15px', marginBottom: 12,
                            animation: 'cd-up .5s ease' }}>
                            <h3 style={{ color: '#fff', fontWeight: 900,
                                fontSize: 'clamp(.84rem,2.5vw,1.05rem)', marginBottom: 11 }}>
                                📝 TN Board Exam Spotlight
                            </h3>
                            <div style={{ color: '#a78bfa', fontSize: '.56rem', fontWeight: 800,
                                letterSpacing: '.1em', marginBottom: 4 }}>MOST ASKED QUESTION</div>
                            <div style={{ background: 'rgba(168,85,247,.08)',
                                border: '1px solid rgba(168,85,247,.28)', borderRadius: 9,
                                padding: '9px 11px', color: '#f1f5f9', marginBottom: 11,
                                lineHeight: 1.58, fontSize: 'clamp(.74rem,1.9vw,.86rem)' }}>
                                {cinema.exam_spotlight?.most_asked_question}
                            </div>
                            <div style={{ color: '#a78bfa', fontSize: '.56rem', fontWeight: 800,
                                letterSpacing: '.1em', marginBottom: 7 }}>MODEL ANSWER STRUCTURE</div>
                            {(cinema.exam_spotlight?.model_answer_structure ?? []).map((s, i) => (
                                <div key={i} style={{ display: 'flex', gap: 7, marginBottom: 6 }}>
                                    <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: '50%',
                                        background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                                        color: '#fff', fontWeight: 900, fontSize: '.6rem',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {i + 1}
                                    </span>
                                    <span style={{ color: '#e2e8f0', lineHeight: 1.5,
                                        fontSize: 'clamp(.72rem,1.8vw,.84rem)', paddingTop: 1 }}>{s}</span>
                                </div>
                            ))}
                            <div style={{ marginTop: 9, display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                                <span style={{ background: 'rgba(34,197,94,.09)',
                                    border: '1px solid rgba(34,197,94,.32)', color: '#86efac',
                                    borderRadius: 9999, padding: '4px 10px', fontWeight: 700, fontSize: '.72rem' }}>
                                    🎯 {cinema.exam_spotlight?.marks_tip}
                                </span>
                                {cinema.exam_spotlight?.previous_year_hint && (
                                    <span style={{ color: '#fbbf24', fontStyle: 'italic', fontSize: '.74rem', alignSelf: 'center' }}>
                                        📅 {cinema.exam_spotlight.previous_year_hint}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Quiz */}
                        <div style={{ background: 'rgba(255,255,255,.02)',
                            border: '1px solid rgba(148,163,184,.1)',
                            borderRadius: 13, padding: '13px 15px', marginBottom: 12,
                            animation: 'cd-up .6s ease' }}>
                            <h3 style={{ color: '#fff', fontWeight: 900,
                                fontSize: 'clamp(.84rem,2.5vw,1.05rem)', marginBottom: 13 }}>🎯 Quiz</h3>
                            <Quiz items={cinema.quiz ?? []}/>
                        </div>

                        <div style={{ textAlign: 'center', paddingTop: 4, animation: 'cd-up .7s ease' }}>
                            <button onClick={onTryAnother}
                                style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                                    color: '#fff', border: 'none', borderRadius: 11,
                                    padding: '10px 24px', fontWeight: 900, fontSize: '.86rem', cursor: 'pointer' }}>
                                🎬 New Cinema
                            </button>
                        </div>
                    </div>
                )}

                {!showEnd && (
                    <div style={{ padding: '6px 13px 10px', textAlign: 'center',
                        color: '#1e293b', fontSize: '.52rem' }}>
                        {actIdx < lastIdx
                            ? `${lastIdx - actIdx} act${lastIdx - actIdx === 1 ? '' : 's'} remaining`
                            : 'Last act — exam + quiz appear below after completion'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CinemaDisplay;
