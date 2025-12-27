
import React, { useState } from 'react';
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
            alert("Speech recognition is not supported in this browser. Please try Chrome or Edge.");
            return;
        }

        const recognition = new SpeechRecognition();
        
        // Map UI languages to BCP 47 tags for better accuracy
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
        recognition.onerror = () => {
            setIsListening(false);
            console.error("Speech recognition error occurred.");
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

    return (
        <div className="w-full max-w-5xl mx-auto space-y-16 animate-fade-in">
            <div className="text-center space-y-6">
                <span className="px-5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-[0.4em] border border-indigo-100 shadow-sm">
                    Proprietary Affective Intelligence
                </span>
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[1.1]">
                    Professional <span className="shimmer-indigo">Learning Engine</span>
                </h1>
                <p className="text-xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed">
                    Transform complex academic concepts into high-engagement narrative experiences using AI-driven pedagogical synthesis.
                </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-[3rem] shadow-2xl shadow-slate-200/50 overflow-hidden">
                <div className="p-10 md:p-16 space-y-12">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-700 p-6 rounded-2xl text-sm font-black flex items-center gap-4 animate-fade-in">
                            <span className="text-2xl">⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-12">
                        <div className="space-y-4">
                            <div className="flex justify-between items-end px-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Core Academic Subject</label>
                                {isListening && (
                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest animate-pulse">
                                        System Listening...
                                    </span>
                                )}
                            </div>
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder={isListening ? "Listening for your concept..." : "e.g., Quantum Entanglement, French Revolution..."}
                                    className={`w-full pl-10 pr-24 py-8 text-2xl md:text-3xl font-black rounded-3xl transition-all outline-none shadow-inner border-2 ${isListening ? 'bg-indigo-50 border-indigo-500 ring-8 ring-indigo-500/10' : 'bg-slate-50 border-slate-100 focus:border-indigo-600 focus:bg-white text-slate-900 placeholder-slate-300'}`}
                                    required
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={startListening}
                                        className={`p-4 rounded-2xl transition-all relative ${isListening ? 'bg-indigo-600 text-white shadow-xl scale-110' : 'bg-white text-slate-400 border border-slate-200 hover:text-indigo-600 hover:border-indigo-200'}`}
                                        title="Use Voice Input"
                                    >
                                        {isListening && <span className="absolute inset-0 rounded-2xl bg-indigo-500 animate-ping opacity-40"></span>}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 italic ml-2">
                                {isListening ? "Speak now..." : "Tip: Use the microphone to dictate complex terminology."}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { label: 'Grade Level', val: std, set: setStd, opts: STD_OPTIONS },
                                { label: 'Linguistic Context', val: language, set: (v: string) => { setLanguage(v as any); setNarratorVoice(NARRATOR_VOICE_OPTIONS[v as keyof typeof NARRATOR_VOICE_OPTIONS][0]); }, opts: LANGUAGE_OPTIONS },
                                { label: 'Instructional Persona', val: narratorVoice, set: setNarratorVoice, opts: NARRATOR_VOICE_OPTIONS[language] },
                                { label: 'Pedagogical Tone', val: emotionTone, set: setEmotionTone, opts: EMOTION_TONE_OPTIONS }
                            ].map((field, i) => (
                                <div key={i} className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">{field.label}</label>
                                    <select 
                                        value={field.val} 
                                        onChange={(e) => field.set(e.target.value)}
                                        className="w-full px-6 py-5 rounded-2xl bg-slate-50 border border-slate-200 font-black text-slate-700 outline-none focus:border-indigo-600 transition-all appearance-none cursor-pointer hover:bg-white"
                                    >
                                        {field.opts.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>

                        <button 
                            type="submit" 
                            className="w-full py-8 rounded-3xl bg-slate-900 text-white text-xl font-black tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-5 shadow-2xl active:scale-95 border-b-[8px] border-slate-950 active:border-b-0 uppercase"
                        >
                            <span className="text-3xl">🚀</span>
                            Synthesize Learning Artifact
                        </button>
                    </form>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {[
                    { t: 'Theoretical Rigor', d: 'Rooted in cognitive load theory and multimodal learning.', i: '🧬' },
                    { t: 'Enterprise Security', d: 'Zero-persistence data policy for student safety.', i: '🛡️' },
                    { t: 'Global Access', d: 'Optimized for low-latency linguistic adaptivity.', i: '🌍' }
                ].map((item, i) => (
                    <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-200 space-y-6 hover:shadow-2xl transition-all group">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">{item.i}</div>
                        <h3 className="font-black text-slate-900 uppercase tracking-tighter text-lg">{item.t}</h3>
                        <p className="text-slate-500 font-medium leading-relaxed">{item.d}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StoryGeneratorForm;
