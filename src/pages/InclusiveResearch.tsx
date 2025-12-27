import React from 'react';
import { Page } from '../types';

interface InclusiveResearchProps {
    onNavigate: (page: Page) => void;
}

const InclusiveResearch: React.FC<InclusiveResearchProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-5xl mx-auto space-y-24 animate-fade-in py-12 px-6 pb-32">
            
            {/* Header Section */}
            <div className="text-center space-y-8">
                <div className="inline-flex items-center gap-4 px-8 py-2.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.4em] border border-slate-700 shadow-2xl">
                    Academic Specialized Domain: Neuro-Accessibility
                </div>
                <h1 className="text-6xl md:text-9xl font-black text-slate-900 tracking-tighter leading-tight">
                    ♿ <span className="shimmer-indigo">Inclusive</span> Learning
                </h1>
                <p className="text-2xl text-slate-500 font-bold max-w-4xl mx-auto leading-relaxed">
                    How Emotion-Adaptive Storytelling Supports Blind & Deaf Learners
                </p>
            </div>

            {/* Scientific Position */}
            <div className="bg-white border-2 border-slate-200 p-12 md:p-24 rounded-[4rem] shadow-2xl space-y-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] -mr-40 -mt-40"></div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                    <span className="text-blue-500">📍</span> Research Position Statement
                </h2>
                <div className="space-y-8 text-2xl text-slate-600 leading-relaxed font-medium">
                    <p>
                        FeelEd AI’s work with blind and deaf children is an ongoing collaborative research initiative. We explore how narrative can bridge sensory gaps without requiring "standard" visual or auditory input.
                    </p>
                    <div className="p-10 bg-slate-900 text-white rounded-[3rem] font-bold shadow-3xl border-b-[12px] border-indigo-600/30">
                        "We do not seek to 'fix' sensory differences. We seek to design learning environments that respect diverse sensory realities as valid ways of knowing the world."
                    </div>
                </div>
            </div>

            {/* The "Why" - Comparison Grid */}
            <div className="grid lg:grid-cols-2 gap-12">
                <div className="space-y-8 p-12 bg-slate-50 rounded-[4rem] border border-slate-200">
                    <h3 className="text-3xl font-black text-slate-900">The Problem</h3>
                    <p className="text-lg text-slate-500 font-bold leading-relaxed">
                        Standard EdTech assumes a "Sensory Baseline": Vision for reading and Hearing for instructions. This creates an invisible wall for millions of learners.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 text-rose-600 font-black"><span>❌</span> Visual-only progress bars</div>
                        <div className="flex items-center gap-4 text-rose-600 font-black"><span>❌</span> Audio-only emotional cues</div>
                        <div className="flex items-center gap-4 text-rose-600 font-black"><span>❌</span> Static, non-descriptive content</div>
                    </div>
                </div>
                <div className="space-y-8 p-12 bg-indigo-600 rounded-[4rem] text-white shadow-2xl">
                    <h3 className="text-3xl font-black">The FeelEd Hypothesis</h3>
                    <p className="text-lg text-indigo-100 font-bold leading-relaxed">
                        Can emotional intelligence translate across modalities? Can a story "feel" the same through rhythm and vibration as it does through a visual scene?
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 text-indigo-200 font-black"><span>✅</span> Audio-Descriptive Narratives</div>
                        <div className="flex items-center gap-4 text-indigo-200 font-black"><span>✅</span> Haptic Emotional Pacing</div>
                        <div className="flex items-center gap-4 text-indigo-200 font-black"><span>✅</span> Text-Sign Translation Models</div>
                    </div>
                </div>
            </div>

            {/* Research Focus Detail */}
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white p-16 rounded-[4rem] border-2 border-slate-100 shadow-sm space-y-10 hover:border-indigo-200 transition-colors">
                    <div className="flex items-center gap-6">
                        <span className="text-5xl">🦯</span>
                        <h3 className="text-3xl font-black text-slate-900 leading-tight">Blind & Low-Vision Research</h3>
                    </div>
                    <p className="text-slate-500 font-bold italic">Focusing on "Spatial Sound & Descriptive Emotion"</p>
                    <ul className="space-y-6">
                        {[
                            "Audio-first storytelling structures",
                            "Emotional tone conveyed through voice rhythm and pacing",
                            "High-fidelity descriptive narrative (environmental cues)",
                            "Sound variation used as emotional metadata"
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-4 text-slate-700 font-bold">
                                <span className="text-indigo-500 mt-1">●</span> {item}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-white p-16 rounded-[4rem] border-2 border-slate-100 shadow-sm space-y-10 hover:border-indigo-200 transition-colors">
                    <div className="flex items-center gap-6">
                        <span className="text-5xl">🤟</span>
                        <h3 className="text-3xl font-black text-slate-900 leading-tight">Deaf & Hard-of-Hearing Research</h3>
                    </div>
                    <p className="text-slate-500 font-bold italic">Focusing on "Visual Rhythm & Kinetic Typography"</p>
                    <ul className="space-y-6">
                        {[
                            "Visual rhythm-based narrative pacing",
                            "Sign-language friendly text structures",
                            "Emotion expressed through scene timing and motion cues",
                            "Kinetic text that mirrors emotional intensity"
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-4 text-slate-700 font-bold">
                                <span className="text-indigo-500 mt-1">●</span> {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Ethics Protocol */}
            <div className="bg-emerald-50 p-16 md:p-24 rounded-[4rem] border-2 border-emerald-100 shadow-sm space-y-12">
                <h2 className="text-4xl font-black text-emerald-900">Safety & Ethical Constraints</h2>
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-6 text-xl font-bold text-emerald-700">
                        <p className="flex items-center gap-4"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> No biometric profiling of disabled learners</p>
                        <p className="flex items-center gap-4"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> No automated medical or clinical claims</p>
                        <p className="flex items-center gap-4"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Research conducted only with guardian consent</p>
                        <p className="flex items-center gap-4"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> All AI outputs are teacher-moderated</p>
                    </div>
                    <div className="p-10 bg-white rounded-[3rem] border border-emerald-200 shadow-sm flex items-center justify-center">
                        <p className="text-emerald-900 leading-relaxed font-black text-center text-2xl italic">
                            "Innovation should never come at the cost of child privacy or dignity."
                        </p>
                    </div>
                </div>
            </div>

            {/* Collaboration CTA */}
            <div className="text-center space-y-12">
                <h2 className="text-5xl font-black text-slate-900 tracking-tight">Support This <span className="text-indigo-600">Frontier</span></h2>
                <p className="text-2xl text-slate-500 font-bold max-w-3xl mx-auto">
                    We invite Special Education Teachers, Neuroscientists, and Accessibility experts to co-create these adaptive models.
                </p>
                <div className="flex flex-col md:flex-row justify-center gap-8">
                    <a 
                        href="mailto:contact@feeledai.com?subject=Inclusive Learning Collaboration" 
                        className="bg-indigo-600 text-white px-16 py-8 rounded-full font-black text-2xl shadow-4xl hover:bg-indigo-700 transition-all border-b-[12px] border-indigo-900 active:border-b-0"
                    >
                        Collaborate with the Lab
                    </a>
                    <button onClick={() => onNavigate('research')} className="border-4 border-slate-200 text-slate-500 px-16 py-8 rounded-full font-black text-2xl hover:bg-slate-50 transition-all">
                        Back to Portfolio
                    </button>
                </div>
                <div className="pt-24 border-t border-slate-100 max-w-xl mx-auto">
                    <p className="text-slate-400 font-bold italic">
                        "Inclusive learning is about changing assumptions, not just adding features."
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InclusiveResearch;