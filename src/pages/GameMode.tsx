import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GameMode: React.FC = () => {
    const navigate = useNavigate();
    const [failed, setFailed] = useState(false);
    const [key, setKey] = useState(0);

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

            {failed ? (
                <div className="flex-1 flex items-center justify-center px-6">
                    <div style={{ textAlign: 'center', maxWidth: 360 }}>
                        <div style={{ fontSize: 40, marginBottom: 16 }}>🎮</div>
                        <h2 style={{ color: '#eeeef8', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                            FeelEd Learning Engine temporarily unavailable.
                        </h2>
                        <p style={{ color: '#4a4a6a', fontSize: 14, marginBottom: 24 }}>
                            Try again shortly.
                        </p>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                            <button
                                onClick={() => { setFailed(false); setKey(k => k + 1); }}
                                style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                            >
                                Retry
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                style={{ background: 'transparent', color: '#4a4a6a', border: '0.5px solid #2a2a4a', borderRadius: 10, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                            >
                                Go Home
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <iframe
                    key={key}
                    src="https://maths-recode.vercel.app"
                    className="flex-1 w-full border-0"
                    style={{ minHeight: 'calc(100vh - 52px)' }}
                    title="MathsRecode Game Mode"
                    allow="camera; microphone; fullscreen"
                    onError={() => setFailed(true)}
                />
            )}
        </div>
    );
};

export default GameMode;
