import React, { useState } from 'react';
import { StoryRequest } from '../types';
import { STD_OPTIONS, LANGUAGE_OPTIONS, NARRATOR_VOICE_OPTIONS, EMOTION_TONE_OPTIONS } from '../constants';
import LoadingIndicator from './LoadingIndicator';

interface StoryGeneratorFormProps {
    onSubmit: (request: StoryRequest) => void;
    isLoading: boolean;
    error: string | null;
}

const LANGUAGE_CODES: { [key: string]: string } = {
    "English": "en-US", "Tamil": "ta-IN", "Hindi": "hi-IN", "Bengali": "bn-IN", "Telugu": "te-IN", "Marathi": "mr-IN", "Kannada": "kn-IN", "Gujarati": "gu-IN", "Malayalam": "ml-IN", "Punjabi": "pa-IN", "Odia": "or-IN"
};

const StoryGeneratorForm: React.FC<StoryGeneratorFormProps> = ({ onSubmit, isLoading, error }) => {
    const [topic, setTopic] = useState('');
    const [std, setStd] = useState(STD_OPTIONS[4]);
    const [language, setLanguage] = useState<keyof typeof NARRATOR_VOICE_OPTIONS>(LANGUAGE_OPTIONS[0] as keyof typeof NARRATOR_VOICE_OPTIONS);
    const [narratorVoice, setNarratorVoice] = useState(NARRATOR_VOICE_OPTIONS.English[0]);
    const [emotionTone, setEmotionTone] = useState(EMOTION_TONE_OPTIONS[0]);
    const [submittedRequest, setSubmittedRequest] = useState<StoryRequest | null>(null);
    const [isListening, setIsListening] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) return;
        const request = { topic, std, language, narratorVoice, emotionTone };
        setSubmittedRequest(request);
        onSubmit(request);
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLang = e.target.value as keyof typeof NARRATOR_VOICE_OPTIONS;
        setLanguage(newLang);
        setNarratorVoice(NARRATOR_VOICE_OPTIONS[newLang][0]);
    };

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("Speech input is not supported in this browser.");
            return;
        }
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = LANGUAGE_CODES[language] || 'en-US';
        recognition.interimResults = false;
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => { setTopic(event.results[0][0].transcript); setIsListening(false); };
        recognition.onend = () => setIsListening(false);
        recognition.start();
    };

    if (isLoading && submittedRequest) {
        return <LoadingIndicator request={submittedRequest} />;
    }

    return (
        <div className="w-full max-w-4xl mx-auto space-y-16 animate-fade-in py-10">
            {/* Hero Section */}
            <div className="text-center space-y-8">
                <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full animate-shimmer border border-blue-200 text-blue-800 text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-100">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
                    </span>
                    Magic Story Engine v2.5
                </div>

                <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-none flex flex-wrap justify-center gap-x-6 md:gap-x-8">
                    <span className="animate-bubble-1 inline-block">Dream.</span>
                    <span className="animate-bubble-2 inline-block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Spark.</span>
                    <span className="animate-bubble-3 inline-block">Learn.</span>
                </h1>

                <p className="text-2xl md:text-3xl text-slate-500 font-bold max-w-2xl mx-auto leading-relaxed">
                    <span className="animate-magic-shake hover:pause">
                        Turn boring lessons into <span className="text-blue-600 underline decoration-blue-200 underline-offset-8">magical stories!</span> 🧚‍♀️
                    </span>
                </p>
            </div>

            {/* Form Container */}
            <div className="glass-panel p-8 md:p-16 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(37,99,235,0.15)] border border-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-blue-400/10 transition-colors duration-1000"></div>
                
                {error && (
                    <div className="bg-red-50 border-2 border-red-100 text-red-600 p-6 rounded-3xl mb-12 flex items-center gap-4 font-black shadow-inner">
                        <span className="text-2xl">⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
                    <div className="space-y-5">
                        <label className="text-sm font-black text-blue-900/40 uppercase tracking-[0.3em] ml-2">🎩 Magical Topic</label>
                        <div className="relative group/input">
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder={isListening ? "I'm listening closely..." : "e.g. Gravity, Space, Photosynthesis..."}
                                className={`w-full px-10 py-8 text-3xl font-black rounded-[2.5rem] border-4 transition-all shadow-2xl outline-none ${
                                    isListening 
                                    ? 'border-blue-500 bg-blue-50 text-blue-900 animate-pulse ring-8 ring-blue-100' 
                                    : 'border-blue-50 bg-white focus:border-blue-600 text-slate-800 placeholder-slate-200'
                                }`}
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={startListening}
                                className={`absolute right-6 top-1/2 -translate-y-1/2 p-5 rounded-[1.5rem] transition-all ${isListening ? 'bg-blue-600 text-white shadow-xl shadow-blue-300 animate-bounce' : 'text-blue-200 hover:text-blue-600 hover:bg-blue-50'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-8 h-8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <label className="text-xs font-black text-blue-900/30 uppercase tracking-widest ml-2">🎒 Academic Level</label>
                            <select value={std} onChange={(e) => setStd(e.target.value)} className="w-full px-8 py-6 rounded-3xl bg-white border-4 border-blue-50 font-black text-slate-700 outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer shadow-sm hover:shadow-md">
                                {STD_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-black text-blue-900/30 uppercase tracking-widest ml-2">🗣️ Language Choice</label>
                            <select value={language} onChange={handleLanguageChange} className="w-full px-8 py-6 rounded-3xl bg-white border-4 border-blue-50 font-black text-slate-700 outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer shadow-sm hover:shadow-md">
                                {LANGUAGE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-black text-blue-900/30 uppercase tracking-widest ml-2">🎤 Narrator Style</label>
                            <select value={narratorVoice} onChange={(e) => setNarratorVoice(e.target.value)} className="w-full px-8 py-6 rounded-3xl bg-white border-4 border-blue-50 font-black text-slate-700 outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer shadow-sm hover:shadow-md">
                                {NARRATOR_VOICE_OPTIONS[language].map(opt => <option key={opt} value={opt}>{opt} Persona</option>)}
                            </select>
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-black text-blue-900/30 uppercase tracking-widest ml-2">🎭 Emotional Arc</label>
                            <select value={emotionTone} onChange={(e) => setEmotionTone(e.target.value)} className="w-full px-8 py-6 rounded-3xl bg-white border-4 border-blue-50 font-black text-slate-700 outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer shadow-sm hover:shadow-md">
                                {EMOTION_TONE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt} Story</option>)}
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="w-full group/btn bg-blue-700 text-white font-black py-8 rounded-[2.5rem] shadow-[0_20px_50px_-10px_rgba(29,78,216,0.5)] hover:bg-blue-800 transition-all transform hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-5 overflow-hidden relative border-b-8 border-blue-900">
                        <span className="text-3xl">🚀</span>
                        <span className="text-2xl tracking-tight uppercase">Generate Magic Journey</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 group-hover/btn:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </button>
                </form>
            </div>

            {/* Quality Badges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
                <div className="p-10 rounded-[3rem] bg-white border-2 border-blue-50 shadow-xl shadow-blue-50/50 hover:-translate-y-2 transition-transform">
                    <div className="text-4xl mb-4">🔬</div>
                    <h3 className="font-black text-blue-900 uppercase tracking-widest text-xs mb-3">Science Driven</h3>
                    <p className="text-base text-slate-500 font-bold leading-relaxed">Optimized for long-term memory through emotional engagement.</p>
                </div>
                <div className="p-10 rounded-[3rem] bg-white border-2 border-blue-50 shadow-xl shadow-blue-50/50 hover:-translate-y-2 transition-transform">
                    <div className="text-4xl mb-4">🛡️</div>
                    <h3 className="font-black text-blue-900 uppercase tracking-widest text-xs mb-3">Privacy First</h3>
                    <p className="text-base text-slate-500 font-bold leading-relaxed">Zero identifiable data storage. Safe for schools and home.</p>
                </div>
                <div className="p-10 rounded-[3rem] bg-white border-2 border-blue-50 shadow-xl shadow-blue-50/50 hover:-translate-y-2 transition-transform">
                    <div className="text-4xl mb-4">🌊</div>
                    <h3 className="font-black text-blue-900 uppercase tracking-widest text-xs mb-3">Hyper-Real TTS</h3>
                    <p className="text-base text-slate-500 font-bold leading-relaxed">Dynamic narrator personas for total story immersion.</p>
                </div>
            </div>
        </div>
    );
};

export default StoryGeneratorForm;