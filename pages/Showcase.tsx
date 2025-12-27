import React, { useState } from 'react';
import { Page } from '../types';

interface ShowcaseProps {
    onNavigate: (page: Page) => void;
}

const Showcase: React.FC<ShowcaseProps> = ({ onNavigate }) => {
    const [techStack, setTechStack] = useState('');
    const [genAiImpl, setGenAiImpl] = useState('');
    const [fileName, setFileName] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Thank you for your submission! In a live environment, this would be sent to our records.");
        onNavigate('generator');
    };

    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in pb-20">
            <div className="text-center mb-12 space-y-4">
                <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-black uppercase tracking-widest mb-4">
                    Build the Future
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                    Showcase <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Registration</span>
                </h1>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
                    Submit your AI-powered educational prototype for the global showcase. Let your innovation inspire the next generation of learners.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-900 p-8 text-white">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <span className="text-blue-400">01</span> Project Details
                    </h2>
                    <p className="text-slate-400 mt-2 text-sm">Please provide technical information about your implementation.</p>
                </div>

                <div className="p-8 md:p-12 space-y-10">
                    <div className="space-y-4">
                        <label className="block text-sm font-black text-slate-800 uppercase tracking-widest">
                            * Tech Stack
                        </label>
                        <p className="text-sm text-slate-500">What technology stack or tools did you use to build the frontend and backend?</p>
                        <textarea 
                            required
                            rows={3}
                            value={techStack}
                            onChange={(e) => setTechStack(e.target.value)}
                            placeholder="Describe your tech stack..."
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white transition-all outline-none font-medium text-slate-700"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-black text-slate-800 uppercase tracking-widest">
                            * The "Golden Prompt" / System Instructions
                        </label>
                        <p className="text-sm text-slate-500">Upload a screenshot of your main System Instruction used in AI Studio.</p>
                        <div className="relative group">
                            <input 
                                type="file" 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                onChange={(e) => {
                                    if(e.target.files && e.target.files[0]) {
                                        setFileName(e.target.files[0].name);
                                    }
                                }}
                            />
                            <div className="border-4 border-dashed border-slate-100 rounded-3xl p-10 flex flex-col items-center justify-center group-hover:border-blue-200 transition-colors bg-slate-50/50 group-hover:bg-blue-50/30">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                </div>
                                <span className="font-bold text-slate-600">
                                    {fileName || "Click or drag to upload prompt screenshot"}
                                </span>
                                <span className="text-xs text-slate-400 mt-1 uppercase tracking-widest">PDF or Image (Max 1 MB)</span>
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-900">
                            <span className="text-blue-500">02</span> GenAI Implementation
                        </h2>
                        <p className="text-sm text-slate-500">Briefly describe how you have integrated Gemini API.</p>
                        <textarea 
                            required
                            rows={4}
                            value={genAiImpl}
                            onChange={(e) => setGenAiImpl(e.target.value)}
                            placeholder="How does the AI contribute to the overall user experience?"
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white transition-all outline-none font-medium text-slate-700"
                        />
                    </div>

                    <div className="pt-6">
                        <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 px-8 rounded-2xl shadow-xl shadow-blue-100 hover:shadow-2xl hover:bg-blue-700 transition-all transform hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3">
                            <span className="text-xl">Submit Project for Showcase</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </form>

            <div className="mt-12 text-center">
                <button onClick={() => onNavigate('generator')} className="text-slate-400 hover:text-slate-600 font-bold flex items-center gap-2 mx-auto transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Story Generator
                </button>
            </div>
        </div>
    );
};

export default Showcase;