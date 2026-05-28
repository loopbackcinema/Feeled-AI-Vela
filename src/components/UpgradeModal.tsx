import React from 'react';

interface UpgradeModalProps {
    isOpen:   boolean;
    onClose:  () => void;
    reason?:  string;
}

const REASON_TEXT: Record<string, string> = {
    stories: "You've explored today's 3 free stories.",
    exams:   "You've completed today's 2 free mock tests.",
    feature: "This feature is available in FeelEd Plus.",
};

const FEATURES = [
    'Unlimited stories every day',
    'Unlimited mock tests',
    'Advanced mentor insights',
    'Smart revision planner',
    'Deep weakness analysis',
    'NEET/JEE strategic guidance',
    'Full learning analytics',
];

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, reason = 'feature' }) => {
    if (!isOpen) return null;

    return (
        <div
            onClick={onClose}
            style={{
                position:       'fixed',
                inset:          0,
                background:     'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(6px)',
                zIndex:         10000,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                padding:        16,
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background:   '#0d0d1c',
                    border:       '0.5px solid #1e1e35',
                    borderRadius: 20,
                    padding:      28,
                    maxWidth:     400,
                    width:        '100%',
                    position:     'relative',
                    boxShadow:    '0 24px 64px rgba(0,0,0,0.6)',
                }}
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#3a3a5a', fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: 0 }}
                >×</button>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>✨</div>
                    <h2 style={{ color: '#eeeef8', fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>Upgrade to FeelEd Plus</h2>
                    <p style={{ color: '#818cf8', fontSize: 12, margin: '0 0 4px' }}>
                        {REASON_TEXT[reason] ?? REASON_TEXT.feature}
                    </p>
                    <p style={{ color: '#5a5a8a', fontSize: 13, margin: 0 }}>
                        Unlock unlimited learning with FeelEd Plus
                    </p>
                </div>

                {/* Features */}
                <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {FEATURES.map(f => (
                        <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ color: '#6ee7b7', fontSize: 13 }}>✅</span>
                            <span style={{ color: '#6ee7b7', fontSize: 12 }}>{f}</span>
                        </div>
                    ))}
                </div>

                {/* Price */}
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <div style={{ color: '#eeeef8', fontSize: 28, fontWeight: 700 }}>₹299<span style={{ fontSize: 14, fontWeight: 400, color: '#5a5a8a' }}>/month</span></div>
                    <div style={{ color: '#5a5a8a', fontSize: 12, marginTop: 4 }}>or ₹2,499/year (save 30%)</div>
                </div>

                {/* CTA */}
                <button
                    onClick={() => {
                        alert('Payment integration coming soon!\nContact admin@feeledai.com for early access.');
                        onClose();
                    }}
                    style={{
                        width:        '100%',
                        height:       48,
                        background:   'linear-gradient(135deg, #4f46e5, #7c3aed)',
                        border:       'none',
                        borderRadius: 14,
                        color:        'white',
                        fontSize:     15,
                        fontWeight:   700,
                        cursor:       'pointer',
                        boxShadow:    '0 4px 20px #4f46e540',
                        marginBottom: 12,
                    }}
                >✨ Upgrade to FeelEd Plus</button>

                <button
                    onClick={onClose}
                    style={{ width: '100%', background: 'none', border: 'none', color: '#3a3a5a', fontSize: 12, cursor: 'pointer', padding: '4px 0' }}
                >Continue with FeelEd Free →</button>
            </div>
        </div>
    );
};

export default UpgradeModal;
