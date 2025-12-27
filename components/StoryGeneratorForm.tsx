import React, { useState } from 'react';
import { StoryRequest } from '../types';
import { STD_OPTIONS, LANGUAGE_OPTIONS, NARRATOR_VOICE_OPTIONS, EMOTION_TONE_OPTIONS } from '../constants';
import Spinner from './Spinner';

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) return;
        onSubmit({ topic, std, language, narratorVoice, emotionTone });
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLang = e.target.value as keyof typeof NARRATOR_VOICE_OPTIONS;
        setLanguage(newLang);
        setNarratorVoice(NARRATOR_VOICE_OPTIONS[newLang][0]);
    };

    return (
        <div className="w-full max-w-2xl bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-100 animate-fade-in">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-slate-800">Learn with Stories</h2>
                <p className="text-slate-500 mt-2">Enter a topic and let AI weave an emotional learning journey.</p>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm font-semibold">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="topic" className="block text-sm font-bold text-slate-600 mb-2">Academic Topic</label>
                    <input
                        type="text"
                        id="topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., Photosynthesis, Gravity, Honesty"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none"
                        required
                        disabled={isLoading}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="std" className="block text-sm font-bold text-slate-600 mb-2">Grade Level</label>
                        <select id="std" value={std} onChange={(e) => setStd(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500" disabled={isLoading}>
                            {STD_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="language" className="block text-sm font-bold text-slate-600 mb-2">Language</label>
                        <select id="language" value={language} onChange={handleLanguageChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500" disabled={isLoading}>
                            {LANGUAGE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="narratorVoice" className="block text-sm font-bold text-slate-600 mb-2">Narrator Gender</label>
                        <select id="narratorVoice" value={narratorVoice} onChange={(e) => setNarratorVoice(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500" disabled={isLoading}>
                            {NARRATOR_VOICE_OPTIONS[language].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="emotionTone" className="block text-sm font-bold text-slate-600 mb-2">Story Emotion</label>
                        <select id="emotionTone" value={emotionTone} onChange={(e) => setEmotionTone(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500" disabled={isLoading}>
                            {EMOTION_TONE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full bg-blue-600 text-white font-black py-4 px-6 rounded-xl hover:bg-blue-700 transition-all transform hover:scale-[1.02] disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg shadow-blue-100"
                >
                    {isLoading ? <Spinner /> : <span className="text-lg">Generate Story Experience</span>}
                </button>
            </form>
        </div>
    );
};

export default StoryGeneratorForm;