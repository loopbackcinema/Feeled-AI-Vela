/**
 * CinemaDisplay.tsx — மாயக் கற்றல் திரையரங்கம் v6
 *
 * ARCHITECTURE (rebuilt from scratch):
 * ─────────────────────────────────────
 * THEATRE (top 55vh, permanent, never disappears)
 *   ├── Stage: animated SVG fills entire area
 *   ├── Subtitle bar: current line as movie subtitle
 *   └── Control bar: ◀ ▶ AUTO MUTE FULLSCREEN
 *
 * BELOW THEATRE (scrollable)
 *   ├── Concept board for current act
 *   ├── Full transcript (all acts)
 *   └── Quiz + Exam spotlight (after last act)
 *
 * AUDIO:
 *   Sequential generation — Act 1 generates first → plays → Act 2 generates → plays
 *   One fetch per act. No parallel calls (avoids Vercel rate limit).
 *   Audio plays AUTOMATICALLY on cinema open. No manual click needed.
 *
 * AUTOPLAY (default ON):
 *   Each line shown for ~3.5s, audio plays concurrently.
 *   When all lines done → next act starts automatically.
 *   Student can pause/resume, go prev/next manually.
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
    hook:'Act 1 · Hook', rising_action:'Act 2 · Rising Action',
    climax:'Act 3 · Climax', resolution:'Act 4 · Resolution', exam_bridge:'Act 5 · Exam Bridge',
};
const STAGE_BG: Record<CinemaActType, string> = {
    hook:          'radial-gradient(ellipse at 38% 40%,#1c0540 0%,#04000e 72%)',
    rising_action: 'radial-gradient(ellipse at 62% 30%,#000d30 0%,#04000e 72%)',
    climax:        'radial-gradient(ellipse at 50% 35%,#250008 0%,#04000e 72%)',
    resolution:    'radial-gradient(ellipse at 45% 40%,#001e0a 0%,#04000e 72%)',
    exam_bridge:   'radial-gradient(ellipse at 50% 35%,#0e0028 0%,#04000e 72%)',
};

// ── SVG Stage Scene ───────────────────────────────────────────────────────────
// Renders concept-specific animated SVG based on act keywords
function Stage({ act, tick }: { act: CinemaAct; tick: number }) {
    const c = COLOR[act.act_type] ?? '#a78bfa';
    const txt = (act.stage_elements ?? []).map(e => `${e.name} ${e.description}`).join(' ').toLowerCase()
        + ' ' + act.screenplay.map(l => l.text).join(' ').toLowerCase();

    // Concept detection
    const isPhysicsForce  = /force|inertia|newton|push|pull|momentum|f=ma|mass|accelerat/.test(txt);
    const isWave          = /wave|light|sound|frequency|amplitude|λ|wavelength|optic|electro/.test(txt);
    const isCell          = /cell|nucleus|chloro|mitochond|biology|organ|tissue|membrane/.test(txt);
    const isChemistry     = /molecule|bond|react|compound|atom|element|valence|periodic/.test(txt);
    const isElectricity   = /current|circuit|voltage|resistance|ohm|electric|battery|conductor/.test(txt);
    const isGravity       = /gravity|orbit|planet|satellite|moon|earth|solar|stellar/.test(txt);
    const isMath          = /equation|function|graph|parabola|trigon|calculus|integral|algebr/.test(txt);
    const isThermo        = /heat|temperature|thermodynam|entropy|energy|carnot|kelvin/.test(txt);

    // Character emoji
    const chars = (act.stage_elements ?? []).filter(e =>
        ['character','object','prop'].includes(e.element_type) ||
        !['formula','diagram','label','effect'].includes(e.element_type)
    );
    function emoji(name: string) {
        const n = name.toLowerCase();
        if (/newton/.test(n)) return '🧑‍🔬';
        if (/einstein/.test(n)) return '👨‍🔬';
        if (/raman/.test(n)) return '🔬';
        if (/ramanujan/.test(n)) return '📐';
        if (/curie/.test(n)) return '⚗️';
        if (/mendel|darwin/.test(n)) return '🌱';
        if (/student|மாணவ/.test(n)) return '🎓';
        if (/teacher|ஆசிரிய/.test(n)) return '👩‍🏫';
        if (/apple|ஆப்பிள்/.test(n)) return '🍎';
        if (/sun|சூரிய/.test(n)) return '☀️';
        if (/moon|நிலா/.test(n)) return '🌙';
        if (/earth|பூமி/.test(n)) return '🌍';
        if (/stone|rock|weight|ball/.test(n)) return '🪨';
        if (/car|bus|vehicle/.test(n)) return '🚌';
        if (/rocket/.test(n)) return '🚀';
        if (/book/.test(n)) return '📖';
        if (/bulb|lamp/.test(n)) return '💡';
        if (/magnet/.test(n)) return '🧲';
        if (/water|river/.test(n)) return '💧';
        return '✨';
    }

    const t = tick * 0.05;
    const cpos = [
        { x: 90,  y: 150 },
        { x: 310, y: 143 },
        { x: 200, y: 162 },
    ];

    return (
        <svg viewBox="0 0 400 280" width="100%" height="100%"
            style={{ position: 'absolute', inset: 0 }} xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="g1" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={c} stopOpacity="0.16"/>
                    <stop offset="100%" stopColor={c} stopOpacity="0"/>
                </radialGradient>
                <filter id="f3"><feGaussianBlur stdDeviation="3"/></filter>
                <filter id="f6"><feGaussianBlur stdDeviation="6"/></filter>
                <filter id="f1"><feGaussianBlur stdDeviation="1.2"/></filter>
                <marker id="arr" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                    <polygon points="0 0,8 3,0 6" fill={c}/>
                </marker>
                <marker id="arr2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                    <polygon points="0 0,8 3,0 6" fill="#60a5fa"/>
                </marker>
            </defs>

            {/* Ambient */}
            <ellipse cx="200" cy="138" rx="178" ry="112" fill="url(#g1)"
                opacity={0.5 + 0.12 * Math.sin(t)}/>

            {/* Stars */}
            {[[25,20],[378,35],[10,202],[390,182],[200,10],[92,48],[318,55],[48,145],[345,135]].map(([x,y],i) => (
                <circle key={i} cx={x} cy={y} r={0.7 + (i%3)*0.5} fill="white"
                    opacity={0.16 + 0.3*Math.sin(t*1.1+i*1.3)}/>
            ))}

            {/* ── PHYSICS: FORCE / NEWTON ── */}
            {isPhysicsForce && !isGravity && (() => {
                const objX = 190 + 18 * Math.sin(t * 0.7);
                const forceLen = 65 + 15 * Math.sin(t * 0.8);
                return (<>
                    {/* Ground */}
                    <line x1="60" y1="195" x2="340" y2="195" stroke="#334155" strokeWidth="1.5"/>
                    {/* Object */}
                    <rect x={objX-22} y="165" width="44" height="28" rx="5"
                        fill={`${c}18`} stroke={c} strokeWidth="1.8"/>
                    {/* mass label */}
                    <text x={objX} y="183" fill={c} fontSize="10" textAnchor="middle" fontWeight="bold">m</text>
                    {/* Force arrow */}
                    <line x1={objX - forceLen - 22} y1="179" x2={objX - 24} y2="179"
                        stroke={c} strokeWidth="3.5" markerEnd="url(#arr)"/>
                    <line x1={objX - forceLen - 22} y1="179" x2={objX - 24} y2="179"
                        stroke={c} strokeWidth="9" filter="url(#f3)" opacity="0.2"/>
                    <text x={objX - forceLen/2 - 22} y="168" fill={c} fontSize="11" textAnchor="middle" fontWeight="bold">F</text>
                    {/* Acceleration arrow */}
                    <line x1={objX + 26} y1="179" x2={objX + 82} y2="179"
                        stroke="#60a5fa" strokeWidth="2.5" markerEnd="url(#arr2)" strokeDasharray="5 3"/>
                    <text x={objX + 55} y="168" fill="#60a5fa" fontSize="10" textAnchor="middle">a</text>
                    {/* F=ma formula */}
                    <rect x="140" y="205" width="120" height="28" rx="8"
                        fill="rgba(0,0,10,0.7)" stroke={c} strokeWidth="1.2" strokeOpacity="0.5"/>
                    <text x="200" y="224" fill="#f0abfc" fontSize="13" textAnchor="middle"
                        fontFamily="ui-monospace,monospace" fontWeight="bold">F = ma</text>
                </>);
            })()}

            {/* ── WAVE / LIGHT / SOUND ── */}
            {isWave && (() => {
                const wave1 = Array.from({length:24}, (_,j) =>
                    `${22+j*15},${115+Math.sin(j*0.52+t*1.2)*30}`).join(' ');
                const wave2 = Array.from({length:24}, (_,j) =>
                    `${22+j*15},${165+Math.sin(j*0.52+t*1.2+Math.PI)*20}`).join(' ');
                return (<>
                    <polyline points={wave1} fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round"/>
                    <polyline points={wave1} fill="none" stroke="#34d399" strokeWidth="7" filter="url(#f3)" opacity="0.18"/>
                    <polyline points={wave2} fill="none" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" opacity="0.6"/>
                    {/* wavelength */}
                    <line x1="22" y1="200" x2="77" y2="200" stroke="#6ee7b7" strokeWidth="1" strokeDasharray="2 2"/>
                    <line x1="22" y1="197" x2="22" y2="203" stroke="#6ee7b7" strokeWidth="1"/>
                    <line x1="77" y1="197" x2="77" y2="203" stroke="#6ee7b7" strokeWidth="1"/>
                    <text x="49" y="213" fill="#6ee7b7" fontSize="10" textAnchor="middle">λ</text>
                    {/* amplitude */}
                    <line x1="375" y1="115" x2="375" y2="85" stroke="#fbbf24" strokeWidth="1" strokeDasharray="2 2"/>
                    <text x="381" y="104" fill="#fbbf24" fontSize="9">A</text>
                    {/* formula */}
                    <rect x="130" y="220" width="140" height="24" rx="7"
                        fill="rgba(0,0,10,0.75)" stroke="#34d399" strokeWidth="1" strokeOpacity="0.5"/>
                    <text x="200" y="236" fill="#86efac" fontSize="11" textAnchor="middle"
                        fontFamily="ui-monospace,monospace">v = fλ</text>
                </>);
            })()}

            {/* ── CELL BIOLOGY ── */}
            {isCell && (() => {
                const b = 1 + 0.04*Math.sin(t*0.9);
                return (
                    <g transform={`translate(200,130) scale(${b})`}>
                        {/* cell membrane */}
                        <ellipse cx="0" cy="0" rx="85" ry="62"
                            fill="rgba(52,211,153,0.05)" stroke="#34d399" strokeWidth="2"/>
                        {/* nucleus */}
                        <ellipse cx="8" cy="-5" rx="30" ry="22"
                            fill="rgba(134,239,172,0.1)" stroke="#86efac" strokeWidth="1.5"/>
                        <text x="8" y="-2" fill="#86efac" fontSize="8" textAnchor="middle" opacity="0.7">nucleus</text>
                        {/* mitochondria */}
                        {[[-45,22],[-55,-8],[35,30],[48,-18]].map(([ox,oy],i) => (
                            <ellipse key={i} cx={ox} cy={oy} rx="9" ry="5"
                                fill="rgba(251,146,60,0.5)"
                                opacity={0.55+0.3*Math.sin(t+i*0.9)}/>
                        ))}
                        {/* chloroplasts */}
                        {[[-30,-35],[20,-30],[-60,5]].map(([ox,oy],i) => (
                            <ellipse key={i} cx={ox} cy={oy} rx="8" ry="5"
                                fill="rgba(34,197,94,0.6)"
                                opacity={0.5+0.3*Math.sin(t*1.1+i)}/>
                        ))}
                        {/* vacuole */}
                        <ellipse cx="30" cy="20" rx="16" ry="12"
                            fill="rgba(96,165,250,0.15)" stroke="#60a5fa" strokeWidth="0.8"/>
                    </g>
                );
            })()}

            {/* ── CHEMISTRY / MOLECULES ── */}
            {isChemistry && !isCell && (() => {
                const w = Math.sin(t * 0.8) * 5;
                const atoms: [number,number,string,number,string][] = [
                    [200,128,'#f43f5e',14,'O'],
                    [155,158,'#60a5fa',12,'H'],
                    [245,158,'#60a5fa',12,'H'],
                    [200,95,'#34d399',10,''],
                ];
                return (<>
                    <line x1="200" y1={128+w} x2="155" y2={158+w} stroke="#94a3b8" strokeWidth="2.5" opacity="0.7"/>
                    <line x1="200" y1={128+w} x2="245" y2={158+w} stroke="#94a3b8" strokeWidth="2.5" opacity="0.7"/>
                    {atoms.map(([ax,ay,ac,r,label],i) => (<g key={i}>
                        <circle cx={ax} cy={Number(ay)+w*(i%2===0?0.5:1)} r={r}
                            fill={String(ac)} opacity="0.88" filter="url(#f3)"/>
                        <circle cx={ax} cy={Number(ay)+w*(i%2===0?0.5:1)} r={r*0.7}
                            fill={String(ac)} opacity="0.95"/>
                        {label && <text x={ax} y={Number(ay)+w*(i%2===0?0.5:1)+4}
                            fill="white" fontSize="9" textAnchor="middle" fontWeight="bold">{label}</text>}
                    </g>))}
                    {/* electron cloud */}
                    <ellipse cx="200" cy={130+w*0.3} rx="70" ry="50"
                        fill="none" stroke={c} strokeWidth="0.8" strokeOpacity="0.2" strokeDasharray="3 3"/>
                    <rect x="125" y="210" width="150" height="24" rx="7"
                        fill="rgba(0,0,10,0.75)" stroke={c} strokeWidth="1" strokeOpacity="0.5"/>
                    <text x="200" y="226" fill="#f0abfc" fontSize="11" textAnchor="middle"
                        fontFamily="ui-monospace,monospace">H₂O — 2H⁺ + O²⁻</text>
                </>);
            })()}

            {/* ── ELECTRICITY / CIRCUITS ── */}
            {isElectricity && (() => {
                const flow = (t * 40) % 200;
                return (<>
                    {/* Circuit rectangle */}
                    <rect x="80" y="90" width="240" height="110" rx="8"
                        fill="none" stroke="#334155" strokeWidth="2"/>
                    {/* Battery */}
                    <rect x="80" y="130" width="4" height="30" fill="#fbbf24"/>
                    <rect x="88" y="125" width="4" height="40" fill="#fbbf24" opacity="0.6"/>
                    <text x="70" y="148" fill="#fbbf24" fontSize="9" textAnchor="middle">+</text>
                    <text x="70" y="168" fill="#60a5fa" fontSize="9" textAnchor="middle">-</text>
                    {/* Resistor */}
                    {Array.from({length:6},(_,i)=>(
                        <line key={i} x1={200+i*8} y1={i%2===0?90:80} x2={208+i*8} y2={i%2===0?80:90}
                            stroke={c} strokeWidth="2"/>
                    ))}
                    {/* Bulb */}
                    <circle cx="320" cy="145" r="16" fill="rgba(251,191,36,0.15)"
                        stroke="#fbbf24" strokeWidth="1.5"
                        opacity={0.5 + 0.5*Math.abs(Math.sin(t*2))}/>
                    <circle cx="320" cy="145" r="10" fill="#fde68a"
                        filter="url(#f1)" opacity={0.3 + 0.6*Math.abs(Math.sin(t*2))}/>
                    {/* Electron flow */}
                    <circle cx={80 + (flow % 240)} cy="90" r="4"
                        fill="#60a5fa" opacity="0.9" filter="url(#f1)"/>
                    <text x="200" y="225" fill="#94a3b8" fontSize="10" textAnchor="middle">V = IR</text>
                </>);
            })()}

            {/* ── GRAVITY / ORBITS ── */}
            {isGravity && (() => {
                const a1 = t * 0.9, a2 = t * 0.55;
                return (<>
                    {/* Sun / central body */}
                    <circle cx="200" cy="130" r={16+2*Math.sin(t*0.8)} fill="#fbbf24" opacity="0.95"
                        filter="url(#f3)"/>
                    <circle cx="200" cy="130" r="13" fill="#fcd34d"/>
                    {/* Orbit 1 */}
                    <ellipse cx="200" cy="130" rx="80" ry="38" fill="none"
                        stroke={c} strokeWidth="0.9" strokeOpacity="0.3" strokeDasharray="4 4"/>
                    <circle cx={200+80*Math.cos(a1)} cy={130+38*Math.sin(a1)} r="9"
                        fill="#60a5fa" filter="url(#f1)"/>
                    {/* Orbit 2 */}
                    <ellipse cx="200" cy="130" rx="118" ry="56" fill="none"
                        stroke="#60a5fa" strokeWidth="0.9" strokeOpacity="0.2" strokeDasharray="4 4"/>
                    <circle cx={200+118*Math.cos(-a2)} cy={130+56*Math.sin(-a2)} r="6"
                        fill="#f43f5e" filter="url(#f1)"/>
                    {/* Gravity vector */}
                    <line x1={200+80*Math.cos(a1)} y1={130+38*Math.sin(a1)}
                        x2={200+60*Math.cos(a1)} y2={130+30*Math.sin(a1)}
                        stroke={c} strokeWidth="1.5" markerEnd="url(#arr)" opacity="0.6"/>
                    <text x="200" y="215" fill="#fcd34d" fontSize="10" textAnchor="middle"
                        fontFamily="ui-monospace,monospace">F = GMm/r²</text>
                </>);
            })()}

            {/* ── MATHEMATICS ── */}
            {isMath && !isPhysicsForce && !isWave && (() => {
                const pts = Array.from({length:40},(_,i)=>{
                    const x = -4 + i * 0.2;
                    const y = x * x;
                    return `${50+i*7.5},${240-y*8}`;
                }).join(' ');
                return (<>
                    {/* Axes */}
                    <line x1="50" y1="240" x2="340" y2="240" stroke="#475569" strokeWidth="1.5" markerEnd="url(#arr)"/>
                    <line x1="50" y1="240" x2="50" y2="70" stroke="#475569" strokeWidth="1.5" markerEnd="url(#arr)"/>
                    <text x="348" y="244" fill="#64748b" fontSize="9">x</text>
                    <text x="43" y="66" fill="#64748b" fontSize="9">y</text>
                    {/* Curve */}
                    <polyline points={pts} fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
                    <polyline points={pts} fill="none" stroke={c} strokeWidth="7" filter="url(#f3)" opacity="0.15"/>
                    {/* Moving point */}
                    {(() => {
                        const x = -4 + (tick % 40) * 0.2;
                        const y = x * x;
                        const px = 50 + (tick % 40) * 7.5;
                        const py = 240 - y * 8;
                        return <circle cx={px} cy={py} r="5" fill="#fbbf24" filter="url(#f1)"/>;
                    })()}
                    <text x="200" y="210" fill={c} fontSize="12" textAnchor="middle"
                        fontFamily="ui-monospace,monospace">y = x²</text>
                </>);
            })()}

            {/* ── THERMODYNAMICS ── */}
            {isThermo && (() => {
                const heat = 0.5 + 0.5*Math.sin(t*0.8);
                return (<>
                    {/* Container */}
                    <rect x="120" y="90" width="160" height="130" rx="8"
                        fill={`rgba(251,113,133,${0.04+heat*0.08})`} stroke="#f43f5e" strokeWidth="1.5"/>
                    {/* Particles moving faster as heat increases */}
                    {Array.from({length:12},(_,i)=>{
                        const px = 130 + ((i*37 + tick*(1+heat)*2) % 140);
                        const py = 100 + ((i*29 + tick*(1+heat)*1.5) % 110);
                        return <circle key={i} cx={px} cy={py} r={3+heat*2}
                            fill={c} opacity={0.5+heat*0.4}/>;
                    })}
                    {/* Temperature gauge */}
                    <rect x="295" y="100" width="12" height="100" rx="6"
                        fill="rgba(30,0,60,0.6)" stroke="#64748b" strokeWidth="1"/>
                    <rect x="295" y={200-heat*90} width="12" height={heat*90+10} rx="6"
                        fill="#f43f5e"/>
                    <text x="301" y="215" fill="#f87171" fontSize="8" textAnchor="middle">T</text>
                    <text x="200" y="240" fill={c} fontSize="11" textAnchor="middle"
                        fontFamily="ui-monospace,monospace">ΔU = Q - W</text>
                </>);
            })()}

            {/* ── DEFAULT: Elegant concept particle system ── */}
            {!isPhysicsForce && !isWave && !isCell && !isChemistry && !isElectricity && !isGravity && !isMath && !isThermo && (
                <>
                    {/* Central concept glow */}
                    <circle cx="200" cy="128" r={22+5*Math.sin(t*0.7)} fill={c}
                        opacity={0.12} filter="url(#f6)"/>
                    <circle cx="200" cy="128" r={12+3*Math.sin(t*0.7)} fill={c} opacity="0.7"/>
                    {/* Orbiting particles */}
                    {[0,51,103,154,205,257,308].map((deg,i)=>{
                        const r2 = deg*Math.PI/180 + t*0.6;
                        const radius = 52 + 18*Math.sin(t*0.5+i*0.7);
                        return (
                            <circle key={i}
                                cx={200+radius*Math.cos(r2)}
                                cy={128+radius*0.55*Math.sin(r2)}
                                r={3.5+1.5*Math.sin(t*0.8+i)}
                                fill={c} opacity={0.4+0.35*Math.sin(t*0.6+i*0.8)}/>
                        );
                    })}
                    {/* Connecting lines */}
                    {[0,1,2].map(i=>{
                        const r2 = i*2.09 + t*0.6;
                        const radius = 52;
                        return (
                            <line key={i}
                                x1="200" y1="128"
                                x2={200+radius*Math.cos(r2)}
                                y2={128+radius*0.55*Math.sin(r2)}
                                stroke={c} strokeWidth="0.8" strokeOpacity="0.3"/>
                        );
                    })}
                </>
            )}

            {/* ── CHARACTER EMOJIS ── */}
            {chars.slice(0,3).map((el,i)=>{
                const pos = cpos[i] ?? {x:200,y:155};
                const fy = Math.sin(t*0.7+i*1.2)*7;
                const em = emoji(el.name);
                const sz = /teacher|student|scientist|newton|einstein|raman|ramanujan|curie|mendel|darwin/.test(el.name.toLowerCase()) ? 46 : 36;
                return (
                    <g key={i}>
                        {el.highlight && <circle cx={pos.x} cy={pos.y+fy} r={sz*0.8}
                            fill="none" stroke={c} strokeWidth="1.5"
                            strokeOpacity={0.4+0.28*Math.sin(t*0.7)} filter="url(#f3)"/>}
                        <text x={pos.x} y={pos.y+fy+sz*0.38} fontSize={sz}
                            textAnchor="middle" style={{userSelect:'none'}}>{em}</text>
                    </g>
                );
            })}

            {/* Climax dramatic spotlight */}
            {act.act_type==='climax' && (
                <ellipse cx={200+25*Math.cos(t*0.5)} cy="276" rx="50" ry="16"
                    fill={c} opacity={0.07+0.05*Math.sin(t*0.6)} filter="url(#f6)"/>
            )}
        </svg>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
