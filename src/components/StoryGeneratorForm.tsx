import React, { useState } from 'react';
import { StoryRequest } from '../types';
import { STD_OPTIONS, LANGUAGE_OPTIONS, NARRATOR_VOICE_OPTIONS, EMOTION_TONE_OPTIONS } from '../constants';
import LoadingIndicator from './LoadingIndicator';

interface StoryGeneratorFormProps {
    onSubmit: (request: StoryRequest) => void;
    isLoading: boolean;
    error: string | null;
    variant?: 'professional' | 'student';
}

const StoryGeneratorForm: React.FC<StoryGeneratorFormProps> = ({ onSubmit, isLoading, error, variant = 'professional' }) => {
    const [topic, setTopic] = useState('');
    const [std, setStd] = useState(STD_OPTIONS[4]);
    const [language, setLanguage] = useState<keyof typeof NARRATOR_VOICE_OPTIONS>(LANGUAGE_OPTIONS[0] as keyof typeof NARRATOR_VOICE_OPTIONS);
    const [narratorVoice, setNarratorVoice] = useState(NARRATOR_VOICE_OPTIONS.English[0]);
    const [emotionTone, setEmotionTone] = useState(EMOTION_TONE_OPTIONS[0]);
    const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
    const [submittedRequest, setSubmittedRequest] = useState<StoryRequest | null>(null);
    const [isListening, setIsListening] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) return;
        const request: StoryRequest = { topic, std, language, narratorVoice, emotionTone, difficulty };
        setSubmittedRequest(request);
        onSubmit(request);
    };

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("Your browser does not support voice input. Please try Google Chrome, Edge, or Safari.");
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        const langMap: { [key: string]: string } = {
            "English": "en-US", "Tamil": "ta-IN", "Hindi": "hi-IN", "Bengali": "bn-IN",
            "Telugu": "te-IN", "Marathi": "mr-IN", "Kannada": "kn-IN", "Gujarati": "gu-IN",
            "Malayalam": "ml-IN", "Punjabi": "pa-IN", "Odia": "or-IN"
        };
        
        recognition.lang = langMap[language] || 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: any) => {
            console.error("Speech error", event.error);
            setIsListening(false);
            alert("Could not hear you. Please check your microphone permissions.");
        };
        
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setTopic(transcript);
            setIsListening(false);
        };

        try { 
            recognition.start(); 
        } catch (e) { 
            console.error(e);
            setIsListening(false); 
        }
    };

    if (isLoading && submittedRequest) return <div className="flex justify-center py-20"><LoadingIndicator request={submittedRequest} /></div>;

    const isStudent = variant === 'student';

    return (
        <div className={`w-full max-w-5xl mx-auto space-y-12 animate-fade-in ${isStudent ? 'pb-20' : ''}`}>
            
            {/* Header Section */}
            <div className="text-center space-y-6">
                <span className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.3em] border shadow-sm inline-block ${isStudent ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>
                    {isStudent ? '✨ Adventure Mode' : 'Pedagogical Engine'}
                </span>
                <h1 className={`text-4xl md:text-7xl font-black tracking-tighter leading-[1.1] ${isStudent ? 'text-slate-900' : 'text-slate-900'}`}>
                    {isStudent ? 'Tell Me What To' : 'Professional Learning'} <span className={isStudent ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500' : 'shimmer-indigo'}>{isStudent ? 'Teach You!' : 'Synthesis'}</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-bold leading-relaxed">
                    {isStudent ? 'I can turn any boring homework topic into a magical story. Just speak or type!' : 'Transform core academic concepts into immersive emotional narratives tailored to student cognitive needs.'}
                </p>
            </div>

            {/* Input Container */}
            <div className={`border rounded-[3rem] shadow-2xl relative overflow-hidden transition-all ${isStudent ? 'bg-gradient-to-b from-purple-50 to-white border-purple-200 ring-4 ring-purple-100' : 'bg-white border-slate-200'}`}>
                
                {/* LISTENING OVERLAY */}
                {isListening && (
                    <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center animate-fade-in text-white transition-all rounded-[3rem]">
                        <div className="relative mb-8">
                            <span className="absolute inset-0 rounded-full animate-ping bg-pink-500 opacity-75"></span>
                            <div className="relative bg-gradient-to-r from-pink-500 to-purple-600 w-32 h-32 rounded-full flex items-center justify-center shadow-2xl">
                                <svg className="w-16 h-16 text-white animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                            </div>
                        </div>
                        <h3 className="text-3xl font-black tracking-tight mb-2">Listening...</h3>
                        <p className="text-slate-300 font-bold text-lg">Speak your topic clearly!</p>
                        <button 
                            onClick={() => setIsListening(false)} 
                            className="mt-8 px-8 py-3 bg-white/20 hover:bg-white/30 rounded-full font-bold transition-all uppercase tracking-widest text-sm border border-white/10"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                <div className="p-8 md:p-14 space-y-10">
                    {error && (
                        <div className="bg-red-50 border-2 border-red-100 text-red-700 p-6 rounded-2xl text-lg font-bold flex items-center gap-4 animate-bounce">
                            <span className="text-3xl">⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-10">
                        {/* Topic Input Area */}
                        <div className="space-y-4">
                            <label className={`text-xs font-black uppercase tracking-[0.2em] ml-2 ${isStudent ? 'text-purple-600' : 'text-slate-400'}`}>
                                {isStudent ? '1. What are we learning today?' : 'Core Academic Subject'}
                            </label>
                            
                            <div className="relative">
                                <textarea
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder={isStudent ? "Example: How do airplanes fly? or Photosynthesis..." : "Enter concept (e.g. Thermodynamics, Civics)..."}
                                    rows={3}
                                    className={`w-full p-8 pr-32 text-2xl md:text-4xl font-black rounded-[2rem] border-2 focus:bg-white transition-all outline-none resize-none shadow-inner ${isStudent ? 'bg-white border-purple-200 focus:border-pink-500 text-slate-800 placeholder-purple-200' : 'bg-slate-50 border-slate-200 focus:border-indigo-600 text-slate-900 placeholder-slate-300'}`}
                                    required
                                />
                                
                                {/* MASSIVE MIC BUTTON INSIDE INPUT AREA */}
                                <button 
                                    type="button"
                                    onClick={startListening}
                                    className={`absolute right-4 bottom-4 w-20 h-20 rounded-2xl flex items-center justify-center transition-all shadow-xl hover:scale-110 active:scale-95 group ${isStudent ? 'bg-gradient-to-br from-pink-500 to-rose-600 hover:shadow-pink-300/50' : 'bg-slate-800 hover:bg-indigo-600'}`}
                                    title="Click to Speak"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-right text-xs font-bold text-slate-400 uppercase tracking-wide pr-2">Click the Mic to Speak</p>
                        </div>

                        {/* Controls */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Grade', val: std, set: setStd, opts: STD_OPTIONS },
                                { label: 'Language', val: language, set: (v: string) => { setLanguage(v as any); setNarratorVoice(NARRATOR_VOICE_OPTIONS[v as keyof typeof NARRATOR_VOICE_OPTIONS][0]); }, opts: LANGUAGE_OPTIONS },
                                { label: 'Narrator', val: narratorVoice, set: setNarratorVoice, opts: NARRATOR_VOICE_OPTIONS[language] },
                                { label: isStudent ? 'Vibe' : 'Tone', val: emotionTone, set: setEmotionTone, opts: EMOTION_TONE_OPTIONS },
                            ].map((field, i) => (
                                <div key={i} className="space-y-2">
                                    <label className={`text-xs font-black uppercase tracking-[0.2em] ml-2 ${isStudent ? 'text-purple-400' : 'text-slate-400'}`}>{field.label}</label>
                                    <div className="relative">
                                        <select 
                                            value={field.val} 
                                            onChange={(e) => field.set(e.target.value)}
                                            className={`w-full px-6 py-4 rounded-xl border-2 font-bold outline-none transition-all appearance-none cursor-pointer hover:bg-white ${isStudent ? 'bg-purple-50 border-purple-100 text-purple-900 focus:border-purple-400' : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-indigo-600'}`}
                                        >
                                            {field.opts.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">▼</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            className={`w-full py-8 rounded-[2rem] text-white text-2xl font-black tracking-widest transition-all flex items-center justify-center gap-6 shadow-2xl active:scale-95 uppercase ${isStudent ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-indigo-300 border-b-[8px] border-indigo-900 active:border-b-0' : 'bg-slate-900 hover:bg-indigo-800 border-b-[8px] border-slate-950 active:border-b-0'}`}
                        >
                            {isStudent ? (
                                <>
                                    <span>🚀</span> Generate Story!
                                </>
                            ) : (
                                <>
                                    <span>⚡</span> Synthesize Artifact
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Footer Features (Only for Teacher Mode) */}
            {!isStudent && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60 hover:opacity-100 transition-opacity">
                    {[
                        { t: 'Cognitive Load Optimized', i: '🧠' },
                        { t: 'Zero-Data Persistence', i: '🛡️' },
                        { t: 'Low-Latency Synthesis', i: '⚡' }
                    ].map((item, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4">
                            <span className="text-2xl">{item.i}</span>
                            <span className="font-bold text-slate-600 text-sm uppercase">{item.t}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StoryGeneratorForm;