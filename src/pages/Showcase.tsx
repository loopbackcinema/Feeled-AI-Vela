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
        alert("Prototype Details Submitted Successfully! Our team will review your implementation.");
        onNavigate('generator');
    };

    return (
        <div className="w-full max-w-5xl mx-auto py-12 px-6 animate-fade-in pb-24">
            {/* Competition Header */}
            <div className="text-center mb-16 space-y-4">
                <div className="inline-block px-5 py-2 rounded-2xl bg-indigo-900 text-indigo-100 text-[10px] font-black uppercase tracking-[0.2em] mb-4 shadow-lg shadow-indigo-100">
                    Google Startup School | Prototype Competition
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight">
                    Showcase <span className="ai-gradient-text">Registration</span>
                </h1>
                <p className="text-xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed">
                    Formalize your submission for the 2025 Global Showcase. Provide technical insights into your FeelEd AI implementation.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="startup-card rounded-[3rem] border-slate-200 overflow-hidden">
                {/* Section 1 Header */}
                <div className="bg-slate-900 px-10 py-12 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight flex items-center gap-4">
                            <span className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-xl">01</span>
                            Architecture & Stack
                        </h2>
                        <p className="text-slate-400 mt-2 font-medium">Define the core technologies powering your solution.</p>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
                        Technical Validation
                    </div>
                </div>

                <div className="p-10 md:p-16 space-y-12 bg-white">
                    {/* Tech Stack Field */}
                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                            Technology Stack
                        </label>
                        <p className="text-sm text-slate-500 font-medium">Specify your stack (e.g., React, Gemini API, Vercel Edge Functions, TypeScript).</p>
                        <textarea 
                            required
                            rows={3}
                            value={techStack}
                            onChange={(e) => setTechStack(e.target.value)}
                            placeholder="Detailed tech stack documentation..."
                            className="w-full px-8 py-6 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white transition-all outline-none font-medium text-slate-700 shadow-inner"
                        />
                    </div>

                    {/* Golden Prompt Field */}
                    <div className="space-y-6">
                        <label className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                            System Instructions (The Golden Prompt)
                        </label>
                        <p className="text-sm text-slate-500 font-medium">Upload proof of your prompt engineering strategy from Google AI Studio.</p>
                        
                        <div className="relative group cursor-pointer">
                            <input 
                                type="file" 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                onChange={(e) => {
                                    if(e.target.files && e.target.files[0]) {
                                        setFileName(e.target.files[0].name);
                                    }
                                }}
                            />
                            <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-16 flex flex-col items-center justify-center group-hover:border-indigo-400 transition-all bg-slate-50 group-hover:bg-indigo-50/30">
                                <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <svg className="h-10 w-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                                </div>
                                <span className="text-xl font-extrabold text-slate-800">
                                    {fileName || "Drag & drop prompt documentation"}
                                </span>
                                <p className="text-sm text-slate-400 mt-2 font-bold uppercase tracking-widest">AI Studio Screenshot (PNG, JPG, PDF)</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100"></div>

                    {/* Section 2 Header */}
                    <div className="space-y-8 pt-4">
                        <div className="flex items-center gap-4">
                            <span className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xl font-bold">02</span>
                            <div>
                                <h3 className="text-3xl font-black tracking-tight text-slate-900">GenAI Implementation</h3>
                                <p className="text-slate-500 font-medium mt-1">Describe your unique integration of the Gemini API.</p>
                            </div>
                        </div>

                        <textarea 
                            required
                            rows={4}
                            value={genAiImpl}
                            onChange={(e) => setGenAiImpl(e.target.value)}
                            placeholder="Explain how AI enables the 'Feel' in FeelEd AI..."
                            className="w-full px-8 py-6 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white transition-all outline-none font-medium text-slate-700 shadow-inner"
                        />
                    </div>

                    {/* Final Submission Button */}
                    <div className="pt-8">
                        <button type="submit" className="w-full py-8 rounded-[2rem] bg-indigo-600 text-white font-black text-2xl shadow-2xl shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 transition-all transform hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-6 group">
                            <span>Submit Competition Entry</span>
                            <svg className="h-8 w-8 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                        </button>
                    </div>
                </div>
            </form>

            {/* Global Back Link */}
            <div className="mt-16 text-center">
                <button 
                    onClick={() => onNavigate('generator')} 
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black text-sm uppercase tracking-widest transition-colors"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                    Back to Core Prototype
                </button>
            </div>
        </div>
    );
};

export default Showcase;