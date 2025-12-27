
import React from 'react';
import { Page } from '../types';

interface InclusiveResearchProps {
    onNavigate: (page: Page) => void;
}

const InclusiveResearch: React.FC<InclusiveResearchProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-5xl mx-auto space-y-20 animate-fade-in py-12 px-6">
            
            {/* Header Section */}
            <div className="text-center space-y-8">
                <div className="inline-flex items-center gap-4 px-8 py-2.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-[0.4em] border border-slate-200 shadow-sm">
                    Strategic Research Initiative
                </div>
                <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-tight">
                    ♿ Inclusive <span className="text-indigo-600">Learning</span> Research
                </h1>
                <p className="text-2xl text-slate-500 font-bold max-w-4xl mx-auto leading-relaxed">
                    Supporting Blind & Deaf Learners Through Emotion-Adaptive Storytelling
                </p>
            </div>

            {/* Our Position Section */}
            <div className="bg-white border-2 border-slate-200 p-12 md:p-20 rounded-[4rem] shadow-2xl space-y-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px] -mr-40 -mt-40"></div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                    Our Position (Read This First)
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

            {/* Why This Research Matters */}
            <div className="grid lg:grid-cols-2 gap-16 items-start">
                <div className="space-y-8">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Why This Research Matters</h2>
                    <p className="text-xl text-slate-500 font-bold leading-relaxed">
                        Traditional digital learning systems assume:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {['Vision', 'Hearing', 'Uniform sensory access'].map(item => (
                            <div key={item} className="bg-slate-100 p-4 rounded-2xl text-center font-black text-slate-800 text-sm uppercase tracking-widest">{item}</div>
                        ))}
                    </div>
                    <p className="text-xl text-slate-500 font-bold leading-relaxed">
                        Blind and deaf learners experience stories, concepts, and emotions through different channels. Ignoring this reality leads to exclusion — even in well-intended EdTech.
                    </p>
                    <div className="p-10 bg-indigo-600 text-white rounded-[3rem] shadow-xl text-center">
                        <p className="text-2xl font-black italic">"Can learning stories adapt not only to emotion, but also to sensory context?"</p>
                    </div>
                </div>
                <div className="bg-white p-12 rounded-[4rem] border-2 border-slate-100 shadow-xl space-y-10">
                    <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Our Research Focus Areas</h3>
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <h4 className="text-2xl font-black text-slate-900 flex items-center gap-3"><span>🦯</span> For Blind & Low-Vision Learners</h4>
                            <ul className="space-y-3 text-slate-600 font-bold leading-relaxed">
                                <li>• Audio-first storytelling structures</li>
                                <li>• Emotional tone conveyed through voice, rhythm, and pacing</li>
                                <li>• Descriptive narrative design (not visual dependence)</li>
                                <li>• Emotion conveyed through sound variation, pauses, and narration flow</li>
                            </ul>
                        </div>
                        <div className="space-y-4 pt-6 border-t border-slate-100">
                            <h4 className="text-2xl font-black text-slate-900 flex items-center gap-3"><span>🤟</span> For Deaf & Hard-of-Hearing Learners</h4>
                            <ul className="space-y-3 text-slate-600 font-bold leading-relaxed">
                                <li>• Visual rhythm-based storytelling</li>
                                <li>• Text + sign-language friendly narrative pacing</li>
                                <li>• Emotion expressed through scene timing, visual emphasis, and motion cues</li>
                                <li>• Reduced reliance on audio-centric emotional signals</li>
                            </ul>
                        </div>
                    </div>
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
                    <p className="text-center text-slate-400 font-bold italic text-lg">These explorations are iterative, supervised, and research-guided.</p>
                    <div className="p-12 bg-rose-600/20 border border-rose-400/30 rounded-[3rem] space-y-6">
                        <p className="text-xl font-black text-rose-300 uppercase tracking-widest text-center">What This Is NOT</p>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm font-bold text-white/90 text-center">
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
                    <div className="space-y-6">
                        <p>All inclusive learning research follows strict principles:</p>
                        <ul className="space-y-4 text-emerald-700">
                            <li>• No biometric data collection</li>
                            <li>• No facial analysis or emotional labeling</li>
                            <li>• No profiling of children</li>
                            <li>• No automated judgments</li>
                        </ul>
                    </div>
                    <div className="space-y-6">
                        <p>Participation occurs only with educators, guardians, and institutional oversight.</p>
                        <div className="p-10 bg-white rounded-[3rem] border border-emerald-200">
                            <p className="text-emerald-900 font-black leading-relaxed">"Children are never treated as data sources — they are participants in a learning journey."</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Collaborators & Status */}
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white p-16 rounded-[4rem] space-y-8 border-2 border-slate-100">
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-widest">Who We Collaborate With</h3>
                    <ul className="space-y-4 text-slate-600 font-bold text-lg">
                        <li>• Special education teachers</li>
                        <li>• Schools for blind & deaf children</li>
                        <li>• Inclusive education researchers</li>
                        <li>• NGOs & foundations</li>
                        <li>• Accessibility & learning design experts</li>
                    </ul>
                </div>
                <div className="bg-white p-16 rounded-[4rem] space-y-8 border-2 border-slate-100">
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-widest">Current Status</h3>
                    <div className="space-y-6 font-black text-slate-600">
                        <div className="flex items-center gap-6 p-6 rounded-3xl bg-amber-50 border border-amber-100">
                            <span className="text-3xl">🟡</span> <span>Research & exploration phase</span>
                        </div>
                        <div className="flex items-center gap-6 p-6 rounded-3xl bg-amber-50 border border-amber-100">
                            <span className="text-3xl">🟡</span> <span>Small-scale supervised pilots</span>
                        </div>
                        <div className="flex items-center gap-6 p-6 rounded-3xl bg-amber-50 border border-amber-100">
                            <span className="text-3xl">🟡</span> <span>Continuous ethical review</span>
                        </div>
                    </div>
                    <p className="text-slate-400 font-bold text-sm text-center">This page will evolve as learning and collaboration deepen.</p>
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
                        Back to Portfolio
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
