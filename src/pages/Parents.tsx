import React from 'react';
import { Page } from '../types';

interface ParentsProps {
    onNavigate: (page: Page) => void;
}

const Parents: React.FC<ParentsProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-5xl mx-auto space-y-24 animate-fade-in py-12 px-6 transition-colors duration-300">
            {/* Header Section */}
            <div className="text-center space-y-8">
                <div className="inline-flex items-center gap-4 px-8 py-2.5 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 text-[10px] font-black uppercase tracking-[0.4em] border border-rose-100 dark:border-rose-800 shadow-sm">
                    A Partnership in Understanding
                </div>
                <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">
                    👨‍👩‍👧 For <span className="shimmer-indigo">Parents</span>
                </h1>
                <p className="text-2xl text-slate-500 dark:text-slate-400 font-bold max-w-4xl mx-auto leading-relaxed">
                    Learning That Understands Children — Not Just Content
                </p>
            </div>

            {/* A Note to Parents */}
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-12 md:p-20 rounded-[4rem] shadow-2xl space-y-12 relative overflow-hidden transition-colors">
                <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-[120px] -mr-40 -mt-40"></div>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">A Note to Parents</h2>
                <div className="space-y-8 text-2xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    <p>
                        Every child learns differently. Some learn fast. Some learn slowly. Some carry emotions that classrooms cannot always see.
                    </p>
                    <div className="p-10 bg-rose-600 dark:bg-rose-700 text-white rounded-[3rem] font-bold shadow-3xl border-b-[12px] border-rose-900/40">
                        "FeelEd AI was created with one simple belief: Learning works best when a child feels understood."
                    </div>
                    <p>
                        This page exists to explain what FeelEd AI is, what it is not, and how your child’s safety and dignity are protected.
                    </p>
                </div>
            </div>

            {/* What is FeelEd AI / Why emotion matters */}
            <div className="grid lg:grid-cols-2 gap-12">
                <div className="bg-slate-900 dark:bg-slate-950 text-white p-16 rounded-[4rem] shadow-4xl space-y-10 relative overflow-hidden transition-colors">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                    <h3 className="text-3xl font-black relative z-10">What Is FeelEd AI?</h3>
                    <p className="text-xl text-slate-300 font-bold relative z-10 leading-relaxed">
                        FeelEd AI is an emotion-aware learning system that adapts stories and lessons based on how a child is engaging — gently, respectfully, and without judgment.
                    </p>
                    <ul className="space-y-6 relative z-10 font-black text-indigo-200 dark:text-indigo-300">
                        <li className="flex items-center gap-4"><span className="text-2xl">✨</span> It does not label children.</li>
                        <li className="flex items-center gap-4"><span className="text-2xl">✨</span> It does not score emotions.</li>
                        <li className="flex items-center gap-4"><span className="text-2xl">✨</span> It does not replace teachers.</li>
                    </ul>
                    <div className="p-8 bg-white/10 rounded-3xl border border-white/20 relative z-10">
                        <p className="text-slate-400 dark:text-slate-500 font-bold italic">"It supports learning by adjusting how a lesson is presented, not who your child is."</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-16 rounded-[4rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm space-y-10 flex flex-col justify-center transition-colors">
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white">Why Emotion Matters</h3>
                    <p className="text-lg font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
                        Children don’t enter classrooms as empty minds. They bring:
                    </p>
                    <div className="flex flex-wrap gap-4">
                        {["Anxiety", "Curiosity", "Fear of failure", "Confidence", "Fatigue", "Excitement"].map(tag => (
                            <span key={tag} className="px-6 py-2 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 font-black text-sm rounded-full border border-slate-100 dark:border-slate-700 transition-colors">{tag}</span>
                        ))}
                    </div>
                    <p className="text-slate-400 dark:text-slate-500 font-bold leading-relaxed pt-6">Traditional systems often ignore these realities. FeelEd AI explores whether learning can slow down when a child feels overwhelmed or encourage gently when confidence is low.</p>
                </div>
            </div>

            {/* DO NOT DO section */}
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border-4 border-white dark:border-slate-800 p-12 md:p-24 rounded-[4rem] shadow-2xl space-y-12 transition-colors">
                <h3 className="text-4xl font-black text-emerald-900 dark:text-emerald-400 text-center">Clarity Builds Trust</h3>
                <div className="grid md:grid-cols-2 gap-12 text-xl font-bold text-emerald-800/80 dark:text-emerald-300/80 text-center">
                    <ul className="space-y-6">
                        <li>❌ No mental health diagnosis</li>
                        <li>❌ No emotional grading or ranking</li>
                        <li>❌ No facial recording or videos</li>
                    </ul>
                    <ul className="space-y-6">
                        <li>❌ No biometric data tracking</li>
                        <li>❌ No replacement for human care</li>
                        <li>❌ No forced emotional performance</li>
                    </ul>
                </div>
                <div className="p-8 bg-white dark:bg-slate-900 rounded-[3rem] border border-emerald-100 dark:border-emerald-800 text-center transition-colors">
                    <p className="text-2xl font-black text-emerald-900 dark:text-emerald-400 uppercase tracking-widest italic">Your child is never reduced to data.</p>
                </div>
            </div>

            {/* Protection Principles */}
            <div className="bg-white dark:bg-slate-900 p-12 md:p-20 rounded-[4rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-12 transition-colors">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white">How Your Child Is Protected</h3>
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <p className="text-lg font-bold text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-widest text-[10px]">Strict Principles</p>
                        <ul className="space-y-4 font-black text-slate-700 dark:text-slate-300">
                            <li className="flex items-center gap-4"><span className="w-2 h-2 bg-rose-500 rounded-full"></span> No biometric/facial data collection</li>
                            <li className="flex items-center gap-4"><span className="w-2 h-2 bg-rose-500 rounded-full"></span> No emotional labels stored on children</li>
                            <li className="flex items-center gap-4"><span className="w-2 h-2 bg-rose-500 rounded-full"></span> No profiling or permanent records</li>
                            <li className="flex items-center gap-4"><span className="w-2 h-2 bg-rose-500 rounded-full"></span> No selling or sharing of child data</li>
                        </ul>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-12 rounded-[4rem] border border-slate-100 dark:border-slate-800 space-y-4 text-center transition-colors">
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Interactions are:</p>
                        <div className="grid grid-cols-2 gap-4">
                            {["Temporary", "Contextual", "Teacher-guided", "Child-first"].map(val => (
                                <div key={val} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm font-black text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800 transition-colors">{val}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Who is it for? */}
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-16 rounded-[4rem] border-2 border-indigo-100 dark:border-indigo-800 shadow-sm space-y-10 transition-colors">
                    <h3 className="text-3xl font-black text-indigo-900 dark:text-indigo-400">Who Is This Designed For?</h3>
                    <div className="grid grid-cols-1 gap-4 font-black text-indigo-700 dark:text-indigo-300">
                        {["Slow learners", "Sensitive children", "Confidence builders", "Attention-focused learners", "Inclusive classrooms"].map(item => (
                            <div key={item} className="flex items-center gap-4"><span className="text-xl">✅</span> {item}</div>
                        ))}
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-16 rounded-[4rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-10 flex flex-col justify-center text-center transition-colors">
                    <p className="text-2xl font-black text-slate-500 dark:text-slate-400 italic leading-relaxed">
                        "It is not about making children 'better than others'. It is about helping each child feel capable."
                    </p>
                </div>
            </div>

            {/* Final CTA */}
            <div className="text-center space-y-12">
                <div className="space-y-6">
                    <h3 className="text-4xl font-black text-slate-900 dark:text-white">A Final Word to Parents</h3>
                    <p className="text-2xl text-slate-500 dark:text-slate-400 font-bold max-w-3xl mx-auto">
                        Your child does not need to be fixed. They need to be understood. FeelEd AI is an exploration — not a promise, not a shortcut, not a replacement for care.
                    </p>
                </div>
                <div className="flex flex-col md:flex-row justify-center gap-8">
                    <a 
                        href="mailto:admin@feeledai.com?subject=Parent Inquiry" 
                        className="bg-rose-600 text-white px-16 py-8 rounded-full font-black text-2xl shadow-4xl hover:bg-rose-700 dark:hover:bg-rose-500 transition-all border-b-[12px] border-rose-900 dark:border-rose-950 active:border-b-0"
                    >
                        Contact FeelEd AI
                    </a>
                    <button onClick={() => onNavigate('pilot')} className="border-4 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 px-16 py-8 rounded-full font-black text-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                        Learn about Pilots
                    </button>
                </div>
                <div className="pt-24 space-y-12 border-t border-slate-100 dark:border-slate-800 max-w-3xl mx-auto">
                    <p className="text-slate-400 dark:text-slate-500 font-bold italic text-xl">
                        "If this approach resonates with your values, we welcome your questions and dialogue."
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Parents;