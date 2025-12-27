import React from 'react';
import { Page } from '../types';

interface ResearchProps {
    onNavigate: (page: Page) => void;
}

interface Achievement {
    id: number;
    date: string;
    title: string;
    event: string;
    location: string;
    type: 'AWARD' | 'KEYNOTE' | 'PUBLICATION' | 'PITCH' | 'UPCOMING';
    badge: string;
    description: string;
    link: string;
    metadata?: string;
    theme: {
        bg: string;
        border: string;
        accent: string;
        text: string;
    };
}

const achievements: Achievement[] = [
    {
        id: 1,
        date: "Sept 26, 2025",
        title: "𝐃𝐢𝐬𝐫𝐮𝐩𝐭𝐢𝐯𝐞 𝐀𝐈 𝐈𝐧𝐧𝐨𝐯𝐚𝐭𝐢𝐨𝐧 𝐀𝐰𝐚𝐫𝐝 (Artificial Intelligence)",
        event: "𝐖𝐨𝐫𝐥𝐝 𝐀𝐈 𝐒𝐮𝐦𝐦𝐢𝐭 𝟐𝟎𝟐𝟓",
        location: "Bangalore, Karnataka, India, IN",
        type: "AWARD",
        badge: "🏆 Distinction",
        description: "Recognized for pioneering disruptive innovations in AI-driven pedagogy and emotional intelligence systems.",
        link: "https://www.linkedin.com/feed/update/urn:li:activity:7380928148982603776/",
        theme: {
            bg: "bg-amber-50/60",
            border: "border-amber-200",
            accent: "bg-amber-600",
            text: "text-amber-900"
        }
    },
    {
        id: 2,
        date: "Nov 06-07, 2025",
        title: "Emotion-Adaptive AI System for Cognitive Belief Rewriting: A Framework for Belief Medicine",
        event: "3rd International Conference on Neurology & Neurological Disorders",
        location: "London, UK",
        type: "KEYNOTE",
        badge: "🎤 Speaker Presentation",
        description: "Showcasing the framework for 'Belief Medicine' using AI to restructure cognitive patterns through story resonance.",
        link: "https://www.scitechseries.com/neurology/speaker/velayutham-s",
        theme: {
            bg: "bg-blue-50/60",
            border: "border-blue-200",
            accent: "bg-blue-600",
            text: "text-blue-900"
        }
    },
    {
        id: 3,
        date: "Nov 30, 2025",
        title: "FEELED AI™: AN EMOTION-ADAPTIVE FRAMEWORK FOR STORY-BASED COGNITIVE LEARNING",
        event: "Beyond Boundaries: Reimagining Knowledge Through Multidisciplinary Inquiry",
        location: "Shri V.J. Modha College, Porbandar, India",
        type: "PUBLICATION",
        badge: "📚 Book Chapter",
        metadata: "DOI: 10.11411/HENXI.2025544044 | ISBN: 978-81-987316-1-6",
        description: "Methodological chapter published in association with Henxi Education and Hexagon Academy.",
        link: "https://doie.org/10.11411/HENXI.2025544044",
        theme: {
            bg: "bg-emerald-50/60",
            border: "border-emerald-200",
            accent: "bg-emerald-600",
            text: "text-emerald-900"
        }
    },
    {
        id: 4,
        date: "June 22, 2026",
        title: "Emotion-Adaptive AI System for Cognitive Belief Rewriting: A Framework for Belief Medicine",
        event: "12th Edition of International Conference on Neurology & Neurological Disorders (Neurology 2026)",
        location: "Barcelona, Spain",
        type: "UPCOMING",
        badge: "🌟 Upcoming Speaker",
        description: "Invited presentation on advanced neuro-adaptive AI models and their clinical pedagogical applications.",
        link: "https://neurology.magnusconferences.com/program/scientific-program/2026/emotion-adaptive-ai-system-for-cognitive-belief-rewriting-a-framework-for-belief-medicine",
        theme: {
            bg: "bg-indigo-50/60",
            border: "border-indigo-200",
            accent: "bg-indigo-600",
            text: "text-indigo-900"
        }
    },
    {
        id: 5,
        date: "Jan 22–24, 2026",
        title: "FeelEd AI™: An Emotion-Adaptive Framework for Story-Based Cognitive Learning",
        event: "Frontiers of Sustainability – Global Responsibility for Innovation & Entrepreneurship (FOS 2026 – GRIE)",
        location: "Thiagarajar School of Management (TSM), Madurai, India",
        type: "PITCH",
        badge: "🎯 Research Pitch",
        description: "Selected for Track 5 — Sustainability Education, Training & Capacity Building (Doctoral Colloquium).",
        link: "https://fos.tsm.ac.in/",
        theme: {
            bg: "bg-cyan-50/60",
            border: "border-cyan-200",
            accent: "bg-cyan-600",
            text: "text-cyan-900"
        }
    },
    {
        id: 6,
        date: "Feb 12–14, 2026",
        title: "FeelEd AI as Pedagogy: Reimagining Learning as Emotional Becoming in the Age of Intelligent Technologies",
        event: "Learning, Love, and Liberation (IIT Madras Annual International Conference)",
        location: "IIT Madras, India",
        type: "UPCOMING",
        badge: "🎓 Academic Paper",
        description: "Reimagining education through multiple lenses of knowing and becoming in the intelligent tech era.",
        link: "https://ge.iitm.ac.in/lll-2026",
        theme: {
            bg: "bg-rose-50/60",
            border: "border-rose-200",
            accent: "bg-rose-600",
            text: "text-rose-900"
        }
    },
    {
        id: 7,
        date: "Feb 16–20, 2026",
        title: "FeelEd AI: A Casebook on the Real-World Impact of AI in Education",
        event: "India-AI Impact Summit 2026",
        location: "National Impact Summit (IndiaAI Gov Initiative)",
        type: "UPCOMING",
        badge: "🚀 Casebook Launch",
        description: "Showcasing scalable, real-world AI solutions enhancing educational impact across the nation.",
        link: "https://impact.indiaai.gov.in/",
        theme: {
            bg: "bg-slate-50/60",
            border: "border-slate-300",
            accent: "bg-slate-800",
            text: "text-slate-900"
        }
    },
    {
        id: 8,
        date: "July 2–7, 2026",
        title: "FeelEd AI: Narrative-Driven, Explainable Adaptivity for Emotion-Aware Learning in Low-Resource Language Contexts",
        event: "64th Annual Meeting of the Association for Computational Linguistics (ACL 2026)",
        location: "San Diego, California, USA",
        type: "UPCOMING",
        badge: "🔬 Research Paper",
        description: "Scientific paper on explainable adaptivity and narrative-driven models for underserved language populations.",
        link: "https://2026.aclweb.org/",
        theme: {
            bg: "bg-purple-50/60",
            border: "border-purple-200",
            accent: "bg-purple-600",
            text: "text-purple-900"
        }
    }
];

