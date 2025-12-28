import React, { useState, useEffect } from 'react';
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
    const [isListening, setIsListening] = useState(false);
    const [submittedRequest, setSubmittedRequest] = useState<StoryRequest | null>(null);

    const isStudent = variant === 'student';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) return;
        const request: StoryRequest = { topic, std, language, narratorVoice, emotionTone };
        setSubmittedRequest(request);
        onSubmit(request);
    };

    const startListening = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("உங்களுடைய பிரவுசரில் மைக் வேலை செய்யவில்லை. தயவுசெய்து Chrome-ஐ பயன்படுத்தவும்.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        // Dynamic Language Selection
        recognition.lang = language === 'Tamil' ? 'ta-IN' : 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            console.error("Mic error:", event.error);
            setIsListening(false);
            alert("மைக் வேலை செய்வதில் சிக்கல்: " + event.error);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setTopic(transcript);
            setIsListening(false);
        };

        recognition.start();
    };

    if (isLoading && submittedRequest) return <div className="flex justify-center py-20"><LoadingIndicator request={submittedRequest} /></div>;

    return (
        <div className={`w-full max-w-5xl mx-auto space-y-12 animate-fade-in ${isStudent ? 'student-font pb-24' : ''}`}>
            
            {/* FULL SCREEN MIC OVERLAY - The "Powerfull" feature */}
            {isListening && (
                <div className="fixed inset-0 bg-slate-900/98 backdrop-blur-3xl z-[999] flex flex-col items-center justify-center animate-fade-in text-white p-6 text-center">
                    <div className="relative mb-20">
                        {/* Multiple Pulse Rings for visual depth */}
                        <div className="absolute inset-0 bg-pink-500 rounded-full animate-pulse-ring opacity-30"></div>
                        <div className="absolute inset-0 bg-indigo-500 rounded-full animate-pulse-ring [animation-delay:0.5s] opacity-30"></div>
                        <div className="relative w-48 h-48 bg-gradient-to-br from-pink-500 to-indigo-600 rounded-full flex items-center justify-center text-7xl shadow-[0_0_80px_rgba(99,102,241,0.6)] border-8 border-white/20">
                            🎤
                        </div>
                    </div>
                    <h3 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">
                        {language === 'Tamil' ? 'நான் கேட்கிறேன்...' : 'Listening...'}
                    </h3>
                    <p className="text-slate-400 text-2xl font-bold max-w-lg leading-relaxed">
                        {language === 'Tamil' ? 'உங்கள் பாடத்தின் தலைப்பைச் சொல்லுங்கள்!' : 'Tell me what you want to learn today!'}
                    </p>
                    <button 
                        onClick={() => setIsListening(false)} 
                        className="mt-20 px-12 py-5 bg-white/10 hover:bg-white/20 border-2 border-white/20 rounded-full font-black uppercase tracking-widest text-sm transition-all active:scale-95"
                    >
                        {language === 'Tamil' ? 'ரத்து செய்' : 'Cancel'}
                    </button>
                </div>
            )}

            {/* Form Header */}
            <div className="text-center space-y-6">
                <span className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-sm ${isStudent ? 'bg-pink-100 text-pink-600' : 'bg-indigo-50 text-indigo-700'}`}>
                    {isStudent ? '✨ Adventure Machine' : 'Affective Pedagogical AI'}
                </span>
                <h1 className={`text-6xl md:text-8xl font-black tracking-tighter leading-none ${isStudent ? 'text-slate-900' : 'text-slate-900'}`}>
                    {isStudent ? 'Search for' : 'Professional'} <span className={isStudent ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500' : 'shimmer-indigo'}>{isStudent ? 'Magic!' : 'Synthesis'}</span>
                </h1>
                <p className="text-2xl text-slate-500 font-bold max-w-2xl mx-auto leading-relaxed">
                    {isStudent ? 'Type your homework topic or click the mic to speak!' : 'Turn any academic subject into a story-driven emotional experience.'}
                </p>
            </div>

            {/* Main Interactive Form Card */}
            <div className={`relative border rounded-[4rem] shadow-4xl overflow-hidden transition-all duration-500 ${isStudent ? 'bg-white border-pink-100 ring-[16px] ring-pink-50 hover:ring-pink-100' : 'bg-white border-slate-200 shadow-slate-200'}`}>
                <div className="p-10 md:p-16 space-y-12">
                    {error && (
                        <div className="bg-red-50 border-4 border-red-100 text-red-700 p-8 rounded-3xl text-lg font-black flex items-center gap-6 animate-bounce">
                            <span className="text-4xl">⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-12">
                        {/* BIG INPUT WITH MIC */}
                        <div className="space-y-4">
                            <label className={`text-xs font-black uppercase tracking-widest ml-8 ${isStudent ? 'text-pink-500' : 'text-slate-400'}`}>
                                {isStudent ? 'What is the topic?' : 'Topic Name'}
                            </label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder={isStudent ? "E.g. Rain, Space, Lions..." : "Enter subject concept..."}
                                    className={`w-full pl-12 pr-32 py-10 text-3xl md:text-5xl font-black rounded-[3rem] border-4 focus:bg-white transition-all outline-none shadow-inner ${isStudent ? 'bg-slate-50 border-slate-100 focus:border-pink-500' : 'bg-slate-50 border-slate-100 focus:border-indigo-600'}`}
                                    required
                                />
                                <button 
                                    type="button" 
                                    onClick={startListening}
                                    className={`absolute right-6 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-3xl transition-all hover:scale-110 active:scale-90 ${isStudent ? 'bg-pink-500 text-white hover:bg-pink-600' : 'bg-slate-900 text-white hover:bg-indigo-600'}`}
                                    title="Voice Search"
                                >
                                    🎤
                                </button>
                            </div>
                        </div>

                        {/* Settings Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Grade', val: std, set: setStd, opts: STD_OPTIONS },
                                { label: 'Language', val: language, set: (v: string) => { setLanguage(v as any); setNarratorVoice(NARRATOR_VOICE_OPTIONS[v as keyof typeof NARRATOR_VOICE_OPTIONS][0]); }, opts: LANGUAGE_OPTIONS },
                                { label: 'Voice', val: narratorVoice, set: setNarratorVoice, opts: NARRATOR_VOICE_OPTIONS[language] },
                                { label: isStudent ? 'Mood' : 'Tone', val: emotionTone, set: setEmotionTone, opts: EMOTION_TONE_OPTIONS }
                            ].map((f, i) => (
                                <div key={i} className="space-y-3">
                                    <label className={`text-[10px] font-black uppercase tracking-widest ml-6 ${isStudent ? 'text-indigo-400' : 'text-slate-400'}`}>{f.label}</label>
                                    <select 
                                        value={f.val} 
                                        onChange={(e) => f.set(e.target.value)}
                                        className={`w-full px-8 py-6 rounded-3xl border-2 font-black outline-none transition-all appearance-none cursor-pointer text-lg shadow-sm ${isStudent ? 'bg-white border-indigo-100 text-indigo-800 focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                                    >
                                        {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>

                        {/* SUBMIT BUTTON */}
                        <button 
                            type="submit" 
                            className={`w-full py-12 rounded-[3rem] text-white text-3xl md:text-4xl font-black tracking-widest transition-all shadow-4xl active:scale-95 uppercase border-b-[16px] ${isStudent ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 border-indigo-900' : 'bg-slate-900 border-black'}`}
                        >
                            🚀 {isStudent ? 'Create Magic!' : 'Synthesize'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StoryGeneratorForm;