import React from 'react';
import { Page } from '../types';

interface ResearchProps {
    onNavigate: (page: Page) => void;
}

interface ResearchItem {
    id: number;
    date: string;
    title: string;
    event: string;
    location: string;
    type: 'AWARD' | 'KEYNOTE' | 'PAPER' | 'PITCH' | 'CHAPTER' | 'CASEBOOK';
    badge: string;
    description: string;
    link: string;
    metadata?: string;
    status: 'COMPLETED' | 'UPCOMING';
    theme: {
        bg: string;
        border: string;
        text: string;
        accent: string;
        icon: string;
    };
}

const researchData: ResearchItem[] = [
    {
        id: 1,
        date: "Sept 26, 2025",
        title: "𝐃𝐢𝐬𝐫𝐮𝐩𝐭𝐢𝐯𝐞 𝐀𝐈 𝐈𝐧𝐧𝐨𝐯𝐚𝐭𝐢𝐨𝐧 𝐀𝐰𝐚𝐫𝐝",
        event: "𝐖𝐨𝐫𝐥𝐝 𝐀𝐈 𝐒𝐮𝐦𝐦𝐢𝐭 𝟐𝟎𝟐𝟓",
        location: "Bangalore, Karnataka, India 🇮🇳",
        type: "AWARD",
        badge: "🏆 Distinction",
        description: "Recognized for pioneering disruptive innovations in artificial intelligence for the educational sector and cognitive development.",
        link: "https://www.linkedin.com/feed/update/urn:li:activity:7380928148982603776/",
        status: 'COMPLETED',
        theme: {
            bg: "bg-amber-50/50",
            border: "border-amber-200",
            text: "text-amber-900",
            accent: "bg-amber-500",
            icon: "🥇"
        }
    },
    {
        id: 2,
        date: "Nov 06-07, 2025",
        title: "Emotion-Adaptive AI System for Cognitive Belief Rewriting: A Framework for Belief Medicine",
        event: "3rd International Conference on Neurology & Neurological Disorders",
        location: "London, UK 🇬🇧",
        type: "KEYNOTE",
        badge: "🎤 Speaker Presentation",
        description: "Scientific presentation on the 'Belief Medicine' framework, integrating neurology with emotion-adaptive AI systems.",
        link: "https://www.scitechseries.com/neurology/speaker/velayutham-s",
        status: 'COMPLETED',
        theme: {
            bg: "bg-blue-50/50",
            border: "border-blue-200",
            text: "text-blue-900",
            accent: "bg-blue-600",
            icon: "🧠"
        }
    },
    {
        id: 3,
        date: "Nov 30, 2025",
        title: "FeelEd AI™: AN EMOTION-ADAPTIVE FRAMEWORK FOR STORY-BASED COGNITIVE LEARNING",
        event: "Beyond Boundaries: Reimagining Knowledge Through Multidisciplinary Inquiry",
        location: "Shri V.J. Modha College, Porbandar 🇮🇳",
        type: "CHAPTER",
        badge: "📚 Book Chapter",
        metadata: "DOI: 10.11411/HENXI.2025544044 | ISBN: 978-81-987316-1-6",
        description: "Book chapter methodology published in association with Henxi Education and Hexagon Academy. Methodology focus on cognitive learning.",
        link: "https://doie.org/10.11411/HENXI.2025544044",
        status: 'COMPLETED',
        theme: {
            bg: "bg-emerald-50/50",
            border: "border-emerald-200",
            text: "text-emerald-900",
            accent: "bg-emerald-600",
            icon: "📖"
        }
    },
    {
        id: 4,
        date: "Jan 22-24, 2026",
        title: "FeelEd AI™: An Emotion-Adaptive Framework for Story-Based Cognitive Learning",
        event: "Frontiers of Sustainability – Global Responsibility for Innovation & Entrepreneurship (FOS 2026 – GRIE)",
        location: "Thiagarajar School of Management (TSM), Madurai 🇮🇳",
        type: "PITCH",
        badge: "🎯 Research Pitch",
        description: "Early Stage Research/Doctoral Colloquium focused on Track 5 — Sustainability Education, Training & Capacity Building.",
        link: "https://fos.tsm.ac.in/",
        status: 'UPCOMING',
        theme: {
            bg: "bg-indigo-50/50",
            border: "border-indigo-200",
            text: "text-indigo-900",
            accent: "bg-indigo-600",
            icon: "💡"
        }
    },
    {
        id: 5,
        date: "Feb 12-14, 2026",
        title: "FeelEd AI as Pedagogy: Reimagining Learning as Emotional Becoming in the Age of Intelligent Technologies",
        event: "LLL-2026 Annual Academic (International) Conference (IIT Madras)",
        location: "IIT Madras, Chennai 🇮🇳",
        type: "PAPER",
        badge: "🏛️ International Conference",
        description: "Department of Humanities and Social Sciences conference on 'Learning, Love, and Liberation' — reimagining education.",
        link: "https://ge.iitm.ac.in/lll-2026",
        status: 'UPCOMING',
        theme: {
            bg: "bg-rose-50/50",
            border: "border-rose-200",
            text: "text-rose-900",
            accent: "bg-rose-600",
            icon: "🎓"
        }
    },
    {
        id: 6,
        date: "Feb 16-20, 2026",
        title: "FeelEd AI: A Casebook on the Real-World Impact of AI in Education",
        event: "India-AI Impact Summit 2026 (Launch Event)",
        location: "New Delhi, India 🇮🇳",
        type: "CASEBOOK",
        badge: "🚀 Casebook Launch",
        description: "Collection of real-world, scalable AI solutions enhancing educational impact, presented as a Casebook Launch.",
        link: "https://impact.indiaai.gov.in/",
        status: 'UPCOMING',
        theme: {
            bg: "bg-slate-50/50",
            border: "border-slate-300",
            text: "text-slate-900",
            accent: "bg-slate-800",
            icon: "📈"
        }
    },
    {
        id: 7,
        date: "June 22, 2026",
        title: "Emotion-Adaptive AI System for Cognitive Belief Rewriting: A Framework for Belief Medicine",
        event: "12th Edition of International Conference on Neurology & Neurological Disorders (Neurology 2026)",
        location: "International Conference 🌍",
        type: "KEYNOTE",
        badge: "🎤 Speaker Presentation",
        description: "Invited speaker session at the prestigious 12th Edition of the International Conference on Neurology.",
        link: "https://neurology.magnusconferences.com/program/scientific-program/2026/emotion-adaptive-ai-system-for-cognitive-belief-rewriting-a-framework-for-belief-medicine",
        status: 'UPCOMING',
        theme: {
            bg: "bg-violet-50/50",
            border: "border-violet-200",
            text: "text-violet-900",
            accent: "bg-violet-600",
            icon: "🧬"
        }
    },
    {
        id: 8,
        date: "July 02-07, 2026",
        title: "FeelEd AI: Narrative-Driven, Explainable Adaptivity for Emotion-Aware Learning in Low-Resource Language Contexts",
        event: "64th Annual Meeting of the Association for Computational Linguistics (ACL 2026)",
        location: "San Diego, California, USA 🇺🇸",
        type: "PAPER",
        badge: "🔬 Research Paper",
        description: "Focusing on explainable adaptivity for emotion-aware learning specifically tailored for low-resource linguistic environments.",
        link: "https://2026.aclweb.org/",
        status: 'UPCOMING',
        theme: {
            bg: "bg-purple-50/50",
            border: "border-purple-200",
            text: "text-purple-900",
            accent: "bg-purple-600",
            icon: "🔍"
        }
    }
];

