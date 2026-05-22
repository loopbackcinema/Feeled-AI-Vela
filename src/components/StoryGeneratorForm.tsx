import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoryRequest } from '../types';
import { STD_OPTIONS, NARRATOR_VOICE_OPTIONS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle } from '../firebase';

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
    { emoji: '🌟', label: 'Adventure', sub: 'Exciting journey',  tone: 'Motivational',
      selBg: '#1a1040', selBorder: '#4c3a99', selColor: '#c4b5fd' },
    { emoji: '😂', label: 'Funny',     sub: 'Playful & fun',     tone: 'Funny',
      selBg: '#0a3520', selBorder: '#1a6b45', selColor: '#6ee7b7' },
    { emoji: '🧠', label: 'Deep',      sub: 'Smart explanation', tone: 'Curious',
      selBg: '#1c1004', selBorder: '#5a3d08', selColor: '#fcd34d' },
    { emoji: '🎭', label: 'Emotional', sub: 'Immersive feel',    tone: 'Moral',
      selBg: '#1a0430', selBorder: '#7c2d8a', selColor: '#e879f9' },
    { emoji: '🚀', label: 'Sci-Fi',    sub: 'Futuristic world',  tone: 'Inspiring',
      selBg: '#041a1a', selBorder: '#0a5a5a', selColor: '#67e8f9' },
];

const LANG_PILLS = ['English', 'Tamil', 'Tanglish'];

