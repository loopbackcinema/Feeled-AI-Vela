import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle } from '../firebase';

const LoginPage: React.FC = () => {
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
        <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-sm flex flex-col items-center gap-8">
                {/* Logo */}
                <div className="flex flex-col items-center gap-4">
                    <img src="/logo.svg" alt="FeelEd AI" className="w-20 h-20 rounded-2xl" />
                    <div className="text-center">
                        <h1 className="text-3xl font-black text-white tracking-tight">FeelEd AI</h1>
                        <p className="text-slate-400 text-sm mt-1 font-medium">
                            Emotion-adaptive learning for Tamil Nadu students
                        </p>
                    </div>
                </div>

                {/* Card */}
                <div className="w-full bg-slate-900 rounded-[2rem] border border-slate-800 p-8 shadow-2xl space-y-6">
                    <div className="text-center space-y-1">
                        <h2 className="text-xl font-black text-white">Welcome back</h2>
                        <p className="text-slate-400 text-sm">Sign in to continue learning</p>
                    </div>

                    {error && (
                        <div className="bg-red-900/30 border border-red-700 rounded-xl p-3 text-red-400 text-xs font-medium">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleSignIn}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black py-4 px-6 rounded-2xl transition-all active:scale-95 shadow-lg shadow-indigo-900/50"
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 48 48">
                                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                                <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                            </svg>
                        )}
                        <span>{loading ? 'Signing in…' : 'Sign in with Google'}</span>
                    </button>

                    <p className="text-center text-xs text-slate-500 leading-relaxed">
                        By signing in you agree to our{' '}
                        <a href="/privacy" className="text-indigo-400 hover:underline">Privacy Policy</a>
                    </p>
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-3 w-full">
                    {[
                        { icon: '💬', label: 'AI Tutor' },
                        { icon: '📖', label: 'Story Mode' },
                        { icon: '📝', label: 'Exam Prep' },
                    ].map(f => (
                        <div key={f.label} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
                            <div className="text-xl mb-1">{f.icon}</div>
                            <p className="text-xs font-bold text-slate-400">{f.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D]">
                <div className="text-center">
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
