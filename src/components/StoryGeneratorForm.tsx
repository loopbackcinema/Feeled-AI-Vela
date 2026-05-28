import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoryRequest } from '../types';
import { STD_OPTIONS, NARRATOR_VOICE_OPTIONS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle } from '../firebase';
import { updateRecentTopic, updateRecentMode, getStudentMemory } from '../services/memoryService';
import { canUseFeature, incrementUsage } from '../services/subscriptionService';
import { useSubscription } from '../context/SubscriptionContext';

interface StoryGeneratorFormProps {
    onSubmit: (request: StoryRequest) => void;
    isLoading: boolean;
    error: string | null;
}

const micIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
);

const PLACEHOLDERS = [
    'Gravity...', 'Photosynthesis...', 'French Revolution...',
    'Fractions...', 'Solar System...', 'Electricity...',
];

const LOADING_STAGES = [
    '✨ Creating characters...',
    '🎭 Building emotional scenes...',
    '📖 Writing your story...',
    '🎨 Adding final details...',
];

const STYLE_CARDS = [
    {
        emoji: '🌟', label: 'Adventure', sub: 'Exciting journey', tone: 'Motivational',
        selGradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
        selBorder: '#fbbf24', selColor: 'white',
        unselBg: '#1c1008', unselBorder: '#78450a', unselColor: '#f59e0b',
    },
    {
        emoji: '😂', label: 'Funny', sub: 'Playful & fun', tone: 'Funny',
        selGradient: 'linear-gradient(135deg, #10b981, #059669)',
        selBorder: '#34d399', selColor: 'white',
        unselBg: '#041a10', unselBorder: '#065f46', unselColor: '#34d399',
    },
    {
        emoji: '🧠', label: 'Deep', sub: 'Smart explanation', tone: 'Curious',
        selGradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        selBorder: '#60a5fa', selColor: 'white',
        unselBg: '#030f25', unselBorder: '#1e3a5f', unselColor: '#60a5fa',
    },
    {
        emoji: '🎭', label: 'Emotional', sub: 'Immersive feel', tone: 'Moral',
        selGradient: 'linear-gradient(135deg, #ec4899, #be185d)',
        selBorder: '#f472b6', selColor: 'white',
        unselBg: '#1a0420', unselBorder: '#7c2d5a', unselColor: '#f472b6',
    },
    {
        emoji: '🚀', label: 'Sci-Fi', sub: 'Futuristic world', tone: 'Inspiring',
        selGradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
        selBorder: '#22d3ee', selColor: 'white',
        unselBg: '#041a1e', unselBorder: '#0e4a54', unselColor: '#22d3ee',
    },
];

const LANG_PILLS = ['English', 'Tamil', 'Tanglish'];

const STARS = [
    { top: '8%',  left: '12%', size: 5, color: '#fbbf24', dur: '3.2s', delay: '0s'   },
    { top: '14%', left: '78%', size: 4, color: '#818cf8', dur: '4.5s', delay: '0.8s' },
    { top: '30%', left: '90%', size: 6, color: '#34d399', dur: '3.8s', delay: '1.4s' },
    { top: '22%', left: '5%',  size: 4, color: '#f472b6', dur: '5.0s', delay: '0.3s' },
    { top: '42%', left: '55%', size: 5, color: '#60a5fa', dur: '4.2s', delay: '1.9s' },
];