const StoryGeneratorForm: React.FC<StoryGeneratorFormProps> = ({ onSubmit, isLoading, error }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [topic, setTopic]                   = useState('');
    const [isListening, setIsListening]       = useState(false);
    const [std, setStd]                       = useState(STD_OPTIONS[4]);
    const [langPill, setLangPill]             = useState('English');
    const [narratorVoice, setNarratorVoice]   = useState(NARRATOR_VOICE_OPTIONS.English[0]);
    const [selectedStyle, setSelectedStyle]   = useState(2); // default: Deep
    const [moreOpen, setMoreOpen]             = useState(false);
    const [inputFocused, setInputFocused]     = useState(false);
    const [isLoggingIn, setIsLoggingIn]       = useState(false);
    const [phIdx, setPhIdx]                   = useState(0);
    const [stageIdx, setStageIdx]             = useState(0);

    // Rotate placeholders when idle
    useEffect(() => {
        if (isLoading) return;
        const id = setInterval(() => setPhIdx(i => (i + 1) % PLACEHOLDERS.length), 2500);
        return () => clearInterval(id);
    }, [isLoading]);

    // Cycle loading stages
    useEffect(() => {
        if (!isLoading) { setStageIdx(0); return; }
        const id = setInterval(() => setStageIdx(i => (i + 1) % LOADING_STAGES.length), 1500);
        return () => clearInterval(id);
    }, [isLoading]);

    const apiLanguage = (langPill === 'Tanglish' ? 'English' : langPill) as keyof typeof NARRATOR_VOICE_OPTIONS;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !topic.trim()) return;
        onSubmit({ topic, std, language: apiLanguage, narratorVoice, emotionTone: STYLE_CARDS[selectedStyle].tone });
    };

    const startListening = () => {
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) { alert('Speech recognition not supported in this browser.'); return; }
        const r = new SR();
        r.lang = langPill === 'Tamil' ? 'ta-IN' : 'en-US';
        r.interimResults = false;
        r.onstart = () => setIsListening(true);
        r.onend   = () => setIsListening(false);
        r.onerror = () => setIsListening(false);
        r.onresult = (ev: any) => setTopic(ev.results[0][0].transcript);
        r.start();
    };

    // ── Loading state ──────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', background: '#07070e', backgroundImage: 'linear-gradient(#ffffff05 1px, transparent 1px), linear-gradient(90deg, #ffffff05 1px, transparent 1px)', backgroundSize: '24px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
                <style>{`
                    @keyframes pulseDot { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }
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
                @keyframes buttonPulse {
                    0%,100% { box-shadow: 0 4px 20px #4f46e550; }
                    50%     { box-shadow: 0 4px 40px #4f46e580, 0 0 60px #7c3aed30; }
                }
                @keyframes floatParticle {
                    0%,100% { transform: translateY(0) translateX(0); opacity: 0.4; }
                    50%     { transform: translateY(-20px) translateX(5px); opacity: 0.8; }
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                .sgf-pulse { animation: buttonPulse 2s ease-in-out infinite; }
                .sgf-pulse:hover { transform: translateY(-2px) scale(1.01); transition: transform 0.2s ease; }
                .sgf-card  { transition: all 0.2s ease; cursor: pointer; }
                .sgf-card:hover { transform: translateY(-2px) scale(1.04); }
            `}</style>

            <div style={{ width: '100%', minHeight: '100vh', background: '#07070e', backgroundImage: 'linear-gradient(#ffffff05 1px, transparent 1px), linear-gradient(90deg, #ffffff05 1px, transparent 1px)', backgroundSize: '24px 24px', position: 'relative', overflow: 'hidden' }}>

                {/* Ambient blobs */}
                <div style={{ position: 'absolute', top: -60, left: -40, width: 300, height: 250, background: 'radial-gradient(ellipse at center, #4c3a9925 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: -40, right: -40, width: 250, height: 200, background: 'radial-gradient(ellipse at center, #1a3a6a20 0%, transparent 70%)', pointerEvents: 'none' }} />

                {/* Floating particles */}
                {([
                    { top: '12%', left: '8%',  size: 7, delay: '0s',  dur: '7s' },
                    { top: '20%', left: '88%', size: 6, delay: '2s',  dur: '8s' },
                    { top: '40%', left: '82%', size: 8, delay: '4s',  dur: '6s' },
                ] as { top: string; left: string; size: number; delay: string; dur: string }[]).map((p, i) => (
                    <div key={i} style={{ position: 'absolute', top: p.top, left: p.left, width: p.size, height: p.size, borderRadius: '50%', background: '#818cf840', animation: `floatParticle ${p.dur} ease-in-out ${p.delay} infinite`, pointerEvents: 'none' }} />
                ))}

                <div style={{ position: 'relative', zIndex: 10, maxWidth: 600, margin: '0 auto', padding: '40px 20px 64px' }}>

                    {/* Back */}
                    <div style={{ marginBottom: 28 }}>
                        <button onClick={() => navigate('/')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#4a4a6a', fontSize: 13, fontWeight: 600, background: 'none', border: '0.5px solid #2a2a4a', borderRadius: 8, padding: '6px 14px', cursor: 'pointer' }}>
                            ← Home
                        </button>
                    </div>

                    {/* Hero */}
                    <div style={{ textAlign: 'center', marginBottom: 40 }}>
                        <span style={{ display: 'inline-block', background: '#1e1258', border: '0.5px solid #4c3a99', color: '#a78bfa', borderRadius: 999, padding: '6px 16px', fontSize: 12, fontWeight: 600, marginBottom: 18 }}>
                            ✨ Story Mode
                        </span>
                        <h1 style={{ color: '#eeeef8', fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, margin: '0 0 12px', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                            Turn any lesson into a<br />cinematic AI story
                        </h1>
                        <p style={{ color: '#4a4a6a', fontSize: 14, margin: 0 }}>
                            Learn through characters, emotion, and imagination.
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{ background: '#2d0a0a', border: '0.5px solid #7f1d1d', color: '#fca5a5', padding: '12px 16px', borderRadius: 12, fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        {/* ── Topic input ───────────────────────────────── */}
                        <div style={{ marginBottom: 28 }}>
                            <label style={{ display: 'block', color: '#9090b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
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
                                    style={{ width: '100%', background: '#0c0c1c', border: `1px solid ${inputFocused ? '#4f46e5' : '#2a2a4a'}`, borderRadius: 16, color: '#eeeef8', fontSize: 16, padding: '16px 52px 16px 20px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s', boxShadow: inputFocused ? '0 0 20px #4f46e530' : 'none' }}
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

                        {/* ── Story style cards ─────────────────────────── */}
                        <div style={{ marginBottom: 28 }}>
                            <label style={{ display: 'block', color: '#9090b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
                                Choose your story style
                            </label>
                            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
                                {STYLE_CARDS.map((card, i) => {
                                    const sel = selectedStyle === i;
                                    return (
                                        <div
                                            key={card.label}
                                            className="sgf-card"
                                            onClick={() => setSelectedStyle(i)}
                                            style={{ minWidth: 100, background: sel ? card.selBg : '#0d0d1c', border: `1px solid ${sel ? card.selBorder : '#1e1e35'}`, borderRadius: 14, padding: '12px 14px', flexShrink: 0, userSelect: 'none' }}
                                        >
                                            <div style={{ fontSize: 20, marginBottom: 6 }}>{card.emoji}</div>
                                            <div style={{ color: sel ? card.selColor : '#5a5a8a', fontSize: 12, fontWeight: 700, marginBottom: 3 }}>{card.label}</div>
                                            <div style={{ color: sel ? card.selColor : '#2a2a4a', fontSize: 10, opacity: 0.9 }}>{card.sub}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── Language pills ────────────────────────────── */}
                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', color: '#9090b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
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
                                            style={{ borderRadius: 999, padding: '6px 16px', fontSize: 12, fontWeight: 600, border: `0.5px solid ${sel ? '#4f46e5' : '#1e1e35'}`, background: sel ? '#4f46e5' : '#0d0d1c', color: sel ? 'white' : '#5a5a8a', cursor: 'pointer', transition: 'all 0.2s ease' }}
                                        >
                                            {lang}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── More options (collapsible) ────────────────── */}
                        <div style={{ marginBottom: 28 }}>
                            <button
                                type="button"
                                onClick={() => setMoreOpen(o => !o)}
                                style={{ background: 'none', border: 'none', color: '#333360', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, padding: 0 }}
                            >
                                <span style={{ display: 'inline-block', transition: 'transform 0.2s', transform: moreOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
                                ⚙️ More options
                            </button>
                            <div style={{ maxHeight: moreOpen ? 160 : 0, overflow: 'hidden', transition: 'max-height 0.3s ease', marginTop: moreOpen ? 12 : 0 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, paddingTop: 2 }}>
                                    <div>
                                        <label style={{ display: 'block', color: '#6060a0', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Target Level</label>
                                        <select
                                            value={std}
                                            onChange={e => setStd(e.target.value)}
                                            style={{ width: '100%', background: '#0c0c1c', border: '0.5px solid #2a2a4a', borderRadius: 10, color: '#9090b8', fontSize: 12, padding: '8px 10px', outline: 'none', cursor: 'pointer' }}
                                        >
                                            {STD_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', color: '#6060a0', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Voice Persona</label>
                                        <select
                                            value={narratorVoice}
                                            onChange={e => setNarratorVoice(e.target.value)}
                                            style={{ width: '100%', background: '#0c0c1c', border: '0.5px solid #2a2a4a', borderRadius: 10, color: '#9090b8', fontSize: 12, padding: '8px 10px', outline: 'none', cursor: 'pointer' }}
                                        >
                                            {NARRATOR_VOICE_OPTIONS[apiLanguage].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Generate / Login button ───────────────────── */}
                        {user ? (
                            <button
                                type="submit"
                                className="sgf-pulse"
                                disabled={isLoading}
                                style={{ width: '100%', height: 56, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: 16, color: 'white', fontSize: 16, fontWeight: 700, border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}
                            >
                                ✨ Generate AI Story
                            </button>
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
                            <div style={{ borderTop: '0.5px solid #1e1e35', paddingTop: 16, marginTop: 16 }}>
                                <details>
                                    <summary style={{ cursor: 'pointer', color: '#4a4a6a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', listStyle: 'none', textAlign: 'center' }}>
                                        ❓ Trouble Logging In?
                                    </summary>
                                    <div style={{ marginTop: 12, background: '#0a0a16', border: '0.5px solid #1e1e35', borderRadius: 12, padding: '14px 16px', fontSize: 12, color: '#4a4a6a', lineHeight: 1.7 }}>
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
