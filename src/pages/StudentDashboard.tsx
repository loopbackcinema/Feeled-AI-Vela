import React from 'react';
import { Page } from '../types';

interface StudentDashboardProps {
    onNavigate: (page: Page) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-6xl mx-auto pb-20 px-4 student-font animate-fade-in">
            {/* Super Fun Header */}
            <div className="text-center py-12 space-y-4">
                <div className="inline-block animate-float">
                    <span className="text-8xl filter drop-shadow-2xl">🪄</span>
                </div>
                <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 tracking-tight leading-tight">
                    Hey, Super Star!
                </h1>
                <p className="text-2xl md:text-3xl text-slate-500 font-black">What's our mission today?</p>
            </div>

            {/* Main Action Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                
                {/* 1. Magic Story Generator */}
                <button 
                    onClick={() => onNavigate('student-generator')}
                    className="student-card group relative bg-gradient-to-br from-indigo-500 to-violet-600 rounded-[3.5rem] p-10 text-left shadow-[0_30px_60px_-15px_rgba(99,102,241,0.5)] border-4 border-white/20 h-96 flex flex-col justify-between overflow-hidden"
                >
                    <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="relative z-10">
                        <span className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-full text-white font-black text-sm uppercase tracking-widest border border-white/10">Action 01</span>
                        <h2 className="text-5xl font-black text-white mt-6 leading-none">Magic Story<br/>Machine</h2>
                    </div>
                    <div className="relative z-10 flex justify-between items-end">
                        <p className="text-indigo-100 font-bold text-xl max-w-[180px]">Turn your homework into magic!</p>
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-4xl shadow-2xl group-hover:rotate-12 transition-transform">✨</div>
                    </div>
                </button>

                {/* 2. My Trophies */}
                <div className="student-card group bg-gradient-to-br from-amber-400 to-orange-500 rounded-[3.5rem] p-10 text-left shadow-[0_30px_60px_-15px_rgba(245,158,11,0.5)] h-96 border-4 border-white/20 flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                         <span className="bg-black/10 backdrop-blur-md px-6 py-2 rounded-full text-white font-black text-sm uppercase tracking-widest border border-white/10">Awards</span>
                        <h2 className="text-5xl font-black text-white mt-6 leading-none">My Trophy<br/>Case</h2>
                    </div>
                    <div className="relative z-10">
                        <div className="flex gap-4 mb-6">
                            <span className="text-6xl animate-bounce">🏆</span>
                            <span className="text-6xl opacity-30 grayscale">🥇</span>
                            <span className="text-6xl opacity-30 grayscale">⭐</span>
                        </div>
                        <p className="text-orange-100 font-bold text-xl">1 Badge Collected!</p>
                    </div>
                </div>

                {/* 3. Daily Mood */}
                <div className="student-card group bg-gradient-to-br from-emerald-400 to-teal-500 rounded-[3.5rem] p-10 text-left shadow-[0_30px_60px_-15px_rgba(16,185,129,0.5)] h-96 border-4 border-white/20 flex flex-col justify-between">
                     <div className="relative z-10">
                        <span className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-full text-white font-black text-sm uppercase tracking-widest border border-white/10">Mood Check</span>
                        <h2 className="text-5xl font-black text-white mt-6 leading-none">How's it<br/>going?</h2>
                    </div>
                    <div className="flex justify-between items-center gap-3 relative z-10">
                        {['😄', '🤔', '😴'].map((emoji, i) => (
                            <button key={i} className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-4xl hover:scale-125 hover:bg-yellow-100 transition-all cursor-pointer shadow-lg">
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 4. Quiz Arena Banner */}
                <div className="md:col-span-2 lg:col-span-3 bg-white rounded-[4rem] p-12 border-4 border-slate-100 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10 group hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-8">
                        <div className="w-28 h-28 bg-blue-100 rounded-[2.5rem] flex items-center justify-center text-6xl group-hover:rotate-6 transition-transform">🎮</div>
                        <div>
                            <h2 className="text-4xl font-black text-slate-800">Quiz Arena</h2>
                            <p className="text-slate-400 font-bold text-xl">Challenge your friends (Coming Soon)</p>
                        </div>
                    </div>
                    <button className="bg-slate-100 text-slate-400 px-12 py-6 rounded-full font-black text-2xl cursor-not-allowed">
                        Locked 🔒
                    </button>
                </div>

            </div>
        </div>
    );
};

export default StudentDashboard;