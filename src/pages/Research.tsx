
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
    type: string;
    badge: string;
    description: string;
    link: string;
    metadata?: string;
    status: 'COMPLETED' | 'UPCOMING';
}

const researchData: Achievement[] = [
    {
        id: 1,
        date: "Sept 26, 2025",
        title: "𝐃𝐢𝐬𝐫𝐮𝐩𝐭𝐢𝐯𝐞 𝐀𝐈 𝐈𝐧𝐧𝐨𝐯𝐚𝐭𝐢𝐨𝐧 𝐀𝐰𝐚𝐫𝐝",
        event: "𝐖𝐨𝐫𝐥𝐝 𝐀𝐈 𝐒𝐮𝐦𝐦𝐢𝐭 𝟐𝟎𝟐𝟓",
        location: "Bangalore, India",
        type: "AWARD",
        badge: "🏆 Distinction",
        description: "Received for pioneering disruptive AI innovations in the global educational sector.",
        link: "https://www.linkedin.com/feed/update/urn:li:activity:7380928148982603776/",
        status: 'COMPLETED'
    },
    {
        id: 2,
        date: "Nov 06-07, 2025",
        title: "Emotion-Adaptive AI System for Cognitive Belief Rewriting: A Framework for Belief Medicine",
        event: "3rd International Conference on Neurology & Neurological Disorders",
        location: "London, UK",
        type: "KEYNOTE",
        badge: "🎤 Keynote Talk",
        description: "Official presentation on the intersection of neurology and belief-recode frameworks.",
        link: "https://www.scitechseries.com/neurology/speaker/velayutham-s",
        status: 'COMPLETED'
    },
    {
        id: 3,
        date: "Nov 30, 2025",
        title: "FeelEd AI™: AN EMOTION-ADAPTIVE FRAMEWORK FOR STORY-BASED COGNITIVE LEARNING",
        event: "Beyond Boundaries: Multidisciplinary Inquiry",
        location: "Porbandar, India",
        type: "CHAPTER",
        badge: "📚 Book Chapter",
        metadata: "DOI: 10.11411/HENXI.2025544044 | ISBN: 978-81-987316-1-6",
        description: "Methodological chapter published in association with Henxi Education and Hexagon Academy.",
        link: "https://doie.org/10.11411/HENXI.2025544044",
        status: 'COMPLETED'
    },
    {
        id: 4,
        date: "Jan 22-24, 2026",
        title: "FeelEd AI™: An Emotion-Adaptive Framework for Story-Based Cognitive Learning",
        event: "Frontiers of Sustainability (FOS 2026)",
        location: "Madurai, India",
        type: "PITCH",
        badge: "🎯 Research Pitch",
        description: "Selected for Track 5: Sustainability Education & Capacity Building (Doctoral Colloquium).",
        link: "https://fos.tsm.ac.in/",
        status: 'UPCOMING'
    },
    {
        id: 5,
        date: "Feb 12-14, 2026",
        title: "FeelEd AI as Pedagogy: Reimagining Learning as Emotional Becoming",
        event: "LLL-2026 (IIT Madras Annual Conference)",
        location: "IIT Madras, India",
        type: "PAPER",
        badge: "🏛️ Academic Paper",
        description: "Scientific investigation into learning as emotional 'becoming' in the age of intelligent tech.",
        link: "https://ge.iitm.ac.in/lll-2026",
        status: 'UPCOMING'
    },
    {
        id: 6,
        date: "Feb 16-20, 2026",
        title: "FeelEd AI: A Casebook on the Real-World Impact of AI in Education",
        event: "India-AI Impact Summit 2026 (IndiaAI Gov)",
        location: "New Delhi, India",
        type: "CASEBOOK",
        badge: "🚀 Impact Launch",
        description: "Casebook presentation on scalable AI solutions for national educational transformation.",
        link: "https://impact.indiaai.gov.in/",
        status: 'UPCOMING'
    },
    {
        id: 7,
        date: "June 22, 2026",
        title: "Emotion-Adaptive AI System for Cognitive Belief Rewriting",
        event: "12th International Conference on Neurology & Neurological Disorders",
        location: "Barcelona, Spain",
        type: "KEYNOTE",
        badge: "🌟 Featured Speaker",
        description: "Continued keynote series on neurological frameworks for belief medicine.",
        link: "https://neurology.magnusconferences.com/program/scientific-program/2026/emotion-adaptive-ai-system-for-cognitive-belief-rewriting-a-framework-for-belief-medicine",
        status: 'UPCOMING'
    },
    {
        id: 8,
        date: "July 2-7, 2026",
        title: "FeelEd AI: Narrative-Driven, Explainable Adaptivity in Low-Resource Contexts",
        event: "64th Annual Meeting of the ACL (ACL 2026)",
        location: "San Diego, USA",
        type: "PAPER",
        badge: "🔬 ACL Paper",
        description: "High-tier scientific paper on explainable AI (XAI) for underserved linguistic contexts.",
        link: "https://2026.aclweb.org/",
        status: 'UPCOMING'
    }
];

const Research: React.FC<ResearchProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-5xl mx-auto space-y-16 animate-fade-in py-12">
            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tight">Scientific <span className="text-blue-600">Portfolio</span></h1>
                <p className="text-lg text-slate-500 font-medium max-w-3xl mx-auto">
                    A rigorous academic record demonstrating the theoretical and empirical foundations of the FeelEd AI system.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {researchData.map((item) => (
                    <div key={item.id} className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col justify-between hover:shadow-xl transition-all border-l-[12px] border-l-slate-800">
                        <div className="space-y-6">
                            <div className="flex justify-between items-start">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white ${item.status === 'UPCOMING' ? 'bg-blue-600' : 'bg-slate-900'}`}>
                                    {item.badge}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{item.date}</span>
                            </div>
                            
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 leading-tight mb-3">{item.title}</h3>
                                <p className="text-slate-500 font-medium text-sm leading-relaxed">{item.description}</p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-bold text-slate-800 flex items-center gap-2">
                                    <span className="opacity-40">📍</span> {item.location}
                                </p>
                                <p className="text-[11px] font-bold text-slate-400 flex items-center gap-2">
                                    <span className="opacity-40">🏢</span> {item.event}
                                </p>
                            </div>

                            {item.metadata && (
                                <div className="p-4 bg-slate-50 rounded-xl font-mono text-[9px] text-slate-400 border border-slate-100 break-all">
                                    {item.metadata}
                                </div>
                            )}
                        </div>

                        <div className="mt-8">
                            <a 
                                href={item.link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm hover:translate-x-1 transition-transform"
                            >
                                Verify Publication 
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[120px] opacity-20"></div>
                <h2 className="text-3xl md:text-5xl font-black mb-6">Academic Collaboration</h2>
                <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
                    We are currently accepting research inquiries from neuroscientists and AI laboratories focusing on affective computing.
                </p>
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <a href="mailto:founder@feeledai.com" className="bg-white text-slate-900 px-10 py-4 rounded-full font-black hover:scale-105 transition-transform">Submit Research Inquiry</a>
                    <button onClick={() => onNavigate('generator')} className="border-2 border-white/20 text-white px-10 py-4 rounded-full font-black hover:bg-white/10 transition-colors">Return to Dashboard</button>
                </div>
            </div>
        </div>
    );
};

export default Research;