const Research: React.FC<ResearchProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-6xl mx-auto space-y-24 animate-fade-in pb-32">
            
            {/* Professional Science Header */}
            <div className="text-center space-y-8 py-10">
                <div className="inline-flex items-center gap-4 px-8 py-3 rounded-full bg-blue-50 border-2 border-blue-100 text-blue-700 text-xs font-black uppercase tracking-[0.4em] shadow-sm animate-shimmer">
                    <span>🔬</span> Scientific Portfolio & Recognition
                </div>
                <h1 className="text-6xl md:text-9xl font-black text-slate-900 tracking-tighter leading-tight">
                    Science <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-500">&</span> Research
                </h1>
                <p className="text-2xl md:text-3xl text-slate-500 max-w-4xl mx-auto font-bold leading-relaxed">
                    Pioneering <span className="text-blue-600 underline decoration-blue-100 decoration-8 underline-offset-8">Affective Computing</span> and <span className="text-indigo-600 underline decoration-indigo-100 decoration-8 underline-offset-8">Cognitive Neuroscience</span> to redefine human learning.
                </p>
            </div>

            {/* Core Methodology Section */}
            <div className="glass-panel p-12 md:p-24 rounded-[4.5rem] shadow-[0_60px_120px_-20px_rgba(59,130,246,0.15)] border-4 border-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none group-hover:bg-blue-500/20 transition-colors duration-1000"></div>
                
                <div className="relative z-10 grid lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-10">
                         <h2 className="text-5xl font-black text-slate-900 flex items-center gap-6">
                            <span className="text-5xl">🧬</span> Philosophical Pillar
                         </h2>
                         <p className="text-2xl text-slate-600 leading-relaxed font-bold">
                            FeelEd AI™ is an emotion-adaptive framework designed for <span className="text-blue-600 font-black">Cognitive Belief Rewriting</span>—a pedagogical method where story resonance facilitates deep neurological change.
                         </p>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { t: "Emotion Sensing", v: "Real-time prosody & linguistic sentiment analysis" },
                                { t: "Belief Medicine", v: "Cognitive restructuring via narrative anchoring" },
                                { t: "Adaptive Pacing", v: "Dynamic narrative modulation based on arousal" },
                                { t: "Linguistic XAI", v: "Explainable AI for low-resource contexts" }
                            ].map((item, idx) => (
                                <div key={idx} className="bg-white/70 p-7 rounded-[2.5rem] border-2 border-slate-50 shadow-sm hover:shadow-xl transition-all">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.t}</h4>
                                    <p className="font-black text-slate-800 text-base">{item.v}</p>
                                </div>
                            ))}
                         </div>
                    </div>
                    
                    <div className="bg-slate-900 text-white p-14 rounded-[4rem] shadow-2xl space-y-10 border-b-[24px] border-blue-600/30 text-center">
                        <h3 className="text-xl font-black text-blue-400 uppercase tracking-[0.4em]">Theoretical Basis</h3>
                        <p className="text-3xl font-black italic text-indigo-100 leading-snug">
                            "True cognitive transformation happens not through data delivery, but through emotional resonance within the learner's theater of mind."
                        </p>
                        <div className="inline-block px-10 py-4 rounded-3xl bg-white/10 border border-white/20 font-black text-xs uppercase tracking-[0.5em] text-blue-200">
                            Empirical Validation Stage
                        </div>
                    </div>
                </div>
            </div>

            {/* Achievement Badge List */}
            <div className="space-y-16">
                <div className="text-center space-y-4">
                    <h2 className="text-5xl font-black text-slate-900 tracking-tight">Timeline of <span className="text-blue-600">Distinction</span></h2>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.6em] text-sm">International Academic Milestones</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {researchData.map((item) => (
                        <div 
                            key={item.id} 
                            className={`group relative p-12 rounded-[4.5rem] border-4 transition-all duration-500 hover:scale-[1.02] hover:shadow-4xl flex flex-col h-full bg-white ${item.theme.border}`}
                        >
                            {/* Achievement Badge */}
                            <div className="absolute top-12 right-12">
                                <span className={`px-6 py-3 rounded-full text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-xl ${item.theme.accent} animate-pulse-slow`}>
                                    {item.badge}
                                </span>
                            </div>

                            <div className="space-y-8 flex-grow">
                                <div className="space-y-3">
                                    <div className={`text-[10px] font-black uppercase tracking-[0.4em] ${item.status === 'UPCOMING' ? 'text-blue-500' : 'text-slate-400'}`}>
                                        {item.status === 'UPCOMING' ? '📅 UPCOMING • ' : '✔️ ACHIEVED • '}{item.date}
                                    </div>
                                    <h3 className={`text-3xl font-black leading-tight pr-12 ${item.theme.text}`}>
                                        {item.title}
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-5 text-slate-800 font-black text-sm">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-3xl shadow-inner">{item.theme.icon}</div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-400 uppercase tracking-widest">Venue / Event</span>
                                            {item.event}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-5 text-slate-500 font-bold text-sm ml-2">
                                        <span className="opacity-50 text-2xl">📍</span>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-400 uppercase tracking-widest">Location</span>
                                            {item.location}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-slate-600 font-bold leading-relaxed text-lg pl-6 border-l-4 border-slate-100">
                                    {item.description}
                                </p>

                                {item.metadata && (
                                    <div className="bg-slate-50 p-7 rounded-[2.5rem] border-2 border-slate-100 text-[10px] font-mono text-slate-400 break-all leading-relaxed shadow-inner">
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
                                    className={`inline-flex w-full items-center justify-center gap-4 px-10 py-6 rounded-[2rem] text-white font-black text-sm transition-all shadow-3xl active:scale-95 group-hover:scale-105 ${item.theme.accent} ring-8 ring-transparent group-hover:ring-blue-100`}
                                >
                                    <span>Official Link</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform group-hover:rotate-45 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Scientific Partnerships CTA */}
            <div className="bg-slate-900 text-white p-20 md:p-32 rounded-[5rem] text-center shadow-4xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15)_0%,transparent_100%)]"></div>
                <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500"></div>
                
                <div className="relative z-10 space-y-12">
                    <h2 className="text-5xl md:text-8xl font-black tracking-tighter">Academic <span className="text-blue-400">Collaboration</span></h2>
                    <p className="text-2xl md:text-3xl text-slate-400 font-bold max-w-4xl mx-auto leading-relaxed">
                        Join our global network of research partners in <span className="text-white">Neuroimaging</span>, <span className="text-white">Cognitive Psychology</span>, and <span className="text-white">Affective Computing</span>.
                    </p>
                    <div className="flex flex-col md:flex-row justify-center gap-8 pt-10">
                        <a href="mailto:founder@feeledai.com" className="bg-white text-slate-900 font-black py-8 px-20 rounded-full text-2xl shadow-4xl hover:scale-110 transition-transform active:scale-95 border-b-[12px] border-slate-200">
                            Submit Research Inquiry
                        </a>
                        <button onClick={() => onNavigate('generator')} className="bg-transparent border-4 border-white/20 text-white font-black py-8 px-20 rounded-full text-2xl hover:bg-white/10 transition-colors">
                            Return to App
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Research;
