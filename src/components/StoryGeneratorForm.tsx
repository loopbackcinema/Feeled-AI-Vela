
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoryRequest } from '../types';
import { STD_OPTIONS, LANGUAGE_OPTIONS, NARRATOR_VOICE_OPTIONS, EMOTION_TONE_OPTIONS } from '../constants';
import LoadingIndicator from './LoadingIndicator';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle } from '../firebase';
import { canUseFeature, incrementUsage } from '../services/subscriptionService';
import { useSubscription } from '../context/SubscriptionContext';

interface StoryGeneratorFormProps {
    onSubmit: (request: StoryRequest) => void;
    isLoading: boolean;
    error: string | null;
}

const StoryGeneratorForm: React.FC<StoryGeneratorFormProps> = ({ onSubmit, isLoading, error }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { isPlus, dailyUsage, showUpgrade } = useSubscription();
    const [topic, setTopic] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [std, setStd] = useState(STD_OPTIONS[4]);
    const [language, setLanguage] = useState<keyof typeof NARRATOR_VOICE_OPTIONS>(LANGUAGE_OPTIONS[0] as keyof typeof NARRATOR_VOICE_OPTIONS);
    const [narratorVoice, setNarratorVoice] = useState(NARRATOR_VOICE_OPTIONS.English[0]);
    const [emotionTone, setEmotionTone] = useState(EMOTION_TONE_OPTIONS[0]);
    const [submittedRequest, setSubmittedRequest] = useState<StoryRequest | null>(null);

    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !topic.trim()) return;
        const { allowed } = await canUseFeature(user.uid, 'stories');
        if (!allowed) { showUpgrade('stories'); return; }
        incrementUsage(user.uid, 'stories').catch(() => {});
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
            const transcript = event.results[0][0].transcript;
            setTopic(transcript);
        };

        recognition.start();
    };

    if (isLoading && submittedRequest) return <LoadingIndicator request={submittedRequest} />;

    return (
        <div className="w-full max-w-5xl mx-auto space-y-12 animate-fade-in py-12">
            <div className="flex items-center justify-start mb-2">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-semibold text-sm transition-colors border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 hover:border-indigo-400 bg-white dark:bg-slate-900"
                >
                    🏠 Home
                </button>
            </div>
            <div className="text-center space-y-4">
                <span className="px-4 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] border border-blue-100 dark:border-blue-800">
                    ✨ Story Mode
                </span>
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
                    Professional <span className="shimmer-text">Story Mode</span>
                </h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
                    Learn any concept through emotion-driven stories — in Tamil or English.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-colors duration-300">
                <div className="p-8 md:p-12 space-y-10">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-xl text-sm font-bold flex items-center gap-3">
                            <span className="text-xl">⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* ── Topic input (always visible) ─────────────────── */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Academic Topic</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g., Quantum Mechanics, The Water Cycle, photosynthesis..."
                                    className="w-full px-8 py-6 text-xl md:text-2xl font-bold rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none text-slate-800 dark:text-white pr-24"
                                    required
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={startListening}
                                        className={`p-3 rounded-full transition-all ${isListening ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                                        title="Voice Input"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                        </svg>
                                    </button>
                                    <div className="text-slate-300 dark:text-slate-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Primary CTA ──────────────────────────────────── */}
                        {user && (
                            <button
                                type="submit"
                                className="w-full py-6 rounded-2xl bg-slate-900 dark:bg-blue-600 text-white text-lg font-black tracking-tight hover:bg-slate-800 dark:hover:bg-blue-700 transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95"
                            >
                                Generate Story ✨
                            </button>
                        )}
                        {user && !isPlus && (
                            <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-1">
                                {Math.max(0, 3 - (dailyUsage?.stories ?? 0))} / 3 free stories remaining today
                            </p>
                        )}
                        {!user && (
                            <button
                                type="button"
                                disabled={isLoggingIn}
                                onClick={async () => {
                                    try {
                                        setIsLoggingIn(true);
                                        console.log("Attempting Google Login...");
                                        await signInWithGoogle();
                                    } catch (err: any) {
                                        console.error("Login failed:", err);
                                        alert(err.message || "Login failed. Please check if popups are blocked.");
                                    } finally {
                                        setIsLoggingIn(false);
                                    }
                                }}
                                className={`w-full py-6 rounded-2xl text-white text-lg font-black tracking-tight transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95 ${isLoggingIn ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                            >
                                {isLoggingIn ? (
                                    <>
                                        <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Authenticating...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>🔑</span>
                                        Login with Google to Start
                                    </>
                                )}
                            </button>
                        )}

                        {/* ── Advanced options toggle ───────────────────────── */}
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => setShowAdvanced(v => !v)}
                                className="text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 text-xs font-bold transition-colors"
                            >
                                {showAdvanced ? '▲ Hide options' : '⚙️ Advanced options'}
                            </button>
                        </div>

                        {/* ── Advanced options panel (CSS max-height transition) */}
                        <div
                            style={{
                                maxHeight: showAdvanced ? '400px' : '0',
                                overflow: 'hidden',
                                transition: 'max-height 300ms ease',
                            }}
                        >
                            <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[
                                        { label: 'Target Level', val: std, set: setStd, opts: STD_OPTIONS },
                                        { label: 'Instruction Language', val: language, set: (v: string) => { setLanguage(v as any); setNarratorVoice(NARRATOR_VOICE_OPTIONS[v as keyof typeof NARRATOR_VOICE_OPTIONS][0]); }, opts: LANGUAGE_OPTIONS },
                                        { label: 'Voice Persona', val: narratorVoice, set: setNarratorVoice, opts: NARRATOR_VOICE_OPTIONS[language] },
                                        { label: 'Emotional Tone', val: emotionTone, set: setEmotionTone, opts: EMOTION_TONE_OPTIONS }
                                    ].map((field, i) => (
                                        <div key={i} className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{field.label}</label>
                                            <select
                                                value={field.val}
                                                onChange={(e) => field.set(e.target.value)}
                                                className="w-full px-5 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                            >
                                                {field.opts.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                            <details className="group">
                                <summary className="flex items-center justify-center gap-2 cursor-pointer text-slate-400 hover:text-indigo-500 transition-colors text-[10px] font-black uppercase tracking-widest list-none">
                                    <span>❓</span>
                                    Trouble Logging In?
                                    <svg className="w-3 h-3 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                                </summary>
                                <div className="mt-4 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-xs text-slate-500 dark:text-slate-400 leading-relaxed space-y-3">
                                    <p>If the login button doesn't respond or shows an error, please check the following:</p>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li><strong>Pop-ups:</strong> Ensure your browser allows pop-ups for this site.</li>
                                        <li><strong>Third-Party Cookies:</strong> Firebase requires third-party cookies. If you have "Block Third-Party Cookies" enabled, please disable it or try <strong>Incognito Mode</strong>.</li>
                                        <li><strong>Authorized Domains:</strong> If you see an "unauthorized domain" error, the current URL must be added to the Firebase Console's Authorized Domains list.</li>
                                        <li><strong>Brave/Safari:</strong> Disable "Shields" (Brave) or "Prevent Cross-Site Tracking" (Safari) if login fails.</li>
                                    </ul>
                                </div>
                            </details>
                        </div>
                    </form>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { t: 'Verified Research', d: 'Rooted in cognitive load theory and affective science.', i: '🔬' },
                    { t: 'Safe by Design', d: 'No identifiable user data storage or tracking.', i: '🛡️' },
                    { t: 'Universal Access', d: 'Optimized for low-bandwidth educational settings.', i: '🌍' }
                ].map((item, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4 hover:shadow-lg transition-shadow">
                        <div className="text-4xl">{item.i}</div>
                        <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-tighter text-sm">{item.t}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{item.d}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StoryGeneratorForm;
