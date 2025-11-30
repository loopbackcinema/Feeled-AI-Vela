
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

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLang = e.target.value as keyof typeof NARRATOR_VOICE_OPTIONS;
        setLanguage(newLang);
        setNarratorVoice(NARRATOR_VOICE_OPTIONS[newLang][0]);
    };

    const getVoiceLabel = (voice: string) => {
        if (voice === 'Male') return 'Male 👨';
        if (voice === 'Female') return 'Female 👩';
        return voice;
    };

    const getEmotionLabel = (tone: string) => {
        switch(tone) {
            case 'Curious': return 'Curious 🤔';
            case 'Inspiring': return 'Inspiring 🌟';
            case 'Funny': return 'Funny 😂';
            case 'Moral': return 'Moral 😌';
            case 'Motivational': return 'Motivational 💪';
            default: return tone;
        }
    };

    if (isLoading && submittedRequest) {
        return <LoadingIndicator request={submittedRequest} />;
    }

    return (
        <div className="w-full max-w-3xl mx-auto relative z-10 font-sans">
            {/* Playful Header Section */}
            <div className="text-center mb-10 animate-fadeInUp">
                <div className="inline-block bg-yellow-100 text-yellow-800 px-6 py-2 rounded-full text-sm font-black mb-6 border-2 border-yellow-300 shadow-sm transform -rotate-2 hover:rotate-2 transition-transform cursor-default">
                     ✨ Magic Story Engine v2.0
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-slate-800 mb-4 tracking-tight drop-shadow-sm leading-tight">
                    Dream. <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600">Spark.</span> Learn.
                </h2>
                <p className="text-lg md:text-xl text-slate-600 font-bold max-w-2xl mx-auto">
                    Turn boring lessons into <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 font-extrabold">magical stories</span>! 🧚‍♀️
                </p>
            </div>

            {/* Magic Card Form */}
            <div className="bg-white/90 backdrop-blur-xl p-6 md:p-10 rounded-[2.5rem] shadow-2xl border-4 border-white relative overflow-hidden ring-4 ring-indigo-50/50">
                
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full blur-3xl opacity-30 -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-200 to-cyan-200 rounded-full blur-3xl opacity-30 -ml-20 -mb-20 pointer-events-none"></div>

                {error && <div className="bg-red-100 border-2 border-red-300 text-red-700 px-4 py-3 rounded-2xl relative mb-6 font-bold flex items-center gap-2">
                    <span className="text-2xl">🚫</span> {error}
                </div>}

                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                    {/* Topic Input - Big and bouncy */}
                    <div className="group">
                        <label htmlFor="topic" className="block text-sm font-extrabold text-indigo-900 mb-2 uppercase tracking-wider ml-1">
                            🎩 What do you want to learn?
                        </label>
                        <div className="relative transition-transform group-hover:scale-[1.01] duration-300">
                            <input
                                type="text"
                                id="topic"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g. Gravity, Dinosaurs, Mars..."
                                className="w-full pl-6 pr-4 py-5 text-xl font-bold text-slate-700 border-4 border-indigo-100 rounded-3xl focus:ring-0 focus:border-indigo-400 transition-all bg-indigo-50/50 placeholder-indigo-300 shadow-inner"
                                required
                                disabled={isLoading}
                            />
                            <div className="absolute right-5 top-1/2 transform -translate-y-1/2 text-indigo-300 text-2xl animate-pulse">
                                ✨
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Grade - Pink Theme */}
                        <div className="space-y-2 group">
                            <label htmlFor="std" className="block text-xs font-black text-pink-400 uppercase ml-1">🎒 Grade</label>
                            <div className="relative transition-transform group-hover:-translate-y-1">
                                <select 
                                    id="std" 
                                    value={std} 
                                    onChange={(e) => setStd(e.target.value)} 
                                    className="w-full px-5 py-4 font-bold text-slate-700 bg-pink-50 border-2 border-pink-200 rounded-2xl focus:ring-0 focus:border-pink-400 transition-all appearance-none cursor-pointer hover:bg-pink-100 hover:border-pink-300" 
                                    disabled={isLoading}
                                >
                                    {STD_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-pink-400 text-xs">▼</div>
                            </div>
                        </div>

                        {/* Language - Blue Theme */}
                        <div className="space-y-2 group">
                            <label htmlFor="language" className="block text-xs font-black text-blue-400 uppercase ml-1">🗣️ Language</label>
                            <div className="relative transition-transform group-hover:-translate-y-1">
                                <select 
                                    id="language" 
                                    value={language} 
                                    onChange={handleLanguageChange} 
                                    className="w-full px-5 py-4 font-bold text-slate-700 bg-blue-50 border-2 border-blue-200 rounded-2xl focus:ring-0 focus:border-blue-400 transition-all appearance-none cursor-pointer hover:bg-blue-100 hover:border-blue-300" 
                                    disabled={isLoading}
                                >
                                    {LANGUAGE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400 text-xs">▼</div>
                            </div>
                        </div>

                        {/* Voice - Purple Theme */}
                        <div className="space-y-2 group">
                            <label htmlFor="narratorVoice" className="block text-xs font-black text-purple-400 uppercase ml-1">🎤 Voice</label>
                            <div className="relative transition-transform group-hover:-translate-y-1">
                                <select 
                                    id="narratorVoice" 
                                    value={narratorVoice} 
                                    onChange={(e) => setNarratorVoice(e.target.value)} 
                                    className="w-full px-5 py-4 font-bold text-slate-700 bg-purple-50 border-2 border-purple-200 rounded-2xl focus:ring-0 focus:border-purple-400 transition-all appearance-none cursor-pointer hover:bg-purple-100 hover:border-purple-300" 
                                    disabled={isLoading}
                                >
                                    {NARRATOR_VOICE_OPTIONS[language].map(opt => <option key={opt} value={opt}>{getVoiceLabel(opt)}</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-purple-400 text-xs">▼</div>
                            </div>
                        </div>

                        {/* Tone - Yellow Theme */}
                        <div className="space-y-2 group">
                            <label htmlFor="emotionTone" className="block text-xs font-black text-amber-500 uppercase ml-1">🎭 Mood</label>
                            <div className="relative transition-transform group-hover:-translate-y-1">
                                <select 
                                    id="emotionTone" 
                                    value={emotionTone} 
                                    onChange={(e) => setEmotionTone(e.target.value)} 
                                    className="w-full px-5 py-4 font-bold text-slate-700 bg-amber-50 border-2 border-amber-200 rounded-2xl focus:ring-0 focus:border-amber-400 transition-all appearance-none cursor-pointer hover:bg-amber-100 hover:border-amber-300" 
                                    disabled={isLoading}
                                >
                                    {EMOTION_TONE_OPTIONS.map(opt => <option key={opt} value={opt}>{getEmotionLabel(opt)}</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-amber-400 text-xs">▼</div>
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-black py-5 px-6 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] focus:ring-4 focus:ring-pink-200 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-3 border-b-4 border-indigo-700 active:border-b-0 active:translate-y-1">
                        <span className="text-3xl filter drop-shadow-md">🚀</span>
                        <span className="text-xl tracking-wide drop-shadow-sm">GENERATE MAGIC STORY</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StoryGeneratorForm;
