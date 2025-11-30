
import React from 'react';
import { Page } from '../types';

interface ResearchProps {
    onNavigate: (page: Page) => void;
}

const Research: React.FC<ResearchProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-6xl mx-auto space-y-12 animate-fade-in pb-12">
            
            {/* Header Section */}
            <div className="text-center space-y-4 py-8">
                <div className="inline-block p-3 rounded-2xl bg-indigo-100 text-indigo-600 mb-4 shadow-sm animate-bounce-slow">
                    <span className="text-4xl">🧠</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-slate-800 tracking-tight">
                    Research <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">&</span> Science
                </h1>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto font-medium">
                    Decoding the hidden relationship between <span className="text-indigo-600 font-bold">Emotion</span> and <span className="text-cyan-600 font-bold">Learning</span>.
                </p>
            </div>

            {/* Philosophy Card */}
            <div className="relative bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl overflow-hidden transform hover:scale-[1.01] transition-transform duration-500">
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-cyan-500 rounded-full blur-3xl opacity-20 animate-pulse delay-700"></div>
                
                <div className="relative z-10 text-center md:text-left grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold mb-6 text-indigo-200 flex items-center gap-3 justify-center md:justify-start">
                            <span>🔬</span> Our Philosophy
                        </h2>
                        <p className="text-indigo-50/80 text-lg leading-relaxed mb-6">
                            Research is the foundation of every model we build. We explore how curiosity ignites, how confusion rises, and how empathy transforms understanding.
                        </p>
                        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-inner">
                            <p className="text-2xl font-serif italic text-white leading-normal">
                                “When the mind understands and the heart agrees, learning becomes permanent.”
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: "Emotion Sensing", val: "Real-time" },
                            { label: "Story Engine", val: "Adaptive" },
                            { label: "Privacy", val: "On-Device" },
                            { label: "Design", val: "Human-First" }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/5 p-4 rounded-2xl text-center border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-sm">
                                <div className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</div>
                                <div className="text-white text-xl font-bold">{stat.val}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Core Research Areas - Cards */}
            <div>
                <h2 className="text-3xl font-bold text-slate-800 mb-10 text-center">🧩 Core Research Areas</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { 
                            icon: "🎯", 
                            title: "Emotion Sensing", 
                            desc: "Multimodal systems detecting voice tone, prosody, and micro-expressions to gauge engagement.",
                            color: "bg-rose-50 border-rose-100 text-rose-700 ring-rose-50"
                        },
                        { 
                            icon: "📖", 
                            title: "Adaptive Story Intel", 
                            desc: "Algorithms that shift story pacing and tone based on real-time emotional arousal levels.",
                            color: "bg-amber-50 border-amber-100 text-amber-700 ring-amber-50"
                        },
                        { 
                            icon: "💡", 
                            title: "Reinforcement Models", 
                            desc: "Memory retention techniques using emotional markers and micro-feedback loops.",
                            color: "bg-emerald-50 border-emerald-100 text-emerald-700 ring-emerald-50"
                        },
                        { 
                            icon: "📊", 
                            title: "Teacher Analytics", 
                            desc: "Heat maps revealing silent struggles and emotional engagement in large classrooms.",
                            color: "bg-blue-50 border-blue-100 text-blue-700 ring-blue-50"
                        },
                        { 
                            icon: "🛡️", 
                            title: "Ethical AI", 
                            desc: "Zero identifiable data storage with complete parental visibility and cultural sensitivity.",
                            color: "bg-slate-50 border-slate-200 text-slate-700 ring-slate-50"
                        }
                    ].map((area, i) => (
                        <div key={i} className={`p-6 rounded-3xl border-2 ${area.color} hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-lg hover:ring-4`}>
                            <div className="text-4xl mb-4 bg-white w-14 h-14 flex items-center justify-center rounded-2xl shadow-sm">{area.icon}</div>
                            <h3 className="text-xl font-bold mb-3">{area.title}</h3>
                            <p className="text-sm opacity-90 leading-relaxed font-medium">{area.desc}</p>
                        </div>
                    ))}
                    {/* Methodology Card */}
                    <div className="p-6 rounded-3xl border-2 bg-indigo-50 border-indigo-100 text-indigo-700 flex flex-col justify-center hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-lg">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">🔍 Methodology</h3>
                        <div className="flex flex-wrap gap-2">
                            {["Pilot Testing", "Cognitive Psych", "Quant Analytics", "Longitudinal Tracking"].map(tag => (
                                <span key={tag} className="bg-white px-3 py-1.5 rounded-lg text-xs font-bold border border-indigo-100 shadow-sm text-indigo-600">{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Conferences Timeline - Vibrant & Detailed */}
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <h2 className="text-3xl font-bold text-slate-800 mb-12 flex items-center gap-3 relative z-10">
                    <span className="bg-blue-100 p-2 rounded-xl text-blue-600">📚</span> Global Recognition
                </h2>
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent z-10">
                    {[
                        {
                            date: "Nov 06, 2025",
                            title: "4th International Conference on Neurology & Neurological Disorders",
                            loc: "London, UK 🇬🇧",
                            type: "Scientific Oral Talk",
                            topic: "Framework for Belief Medicine",
                            link: "https://www.scitechseries.com/neurology/program/scientific-program/2025/emotion-adaptive-ai-system-for-cognitive-belief-rewriting-a-framework-for-belief-medicine",
                            // Vibrant Rose Theme
                            cardBg: "bg-rose-50",
                            borderColor: "border-rose-200",
                            hoverBorder: "hover:border-rose-400",
                            titleColor: "text-rose-900",
                            iconGradient: "bg-gradient-to-br from-rose-500 to-pink-600"
                        },
                        {
                            date: "Dec 05, 2025",
                            title: "AI Visionaries Summit 2025 (Series of World AI Summits)",
                            loc: "Gurugram, India 🇮🇳",
                            type: "Oral Presentation",
                            topic: "FeelEd AI™: An Emotion-Adaptive Framework for Story-Based Cognitive Learning",
                            link: "https://www.magnivelinternational.com/speakers/6/series-of-world-artificial-intelligence-summits",
                            // Vibrant Violet Theme
                            cardBg: "bg-violet-50",
                            borderColor: "border-violet-200",
                            hoverBorder: "hover:border-violet-400",
                            titleColor: "text-violet-900",
                            iconGradient: "bg-gradient-to-br from-violet-500 to-purple-600"
                        },
                        {
                            date: "June 22, 2026",
                            title: "12th International Conference on Neurology and Neurological Disorders",
                            loc: "Barcelona, Spain 🇪🇸",
                            type: "Invited Speaker",
                            topic: "Neurological Implications of Emotion-Adaptive Learning",
                            link: "https://neurology.magnusconferences.com/speaker/velayutham-s",
                            // Vibrant Amber Theme
                            cardBg: "bg-amber-50",
                            borderColor: "border-amber-200",
                            hoverBorder: "hover:border-amber-400",
                            titleColor: "text-amber-900",
                            iconGradient: "bg-gradient-to-br from-amber-500 to-orange-600"
                        }
                    ].map((event, i) => (
                        <a 
                            key={i} 
                            href={event.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group cursor-pointer"
                        >
                            {/* Colorful Timeline Icon */}
                            <div className={`flex items-center justify-center w-12 h-12 rounded-full border-4 border-white text-white shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 group-hover:scale-110 transition-transform ${event.iconGradient}`}>
                                <span className="text-sm font-bold">★</span>
                            </div>
                            
                            {/* Colorful Card */}
                            <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-3xl border shadow-sm transition-all group-hover:-translate-y-1 duration-300 relative ${event.cardBg} ${event.borderColor} ${event.hoverBorder} group-hover:shadow-lg`}>
                                <div className="absolute top-4 right-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 ${event.titleColor}`}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                    </svg>
                                </div>
                                <div className="flex flex-wrap justify-between items-start mb-3 gap-2">
                                    <span className="font-bold text-slate-500 text-xs uppercase tracking-wide bg-white/60 px-2 py-1 rounded-md">{event.date}</span>
                                    <span className="text-xs font-bold px-2 py-1 bg-white/80 rounded-lg shadow-sm">{event.loc}</span>
                                </div>
                                <h3 className={`font-black text-lg md:text-xl mb-1 leading-tight pr-6 ${event.titleColor}`}>{event.title}</h3>
                                <p className="text-sm text-slate-600 italic mb-4 font-medium">{event.type}</p>
                                <div className="bg-white/60 border border-white/50 p-3 rounded-xl">
                                    <p className="text-slate-700 font-semibold text-sm">Topic: "{event.topic}"</p>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>

            {/* Footer / Contact */}
            <div className="bg-slate-900 text-slate-300 p-10 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900 opacity-50"></div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold text-white mb-4">🤝 Join Our Research</h2>
                    <p className="mb-8 max-w-2xl mx-auto text-lg">
                        We welcome collaborations with universities, AI labs, and neuroscientists. Let's build the future of empathetic AI together.
                    </p>
                    <div className="flex flex-col md:flex-row justify-center gap-4">
                        <a href="mailto:founder@feeledai.com" className="bg-white text-indigo-900 font-bold py-3 px-8 rounded-full hover:bg-indigo-50 transition transform hover:scale-105 shadow-lg">
                            Partner With Us
                        </a>
                        <button onClick={() => onNavigate('generator')} className="bg-transparent border-2 border-white/20 text-white font-bold py-3 px-8 rounded-full hover:bg-white/10 transition">
                            Back to App
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Research;
