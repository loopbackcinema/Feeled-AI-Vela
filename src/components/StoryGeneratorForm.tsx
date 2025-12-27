
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
        <div className="w-full max-w-4xl mx-auto space-y-12 animate-fade-in">
            {/* Professional Hero Section */}
            <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-black uppercase tracking-widest shadow-sm">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                    </span>
                    AI Learning Platform
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[1.1] md:leading-tight">
                    Learn through <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Emotional Stories.</span>
                </h1>
                <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                    A professional-grade pedagogical engine that transforms complex academic topics into immersive, narrated emotional journeys.
                </p>
            </div>

            {/* Premium Control Center */}
            <div className="bg-white/70 backdrop-blur-2xl p-8 md:p-14 rounded-[3rem] shadow-2xl border border-white/50 ring-1 ring-slate-200/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-blue-400/10 transition-colors duration-1000"></div>
                
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-5 rounded-2xl mb-10 flex items-center gap-3 font-bold">
                        <span className="text-xl">⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                    <div className="space-y-4">
                        <label className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Learning Target</label>
                        <div className="relative group/input">
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder={isListening ? "Listening..." : "What topic would you like to explore?"}
                                className={`w-full px-8 py-7 text-2xl font-bold rounded-3xl border-2 transition-all shadow-inner outline-none ${
                                    isListening 
                                    ? 'border-blue-400 bg-blue-50 text-blue-900 animate-pulse' 
                                    : 'border-slate-100 bg-slate-50 focus:border-blue-600 focus:bg-white text-slate-800 placeholder-slate-300'
                                }`}
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={startListening}
                                className={`absolute right-4 top-1/2 -translate-y-1/2 p-4 rounded-2xl transition-all ${isListening ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-md'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Academic Level</label>
                            <select value={std} onChange={(e) => setStd(e.target.value)} className="w-full px-6 py-5 rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-700 outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer">
                                {STD_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Language</label>
                            <select value={language} onChange={handleLanguageChange} className="w-full px-6 py-5 rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-700 outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer">
                                {LANGUAGE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Narrator Persona</label>
                            <select value={narratorVoice} onChange={(e) => setNarratorVoice(e.target.value)} className="w-full px-6 py-5 rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-700 outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer">
                                {NARRATOR_VOICE_OPTIONS[language].map(opt => <option key={opt} value={opt}>{opt} Narrator</option>)}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Emotional Arc</label>
                            <select value={emotionTone} onChange={(e) => setEmotionTone(e.target.value)} className="w-full px-6 py-5 rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-700 outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer">
                                {EMOTION_TONE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt} Journey</option>)}
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="w-full group/btn bg-slate-900 text-white font-black py-6 rounded-3xl shadow-2xl hover:bg-blue-600 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                        <span className="relative z-10 text-xl tracking-tight uppercase">Initiate Story Generation</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 relative z-10 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </button>
                </form>
            </div>

            {/* Professional Footer Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-80">
                <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm">
                    <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-4">Scientific Basis</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">Our models are optimized for long-term memory retention through high-arousal emotional state induction.</p>
                </div>
                <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm">
                    <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-4">Privacy Guaranteed</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">Enterprise-grade security ensuring all emotional signals are processed with zero-identifiability data models.</p>
                </div>
                <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm">
                    <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-4">Multi-Modal TTS</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">Dynamic voice modulation adapts to selected narrator personas for hyper-realistic audio immersion.</p>
                </div>
            </div>
        </div>
    );
};

export default StoryGeneratorForm;
