
import React from 'react';
import { Page } from '../types';

interface PilotProgramProps {
    onNavigate: (page: Page) => void;
}

const PilotProgram: React.FC<PilotProgramProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-5xl mx-auto space-y-24 animate-fade-in py-12 px-6 pb-32 transition-colors duration-300">
            
            {/* Hero Section */}
            <div className="text-center space-y-8">
                <div className="inline-flex items-center gap-4 px-8 py-2.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase tracking-[0.4em] border border-indigo-100 dark:border-indigo-800 shadow-sm transition-colors">
                    Pilot Program – Co-creating Emotion-Adaptive Learning with Real Classrooms
                </div>
                <h1 className="text-6xl md:text-9xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">
                    Pilot <span className="shimmer-indigo">Program</span>
                </h1>
                <p className="text-2xl text-slate-500 dark:text-slate-400 font-bold max-w-4xl mx-auto leading-relaxed">
                    Co-creating Emotion-Adaptive Learning with Real Classrooms
                </p>
            </div>

            {/* Purpose Statement */}
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-12 md:p-24 rounded-[4rem] shadow-2xl space-y-12 relative overflow-hidden transition-colors">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px] -mr-40 -mt-40"></div>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Mission & Purpose</h2>
                <div className="space-y-8 text-2xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    <p>
                        The FeelEd AI Pilot Program is a collaborative research initiative designed to understand how emotion-adaptive storytelling can support diverse learners in real educational environments.
                    </p>
                    <div className="p-10 bg-slate-900 dark:bg-slate-950 text-white rounded-[3rem] font-bold shadow-3xl border-b-[12px] border-indigo-600/30">
                        "This is not a finished product rollout. It is a guided pilot where teachers, students, and researchers work together to explore what emotionally responsive learning can become — ethically, responsibly, and inclusively."
                    </div>
                </div>
            </div>

            {/* Core Values Section */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Why a Pilot Program?</h2>
                    <p className="text-xl text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                        Classrooms are emotionally complex spaces. Traditional systems treat learning as static, but we explore learning as a dynamic emotional process.
                    </p>
                    <div className="space-y-6">
                        {[
                            "Test experiences in real classroom conditions",
                            "Direct feedback from teachers & students",
                            "Validate pedagogical ideas before scaling",
                            "Design responsibly, not speculatively"
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-5 text-slate-800 dark:text-slate-200 font-black">
                                <span className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs transition-colors">✓</span>
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] border border-slate-200 dark:border-slate-800 shadow-xl space-y-10 transition-colors">
                    <h3 className="text-xl font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Eligibility</h3>
                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { t: "Schools & Learning Centers", i: "🏫" },
                            { t: "Special Education Facilitators", i: "🧩" },
                            { t: "NGOs & Foundations", i: "🤝" },
                            { t: "Inclusive Education Researchers", i: "🔬" }
                        ].map((part, i) => (
                            <div key={i} className="flex items-center gap-6 p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-colors">
                                <span className="text-3xl">{part.i}</span>
                                <span className="font-black text-slate-800 dark:text-slate-200">{part.t}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* The Process Section */}
            <div className="bg-slate-900 dark:bg-slate-950 text-white p-20 md:p-32 rounded-[5rem] shadow-4xl relative overflow-hidden transition-colors">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(79,70,229,0.15)_0%,transparent_70%)]"></div>
                <div className="relative z-10 space-y-16">
                    <h2 className="text-5xl font-black tracking-tight text-center">Pilot Methodology</h2>
                    <div className="grid md:grid-cols-2 gap-10">
                        {[
                            "Guided use of FeelEd AI modules",
                            "Emotion-adaptive story-based lessons",
                            "Teacher observation & reflection",
                            "Collaborative review sessions"
                        ].map((step, i) => (
                            <div key={i} className="flex items-center gap-8 p-10 bg-white/5 rounded-[2.5rem] border border-white/10">
                                <span className="text-4xl font-black text-indigo-500 opacity-50">0{i+1}</span>
                                <span className="text-xl font-bold">{step}</span>
                            </div>
                        ))}
                    </div>
                    <div className="p-12 bg-indigo-600/20 border border-indigo-400/30 rounded-[3rem] text-center max-w-3xl mx-auto space-y-4">
                        <p className="text-lg font-black text-indigo-300">Strict Ethical Oversight</p>
                        <p className="text-white/60 font-bold">There is no grading, labeling, or emotional scoring of children.</p>
                        <p className="text-white/80 font-bold text-sm">All activities are facilitated by teachers and aligned with existing classroom practices.</p>
                    </div>
                </div>
            </div>

            {/* Data & Ethics Split */}
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-16 rounded-[4rem] border-2 border-emerald-100 dark:border-emerald-800 shadow-sm space-y-8 transition-colors">
                    <h3 className="text-2xl font-black text-emerald-900 dark:text-emerald-400">What We Collect</h3>
                    <ul className="space-y-4 font-black text-emerald-700 dark:text-emerald-300">
                        <li>• Anonymous usage patterns</li>
                        <li>• Qualitative teacher feedback</li>
                        <li>• Observational learning insights</li>
                    </ul>
                </div>
                <div className="bg-rose-50 dark:bg-rose-900/20 p-16 rounded-[4rem] border-2 border-rose-100 dark:border-rose-800 shadow-sm space-y-8 transition-colors">
                    <h3 className="text-2xl font-black text-rose-900 dark:text-rose-400">What We DO NOT Collect</h3>
                    <ul className="space-y-4 font-black text-rose-700 dark:text-rose-300">
                        <li>• Biometric data or facial recordings</li>
                        <li>• Emotional labeling of children</li>
                        <li>• Student profiling or data sharing</li>
                    </ul>
                </div>
            </div>

            {/* Final CTA */}
            <div className="text-center space-y-12">
                <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">Interested in <span className="text-indigo-600 dark:text-indigo-400">Participating?</span></h2>
                <p className="text-2xl text-slate-500 dark:text-slate-400 font-bold max-w-3xl mx-auto">
                    Application is open to institutions aligned with our ethical framework.
                </p>
                <div className="flex flex-col md:flex-row justify-center gap-8">
                    <a 
                        href="mailto:contact@feeledai.com?subject=Pilot Program Inquiry" 
                        className="bg-slate-900 dark:bg-indigo-600 text-white px-16 py-8 rounded-full font-black text-2xl shadow-4xl hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-all border-b-[12px] border-slate-950 dark:border-indigo-950 active:border-b-0"
                    >
                        Apply for Pilot Program
                    </a>
                    <button onClick={() => onNavigate('generator')} className="border-4 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 px-16 py-8 rounded-full font-black text-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                        Back to FeelEd AI
                    </button>
                </div>
                <p className="text-slate-400 dark:text-slate-500 italic font-bold max-w-2xl mx-auto pt-10">
                    "This pilot is not about proving technology. It is about listening — to classrooms, to teachers, and to learners."
                </p>
            </div>
        </div>
    );
};

export default PilotProgram;
