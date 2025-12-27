
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
        location: "Bangalore, Karnataka, India",
        badge: "🏆 Distinction",
        description: "Official recognition for pioneering disruptive innovations in artificial intelligence applied to cognitive pedagogy.",
        link: "https://www.linkedin.com/feed/update/urn:li:activity:7380928148982603776/",
        status: 'COMPLETED'
    },
    {
        id: 2,
        date: "Nov 06-07, 2025",
        title: "Emotion-Adaptive AI System for Cognitive Belief Rewriting: A Framework for Belief Medicine",
        event: "3rd International Conference on Neurology & Neurological Disorders",
        location: "London, UK",
        badge: "🎤 Speaker Presentation",
        description: "Scientific presentation exploring neurological frameworks for belief recoding via emotion-aware AI.",
        link: "https://www.scitechseries.com/neurology/speaker/velayutham-s",
        status: 'COMPLETED'
    },
    {
        id: 3,
        date: "Nov 30, 2025",
        title: "FeelEd AI™: AN EMOTION-ADAPTIVE FRAMEWORK FOR STORY-BASED COGNITIVE LEARNING",
        event: "Beyond Boundaries: Multidisciplinary Inquiry",
        location: "Porbandar, Gujarat, India",
        badge: "📚 Book Chapter",
        metadata: "DOI: 10.11411/HENXI.2025544044 | ISBN: 978-81-987316-1-6",
        description: "Methodology published in association with Henxi Education and Hexagon Academy.",
        link: "https://doie.org/10.11411/HENXI.2025544044",
        status: 'COMPLETED'
    },
    {
        id: 4,
        date: "Jan 22-24, 2026",
        title: "FeelEd AI™: An Emotion-Adaptive Framework for Story-Based Cognitive Learning",
        event: "Frontiers of Sustainability (FOS 2026 – GRIE)",
        location: "Thiagarajar School of Management (TSM), Madurai",
        badge: "🎯 Research Pitch",
        description: "Selected for Track 5: Sustainability Education, Training & Capacity Building (Doctoral Colloquium).",
        link: "https://fos.tsm.ac.in/",
        status: 'UPCOMING'
    },
    {
        id: 5,
        date: "Feb 12-14, 2026",
        title: "FeelEd AI as Pedagogy: Reimagining Learning as Emotional Becoming",
        event: "Learning, Love, and Liberation (IIT Madras Annual Conference)",
        location: "IIT Madras, Chennai",
        badge: "🎓 Conference Paper",
        description: "Humanities and Social Sciences investigation into emotional becoming in intelligent environments.",
        link: "https://ge.iitm.ac.in/lll-2026",
        status: 'UPCOMING'
    },
    {
        id: 6,
        date: "Feb 16-20, 2026",
        title: "FeelEd AI: A Casebook on the Real-World Impact of AI in Education",
        event: "India-AI Impact Summit 2026 (Official Government Initiative)",
        location: "New Delhi, India",
        badge: "🚀 Casebook Launch",
        description: "Presentation of scalable AI solutions for educational impact across national demographics.",
        link: "https://impact.indiaai.gov.in/",
        status: 'UPCOMING'
    },
    {
        id: 7,
        date: "June 22, 2026",
        title: "Emotion-Adaptive AI System for Cognitive Belief Rewriting",
        event: "12th International Conference on Neurology & Neurological Disorders",
        location: "Barcelona, Spain",
        badge: "🌟 Featured Keynote",
        description: "Keynote presentation on the physiological response to adaptive narrative stimulus.",
        link: "https://neurology.magnusconferences.com/program/scientific-program/2026/emotion-adaptive-ai-system-for-cognitive-belief-rewriting-a-framework-for-belief-medicine",
        status: 'UPCOMING'
    },
    {
        id: 8,
        date: "July 2-7, 2026",
        title: "FeelEd AI: Narrative-Driven, Explainable Adaptivity in Low-Resource Contexts",
        event: "64th Annual Meeting of the Association for Computational Linguistics (ACL 2026)",
        location: "San Diego, California, USA",
        badge: "🔬 ACL Research Paper",
        description: "Peer-reviewed paper on explainable AI (XAI) for underserved linguistic environments.",
        link: "https://2026.aclweb.org/",
        status: 'UPCOMING'
    }
];

