
import React from 'react';
import { Page } from '../types';

interface ParentsProps {
    onNavigate: (page: Page) => void;
}

const Parents: React.FC<ParentsProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-5xl mx-auto space-y-20 animate-fade-in py-12 px-6">
            {/* Header Section */}
            <div className="text-center space-y-8">
                <div className="inline-flex items-center gap-4 px-8 py-2.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-black uppercase tracking-[0.4em] border border-rose-100 shadow-sm">
                    A Partnership in Understanding
                </div>
                <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-tight">
                    👨‍👩‍👧 For <span className="shimmer-indigo">Parents</span>
                </h1>
                <p className="text-2xl text-slate-500 font-bold max-w-4xl mx-auto leading-relaxed">
                    Learning That Understands Children — Not Just Content
                </p>
            </div>

            {/* A Note to Parents */}
            <div className="bg-white border-2 border-slate-200 p-12 md:p-20 rounded-[4rem] shadow-2xl space-y-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-[120px] -mr-40 -mt-40"></div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">A Note to Parents</h2>
                <div className="space-y-8 text-xl text-slate-600 leading-relaxed font-medium">
                    <p>Every child learns differently. Some learn fast. Some learn slowly. Some carry emotions that classrooms cannot always see.</p>
                    <div className="p-10 bg-rose-600 text-white rounded-[3rem] font-bold shadow-2xl border-b-[10px] border-rose-900/40">
                        "FeelEd AI was created with one simple belief: Learning works best when a child feels understood."
                    </div>
                    <p>This page exists to explain what FeelEd AI is, what it is not, and how your child’s safety and dignity are protected.</p>
                </div>
            </div>

            {/* What is FeelEd AI / Safety Focus */}
            <div className="grid lg:grid-cols-2 gap-12">
                <div className="bg-slate-900 text-white p-12 rounded-[4rem] shadow-2xl space-y-8">
                    <h3 className="text-3xl font-black">What Is FeelEd AI?</h3>
                    <p className="text-lg leading-relaxed text-slate-300 font-medium">
                        FeelEd AI is an emotion-aware learning system that adapts stories and lessons based on how a child is engaging — gently, respectfully, and without judgment.
                    </p>
                    <div className="grid grid-cols-1 gap-4 pt-4">
                        <div className="p-5 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
                            <span className="text-2xl">✨</span> <span className="font-bold">It does not label children.</span>
                        </div>
                        <div className="p-5 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
                            <span className="text-2xl">✨</span> <span className="font-bold">It does not score emotions.</span>
                        </div>
                        <div className="p-5 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
                            <span className="text-2xl">✨</span> <span className="font-bold">It does not replace teachers.</span>
                        </div>
                    </div>
                    <p className="text-indigo-200 font-bold bg-indigo-900/40 p-6 rounded-3xl">
                        It supports learning by adjusting how a lesson is presented, not who your child is.
                    </p>
                </div>

                <div className="bg-white p-12 rounded-[4rem] border-2 border-slate-100 shadow-xl space-y-8 flex flex-col justify-center">
                    <h3 className="text-3xl font-black text-slate-900">Why Emotion Matters</h3>
                    <p className="text-lg text-slate-600 font-medium">Children don’t enter classrooms as empty minds. They bring:</p>
                    <div className="flex flex-wrap gap-3">
                        {["Anxiety", "Curiosity", "Fear of failure", "Confidence", "Fatigue", "Excitement"].map(val => (
                            <span key={val} className="px-5 py-2 bg-slate-50 text-slate-800 rounded-full text-sm font-black border border-slate-100">{val}</span>
                        ))}
                    </div>
                    <p className="text-slate-500 font-medium">Traditional learning systems often ignore these realities.</p>
                    <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 text-indigo-900 font-black">
                        FeelEd AI explores whether stories can slow down when a child feels overwhelmed or encourage gently when confidence is low.
                    </div>
                </div>
            </div>

            {/* DO NOT DO Section */}
            <div className="bg-emerald-50 border-4 border-white p-12 md:p-20 rounded-[4rem] shadow-xl space-y-10">
                <h3 className="text-3xl font-black text-emerald-900 text-center">Clarity Builds Trust</h3>
                <div className="grid md:grid-cols-2 gap-12 text-xl font-bold text-emerald-800/80">
                    <ul className="space-y-6">
                        <li>❌ Does not diagnose conditions</li>
                        <li>❌ Does not grade or rank children</li>
                        <li>❌ Does not record facial videos</li>
                    </ul>
                    <ul className="space-y-6">
                        <li>❌ Does not record biometric data</li>
                        <li>❌ Does not replace human care</li>
                        <li>❌ Does not force "performed emotions"</li>
                    </ul>
                </div>
                <p className="text-center font-black text-emerald-900 text-2xl pt-6">Your child is never reduced to data.</p>
            </div>

            {/* Child Protection Principles */}
            <div className="bg-white p-12 md:p-20 rounded-[4rem] border-2 border-slate-100 shadow-sm space-y-12">
                <h3 className="text-3xl font-black text-slate-900">How Your Child Is Protected</h3>
                <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <p className="text-lg font-black text-slate-400 uppercase tracking-widest">Foundational Principles</p>
                        <ul className="space-y-4 font-black text-slate-700">
                            <li className="flex items-center gap-4"><span className="w-2 h-2 bg-indigo-500 rounded-full"></span> No biometric or facial data collection</li>
                            <li className="flex items-center gap-4"><span className="w-2 h-2 bg-indigo-500 rounded-full"></span> No emotional labels stored on children</li>
                            <li className="flex items-center gap-4"><span className="w-2 h-2 bg-indigo-500 rounded-full"></span> No profiling or permanent records</li>
                            <li className="flex items-center gap-4"><span className="w-2 h-2 bg-indigo-500 rounded-full"></span> No selling or sharing of child data</li>
                        </ul>
                    </div>
                    <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 flex flex-col justify-center space-y-4">
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest text-center">Interaction Design</p>
                        <div className="grid grid-cols-2 gap-4">
                            {["Temporary", "Contextual", "Teacher-guided", "Child-first"].map(tag => (
                                <div key={tag} className="bg-white p-4 rounded-2xl text-center font-black text-slate-800 border border-slate-100 shadow-sm">{tag}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Teacher's Role */}
            <div className="bg-indigo-900 text-white p-12 md:p-20 rounded-[4rem] shadow-3xl space-y-10 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.05)_0%,transparent_70%)]"></div>
                <h3 className="text-3xl font-black relative z-10">The Role of Teachers (Very Important)</h3>
                <div className="grid md:grid-cols-2 gap-12 relative z-10">
                    <p className="text-xl text-indigo-100 leading-relaxed font-medium">FeelEd AI does not operate alone. Technology supports teachers — it does not replace them. Teachers remain the primary authority in the classroom.</p>
                    <ul className="space-y-3 font-bold text-indigo-200">
                        <li>• Guide learning experiences</li>
                        <li>• Observe classroom dynamics</li>
                        <li>• Decide how tools are used</li>
                    </ul>
                </div>
            </div>

            {/* Who is this for? */}
            <div className="text-center space-y-12">
                <h3 className="text-3xl font-black text-slate-900">Who Is FeelEd AI Designed For?</h3>
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { t: "Learners who struggle with attention", i: "🎯" },
                        { t: "Sensitive children", i: "🌸" },
                        { t: "Inclusive and diverse classrooms", i: "🌍" }
                    ].map((item, i) => (
                        <div key={i} className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm space-y-4 flex flex-col items-center">
                            <div className="text-4xl">{item.i}</div>
                            <p className="font-bold text-slate-700 leading-tight">{item.t}</p>
                        </div>
                    ))}
                </div>
                <p className="text-2xl font-black text-slate-400 italic">"It is not about making children 'better than others'. It is about helping each child feel capable."</p>
            </div>

            {/* Final CTA */}
            <div className="text-center space-y-12">
                <div className="space-y-6">
                    <h3 className="text-4xl font-black text-slate-900">A Final Word to Parents</h3>
                    <p className="text-xl text-slate-500 font-bold max-w-3xl mx-auto">
                        Your child does not need to be fixed. They need to be understood. 
                        FeelEd AI is an exploration — not a promise, not a shortcut, not a replacement for care.
                    </p>
                </div>
                <div className="flex flex-col md:flex-row justify-center gap-8">
                    <a 
                        href="mailto:contact@feeledai.com?subject=Parent Inquiry" 
                        className="bg-rose-600 text-white px-16 py-8 rounded-full font-black text-2xl shadow-4xl hover:bg-rose-700 transition-all border-b-[12px] border-rose-900 active:border-b-0"
                    >
                        Contact FeelEd AI
                    </a>
                    <button onClick={() => onNavigate('pilot')} className="border-4 border-slate-200 text-slate-500 px-16 py-8 rounded-full font-black text-2xl hover:bg-slate-50 transition-all">
                        Pilot Program Details
                    </button>
                </div>
                <div className="pt-16 max-w-2xl mx-auto flex flex-wrap justify-center gap-8 text-xs font-black text-slate-400 uppercase tracking-widest">
                    <button onClick={() => onNavigate('research')}>Ethics & Safeguards</button>
                    <button onClick={() => onNavigate('privacy')}>Privacy Policy</button>
                    <button onClick={() => onNavigate('contact')}>Contact Office</button>
                </div>
            </div>
        </div>
    );
};

export default Parents;
