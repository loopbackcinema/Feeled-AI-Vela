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
            alert("Speech recognition is not supported in this browser.");
            return;
        }
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = LANGUAGE_CODES[language] || 'en-US';
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => { setTopic(event.results[0][0].transcript); setIsListening(false); };
        recognition.onend = () => setIsListening(false);
        recognition.start();
    };

    if (isLoading && submittedRequest) {
        return <LoadingIndicator request={submittedRequest} />;
    }

    return (
        <div className="w-full max-w-5xl mx-auto space-y-12 animate-fade-in py-10">
            {/* Startup Pitch Hero */}
            <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-widest shadow-sm">
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                    </span>
                    Gemini-Powered Prototype
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 leading-[1.1]">
                    The Future of <span className="ai-gradient-text">Empathetic Learning</span>
                </h1>
                <p className="text-xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed">
                    A professional pedagogical engine that transforms any academic curriculum into immersive, emotion-adaptive storytelling. Built for the Google Startup School Showcase.
                </p>
            </div>

            {/* AI Control Center Form */}
            <div className="startup-card rounded-[2.5rem] p-8 md:p-16 border-slate-200/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-[100px] -mr-48 -mt-48 opacity-60"></div>
                
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-2xl mb-10 flex items-center gap-3 font-semibold">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/></svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="relative z-10 space-y-12">
                    <div className="space-y-4">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Learning Objective</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder={isListening ? "Listening for your topic..." : "e.g., Quantum Physics, Photosynthesis, Ancient History"}
                                className={`w-full px-8 py-7 text-2xl font-bold rounded-[1.5rem] border-2 transition-all outline-none shadow-sm ${
                                    isListening 
                                    ? 'border-indigo-400 bg-indigo-50 ring-4 ring-indigo-100 animate-pulse' 
                                    : 'border-slate-100 bg-slate-50 focus:border-indigo-600 focus:bg-white text-slate-800'
                                }`}
                                required
                            />
                            <button
                                type="button"
                                onClick={startListening}
                                className={`absolute right-4 top-1/2 -translate-y-1/2 p-4 rounded-2xl transition-all ${isListening ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600 hover:bg-white'}`}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Grade</label>
                            <select value={std} onChange={(e) => setStd(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer">
                                {STD_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Language</label>
                            <select value={language} onChange={handleLanguageChange} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer">
                                {LANGUAGE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Narrator Archetype</label>
                            <select value={narratorVoice} onChange={(e) => setNarratorVoice(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer">
                                {NARRATOR_VOICE_OPTIONS[language].map(opt => <option key={opt} value={opt}>{opt} Persona</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Emotional Arc</label>
                            <select value={emotionTone} onChange={(e) => setEmotionTone(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer">
                                {EMOTION_TONE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt} Journey</option>)}
                            </select>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full py-6 rounded-3xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl shadow-xl shadow-indigo-200 transition-all transform hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-4 group"
                    >
                        <span>Initiate AI Intelligence</span>
                        <svg className="w-6 h-6 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    </button>
                </form>
            </div>

            {/* Prototype Value Props */}
            <div className="grid md:grid-cols-3 gap-8">
                {[
                    { title: "Cognitive Science", desc: "Built on high-arousal emotional state induction for long-term memory retention.", icon: "🧠" },
                    { title: "Scalable TTS", desc: "Dynamic multi-lingual voice modulation for diverse classroom environments.", icon: "🌍" },
                    { title: "On-Device Privacy", desc: "Zero-identifiable data processing models for student safety and compliance.", icon: "🛡️" }
                ].map((prop, i) => (
                    <div key={i} className="p-8 bg-white border border-slate-200/60 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-3xl mb-4">{prop.icon}</div>
                        <h3 className="text-lg font-black text-slate-800 mb-2 uppercase tracking-tight">{prop.title}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed font-medium">{prop.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StoryGeneratorForm;