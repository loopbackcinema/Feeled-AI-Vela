import React from 'react';

interface PremiumLockProps {
    feature:      string;
    description?: string;
    onUpgrade:    () => void;
}

const PremiumLock: React.FC<PremiumLockProps> = ({ feature, description, onUpgrade }) => (
    <div style={{
        background:     '#0a0a18',
        border:         '0.5px solid #1e1e35',
        borderRadius:   14,
        padding:        16,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        gap:            12,
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>🔒</span>
            <div>
                <div style={{ color: '#eeeef8', fontSize: 13, fontWeight: 600 }}>{feature}</div>
                {description && (
                    <div style={{ color: '#3a3a5a', fontSize: 11, marginTop: 2 }}>{description}</div>
                )}
            </div>
        </div>
        <button
            onClick={onUpgrade}
            style={{
                background:   'linear-gradient(135deg, #4f46e5, #7c3aed)',
                border:       'none',
                borderRadius: 10,
                padding:      '6px 14px',
                color:        'white',
                fontSize:     11,
                fontWeight:   600,
                cursor:       'pointer',
                whiteSpace:   'nowrap',
                boxShadow:    '0 2px 8px #4f46e540',
            }}
        >✨ Unlock</button>
    </div>
);

export default PremiumLock;