const Research: React.FC<ResearchProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-6xl mx-auto space-y-24 animate-fade-in pb-32">
            
            {/* Professional Science Header */}
            <div className="text-center space-y-8 py-10">
                <div className="inline-flex items-center gap-4 px-8 py-3 rounded-full bg-blue-50 border-2 border-blue-100 text-blue-700 text-xs font-black uppercase tracking-[0.4em] shadow-sm animate-shimmer">
                    <span>🔬</span> Scientific Portfolio & Global Recognition
                </div>
                <h1 className="text-6xl md:text-9xl font-black text-slate-900 tracking-tighter leading-tight">
                    Science <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-500">&</span> Research
                </h1>
                <p className="text-2xl md:text-3xl text-slate-500 max-w-4xl mx-auto font-bold leading-relaxed">
                    Bridging <span className="text-blue-600 underline decoration-blue-100 decoration-8 underline-offset-8">Neuroscience</span> and <span className="text-indigo-600 underline decoration-indigo-100 decoration-8 underline-offset-8">Affective Computing</span> to redefine human learning.
                </p>
            </div>

            {/* Methodology Overview */}
            <div className="glass-panel p-12 md:p-24 rounded-[4.5rem] shadow-3xl border-4 border-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none group-hover:bg-blue-500/20 transition-colors duration-1000"></div>
                
                <div className="relative z-10 grid lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-10">
                         <h2 className="text-5xl font-black text-slate-900 flex items-center gap-6">
                            <span className="text-5xl">🧬</span> Philosophical Core
                         </h2>
                         <p className="text-2xl text-slate-600 leading-relaxed font-bold">
                            FeelEd AI™ is an emotion-adaptive framework designed for <span className="text-blue-600">Cognitive Belief Rewriting</span>—a pedagogical method where story resonance facilitates deep learning.
                         </p>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { t: "Emotion Sensing", v: "Real-time linguistic sentiment" },
                                { t: "Belief Medicine", v: "Cognitive restructuring via story" },
                                { t: "Adaptive Pacing", v: "Dynamic narrative modulation" },
                                { t: "Global Reach", v: "Low-resource language support" }
                            ].map((item, idx) => (
                                <div key={idx} className="bg-white/70 p-6 rounded-3xl border-2 border-slate-50 shadow-sm">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{item.t}</h4>
                                    <p className="font-black text-slate-800">{item.v}</p>
                                </div>
                            ))}
                         </div>
                    </div>
                    
                    <div className="bg-slate-900 text-white p-14 rounded-[4rem] shadow-2xl space-y-8 border-b-[24px] border-blue-600/30 text-center">
                        <h3 className="text-2xl font-black text-blue-400 uppercase tracking-[0.3em]">Scientific Pillar</h3>
                        <p className="text-3xl font-black italic text-indigo-100 leading-snug">
                            "Education informs the mind; FeelEd transforms the heart through narrative resonance."
                        </p>
                        <div className="inline-block px-10 py-4 rounded-3xl bg-white/10 border border-white/20 font-black text-sm uppercase tracking-[0.4em] text-blue-200">
                            Empirical Validation
                        </div>
                    </div>
                </div>
            </div>

            {/* Achievement Timeline */}
            <div className="space-y-20">
                <div className="text-center space-y-6">
                    <h2 className="text-5xl font-black text-slate-900 tracking-tight">Timeline of <span className="text-blue-600">Distinction</span></h2>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.6em] text-sm">International Academic Milestones</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {achievements.map((item) => (
                        <div 
                            key={item.id} 
                            className={`group relative p-12 rounded-[4.5rem] border-4 transition-all duration-500 hover:scale-[1.03] hover:shadow-4xl flex flex-col h-full bg-white ${item.theme.border}`}
                        >
                            {/* Achievement Badge */}
                            <div className="absolute top-12 right-12">
                                <span className={`px-6 py-3 rounded-full text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl ${item.theme.accent}`}>
                                    {item.badge}
                                </span>
                            </div>

                            <div className="space-y-8 flex-grow">
                                <div className="space-y-3">
                                    <div className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">
                                        {item.date}
                                    </div>
                                    <h3 className={`text-3xl font-black leading-tight pr-12 ${item.theme.text}`}>
                                        {item.title}
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 text-slate-800 font-black text-sm">
                                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-xl">🏢</div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-400 uppercase tracking-widest">Venue / Event</span>
                                            {item.event}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-slate-500 font-bold text-sm">
                                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-xl">📍</div>
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
                                    className={`inline-flex w-full items-center justify-center gap-4 px-10 py-6 rounded-3xl text-white font-black text-sm transition-all shadow-3xl active:scale-95 group-hover:scale-105 ${item.theme.accent}`}
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

            {/* Scientific Partnerships CTA */}
            <div className="bg-slate-900 text-white p-20 md:p-32 rounded-[5rem] text-center shadow-4xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.2)_0%,transparent_100%)]"></div>
                <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500"></div>
                
                <div className="relative z-10 space-y-12">
                    <h2 className="text-5xl md:text-8xl font-black tracking-tighter">Academic <span className="text-blue-400">Collaborations</span></h2>
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
