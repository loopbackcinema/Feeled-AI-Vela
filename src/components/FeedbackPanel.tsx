import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface FeedbackPanelProps {
    user: { uid: string } | null;
}

const TYPES = [
    { id: 'wrong',    label: '🐞 Response felt wrong' },
    { id: 'suggest',  label: '💡 Suggest improvement' },
    { id: 'confusing', label: '😕 Confusing explanation' },
];

const s = {
    triggerBtn: {
        position:     'fixed' as const,
        bottom:       80,
        right:        16,
        width:        40,
        height:       40,
        borderRadius: '50%',
        background:   '#1a1040',
        border:       '0.5px solid #4f46e5',
        color:        '#818cf8',
        fontSize:     18,
        zIndex:       999,
        boxShadow:    '0 0 12px #4f46e530',
        cursor:       'pointer',
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'center',
        lineHeight:   1,
    },
    panel: {
        position:     'fixed' as const,
        bottom:       130,
        right:        16,
        width:        280,
        background:   '#0d0d1c',
        border:       '0.5px solid #1e1e35',
        borderRadius: 16,
        padding:      16,
        zIndex:       1000,
        boxShadow:    '0 8px 32px rgba(0,0,0,0.5)',
        animation:    'feedbackFadeSlide 0.3s ease-out',
    },
    pillSelected: {
        background:   '#1a1040',
        border:       '1px solid #4f46e5',
        color:        '#c4b5fd',
        borderRadius: 20,
        padding:      '6px 10px',
        fontSize:     11,
        cursor:       'pointer',
        textAlign:    'left' as const,
        width:        '100%',
        marginBottom: 6,
    },
    pillUnselected: {
        background:   '#060610',
        border:       '1px solid #1e1e35',
        color:        '#5a5a8a',
        borderRadius: 20,
        padding:      '6px 10px',
        fontSize:     11,
        cursor:       'pointer',
        textAlign:    'left' as const,
        width:        '100%',
        marginBottom: 6,
    },
};

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ user }) => {
    const [open, setOpen]       = useState(false);
    const [type, setType]       = useState('');
    const [message, setMessage] = useState('');
    const [sent, setSent]       = useState(false);
    const [saving, setSaving]   = useState(false);

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

            <button
                style={s.triggerBtn}
                onClick={() => setOpen(o => !o)}
                aria-label="Open feedback"
            >
                💬
            </button>

            {open && (
                <div style={s.panel}>
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
                            {/* Type selector */}
                            {TYPES.map(t => (
                                <button
                                    key={t.id}
                                    style={type === t.id ? s.pillSelected : s.pillUnselected}
                                    onClick={() => setType(t.id)}
                                >
                                    {t.label}
                                </button>
                            ))}

                            {/* Textarea — shown after type chosen */}
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

                            {/* Submit */}
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
