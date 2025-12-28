import React from 'react';
import { Page } from '../types';

interface StudentDashboardProps {
    onNavigate: (page: Page) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-6xl mx-auto pb-20 px-4 animate-fade-in">
            
            {/* Fun Header */}
            <div className="text-center py-10 space-y-4">
                <div className="inline-block animate-bounce-slow">
                    <span className="text-6xl filter drop-shadow-lg">🚀</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 tracking-tight">
                    Hello, Super Learner!
                </h1>
                <p className="text-2xl text-slate-500 font-bold">Ready for today's adventure?</p>
            </div>

            {/* Main Action Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                
                {/* 1. Magic Story Generator (The Main Tool) */}
                <button 
                    onClick={() => onNavigate('generator')}
                    className="group relative bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[3rem] p-8 text-left shadow-[0_20px_50px_-12px_rgba(99,102,241,0.5)] hover:scale-105 transition-all duration-300 h-80 flex flex-col justify-between overflow-hidden border-4 border-white/20"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="relative z-10">
                        <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white font-black text-sm uppercase tracking-widest border border-white/10">Start Here</span>
                        <h2 className="text-4xl font-black text-white mt-4 leading-tight">Magic Story Machine</h2>
                    </div>
                    <div className="relative z-10 flex justify-between items-end">
                        <p className="text-indigo-100 font-bold text-lg">Turn boring lessons into magic stories!</p>
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-lg group-hover:rotate-12 transition-transform">✨</div>
                    </div>
                </button>

                {/* 2. My Badges (Gamification Placeholder) */}
                <div className="group bg-gradient-to-br from-amber-400 to-orange-500 rounded-[3rem] p-8 text-left shadow-[0_20px_50px_-12px_rgba(245,158,11,0.5)] hover:scale-105 transition-all duration-300 h-80 flex flex-col justify-between border-4 border-white/20 relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-white/10 skew-y-6"></div>
                    <div className="relative z-10">
                         <span className="bg-black/10 backdrop-blur-md px-4 py-2 rounded-full text-white font-black text-sm uppercase tracking-widest border border-white/10">Profile</span>
                        <h2 className="text-4xl font-black text-white mt-4">My Trophy Case</h2>
                    </div>
                    <div className="relative z-10">
                        <div className="flex gap-2 mb-4">
                            <span className="text-4xl filter drop-shadow-md animate-bounce [animation-delay:0.1s]">🏆</span>
                            <span className="text-4xl filter drop-shadow-md animate-bounce [animation-delay:0.2s] opacity-50 grayscale">🥇</span>
                            <span className="text-4xl filter drop-shadow-md animate-bounce [animation-delay:0.3s] opacity-50 grayscale">⭐</span>
                        </div>
                        <p className="text-orange-100 font-bold">1 Badge Earned!</p>
                    </div>
                </div>

                {/* 3. Daily Mood (Emotional Check-in) */}
                <div className="group bg-gradient-to-br from-emerald-400 to-teal-500 rounded-[3rem] p-8 text-left shadow-[0_20px_50px_-12px_rgba(16,185,129,0.5)] hover:scale-105 transition-all duration-300 h-80 flex flex-col justify-between border-4 border-white/20">
                     <div className="relative z-10">
                        <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white font-black text-sm uppercase tracking-widest border border-white/10">Check-in</span>
                        <h2 className="text-4xl font-black text-white mt-4">How are you feeling?</h2>
                    </div>
                    <div className="flex justify-between items-center gap-2 relative z-10">
                        {['😄', '🤔', '😴', '😤'].map((emoji, i) => (
                            <button key={i} className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl hover:bg-white hover:scale-110 transition-all cursor-pointer border border-white/10 shadow-sm">
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 4. Quiz Arena (Coming Soon) */}
                <div className="md:col-span-2 lg:col-span-3 bg-white rounded-[3rem] p-8 border-4 border-slate-100 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 hover:border-blue-200 transition-colors group">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-blue-100 rounded-[2rem] flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-500">🎮</div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-800">Quiz Arena</h2>
                            <p className="text-slate-500 font-bold text-lg">Challenge your friends (Coming Soon)</p>
                        </div>
                    </div>
                    <button className="bg-slate-100 text-slate-400 px-10 py-5 rounded-full font-black text-xl cursor-not-allowed">
                        Locked 🔒
                    </button>
                </div>

            </div>
        </div>
    );
};

export default StudentDashboard;