
import React, { useState, useEffect } from 'react';
import { StoryRequest } from '../types';
import { STD_OPTIONS, LANGUAGE_OPTIONS, NARRATOR_VOICE_OPTIONS, EMOTION_TONE_OPTIONS } from '../constants';
import LoadingIndicator from './LoadingIndicator';

interface StoryGeneratorFormProps {
    onSubmit: (request: StoryRequest) => void;
    isLoading: boolean;
    error: string | null;
}

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

    const startListening = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech recognition is not supported in this browser. Please try Chrome.");
            return;
        }

        const recognition = new SpeechRecognition();
        
        // Map UI languages to BCP 47 tags
        const langMap: { [key: string]: string } = {
            "English": "en-US",
            "Tamil": "ta-IN",
            "Hindi": "hi-IN",
            "Bengali": "bn-IN",
            "Telugu": "te-IN",
            "Marathi": "mr-IN",
            "Kannada": "kn-IN",
            "Gujarati": "gu-IN",
            "Malayalam": "ml-IN",
            "Punjabi": "pa-IN",
            "Odia": "or-IN"
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

        recognition.start();
    };

    if (isLoading && submittedRequest) return <LoadingIndicator request={submittedRequest} />;

    return (
        <div className="w-full max-w-5xl mx-auto space-y-12 animate-fade-in py-12">
            <div className="text-center space-y-4">
                <span className="px-4 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] border border-blue-100">
                    Proprietary Affective Engine
                </span>
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
                    Professional <span className="shimmer-indigo">Learning Engine</span>
                </h1>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
                    Convert complex educational concepts into verified narrative learning experiences for students.
                </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden">
                <div className="p-8 md:p-12 space-y-10">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl text-sm font-bold flex items-center gap-3">
                            <span className="text-xl">⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-10">
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Academic Topic or Concept</label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder={isListening ? "Listening for your concept..." : "e.g., Photosynthesis, Bernoulli's Principle..."}
                                    className={`w-full pl-8 pr-24 py-8 text-xl md:text-3xl font-bold rounded-2xl bg-slate-50 border-2 transition-all outline-none shadow-inner ${isListening ? 'border-indigo-500 bg-white ring-4 ring-indigo-50' : 'border-slate-100 focus:border-indigo-600 focus:bg-white text-slate-800'}`}
                                    required
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={startListening}
                                        className={`p-4 rounded-xl transition-all relative ${isListening ? 'bg-indigo-600 text-white shadow-lg scale-110' : 'bg-white text-slate-400 border border-slate-200 hover:text-indigo-600 hover:border-indigo-200 shadow-sm'}`}
                                        title="Use voice input"
                                    >
                                        {isListening && (
                                            <span className="absolute inset-0 rounded-xl bg-indigo-500 animate-ping opacity-40"></span>
                                        )}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-between items-center px-1">
                                <p className="text-[10px] font-bold text-slate-400 italic">
                                    {isListening ? "I'm listening... Speak clearly." : "Tip: Click the microphone to dictate your topic."}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Target Level', val: std, set: setStd, opts: STD_OPTIONS },
                                { label: 'Instruction Language', val: language, set: (v: string) => { setLanguage(v as any); setNarratorVoice(NARRATOR_VOICE_OPTIONS[v as keyof typeof NARRATOR_VOICE_OPTIONS][0]); }, opts: LANGUAGE_OPTIONS },
                                { label: 'Voice Persona', val: narratorVoice, set: setNarratorVoice, opts: NARRATOR_VOICE_OPTIONS[language] },
                                { label: 'Emotional Tone', val: emotionTone, set: setEmotionTone, opts: EMOTION_TONE_OPTIONS }
                            ].map((field, i) => (
                                <div key={i} className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                                    <select 
                                        value={field.val} 
                                        onChange={(e) => field.set(e.target.value)}
                                        className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 outline-none focus:border-indigo-600 transition-all appearance-none cursor-pointer"
                                    >
                                        {field.opts.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>

                        <button 
                            type="submit" 
                            className="w-full py-6 rounded-2xl bg-slate-900 text-white text-lg font-black tracking-tight hover:bg-slate-800 transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95 border-b-[8px] border-slate-950 active:border-b-0"
                        >
                            <span>🚀</span>
                            Initialize Learning Engine
                        </button>
                    </form>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { t: 'Verified Research', d: 'Rooted in cognitive load theory and affective science.', i: '🔬' },
                    { t: 'Safe by Design', d: 'No identifiable user data storage or tracking.', i: '🛡️' },
                    { t: 'Universal Access', d: 'Optimized for low-bandwidth educational settings.', i: '🌍' }
                ].map((item, i) => (
                    <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4 hover:shadow-lg transition-shadow">
                        <div className="text-4xl">{item.i}</div>
                        <h3 className="font-bold text-slate-900 uppercase tracking-tighter text-sm">{item.t}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">{item.d}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StoryGeneratorForm;
