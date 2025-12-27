import React from 'react';
import { Page } from '../types';

interface TeachersProps {
    onNavigate: (page: Page) => void;
}

const Teachers: React.FC<TeachersProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-5xl mx-auto space-y-24 animate-fade-in py-12 px-6">
            <div className="text-center space-y-8">
                <div className="inline-flex items-center gap-4 px-8 py-2.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-[0.4em] border border-blue-100 shadow-sm">
                    Strategic Educational Partnership
                </div>
                <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-tight">
                    👩‍🏫 For <span className="shimmer-indigo">Teachers</span>
                </h1>
                <p className="text-2xl text-slate-500 font-bold max-w-4xl mx-auto leading-relaxed">
                    Supporting Classrooms Where Every Child Learns Differently
                </p>
            </div>

            <div className="bg-white border-2 border-slate-200 p-12 md:p-20 rounded-[4rem] shadow-2xl space-y-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] -mr-40 -mt-40"></div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">A Note to Teachers</h2>
                <div className="space-y-8 text-2xl text-slate-600 leading-relaxed font-medium">
                    <p>
                        Teaching is not just about delivering lessons. It is about reading the room, sensing silence, noticing hesitation, and encouraging confidence where it quietly fades.
                    </p>
                    <div className="p-10 bg-slate-900 text-white rounded-[3rem] font-bold shadow-3xl border-b-[12px] border-indigo-600/30">
                        "FeelEd AI begins with a simple respect: Teachers already understand emotions. Technology should support that understanding — not override it."
                    </div>
                    <p>
                        This page explains how FeelEd AI fits into real classrooms, without adding pressure or replacing human judgment.
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
                <div className="bg-slate-50 p-12 rounded-[4rem] border border-slate-200 shadow-xl space-y-10">
                    <h3 className="text-3xl font-black text-slate-900">What Is FeelEd AI?</h3>
                    <p className="text-xl text-slate-500 font-bold leading-relaxed italic">(From a Teacher’s View)</p>
                    <p className="text-lg font-bold text-slate-600">
                        FeelEd AI is an emotion-aware learning system that adapts how stories and lessons are presented, based on student engagement and classroom context.
                    </p>
                    <div className="space-y-4">
                        <p className="flex items-center gap-4 text-slate-700 font-black"><span className="text-rose-500">❌</span> It does not tell teachers what to do.</p>
                        <p className="flex items-center gap-4 text-slate-700 font-black"><span className="text-rose-500">❌</span> It does not judge students.</p>
                        <p className="flex items-center gap-4 text-slate-700 font-black"><span className="text-rose-500">❌</span> It does not automate teaching.</p>
                    </div>
                </div>

                <div className="bg-white p-12 rounded-[4rem] border-2 border-slate-100 shadow-sm space-y-10">
                    <h3 className="text-3xl font-black text-slate-900">Why Emotion Matters</h3>
                    <p className="text-lg font-bold text-slate-600">Every teacher knows this reality:</p>
                    <ul className="space-y-6">
                        {[
                            "The same lesson lands differently on different days",
                            "A confident child today may withdraw tomorrow",
                            "Attention loss is often emotional, not intellectual"
                        ].map((text, i) => (
                            <li key={i} className="flex items-start gap-4 text-slate-700 font-bold p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-indigo-600">●</span> {text}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="text-center space-y-12">
                <div className="flex flex-col md:flex-row justify-center gap-8">
                    <a href="mailto:contact@feeledai.com?subject=Teacher Inquiry" className="bg-slate-900 text-white px-16 py-8 rounded-full font-black text-2xl shadow-4xl hover:bg-indigo-700 transition-all border-b-[12px] border-slate-950 active:border-b-0">
                        Contact FeelEd AI
                    </a>
                    <button onClick={() => onNavigate('pilot')} className="border-4 border-slate-200 text-slate-500 px-16 py-8 rounded-full font-black text-2xl hover:bg-slate-50 transition-all">
                        Learn about Pilots
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Teachers;