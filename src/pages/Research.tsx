
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
    type: 'AWARD' | 'CONFERENCE' | 'PUBLICATION' | 'PITCH' | 'UPCOMING';
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
        date: "Sept 26, 2025",
        title: "Disruptive AI Innovation Award",
        event: "World AI Summit 2025",
        location: "Bangalore, Karnataka, India",
        type: "AWARD",
        badgeLabel: "Distinction",
        description: "Recognized for disruptive innovation in the field of Artificial Intelligence, specifically applying emotion-aware models to education.",
        link: "https://www.linkedin.com/feed/update/urn:li:activity:7380928148982603776/",
        status: "COMPLETED",
        color: {
            bg: "bg-amber-50",
            border: "border-amber-200",
            text: "text-amber-900",
            accent: "bg-amber-600"
        }
    },
    {
        id: 2,
        date: "Nov 06-07, 2025",
        title: "Emotion-Adaptive AI System for Cognitive Belief Rewriting: A Framework for Belief Medicine",
        event: "3rd International Conference on Neurology & Neurological Disorders",
        location: "London, UK",
        type: "CONFERENCE",
        badgeLabel: "Speaker Presentation",
        description: "Presentation of the core methodology behind using narrative-driven AI to influence cognitive belief systems.",
        link: "https://www.scitechseries.com/neurology/speaker/velayutham-s",
        status: "COMPLETED",
        color: {
            bg: "bg-blue-50",
            border: "border-blue-200",
            text: "text-blue-900",
            accent: "bg-blue-600"
        }
    },
    {
        id: 3,
        date: "Nov 30, 2025",
        title: "FeelEd AI™: An Emotion-Adaptive Framework for Story-Based Cognitive Learning",
        event: "Beyond Boundaries: Reimagining Knowledge Through Multidisciplinary Inquiry",
        location: "Shri V.J. Modha College, Porbandar",
        type: "PUBLICATION",
        badgeLabel: "Book Chapter",
        description: "Published methodology focusing on multidisciplinary inquiry in association with Henxi Education and Hexagon Academy.",
        metadata: "DOI: 10.11411/HENXI.2025544044 | ISBN: 978-81-987316-1-6",
        link: "https://doie.org/10.11411/HENXI.2025544044",
        status: "COMPLETED",
        color: {
            bg: "bg-emerald-50",
            border: "border-emerald-200",
            text: "text-emerald-900",
            accent: "bg-emerald-600"
        }
    },
    {
        id: 4,
        date: "Jan 22–24, 2026",
        title: "FeelEd AI™: An Emotion-Adaptive Framework for Story-Based Cognitive Learning",
        event: "Frontiers of Sustainability (FOS 2026 – GRIE)",
        location: "TSM, Madurai, Tamilnadu, India",
        type: "PITCH",
        badgeLabel: "Research Pitch",
        description: "Selected for Track 5 — Sustainability Education, Training & Capacity Building (Doctoral Colloquium / Early Stage Research).",
        link: "https://fos.tsm.ac.in/",
        status: "UPCOMING",
        color: {
            bg: "bg-indigo-50",
            border: "border-indigo-200",
            text: "text-indigo-900",
            accent: "bg-indigo-600"
        }
    },
    {
        id: 5,
        date: "Feb 12–14, 2026",
        title: "FeelEd AI as Pedagogy: Reimagining Learning as Emotional Becoming in the Age of Intelligent Technologies",
        event: "LLL-2026 Annual Academic (International) Conference",
        location: "IIT Madras, India",
        type: "CONFERENCE",
        badgeLabel: "Conference Paper",
        description: "Reimagining education through multiple lenses of knowing and becoming at the Dept. of Humanities & Social Sciences.",
        link: "https://ge.iitm.ac.in/lll-2026",
        status: "UPCOMING",
        color: {
            bg: "bg-purple-50",
            border: "border-purple-200",
            text: "text-purple-900",
            accent: "bg-purple-600"
        }
    },
    {
        id: 6,
        date: "Feb 16–20, 2026",
        title: "FeelEd AI: A Casebook on the Real-World Impact of AI in Education",
        event: "India-AI Impact Summit 2026",
        location: "New Delhi, India",
        type: "UPCOMING",
        badgeLabel: "Casebook Launch",
        description: "Part of a collection of scalable AI solutions enhancing educational impact, presented by IndiaAI Gov.",
        link: "https://impact.indiaai.gov.in/",
        status: "UPCOMING",
        color: {
            bg: "bg-rose-50",
            border: "border-rose-200",
            text: "text-rose-900",
            accent: "bg-rose-600"
        }
    },
    {
        id: 7,
        date: "June 22, 2026",
        title: "Emotion-Adaptive AI System for Cognitive Belief Rewriting: A Framework for Belief Medicine",
        event: "12th Edition of International Conference on Neurology & Neurological Disorders",
        location: "International Conference",
        type: "CONFERENCE",
        badgeLabel: "Speaker Presentation",
        description: "Continued expansion of research into neurological frameworks for AI-assisted cognitive therapy.",
        link: "https://neurology.magnusconferences.com/program/scientific-program/2026/emotion-adaptive-ai-system-for-cognitive-belief-rewriting-a-framework-for-belief-medicine",
        status: "UPCOMING",
        color: {
            bg: "bg-cyan-50",
            border: "border-cyan-200",
            text: "text-cyan-900",
            accent: "bg-cyan-600"
        }
    },
    {
        id: 8,
        date: "July 2–7, 2026",
        title: "FeelEd AI: Narrative-Driven, Explainable Adaptivity for Emotion-Aware Learning in Low-Resource Language Contexts",
        event: "64th Annual Meeting of the Association for Computational Linguistics (ACL 2026)",
        location: "San Diego, California, USA",
        type: "PUBLICATION",
        badgeLabel: "Research Paper",
        description: "Scientific paper focusing on the implementation of explainable, emotion-aware models in underserved language groups.",
        link: "https://2026.aclweb.org/",
        status: "UPCOMING",
        color: {
            bg: "bg-slate-50",
            border: "border-slate-200",
            text: "text-slate-900",
            accent: "bg-slate-800"
        }
    }
];

