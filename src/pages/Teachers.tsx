import React from 'react';
import { Page } from '../types';

interface TeachersProps {
    onNavigate: (page: Page) => void;
}

const Teachers: React.FC<TeachersProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-5xl mx-auto space-y-24 animate-fade-in py-12 px-6 transition-colors duration-300">
            {/* Header Section */}
            <div className="text-center space-y-8">
                <div className="inline-flex items-center gap-4 px-8 py-2.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] border border-blue-100 dark:border-blue-800 shadow-sm">
                    Strategic Educational Partnership
                </div>
                <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">
                    👩‍🏫 For <span className="shimmer-indigo">Teachers</span>
                </h1>
                <p className="text-2xl text-slate-500 dark:text-slate-400 font-bold max-w-4xl mx-auto leading-relaxed">
                    Supporting Classrooms Where Every Child Learns Differently
                </p>
            </div>

            {/* A Note to Teachers */}
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-12 md:p-20 rounded-[4rem] shadow-2xl space-y-12 relative overflow-hidden transition-colors">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] -mr-40 -mt-40"></div>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">A Note to Teachers</h2>
                <div className="space-y-8 text-2xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    <p>
                        Teaching is not just about delivering lessons. It is about reading the room, sensing silence, noticing hesitation, and encouraging confidence where it quietly fades.
                    </p>
                    <div className="p-10 bg-slate-900 dark:bg-slate-950 text-white rounded-[3rem] font-bold shadow-3xl border-b-[12px] border-indigo-600/30">
                        "FeelEd AI begins with a simple respect: Teachers already understand emotions. Technology should support that understanding — not override it."
                    </div>
                    <p>
                        This page explains how FeelEd AI fits into real classrooms, without adding pressure or replacing human judgment.
                    </p>
                </div>
            </div>

            {/* What Is / Why Emotion matters */}
            <div className="grid lg:grid-cols-2 gap-12">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-12 rounded-[4rem] border border-slate-200 dark:border-slate-800 shadow-xl space-y-10 transition-colors">
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white">What Is FeelEd AI?</h3>
                    <p className="text-xl text-slate-500 dark:text-slate-400 font-bold leading-relaxed italic">(From a Teacher’s View)</p>
                    <p className="text-lg font-bold text-slate-600 dark:text-slate-300">
                        FeelEd AI is an emotion-aware learning system that adapts how stories and lessons are presented, based on student engagement and classroom context.
                    </p>
                    <div className="space-y-4">
                        <p className="flex items-center gap-4 text-slate-700 dark:text-slate-300 font-black"><span className="text-rose-500">❌</span> It does not tell teachers what to do.</p>
                        <p className="flex items-center gap-4 text-slate-700 dark:text-slate-300 font-black"><span className="text-rose-500">❌</span> It does not judge students.</p>
                        <p className="flex items-center gap-4 text-slate-700 dark:text-slate-300 font-black"><span className="text-rose-500">❌</span> It does not automate teaching.</p>
                    </div>
                    <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 transition-colors">
                        <p className="text-slate-500 dark:text-slate-400 font-bold">It acts as a supportive layer — helping learning materials respond more gently to student states like hesitation, fatigue, or curiosity.</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm space-y-10 transition-colors">
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white">Why Emotion Matters</h3>
                    <p className="text-lg font-bold text-slate-600 dark:text-slate-300">Every teacher knows this reality:</p>
                    <ul className="space-y-6">
                        {[
                            "The same lesson lands differently on different days",
                            "A confident child today may withdraw tomorrow",
                            "Attention loss is often emotional, not intellectual"
                        ].map((text, i) => (
                            <li key={i} className="flex items-start gap-4 text-slate-700 dark:text-slate-300 font-bold p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
                                <span className="text-indigo-600 dark:text-indigo-400">●</span> {text}
                            </li>
                        ))}
                    </ul>
                    <p className="text-slate-400 dark:text-slate-500 font-bold">Traditional tools treat learning as uniform. Classrooms are not.</p>
                </div>
            </div>

            {/* Explorations */}
            <div className="bg-indigo-600 dark:bg-indigo-800 text-white p-20 rounded-[5rem] shadow-4xl text-center space-y-16 relative overflow-hidden transition-colors">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1)_0%,transparent_70%)]"></div>
                <h2 className="text-5xl font-black tracking-tight relative z-10">FeelEd AI explores whether lessons can:</h2>
                <div className="grid md:grid-cols-2 gap-8 relative z-10">
                    {[
                        { t: "Adjust pacing when students feel overwhelmed", i: "⏳" },
                        { t: "Re-engage quietly disengaged learners", i: "🔭" },
                        { t: "Reduce pressure without lowering expectations", i: "⚖️" },
                        { t: "Support emotional safety during learning", i: "🛡️" }
                    ].map((item, i) => (
                        <div key={i} className="bg-white/10 p-10 rounded-[3rem] border border-white/20 backdrop-blur-md hover:bg-white/20 transition-all flex flex-col items-center gap-6">
                            <span className="text-5xl">{item.i}</span>
                            <span className="text-xl font-black leading-tight">{item.t}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* What it does NOT do */}
            <div className="bg-rose-50 dark:bg-rose-950/20 border-4 border-white dark:border-slate-800 p-12 md:p-24 rounded-[4rem] shadow-2xl space-y-12 transition-colors">
                <h3 className="text-4xl font-black text-rose-900 dark:text-rose-400 text-center">What FeelEd AI Does NOT Do (Important)</h3>
                <div className="grid md:grid-cols-2 gap-12 text-xl font-bold text-rose-800/80 dark:text-rose-300/80">
                    <ul className="space-y-6">
                        <li>❌ It does not replace teachers</li>
                        <li>❌ It does not grade or score emotions</li>
                        <li>❌ It does not diagnose learning conditions</li>
                    </ul>
                    <ul className="space-y-6">
                        <li>❌ It does not label children as “weak” or “strong”</li>
                        <li>❌ It does not collect biometric or facial data</li>
                    </ul>
                </div>
                <div className="p-8 bg-white/60 dark:bg-slate-900/60 rounded-[3rem] border border-rose-200 dark:border-rose-900/50 text-center transition-colors">
                    <p className="text-2xl font-black text-rose-900 dark:text-rose-400 uppercase tracking-widest italic">Teachers remain in full control of classroom decisions.</p>
                </div>
            </div>

            {/* Teacher's Role / Gains */}
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-900 p-16 rounded-[4rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-10 transition-colors">
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white">The Teacher’s Role</h3>
                    <p className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">(Central, Not Optional)</p>
                    <ul className="space-y-4 text-slate-600 dark:text-slate-300 font-bold text-lg">
                        <li className="flex items-center gap-4"><span className="w-3 h-3 bg-indigo-500 rounded-full"></span> Teachers decide when tools are used</li>
                        <li className="flex items-center gap-4"><span className="w-3 h-3 bg-indigo-500 rounded-full"></span> Teachers guide reflection and discussion</li>
                        <li className="flex items-center gap-4"><span className="w-3 h-3 bg-indigo-500 rounded-full"></span> Teachers contextualize experiences</li>
                        <li className="flex items-center gap-4"><span className="w-3 h-3 bg-indigo-500 rounded-full"></span> Teachers provide human judgment</li>
                    </ul>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-16 rounded-[4rem] border border-emerald-100 dark:border-emerald-800 shadow-sm space-y-10 transition-colors">
                    <h3 className="text-3xl font-black text-emerald-900 dark:text-emerald-400">Pilot Program Gains</h3>
                    <ul className="space-y-4 text-emerald-700 dark:text-emerald-300 font-bold text-lg">
                        <li>• Early access to adaptive learning</li>
                        <li>• A voice in shaping system evolution</li>
                        <li>• Insight into engagement patterns</li>
                        <li>• Recognition as pilot collaborators</li>
                        <li>• A space to experiment safely</li>
                    </ul>
                    <p className="text-xs font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">This is collaboration — not compliance.</p>
                </div>
            </div>

            {/* Final Section */}
            <div className="text-center space-y-12">
                <div className="space-y-6">
                    <h3 className="text-4xl font-black text-slate-900 dark:text-white">A Final Word to Teachers</h3>
                    <p className="text-2xl text-slate-500 dark:text-slate-400 font-bold max-w-3xl mx-auto">
                        You already do emotional work every day. Technology should make that work lighter — not heavier. FeelEd AI exists to listen to classrooms, not dictate to them.
                    </p>
                </div>
                <div className="flex flex-col md:flex-row justify-center gap-8">
                    <a 
                        href="mailto:admin@feeledai.com?subject=Teacher Inquiry" 
                        className="bg-slate-900 dark:bg-slate-800 text-white px-16 py-8 rounded-full font-black text-2xl shadow-4xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all border-b-[12px] border-slate-950 dark:border-slate-950 active:border-b-0"
                    >
                        Contact FeelEd AI
                    </a>
                    <button onClick={() => onNavigate('pilot')} className="border-4 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 px-16 py-8 rounded-full font-black text-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                        Learn about Pilots
                    </button>
                </div>
                <div className="pt-24 space-y-12 border-t border-slate-100 dark:border-slate-800 max-w-3xl mx-auto">
                    <p className="text-slate-400 dark:text-slate-500 font-bold italic text-xl">
                        "Teachers are the heart of the classroom. Technology is just the tool."
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Teachers;