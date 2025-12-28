import React from 'react';
import { Page } from '../types';

interface StudentDashboardProps {
    onNavigate: (page: Page) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-6xl mx-auto pb-20 px-4 student-font animate-fade-in min-h-[60vh] flex flex-col justify-center">
            {/* Playful Hero Section */}
            <div className="text-center py-10 space-y-6">
                <div className="inline-block animate-float">
                    <span className="text-[120px] filter drop-shadow-3xl">🪄</span>
                </div>
                <h1 className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 tracking-tight leading-none py-2">
                    Welcome Back!
                </h1>
                <p className="text-3xl md:text-4xl text-slate-500 font-black">Ready for a learning adventure?</p>
            </div>

            {/* Visual Action Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-12">
                
                {/* 1. Magic Story Generator - THE MAIN BUTTON */}
                <button 
                    onClick={() => onNavigate('student-generator')}
                    className="student-card group relative bg-gradient-to-br from-indigo-500 to-violet-600 rounded-[4rem] p-12 text-left shadow-[0_40px_80px_-15px_rgba(99,102,241,0.6)] border-4 border-white/30 h-[450px] flex flex-col justify-between overflow-hidden active:scale-95 transition-transform"
                >
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000"></div>
                    <div className="relative z-10">
                        <span className="bg-white/20 backdrop-blur-md px-8 py-3 rounded-full text-white font-black text-sm uppercase tracking-[0.3em] border border-white/20">Mission #01</span>
                        <h2 className="text-6xl font-black text-white mt-10 leading-none tracking-tighter">Magic Story<br/>Generator</h2>
                    </div>
                    <div className="relative z-10 flex justify-between items-end">
                        <p className="text-indigo-100 font-bold text-2xl max-w-[200px] leading-snug">Type or speak your topic here!</p>
                        <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-5xl shadow-3xl group-hover:rotate-12 transition-transform">✨</div>
                    </div>
                </button>

                {/* 2. My Trophies */}
                <div className="student-card group bg-gradient-to-br from-amber-400 to-orange-500 rounded-[4rem] p-12 text-left shadow-[0_40px_80px_-15px_rgba(245,158,11,0.5)] h-[450px] border-4 border-white/30 flex flex-col justify-between relative overflow-hidden grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all">
                    <div className="relative z-10">
                         <span className="bg-black/10 backdrop-blur-md px-8 py-3 rounded-full text-white font-black text-sm uppercase tracking-[0.3em] border border-white/10">Achievement</span>
                        <h2 className="text-6xl font-black text-white mt-10 leading-none tracking-tighter">My Badge<br/>Collection</h2>
                    </div>
                    <div className="relative z-10">
                        <div className="flex gap-4 mb-8">
                            <span className="text-7xl animate-bounce">🏆</span>
                            <span className="text-7xl opacity-30 grayscale">🥇</span>
                            <span className="text-7xl opacity-30 grayscale">⭐</span>
                        </div>
                        <p className="text-orange-100 font-bold text-2xl">Coming Soon!</p>
                    </div>
                </div>

                {/* 3. Daily Mood Check */}
                <div className="student-card group bg-gradient-to-br from-emerald-400 to-teal-500 rounded-[4rem] p-12 text-left shadow-[0_40px_80px_-15px_rgba(16,185,129,0.5)] h-[450px] border-4 border-white/30 flex flex-col justify-between">
                     <div className="relative z-10">
                        <span className="bg-white/20 backdrop-blur-md px-8 py-3 rounded-full text-white font-black text-sm uppercase tracking-[0.3em] border border-white/20">Wellness</span>
                        <h2 className="text-6xl font-black text-white mt-10 leading-none tracking-tighter">How are you<br/>feeling?</h2>
                    </div>
                    <div className="flex justify-between items-center gap-4 relative z-10">
                        {['😄', '🤔', '😴'].map((emoji, i) => (
                            <button key={i} className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-5xl hover:scale-125 hover:bg-yellow-100 transition-all cursor-pointer shadow-2xl active:scale-90">
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Help Note */}
            <div className="mt-20 text-center">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Need help? Ask your teacher or parent! ❤️</p>
            </div>
        </div>
    );
};

export default StudentDashboard;