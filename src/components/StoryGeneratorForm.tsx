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
    const [isListening, setIsListening] = useState(false);
    const [submittedRequest, setSubmittedRequest] = useState<StoryRequest | null>(null);

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
            alert("Mic not supported in this browser. Try Chrome!");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = language === 'Tamil' ? 'ta-IN' : 'en-US';
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event: any) => {
            setTopic(event.results[0][0].transcript);
        };
        recognition.start();
    };

    const isStudent = variant === 'student';

    if (isLoading && submittedRequest) return <div className="flex justify-center py-20"><LoadingIndicator request={submittedRequest} /></div>;

    return (
        <div className={`w-full max-w-5xl mx-auto space-y-12 animate-fade-in ${isStudent ? 'student-font pb-24' : ''}`}>
            
            {/* Dynamic Header */}
            <div className="text-center space-y-4">
                <span className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest ${isStudent ? 'bg-pink-100 text-pink-600' : 'bg-indigo-50 text-indigo-700'}`}>
                    {isStudent ? '✨ Adventure Mode' : 'Pedagogical Engine'}
                </span>
                <h1 className={`text-5xl md:text-8xl font-black tracking-tighter ${isStudent ? 'text-slate-900' : 'text-slate-900'}`}>
                    {isStudent ? 'What shall we' : 'Professional'} <span className={isStudent ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500' : 'shimmer-indigo'}>{isStudent ? 'Learn?' : 'Synthesis'}</span>
                </h1>
                <p className="text-xl text-slate-500 font-bold max-w-2xl mx-auto">
                    {isStudent ? 'I can turn any lesson into a magic story. Just speak or type below!' : 'Transform core academic concepts into immersive narratives.'}
                </p>
            </div>

            <div className={`relative border rounded-[3.5rem] shadow-2xl overflow-hidden ${isStudent ? 'bg-white border-pink-200 ring-8 ring-pink-50' : 'bg-white border-slate-200'}`}>
                
                {/* MIC OVERLAY */}
                {isListening && (
                    <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center text-white animate-fade-in">
                        <div className="relative mb-10">
                            <div className="absolute inset-0 bg-pink-500 rounded-full animate-pulse-ring"></div>
                            <div className="relative w-32 h-32 bg-pink-600 rounded-full flex items-center justify-center text-5xl shadow-2xl">🎤</div>
                        </div>
                        <h3 className="text-4xl font-black mb-2">Listening...</h3>
                        <p className="text-slate-400 text-xl font-bold">Say your topic out loud!</p>
                        <button onClick={() => setIsListening(false)} className="mt-12 px-8 py-3 bg-white/10 rounded-full font-bold uppercase tracking-widest text-sm border border-white/20">Cancel</button>
                    </div>
                )}

                <div className="p-10 md:p-16 space-y-10">
                    <form onSubmit={handleSubmit} className="space-y-10">
                        <div className="space-y-4">
                            <label className={`text-xs font-black uppercase tracking-widest ml-4 ${isStudent ? 'text-pink-500' : 'text-slate-400'}`}>Topic Name</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder={isStudent ? "E.g. Dinosaurs, Rain, Gravity..." : "Enter academic concept..."}
                                    className={`w-full p-8 pr-28 text-2xl md:text-4xl font-black rounded-[2.5rem] border-4 outline-none transition-all ${isStudent ? 'bg-pink-50/30 border-pink-100 focus:border-pink-500 focus:bg-white text-slate-800' : 'bg-slate-50 border-slate-100 focus:border-indigo-600'}`}
                                    required
                                />
                                <button 
                                    type="button" 
                                    onClick={startListening}
                                    className={`absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 rounded-3xl flex items-center justify-center text-2xl shadow-xl transition-all hover:scale-110 active:scale-95 ${isStudent ? 'bg-pink-500 text-white' : 'bg-slate-800 text-white'}`}
                                >
                                    🎤
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Grade', val: std, set: setStd, opts: STD_OPTIONS },
                                { label: 'Language', val: language, set: (v: string) => { setLanguage(v as any); setNarratorVoice(NARRATOR_VOICE_OPTIONS[v as keyof typeof NARRATOR_VOICE_OPTIONS][0]); }, opts: LANGUAGE_OPTIONS },
                                { label: 'Voice', val: narratorVoice, set: setNarratorVoice, opts: NARRATOR_VOICE_OPTIONS[language] },
                                { label: isStudent ? 'Mood' : 'Tone', val: emotionTone, set: setEmotionTone, opts: EMOTION_TONE_OPTIONS }
                            ].map((f, i) => (
                                <div key={i} className="space-y-2">
                                    <label className={`text-[10px] font-black uppercase tracking-widest ml-4 ${isStudent ? 'text-indigo-400' : 'text-slate-400'}`}>{f.label}</label>
                                    <select 
                                        value={f.val} 
                                        onChange={(e) => f.set(e.target.value)}
                                        className={`w-full px-6 py-4 rounded-2xl border-2 font-black outline-none transition-all appearance-none cursor-pointer text-sm ${isStudent ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-slate-50 border-slate-100'}`}
                                    >
                                        {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>

                        <button 
                            type="submit" 
                            className={`w-full py-10 rounded-[2.5rem] text-white text-3xl font-black tracking-widest transition-all shadow-4xl active:scale-95 uppercase ${isStudent ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 border-b-[12px] border-indigo-900 active:border-b-0' : 'bg-slate-900 border-b-[12px] border-black active:border-b-0'}`}
                        >
                            🚀 {isStudent ? 'Make Magic!' : 'Synthesize'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StoryGeneratorForm;