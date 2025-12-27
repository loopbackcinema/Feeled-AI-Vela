import React from 'react';
import { Page } from '../types';

interface ResearchProps {
    onNavigate: (page: Page) => void;
}

interface ResearchAchievement {
    id: number;
    date: string;
    title: string;
    event: string;
    location?: string;
    type: 'AWARD' | 'CONFERENCE' | 'PUBLICATION' | 'PITCH' | 'UPCOMING' | 'SPEAKER';
    badgeLabel: string;
    description: string;
    link: string;
    metadata?: string;
    status: 'COMPLETED' | 'UPCOMING';
    color: {
        bg: string;
        border: string;
        text: string;
        accent: string;
    };
}

const achievements: ResearchAchievement[] = [
    {
        id: 1,
        date: "2025-09-26",
        title: "𝐃𝐢𝐬𝐫𝐮𝐩𝐭𝐢𝐯𝐞 𝐀𝐈 𝐈𝐧𝐧𝐨𝐯𝐚𝐭𝐢𝐨𝐧 𝐀𝐰𝐚𝐫𝐝",
        event: "𝐖𝐨𝐫𝐥𝐝 𝐀𝐈 𝐒𝐮𝐦𝐦𝐢𝐭 𝟐𝟎𝟐𝟓",
        location: "Bangalore, Karnataka, India",
        type: "AWARD",
        badgeLabel: "🏆 Distinction",
        description: "Awarded for pioneering disruptive innovation in Artificial Intelligence for education and cognitive development.",
        link: "https://www.linkedin.com/feed/update/urn:li:activity:7380928148982603776/",
        status: "COMPLETED",
        color: {
            bg: "bg-amber-50/50",
            border: "border-amber-200",
            text: "text-amber-900",
            accent: "bg-amber-600"
        }
    },
    {
        id: 2,
        date: "2025-11-06",
        title: "Emotion-Adaptive AI System for Cognitive Belief Rewriting: A Framework for Belief Medicine",
        event: "3rd International Conference on Neurology & Neurological Disorders",
        location: "London, UK",
        type: "SPEAKER",
        badgeLabel: "🎤 Speaker Presentation",
        description: "Presentation of a novel framework exploring AI's role in neurological belief restructuring and cognitive therapy.",
        link: "https://www.scitechseries.com/neurology/speaker/velayutham-s",
        status: "COMPLETED",
        color: {
            bg: "bg-blue-50/50",
            border: "border-blue-200",
            text: "text-blue-900",
            accent: "bg-blue-600"
        }
    },
    {
        id: 3,
        date: "2025-11-30",
        title: "FEELED AI TM: AN EMOTION-ADAPTIVE FRAMEWORK FOR STORY-BASED COGNITIVE LEARNING",
        event: "Beyond Boundaries: Reimagining Knowledge Through Multidisciplinary Inquiry",
        location: "Shri V.J. Modha College, Porbandar, India",
        type: "PUBLICATION",
        badgeLabel: "📚 Book Chapter",
        description: "Published methodology in association with Henxi Education and Hexagon Academy, focusing on reimaging knowledge through multidisciplinary lenses.",
        metadata: "DOI: 10.11411/HENXI.2025544044 | ISBN: 978-81-987316-1-6",
        link: "https://doie.org/10.11411/HENXI.2025544044",
        status: "COMPLETED",
        color: {
            bg: "bg-emerald-50/50",
            border: "border-emerald-200",
            text: "text-emerald-900",
            accent: "bg-emerald-600"
        }
    },
    {
        id: 4,
        date: "2026-06-22",
        title: "Emotion-Adaptive AI System for Cognitive Belief Rewriting: A Framework for Belief Medicine",
        event: "12th Edition of International Conference on Neurology & Neurological Disorders (Neurology 2026)",
        location: "International Conference (Upcoming)",
        type: "CONFERENCE",
        badgeLabel: "📄 Conference Paper",
        description: "Advanced speaker presentation on emotion-adaptive systems in clinical and cognitive neurology contexts.",
        link: "https://neurology.magnusconferences.com/program/scientific-program/2026/emotion-adaptive-ai-system-for-cognitive-belief-rewriting-a-framework-for-belief-medicine",
        status: "UPCOMING",
        color: {
            bg: "bg-violet-50/50",
            border: "border-violet-200",
            text: "text-violet-900",
            accent: "bg-violet-600"
        }
    },
    {
        id: 5,
        date: "Jan 22–24, 2026",
        title: "FeelEd AI™: An Emotion-Adaptive Framework for Story-Based Cognitive Learning",
        event: "Frontiers of Sustainability – Global Responsibility for Innovation & Entrepreneurship (FOS 2026 – GRIE)",
        location: "Thiagarajar School of Management (TSM), Madurai, India",
        type: "PITCH",
        badgeLabel: "🎯 Research Pitch",
        description: "Selected for Track 5 — Sustainability Education, Training & Capacity Building (Doctoral Colloquium / Early Stage Research).",
        link: "https://fos.tsm.ac.in/",
        status: "UPCOMING",
        color: {
            bg: "bg-indigo-50/50",
            border: "border-indigo-200",
            text: "text-indigo-900",
            accent: "bg-indigo-600"
        }
    },
    {
        id: 6,
        date: "Feb 12–14, 2026",
        title: "FeelEd AI as Pedagogy: Reimagining Learning as Emotional Becoming in the Age of Intelligent Technologies",
        event: "LEARNING, LOVE, and LIBERATION (IIT Madras Annual International Conference)",
        location: "IIT Madras, India",
        type: "CONFERENCE",
        badgeLabel: "🎓 International Conference",
        description: "Academic paper investigating pedagogy and emotional becoming in the age of intelligent technologies.",
        link: "https://ge.iitm.ac.in/lll-2026",
        status: "UPCOMING",
        color: {
            bg: "bg-rose-50/50",
            border: "border-rose-200",
            text: "text-rose-900",
            accent: "bg-rose-600"
        }
    },
    {
        id: 7,
        date: "Feb 16–20, 2026",
        title: "FeelEd AI: A Casebook on the Real-World Impact of AI in Education",
        event: "India-AI Impact Summit 2026",
        location: "National Impact Summit (Govt of India Initiative)",
        type: "UPCOMING",
        badgeLabel: "🚀 Casebook Launch",
        description: "Official launch of scalable AI solutions collection enhancing educational impact globally.",
        link: "https://impact.indiaai.gov.in/",
        status: "UPCOMING",
        color: {
            bg: "bg-slate-50/50",
            border: "border-slate-300",
            text: "text-slate-900",
            accent: "bg-slate-800"
        }
    },
    {
        id: 8,
        date: "July 2–7, 2026",
        title: "FeelEd AI: Narrative-Driven, Explainable Adaptivity for Emotion-Aware Learning in Low-Resource Language Contexts",
        event: "64th Annual Meeting of the Association for Computational Linguistics (ACL 2026)",
        location: "San Diego, California, USA",
        type: "PUBLICATION",
        badgeLabel: "🔬 Research Paper",
        description: "Research focusing on explainable AI models for emotion-aware learning specifically tailored for low-resource language contexts.",
        link: "https://2026.aclweb.org/",
        status: "UPCOMING",
        color: {
            bg: "bg-purple-50/50",
            border: "border-purple-200",
            text: "text-purple-900",
            accent: "bg-purple-600"
        }
    }
];

