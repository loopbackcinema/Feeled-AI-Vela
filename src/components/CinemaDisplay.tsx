/**
 * CinemaDisplay.tsx — FeelEd Cinema Theatre v4
 *
 * Key design decisions:
 * - Fullscreen on launch, minimize/restore button in controls
 * - Audio: starts loading immediately on cinema mount, plays as soon as ready
 * - Stage: concept-specific SVG animations derived from subject/element keywords
 * - Below theatre: scrollable scene-by-scene transcript
 * - Control panel: prev/next scene, play/pause audio, progress
 * - Exam tips: shows RAG year frequency from real question bank
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CinemaStory, CinemaAct, StageElement, CinemaActType } from '../types';
import { useAuth } from '../context/AuthContext';

interface Props {
    cinema: CinemaStory;
    language: string;
    onTryAnother: () => void;
}

// ─── Audio helpers ────────────────────────────────────────────────────────────
function b64ToBytes(b: string) {
    const s = atob(b); const out = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
    return out;
}
function pcmBuf(bytes: Uint8Array, ctx: AudioContext) {
    const i16 = new Int16Array(bytes.buffer);
    const buf = ctx.createBuffer(1, i16.length, 24000);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < i16.length; i++) ch[i] = i16[i] / 32768;
    return buf;
}

// ─── Act colors/labels ────────────────────────────────────────────────────────
const ACOLOR: Record<CinemaActType, string> = {
    hook:'#f59e0b', rising_action:'#3b82f6', climax:'#f43f5e',
    resolution:'#22c55e', exam_bridge:'#a855f7',
};
const ALABEL: Record<CinemaActType, string> = {
    hook:'Hook', rising_action:'Rising Action', climax:'Climax',
    resolution:'Resolution', exam_bridge:'Exam Bridge',
};
const ABGGRAD: Record<CinemaActType, string> = {
    hook:'radial-gradient(ellipse at 40% 35%,#1c0438 0%,#030009 75%)',
    rising_action:'radial-gradient(ellipse at 55% 25%,#010c2e 0%,#030009 75%)',
    climax:'radial-gradient(ellipse at 50% 30%,#200005 0%,#030009 75%)',
    resolution:'radial-gradient(ellipse at 45% 35%,#001b09 0%,#030009 75%)',
    exam_bridge:'radial-gradient(ellipse at 50% 30%,#0c0020 0%,#030009 75%)',
};

// ─── CONCEPT-SPECIFIC STAGE ───────────────────────────────────────────────────
// Renders meaningful SVG animations based on element keywords.
// NO text on canvas. Emojis via SVG <text> only for characters/objects.
function StageScene({ act, tick }: { act: CinemaAct; tick: number }) {
    const color = ACOLOR[act.act_type] ?? '#a78bfa';
    const els = act.stage_elements ?? [];

    // Parse element keywords for concept-specific rendering
    const hasWave  = els.some(e => /wave|light|sound|அலை|வெளிச்ச/i.test(e.name + e.description));
    const hasForce = els.some(e => /force|arrow|விசை|push|pull|motion/i.test(e.name + e.description));
    const hasFormula = els.some(e => e.element_type === 'formula');
    const hasCell  = els.some(e => /cell|கலம்|nucleus|chloro|mitochond/i.test(e.name + e.description));
    const hasOrbit = els.some(e => /orbit|planet|electron|circular|moon|earth/i.test(e.name + e.description));
    const hasChem  = els.some(e => /molecule|atom|bond|reaction|அணு|element/i.test(e.name + e.description));
    const hasGraph = els.some(e => /graph|chart|वरैப|growth|velocity|rate/i.test(e.name + e.description));
    const hasMagnet = els.some(e => /magnet|field|காந்த|flux|electric/i.test(e.name + e.description));

    // Extract characters/objects for emoji rendering
    const characters = els.filter(e => e.element_type === 'character' || e.element_type === 'object');
    const formulaEl = els.find(e => e.element_type === 'formula');

    // Position mapping for characters
    const charPositions = [
        { x: 80,  y: 160 },
        { x: 320, y: 155 },
        { x: 200, y: 170 },
        { x: 130, y: 190 },
    ];

    return (
        <svg viewBox="0 0 400 280" width="100%" height="100%"
            style={{ display:'block', position:'absolute', inset:0 }}
            xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="sg" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.15"/>
                    <stop offset="100%" stopColor={color} stopOpacity="0"/>
                </radialGradient>
                <filter id="blur3"><feGaussianBlur stdDeviation="3"/></filter>
                <filter id="blur6"><feGaussianBlur stdDeviation="6"/></filter>
                <marker id="ah" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                    <polygon points="0 0,8 3,0 6" fill={color}/>
                </marker>
            </defs>

            {/* Ambient glow */}
            <ellipse cx="200" cy="140" rx="170" ry="105" fill="url(#sg)"
                opacity={0.55 + 0.1*Math.sin(tick*0.04)}/>

            {/* Stars */}
            {[[28,22],[375,38],[12,205],[388,185],[200,12],[95,50],[315,58],
              [50,148],[342,138],[178,268],[245,272],[75,262],[328,268]].map(([x,y],i)=>(
                <circle key={i} cx={x} cy={y} r={0.8+(i%3)*0.5} fill="white"
                    opacity={0.2+0.35*Math.sin(tick*0.055+i*1.3)}/>
            ))}

            {/* ── CONCEPT-SPECIFIC ANIMATIONS ── */}

            {/* Wave physics */}
            {hasWave && (() => {
                const pts = Array.from({length:22},(_,j)=>{
                    const wx = 30 + j*16;
                    const wy = 140 + Math.sin(j*0.55 + tick*0.09) * 28;
                    return `${wx},${wy}`;
                }).join(' ');
                return (<>
                    <polyline points={pts} fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" opacity="0.9"/>
                    <polyline points={pts} fill="none" stroke="#34d399" strokeWidth="7" filter="url(#blur3)" opacity="0.2"/>
                    {/* crest markers */}
                    {[0,2,4].map(k=>{
                        const kx = 30 + (k*2)*16*1.4;
                        const ky = 140 - 28;
                        return kx < 380 ? <circle key={k} cx={kx} cy={ky} r="4" fill="#6ee7b7" opacity="0.7"/> : null;
                    })}
                </>);
            })()}

            {/* Force/motion arrows */}
            {hasForce && (() => {
                const len = 70 + 20*Math.sin(tick*0.06);
                return (<>
                    <line x1={200-len/2} y1="130" x2={200+len/2} y2="130"
                        stroke={color} strokeWidth="3.5" markerEnd="url(#ah)"/>
                    <line x1={200-len/2} y1="130" x2={200+len/2} y2="130"
                        stroke={color} strokeWidth="9" filter="url(#blur3)" opacity="0.25"/>
                    {/* reaction arrow */}
                    <line x1={200+len/2} y1="155" x2={200-len/2+10} y2="155"
                        stroke="#60a5fa" strokeWidth="2.5" markerEnd="url(#ah)" opacity="0.7"/>
                    <text x="200" y="118" fill={color} fontSize="10" textAnchor="middle" opacity="0.6">F</text>
                    <text x="200" y="172" fill="#60a5fa" fontSize="9" textAnchor="middle" opacity="0.55">F′</text>
                </>);
            })()}

            {/* Formula glow box */}
            {hasFormula && formulaEl && (() => {
                const gA = 0.5 + 0.3*Math.sin(tick*0.07);
                return (<>
                    <rect x="100" y="100" width="200" height="60" rx="14"
                        fill="rgba(240,171,252,0.07)" stroke="#f0abfc" strokeWidth="1.8" strokeOpacity={gA}/>
                    <rect x="100" y="100" width="200" height="60" rx="14"
                        fill="none" stroke="#f0abfc" strokeWidth="5" filter="url(#blur6)" strokeOpacity={gA*0.35}/>
                    {/* equals lines as symbol */}
                    <line x1="160" y1="126" x2="240" y2="126" stroke="#f0abfc" strokeWidth="2.5" opacity={gA}/>
                    <line x1="160" y1="138" x2="240" y2="138" stroke="#f0abfc" strokeWidth="2.5" opacity={gA}/>
                    <circle cx="145" cy="132" r="5" fill={color} opacity={gA}/>
                    <circle cx="255" cy="132" r="5" fill={color} opacity={gA}/>
                </>);
            })()}

            {/* Cell biology */}
            {hasCell && (() => {
                const breathe = 1 + 0.04*Math.sin(tick*0.045);
                return (
                    <g transform={`translate(200,140) scale(${breathe})`}>
                        <ellipse cx="0" cy="0" rx="80" ry="58" fill="rgba(52,211,153,0.06)" stroke="#34d399" strokeWidth="1.8"/>
                        <ellipse cx="10" cy="-6" rx="28" ry="20" fill="rgba(134,239,172,0.12)" stroke="#86efac" strokeWidth="1.4"/>
                        {/* organelles */}
                        {[[-35,18,-1],[ 30,22, 1],[-20,-28,0],[38,-15,-1]].map(([ox,oy,phase],i)=>(
                            <ellipse key={i} cx={ox} cy={oy} rx={6} ry={4}
                                fill="rgba(52,211,153,0.45)"
                                opacity={0.5+0.3*Math.sin(tick*0.05+i+phase)}/>
                        ))}
                    </g>
                );
            })()}

            {/* Orbit / planetary */}
            {hasOrbit && !hasCell && (() => {
                const orbitA = tick * 0.04;
                const orbitB = tick * 0.025;
                return (<>
                    {/* nucleus */}
                    <circle cx="200" cy="140" r={14+2*Math.sin(tick*0.05)} fill={color} opacity="0.8"
                        filter="url(#blur3)"/>
                    <circle cx="200" cy="140" r="10" fill={color} opacity="0.9"/>
                    {/* orbit paths */}
                    <ellipse cx="200" cy="140" rx="75" ry="35" fill="none" stroke={color}
                        strokeWidth="1" strokeOpacity="0.3" strokeDasharray="5 4"/>
                    <ellipse cx="200" cy="140" rx="48" ry="28" fill="none" stroke="#60a5fa"
                        strokeWidth="1" strokeOpacity="0.3" strokeDasharray="5 4"
                        transform={`rotate(60,200,140)`}/>
                    {/* electrons */}
                    <circle cx={200+75*Math.cos(orbitA)} cy={140+35*Math.sin(orbitA)} r="6" fill="white" opacity="0.9"/>
                    <circle cx={200+48*Math.cos(-orbitB+2)} cy={140+28*Math.sin(-orbitB+2)} r="5" fill="#93c5fd" opacity="0.85"
                        transform={`rotate(60,200,140)`}
                        style={{ transformOrigin:'200px 140px' }}/>
                </>);
            })()}

            {/* Chemistry / molecular */}
            {hasChem && !hasOrbit && !hasCell && (() => {
                const bonds = [[160,130,210,130],[210,130,255,105],[210,130,255,155],[160,130,115,105]];
                const atoms = [[160,130,'#f43f5e'],[210,130,'#60a5fa'],[255,105,'#34d399'],[255,155,'#fbbf24'],[115,105,'#a78bfa']];
                const wobble = Math.sin(tick*0.04)*4;
                return (<>
                    {bonds.map(([x1,y1,x2,y2],i)=>(
                        <line key={i} x1={x1} y1={y1+wobble*0.5} x2={x2} y2={y2+wobble}
                            stroke="#94a3b8" strokeWidth="2" opacity="0.6"/>
                    ))}
                    {atoms.map(([ax,ay,ac],i)=>(
                        <circle key={i} cx={Number(ax)} cy={Number(ay)+wobble*(i%2===0?0.5:1)}
                            r={i===0||i===1?12:9} fill={String(ac)} opacity="0.85"
                            filter="url(#blur3)"/>
                    ))}
                </>);
            })()}

            {/* Magnetic field lines */}
            {hasMagnet && (() => {
                const t = tick * 0.04;
                return (<>
                    {/* bar magnet */}
                    <rect x="170" y="128" width="60" height="24" rx="5"
                        fill="none" stroke="#94a3b8" strokeWidth="1.5"/>
                    <rect x="170" y="128" width="30" height="24" rx="4" fill="rgba(239,68,68,0.5)"/>
                    <rect x="200" y="128" width="30" height="24" rx="4" fill="rgba(59,130,246,0.5)"/>
                    {/* field lines */}
                    {[-1,0,1].map(k=>{
                        const oy = k*30;
                        const pts = Array.from({length:20},(_,j)=>{
                            const fx = 50 + j*15;
                            const fy = 140 + oy + Math.sin((fx-200)*0.025)*20*Math.sign(k||1)*Math.sign(fx-200) + 4*Math.sin(t+k);
                            return `${fx},${fy}`;
                        }).join(' ');
                        return <polyline key={k} points={pts} fill="none" stroke={color}
                            strokeWidth="1.2" strokeOpacity="0.4" strokeDasharray="3 3"/>;
                    })}
                </>);
            })()}

            {/* Graph/data */}
            {hasGraph && !hasWave && !hasForce && (() => {
                const bars = [28,45,62,38,75,55];
                return (<>
                    <line x1="80" y1="190" x2="330" y2="190" stroke="#475569" strokeWidth="1.5"/>
                    <line x1="80" y1="100" x2="80" y2="190" stroke="#475569" strokeWidth="1.5"/>
                    {bars.map((h,i)=>{
                        const bh = h + 5*Math.sin(tick*0.05+i*0.8);
                        return <rect key={i} x={90+i*38} y={190-bh} width="26" height={bh}
                            fill={color} opacity={0.55+0.2*(i===4?1:0)} rx="3"
                            filter={i===4?'url(#blur3)':undefined}/>;
                    })}
                </>);
            })()}

            {/* Default: elegant particle field for non-specific elements */}
            {!hasWave && !hasForce && !hasFormula && !hasCell && !hasOrbit && !hasChem && !hasGraph && !hasMagnet && (
                <>
                    {[0,60,120,180,240,300].map((deg,i)=>{
                        const r = deg * Math.PI / 180;
                        const radius = 55 + 20*Math.sin(tick*0.04+i*0.7);
                        return (
                            <g key={i} transform={`translate(${200+radius*Math.cos(r)},${140+radius*0.6*Math.sin(r)})`}>
                                <circle r={4+2*Math.sin(tick*0.07+i)} fill={color}
                                    opacity={0.5+0.3*Math.sin(tick*0.06+i*0.9)}/>
                            </g>
                        );
                    })}
                    <circle cx="200" cy="140" r={16+4*Math.sin(tick*0.05)} fill={color} opacity="0.18" filter="url(#blur6)"/>
                    <circle cx="200" cy="140" r="10" fill={color} opacity="0.6"/>
                </>
            )}

            {/* Characters/objects as emoji SVG text */}
            {characters.slice(0,3).map((el,i)=>{
                const pos = charPositions[i] ?? {x:200,y:160};
                const floatY = Math.sin(tick*0.035+i*1.2)*7;
                let emoji = (el.name.match(/^\p{Extended_Pictographic}/u)??[])[0]??'';
                if (!emoji) {
                    const n = el.name.toLowerCase();
                    if (n.includes('newton')||n.includes('நியூட்டன்')) emoji='🧑‍🔬';
                    else if (n.includes('einstein')) emoji='👨‍🔬';
                    else if (n.includes('raman')||n.includes('ராமன்')) emoji='🔬';
                    else if (n.includes('ramanujan')||n.includes('ராமானுஜன்')) emoji='📐';
                    else if (n.includes('student')||n.includes('மாணவ')) emoji='🎓';
                    else if (n.includes('apple')||n.includes('ஆப்பிள்')) emoji='🍎';
                    else if (n.includes('sun')||n.includes('சூரிய')) emoji='☀️';
                    else if (n.includes('moon')||n.includes('நிலா')) emoji='🌙';
                    else if (n.includes('plant')||n.includes('leaf')) emoji='🌿';
                    else if (n.includes('earth')||n.includes('பூமி')) emoji='🌍';
                    else if (n.includes('bulb')||n.includes('lamp')) emoji='💡';
                    else if (n.includes('flask')||n.includes('chemical')) emoji='⚗️';
                    else if (n.includes('telescope')) emoji='🔭';
                    else if (n.includes('book')||n.includes('நூல்')) emoji='📖';
                    else if (n.includes('car')||n.includes('வண்டி')) emoji='🚗';
                    else if (n.includes('water')||n.includes('நீர்')) emoji='💧';
                    else emoji = el.element_type==='character' ? '🧑' : '🔶';
                }
                const sz = el.element_type==='character' ? 44 : 36;
                return (
                    <g key={i}>
                        {el.highlight && <circle cx={pos.x} cy={pos.y+floatY} r={sz*0.75}
                            fill="none" stroke={color} strokeWidth="1.5"
                            strokeOpacity={0.5+0.3*Math.sin(tick*0.05)}
                            filter="url(#blur3)"/>}
                        <text x={pos.x} y={pos.y+floatY+sz*0.38} fontSize={sz}
                            textAnchor="middle" style={{userSelect:'none'}}>{emoji}</text>
                    </g>
                );
            })}

            {/* Act-specific atmospheric: climax spotlight */}
            {act.act_type==='climax' && (
                <ellipse cx={200+30*Math.cos(tick*0.03)} cy="280"
                    rx="60" ry="20" fill={color} opacity={0.06+0.04*Math.sin(tick*0.05)}
                    filter="url(#blur6)"/>
            )}
        </svg>
    );
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────
function QuizPanel({ quiz, onDone }: { quiz: CinemaStory['quiz']; onDone:(s:number)=>void }) {
    const [ans, setAns] = useState<Record<number,string>>({});
    const [sub, setSub] = useState(false);
    const score = sub ? quiz.filter((q,i)=>ans[i]===q.answer).length : 0;
    const ok = Object.keys(ans).length >= quiz.length;
    return (
        <div>
            <h3 style={{color:'#fff',fontWeight:900,fontSize:'clamp(.95rem,3vw,1.2rem)',marginBottom:16}}>🎯 Quick Quiz</h3>
            {quiz.map((q,i)=>(
                <div key={i} style={{marginBottom:16,background:'rgba(255,255,255,.03)',border:'1px solid rgba(148,163,184,.12)',borderRadius:13,padding:'13px 15px'}}>
                    <p style={{color:'#e2e8f0',fontWeight:700,marginBottom:10,lineHeight:1.5,fontSize:'clamp(.8rem,2vw,.92rem)'}}>{i+1}. {q.question}</p>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
                        {q.options.map((opt,j)=>{
                            const chosen=ans[i]===opt, correct=sub&&opt===q.answer, wrong=sub&&chosen&&opt!==q.answer;
                            return <button key={j} disabled={sub} onClick={()=>setAns(a=>({...a,[i]:opt}))}
                                style={{padding:'8px 10px',borderRadius:9,fontSize:'clamp(.7rem,1.8vw,.83rem)',fontWeight:600,textAlign:'left',cursor:sub?'default':'pointer',lineHeight:1.4,
                                    background:correct?'rgba(34,197,94,.15)':wrong?'rgba(239,68,68,.15)':chosen?'rgba(79,70,229,.18)':'rgba(255,255,255,.04)',
                                    border:correct?'1.5px solid #22c55e':wrong?'1.5px solid #ef4444':chosen?'1.5px solid #6366f1':'1px solid rgba(148,163,184,.17)',
                                    color:correct?'#86efac':wrong?'#fca5a5':chosen?'#c7d2fe':'#cbd5e1'}}>
                                {opt}
                            </button>;
                        })}
                    </div>
                    {sub && <div style={{marginTop:8,fontSize:'.76rem',color:'#94a3b8',lineHeight:1.5}}>💡 {q.explanation}</div>}
                </div>
            ))}
            {!sub
                ? <button disabled={!ok} onClick={()=>{setSub(true);onDone(quiz.filter((q,i)=>ans[i]===q.answer).length);}}
                    style={{width:'100%',padding:12,background:ok?'linear-gradient(135deg,#4f46e5,#7c3aed)':'#1e1b4b',color:'#fff',border:'none',borderRadius:12,fontWeight:800,fontSize:'.92rem',cursor:ok?'pointer':'not-allowed',opacity:ok?1:0.5}}>Submit Answers</button>
                : <div style={{textAlign:'center',padding:12,background:'rgba(79,70,229,.12)',border:'1px solid #4f46e5',borderRadius:12,color:'#c7d2fe',fontWeight:800,fontSize:'1.02rem'}}>
                    {score}/{quiz.length} correct {score===quiz.length?'🏆':score>=quiz.length/2?'✅':'📖'}
                  </div>
            }
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const CinemaDisplay: React.FC<Props> = ({ cinema, language, onTryAnother }) => {
    const { user, userProfile } = useAuth();
    const containerRef = useRef<HTMLDivElement>(null);
    const acts = cinema.acts ?? [];
    const lastIdx = Math.max(0, acts.length - 1);

    // ── UI state ──────────────────────────────────────────────────────────────
    const [actIdx,       setActIdx]       = useState(0);
    const [lineIdx,      setLineIdx]      = useState(-1);
    const [showCurtainQ, setShowCurtainQ] = useState(false);
    const [showInterval, setShowInterval] = useState(false);
    const [showEnd,      setShowEnd]      = useState(false);
    const [quizScore,    setQuizScore]    = useState<number | null>(null);
    const [tick,         setTick]         = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showTranscript, setShowTranscript] = useState(false);

    // ── Audio state ───────────────────────────────────────────────────────────
    const [audioOn,      setAudioOn]      = useState(true);
    const [audioLoading, setAudioLoading] = useState(false);
    const [isPlaying,    setIsPlaying]    = useState(false);
    // Pre-generated audio per act index
    const audioCacheRef = useRef<Record<number, string>>({});
    const audioCtxRef   = useRef<AudioContext | null>(null);
    const audioSrcRef   = useRef<AudioBufferSourceNode | null>(null);
    const transcriptRef = useRef<HTMLDivElement>(null);

    const act   = acts[actIdx];
    const lines = act?.screenplay ?? [];
    const color = act ? (ACOLOR[act.act_type] ?? '#a78bfa') : '#a78bfa';

    // ── Animation clock ───────────────────────────────────────────────────────
    useEffect(() => {
        const id = setInterval(() => setTick(t => t+1), 50);
        return () => clearInterval(id);
    }, []);

    // ── Fullscreen management ─────────────────────────────────────────────────
    const enterFS = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;
        const fn = el.requestFullscreen ?? (el as any).webkitRequestFullscreen ?? (el as any).mozRequestFullScreen;
        if (fn) fn.call(el).catch(()=>{});
    }, []);
    const exitFS = useCallback(() => {
        (document.exitFullscreen ?? (document as any).webkitExitFullscreen ?? (document as any).mozCancelFullScreen)?.call(document).catch(()=>{});
    }, []);

    useEffect(() => {
        // Auto fullscreen on mount
        setTimeout(enterFS, 100);
        const onFSChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onFSChange);
        document.addEventListener('webkitfullscreenchange', onFSChange);
        return () => {
            document.removeEventListener('fullscreenchange', onFSChange);
            document.removeEventListener('webkitfullscreenchange', onFSChange);
            if (document.fullscreenElement) exitFS();
        };
    }, [enterFS, exitFS]);

    // ── Audio: generate one audio file per act ────────────────────────────────
    const generateAudio = useCallback(async (idx: number) => {
        if (!audioOn || audioCacheRef.current[idx]) return audioCacheRef.current[idx];
        const a = acts[idx];
        if (!a) return;
        // Compact narration: narrator lines + concept lines only (shorter = faster TTS)
        const narration = a.screenplay
            .filter(l => l.speaker === 'narrator' || l.is_concept_reveal)
            .map(l => l.text).join(' ').slice(0, 420);
        const voice = language === 'Tamil'
            ? (a.act_type === 'climax' ? 'Fenrir' : 'Zephyr')
            : (a.act_type === 'climax' ? 'Charon' : 'Kore');
        const tone = a.act_type === 'climax' ? 'dramatic'
            : a.act_type === 'hook' ? 'curious' : 'calm';
        try {
            setAudioLoading(true);
            const res = await fetch('/api/audio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullStoryText: narration, language, narratorVoice: voice, emotionTone: tone }),
            });
            if (!res.ok) return;
            const { base64Audio } = await res.json();
            if (base64Audio) { audioCacheRef.current[idx] = base64Audio; return base64Audio; }
        } catch (_) {}
        finally { setAudioLoading(false); }
    }, [audioOn, language, acts]);

    const stopAudio = useCallback(() => {
        if (audioSrcRef.current) { try { audioSrcRef.current.stop(); } catch (_) {} }
        audioSrcRef.current = null;
        setIsPlaying(false);
    }, []);

    const playAudio = useCallback((b64: string) => {
        if (!b64 || !audioOn) return;
        stopAudio();
        try {
            if (!audioCtxRef.current || audioCtxRef.current.state === 'closed')
                audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const ctx = audioCtxRef.current;
            const buf = pcmBuf(b64ToBytes(b64), ctx);
            const src = ctx.createBufferSource();
            src.buffer = buf; src.connect(ctx.destination);
            src.onended = () => setIsPlaying(false);
            src.start(); audioSrcRef.current = src; setIsPlaying(true);
        } catch (_) {}
    }, [audioOn, stopAudio]);

    const toggleAudioPlayback = useCallback(() => {
        if (isPlaying) { stopAudio(); return; }
        const b64 = audioCacheRef.current[actIdx];
        if (b64) playAudio(b64);
        else generateAudio(actIdx).then(b => { if (b) playAudio(b); });
    }, [isPlaying, actIdx, stopAudio, playAudio, generateAudio]);

    // ── On act change: reset, load audio immediately, start subtitles ─────────
    useEffect(() => {
        setLineIdx(-1);
        setShowCurtainQ(false);
        stopAudio();

        // Start audio ASAP — generate if not cached, play immediately when ready
        const go = async () => {
            let b64 = audioCacheRef.current[actIdx];
            if (!b64) b64 = await generateAudio(actIdx) as string;
            if (b64 && audioOn) playAudio(b64);
        };
        go();

        // Pre-fetch next act in background (no await needed)
        if (actIdx < lastIdx) generateAudio(actIdx + 1);

        // Begin subtitle progression after 1.5s stage-only intro
        const t = setTimeout(() => setLineIdx(0), 1500);
        return () => { clearTimeout(t); stopAudio(); };
    }, [actIdx]); // eslint-disable-line

    // ── Subtitle auto-advance ─────────────────────────────────────────────────
    useEffect(() => {
        if (lineIdx < 0 || showCurtainQ) return;
        if (lineIdx >= lines.length) { setShowCurtainQ(true); return; }
        const words = (lines[lineIdx]?.text ?? '').split(' ').length;
        const delay = Math.max(2800, words * 360);
        const t = setTimeout(() => {
            if (lineIdx < lines.length - 1) setLineIdx(l => l+1);
            else setShowCurtainQ(true);
        }, delay);
        return () => clearTimeout(t);
    }, [lineIdx, showCurtainQ, lines]);

    // ── Navigation ────────────────────────────────────────────────────────────
    const gotoAct = useCallback((idx: number) => {
        stopAudio();
        setShowInterval(false); setShowEnd(false); setShowCurtainQ(false);
        setActIdx(Math.max(0, Math.min(idx, lastIdx)));
    }, [lastIdx, stopAudio]);

    const handleContinue = useCallback(() => {
        stopAudio(); setShowCurtainQ(false);
        if (actIdx === 2) setShowInterval(true);
        else if (actIdx >= lastIdx) setShowEnd(true);
        else setActIdx(a => a+1);
    }, [actIdx, lastIdx, stopAudio]);

    const tapStage = useCallback(() => {
        if (showCurtainQ || showInterval || showEnd) return;
        if (lineIdx < lines.length - 1) setLineIdx(l => l+1);
        else setShowCurtainQ(true);
    }, [showCurtainQ, showInterval, showEnd, lineIdx, lines.length]);

    const currentLine = lineIdx >= 0 && lineIdx < lines.length ? lines[lineIdx] : null;
    const subColor = currentLine?.speaker === 'narrator' ? '#c4b5fd'
        : currentLine?.speaker === 'protagonist' ? '#fde68a'
        : currentLine?.speaker === 'student_voice' ? '#bfdbfe' : '#f0abfc';
    const subBg = currentLine?.is_concept_reveal
        ? 'linear-gradient(135deg,rgba(26,0,53,.97),rgba(10,0,24,.97))'
        : 'rgba(3,0,9,.9)';

    // RAG exam years from API
    const ragYears: string[] = (cinema.exam_spotlight as any)?.rag_years ?? [];
    const ragCount: number   = (cinema.exam_spotlight as any)?.rag_count ?? 0;
    const studentName = userProfile?.displayName || user?.displayName || 'Academic Explorer';

    return (
        <div ref={containerRef}
            style={{ position:'fixed', inset:0, background:'#030009', color:'#e2e8f0',
                overflow:'hidden', display:'flex', flexDirection:'column', zIndex:1000 }}>
            <style>{`
                @keyframes cd-fadein { from{opacity:0;transform:translateY(7px)} to{opacity:1;transform:none} }
                @keyframes cd-slideup { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
                @keyframes cd-revpulse { 0%,100%{box-shadow:0 0 10px rgba(240,171,252,.18)} 50%{box-shadow:0 0 28px rgba(240,171,252,.52)} }
                @keyframes cd-blink { 0%,100%{opacity:.28} 50%{opacity:.68} }
                @keyframes cd-bars { 0%,100%{height:4px} 50%{height:14px} }
                * { box-sizing:border-box; }
                ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent}
                ::-webkit-scrollbar-thumb{background:rgba(124,58,237,.4);border-radius:4px}
            `}</style>

            {/* ── TOP BAR ──────────────────────────────────────────────── */}
            <div style={{ flexShrink:0, display:'flex', alignItems:'center', gap:8,
                padding:'6px 12px', background:'rgba(3,0,9,.96)',
                borderBottom:`1px solid ${color}22`, zIndex:20 }}>
                <span style={{fontSize:'1rem'}}>🎬</span>
                <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:900,fontSize:'clamp(.68rem,2vw,.86rem)',color:'#fff',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{cinema.cinema_title}</div>
                    <div style={{fontSize:'.56rem',color:'#6b5fad'}}>{cinema.protagonist?.avatar_emoji} {cinema.protagonist?.name} · Gr.{cinema.grade} · {cinema.subject}</div>
                </div>
                {/* Act dots */}
                <div style={{display:'flex',gap:4,alignItems:'center'}}>
                    {acts.map((a,i)=>{
                        const c = ACOLOR[a.act_type]??'#a78bfa';
                        const active = i===actIdx && !showEnd && !showInterval;
                        return <button key={i} onClick={()=>gotoAct(i)} title={`Act ${i+1}: ${a.act_title}`}
                            style={{width:active?20:7,height:7,borderRadius:9999,border:'none',cursor:'pointer',
                                background:active?c:i<actIdx||showEnd?`${c}55`:'rgba(255,255,255,.15)',
                                transition:'all .3s',padding:0}}/>;
                    })}
                </div>
                {/* Controls */}
                <div style={{display:'flex',gap:5,flexShrink:0,alignItems:'center'}}>
                    {/* Audio loading/playing indicator */}
                    {audioLoading && <span style={{fontSize:'.7rem',color:color,animation:'cd-blink 1s infinite'}}>⏳</span>}
                    <button onClick={toggleAudioPlayback}
                        style={{background:'rgba(255,255,255,.06)',border:`1px solid ${audioOn?color+'66':'rgba(148,163,184,.18)'}`,borderRadius:7,padding:'4px 8px',color:audioOn?color:'#6b7280',cursor:'pointer',fontSize:'.85rem'}}>
                        {isPlaying ? '⏸' : audioLoading ? '⏳' : audioOn ? '▶' : '🔇'}
                    </button>
                    <button onClick={()=>setAudioOn(a=>{if(a&&isPlaying)stopAudio();return !a;})}
                        style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(148,163,184,.15)',borderRadius:7,padding:'4px 7px',color:'#64748b',cursor:'pointer',fontSize:'.7rem'}}>
                        {audioOn?'🔊':'🔇'}
                    </button>
                    {/* Fullscreen toggle */}
                    <button onClick={()=>isFullscreen?exitFS():enterFS()}
                        style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(148,163,184,.18)',borderRadius:7,padding:'4px 8px',color:'#94a3b8',cursor:'pointer',fontSize:'.75rem',fontWeight:700}}>
                        {isFullscreen?'⊡':'⛶'}
                    </button>
                    <button onClick={onTryAnother}
                        style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(148,163,184,.15)',borderRadius:7,padding:'4px 8px',color:'#475569',cursor:'pointer',fontSize:'.62rem',fontWeight:700}}>✕</button>
                </div>
            </div>

            {/* ── MAIN ─────────────────────────────────────────────────── */}
            <div style={{flex:1,overflow:showEnd||showInterval?'auto':'hidden',display:'flex',flexDirection:'column'}}>

            {showEnd ? (
            /* ── END SCREEN ────────────────────────────────────────────── */
            <div style={{flex:1,overflowY:'auto',padding:'16px 16px 40px',maxWidth:700,margin:'0 auto',width:'100%'}}>

                {/* Exam Spotlight with RAG years */}
                <div style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(167,139,250,.2)',borderRadius:18,padding:'16px 18px',marginBottom:18,animation:'cd-slideup .5s ease'}}>
                    <h2 style={{color:'#fff',fontWeight:900,fontSize:'clamp(.95rem,3vw,1.25rem)',marginBottom:12}}>📝 TN Board Exam Spotlight</h2>

                    {/* RAG frequency badge — KEY FEATURE */}
                    {ragYears.length > 0 && (
                        <div style={{background:'linear-gradient(135deg,rgba(168,85,247,.15),rgba(79,70,229,.1))',border:'1px solid rgba(168,85,247,.45)',borderRadius:12,padding:'10px 14px',marginBottom:14,display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
                            <span style={{fontSize:'1.1rem'}}>📊</span>
                            <div>
                                <div style={{color:'#e9d5ff',fontWeight:900,fontSize:'clamp(.78rem,2vw,.9rem)'}}>
                                    Asked in <span style={{color:'#f0abfc',fontSize:'clamp(1rem,2.5vw,1.2rem)'}}>{ragYears.length}</span> public exam year{ragYears.length>1?'s':''}
                                </div>
                                <div style={{color:'#a78bfa',fontSize:'.72rem',marginTop:2}}>
                                    {ragYears.join(', ')} · {ragCount} question paper match{ragCount!==1?'es':''}
                                </div>
                            </div>
                            <div style={{marginLeft:'auto',background:'rgba(168,85,247,.2)',borderRadius:9999,padding:'4px 12px',color:'#f0abfc',fontWeight:800,fontSize:'.72rem',whiteSpace:'nowrap'}}>
                                HIGH PRIORITY ⚡
                            </div>
                        </div>
                    )}
                    {ragYears.length === 0 && (
                        <div style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(148,163,184,.12)',borderRadius:10,padding:'8px 12px',marginBottom:12,color:'#64748b',fontSize:'.75rem'}}>
                            📂 Checking question bank frequency…
                        </div>
                    )}

                    <div style={{color:'#a78bfa',fontSize:'.62rem',fontWeight:800,letterSpacing:'.12em',marginBottom:4}}>MOST ASKED QUESTION</div>
                    <div style={{background:'rgba(168,85,247,.09)',border:'1px solid rgba(168,85,247,.35)',borderRadius:12,padding:'11px 14px',color:'#f1f5f9',marginBottom:14,lineHeight:1.6,fontSize:'clamp(.8rem,2vw,.92rem)'}}>
                        {cinema.exam_spotlight?.most_asked_question}
                    </div>
                    <div style={{color:'#a78bfa',fontSize:'.62rem',fontWeight:800,letterSpacing:'.12em',marginBottom:9}}>MODEL ANSWER</div>
                    {(cinema.exam_spotlight?.model_answer_structure ?? []).map((step,i)=>(
                        <div key={i} style={{display:'flex',gap:9,marginBottom:8,alignItems:'flex-start'}}>
                            <span style={{flexShrink:0,width:20,height:20,borderRadius:'50%',background:'linear-gradient(135deg,#4f46e5,#7c3aed)',color:'#fff',fontWeight:900,fontSize:'.66rem',display:'flex',alignItems:'center',justifyContent:'center'}}>{i+1}</span>
                            <span style={{color:'#e2e8f0',lineHeight:1.5,fontSize:'clamp(.78rem,2vw,.9rem)',paddingTop:1}}>{step}</span>
                        </div>
                    ))}
                    <div style={{marginTop:11,display:'flex',gap:9,flexWrap:'wrap',alignItems:'center'}}>
                        <span style={{background:'rgba(34,197,94,.11)',border:'1px solid rgba(34,197,94,.4)',color:'#86efac',borderRadius:9999,padding:'5px 13px',fontWeight:700,fontSize:'.78rem'}}>🎯 {cinema.exam_spotlight?.marks_tip}</span>
                        {cinema.exam_spotlight?.previous_year_hint && <span style={{color:'#fbbf24',fontStyle:'italic',fontSize:'.8rem'}}>📅 {cinema.exam_spotlight.previous_year_hint}</span>}
                    </div>
                </div>

                {/* Quiz */}
                <div style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(148,163,184,.12)',borderRadius:18,padding:'16px 18px',marginBottom:18,animation:'cd-slideup .6s ease'}}>
                    <QuizPanel quiz={cinema.quiz??[]} onDone={setQuizScore}/>
                </div>

                {/* Certificate */}
                {quizScore !== null && (
                    <div style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(252,211,77,.25)',borderRadius:18,padding:'20px 18px',textAlign:'center',animation:'cd-slideup .5s ease',marginBottom:18}}>
                        <div style={{fontSize:'clamp(1.6rem,5vw,2.4rem)',marginBottom:6}}>🏆</div>
                        <div style={{fontWeight:900,fontSize:'clamp(.95rem,3vw,1.25rem)',color:'#fff',marginBottom:3}}>Congratulations, {studentName}!</div>
                        <div style={{color:'#94a3b8',marginBottom:12,fontSize:'clamp(.76rem,2vw,.88rem)'}}>Completed <em>{cinema.cinema_title}</em></div>
                        <div style={{fontSize:'clamp(1.2rem,4vw,1.7rem)',fontWeight:900,color:'#fcd34d',marginBottom:18}}>{quizScore}/{cinema.quiz?.length??0}</div>
                        <button onClick={onTryAnother} style={{background:'linear-gradient(135deg,#4f46e5,#7c3aed)',color:'#fff',border:'none',borderRadius:14,padding:'11px 26px',fontWeight:900,fontSize:'.9rem',cursor:'pointer'}}>
                            🎬 New Cinema Experience
                        </button>
                    </div>
                )}
            </div>

            ) : showInterval ? (
            /* ── INTERVAL ──────────────────────────────────────────────── */
            <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
                <div style={{textAlign:'center',maxWidth:500,animation:'cd-slideup .5s ease'}}>
                    <div style={{fontSize:'clamp(1.5rem,5vw,2.6rem)',fontWeight:900,color:'#fcd34d',marginBottom:14,letterSpacing:'.08em'}}>🍿 INTERVAL</div>
                    <div style={{color:'#a78bfa',fontSize:'.62rem',fontWeight:800,letterSpacing:'.14em',marginBottom:3}}>SO FAR…</div>
                    <p style={{color:'#e2e8f0',lineHeight:1.65,marginBottom:16,fontSize:'clamp(.84rem,2.2vw,.99rem)'}}>{cinema.interval_card?.recap}</p>
                    <div style={{color:'#fbbf24',fontSize:'.62rem',fontWeight:800,letterSpacing:'.14em',marginBottom:3}}>COMING UP…</div>
                    <p style={{color:'#fde68a',fontStyle:'italic',lineHeight:1.65,marginBottom:24,fontSize:'clamp(.84rem,2.2vw,.99rem)'}}>{cinema.interval_card?.teaser}</p>
                    <button onClick={()=>{setShowInterval(false);setActIdx(3);}}
                        style={{background:'linear-gradient(135deg,#4f46e5,#7c3aed)',color:'#fff',border:'none',borderRadius:14,padding:'11px 26px',fontWeight:800,fontSize:'.9rem',cursor:'pointer'}}>
                        Continue → Act 4
                    </button>
                </div>
            </div>

            ) : (
            /* ── THEATRE ───────────────────────────────────────────────── */
            <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',position:'relative'}}>

                {/* STAGE */}
                <div onClick={tapStage}
                    style={{flex:1,position:'relative',background:act?ABGGRAD[act.act_type]:ABGGRAD['hook'],cursor:'pointer',overflow:'hidden'}}>

                    {/* Red curtains */}
                    <div style={{position:'absolute',top:0,left:0,bottom:0,width:'5%',background:'linear-gradient(90deg,#3d0a0e,#7f1d1d 65%,transparent)',boxShadow:'inset -10px 0 18px rgba(0,0,0,.6)',pointerEvents:'none',zIndex:8}}/>
                    <div style={{position:'absolute',top:0,right:0,bottom:0,width:'5%',background:'linear-gradient(270deg,#3d0a0e,#7f1d1d 65%,transparent)',boxShadow:'inset 10px 0 18px rgba(0,0,0,.6)',pointerEvents:'none',zIndex:8}}/>

                    {/* Corner frames */}
                    {[{top:5,left:5},{top:5,right:5},{bottom:5,left:5},{bottom:5,right:5}].map((pos,i)=>(
                        <div key={i} style={{position:'absolute',...pos,width:20,height:20,
                            borderTop:i<2?'2px solid #facc15':undefined,
                            borderBottom:i>=2?'2px solid #facc15':undefined,
                            borderLeft:i%2===0?'2px solid #facc15':undefined,
                            borderRight:i%2===1?'2px solid #facc15':undefined,
                            pointerEvents:'none',zIndex:9}}/>
                    ))}

                    {/* Animated stage */}
                    {act && <StageScene act={act} tick={tick}/>}

                    {/* Audio bars indicator */}
                    {isPlaying && (
                        <div style={{position:'absolute',top:9,right:10,zIndex:10,display:'flex',gap:2,alignItems:'flex-end',height:16,pointerEvents:'none'}}>
                            {[0,1,2,3].map(j=>(
                                <div key={j} style={{width:3,background:color,borderRadius:2,
                                    height:`${4+10*Math.abs(Math.sin(tick*0.12+j*0.9))}px`,
                                    transition:'height .08s'}}/>
                            ))}
                        </div>
                    )}

                    {/* Act badge */}
                    <div style={{position:'absolute',bottom:8,left:10,zIndex:10,pointerEvents:'none',display:'flex',gap:5,alignItems:'center'}}>
                        <span style={{background:`${color}1a`,border:`1px solid ${color}77`,color,borderRadius:9999,padding:'2px 8px',fontSize:'.56rem',fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase'}}>
                            {act?ALABEL[act.act_type]:''}
                        </span>
                        <span style={{color:'rgba(226,232,240,.35)',fontSize:'.55rem'}}>Act {act?.act_number}: {act?.act_title}</span>
                    </div>
                    <div style={{position:'absolute',bottom:8,right:10,zIndex:10,color:'rgba(148,163,184,.3)',fontSize:'.52rem',pointerEvents:'none',animation:'cd-blink 2.5s ease-in-out infinite'}}>tap →</div>
                </div>

                {/* SUBTITLE BAR */}
                <div style={{flexShrink:0,minHeight:64,maxHeight:110,background:subBg,
                    borderTop:`2px solid ${currentLine?.is_concept_reveal?'#f0abfc':color+'44'}`,
                    padding:'8px 14px',display:'flex',flexDirection:'column',justifyContent:'center',
                    animation:currentLine?'cd-fadein .3s ease':undefined,
                    ...(currentLine?.is_concept_reveal?{animation:'cd-fadein .3s ease, cd-revpulse 3s infinite'}:{})}}>
                    {!currentLine && lineIdx<0 && (
                        <div style={{textAlign:'center',color:'rgba(148,163,184,.38)',fontSize:'.72rem',fontStyle:'italic'}}>
                            {act?.setting?.place} · {act?.setting?.time_of_day}
                        </div>
                    )}
                    {currentLine && (
                        <>
                            <div style={{display:'flex',gap:5,alignItems:'center',marginBottom:3}}>
                                {currentLine.is_concept_reveal && <span style={{color:'#f0abfc',fontSize:'.57rem',fontWeight:900,letterSpacing:'.15em'}}>✦ CONCEPT REVEAL ✦</span>}
                                {!currentLine.is_concept_reveal && <span style={{color:subColor,fontSize:'.57rem',fontWeight:800,opacity:.7}}>
                                    {currentLine.speaker==='narrator'?'🎙 Narrator'
                                        :currentLine.speaker==='protagonist'?`${cinema.protagonist?.avatar_emoji} ${cinema.protagonist?.name}`
                                        :currentLine.speaker==='student_voice'?'🎓 Student':'💡 Concept'}
                                </span>}
                            </div>
                            <p style={{color:subColor,fontSize:'clamp(.8rem,2.2vw,.98rem)',lineHeight:1.55,margin:0,
                                fontStyle:currentLine.speaker==='narrator'?'italic':'normal',
                                fontWeight:currentLine.is_concept_reveal?700:500}}>
                                {currentLine.text}
                            </p>
                        </>
                    )}
                </div>

                {/* CONTROL PANEL */}
                <div style={{flexShrink:0,background:'rgba(5,0,15,.98)',borderTop:`1px solid ${color}22`,padding:'7px 12px',display:'flex',gap:8,alignItems:'center'}}>
                    {/* Prev/Next scene */}
                    <button onClick={()=>actIdx>0&&gotoAct(actIdx-1)} disabled={actIdx===0}
                        style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(148,163,184,.15)',borderRadius:8,padding:'5px 10px',color:actIdx===0?'#374151':'#94a3b8',cursor:actIdx===0?'not-allowed':'pointer',fontSize:'.75rem',fontWeight:700,opacity:actIdx===0?0.4:1}}>
                        ◀ Prev
                    </button>
                    {/* Progress */}
                    <div style={{flex:1,display:'flex',flexDirection:'column',gap:3}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                            <span style={{color:color,fontSize:'.58rem',fontWeight:800}}>{act?ALABEL[act.act_type]:''}</span>
                            <span style={{color:'#475569',fontSize:'.58rem'}}>{actIdx+1}/{acts.length}</span>
                        </div>
                        <div style={{height:3,background:'rgba(255,255,255,.1)',borderRadius:9999,overflow:'hidden'}}>
                            <div style={{height:'100%',background:color,borderRadius:9999,
                                width:`${((actIdx+1)/acts.length)*100}%`,transition:'width .4s ease'}}/>
                        </div>
                    </div>
                    <button onClick={()=>actIdx<lastIdx&&gotoAct(actIdx+1)} disabled={actIdx>=lastIdx}
                        style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(148,163,184,.15)',borderRadius:8,padding:'5px 10px',color:actIdx>=lastIdx?'#374151':'#94a3b8',cursor:actIdx>=lastIdx?'not-allowed':'pointer',fontSize:'.75rem',fontWeight:700,opacity:actIdx>=lastIdx?0.4:1}}>
                        Next ▶
                    </button>
                    {/* Transcript toggle */}
                    <button onClick={()=>setShowTranscript(s=>!s)}
                        style={{background:showTranscript?`${color}22`:'rgba(255,255,255,.05)',border:`1px solid ${showTranscript?color+'66':'rgba(148,163,184,.15)'}`,borderRadius:8,padding:'5px 9px',color:showTranscript?color:'#64748b',cursor:'pointer',fontSize:'.68rem',fontWeight:700}}>
                        {showTranscript?'▲ Script':'📜 Script'}
                    </button>
                </div>

                {/* CONCEPT BOARD STRIP */}
                {act?.concept_board && (
                    <div style={{flexShrink:0,background:'rgba(8,0,18,.99)',borderTop:`1.5px solid ${color}28`,padding:'5px 12px',display:'flex',gap:10,alignItems:'center'}}>
                        <span style={{color:color,fontWeight:900,fontSize:'clamp(.62rem,1.6vw,.76rem)',flexShrink:0}}>{act.concept_board.title}</span>
                        {act.concept_board.formula && <span style={{fontFamily:'"SF Mono",ui-monospace,monospace',color:'#f0abfc',fontSize:'clamp(.68rem,1.7vw,.82rem)',background:'rgba(240,171,252,.07)',borderRadius:6,padding:'2px 7px',flexShrink:0}}>{act.concept_board.formula}</span>}
                        {act.concept_board.tamil_analogy && <span style={{color:'#fbbf24',fontSize:'clamp(.58rem,1.4vw,.7rem)',fontStyle:'italic',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>🌾 {act.concept_board.tamil_analogy}</span>}
                    </div>
                )}

                {/* TRANSCRIPT PANEL */}
                {showTranscript && (
                    <div ref={transcriptRef}
                        style={{flexShrink:0,maxHeight:'45vh',overflowY:'auto',background:'rgba(3,0,9,.97)',borderTop:`2px solid ${color}33`,padding:'10px 14px'}}>
                        {acts.map((a,ai)=>(
                            <div key={ai} style={{marginBottom:18}}>
                                <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:8,position:'sticky',top:0,background:'rgba(3,0,9,.97)',padding:'3px 0',zIndex:2}}>
                                    <span style={{background:`${ACOLOR[a.act_type]??'#a78bfa'}22`,border:`1px solid ${ACOLOR[a.act_type]??'#a78bfa'}66`,color:ACOLOR[a.act_type]??'#a78bfa',borderRadius:9999,padding:'2px 9px',fontSize:'.58rem',fontWeight:800,textTransform:'uppercase'}}>{ALABEL[a.act_type]}</span>
                                    <span style={{color:'rgba(226,232,240,.5)',fontSize:'.62rem',fontWeight:700}}>Act {a.act_number}: {a.act_title}</span>
                                    <button onClick={()=>gotoAct(ai)}
                                        style={{marginLeft:'auto',background:'rgba(255,255,255,.05)',border:'1px solid rgba(148,163,184,.15)',borderRadius:6,padding:'2px 8px',color:'#64748b',cursor:'pointer',fontSize:'.58rem'}}>
                                        ▶ Go
                                    </button>
                                </div>
                                {/* Setting */}
                                <div style={{color:'rgba(148,163,184,.45)',fontSize:'.62rem',fontStyle:'italic',marginBottom:7}}>
                                    📍 {a.setting?.place} · {a.setting?.time_of_day} · {a.setting?.mood}
                                </div>
                                {/* Screenplay lines */}
                                {a.screenplay.map((line,li)=>{
                                    const lcolor = line.speaker==='narrator'?'#a78bfa'
                                        :line.speaker==='protagonist'?'#fde68a'
                                        :line.speaker==='student_voice'?'#bfdbfe':'#f0abfc';
                                    return (
                                        <div key={li} style={{marginBottom:7,paddingLeft:8,borderLeft:`2px solid ${lcolor}44`,
                                            ...(line.is_concept_reveal?{background:'rgba(240,171,252,.05)',borderRadius:'0 6px 6px 0',padding:'5px 8px'}:{})}}>
                                            {line.is_concept_reveal && <div style={{color:'#f0abfc',fontSize:'.55rem',fontWeight:900,letterSpacing:'.1em',marginBottom:2}}>✦ CONCEPT</div>}
                                            <span style={{color:'rgba(148,163,184,.55)',fontSize:'.58rem',marginRight:5}}>
                                                {line.speaker==='narrator'?'🎙':line.speaker==='protagonist'?cinema.protagonist?.avatar_emoji||'🧑':line.speaker==='student_voice'?'🎓':'💡'}
                                            </span>
                                            <span style={{color:lcolor,fontSize:'clamp(.72rem,1.8vw,.84rem)',lineHeight:1.5,fontStyle:line.speaker==='narrator'?'italic':'normal'}}>
                                                {line.text}
                                            </span>
                                        </div>
                                    );
                                })}
                                {/* Curtain question */}
                                <div style={{marginTop:8,padding:'7px 10px',background:'rgba(167,139,250,.07)',border:'1px solid rgba(167,139,250,.2)',borderRadius:9,color:'#c4b5fd',fontSize:'clamp(.7rem,1.8vw,.82rem)',fontStyle:'italic'}}>
                                    💭 {a.curtain_question}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* CURTAIN QUESTION OVERLAY */}
                {showCurtainQ && act?.curtain_question && (
                    <div style={{position:'absolute',bottom:0,left:0,right:0,zIndex:30,
                        background:'linear-gradient(135deg,rgba(13,0,32,.98),rgba(3,0,9,.98))',
                        borderTop:'1px solid rgba(167,139,250,.28)',padding:'14px 16px',
                        animation:'cd-fadein .4s ease'}}>
                        <p style={{color:'#fff',fontSize:'clamp(.82rem,2.2vw,1.02rem)',fontWeight:700,lineHeight:1.5,margin:'0 0 4px',textAlign:'center'}}>{act.curtain_question}</p>
                        <p style={{color:'#a78bfa',fontSize:'.73rem',fontStyle:'italic',margin:'0 0 11px',textAlign:'center'}}>💭 Think about it…</p>
                        <button onClick={handleContinue}
                            style={{display:'block',margin:'0 auto',background:'linear-gradient(135deg,#4f46e5,#7c3aed)',color:'#fff',border:'none',borderRadius:12,padding:'9px 26px',fontWeight:800,fontSize:'.86rem',cursor:'pointer'}}>
                            {actIdx===2?'🍿 Interval →':actIdx>=lastIdx?'📝 Exam Spotlight →':'Next Act →'}
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
