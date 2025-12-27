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
        <div className="w-full max-w-4xl mx-auto space-y-16 animate-fade-in py-10 relative">
            {/* Background Decorative Element */}
            <div className="absolute top-[-10%] left-[-20%] w-[140%] h-[120%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4)_0%,transparent_70%)] pointer-events-none -z-10"></div>

            {/* Hero Section */}
            <div className="text-center space-y-10">
                <div className="inline-flex items-center gap-3 px-8 py-3 rounded-full animate-shimmer border-2 border-blue-200/50 text-blue-900 text-sm font-black uppercase tracking-[0.25em] shadow-xl shadow-blue-200/40">
                    <span className="relative flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-600"></span>
                    </span>
                    Magic Story Engine v2.5
                </div>

                <h1 className="text-7xl md:text-9xl font-black text-slate-900 tracking-tighter leading-none flex flex-wrap justify-center gap-x-6 md:gap-x-10 drop-shadow-sm">
                    <span className="animate-bubble-1 inline-block text-blue-800">Dream.</span>
                    <span className="animate-bubble-2 inline-block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Spark.</span>
                    <span className="animate-bubble-3 inline-block text-blue-800">Learn.</span>
                </h1>

                <p className="text-2xl md:text-4xl text-slate-600 font-bold max-w-3xl mx-auto leading-relaxed">
                    <span className="animate-magic-shake">
                        Turn boring lessons into <span className="text-blue-700 underline decoration-blue-300 decoration-4 underline-offset-[12px]">magical stories!</span> 🧚‍♀️
                    </span>
                </p>
            </div>

            {/* Form Container */}
            <div className="glass-panel p-10 md:p-20 rounded-[4.5rem] shadow-[0_60px_100px_-20px_rgba(37,99,235,0.2)] border-2 border-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-[120px] pointer-events-none group-hover:bg-blue-400/20 transition-colors duration-1000"></div>
                
                {error && (
                    <div className="bg-red-50 border-4 border-red-100 text-red-600 p-8 rounded-[2rem] mb-12 flex items-center gap-5 font-black shadow-inner animate-shake">
                        <span className="text-3xl">⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-14 relative z-10">
                    <div className="space-y-6">
                        <label className="text-sm font-black text-blue-900/60 uppercase tracking-[0.4em] ml-4">🎩 What's the magical topic?</label>
                        <div className="relative group/input">
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder={isListening ? "I'm listening closely..." : "e.g. Gravity, Space, Photosynthesis..."}
                                className={`w-full px-12 py-10 text-3xl md:text-4xl font-black rounded-[3rem] border-[6px] transition-all shadow-2xl outline-none ${
                                    isListening 
                                    ? 'border-blue-500 bg-blue-50 text-blue-900 animate-pulse ring-[12px] ring-blue-100' 
                                    : 'border-blue-100/50 bg-white focus:border-blue-600 text-slate-800 placeholder-slate-200'
                                }`}
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={startListening}
                                className={`absolute right-8 top-1/2 -translate-y-1/2 p-6 rounded-[2rem] transition-all ${isListening ? 'bg-blue-600 text-white shadow-2xl shadow-blue-300 animate-bounce' : 'text-blue-300 hover:text-blue-600 hover:bg-blue-50'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-10 h-10">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <label className="text-xs font-black text-blue-900/40 uppercase tracking-widest ml-4">🎒 Academic Level</label>
                            <select value={std} onChange={(e) => setStd(e.target.value)} className="w-full px-10 py-7 rounded-[2rem] bg-white border-4 border-blue-50 font-black text-slate-700 outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer shadow-sm hover:shadow-xl">
                                {STD_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-black text-blue-900/40 uppercase tracking-widest ml-4">🗣️ Language Choice</label>
                            <select value={language} onChange={handleLanguageChange} className="w-full px-10 py-7 rounded-[2rem] bg-white border-4 border-blue-50 font-black text-slate-700 outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer shadow-sm hover:shadow-xl">
                                {LANGUAGE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-black text-blue-900/40 uppercase tracking-widest ml-4">🎤 Narrator Persona</label>
                            <select value={narratorVoice} onChange={(e) => setNarratorVoice(e.target.value)} className="w-full px-10 py-7 rounded-[2rem] bg-white border-4 border-blue-50 font-black text-slate-700 outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer shadow-sm hover:shadow-xl">
                                {NARRATOR_VOICE_OPTIONS[language].map(opt => <option key={opt} value={opt}>{opt} Persona</option>)}
                            </select>
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-black text-blue-900/40 uppercase tracking-widest ml-4">🎭 Emotional Arc</label>
                            <select value={emotionTone} onChange={(e) => setEmotionTone(e.target.value)} className="w-full px-10 py-7 rounded-[2rem] bg-white border-4 border-blue-50 font-black text-slate-700 outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer shadow-sm hover:shadow-xl">
                                {EMOTION_TONE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt} Story</option>)}
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="w-full group/btn bg-blue-700 text-white font-black py-10 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(29,78,216,0.5)] hover:bg-blue-800 transition-all transform hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-6 overflow-hidden relative border-b-[12px] border-blue-900">
                        <span className="text-4xl">🚀</span>
                        <span className="text-3xl tracking-tighter uppercase">Generate Magic Journey</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 group-hover/btn:translate-x-3 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </button>
                </form>
            </div>

            {/* Quality Badges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-10 pb-20">
                <div className="p-12 rounded-[3.5rem] bg-white/80 border-4 border-white shadow-2xl hover:-translate-y-3 transition-transform duration-500">
                    <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-5xl mb-6 shadow-inner">🔬</div>
                    <h3 className="font-black text-blue-900 uppercase tracking-[0.2em] text-sm mb-4">Science Driven</h3>
                    <p className="text-lg text-slate-500 font-bold leading-relaxed">Optimized for long-term memory through emotional triggers.</p>
                </div>
                <div className="p-12 rounded-[3.5rem] bg-white/80 border-4 border-white shadow-2xl hover:-translate-y-3 transition-transform duration-500">
                    <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-5xl mb-6 shadow-inner">🛡️</div>
                    <h3 className="font-black text-blue-900 uppercase tracking-[0.2em] text-sm mb-4">Privacy First</h3>
                    <p className="text-lg text-slate-500 font-bold leading-relaxed">Zero identifiable data storage. Safe for schools and home.</p>
                </div>
                <div className="p-12 rounded-[3.5rem] bg-white/80 border-4 border-white shadow-2xl hover:-translate-y-3 transition-transform duration-500">
                    <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-5xl mb-6 shadow-inner">🌊</div>
                    <h3 className="font-black text-blue-900 uppercase tracking-[0.2em] text-sm mb-4">Hyper-Real</h3>
                    <p className="text-lg text-slate-500 font-bold leading-relaxed">Dynamic narrator personas for total story immersion.</p>
                </div>
            </div>
        </div>
    );
};

export default StoryGeneratorForm;