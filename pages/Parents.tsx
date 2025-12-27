import React from 'react';
import { Page } from '../types';

interface ParentsProps {
    onNavigate: (page: Page) => void;
}

const Parents: React.FC<ParentsProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-5xl mx-auto space-y-24 animate-fade-in py-12 px-6">
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

            <div className="bg-white border-2 border-slate-200 p-12 md:p-20 rounded-[4rem] shadow-2xl space-y-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-[120px] -mr-40 -mt-40"></div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">A Note to Parents</h2>
                <div className="space-y-8 text-2xl text-slate-600 leading-relaxed font-medium">
                    <p>
                        Every child learns differently. Some learn fast. Some learn slowly. Some carry emotions that classrooms cannot always see.
                    </p>
                    <div className="p-10 bg-rose-600 text-white rounded-[3rem] font-bold shadow-3xl border-b-[12px] border-rose-900/40">
                        "FeelEd AI was created with one simple belief: Learning works best when a child feels understood."
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
                <div className="bg-slate-900 text-white p-16 rounded-[4rem] shadow-4xl space-y-10 relative overflow-hidden">
                    <h3 className="text-3xl font-black">What Is FeelEd AI?</h3>
                    <p className="text-xl text-slate-300 font-bold">
                        FeelEd AI is an emotion-aware learning system that adapts stories and lessons based on how a child is engaging — gently, respectfully, and without judgment.
                    </p>
                    <ul className="space-y-6 font-black text-indigo-200 text-lg">
                        <li className="flex items-center gap-4">✅ It does not label children.</li>
                        <li className="flex items-center gap-4">✅ It does not score emotions.</li>
                        <li className="flex items-center gap-4">✅ It does not replace teachers.</li>
                    </ul>
                </div>

                <div className="bg-white p-16 rounded-[4rem] border-2 border-slate-100 shadow-sm space-y-10 flex flex-col justify-center">
                    <h3 className="text-3xl font-black text-slate-900">Why Emotion Matters</h3>
                    <p className="text-lg font-bold text-slate-600 leading-relaxed">
                        Children don’t enter classrooms as empty minds. They bring feelings that affect how they learn. Traditional systems often ignore these realities.
                    </p>
                </div>
            </div>

            <div className="bg-emerald-50 border-4 border-white p-12 md:p-24 rounded-[4rem] shadow-2xl space-y-12">
                <h3 className="text-4xl font-black text-emerald-900 text-center">Clarity Builds Trust</h3>
                <div className="grid md:grid-cols-2 gap-12 text-xl font-bold text-emerald-800/80 text-center">
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
            </div>

            <div className="text-center space-y-12">
                <div className="flex flex-col md:flex-row justify-center gap-8">
                    <a href="mailto:contact@feeledai.com?subject=Parent Inquiry" className="bg-rose-600 text-white px-16 py-8 rounded-full font-black text-2xl shadow-4xl hover:bg-rose-700 transition-all border-b-[12px] border-rose-900 active:border-b-0">
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

export default Parents;