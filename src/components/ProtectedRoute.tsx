import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle } from '../firebase';

const googleIcon = (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
        <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
);

const modeCards = [
    {
        emoji: '💬',
        title: 'AI Tutor',
        subtitle: 'Ask questions in Tamil or English',
        bg: '#0d0d22', border: '#3b2d8a', titleColor: '#c4b5fd', subColor: '#5a4a8a',
    },
    {
        emoji: '✨',
        title: 'Story Mode',
        subtitle: 'Turn lessons into memorable stories',
        bg: '#0d1a0d', border: '#1a5a2a', titleColor: '#6ee7b7', subColor: '#2a5a3a',
    },
    {
        emoji: '📝',
        title: 'Exam Mode',
        subtitle: 'Practice chapter-wise mock tests',
        bg: '#1a1004', border: '#5a3d08', titleColor: '#fcd34d', subColor: '#6b4a18',
    },
    {
        emoji: '🎮',
        title: 'Game Mode',
        subtitle: 'Learn through interactive activities',
        bg: '#041a1a', border: '#0a5a5a', titleColor: '#67e8f9', subColor: '#0a4a4a',
    },
];

const LoginPage: React.FC = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignIn = async () => {
        setLoading(true);
        setError('');
        try {
            await signInWithGoogle();
        } catch (err: any) {
            setError(err.message || 'Sign-in failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                @keyframes breatheGlow {
                    0%, 100% { box-shadow: 0 0 20px #3730a315, 0 0 0 0.5px #1e1e35; }
                    50%       { box-shadow: 0 0 40px #3730a330, 0 0 0 0.5px #3b2d8a40; }
                }
                @keyframes fadeSlide {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .login-card { animation: breatheGlow 4s ease-in-out infinite, fadeSlide 0.4s ease both; }
            `}</style>

            <div
                className="min-h-screen flex items-center justify-center px-4 py-10"
                style={{
                    background: '#060610',
                    backgroundImage: 'linear-gradient(#ffffff05 1px, transparent 1px), linear-gradient(90deg, #ffffff05 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }}
            >
                {/* Ambient blob */}
                <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse at center, #3730a322 0%, transparent 70%)', pointerEvents: 'none' }} />

                <div className="relative z-10 w-full max-w-4xl flex items-center gap-12">

                    {/* ── Left column (desktop only) ── */}
                    <div className="hidden md:flex flex-col flex-1 min-w-0 gap-6">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <img src="/feeled-logo.webp" alt="FeelEd AI" className="w-14 h-14 rounded-xl" />
                            <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>
                                FeelEd <span style={{ color: '#818cf8' }}>AI</span>
                            </span>
                        </div>

                        {/* Headline */}
                        <div>
                            <h1 style={{ color: '#eeeef8', fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1.3, margin: 0 }}>
                                Learn with AI.<br />Practice with confidence.
                            </h1>
                            <p style={{ color: '#4a4a6a', fontSize: 14, marginTop: 8 }}>
                                Chat, stories, exams, and games — designed for modern students.
                            </p>
                        </div>

                        {/* Mode cards 2x2 */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            {modeCards.map(card => (
                                <div key={card.title} style={{ background: card.bg, border: `0.5px solid ${card.border}`, borderRadius: 14, padding: 12 }}>
                                    <div style={{ fontSize: 18, marginBottom: 4 }}>{card.emoji}</div>
                                    <p style={{ color: card.titleColor, fontSize: 12, fontWeight: 700, margin: 0 }}>{card.title}</p>
                                    <p style={{ color: card.subColor, fontSize: 10, marginTop: 2 }}>{card.subtitle}</p>
                                </div>
                            ))}
                        </div>

                        {/* Social proof */}
                        <p style={{ color: '#2a2a4a', fontSize: 10, textAlign: 'center', marginTop: 4 }}>
                            Built for students • Mobile-first • Multilingual AI
                        </p>
                    </div>

                    {/* ── Right column (login card) ── */}
                    <div
                        className="login-card w-full md:w-80 flex-shrink-0"
                        style={{ background: '#0c0c1c', border: '0.5px solid #1e1e35', borderRadius: 20, padding: '32px 28px' }}
                    >
                        {/* Logo (mobile only) */}
                        <div className="flex md:hidden flex-col items-center gap-2 mb-6">
                            <img src="/feeled-logo.webp" alt="FeelEd AI" className="w-16 h-16 rounded-xl" />
                            <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>
                                FeelEd <span style={{ color: '#818cf8' }}>AI</span>
                            </span>
                        </div>

                        {/* Welcome */}
                        <div className="mb-6">
                            <h2 style={{ color: '#eeeef8', fontSize: 20, fontWeight: 700, margin: 0 }}>{t('login.welcome')}</h2>
                            <p style={{ color: '#4a4a6a', fontSize: 13, marginTop: 4 }}>{t('login.subtitle')}</p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mb-4 bg-red-900/30 border border-red-700 rounded-xl p-3 text-red-400 text-xs font-medium">
                                {error}
                            </div>
                        )}

                        {/* Google button */}
                        <button
                            onClick={handleSignIn}
                            disabled={loading}
                            style={{ background: '#fff', color: '#111', borderRadius: 12, padding: '12px 20px', width: '100%', fontSize: 14, fontWeight: 600, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: loading ? 0.7 : 1, transition: 'background 0.15s, transform 0.15s' }}
                            onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.background = '#f5f5f5'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; } }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fff'; (e.currentTarget as HTMLButtonElement).style.transform = 'none'; }}
                        >
                            {loading ? (
                                <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                            ) : googleIcon}
                            <span>{loading ? 'Signing in…' : t('login.button')}</span>
                        </button>

                        {/* Trust row */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 14 }}>
                            {['✓ Secure Login', '✓ Student-Friendly', '✓ Mobile Ready'].map(t => (
                                <span key={t} style={{ color: '#333360', fontSize: 10 }}>{t}</span>
                            ))}
                        </div>

                        {/* Privacy */}
                        <p style={{ color: '#2a2a4a', fontSize: 10, textAlign: 'center', marginTop: 14, lineHeight: 1.6 }}>
                            {t('login.privacy')}
                        </p>

                        {/* Ecosystem footer */}
                        <p style={{ color: '#1a1a2e', fontSize: 9, textAlign: 'center', marginTop: 16, lineHeight: 1.5 }}>
                            Supported through startup ecosystem programs including NVIDIA Inception.
                        </p>
                        <p style={{ color: '#1a1a2e', fontSize: 9, textAlign: 'center', marginTop: 6, lineHeight: 1.5 }}>
                            Powered by conversational AI, educational RAG, and multilingual learning systems.
                        </p>
                    </div>

                </div>
            </div>
        </>
    );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D]">
                <div className="text-center">
                    <img src="/feeled-logo.webp" alt="FeelEd AI" className="w-24 h-24 mx-auto mb-6 rounded-2xl opacity-90" />
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-medium animate-pulse">Loading…</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <LoginPage />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
