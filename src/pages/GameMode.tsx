import React from 'react';
import { useNavigate } from 'react-router-dom';

const GameMode: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-[#050505] flex flex-col">
            <div className="flex items-center gap-3 px-4 py-3 bg-black/80 backdrop-blur-md border-b border-white/10 z-10">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm font-medium transition-colors"
                >
                    ← Back to FeelEd AI
                </button>
                <span className="text-white/20">|</span>
                <span className="text-white font-black text-sm tracking-widest uppercase">🎮 Game Mode</span>
                <span className="ml-auto px-3 py-1 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                    Powered by FeelEd Learning Engine
                </span>
            </div>
            <iframe
                src="https://maths-recode.vercel.app"
                className="flex-1 w-full border-0"
                style={{ minHeight: 'calc(100vh - 52px)' }}
                title="MathsRecode Game Mode"
                allow="camera; microphone; fullscreen"
            />
        </div>
    );
};

export default GameMode;