
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) return;
        const request = { topic, std, language, narratorVoice, emotionTone };
        setSubmittedRequest(request);
        onSubmit(request);
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
                    A research-backed pedagogical tool designed to transform abstract academic concepts into high-engagement narrative experiences.
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
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Core Academic Subject</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="Enter complex concept (e.g., Photosynthesis, Bernoulli's Principle)..."
                                    className="w-full px-10 py-8 text-2xl md:text-3xl font-black rounded-3xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-600 focus:bg-white transition-all outline-none text-slate-900 placeholder-slate-300 shadow-inner"
                                    required
                                />
                                <div className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                            </div>
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
