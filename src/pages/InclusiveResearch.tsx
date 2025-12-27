import React from 'react';
import { Page } from '../types';

interface InclusiveResearchProps {
    onNavigate: (page: Page) => void;
}

const InclusiveResearch: React.FC<InclusiveResearchProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-5xl mx-auto space-y-24 animate-fade-in py-12 px-6">
            
            {/* Header Section */}
            <div className="text-center space-y-8">
                <div className="inline-flex items-center gap-4 px-8 py-2.5 rounded-full bg-slate-50 text-slate-700 text-[10px] font-black uppercase tracking-[0.4em] border border-slate-200 shadow-sm">
                    Specialized Research Domain
                </div>
                <h1 className="text-6xl md:text-9xl font-black text-slate-900 tracking-tighter leading-tight">
                    ♿ <span className="shimmer-indigo">Inclusive</span> Learning
                </h1>
                <p className="text-2xl text-slate-500 font-bold max-w-4xl mx-auto leading-relaxed">
                    Supporting Blind & Deaf Learners Through Emotion-Adaptive Storytelling
                </p>
            </div>

            {/* Our Position Section */}
            <div className="bg-white border-2 border-slate-200 p-12 md:p-24 rounded-[4rem] shadow-2xl space-y-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] -mr-40 -mt-40"></div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                    <span className="text-blue-500">📍</span> Our Position (Read This First)
                </h2>
                <div className="space-y-8 text-2xl text-slate-600 leading-relaxed font-medium">
                    <p>
                        FeelEd AI’s work with blind and deaf children is not a completed solution. It is an ongoing collaborative research initiative exploring how emotion-adaptive storytelling can support inclusive learning experiences — responsibly, ethically, and with humility.
                    </p>
                    <div className="p-10 bg-slate-900 text-white rounded-[3rem] font-bold shadow-3xl border-b-[12px] border-indigo-600/30">
                        "We do not claim to “fix” disability. We seek to design learning environments that respect different sensory realities."
                    </div>
                </div>
            </div>

            {/* Why This Matters */}
            <div className="grid lg:grid-cols-2 gap-16 items-start">
                <div className="space-y-8">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Why This Research Matters</h2>
                    <p className="text-xl text-slate-500 font-bold leading-relaxed">
                        Traditional digital learning systems assume vision, hearing, and uniform sensory access. Blind and deaf learners experience stories, concepts, and emotions through different channels. Ignoring this reality leads to exclusion — even in well-intended EdTech.
                    </p>
                    <div className="bg-indigo-600 text-white p-10 rounded-[3rem] shadow-xl">
                        <p className="text-2xl font-black italic">"Can learning stories adapt not only to emotion, but also to sensory context?"</p>
                    </div>
                </div>
                <div className="bg-slate-50 p-12 rounded-[4rem] border border-slate-200 shadow-xl space-y-10">
                    <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Sensory Realities we study:</h3>
                    <div className="grid grid-cols-1 gap-6">
                        {[
                            { t: "Vision-independent learning", i: "👁️" },
                            { t: "Hearing-independent cues", i: "👂" },
                            { t: "Uniform sensory access (Baseline)", i: "🧩" }
                        ].map((part, i) => (
                            <div key={i} className="flex items-center gap-6 p-6 rounded-3xl bg-white border border-slate-100">
                                <span className="text-3xl">{part.i}</span>
                                <span className="font-black text-slate-800">{part.t}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Research Focus Areas */}
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white p-16 rounded-[4rem] border-2 border-slate-100 shadow-sm space-y-10 hover:border-indigo-200 transition-colors">
                    <div className="flex items-center gap-6">
                        <span className="text-5xl">🦯</span>
                        <h3 className="text-3xl font-black text-slate-900">For Blind & Low-Vision Learners</h3>
                    </div>
                    <ul className="space-y-6">
                        {[
                            "Audio-first storytelling structures",
                            "Emotional tone conveyed through voice, rhythm, and pacing",
                            "Descriptive narrative design (not visual dependence)",
                            "Emotion conveyed through sound variation, pauses, and narration flow"
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-4 text-slate-700 font-bold">
                                <span className="text-indigo-500">●</span> {item}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-white p-16 rounded-[4rem] border-2 border-slate-100 shadow-sm space-y-10 hover:border-indigo-200 transition-colors">
                    <div className="flex items-center gap-6">
                        <span className="text-5xl">🤟</span>
                        <h3 className="text-3xl font-black text-slate-900">For Deaf & Hard-of-Hearing Learners</h3>
                    </div>
                    <ul className="space-y-6">
                        {[
                            "Visual rhythm-based storytelling",
                            "Text + sign-language friendly narrative pacing",
                            "Emotion expressed through scene timing, visual emphasis, and motion cues",
                            "Reduced reliance on audio-centric emotional signals"
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-4 text-slate-700 font-bold">
                                <span className="text-indigo-500">●</span> {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* What We Are Exploring Section */}
            <div className="bg-slate-900 text-white p-20 md:p-32 rounded-[5rem] shadow-4xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(79,70,229,0.15)_0%,transparent_70%)]"></div>
                <div className="relative z-10 space-y-16">
                    <h2 className="text-5xl font-black tracking-tight text-center">What We Are Exploring (Not Claiming)</h2>
                    <div className="grid md:grid-cols-2 gap-10">
                        {[
                            "How emotion can be communicated without sight or sound",
                            "How adaptive stories can respect sensory differences",
                            "How teachers and facilitators guide emotional pacing",
                            "How inclusive design can coexist with mainstream classrooms"
                        ].map((step, i) => (
                            <div key={i} className="flex items-center gap-8 p-10 bg-white/5 rounded-[2.5rem] border border-white/10">
                                <span className="text-xl font-bold">{step}</span>
                            </div>
                        ))}
                    </div>
                    <div className="p-12 bg-rose-600/20 border border-rose-400/30 rounded-[3rem] space-y-6">
                        <p className="text-xl font-black text-rose-300">What This Is NOT</p>
                        <div className="grid md:grid-cols-2 gap-6 text-sm font-bold text-white/80">
                            <p>❌ Not a medical or therapeutic intervention</p>
                            <p>❌ Not a diagnostic or rehabilitation system</p>
                            <p>❌ Not a replacement for special educators</p>
                            <p>❌ Not a finished assistive product</p>
                        </div>
                        <p className="text-center text-rose-100 font-bold text-lg pt-4">It is research-driven learning exploration, not clinical technology.</p>
                    </div>
                </div>
            </div>

            {/* Ethics & Safeguards */}
            <div className="bg-emerald-50 p-16 md:p-24 rounded-[4rem] border-2 border-emerald-100 shadow-sm space-y-12">
                <h2 className="text-4xl font-black text-emerald-900">Ethics & Safeguards</h2>
                <div className="grid md:grid-cols-2 gap-12 text-xl font-bold text-emerald-800/80">
                    <div className="space-y-4 text-emerald-700 font-bold">
                        <p>• No biometric data collection</p>
                        <p>• No facial analysis or emotional labeling</p>
                        <p>• No profiling of children</p>
                        <p>• No automated judgments</p>
                        <p>• Participation occurs only with educators, guardians, and institutional oversight.</p>
                    </div>
                    <div className="p-10 bg-white rounded-[3rem] border border-emerald-200 shadow-sm flex items-center justify-center">
                        <p className="text-emerald-900 leading-relaxed font-black text-center">"Children are never treated as data sources — they are participants in a learning journey."</p>
                    </div>
                </div>
            </div>

            {/* Collaboration Section */}
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-slate-50 p-16 rounded-[4rem] space-y-8 border border-slate-200">
                    <h3 className="text-2xl font-black text-slate-900">Who We Collaborate With</h3>
                    <div className="flex flex-wrap gap-3">
                        {[
                            "Special education teachers",
                            "Schools for blind & deaf children",
                            "Inclusive education researchers",
                            "NGOs & foundations",
                            "Accessibility & learning design experts"
                        ].map((tag, i) => (
                            <span key={i} className="px-5 py-2 bg-white rounded-full text-sm font-bold border border-slate-200 text-slate-600">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="bg-slate-50 p-16 rounded-[4rem] space-y-8 border border-slate-200">
                    <h3 className="text-2xl font-black text-slate-900">Current Status</h3>
                    <div className="space-y-4 font-bold text-slate-600">
                        <div className="flex items-center gap-4"><span className="w-3 h-3 bg-amber-500 rounded-full"></span> Research & exploration phase</div>
                        <div className="flex items-center gap-4"><span className="w-3 h-3 bg-amber-500 rounded-full"></span> Small-scale supervised pilots (where applicable)</div>
                        <div className="flex items-center gap-4"><span className="w-3 h-3 bg-amber-500 rounded-full"></span> Continuous ethical review</div>
                    </div>
                </div>
            </div>

            {/* Final CTA */}
            <div className="text-center space-y-12">
                <h2 className="text-5xl font-black text-slate-900 tracking-tight">Interested in <span className="text-indigo-600">Contributing?</span></h2>
                <p className="text-2xl text-slate-500 font-bold max-w-3xl mx-auto">
                    If you are an educator, researcher, or organization working in inclusive education and believe in thoughtful, ethical experimentation, we welcome dialogue.
                </p>
                <div className="flex flex-col md:flex-row justify-center gap-8">
                    <a 
                        href="mailto:contact@feeledai.com?subject=Inclusive Learning Research Collaboration" 
                        className="bg-indigo-600 text-white px-16 py-8 rounded-full font-black text-2xl shadow-4xl hover:bg-indigo-700 transition-all border-b-[12px] border-indigo-900 active:border-b-0"
                    >
                        Collaborate on Inclusive Learning Research
                    </a>
                    <button onClick={() => onNavigate('research')} className="border-4 border-slate-200 text-slate-500 px-16 py-8 rounded-full font-black text-2xl hover:bg-slate-50 transition-all">
                        Back to Scientific Portfolio
                    </button>
                </div>
                <div className="pt-24 space-y-8 border-t border-slate-100 max-w-3xl mx-auto">
                    <h3 className="text-3xl font-black text-slate-900">Closing Note</h3>
                    <p className="text-2xl text-slate-400 font-bold italic leading-relaxed">
                        "Inclusive learning is not about adding features. It is about changing assumptions."
                    </p>
                    <p className="text-slate-500 font-bold leading-relaxed">
                        FeelEd AI approaches this work with respect — for children, for educators, and for the complexity of human learning.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InclusiveResearch;