import React from 'react';
import { Page } from '../types';

interface ResearchProps {
    onNavigate: (page: Page) => void;
}

const Research: React.FC<ResearchProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-6xl mx-auto space-y-16 animate-fade-in pb-20">
            
            {/* Header Section */}
            <div className="text-center space-y-4 py-8">
                <div className="inline-block p-4 rounded-3xl bg-indigo-100 text-indigo-600 mb-6 shadow-sm">
                    <span className="text-5xl">🧠</span>
                </div>
                <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight">
                    Research <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Science</span>
                </h1>
                <p className="text-2xl text-slate-500 max-w-3xl mx-auto font-medium">
                    Decoding the hidden relationship between <span className="text-indigo-600 font-bold">Emotion</span> and <span className="text-cyan-600 font-bold">Learning</span>.
                </p>
            </div>

            {/* Our Philosophy Section */}
            <div className="bg-white p-8 md:p-16 rounded-[4rem] shadow-2xl border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-[100px] -mr-48 -mt-48 opacity-50"></div>
                <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
                    <div>
                         <h2 className="text-4xl font-black text-slate-900 mb-8 flex items-center gap-4">
                            <span className="text-4xl">🔬</span> Our Philosophy
                         </h2>
                         <p className="text-xl text-slate-600 leading-relaxed mb-8">
                            Research is the foundation of every model we build. We explore how curiosity ignites, how confusion rises, and how empathy transforms understanding.
                         </p>
                         <div className="bg-indigo-50/50 p-8 rounded-[2.5rem] border-l-8 border-indigo-500 italic">
                             <p className="text-2xl font-serif text-indigo-900 leading-snug">
                                “When the mind understands and the heart agrees, learning becomes permanent.”
                             </p>
                         </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        {[
                            { label: "EMOTION SENSING", val: "Real-time" },
                            { label: "STORY ENGINE", val: "Adaptive" },
                            { label: "PRIVACY", val: "On-Device" },
                            { label: "DESIGN", val: "Human-First" }
                        ].map((stat, i) => (
                            <div key={i} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center hover:shadow-lg transition-shadow">
                                <div className="text-indigo-600 text-xs font-black uppercase tracking-[0.2em] mb-2">{stat.label}</div>
                                <div className="text-slate-900 text-2xl font-black">{stat.val}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Core Research Areas */}
            <div>
                <h2 className="text-4xl font-black text-center text-slate-900 mb-12 flex items-center justify-center gap-4">
                    <span className="text-4xl">🧩</span> Core Research Areas
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { 
                            icon: "🎯", 
                            title: "Emotion Sensing", 
                            desc: "Multimodal systems detecting voice tone, prosody, and micro-expressions to gauge engagement.",
                            color: "bg-rose-50/50 border-rose-100 text-rose-900"
                        },
                        { 
                            icon: "📖", 
                            title: "Adaptive Story Intel", 
                            desc: "Algorithms that shift story pacing and tone based on real-time emotional arousal levels.",
                            color: "bg-amber-50/50 border-amber-100 text-amber-900"
                        },
                        { 
                            icon: "💡", 
                            title: "Reinforcement Models", 
                            desc: "Memory retention techniques using emotional markers and micro-feedback loops.",
                            color: "bg-emerald-50/50 border-emerald-100 text-emerald-900"
                        },
                        { 
                            icon: "📊", 
                            title: "Teacher Analytics", 
                            desc: "Heat maps revealing silent struggles and emotional engagement in large classrooms.",
                            color: "bg-blue-50/50 border-blue-100 text-blue-900"
                        },
                        { 
                            icon: "🛡️", 
                            title: "Ethical AI", 
                            desc: "Zero identifiable data storage with complete parental visibility and cultural sensitivity.",
                            color: "bg-slate-100/50 border-slate-200 text-slate-900"
                        },
                        { 
                            icon: "🔍", 
                            title: "Methodology", 
                            desc: "Pilot Testing, Cognitive Psych, Quant Analytics, Longitudinal Tracking.",
                            color: "bg-indigo-50/50 border-indigo-100 text-indigo-900"
                        }
                    ].map((area, i) => (
                        <div key={i} className={`p-8 rounded-[2.5rem] border-2 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ${area.color}`}>
                            <div className="text-5xl mb-6 bg-white w-20 h-20 flex items-center justify-center rounded-3xl shadow-sm">{area.icon}</div>
                            <h3 className="text-2xl font-black mb-4">{area.title}</h3>
                            <p className="text-lg opacity-80 leading-relaxed font-medium">{area.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Global Recognition / Timeline */}
            <div className="bg-slate-900 text-white p-10 md:p-20 rounded-[4rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-indigo-500 rounded-full blur-[200px] opacity-10 -mr-[25rem] -mt-[25rem]"></div>
                
                <h2 className="text-4xl font-black mb-16 flex items-center gap-4 justify-center md:justify-start">
                    <span className="text-4xl">📚</span> Global Recognition
                </h2>

                <div className="space-y-12">
                    {[
                        {
                            date: "NOV 06, 2025",
                            loc: "London, UK 🇬🇧",
                            title: "4th International Conference on Neurology & Neurological Disorders",
                            type: "Scientific Oral Talk",
                            topic: "Framework for Belief Medicine"
                        },
                        {
                            date: "DEC 05, 2025",
                            loc: "Gurugram, India 🇮🇳",
                            title: "AI Visionaries Summit 2025 (Series of World AI Summits)",
                            type: "Oral Presentation",
                            topic: "FeelEd AI™: An Emotion-Adaptive Framework for Story-Based Cognitive Learning"
                        },
                        {
                            date: "JUNE 22, 2026",
                            loc: "Barcelona, Spain 🇪🇸",
                            title: "12th International Conference on Neurology and Neurological Disorders",
                            type: "Invited Speaker",
                            topic: "Neurological Implications of Emotion-Adaptive Learning"
                        }
                    ].map((event, i) => (
                        <div key={i} className="relative pl-12 border-l-4 border-indigo-500/30 pb-12 last:pb-0">
                            <div className="absolute left-[-1.15rem] top-0 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-lg">
                                <span className="text-xs">★</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 mb-4">
                                <span className="bg-indigo-500/20 text-indigo-300 px-4 py-1 rounded-full text-sm font-black tracking-widest">{event.date}</span>
                                <span className="text-slate-400 font-bold">{event.loc}</span>
                            </div>
                            <h3 className="text-3xl font-black mb-2 text-indigo-100 leading-tight">{event.title}</h3>
                            <p className="text-lg text-slate-400 font-bold italic mb-4">{event.type}</p>
                            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl inline-block max-w-2xl">
                                <p className="text-indigo-200 font-bold">Topic: "{event.topic}"</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Join Research Footer */}
            <div className="bg-white p-10 md:p-16 rounded-[4rem] text-center border-4 border-indigo-50 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-100 rounded-full blur-3xl opacity-30 -mr-24 -mt-24"></div>
                <h2 className="text-4xl font-black text-slate-900 mb-6 flex items-center justify-center gap-4">
                    <span className="text-4xl">💛</span> Join Our Research
                </h2>
                <p className="text-2xl text-slate-500 mb-10 max-w-3xl mx-auto font-medium">
                    We welcome collaborations with universities, AI labs, and neuroscientists. Let's build the future of empathetic AI together.
                </p>
                <div className="flex flex-col md:flex-row justify-center gap-6">
                    <a href="mailto:founder@feeledai.com" className="bg-indigo-600 text-white font-black py-5 px-12 rounded-full text-xl shadow-xl hover:bg-indigo-700 transition transform hover:scale-105">
                        Partner With Us
                    </a>
                    <button onClick={() => onNavigate('generator')} className="bg-white border-4 border-indigo-50 text-slate-600 font-black py-5 px-12 rounded-full text-xl hover:bg-indigo-50 transition">
                        Back to App
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Research;
