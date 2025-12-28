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
            alert("உங்களுடைய பிரவுசரில் மைக் வேலை செய்யவில்லை. Chrome-ஐ பயன்படுத்தவும்.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        // Dynamic Language Logic
        recognition.lang = language === 'Tamil' ? 'ta-IN' : 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            console.error("Mic Error:", event.error);
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setTopic(transcript);
            setIsListening(false);
        };

        try {
            recognition.start();
        } catch (e) {
            console.error("Mic Start Failed:", e);
            setIsListening(false);
        }
    };

    if (isLoading && submittedRequest) return <div className="flex justify-center py-20"><LoadingIndicator request={submittedRequest} /></div>;

    return (
        <div className={`w-full max-w-5xl mx-auto space-y-12 animate-fade-in ${isStudent ? 'student-font pb-24' : ''}`}>
            
            {/* POWERFUL MIC OVERLAY */}
            {isListening && (
                <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-2xl z-[1000] flex flex-col items-center justify-center animate-fade-in text-white text-center p-8">
                    <div className="relative mb-16">
                        <div className="absolute inset-0 bg-pink-500 rounded-full animate-pulse-ring opacity-40"></div>
                        <div className="absolute inset-0 bg-indigo-500 rounded-full animate-pulse-ring [animation-delay:0.4s] opacity-30"></div>
                        <div className="relative w-48 h-48 bg-gradient-to-br from-pink-500 to-indigo-600 rounded-full flex items-center justify-center text-7xl shadow-3xl border-8 border-white/20">
                            🎤
                        </div>
                    </div>
                    <h3 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">
                        {language === 'Tamil' ? 'நான் கேட்கிறேன்...' : 'Listening to you...'}
                    </h3>
                    <p className="text-slate-400 text-2xl font-bold max-w-lg leading-relaxed">
                        {language === 'Tamil' ? 'உங்கள் தலைப்பைச் சொல்லுங்கள்!' : 'Speak your topic clearly!'}
                    </p>
                    <button 
                        onClick={() => setIsListening(false)} 
                        className="mt-20 px-12 py-5 bg-white/10 hover:bg-white/20 border-2 border-white/20 rounded-full font-black uppercase tracking-widest text-sm transition-all"
                    >
                        {language === 'Tamil' ? 'ரத்து செய்' : 'Cancel'}
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="text-center space-y-6">
                <span className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-sm ${isStudent ? 'bg-pink-100 text-pink-600' : 'bg-indigo-50 text-indigo-700'}`}>
                    {isStudent ? '✨ Adventure Machine' : 'Affective Pedagogical AI'}
                </span>
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none text-slate-900">
                    {isStudent ? 'What is the' : 'Pedagogical'} <span className={isStudent ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500' : 'shimmer-indigo'}>{isStudent ? 'Topic?' : 'Synthesis'}</span>
                </h1>
                <p className="text-2xl text-slate-500 font-bold max-w-2xl mx-auto leading-relaxed">
                    {isStudent ? 'Speak or type the magic word to start your story adventure!' : 'Synthesize complex academic concepts into emotional story narratives.'}
                </p>
            </div>

            <div className={`relative border rounded-[4rem] shadow-4xl overflow-hidden ${isStudent ? 'bg-white border-pink-100 ring-[16px] ring-pink-50' : 'bg-white border-slate-200'}`}>
                <div className="p-10 md:p-16 space-y-12">
                    {error && (
                        <div className="bg-red-50 border-4 border-red-100 text-red-700 p-8 rounded-3xl text-lg font-black flex items-center gap-4 animate-bounce">
                            <span className="text-3xl">⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-12">
                        {/* THE PROMINENT INPUT & MIC BUTTON */}
                        <div className="space-y-4">
                            <label className={`text-xs font-black uppercase tracking-widest ml-10 ${isStudent ? 'text-pink-500' : 'text-slate-400'}`}>
                                {isStudent ? 'Topic Name' : 'Subject Concept'}
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder={isStudent ? "Rain, Lions, Space..." : "Enter pedagogical concept..."}
                                    className={`w-full pl-12 pr-32 py-12 text-3xl md:text-5xl font-black rounded-[3.5rem] border-4 focus:bg-white transition-all outline-none shadow-inner ${isStudent ? 'bg-slate-50 border-slate-100 focus:border-pink-500' : 'bg-slate-50 border-slate-100 focus:border-indigo-600'}`}
                                    required
                                />
                                {/* MIGHTY MIC BUTTON */}
                                <button 
                                    type="button" 
                                    onClick={startListening}
                                    className={`absolute right-5 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-3xl transition-all hover:scale-110 active:scale-90 z-20 ${isStudent ? 'bg-pink-500 text-white' : 'bg-slate-900 text-white'}`}
                                >
                                    🎤
                                </button>
                            </div>
                        </div>

                        {/* Controls */}
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
                                        className={`w-full px-8 py-6 rounded-3xl border-2 font-black outline-none transition-all appearance-none cursor-pointer text-lg ${isStudent ? 'bg-white border-indigo-100 text-indigo-800' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                                    >
                                        {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>

                        {/* Submit */}
                        <button 
                            type="submit" 
                            className={`w-full py-12 rounded-[3.5rem] text-white text-3xl md:text-4xl font-black tracking-widest transition-all shadow-4xl active:scale-95 uppercase border-b-[16px] ${isStudent ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 border-indigo-900' : 'bg-slate-900 border-black'}`}
                        >
                            🚀 {isStudent ? 'Create Magic Story!' : 'Synthesize Learning'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StoryGeneratorForm;