const StoryGeneratorForm: React.FC<StoryGeneratorFormProps> = ({ onSubmit, isLoading, error }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { isPlus, dailyUsage, showUpgrade } = useSubscription();

    const [topic, setTopic]                 = useState('');
    const [isListening, setIsListening]     = useState(false);
    const [std, setStd]                     = useState(STD_OPTIONS[4]);
    const [langPill, setLangPill]           = useState('English');
    const [narratorVoice, setNarratorVoice] = useState(NARRATOR_VOICE_OPTIONS.English[0]);
    const [selectedStyle, setSelectedStyle] = useState(2);
    const [memoryCtx, setMemoryCtx]         = useState<{grade:string;subject:string;language:string}|null>(null);
    const [inputFocused, setInputFocused]   = useState(false);
    const [isLoggingIn, setIsLoggingIn]     = useState(false);
    const [phIdx, setPhIdx]                 = useState(0);
    const [stageIdx, setStageIdx]           = useState(0);

    useEffect(() => {
        if (isLoading) return;
        const id = setInterval(() => setPhIdx(i => (i + 1) % PLACEHOLDERS.length), 2500);
        return () => clearInterval(id);
    }, [isLoading]);

    useEffect(() => {
        if (!isLoading) { setStageIdx(0); return; }
        const id = setInterval(() => setStageIdx(i => (i + 1) % LOADING_STAGES.length), 1500);
        return () => clearInterval(id);
    }, [isLoading]);

    useEffect(() => {
        if (!user) return;
        Promise.race([
            getStudentMemory(user.uid),
            new Promise<null>(resolve => setTimeout(() => resolve(null), 2000)),
        ]).then(mem => {
            if (!mem) return;
            if (mem.preferredLanguage) {
                setLangPill(mem.preferredLanguage);
                const v = (mem.preferredLanguage === 'Tanglish' ? 'English' : mem.preferredLanguage) as keyof typeof NARRATOR_VOICE_OPTIONS;
                setNarratorVoice(NARRATOR_VOICE_OPTIONS[v][0]);
            }
            if (mem.learningGoal) {
                const goalToStd: Record<string, string> = { '10th Board': '10th STD', '12th Board': '12th STD', 'NEET': '12th STD', 'JEE': '12th STD' };
                const mapped = goalToStd[mem.learningGoal];
                if (mapped) setStd(mapped);
            }
            const recentSubject = mem.recentTopics?.[0]?.subject || '';
            const gradeLabel = mem.learningGoal === '10th Board' ? 'Grade 10' : mem.learningGoal === '12th Board' ? 'Grade 12' : mem.learningGoal === 'NEET' ? 'NEET' : mem.learningGoal === 'JEE' ? 'JEE' : '';
            setMemoryCtx({ grade: gradeLabel, subject: recentSubject, language: mem.preferredLanguage });
        });
    }, [user]);

    const apiLanguage = (langPill === 'Tanglish' ? 'English' : langPill) as keyof typeof NARRATOR_VOICE_OPTIONS;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !topic.trim()) return;
        const { allowed } = await canUseFeature(user.uid, 'stories');
        if (!allowed) { showUpgrade('stories'); return; }
        incrementUsage(user.uid, 'stories').catch(() => {});
        onSubmit({ topic, std, language: apiLanguage, narratorVoice, emotionTone: STYLE_CARDS[selectedStyle].tone });
        // Memory engine — fire-and-forget
        updateRecentTopic({ uid: user.uid, topic: topic.trim(), subject: 'General', source: 'story' });
        updateRecentMode({ uid: user.uid, mode: 'story' });
    };

    const startListening = () => {
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) { alert('Speech recognition not supported in this browser.'); return; }
        const r = new SR();
        r.lang = langPill === 'Tamil' ? 'ta-IN' : 'en-US';
        r.interimResults = false;
        r.onstart  = () => setIsListening(true);
        r.onend    = () => setIsListening(false);
        r.onerror  = () => setIsListening(false);
        r.onresult = (ev: any) => setTopic(ev.results[0][0].transcript);
        r.start();
    };

    // ── Loading state ──────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', width: '100%', margin: 0, padding: 0, background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 40%, #24243e 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
                <style>{`
                    @keyframes pulseDot  { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }
                    @keyframes fadeSlide { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
                `}</style>
                <img src="/feeled-logo.webp" alt="FeelEd AI" style={{ width: 72, height: 72, borderRadius: 18, opacity: 0.9 }} />
                <div style={{ textAlign: 'center', animation: 'fadeSlide 0.4s ease both' }}>
                    <p style={{ color: '#c4b5fd', fontSize: 14, fontWeight: 600, marginBottom: 18 }}>{LOADING_STAGES[stageIdx]}</p>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        {[0, 1, 2].map(d => (
                            <span key={d} style={{ width: 8, height: 8, borderRadius: '50%', background: '#4f46e5', display: 'inline-block', animation: `pulseDot 1.2s ease-in-out ${d * 0.2}s infinite` }} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ── Form ───────────────────────────────────────────────────────────────────
    return (
        <>
            <style>{`
                @keyframes twinkle {
                    0%,100% { opacity: 0.3; transform: scale(0.8); }
                    50%     { opacity: 1;   transform: scale(1.2); }
                }
                @keyframes buttonPulse {
                    0%,100% { box-shadow: 0 4px 20px #4f46e550; }
                    50%     { box-shadow: 0 4px 40px #4f46e580, 0 0 60px #7c3aed30; }
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes floatA { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
                @keyframes floatB { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
                @keyframes floatC { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-10px) rotate(10deg)} }
                .sgf-pulse { animation: buttonPulse 2s ease-in-out infinite; }
                .sgf-pulse:hover { transform: translateY(-2px) scale(1.01); transition: transform 0.2s ease; }
                .sgf-card  { transition: all 0.2s ease; cursor: pointer; }
                .sgf-card:hover { transform: translateY(-2px) scale(1.04); }
                .sgf-cards-grid {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 8px;
                }
                @media (max-width: 480px) {
                    .sgf-cards-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                    .sgf-cards-grid > :nth-child(4),
                    .sgf-cards-grid > :nth-child(5) {
                        grid-column: span 1;
                    }
                    .sgf-cards-grid-last {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 8px;
                    }
                }
            `}</style>

            {/* Outermost — full viewport, no white borders */}
            <div style={{
                minHeight: '100vh',
                width: '100%',
                margin: 0,
                padding: 0,
                background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 40%, #24243e 100%)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
            }}>

                {/* Ambient blobs */}
                <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, background: 'radial-gradient(circle, #7c3aed40, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: 0, right: -50, width: 300, height: 300, background: 'radial-gradient(circle, #2563eb30, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: 100, left: '50%', transform: 'translateX(-50%)', width: 350, height: 350, background: 'radial-gradient(circle, #db277740, transparent 70%)', pointerEvents: 'none' }} />

                {/* Floating stars */}
                {STARS.map((s, i) => (
                    <div key={i} style={{ position: 'absolute', top: s.top, left: s.left, width: s.size, height: s.size, borderRadius: '50%', background: s.color, animation: `twinkle ${s.dur} ease-in-out ${s.delay} infinite`, pointerEvents: 'none' }} />
                ))}

                {/* Inner content — full width, no max-width cap */}
                <div style={{ position: 'relative', zIndex: 10, width: '100%', padding: '20px 24px 80px', boxSizing: 'border-box' }}>

                    {/* Back */}
                    <div style={{ marginBottom: 16 }}>
                        <button onClick={() => navigate('/')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#7c7ca8', fontSize: 13, fontWeight: 600, background: 'none', border: '0.5px solid #3a3a5a', borderRadius: 8, padding: '6px 14px', cursor: 'pointer' }}>
                            ← Home
                        </button>
                    </div>

                    {/* Hero */}
                    <div style={{position:'relative', textAlign:'center', padding:'24px 16px 0'}}>
                        <div style={{position:'absolute', top:'10px', left:'10%', fontSize:'24px', animation:'floatA 4s ease-in-out infinite', opacity:0.6, pointerEvents:'none'}}>📚</div>
                        <div style={{position:'absolute', top:'20px', right:'15%', fontSize:'20px', animation:'floatB 5s ease-in-out infinite', opacity:0.5, pointerEvents:'none'}}>✨</div>
                        <div style={{position:'absolute', top:'40px', left:'25%', fontSize:'16px', animation:'floatC 3.5s ease-in-out infinite', opacity:0.4, pointerEvents:'none'}}>🌟</div>
                        <div style={{position:'absolute', top:'15px', right:'30%', fontSize:'18px', animation:'floatA 4.5s ease-in-out infinite', opacity:0.5, pointerEvents:'none'}}>🎭</div>
                        <div style={{display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(124,58,237,0.2)', border:'1px solid rgba(167,139,250,0.4)', borderRadius:'24px', padding:'6px 16px', marginBottom:'16px'}}>
                            <span style={{fontSize:'16px'}}>✨</span>
                            <span style={{color:'#c4b5fd', fontSize:'12px', fontWeight:'600', letterSpacing:'0.5px'}}>STORY MODE</span>
                            <span style={{fontSize:'16px'}}>✨</span>
                        </div>
                        <h1 style={{fontSize:'clamp(22px, 5vw, 32px)', fontWeight:'800', background:'linear-gradient(135deg, #ffffff, #c4b5fd, #818cf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', margin:'0 0 8px', lineHeight:'1.2', letterSpacing:'-0.5px'}}>
                            Turn any lesson into a<br/>
                            <span style={{background:'linear-gradient(135deg, #f472b6, #a855f7, #6366f1)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text'}}>cinematic AI story</span>
                        </h1>
                        <p style={{color:'rgba(196,181,253,0.7)', fontSize:'14px', margin:'0 0 24px'}}>
                            Learn through characters, emotion, and imagination 🎬
                        </p>
                    </div>

                    {/* Memory context confirmation */}
                    {memoryCtx && (memoryCtx.grade || memoryCtx.subject) && (
                        <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', background:'rgba(79,70,229,0.08)', border:'0.5px solid rgba(99,102,241,0.2)', borderRadius:'10px', padding:'7px 14px', marginBottom:'4px', fontSize:'11px', color:'#7070a0'}}>
                            <span>📚</span>
                            <span>Using your learning context: {[memoryCtx.grade, memoryCtx.subject, memoryCtx.language].filter(Boolean).join(' · ')}</span>
                            <button type="button" onClick={() => setMemoryCtx(null)} style={{color:'#4f46e5', background:'none', border:'none', cursor:'pointer', fontSize:'11px', fontWeight:600, padding:0}}>Change</button>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div style={{ background: '#2d0a0a', border: '0.5px solid #7f1d1d', color: '#fca5a5', padding: '10px 16px', borderRadius: 12, fontSize: 13, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                        {/* ── Topic input ───────────────────────────────── */}
                        <div>
                            <label style={{ display: 'block', color: '#8080b0', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                                What should we turn into a story?
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={e => setTopic(e.target.value)}
                                    placeholder={PLACEHOLDERS[phIdx]}
                                    required
                                    onFocus={() => setInputFocused(true)}
                                    onBlur={() => setInputFocused(false)}
                                    style={{ width: '100%', background: 'rgba(12,12,28,0.7)', border: `1px solid ${inputFocused ? '#4f46e5' : '#3a3a5a'}`, borderRadius: 14, color: '#eeeef8', fontSize: 16, padding: '14px 52px 14px 18px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s', boxShadow: inputFocused ? '0 0 24px #4f46e535' : 'none', backdropFilter: 'blur(8px)' }}
                                />
                                <button
                                    type="button"
                                    onClick={startListening}
                                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: isListening ? '#3b0000' : 'transparent', border: 'none', cursor: 'pointer', color: isListening ? '#ef4444' : '#4f46e5', borderRadius: 8, padding: 4, display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                                    title={isListening ? 'Listening…' : 'Voice input'}
                                >
                                    {micIcon}
                                </button>
                            </div>
                        </div>

                        {/* ── Story style cards — full-width grid ───────── */}
                        <div>
                            <label style={{ display: 'block', color: '#8080b0', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                                Choose your story style
                            </label>
                            <div className="sgf-cards-grid">
                                {STYLE_CARDS.map((card, i) => {
                                    const sel = selectedStyle === i;
                                    return (
                                        <div
                                            key={card.label}
                                            className="sgf-card"
                                            onClick={() => setSelectedStyle(i)}
                                            style={{
                                                borderRadius: 12, padding: '10px 12px', userSelect: 'none',
                                                background: sel ? card.selGradient : card.unselBg,
                                                border: `1px solid ${sel ? card.selBorder : card.unselBorder}`,
                                                boxShadow: sel ? `0 4px 16px ${card.selBorder}40` : 'none',
                                            }}
                                        >
                                            <div style={{ fontSize: 18, marginBottom: 4 }}>{card.emoji}</div>
                                            <div style={{ color: sel ? card.selColor : card.unselColor, fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{card.label}</div>
                                            <div style={{ color: sel ? 'rgba(255,255,255,0.8)' : card.unselColor, fontSize: 10, opacity: sel ? 0.9 : 0.7 }}>{card.sub}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── Language pills ────────────────────────────── */}
                        <div>
                            <label style={{ display: 'block', color: '#8080b0', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                                Language
                            </label>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {LANG_PILLS.map(lang => {
                                    const sel = langPill === lang;
                                    return (
                                        <button
                                            key={lang}
                                            type="button"
                                            onClick={() => {
                                                setLangPill(lang);
                                                const v = (lang === 'Tanglish' ? 'English' : lang) as keyof typeof NARRATOR_VOICE_OPTIONS;
                                                setNarratorVoice(NARRATOR_VOICE_OPTIONS[v][0]);
                                            }}
                                            style={{ borderRadius: 999, padding: '6px 18px', fontSize: 12, fontWeight: 600, border: `1px solid ${sel ? '#4f46e5' : '#3a3a5a'}`, background: sel ? '#4f46e5' : 'rgba(13,13,28,0.6)', color: sel ? 'white' : '#7070a0', cursor: 'pointer', transition: 'all 0.2s ease' }}
                                        >
                                            {lang}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── Target Level + Voice Persona ─────────────── */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            <div>
                                <label style={{ display: 'block', color: '#5a5a8a', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Target Level</label>
                                <select
                                    value={std}
                                    onChange={e => setStd(e.target.value)}
                                    style={{ width: '100%', background: 'rgba(12,12,28,0.8)', border: '0.5px solid #3a3a5a', borderRadius: 10, color: '#9090b8', fontSize: 12, padding: '8px 10px', outline: 'none', cursor: 'pointer' }}
                                >
                                    {STD_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', color: '#5a5a8a', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Voice Persona</label>
                                <select
                                    value={narratorVoice}
                                    onChange={e => setNarratorVoice(e.target.value)}
                                    style={{ width: '100%', background: 'rgba(12,12,28,0.8)', border: '0.5px solid #3a3a5a', borderRadius: 10, color: '#9090b8', fontSize: 12, padding: '8px 10px', outline: 'none', cursor: 'pointer' }}
                                >
                                    {NARRATOR_VOICE_OPTIONS[apiLanguage].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* ── Generate / Login button ───────────────────── */}
                        {user ? (
                            <>
                            <button
                                type="submit"
                                className="sgf-pulse"
                                disabled={isLoading}
                                style={{ width: '100%', height: 56, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: 16, color: 'white', fontSize: 16, fontWeight: 700, border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}
                            >
                                ✨ Generate AI Story
                            </button>
                            {!isPlus && <div style={{textAlign:'center',color:'#a78bfa',fontSize:'11px',marginTop:'8px',background:'rgba(79,70,229,0.1)',border:'0.5px solid rgba(79,70,229,0.3)',borderRadius:'8px',padding:'6px 12px'}}>{Math.max(0, 3 - (dailyUsage?.stories || 0))} of 3 free stories remaining today</div>}
                            </>
                        ) : (
                            <button
                                type="button"
                                disabled={isLoggingIn}
                                onClick={async () => {
                                    try { setIsLoggingIn(true); await signInWithGoogle(); }
                                    catch (err: any) { alert(err.message || 'Login failed. Please check if popups are blocked.'); }
                                    finally { setIsLoggingIn(false); }
                                }}
                                style={{ width: '100%', height: 56, background: isLoggingIn ? '#4338ca' : 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: 16, color: 'white', fontSize: 16, fontWeight: 700, border: 'none', cursor: isLoggingIn ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                            >
                                {isLoggingIn ? (
                                    <><span style={{ width: 18, height: 18, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} /> Authenticating…</>
                                ) : (
                                    <><span>🔑</span> Login with Google to Start</>
                                )}
                            </button>
                        )}

                        {/* Trouble logging in */}
                        {!user && (
                            <div style={{ borderTop: '0.5px solid #2a2a4a', paddingTop: 12 }}>
                                <details>
                                    <summary style={{ cursor: 'pointer', color: '#4a4a6a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', listStyle: 'none', textAlign: 'center' }}>
                                        ❓ Trouble Logging In?
                                    </summary>
                                    <div style={{ marginTop: 10, background: 'rgba(10,10,22,0.7)', border: '0.5px solid #2a2a4a', borderRadius: 12, padding: '12px 16px', fontSize: 12, color: '#4a4a6a', lineHeight: 1.7 }}>
                                        <p style={{ marginBottom: 8 }}>If the login button doesn't respond or shows an error:</p>
                                        <ul style={{ paddingLeft: 16, margin: 0 }}>
                                            <li><strong style={{ color: '#6060a0' }}>Pop-ups:</strong> Ensure your browser allows pop-ups for this site.</li>
                                            <li><strong style={{ color: '#6060a0' }}>Third-Party Cookies:</strong> Firebase requires third-party cookies. Try Incognito Mode.</li>
                                            <li><strong style={{ color: '#6060a0' }}>Brave/Safari:</strong> Disable Shields or Cross-Site Tracking prevention.</li>
                                        </ul>
                                    </div>
                                </details>
                            </div>
                        )}

                    </form>
                </div>
            </div>
        </>
    );
};

export default StoryGeneratorForm;