const CinemaDisplay: React.FC<Props> = ({ cinema, language, onTryAnother }) => {
    const { user, userProfile } = useAuth();
    const containerRef = useRef<HTMLDivElement>(null);
    const acts = cinema.acts ?? [];
    const lastIdx = acts.length - 1;

    // ── State ─────────────────────────────────────────────────────────────────
    const [actIdx,    setActIdx]    = useState(0);
    const [subIdx,    setSubIdx]    = useState(0);
    const [autoPlay,  setAutoPlay]  = useState(true);  // DEFAULT ON
    const [muted,     setMuted]     = useState(false);
    const [volume,    setVolume]    = useState(0.9);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioLoading, setAudioLoading] = useState(false);
    const [showEnd,   setShowEnd]   = useState(false);
    const [tick,      setTick]      = useState(0);
    const [isFS,      setIsFS]      = useState(false);

    // Audio cache & refs
    const cache = useRef<Record<number, string>>({});   // actIdx → base64
    const ctxRef = useRef<AudioContext | null>(null);
    const srcRef = useRef<AudioBufferSourceNode | null>(null);
    const gainRef = useRef<GainNode | null>(null);
    const subTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const act   = acts[actIdx];
    const lines = act?.screenplay ?? [];
    const color = act ? COLOR[act.act_type] : '#a78bfa';
    const currentLine = lines[subIdx] ?? null;

    // ── Animation ─────────────────────────────────────────────────────────────
    useEffect(() => {
        const id = setInterval(() => setTick(t => t+1), 50);
        return () => clearInterval(id);
    }, []);

    // ── Audio context ─────────────────────────────────────────────────────────
    const getCtx = useCallback(() => {
        if (!ctxRef.current || ctxRef.current.state === 'closed') {
            ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            gainRef.current = ctxRef.current.createGain();
            gainRef.current.connect(ctxRef.current.destination);
        }
        return ctxRef.current;
    }, []);

    const stopAudio = useCallback(() => {
        if (srcRef.current) { try { srcRef.current.stop(); } catch (_) {} srcRef.current = null; }
        setIsPlaying(false);
    }, []);

    // Play cached audio — calls onEnded when done
    const playAudio = useCallback((b64: string, onEnded?: () => void) => {
        stopAudio();
        if (muted) { onEnded?.(); return; }
        try {
            const ctx = getCtx();
            if (ctx.state === 'suspended') ctx.resume();
            gainRef.current!.gain.value = volume;
            const buf = makePCMBuffer(b64ToBytes(b64), ctx);
            const src = ctx.createBufferSource();
            src.buffer = buf;
            src.connect(gainRef.current!);
            src.onended = () => { setIsPlaying(false); onEnded?.(); };
            src.start();
            srcRef.current = src;
            setIsPlaying(true);
        } catch (_) { onEnded?.(); }
    }, [muted, volume, stopAudio, getCtx]);

    // ── Subtitle ticker ───────────────────────────────────────────────────────
    const startSubTicker = useCallback((lineCount: number, intervalMs: number, onDone: () => void) => {
        if (subTimerRef.current) clearInterval(subTimerRef.current);
        let idx = 0;
        setSubIdx(0);
        subTimerRef.current = setInterval(() => {
            idx++;
            if (idx >= lineCount) {
                clearInterval(subTimerRef.current!);
                subTimerRef.current = null;
                onDone();
            } else {
                setSubIdx(idx);
            }
        }, intervalMs);
    }, []);

    // ── Fetch audio for one act (sequential — NOT parallel) ───────────────────
    const fetchAudio = useCallback(async (idx: number): Promise<string | null> => {
        if (cache.current[idx]) return cache.current[idx];
        const a = acts[idx];
        if (!a) return null;

        // Narrator + concept lines only — shorter = faster + cheaper
        const text = a.screenplay
            .filter(l => l.speaker === 'narrator' || l.is_concept_reveal || l.speaker === 'concept_voice')
            .map(l => l.text).join('. ');
        const safe = text.slice(0, 450);
        if (!safe.trim()) return null;

        const voice = language === 'Tamil' ? 'Female' : (a.act_type === 'climax' ? 'Male' : 'Female');
        const tone  = a.act_type === 'climax' ? 'dramatic'
            : a.act_type === 'hook' ? 'curious and engaging'
            : a.act_type === 'resolution' ? 'warm'
            : 'clear and educational';

        setAudioLoading(true);
        try {
            const res = await fetch('/api/audio', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullStoryText: safe, language, narratorVoice: voice, emotionTone: tone }),
            });
            if (!res.ok) return null;
            const { base64Audio } = await res.json();
            if (base64Audio) cache.current[idx] = base64Audio;
            return base64Audio ?? null;
        } catch (_) { return null; }
        finally { setAudioLoading(false); }
    }, [acts, language]);

    // ── Play an act: fetch audio + run subtitles + auto-advance ──────────────
    const playAct = useCallback(async (idx: number) => {
        if (idx > lastIdx) { setShowEnd(true); return; }
        setActIdx(idx);
        setSubIdx(0);
        stopAudio();
        if (subTimerRef.current) clearInterval(subTimerRef.current);
        if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);

        const a = acts[idx];
        if (!a) return;
        const lineCount = a.screenplay.length;

        // Fetch audio (non-blocking for subtitles)
        fetchAudio(idx).then(b64 => {
            if (!b64) return;
            // Audio duration unknown → just play; subtitles run on their own timer
            playAudio(b64);
        });

        // Subtitle ticker: spread lines evenly over ~12s (or adjust to feel right)
        const lineDuration = 3800; // ms per line
        if (autoPlay) {
            startSubTicker(lineCount, lineDuration, () => {
                // After last line: move to next act after 1.5s pause
                autoAdvanceRef.current = setTimeout(() => playAct(idx + 1), 1500);
            });
        }
    }, [acts, lastIdx, autoPlay, stopAudio, fetchAudio, playAudio, startSubTicker]);

    // ── Auto-start on mount ───────────────────────────────────────────────────
    useEffect(() => {
        playAct(0);
        return () => {
            stopAudio();
            if (subTimerRef.current) clearInterval(subTimerRef.current);
            if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
        };
    }, []); // eslint-disable-line

    // ── Toggle autoplay ───────────────────────────────────────────────────────
    const toggleAutoPlay = useCallback(() => {
        setAutoPlay(a => {
            if (!a) {
                // Turning ON: resume from current act
                playAct(actIdx);
            } else {
                // Turning OFF: stop sub ticker and auto-advance
                if (subTimerRef.current) clearInterval(subTimerRef.current);
                if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
            }
            return !a;
        });
    }, [actIdx, playAct]);

    // ── Manual nav ────────────────────────────────────────────────────────────
    const goPrev = useCallback(() => { if (actIdx > 0) playAct(actIdx - 1); }, [actIdx, playAct]);
    const goNext = useCallback(() => {
        if (actIdx < lastIdx) playAct(actIdx + 1);
        else setShowEnd(true);
    }, [actIdx, lastIdx, playAct]);

    // ── Fullscreen ────────────────────────────────────────────────────────────
    const enterFS = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;
        (el.requestFullscreen ?? (el as any).webkitRequestFullscreen)?.call(el).catch(()=>{});
    }, []);
    const exitFS = useCallback(() => {
        (document.exitFullscreen ?? (document as any).webkitExitFullscreen)?.call(document).catch(()=>{});
    }, []);

    useEffect(() => {
        // Auto-fullscreen
        setTimeout(enterFS, 200);
        const fn = () => setIsFS(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', fn);
        document.addEventListener('webkitfullscreenchange', fn);
        return () => {
            document.removeEventListener('fullscreenchange', fn);
            document.removeEventListener('webkitfullscreenchange', fn);
            if (document.fullscreenElement) exitFS();
        };
    }, [enterFS, exitFS]);

    // ── Volume ────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (gainRef.current) gainRef.current.gain.value = muted ? 0 : volume;
    }, [volume, muted]);

    // ── Subtitle colours ──────────────────────────────────────────────────────
    const subColor = !currentLine ? '#64748b'
        : currentLine.is_concept_reveal ? '#f0abfc'
        : currentLine.speaker === 'narrator' ? '#c4b5fd'
        : currentLine.speaker === 'protagonist' ? '#fde68a'
        : currentLine.speaker === 'student_voice' ? '#bfdbfe'
        : '#f0abfc';

    const speakerLabel = !currentLine ? ''
        : currentLine.is_concept_reveal ? '✦ CONCEPT REVEAL ✦'
        : currentLine.speaker === 'narrator' ? '🎙 Narrator'
        : currentLine.speaker === 'protagonist' ? `${cinema.protagonist?.avatar_emoji ?? '🧑'} ${cinema.protagonist?.name ?? ''}`
        : currentLine.speaker === 'student_voice' ? '🎓 Student'
        : `${cinema.protagonist?.avatar_emoji ?? '🧑'} ${currentLine.speaker}`;

    const studentName = userProfile?.displayName || user?.displayName || 'Explorer';

    return (
        <div ref={containerRef} style={{
            position: 'fixed', inset: 0, background: '#04000e',
            color: '#e2e8f0', display: 'flex', flexDirection: 'column',
            zIndex: 1000, overflow: 'hidden',
        }}>
            <style>{`
                @keyframes cd-spin    { to{ transform:rotate(360deg) } }
                @keyframes cd-fadein  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
                @keyframes cd-slideup { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
                @keyframes cd-glow    { 0%,100%{box-shadow:0 0 8px rgba(240,171,252,.15)} 50%{box-shadow:0 0 24px rgba(240,171,252,.5)} }
                @keyframes cd-pulse   { 0%,100%{opacity:.28} 50%{opacity:.72} }
                * { box-sizing:border-box; }
                ::-webkit-scrollbar{width:4px}
                ::-webkit-scrollbar-thumb{background:rgba(124,58,237,.35);border-radius:4px}
            `}</style>

            {/* ═══════════════════════════════════════════════════════════════
                THEATRE — permanent, always visible, top portion
            ════════════════════════════════════════════════════════════════ */}
            <div style={{
                flexShrink: 0,
                height: isFS ? '100dvh' : 'min(64dvh, 440px)',
                display: 'flex', flexDirection: 'column',
                borderBottom: `2px solid ${color}33`,
            }}>
                {/* ── TOP INFO BAR ── */}
                <div style={{
                    flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8,
                    padding: '5px 12px', background: 'rgba(4,0,14,.97)',
                    borderBottom: `1px solid ${color}1e`,
                }}>
                    <span style={{ fontSize: '.9rem', flexShrink: 0 }}>🎬</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 900, fontSize: 'clamp(.62rem,2vw,.8rem)', color: '#fff',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {cinema.cinema_title}
                        </div>
                        <div style={{ fontSize: '.52rem', color: '#6b5fad' }}>
                            {cinema.protagonist?.avatar_emoji} {cinema.protagonist?.name} · {cinema.subject} · Gr.{cinema.grade}
                        </div>
                    </div>
                    {/* Act dots */}
                    <div style={{ display: 'flex', gap: 4 }}>
                        {acts.map((a, i) => {
                            const c2 = COLOR[a.act_type] ?? '#a78bfa';
                            const active = i === actIdx;
                            return (
                                <button key={i} onClick={() => playAct(i)} title={a.act_title}
                                    style={{ width: active ? 18 : 6, height: 6, borderRadius: 9999,
                                        border: 'none', cursor: 'pointer', padding: 0,
                                        background: active ? c2 : i < actIdx ? `${c2}55` : 'rgba(255,255,255,.14)',
                                        transition: 'all .3s' }}/>
                            );
                        })}
                    </div>
                    {/* FS toggle */}
                    <button onClick={() => isFS ? exitFS() : enterFS()}
                        style={{ background: 'rgba(255,255,255,.06)', border: `1px solid ${color}44`,
                            borderRadius: 6, padding: '3px 7px', color: '#94a3b8', cursor: 'pointer', fontSize: '.8rem' }}>
                        {isFS ? '⊡' : '⛶'}
                    </button>
                    <button onClick={onTryAnother}
                        style={{ background: 'none', border: '1px solid rgba(148,163,184,.15)',
                            borderRadius: 6, padding: '3px 7px', color: '#475569', cursor: 'pointer', fontSize: '.58rem', fontWeight: 700 }}>
                        ✕
                    </button>
                </div>

                {/* ── SVG STAGE (fills remaining space) ── */}
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden',
                    background: act ? STAGE_BG[act.act_type] : STAGE_BG['hook'] }}>

                    {/* Red theatre curtains */}
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 9 }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '5%',
                            background: 'linear-gradient(90deg,#3d0a0e 0%,#7f1d1d 60%,transparent 100%)',
                            boxShadow: 'inset -12px 0 20px rgba(0,0,0,.55)' }}/>
                        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '5%',
                            background: 'linear-gradient(270deg,#3d0a0e 0%,#7f1d1d 60%,transparent 100%)',
                            boxShadow: 'inset 12px 0 20px rgba(0,0,0,.55)' }}/>
                        {/* Cinema frame corners */}
                        {[{top:5,left:5},{top:5,right:5},{bottom:5,left:5},{bottom:5,right:5}].map((p,i)=>(
                            <div key={i} style={{ position:'absolute',...p,width:16,height:16,
                                borderTop:i<2?`2px solid #facc15`:undefined,
                                borderBottom:i>=2?`2px solid #facc15`:undefined,
                                borderLeft:i%2===0?`2px solid #facc15`:undefined,
                                borderRight:i%2===1?`2px solid #facc15`:undefined}}/>
                        ))}
                    </div>

                    {/* Animated SVG concept scene */}
                    {act && <Stage act={act} tick={tick}/>}

                    {/* Audio loading — tiny, non-blocking */}
                    {audioLoading && (
                        <div style={{ position: 'absolute', top: 8, right: 10, zIndex: 10,
                            display: 'flex', alignItems: 'center', gap: 4, pointerEvents: 'none' }}>
                            <div style={{ width: 8, height: 8, border: `2px solid ${color}44`,
                                borderTop: `2px solid ${color}`, borderRadius: '50%',
                                animation: 'cd-spin 1s linear infinite' }}/>
                            <span style={{ color: '#475569', fontSize: '.5rem' }}>audio</span>
                        </div>
                    )}

                    {/* Audio bars */}
                    {isPlaying && !muted && (
                        <div style={{ position: 'absolute', top: 8, right: 10, zIndex: 10,
                            display: 'flex', gap: 2, alignItems: 'flex-end', height: 14, pointerEvents: 'none' }}>
                            {[0,1,2,3].map(j => (
                                <div key={j} style={{ width: 3, background: color, borderRadius: 2,
                                    height: `${4+10*Math.abs(Math.sin(tick*0.13+j*0.9))}px`, transition:'height .08s' }}/>
                            ))}
                        </div>
                    )}

                    {/* Act label */}
                    <div style={{ position: 'absolute', bottom: 7, left: 10, zIndex: 10, pointerEvents: 'none',
                        display: 'flex', gap: 5, alignItems: 'center' }}>
                        <span style={{ background: `${color}1e`, border: `1px solid ${color}66`, color,
                            borderRadius: 9999, padding: '2px 7px', fontSize: '.52rem', fontWeight: 800,
                            letterSpacing: '.08em', textTransform: 'uppercase' }}>
                            {act ? LABEL[act.act_type] : ''}
                        </span>
                        <span style={{ color: 'rgba(226,232,240,.3)', fontSize: '.5rem' }}>{act?.act_title}</span>
                    </div>
                </div>

                {/* ── SUBTITLE BAR ── */}
                <div style={{
                    flexShrink: 0, minHeight: 56, maxHeight: 88,
                    background: currentLine?.is_concept_reveal
                        ? 'linear-gradient(135deg,rgba(26,0,53,.98),rgba(10,0,24,.98))'
                        : 'rgba(4,0,12,.94)',
                    borderTop: `2px solid ${currentLine?.is_concept_reveal ? '#f0abfc55' : color + '33'}`,
                    padding: '7px 14px',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    ...(currentLine?.is_concept_reveal ? { animation: 'cd-glow 3s ease-in-out infinite' } : {}),
                }}>
                    {currentLine ? (
                        <>
                            <div style={{ fontSize: '.52rem', fontWeight: 800, color: subColor,
                                opacity: .65, marginBottom: 2, letterSpacing: '.04em' }}>
                                {speakerLabel}
                            </div>
                            <p style={{ margin: 0, color: subColor,
                                fontSize: 'clamp(.78rem,2.1vw,.95rem)', lineHeight: 1.52,
                                fontStyle: currentLine.speaker === 'narrator' ? 'italic' : 'normal',
                                fontWeight: currentLine.is_concept_reveal ? 700 : 500,
                                animation: 'cd-fadein .3s ease' }}>
                                {currentLine.text}
                            </p>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', color: 'rgba(148,163,184,.3)',
                            fontSize: '.68rem', fontStyle: 'italic' }}>
                            {act?.setting?.place} · {act?.setting?.time_of_day}
                        </div>
                    )}
                </div>

                {/* ── CONTROL BAR ── */}
                <div style={{
                    flexShrink: 0, background: 'rgba(5,0,14,.99)',
                    borderTop: `1px solid ${color}1e`,
                    padding: '5px 12px',
                    display: 'flex', gap: 7, alignItems: 'center',
                }}>
                    {/* Prev */}
                    <button onClick={goPrev} disabled={actIdx === 0}
                        style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(148,163,184,.14)',
                            borderRadius: 7, padding: '5px 11px', color: actIdx===0?'#374151':'#94a3b8',
                            cursor: actIdx===0?'not-allowed':'pointer', fontSize: '.68rem', fontWeight: 700,
                            opacity: actIdx===0?.35:1 }}>
                        ◀ Prev
                    </button>

                    {/* Play/Pause */}
                    <button onClick={() => { if (isPlaying) stopAudio(); else playAct(actIdx); }}
                        style={{ background: `${color}22`, border: `1px solid ${color}66`,
                            borderRadius: 7, padding: '5px 12px', color, cursor: 'pointer', fontSize: '.9rem' }}>
                        {audioLoading ? '⏳' : isPlaying ? '⏸' : '▶'}
                    </button>

                    {/* Next */}
                    <button onClick={goNext}
                        style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(148,163,184,.14)',
                            borderRadius: 7, padding: '5px 11px', color: '#94a3b8',
                            cursor: 'pointer', fontSize: '.68rem', fontWeight: 700 }}>
                        Next ▶
                    </button>

                    {/* Progress */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color, fontSize: '.52rem', fontWeight: 800 }}>
                                {act ? LABEL[act.act_type] : ''}
                            </span>
                            <span style={{ color: '#374151', fontSize: '.52rem' }}>
                                {actIdx+1} / {acts.length}
                            </span>
                        </div>
                        <div style={{ height: 2.5, background: 'rgba(255,255,255,.08)', borderRadius: 9999 }}>
                            <div style={{ height: '100%', background: color, borderRadius: 9999,
                                width: `${((actIdx+1)/acts.length)*100}%`, transition: 'width .4s ease' }}/>
                        </div>
                    </div>

                    {/* AutoPlay toggle */}
                    <button onClick={toggleAutoPlay}
                        style={{ background: autoPlay ? `${color}22` : 'rgba(255,255,255,.05)',
                            border: `1px solid ${autoPlay ? color+'66' : 'rgba(148,163,184,.14)'}`,
                            borderRadius: 7, padding: '5px 9px',
                            color: autoPlay ? color : '#6b7280',
                            cursor: 'pointer', fontSize: '.6rem', fontWeight: 800 }}>
                        {autoPlay ? '⏸ AUTO' : '▶ AUTO'}
                    </button>

                    {/* Mute */}
                    <button onClick={() => setMuted(m => !m)}
                        style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(148,163,184,.14)',
                            borderRadius: 7, padding: '5px 8px', color: muted?'#6b7280':'#94a3b8',
                            cursor: 'pointer', fontSize: '.82rem' }}>
                        {muted ? '🔇' : volume > 0.5 ? '🔊' : '🔉'}
                    </button>

                    {/* Volume slider */}
                    <input type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume}
                        onChange={e => { const v = Number(e.target.value); setVolume(v); setMuted(v===0); }}
                        style={{ width: 52, accentColor: color, cursor: 'pointer' }}/>
                </div>

                {/* ── CONCEPT BOARD STRIP ── */}
                {act?.concept_board && (
                    <div style={{ flexShrink: 0, background: 'rgba(8,0,20,.99)',
                        borderTop: `1px solid ${color}22`, padding: '4px 12px',
                        display: 'flex', gap: 10, alignItems: 'center', overflow: 'hidden' }}>
                        <span style={{ color, fontWeight: 900,
                            fontSize: 'clamp(.56rem,1.5vw,.7rem)', flexShrink: 0 }}>
                            {act.concept_board.title}
                        </span>
                        {act.concept_board.formula && (
                            <span style={{ fontFamily: '"SF Mono",ui-monospace,monospace',
                                color: '#f0abfc', fontSize: 'clamp(.62rem,1.6vw,.76rem)',
                                background: 'rgba(240,171,252,.07)', borderRadius: 5,
                                padding: '1px 7px', flexShrink: 0 }}>
                                {act.concept_board.formula}
                            </span>
                        )}
                        {act.concept_board.tamil_analogy && (
                            <span style={{ color: '#fbbf24', fontSize: 'clamp(.54rem,1.3vw,.64rem)',
                                fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                🌾 {act.concept_board.tamil_analogy}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                SCROLLABLE CONTENT — below theatre, always visible
            ════════════════════════════════════════════════════════════════ */}
            <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(4,0,12,.98)' }}>

                {/* Full screenplay transcript — always shown */}
                <div style={{ padding: '10px 14px 6px' }}>
                    <div style={{ color: '#334155', fontSize: '.56rem', fontWeight: 800,
                        letterSpacing: '.1em', marginBottom: 8 }}>SCENE TRANSCRIPT</div>
                    {acts.map((a, ai) => (
                        <div key={ai} style={{ marginBottom: 14,
                            opacity: ai === actIdx ? 1 : 0.45,
                            transition: 'opacity .4s' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5,
                                marginBottom: 5, cursor: 'pointer' }}
                                onClick={() => playAct(ai)}>
                                <span style={{ background: `${COLOR[a.act_type]??'#a78bfa'}20`,
                                    border: `1px solid ${COLOR[a.act_type]??'#a78bfa'}55`,
                                    color: COLOR[a.act_type]??'#a78bfa',
                                    borderRadius: 9999, padding: '1px 7px',
                                    fontSize: '.52rem', fontWeight: 800, textTransform: 'uppercase' }}>
                                    {LABEL[a.act_type]}
                                </span>
                                <span style={{ color: 'rgba(226,232,240,.35)', fontSize: '.56rem' }}>
                                    {a.act_title}
                                </span>
                                <span style={{ marginLeft: 'auto', color: '#334155', fontSize: '.52rem' }}>▶</span>
                            </div>
                            {a.screenplay.map((line, li) => {
                                const lc = line.speaker==='narrator'?'#a78bfa'
                                    :line.speaker==='protagonist'?'#fde68a'
                                    :line.speaker==='student_voice'?'#bfdbfe':'#f0abfc';
                                const isActive = ai===actIdx && li===subIdx;
                                return (
                                    <div key={li} style={{ display: 'flex', gap: 6, marginBottom: 5,
                                        padding: '3px 6px', borderRadius: 6,
                                        background: isActive ? `${lc}12` : 'transparent',
                                        borderLeft: `2px solid ${isActive ? lc : lc+'33'}`,
                                        transition: 'all .3s' }}>
                                        <span style={{ color: '#334155', fontSize: '.52rem', flexShrink: 0, paddingTop: 1 }}>
                                            {line.speaker==='narrator'?'🎙':line.speaker==='protagonist'?(cinema.protagonist?.avatar_emoji??'🧑'):line.speaker==='student_voice'?'🎓':'💡'}
                                        </span>
                                        <span style={{ color: lc, fontSize: 'clamp(.68rem,1.7vw,.8rem)',
                                            lineHeight: 1.48,
                                            fontStyle: line.speaker==='narrator'?'italic':'normal',
                                            fontWeight: isActive ? 700 : 400 }}>
                                            {line.text}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Exam + Quiz — shown after completion */}
                {showEnd && (
                    <div style={{ padding: '12px 14px 40px' }}>
                        <div style={{ width: '100%', height: 1,
                            background: `linear-gradient(90deg,transparent,${color}66,transparent)`,
                            marginBottom: 16 }}/>

                        {/* Exam spotlight */}
                        <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(167,139,250,.2)',
                            borderRadius: 14, padding: '14px 16px', marginBottom: 14,
                            animation: 'cd-slideup .5s ease' }}>
                            <h3 style={{ color: '#fff', fontWeight: 900,
                                fontSize: 'clamp(.88rem,2.5vw,1.1rem)', marginBottom: 12 }}>
                                📝 TN Board Exam Spotlight
                            </h3>
                            <div style={{ color: '#a78bfa', fontSize: '.58rem', fontWeight: 800,
                                letterSpacing: '.1em', marginBottom: 4 }}>MOST ASKED</div>
                            <div style={{ background: 'rgba(168,85,247,.08)',
                                border: '1px solid rgba(168,85,247,.3)', borderRadius: 10,
                                padding: '10px 12px', color: '#f1f5f9', marginBottom: 12,
                                lineHeight: 1.6, fontSize: 'clamp(.76rem,2vw,.88rem)' }}>
                                {cinema.exam_spotlight?.most_asked_question}
                            </div>
                            <div style={{ color: '#a78bfa', fontSize: '.58rem', fontWeight: 800,
                                letterSpacing: '.1em', marginBottom: 8 }}>MODEL ANSWER</div>
                            {(cinema.exam_spotlight?.model_answer_structure ?? []).map((s, i) => (
                                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 7 }}>
                                    <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: '50%',
                                        background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                                        color: '#fff', fontWeight: 900, fontSize: '.62rem',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {i+1}
                                    </span>
                                    <span style={{ color: '#e2e8f0', lineHeight: 1.5,
                                        fontSize: 'clamp(.74rem,1.9vw,.86rem)', paddingTop: 1 }}>{s}</span>
                                </div>
                            ))}
                            <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <span style={{ background: 'rgba(34,197,94,.1)',
                                    border: '1px solid rgba(34,197,94,.35)',
                                    color: '#86efac', borderRadius: 9999,
                                    padding: '4px 11px', fontWeight: 700, fontSize: '.74rem' }}>
                                    🎯 {cinema.exam_spotlight?.marks_tip}
                                </span>
                                {cinema.exam_spotlight?.previous_year_hint && (
                                    <span style={{ color: '#fbbf24', fontStyle: 'italic', fontSize: '.76rem', alignSelf: 'center' }}>
                                        📅 {cinema.exam_spotlight.previous_year_hint}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Quiz */}
                        <div style={{ background: 'rgba(255,255,255,.025)',
                            border: '1px solid rgba(148,163,184,.1)',
                            borderRadius: 14, padding: '14px 16px', marginBottom: 14,
                            animation: 'cd-slideup .6s ease' }}>
                            <h3 style={{ color: '#fff', fontWeight: 900,
                                fontSize: 'clamp(.88rem,2.5vw,1.1rem)', marginBottom: 14 }}>
                                🎯 Quick Quiz
                            </h3>
                            {(cinema.quiz ?? []).map((q, i) => {
                                const [ans, setAns] = [null, () => {}]; // placeholder for individual q state
                                return (
                                    <div key={i} style={{ marginBottom: 14,
                                        background: 'rgba(255,255,255,.02)',
                                        border: '1px solid rgba(148,163,184,.1)',
                                        borderRadius: 10, padding: '11px 12px' }}>
                                        <p style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: 8,
                                            lineHeight: 1.5, fontSize: 'clamp(.76rem,1.9vw,.88rem)' }}>
                                            {i+1}. {q.question}
                                        </p>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                                            {q.options.map((opt, j) => (
                                                <div key={j} style={{ padding: '7px 9px', borderRadius: 8,
                                                    fontSize: 'clamp(.68rem,1.7vw,.8rem)',
                                                    background: opt.startsWith(q.answer) ? 'rgba(34,197,94,.1)' : 'rgba(255,255,255,.03)',
                                                    border: opt.startsWith(q.answer) ? '1px solid rgba(34,197,94,.4)' : '1px solid rgba(148,163,184,.12)',
                                                    color: opt.startsWith(q.answer) ? '#86efac' : '#94a3b8' }}>
                                                    {opt}
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ marginTop: 7, fontSize: '.72rem', color: '#64748b', lineHeight: 1.5 }}>
                                            💡 {q.explanation}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* New cinema */}
                        <div style={{ textAlign: 'center' }}>
                            <button onClick={onTryAnother}
                                style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                                    color: '#fff', border: 'none', borderRadius: 12,
                                    padding: '11px 26px', fontWeight: 900, fontSize: '.88rem', cursor: 'pointer' }}>
                                🎬 New Cinema Experience
                            </button>
                        </div>
                    </div>
                )}

                {/* Prompt to scroll down when done */}
                {!showEnd && (
                    <div style={{ padding: '8px 14px 10px', textAlign: 'center',
                        color: '#1e293b', fontSize: '.56rem', letterSpacing: '.06em' }}>
                        {actIdx < lastIdx
                            ? `${lastIdx - actIdx} more act${lastIdx-actIdx===1?'':'s'} remaining`
                            : 'Last act — exam spotlight and quiz below ↓'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CinemaDisplay;
