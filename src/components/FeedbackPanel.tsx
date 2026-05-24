import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface FeedbackPanelProps {
    user: { uid: string } | null;
}

const TYPES = [
    { id: 'wrong',     label: '🐞 Response felt wrong' },
    { id: 'suggest',   label: '💡 Suggest improvement' },
    { id: 'confusing', label: '😕 Confusing explanation' },
];

const pillBase: React.CSSProperties = {
    borderRadius: 20,
    padding:      '6px 10px',
    fontSize:     11,
    cursor:       'pointer',
    textAlign:    'left',
    width:        '100%',
    marginBottom: 6,
};

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ user }) => {
    const [open, setOpen]             = useState(false);
    const [type, setType]             = useState('');
    const [message, setMessage]       = useState('');
    const [sent, setSent]             = useState(false);
    const [saving, setSaving]         = useState(false);
    const [bottomOffset, setBottomOffset] = useState('80px');

    useEffect(() => {
        const updateOffset = () => {
            setBottomOffset(window.innerWidth >= 768 ? '24px' : '80px');
        };
        updateOffset();
        window.addEventListener('resize', updateOffset);
        return () => window.removeEventListener('resize', updateOffset);
    }, []);

    const panelBottom = `calc(${bottomOffset} + 60px)`;

    const handleSubmit = async () => {
        if (!type || saving) return;
        setSaving(true);
        try {
            await addDoc(collection(db, 'feedback'), {
                uid:       user?.uid ?? 'anonymous',
                type,
                message,
                url:       window.location.href,
                userAgent: navigator.userAgent,
                timestamp: serverTimestamp(),
                resolved:  false,
            });
            setSent(true);
            setTimeout(() => {
                setOpen(false);
                setSent(false);
                setType('');
                setMessage('');
            }, 2000);
        } catch {
            // silent — non-critical
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <style>{`
                @keyframes feedbackFadeSlide {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {/* Trigger button */}
            <button
                onClick={() => setOpen(o => !o)}
                aria-label="Open feedback"
                style={{
                    position:        'fixed',
                    bottom:          bottomOffset,
                    right:           '24px',
                    width:           44,
                    height:          44,
                    borderRadius:    '50%',
                    background:      'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    border:          'none',
                    color:           'white',
                    fontSize:        20,
                    zIndex:          9999,
                    boxShadow:       '0 4px 16px #4f46e560',
                    cursor:          'pointer',
                    display:         'flex',
                    alignItems:      'center',
                    justifyContent:  'center',
                    lineHeight:      1,
                }}
            >
                💬
            </button>

            {/* Panel */}
            {open && (
                <div
                    style={{
                        position:     'fixed',
                        bottom:       panelBottom,
                        right:        '24px',
                        width:        280,
                        background:   '#0d0d1c',
                        border:       '0.5px solid #1e1e35',
                        borderRadius: 16,
                        padding:      16,
                        zIndex:       9999,
                        boxShadow:    '0 8px 32px rgba(0,0,0,0.5)',
                        animation:    'feedbackFadeSlide 0.3s ease-out',
                    }}
                >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ color: '#eeeef8', fontSize: 13, fontWeight: 700 }}>Share Feedback</span>
                        <button
                            onClick={() => setOpen(false)}
                            style={{ background: 'none', border: 'none', color: '#5a5a8a', fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: 0 }}
                            aria-label="Close"
                        >×</button>
                    </div>

                    {sent ? (
                        <div style={{ color: '#a3e635', fontSize: 13, textAlign: 'center', padding: '12px 0' }}>
                            ✓ Thank you! We'll improve this.
                        </div>
                    ) : (
                        <>
                            {TYPES.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setType(t.id)}
                                    style={type === t.id ? {
                                        ...pillBase,
                                        background: '#1a1040',
                                        border:     '1px solid #4f46e5',
                                        color:      '#c4b5fd',
                                    } : {
                                        ...pillBase,
                                        background: '#060610',
                                        border:     '1px solid #1e1e35',
                                        color:      '#5a5a8a',
                                    }}
                                >
                                    {t.label}
                                </button>
                            ))}

                            {type && (
                                <textarea
                                    rows={3}
                                    placeholder="Tell us more... (optional)"
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    style={{
                                        width:        '100%',
                                        marginTop:    8,
                                        background:   '#060610',
                                        border:       '0.5px solid #2a2a4a',
                                        color:        '#eeeef8',
                                        borderRadius: 10,
                                        padding:      '8px 12px',
                                        fontSize:     12,
                                        resize:       'none',
                                        boxSizing:    'border-box',
                                        outline:      'none',
                                        fontFamily:   'inherit',
                                    }}
                                />
                            )}

                            {type && (
                                <button
                                    onClick={handleSubmit}
                                    disabled={saving}
                                    style={{
                                        marginTop:    8,
                                        width:        '100%',
                                        background:   saving ? '#3730a3' : '#4f46e5',
                                        color:        'white',
                                        borderRadius: 10,
                                        padding:      '8px 0',
                                        fontSize:     12,
                                        border:       'none',
                                        cursor:       saving ? 'not-allowed' : 'pointer',
                                        fontWeight:   600,
                                    }}
                                >
                                    {saving ? 'Sending…' : 'Send Feedback →'}
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}
        </>
    );
};

export default FeedbackPanel;
