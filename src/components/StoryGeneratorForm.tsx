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
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech recognition is not supported in this browser. Please use Chrome or Edge for voice input.");
            return;
        }

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
        recognition.onerror = () => setIsListening(false);
        
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setTopic(transcript);
            setIsListening(false);
        };

        try { recognition.start(); } catch (e) { setIsListening(false); }
    };

    if (isLoading && submittedRequest) return <div className="flex justify-center py-20"><LoadingIndicator request={submittedRequest} /></div>;

    const isStudent = variant === 'student';

    return (
        <div className={`w-full max-w-5xl mx-auto space-y-16 animate-fade-in ${isStudent ? 'pb-20' : ''}`}>
            
            {/* Header Section */}
            <div className="text-center space-y-6">
                <span className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.4em] border shadow-sm ${isStudent ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>
                    {isStudent ? 'Create Your Adventure' : 'Proprietary Affective Pedagogical Intelligence'}
                </span>
                <h1 className={`text-5xl md:text-8xl font-black tracking-tighter leading-[1] ${isStudent ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500' : 'text-slate-900'}`}>
                    {isStudent ? 'Magic Story' : 'Learning'} <span className={isStudent ? '' : 'shimmer-indigo'}>{isStudent ? 'Machine' : 'Synthesis'}</span> {isStudent ? '✨' : 'Engine'}
                </h1>
                <p className="text-xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed">
                    {isStudent ? 'Turn your homework into a super cool story! Just type what you want to learn.' : 'Transform any core academic concept into a deeply immersive emotional narrative tailored to your specific cognitive level.'}
                </p>
            </div>

            <div className={`border rounded-[4rem] shadow-3xl overflow-hidden relative ${isStudent ? 'bg-gradient-to-b from-white to-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
                
                {/* Visual Feedback: Microphone Overlay */}
                {isListening && (
                    <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-fade-in text-white transition-all">
                        <div className="relative">
                            <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${isStudent ? 'bg-pink-500' : 'bg-indigo-500'}`}></div>
                            <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-8 shadow-2xl animate-pulse-slow ${isStudent ? 'bg-gradient-to-tr from-pink-500 to-purple-500' : 'bg-white text-indigo-600'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 ${isStudent ? 'text-white' : 'text-indigo-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-4xl font-black tracking-tight mb-2">Listening...</h3>
                        <p className="text-slate-300 font-bold text-lg">Speak your topic clearly</p>
                        <button 
                            onClick={() => setIsListening(false)} 
                            className="mt-10 px-10 py-4 bg-white/10 border border-white/20 rounded-full font-bold hover:bg-white/20 transition-all uppercase tracking-widest text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                <div className="p-10 md:p-16 space-y-12">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-700 p-6 rounded-2xl text-sm font-black flex items-center gap-4">
                            <span className="text-2xl">⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-12">
                        {/* Topic Input */}
                        <div className="space-y-4">
                            <label className={`text-[10px] font-black uppercase tracking-[0.3em] ml-2 ${isStudent ? 'text-indigo-400' : 'text-slate-400'}`}>
                                {isStudent ? 'What do you want to learn today?' : 'Core Academic Subject'}
                            </label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder={isStudent ? "e.g. Dinosaurs, Space, Gravity..." : "Enter concept (e.g. Photosynthesis, Newton's Laws)..."}
                                    className={`w-full pl-12 pr-24 py-10 text-2xl md:text-3xl font-black rounded-[2.5rem] border-2 focus:bg-white transition-all outline-none shadow-inner ${isStudent ? 'bg-white border-indigo-100 focus:border-pink-400 text-indigo-900 placeholder-indigo-200' : 'bg-slate-50 border-slate-100 focus:border-indigo-600 text-slate-900 placeholder-slate-300'}`}
                                    required
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-4">
                                    <button 
                                        type="button"
                                        onClick={startListening}
                                        className={`p-5 rounded-2xl transition-all shadow-lg group hover:scale-110 ${isStudent ? 'bg-gradient-to-tr from-pink-500 to-purple-500 text-white shadow-pink-200' : 'bg-white text-slate-400 border border-slate-200 hover:text-indigo-600 hover:border-indigo-200'}`}
                                        title="Use Microphone"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Controls Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {[
                                { label: 'Grade', val: std, set: setStd, opts: STD_OPTIONS },
                                { label: isStudent ? 'Language' : 'Linguistics', val: language, set: (v: string) => { setLanguage(v as any); setNarratorVoice(NARRATOR_VOICE_OPTIONS[v as keyof typeof NARRATOR_VOICE_OPTIONS][0]); }, opts: LANGUAGE_OPTIONS },
                                { label: 'Voice', val: narratorVoice, set: setNarratorVoice, opts: NARRATOR_VOICE_OPTIONS[language] },
                                { label: isStudent ? 'Story Mood' : 'Emotion', val: emotionTone, set: setEmotionTone, opts: EMOTION_TONE_OPTIONS },
                                { label: isStudent ? 'Level' : 'Cognitive Depth', val: difficulty, set: (v: any) => setDifficulty(v), opts: ['Beginner', 'Intermediate', 'Advanced'] }
                            ].map((field, i) => (
                                <div key={i} className="space-y-3">
                                    <label className={`text-[10px] font-black uppercase tracking-[0.3em] ml-2 ${isStudent ? 'text-indigo-400' : 'text-slate-400'}`}>{field.label}</label>
                                    <select 
                                        value={field.val} 
                                        onChange={(e) => field.set(e.target.value)}
                                        className={`w-full px-6 py-5 rounded-2xl border font-black outline-none transition-all appearance-none cursor-pointer hover:bg-white text-sm ${isStudent ? 'bg-white border-indigo-100 text-indigo-800 focus:border-purple-400' : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-indigo-600'}`}
                                    >
                                        {field.opts.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            className={`w-full py-10 rounded-[2.5rem] text-white text-2xl font-black tracking-widest transition-all flex items-center justify-center gap-6 shadow-4xl active:scale-95 uppercase ${isStudent ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:shadow-pink-200 border-b-[12px] border-purple-800 active:border-b-0' : 'bg-slate-900 hover:bg-indigo-700 border-b-[12px] border-slate-950 active:border-b-0'}`}
                        >
                            {isStudent ? '🚀 Create Magic Story!' : '🚀 Synthesize Learning Artifact'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Footer Badges (Hide in student mode for simplicity) */}
            {!isStudent && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {[
                        { t: 'Theoretical Rigor', d: 'Rooted in cognitive load theory and multimodal learning.', i: '🧬' },
                        { t: 'Global Access', d: 'Optimized for low-latency linguistic adaptivity.', i: '🌍' },
                        { t: 'Enterprise Safe', d: 'Zero-persistence data policy for student safety.', i: '🛡️' }
                    ].map((item, i) => (
                        <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-200 space-y-6 hover:shadow-2xl transition-all group">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">{item.i}</div>
                            <h3 className="font-black text-slate-900 uppercase tracking-tighter text-lg">{item.t}</h3>
                            <p className="text-slate-500 font-medium leading-relaxed text-sm">{item.d}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StoryGeneratorForm;