const Research: React.FC<ResearchProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-6xl mx-auto space-y-24 animate-fade-in py-12">
            <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl">
                    Verified Academic Record
                </div>
                <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter leading-tight">
                    Scientific <span className="text-indigo-600">Portfolio</span>
                </h1>
                <p className="text-2xl text-slate-500 font-medium max-w-4xl mx-auto leading-relaxed">
                    A record of theoretical validation and international recognition in <span className="text-slate-900 font-bold">Affective Computing</span> and <span className="text-slate-900 font-bold">Neuroscience</span>.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {researchData.map((item) => (
                    <div key={item.id} className="bg-white border border-slate-200 rounded-[3rem] p-12 flex flex-col justify-between hover:shadow-4xl transition-all border-l-[16px] border-l-slate-900 hover:-translate-y-2">
                        <div className="space-y-8">
                            <div className="flex justify-between items-start">
                                <span className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg ${item.status === 'UPCOMING' ? 'bg-indigo-600' : 'bg-slate-900'}`}>
                                    {item.badge}
                                </span>
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{item.date}</span>
                            </div>
                            
                            <div className="space-y-4">
                                <h3 className="text-3xl font-black text-slate-900 leading-[1.2]">{item.title}</h3>
                                <p className="text-slate-600 font-bold text-lg leading-relaxed">{item.description}</p>
                            </div>

                            <div className="space-y-3 bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-inner">
                                <p className="text-sm font-black text-slate-800 flex items-center gap-4">
                                    <span className="text-xl">📍</span> {item.location}
                                </p>
                                <p className="text-sm font-black text-slate-400 flex items-center gap-4">
                                    <span className="text-xl">🏛️</span> {item.event}
                                </p>
                            </div>

                            {item.metadata && (
                                <div className="p-6 bg-slate-900 rounded-3xl font-mono text-[10px] text-indigo-300 border border-slate-800 break-all leading-relaxed shadow-2xl">
                                    <span className="text-slate-500 uppercase block mb-1 tracking-widest font-black">Technical Identity</span>
                                    {item.metadata}
                                </div>
                            )}
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-100">
                            <a 
                                href={item.link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center gap-4 text-indigo-600 font-black text-sm group"
                            >
                                <span className="group-hover:underline decoration-2 underline-offset-8">Verify Official Record</span>
                                <svg className="w-5 h-5 transform transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {/* FEATURED: Inclusive Learning Research Section */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 border-4 border-white rounded-[4rem] p-12 md:p-20 shadow-2xl relative overflow-hidden text-center text-white">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px] -mr-40 -mt-40"></div>
                <div className="relative z-10 space-y-8">
                    <span className="text-6xl animate-pulse">♿</span>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Specialized Domain: <span className="text-indigo-400">Inclusive Learning</span></h2>
                    <p className="text-xl text-slate-300 font-bold max-w-3xl mx-auto leading-relaxed">
                        Explore our ongoing collaborative research initiative exploring how emotion-adaptive storytelling supports Blind & Deaf learners through specialized sensory channels.
                    </p>
                    <button 
                        onClick={() => onNavigate('inclusive')}
                        className="bg-white text-slate-900 px-16 py-7 rounded-full font-black text-xl shadow-4xl hover:scale-105 transition-transform border-b-[10px] border-slate-200 active:border-b-0 active:translate-y-2"
                    >
                        Explore Research Methodology
                    </button>
                </div>
            </div>

            <div className="bg-slate-900 rounded-[5rem] p-16 md:p-32 text-center text-white relative overflow-hidden shadow-4xl">
                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-600 rounded-full blur-[200px] opacity-20 -mr-[20rem] -mt-[20rem]"></div>
                <div className="relative z-10 space-y-12">
                    <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-tight">Academic <span className="text-indigo-400">Collaboration</span></h2>
                    <p className="text-2xl text-slate-400 font-bold max-w-4xl mx-auto leading-relaxed">
                        We are actively establishing partnerships with global AI laboratories and neurological institutes to expand our empirical dataset.
                    </p>
                    <div className="flex flex-col md:flex-row gap-8 justify-center pt-8">
                        <a href="mailto:founder@feeledai.com" className="bg-white text-slate-900 px-16 py-8 rounded-full font-black text-2xl shadow-4xl hover:scale-105 transition-transform border-b-[12px] border-slate-200">Submit Inquiry</a>
                        <button onClick={() => onNavigate('generator')} className="border-4 border-white/20 text-white px-16 py-8 rounded-full font-black text-2xl hover:bg-white/10 transition-colors">Return to Lab</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Research;