const Research: React.FC<ResearchProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-6xl mx-auto space-y-20 animate-fade-in pb-32">
            
            {/* Science Hero Section */}
            <div className="text-center space-y-8 py-10">
                <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-indigo-50 border-2 border-indigo-100 text-indigo-700 text-sm font-black uppercase tracking-[0.3em] shadow-sm animate-shimmer">
                    <span>🔬</span> Scientific Portfolio
                </div>
                <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter leading-tight">
                    Research <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500">&</span> Science
                </h1>
                <p className="text-2xl text-slate-500 max-w-3xl mx-auto font-bold leading-relaxed">
                    Pioneering the intersection of <span className="text-indigo-600 underline decoration-indigo-100 decoration-8 underline-offset-8">Affective Computing</span> and <span className="text-cyan-600 underline decoration-cyan-100 decoration-8 underline-offset-8">Cognitive Pedagogy</span>.
                </p>
            </div>

            {/* Methodology Glass Section */}
            <div className="glass-panel p-10 md:p-20 rounded-[4rem] shadow-2xl border-4 border-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none group-hover:bg-indigo-500/20 transition-colors duration-1000"></div>
                
                <div className="relative z-10 grid md:grid-cols-2 gap-16 items-start">
                    <div className="space-y-8">
                         <h2 className="text-4xl font-black text-slate-900 flex items-center gap-4">
                            <span className="text-4xl">🧬</span> Core Methodology
                         </h2>
                         <p className="text-xl text-slate-600 leading-relaxed font-bold">
                            FeelEd AI™ utilizes a proprietary <span className="text-indigo-600">Emotion-Adaptive Framework</span> to transform abstract cognitive concepts into immersive, narrative-driven experiences.
                         </p>
                         <div className="space-y-4">
                            {[
                                "Emotion Sensing via Prosody & Sentiment",
                                "Adaptive Story Pacing (A-Pace Index)",
                                "Cognitive Belief Rewriting Framework",
                                "Explainable AI (XAI) for Pedagogical Transparency"
                            ].map((point, idx) => (
                                <div key={idx} className="flex items-center gap-4 bg-white/60 p-5 rounded-2xl border-2 border-slate-50 shadow-sm">
                                    <span className="text-indigo-500 font-black">0{idx + 1}</span>
                                    <span className="font-bold text-slate-700">{point}</span>
                                </div>
                            ))}
                         </div>
                    </div>
                    
                    <div className="bg-slate-900 text-white p-12 rounded-[3.5rem] shadow-2xl space-y-8 border-b-[16px] border-indigo-500/30">
                        <div className="text-center">
                            <h3 className="text-2xl font-black text-indigo-400 mb-2 uppercase tracking-widest">Research Pillar</h3>
                            <p className="text-4xl font-black italic">"Belief Medicine"</p>
                        </div>
                        <p className="text-indigo-100/70 text-lg leading-relaxed font-medium">
                            Exploring how emotionally resonant stories act as a catalyst for cognitive restructuring, allowing learners to bypass psychological barriers to complex conceptual understanding.
                        </p>
                        <div className="pt-6 flex justify-center">
                            <div className="px-10 py-4 rounded-2xl bg-white/10 border border-white/20 font-black text-sm uppercase tracking-widest text-indigo-200">
                                Global Validation Stage
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recognition Timeline / Badges Grid */}
            <div className="space-y-16">
                <div className="text-center space-y-4">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Global Academic <span className="text-indigo-600">Recognition</span></h2>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-sm">Validating Empathy in Education</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {achievements.map((item) => (
                        <div 
                            key={item.id} 
                            className={`group relative p-10 rounded-[3.5rem] border-4 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] flex flex-col h-full ${item.color.bg} ${item.color.border}`}
                        >
                            {/* Detailed Badge Label */}
                            <div className="absolute top-10 right-10">
                                <span className={`px-5 py-2 rounded-full text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${item.color.accent}`}>
                                    {item.badgeLabel}
                                </span>
                            </div>

                            <div className="space-y-6 flex-grow">
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{item.date}</p>
                                    <h3 className={`text-2xl font-black leading-tight pr-16 ${item.color.text}`}>
                                        {item.title}
                                    </h3>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-slate-700 font-black text-sm">
                                        <span className="opacity-50 text-base">🏢</span> {item.event}
                                    </div>
                                    {item.location && (
                                        <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                                            <span className="opacity-50 text-base">📍</span> {item.location}
                                        </div>
                                    )}
                                </div>

                                <p className="text-slate-600 font-bold leading-relaxed text-base">
                                    {item.description}
                                </p>

                                {item.metadata && (
                                    <div className="bg-white/60 p-4 rounded-2xl border border-white text-[10px] font-mono text-slate-400 break-all">
                                        {item.metadata}
                                    </div>
                                )}
                            </div>

                            <div className="mt-10">
                                <a 
                                    href={item.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-black text-sm transition-all shadow-xl active:scale-95 group-hover:scale-105 ${item.color.accent}`}
                                >
                                    <span>View Official Record</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Academic Call to Action */}
            <div className="bg-slate-900 text-white p-16 md:p-24 rounded-[4.5rem] text-center shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-pink-500 to-yellow-500"></div>
                <div className="relative z-10 space-y-10">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight">Collaborate in <span className="text-indigo-400">Innovation</span></h2>
                    <p className="text-xl text-slate-400 font-bold max-w-3xl mx-auto leading-relaxed">
                        We are actively seeking partnerships with Neuroimaging labs, EdTech research groups, and Cognitive Psychology departments to validate and scale the FeelEd AI™ framework.
                    </p>
                    <div className="flex flex-col md:flex-row justify-center gap-6 pt-6">
                        <a href="mailto:founder@feeledai.com" className="bg-white text-slate-900 font-black py-6 px-16 rounded-full text-xl shadow-2xl hover:scale-110 transition-transform active:scale-95">
                            Partner With Us
                        </a>
                        <button onClick={() => onNavigate('generator')} className="bg-transparent border-4 border-white/20 text-white font-black py-6 px-16 rounded-full text-xl hover:bg-white/10 transition-colors">
                            Back to App
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Research;
