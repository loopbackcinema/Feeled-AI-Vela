import React, { useState } from 'react';
import { signInWithGoogle } from '../firebase';

const googleIcon = (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
        <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
);

interface GuestLoginModalProps {
    onClose?: () => void;
    heading?: string;
}

const GuestLoginModal: React.FC<GuestLoginModalProps> = ({
    onClose,
    heading = 'Sign in to continue learning',
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignIn = async () => {
        setLoading(true);
        setError('');
        try {
            await signInWithGoogle();
        } catch (err: any) {
            setError(err.message || 'Sign-in failed. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 200,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '16px',
                background: 'rgba(6,6,16,0.88)',
                backdropFilter: 'blur(10px)',
            }}
            onClick={e => { if (e.target === e.currentTarget) onClose?.(); }}
        >
            <div
                style={{
                    background: '#0c0c1c',
                    border: '0.5px solid #2a2a4a',
                    borderRadius: 20,
                    padding: '32px 28px',
                    width: '100%',
                    maxWidth: 340,
                    position: 'relative',
                    boxShadow: '0 0 60px rgba(55,48,163,0.18)',
                }}
            >
                {onClose && (
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute', top: 14, right: 16,
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#3a3a5a', fontSize: 20, lineHeight: 1, padding: 0,
                        }}
                    >
                        ✕
                    </button>
                )}

                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <img
                        src="/feeled-logo.webp"
                        alt="FeelEd AI"
                        style={{ width: 56, height: 56, borderRadius: 12, marginBottom: 10, objectFit: 'contain' }}
                    />
                    <h2 style={{ color: '#eeeef8', fontSize: 18, fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
                        {heading}
                    </h2>
                </div>

                <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                        '✓ Save your progress',
                        '✓ Personalized learning path',
                        '✓ Unlimited questions',
                    ].map(b => (
                        <div key={b} style={{ color: '#5a5a8a', fontSize: 13 }}>{b}</div>
                    ))}
                </div>

                {error && (
                    <div style={{
                        marginBottom: 12,
                        background: 'rgba(220,38,38,0.12)',
                        border: '0.5px solid rgba(220,38,38,0.35)',
                        borderRadius: 10, padding: '10px 12px',
                        color: '#f87171', fontSize: 12,
                    }}>
                        {error}
                    </div>
                )}

                <button
                    onClick={handleSignIn}
                    disabled={loading}
                    style={{
                        background: '#fff', color: '#111',
                        borderRadius: 12, padding: '12px 20px',
                        width: '100%', fontSize: 14, fontWeight: 600,
                        border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                        opacity: loading ? 0.7 : 1,
                        transition: 'opacity 0.15s',
                    }}
                >
                    {loading
                        ? <span style={{ width: 16, height: 16, border: '2px solid #9ca3af', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'guestSpin 0.8s linear infinite' }} />
                        : googleIcon
                    }
                    <span>{loading ? 'Signing in…' : 'Continue with Google'}</span>
                </button>

                <p style={{ color: '#2a2a4a', fontSize: 10, textAlign: 'center', marginTop: 14 }}>
                    Free to use · No credit card required
                </p>

                <style>{`@keyframes guestSpin { to { transform: rotate(360deg); } }`}</style>
            </div>
        </div>
    );
};

export default GuestLoginModal;
