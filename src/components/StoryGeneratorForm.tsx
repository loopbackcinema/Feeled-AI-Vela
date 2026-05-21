
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoryRequest } from '../types';
import { STD_OPTIONS, LANGUAGE_OPTIONS, NARRATOR_VOICE_OPTIONS, EMOTION_TONE_OPTIONS } from '../constants';
import LoadingIndicator from './LoadingIndicator';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle } from '../firebase';

interface StoryGeneratorFormProps {
    onSubmit: (request: StoryRequest) => void;
    isLoading: boolean;
    error: string | null;
}

const micIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
);

const StoryGeneratorForm: React.FC<StoryGeneratorFormProps> = ({ onSubmit, isLoading, error }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [topic, setTopic] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [std, setStd] = useState(STD_OPTIONS[4]);
    const [language, setLanguage] = useState<keyof typeof NARRATOR_VOICE_OPTIONS>(LANGUAGE_OPTIONS[0] as keyof typeof NARRATOR_VOICE_OPTIONS);
    const [narratorVoice, setNarratorVoice] = useState(NARRATOR_VOICE_OPTIONS.English[0]);
    const [emotionTone, setEmotionTone] = useState(EMOTION_TONE_OPTIONS[0]);
    const [submittedRequest, setSubmittedRequest] = useState<StoryRequest | null>(null);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!topic.trim()) return;
        const request = { topic, std, language, narratorVoice, emotionTone };
        setSubmittedRequest(request);
        onSubmit(request);
    };

    const startListening = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Speech recognition is not supported in this browser.');
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = language === 'Tamil' ? 'ta-IN' : 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);
        recognition.onresult = (event: any) => {
            setTopic(event.results[0][0].transcript);
        };
        recognition.start();
    };

    if (isLoading && submittedRequest) return <LoadingIndicator request={submittedRequest} />;

    return (
        <>
            <style>{`
                @keyframes buttonGlow {
                    0%, 100% { box-shadow: 0 4px 20px #4f46e540; }
                    50% { box-shadow: 0 4px 35px #4f46e570, 0 0 60px #7c3aed30; }
                }
                @keyframes floatA {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-12px); }
                }
                @keyframes floatB {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }
                .story-glow-btn {
                    animation: buttonGlow 2s ease-in-out infinite;
                    transition: transform 0.2s ease, filter 0.2s ease;
                }
                .story-glow-btn:hover {
                    transform: translateY(-2px) scale(1.01);
                }
                .particle-a { animation: floatA 7s ease-in-out infinite; }
                .particle-b { animation: floatB 5s ease-in-out infinite; }
            `}</style>

            <div
                className="w-full min-h-screen"
                style={{
                    background: '#07070e',
                    backgroundImage: 'linear-gradient(#ffffff05 1px, transparent 1px), linear-gradient(90deg, #ffffff05 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Ambient blobs */}
                <div className="particle-a" style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 400, height: 300, background: 'radial-gradient(ellipse at center, #4c3a9925 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div className="particle-b" style={{ position: 'absolute', bottom: 60, right: -60, width: 280, height: 280, background: 'radial-gradient(ellipse at center, #1a6b4520 0%, transparent 70%)', pointerEvents: 'none' }} />

                <div className="relative z-10 w-full max-w-2xl mx-auto px-4 py-10">

                    {/* Back home */}
                    <div className="mb-6">
                        <button
                            onClick={() => navigate('/')}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#4a4a6a', fontSize: 13, fontWeight: 600, background: 'none', border: '0.5px solid #2a2a4a', borderRadius: 8, padding: '6px 14px', cursor: 'pointer' }}
                        >
                            ← Home
                        </button>
                    </div>

                    {/* Title area */}
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <span style={{ display: 'inline-block', background: '#1e1258', border: '0.5px solid #4c3a99', color: '#a78bfa', borderRadius: 999, padding: '4px 16px', fontSize: 13, marginBottom: 14 }}>
                            ✨ Story Mode
                        </span>
                        <h1 style={{ color: '#eeeef8', fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: '-0.3px' }}>
                            Professional Story Mode
                        </h1>
                        <p style={{ color: '#5a5a8a', fontSize: 14, marginTop: 8 }}>
                            Turn any concept into an emotion-driven story
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{ background: '#2d0a0a', border: '0.5px solid #7f1d1d', color: '#fca5a5', padding: '12px 16px', borderRadius: 12, fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        {/* Topic input card */}
                        <div style={{ background: '#0d0d1c', border: '0.5px solid #1e1e35', borderRadius: 16, padding: '20px', marginBottom: 12 }}>
                            <label style={{ display: 'block', color: '#9090b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>
                                📚 Academic Topic
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={e => setTopic(e.target.value)}
                                    placeholder="e.g., Photosynthesis, The Water Cycle, Quantum Mechanics..."
                                    required
                                    style={{ width: '100%', background: '#060610', border: '0.5px solid #2a2a4a', borderRadius: 12, color: '#eeeef8', fontSize: 15, padding: '12px 52px 12px 16px', outline: 'none', boxSizing: 'border-box' }}
                                    // @ts-ignore
                                    onFocus={e => e.target.style.borderColor = '#4f46e5'}
                                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#2a2a4a'}
                                />
                                <button
                                    type="button"
                                    onClick={startListening}
                                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: isListening ? '#3b0000' : 'transparent', border: 'none', cursor: 'pointer', color: isListening ? '#ef4444' : '#4f46e5', borderRadius: 8, padding: 4, display: 'flex', alignItems: 'center' }}
                                    title={isListening ? 'Listening…' : 'Voice input'}
                                >
                                    {micIcon}
                                </button>
                            </div>
                        </div>

                        {/* Settings grid — always visible */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>

                            {/* Target Level */}
                            <div style={{ background: '#0b0720', border: '0.5px solid #33267a', borderRadius: 14, padding: 16 }}>
                                <label style={{ display: 'block', color: '#c4b5fd', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>🎯 Target Level</label>
                                <select
                                    value={std}
                                    onChange={e => setStd(e.target.value)}
                                    style={{ width: '100%', background: '#060610', border: '0.5px solid #33267a', borderRadius: 10, color: '#c4b5fd', fontSize: 13, padding: '8px 10px', outline: 'none', cursor: 'pointer' }}
                                >
                                    {STD_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>

                            {/* Language */}
                            <div style={{ background: '#030e09', border: '0.5px solid #10472a', borderRadius: 14, padding: 16 }}>
                                <label style={{ display: 'block', color: '#6ee7b7', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>🌐 Language</label>
                                <select
                                    value={language}
                                    onChange={e => {
                                        const v = e.target.value as keyof typeof NARRATOR_VOICE_OPTIONS;
                                        setLanguage(v);
                                        setNarratorVoice(NARRATOR_VOICE_OPTIONS[v][0]);
                                    }}
                                    style={{ width: '100%', background: '#060610', border: '0.5px solid #10472a', borderRadius: 10, color: '#6ee7b7', fontSize: 13, padding: '8px 10px', outline: 'none', cursor: 'pointer' }}
                                >
                                    {LANGUAGE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>

                            {/* Voice Persona */}
                            <div style={{ background: '#0b0804', border: '0.5px solid #5a3d08', borderRadius: 14, padding: 16 }}>
                                <label style={{ display: 'block', color: '#fcd34d', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>🎙️ Voice Persona</label>
                                <select
                                    value={narratorVoice}
                                    onChange={e => setNarratorVoice(e.target.value)}
                                    style={{ width: '100%', background: '#060610', border: '0.5px solid #5a3d08', borderRadius: 10, color: '#fcd34d', fontSize: 13, padding: '8px 10px', outline: 'none', cursor: 'pointer' }}
                                >
                                    {NARRATOR_VOICE_OPTIONS[language].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>

                            {/* Emotional Tone */}
                            <div style={{ background: '#04141a', border: '0.5px solid #0a5a5a', borderRadius: 14, padding: 16 }}>
                                <label style={{ display: 'block', color: '#67e8f9', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>💫 Emotional Tone</label>
                                <select
                                    value={emotionTone}
                                    onChange={e => setEmotionTone(e.target.value)}
                                    style={{ width: '100%', background: '#060610', border: '0.5px solid #0a5a5a', borderRadius: 10, color: '#67e8f9', fontSize: 13, padding: '8px 10px', outline: 'none', cursor: 'pointer' }}
                                >
                                    {EMOTION_TONE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>

                        </div>

                        {/* Generate button */}
                        {user ? (
                            <button
                                type="submit"
                                className="story-glow-btn"
                                style={{ width: '100%', height: 52, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: 16, color: 'white', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer', marginBottom: 12 }}
                            >
                                ✨ Generate Story
                            </button>
                        ) : (
                            <button
                                type="button"
                                disabled={isLoggingIn}
                                onClick={async () => {
                                    try {
                                        setIsLoggingIn(true);
                                        await signInWithGoogle();
                                    } catch (err: any) {
                                        alert(err.message || 'Login failed. Please check if popups are blocked.');
                                    } finally {
                                        setIsLoggingIn(false);
                                    }
                                }}
                                style={{ width: '100%', height: 52, background: isLoggingIn ? '#4338ca' : 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: 16, color: 'white', fontSize: 16, fontWeight: 700, border: 'none', cursor: isLoggingIn ? 'not-allowed' : 'pointer', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                            >
                                {isLoggingIn ? (
                                    <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" /> Authenticating…</>
                                ) : (
                                    <><span>🔑</span> Login with Google to Start</>
                                )}
                            </button>
                        )}

                        {/* Trouble logging in */}
                        <div style={{ borderTop: '0.5px solid #1e1e35', paddingTop: 16, marginTop: 4 }}>
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

                    </form>
                </div>
            </div>
        </>
    );
};

export default StoryGeneratorForm;
