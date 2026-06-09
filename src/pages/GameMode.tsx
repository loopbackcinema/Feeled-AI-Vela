
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateRecentMode } from '../services/memoryService';
import GuestLoginModal from '../components/GuestLoginModal';

const GameMode: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [iframeError, setIframeError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [key, setKey] = useState(0);
    const [showGuestModal, setShowGuestModal] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (user) updateRecentMode({ uid: user.uid, mode: 'game' });
    }, [user]);

    useEffect(() => {
        setLoading(true);
        setIframeError(false);
        timeoutRef.current = setTimeout(() => {
            setIframeError(true);
            setLoading(false);
        }, 10000);
        return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
    }, [key]);

    const handleLoad = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setLoading(false);
        setIframeError(false);
    };

    const handleError = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setLoading(false);
        setIframeError(true);
    };

    const retry = () => {
        setKey(k => k + 1);
    };

    if (!user) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0a0a18' }}>
                {/* Branding header */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '0 16px', height: 60, flexShrink: 0,
                    background: 'rgba(10,10,24,0.95)', backdropFilter: 'blur(12px)',
                    borderBottom: '0.5px solid rgba(79,70,229,0.25)', zIndex: 10,
                }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px', borderRadius: 8, transition: 'color 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
                    >
                        ← Home
                    </button>
                    <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 16 }}>|</span>
                    <span style={{ color: '#fff', fontWeight: 900, fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase' }}>🎮 Game Mode</span>
                </div>
                {/* Teaser */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
                    <div style={{ textAlign: 'center', maxWidth: 380 }}>
                        <div style={{ fontSize: 64, marginBottom: 20 }}>🎮</div>
                        <h2 style={{ color: '#eeeef8', fontSize: 24, fontWeight: 800, margin: '0 0 12px' }}>Game Mode</h2>
                        <p style={{ color: '#4a4a6a', fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
                            Learn through interactive activities, quizzes, and challenges designed for TN Board students.
                        </p>
                        <button
                            onClick={() => setShowGuestModal(true)}
                            style={{
                                background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff',
                                border: 'none', borderRadius: 12, padding: '14px 32px',
                                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                                boxShadow: '0 4px 20px rgba(79,70,229,0.35)',
                            }}
                        >
                            Sign in to Play
                        </button>
                    </div>
                </div>
                {showGuestModal && (
                    <GuestLoginModal heading="Sign in to play" onClose={() => setShowGuestModal(false)} />
                )}
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0a0a18' }}>

            {/* Branding header */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '0 16px', height: 60, flexShrink: 0,
                background: 'rgba(10,10,24,0.95)', backdropFilter: 'blur(12px)',
                borderBottom: '0.5px solid rgba(79,70,229,0.25)', zIndex: 10,
            }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        color: '#94a3b8', fontSize: 13, fontWeight: 600,
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '6px 10px', borderRadius: 8,
                        transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
                >
                    ← Home
                </button>

                <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 16 }}>|</span>

                <span style={{ color: '#fff', fontWeight: 900, fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    🎮 Game Mode
                </span>

                <span style={{
                    marginLeft: 'auto',
                    padding: '4px 12px', borderRadius: 20,
                    background: 'rgba(79,70,229,0.15)', border: '0.5px solid rgba(99,102,241,0.4)',
                    color: '#818cf8', fontSize: 10, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap',
                }}>
                    Powered by FeelEd Learning Engine
                </span>
            </div>

            {/* Content area */}
            <div style={{ flex: 1, position: 'relative', paddingBottom: 60 }}>

                {/* Loading overlay */}
                {loading && !iframeError && (
                    <div style={{
                        position: 'absolute', inset: 0, display: 'flex',
                        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        background: '#0a0a18', zIndex: 5,
                    }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: '50%',
                            border: '3px solid rgba(79,70,229,0.2)',
                            borderTop: '3px solid #4f46e5',
                            animation: 'spin 0.8s linear infinite',
                            marginBottom: 16,
                        }} />
                        <p style={{ color: '#818cf8', fontSize: 14, fontWeight: 600 }}>Loading games...</p>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                )}

                {/* Error state */}
                {iframeError && (
                    <div style={{
                        position: 'absolute', inset: 0, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        background: '#0a0a18', zIndex: 5, padding: '0 24px',
                    }}>
                        <div style={{ textAlign: 'center', maxWidth: 360 }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>🎮</div>
                            <h2 style={{ color: '#eeeef8', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                                Game Mode is loading slowly or temporarily unavailable
                            </h2>
                            <p style={{ color: '#4a4a6a', fontSize: 14, marginBottom: 28 }}>
                                Check your connection and try again.
                            </p>
                            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                                <button
                                    onClick={retry}
                                    style={{
                                        background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff',
                                        border: 'none', borderRadius: 10, padding: '10px 24px',
                                        fontSize: 14, fontWeight: 600, cursor: 'pointer',
                                    }}
                                >
                                    Retry
                                </button>
                                <button
                                    onClick={() => navigate('/')}
                                    style={{
                                        background: 'transparent', color: '#94a3b8',
                                        border: '0.5px solid #2a2a4a', borderRadius: 10,
                                        padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                                    }}
                                >
                                    Back to Home
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Iframe */}
                <div style={{ height: 'calc(100vh - 60px - 60px)', borderRadius: 12, overflow: 'hidden' }}>
                    <iframe
                        key={key}
                        src="https://maths-recode.vercel.app"
                        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                        title="FeelEd Game Mode"
                        allow="camera; microphone; fullscreen"
                        onLoad={handleLoad}
                        onError={handleError}
                    />
                </div>
            </div>
        </div>
    );
};

export default GameMode;