const Research: React.FC<ResearchProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-6xl mx-auto space-y-24 animate-fade-in pb-32">
            
            {/* Science Hero Section */}
            <div className="text-center space-y-8 py-12">
                <div className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-blue-50 border-2 border-blue-100 text-blue-700 text-xs font-black uppercase tracking-[0.4em] shadow-sm animate-shimmer">
                    <span>🔬</span> Scientific Excellence
                </div>
                <h1 className="text-6xl md:text-9xl font-black text-slate-900 tracking-tighter leading-tight">
                    Research <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-500">&</span> Science
                </h1>
                <p className="text-2xl md:text-3xl text-slate-500 max-w-4xl mx-auto font-bold leading-relaxed">
                    Bridging the gap between <span className="text-blue-600 underline decoration-blue-100 decoration-8 underline-offset-8">Affective Computing</span> and <span className="text-cyan-600 underline decoration-cyan-100 decoration-8 underline-offset-8">Pedagogical Innovation</span>.
                </p>
            </div>

            {/* Methodology Glass Section */}
            <div className="glass-panel p-12 md:p-24 rounded-[4.5rem] shadow-[0_60px_120px_-20px_rgba(59,130,246,0.15)] border-4 border-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none group-hover:bg-blue-500/20 transition-colors duration-1000"></div>
                
                <div className="relative z-10 grid lg:grid-cols-2 gap-20 items-start">
                    <div className="space-y-10">
                         <h2 className="text-5xl font-black text-slate-900 flex items-center gap-5">
                            <span className="text-5xl">🧬</span> Scientific Core
                         </h2>
                         <p className="text-2xl text-slate-600 leading-relaxed font-bold">
                            FeelEd AI™ is an emotion-adaptive framework designed for <span className="text-blue-600">Cognitive Belief Rewriting</span> through story-based immersive learning.
                         </p>
                         <div className="grid gap-5">
                            {[
                                { title: "Emotion Sensing", val: "Real-time prosody & linguistic sentiment analysis" },
                                { title: "Adaptive Pacing", val: "Dynamic narrative adjustment based on arousal" },
                                { title: "Belief Medicine", val: "Cognitive rewriting via narrative anchoring" },
                                { title: "Explainability", val: "Human-centered XAI for educational transparency" }
                            ].map((point, idx) => (
                                <div key={idx} className="flex items-start gap-5 bg-white/70 p-7 rounded-3xl border-2 border-slate-50 shadow-sm hover:shadow-xl transition-all">
                                    <span className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black flex-shrink-0">0{idx + 1}</span>
                                    <div>
                                        <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-1">{point.title}</h4>
                                        <p className="font-bold text-slate-500">{point.val}</p>
                                    </div>
                                </div>
                            ))}
                         </div>
                    </div>
                    
                    <div className="bg-slate-900 text-white p-14 rounded-[4rem] shadow-2xl space-y-10 border-b-[24px] border-blue-600/30">
                        <div className="space-y-4">
                            <h3 className="text-2xl font-black text-blue-400 uppercase tracking-[0.2em] text-center">Belief Medicine</h3>
                            <div className="h-1 w-20 bg-blue-500/50 mx-auto rounded-full"></div>
                        </div>
                        <p className="text-indigo-100/70 text-2xl leading-relaxed font-medium italic text-center">
                            "True cognitive transformation happens not when the brain stores facts, but when the heart accepts a new reality through the power of narrative resonance."
                        </p>
                        <div className="flex flex-col items-center gap-6 pt-4">
                            <div className="px-10 py-4 rounded-3xl bg-white/10 border border-white/20 font-black text-sm uppercase tracking-[0.3em] text-blue-300">
                                Global Validation Phase
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Global Academic Recognition List */}
            <div className="space-y-20">
                <div className="text-center space-y-6">
                    <h2 className="text-5xl font-black text-slate-900 tracking-tight">Global Academic <span className="text-blue-600">Timeline</span></h2>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.5em] text-sm">Validating Empathy in the Machine Age</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {achievements.map((item) => (
                        <div 
                            key={item.id} 
                            className={`group relative p-12 rounded-[4.5rem] border-4 transition-all duration-500 hover:scale-[1.03] hover:shadow-3xl flex flex-col h-full bg-white ${item.color.border}`}
                        >
                            {/* Detailed Badge Label */}
                            <div className="absolute top-12 right-12">
                                <span className={`px-6 py-3 rounded-full text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-xl ${item.color.accent} animate-pulse-slow`}>
                                    {item.badgeLabel}
                                </span>
                            </div>

                            <div className="space-y-8 flex-grow">
                                <div className="space-y-3">
                                    <div className={`text-xs font-black uppercase tracking-[0.3em] ${item.status === 'UPCOMING' ? 'text-blue-500' : 'text-slate-400'}`}>
                                        {item.status === 'UPCOMING' ? 'Upcoming • ' : 'Published • '}{item.date}
                                    </div>
                                    <h3 className={`text-3xl font-black leading-tight pr-10 ${item.color.text}`}>
                                        {item.title}
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 text-slate-800 font-black text-sm">
                                        <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center">🏢</div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-400 uppercase tracking-widest">Venue / Event</span>
                                            {item.event}
                                        </div>
                                    </div>
                                    {item.location && (
                                        <div className="flex items-center gap-4 text-slate-500 font-bold text-sm">
                                            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center">📍</div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-400 uppercase tracking-widest">Location</span>
                                                {item.location}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <p className="text-slate-600 font-bold leading-relaxed text-lg border-l-4 border-slate-100 pl-6">
                                    {item.description}
                                </p>

                                {item.metadata && (
                                    <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 text-[10px] font-mono text-slate-400 break-all leading-relaxed">
                                        <span className="text-slate-500 font-black uppercase block mb-1 tracking-widest">Technical Metadata</span>
                                        {item.metadata}
                                    </div>
                                )}
                            </div>

                            <div className="mt-12">
                                <a 
                                    href={item.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className={`inline-flex w-full items-center justify-center gap-4 px-10 py-6 rounded-3xl text-white font-black text-sm transition-all shadow-2xl active:scale-95 group-hover:scale-105 ${item.color.accent} ring-8 ring-transparent group-hover:ring-blue-100`}
                                >
                                    <span>Visit Official Link</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform group-hover:rotate-45 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Strategic Call to Action */}
            <div className="bg-slate-900 text-white p-20 md:p-32 rounded-[5rem] text-center shadow-3xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.2)_0%,transparent_100%)]"></div>
                <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500"></div>
                
                <div className="relative z-10 space-y-12">
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter">Strategic Academic <span className="text-blue-400">Collaboration</span></h2>
                    <p className="text-2xl text-slate-400 font-bold max-w-4xl mx-auto leading-relaxed">
                        We are building a global network of partners across <span className="text-white">Neuroimaging</span>, <span className="text-white">Cognitive Psychology</span>, and <span className="text-white">Affective Computing</span> to set new standards in empathetic AI.
                    </p>
                    <div className="flex flex-col md:flex-row justify-center gap-8 pt-10">
                        <a href="mailto:founder@feeledai.com" className="bg-white text-slate-900 font-black py-8 px-20 rounded-full text-2xl shadow-3xl hover:scale-110 transition-transform active:scale-95 border-b-[12px] border-slate-200">
                            Partner with Us
                        </a>
                        <button onClick={() => onNavigate('generator')} className="bg-transparent border-4 border-white/20 text-white font-black py-8 px-20 rounded-full text-2xl hover:bg-white/10 transition-colors">
                            Try App Demo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Research;
