
import React from 'react';
import { Page } from '../types';

interface TeachersProps {
    onNavigate: (page: Page) => void;
}

const Teachers: React.FC<TeachersProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-5xl mx-auto space-y-20 animate-fade-in py-12 px-6">
            {/* Header Section */}
            <div className="text-center space-y-8">
                <div className="inline-flex items-center gap-4 px-8 py-2.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-[0.4em] border border-blue-100 shadow-sm">
                    Empowering Classroom Empathy
                </div>
                <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-tight">
                    👩‍🏫 For <span className="shimmer-indigo">Teachers</span>
                </h1>
                <p className="text-2xl text-slate-500 font-bold max-w-4xl mx-auto leading-relaxed">
                    Supporting Classrooms Where Every Child Learns Differently
                </p>
            </div>

            {/* A Note to Teachers */}
            <div className="bg-white border-2 border-slate-200 p-12 md:p-20 rounded-[4rem] shadow-2xl space-y-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] -mr-40 -mt-40"></div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">A Note to Teachers</h2>
                <div className="space-y-6 text-xl text-slate-600 leading-relaxed font-medium">
                    <p>Teaching is not just about delivering lessons. It is about reading the room, sensing silence, noticing hesitation, and encouraging confidence where it quietly fades.</p>
                    <div className="p-8 bg-indigo-600 text-white rounded-[2.5rem] font-bold shadow-xl border-b-[10px] border-indigo-900/40">
                        "FeelEd AI begins with a simple respect: Teachers already understand emotions. Technology should support that understanding — not override it."
                    </div>
                    <p>This page explains how FeelEd AI fits into real classrooms, without adding pressure or replacing human judgment.</p>
                </div>
            </div>

            {/* What is FeelEd AI / Why it Matters */}
            <div className="grid lg:grid-cols-2 gap-12">
                <div className="bg-slate-900 text-white p-12 rounded-[4rem] shadow-2xl space-y-8">
                    <h3 className="text-3xl font-black">What Is FeelEd AI?</h3>
                    <p className="text-lg text-slate-400 font-medium leading-relaxed italic">(From a Teacher’s View)</p>
                    <p className="text-lg leading-relaxed text-indigo-100">
                        FeelEd AI is an emotion-aware learning system that adapts how stories and lessons are presented, based on student engagement and classroom context.
                    </p>
                    <div className="space-y-4 pt-4">
                        <p className="flex items-center gap-3">❌ It does not tell teachers what to do.</p>
                        <p className="flex items-center gap-3">❌ It does not judge students.</p>
                        <p className="flex items-center gap-3">❌ It does not automate teaching.</p>
                    </div>
                    <p className="bg-white/10 p-6 rounded-3xl border border-white/10 text-slate-200">
                        It acts as a supportive layer — helping learning materials respond more gently to student states like hesitation, fatigue, or curiosity.
                    </p>
                </div>

                <div className="bg-white p-12 rounded-[4rem] border-2 border-slate-100 shadow-xl space-y-8">
                    <h3 className="text-3xl font-black text-slate-900">Why Emotion Matters</h3>
                    <p className="text-lg text-slate-600 font-medium">Every teacher knows this reality:</p>
                    <ul className="space-y-4">
                        {[
                            "The same lesson lands differently on different days",
                            "A confident child today may withdraw tomorrow",
                            "Attention loss is often emotional, not intellectual"
                        ].map((text, i) => (
                            <li key={i} className="flex items-center gap-4 text-slate-800 font-bold p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> {text}
                            </li>
                        ))}
                    </ul>
                    <p className="text-slate-500 font-medium">Traditional tools treat learning as uniform. Classrooms are not.</p>
                </div>
            </div>

            {/* Adjustment Possibilities */}
            <div className="text-center space-y-12">
                <h3 className="text-4xl font-black text-slate-900">What FeelEd AI Explores</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { t: "Adjust pacing when students feel overwhelmed", i: "⏳" },
                        { t: "Re-engage quietly disengaged learners", i: "🔭" },
                        { t: "Reduce pressure without lowering expectations", i: "⚖️" },
                        { t: "Support emotional safety during learning", i: "🛡️" }
                    ].map((item, i) => (
                        <div key={i} className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-4xl mb-4">{item.i}</div>
                            <p className="font-bold text-slate-700 leading-tight">{item.t}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* DO NOT DO Section */}
            <div className="bg-rose-50 border-4 border-white p-12 md:p-20 rounded-[4rem] shadow-xl space-y-10">
                <h3 className="text-3xl font-black text-rose-900">What FeelEd AI Does NOT Do (Important)</h3>
                <div className="grid md:grid-cols-2 gap-8 text-xl font-bold text-rose-800/80">
                    <ul className="space-y-4">
                        <li>❌ It does not replace teachers</li>
                        <li>❌ It does not grade or score emotions</li>
                        <li>❌ It does not diagnose learning or mental health conditions</li>
                    </ul>
                    <ul className="space-y-4">
                        <li>❌ It does not label children as “weak” or “strong”</li>
                        <li>❌ It does not collect biometric or facial data</li>
                    </ul>
                </div>
                <p className="text-center font-black text-rose-900 bg-white/50 p-6 rounded-3xl">Teachers remain in full control of classroom decisions.</p>
            </div>

            {/* Teacher's Role */}
            <div className="grid lg:grid-cols-2 gap-8 items-stretch">
                <div className="bg-indigo-50 p-12 rounded-[4rem] border-2 border-indigo-100 space-y-8 flex flex-col justify-center">
                    <h3 className="text-3xl font-black text-indigo-900">The Teacher’s Role</h3>
                    <p className="text-lg text-indigo-700 font-bold">(Central, Not Optional)</p>
                    <ul className="space-y-4 text-indigo-900/80 font-bold">
                        <li className="flex items-center gap-4">💎 Teachers decide when and how tools are used</li>
                        <li className="flex items-center gap-4">💎 Teachers guide reflection and discussion</li>
                        <li className="flex items-center gap-4">💎 Teachers contextualize learning experiences</li>
                        <li className="flex items-center gap-4">💎 Teachers provide human judgment and care</li>
                    </ul>
                </div>
                <div className="bg-white p-12 rounded-[4rem] border-2 border-slate-100 shadow-sm space-y-8">
                    <h3 className="text-3xl font-black text-slate-900">Pilot Program Benefits</h3>
                    <ul className="space-y-4 text-slate-600 font-bold">
                        <li>• Early access to emotion-adaptive experiences</li>
                        <li>• A voice in shaping how the system evolves</li>
                        <li>• Insight into engagement patterns (non-diagnostic)</li>
                        <li>• A space to experiment safely, without pressure</li>
                    </ul>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest pt-4">This is collaboration — not compliance.</p>
                </div>
            </div>

            {/* Classroom Use Contexts */}
            <div className="bg-slate-50 p-12 md:p-20 rounded-[4rem] border border-slate-200 text-center space-y-12">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Who This Is Designed For</h3>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                        <h4 className="font-black text-indigo-600">Ideal Settings</h4>
                        <div className="flex flex-wrap justify-center gap-3">
                            {["Mixed-ability classrooms", "Inclusive education", "Sensitive learners", "Slow learners"].map(tag => (
                                <span key={tag} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-black">{tag}</span>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center justify-center">
                        <p className="text-2xl font-black text-slate-500 italic">"It is not about accelerating the fastest learners. It is about not losing the quiet ones."</p>
                    </div>
                </div>
            </div>

            {/* Ethics & Boundaries */}
            <div className="bg-emerald-50 p-12 rounded-[4rem] border-2 border-emerald-100 space-y-10">
                <h3 className="text-3xl font-black text-emerald-900">Ethics & Professional Boundaries</h3>
                <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-4 text-emerald-800 font-bold">
                        <p>• No emotional labeling of students</p>
                        <p>• No permanent student profiles</p>
                        <p>• No performance ranking</p>
                        <p>• No automated decisions about children</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-emerald-100 shadow-sm flex items-center justify-center">
                        <p className="text-emerald-900 font-black text-center italic">"Ethical design is non-negotiable."</p>
                    </div>
                </div>
            </div>

            {/* Final CTA */}
            <div className="text-center space-y-12">
                <div className="space-y-6">
                    <h3 className="text-4xl font-black text-slate-900">A Final Word to Teachers</h3>
                    <p className="text-xl text-slate-500 font-bold max-w-3xl mx-auto">
                        You already do emotional work every day. Technology should make that work lighter — not heavier. 
                        FeelEd AI exists to listen to classrooms, not dictate to them.
                    </p>
                </div>
                <div className="flex flex-col md:flex-row justify-center gap-8">
                    <a 
                        href="mailto:contact@feeledai.com?subject=Teacher Inquiry" 
                        className="bg-indigo-600 text-white px-16 py-8 rounded-full font-black text-2xl shadow-4xl hover:bg-indigo-700 transition-all border-b-[12px] border-indigo-900 active:border-b-0"
                    >
                        Contact FeelEd AI
                    </a>
                    <button onClick={() => onNavigate('pilot')} className="border-4 border-slate-200 text-slate-500 px-16 py-8 rounded-full font-black text-2xl hover:bg-slate-50 transition-all">
                        Pilot Program Details
                    </button>
                </div>
                <div className="pt-16 max-w-2xl mx-auto flex justify-center gap-8 text-xs font-black text-slate-400 uppercase tracking-widest">
                    <button onClick={() => onNavigate('research')}>Ethics & Principles</button>
                    <button onClick={() => onNavigate('contact')}>Support Office</button>
                </div>
            </div>
        </div>
    );
};

export default Teachers;
