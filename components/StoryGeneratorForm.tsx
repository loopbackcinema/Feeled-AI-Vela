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
        <div className="w-full max-w-4xl mx-auto space-y-12 animate-fade-in relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center -z-10 pointer-events-none overflow-hidden select-none opacity-5">
                 <h1 className="text-[12rem] font-black tracking-tighter leading-none mb-10">Dream.</h1>
                 <h1 className="text-[12rem] font-black tracking-tighter leading-none mb-10 text-blue-600">Spark.</h1>
                 <h1 className="text-[12rem] font-black tracking-tighter leading-none">Learn.</h1>
            </div>

            <div className="text-center space-y-6 pt-10">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-black shadow-sm">
                    ✨ Magic Story Engine v2.0
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight">
                    Dream. <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600">Spark.</span> Learn.
                </h1>
                <p className="text-xl text-slate-500 font-bold max-w-2xl mx-auto">
                    Turn boring lessons into <span className="text-pink-500">magical stories!</span> 🧚‍♀️
                </p>
            </div>

            <div className="bg-white p-8 md:p-14 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden group">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-5 rounded-2xl mb-10 flex items-center gap-3 font-bold">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                    <div className="space-y-4">
                        <label className="text-sm font-black text-indigo-900 uppercase tracking-widest ml-1">🎩 WHAT DO YOU WANT TO LEARN?</label>
                        <div className="relative group/input">
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder={isListening ? "Listening..." : "e.g. Gravity, Dinosaurs, Mars..."}
                                className={`w-full px-8 py-7 text-2xl font-bold rounded-3xl border-2 transition-all shadow-inner outline-none ${
                                    isListening 
                                    ? 'border-red-400 bg-red-50 text-red-900 animate-pulse' 
                                    : 'border-indigo-50 bg-indigo-50/50 focus:border-indigo-400 focus:bg-white text-slate-800 placeholder-indigo-200'
                                }`}
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={startListening}
                                className={`absolute right-4 top-1/2 -translate-y-1/2 p-4 rounded-2xl transition-all ${isListening ? 'bg-red-500 text-white shadow-xl shadow-red-200 animate-bounce' : 'text-indigo-300 hover:text-indigo-600 hover:bg-white hover:shadow-md'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-xs font-black text-pink-400 uppercase tracking-widest ml-1">🎒 GRADE</label>
                            <select value={std} onChange={(e) => setStd(e.target.value)} className="w-full px-6 py-5 rounded-2xl bg-pink-50/50 border-2 border-pink-100 font-bold text-slate-700 outline-none focus:border-pink-300 transition-all appearance-none cursor-pointer">
                                {STD_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black text-blue-400 uppercase tracking-widest ml-1">🗣️ LANGUAGE</label>
                            <select value={language} onChange={handleLanguageChange} className="w-full px-6 py-5 rounded-2xl bg-blue-50/50 border-2 border-blue-100 font-bold text-slate-700 outline-none focus:border-blue-300 transition-all appearance-none cursor-pointer">
                                {LANGUAGE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black text-purple-400 uppercase tracking-widest ml-1">🎤 VOICE</label>
                            <select value={narratorVoice} onChange={(e) => setNarratorVoice(e.target.value)} className="w-full px-6 py-5 rounded-2xl bg-purple-50/50 border-2 border-purple-100 font-bold text-slate-700 outline-none focus:border-purple-300 transition-all appearance-none cursor-pointer">
                                {NARRATOR_VOICE_OPTIONS[language].map(opt => <option key={opt} value={opt}>{opt} {opt === 'Male' ? '👨' : '👩'}</option>)}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black text-amber-500 uppercase tracking-widest ml-1">🎭 MOOD</label>
                            <select value={emotionTone} onChange={(e) => setEmotionTone(e.target.value)} className="w-full px-6 py-5 rounded-2xl bg-amber-50/50 border-2 border-amber-100 font-bold text-slate-700 outline-none focus:border-amber-300 transition-all appearance-none cursor-pointer">
                                {EMOTION_TONE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt} {opt === 'Curious' ? '🧐' : opt === 'Inspiring' ? '🌟' : opt === 'Funny' ? '😂' : opt === 'Moral' ? '😌' : '💪'}</option>)}
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="w-full group/btn bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-black py-6 rounded-3xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 border-b-4 border-indigo-700 active:border-b-0 active:translate-y-1">
                        <span className="text-2xl">🚀</span>
                        <span className="text-xl tracking-tight uppercase">GENERATE MAGIC STORY</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StoryGeneratorForm;
