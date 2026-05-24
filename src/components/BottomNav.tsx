import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ── Per-mode accent config ────────────────────────────────────────────────────
const MODE_ACCENT: Record<string, { gradient: string; glow: string; dot: string }> = {
    home:      { gradient: 'linear-gradient(135deg, #4f46e5, #6366f1)', glow: '#4f46e560', dot: '#818cf8' },
    story:     { gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)', glow: '#7c3aed60', dot: '#a78bfa' },
    exam:      { gradient: 'linear-gradient(135deg, #d97706, #f59e0b)', glow: '#d9770660', dot: '#fbbf24' },
    dashboard: { gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)', glow: '#0891b260', dot: '#22d3ee' },
    back:      { gradient: 'linear-gradient(135deg, #374151, #4b5563)', glow: 'transparent',  dot: '#6b7280' },
};

// ── SVG icons ─────────────────────────────────────────────────────────────────
const BackIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
);
const HomeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" />
    </svg>
);
const StoryIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <path d="M12 2L14.5 9.5H22L16 14L18.5 21.5L12 17L5.5 21.5L8 14L2 9.5H9.5L12 2Z" />
    </svg>
);
const ExamIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 7H15M9 11H15M9 15H12" strokeLinecap="round" />
    </svg>
);
const DashIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3"   y="12" width="5" height="9"  rx="1" />
        <rect x="9.5" y="7"  width="5" height="14" rx="1" />
        <rect x="16"  y="3"  width="5" height="18" rx="1" />
    </svg>
);

const NAV_ITEMS = [
    { key: 'back',      label: 'Back',      path: null,         matchPaths: [],                            isBack: true,  Icon: BackIcon  },
    { key: 'home',      label: 'Home',      path: '/',          matchPaths: ['/'],                         isHome: true,  Icon: HomeIcon  },
    { key: 'story',     label: 'Story',     path: '/generator', matchPaths: ['/generator', '/story'],      isBack: false, Icon: StoryIcon },
    { key: 'exam',      label: 'Exam',      path: '/exam-mock', matchPaths: ['/exam-mock', '/exam'],       isBack: false, Icon: ExamIcon  },
    { key: 'dashboard', label: 'Dashboard', path: '/dashboard', matchPaths: ['/dashboard'],                isBack: false, Icon: DashIcon  },
];

const BottomNav: React.FC = () => {
    const { user } = useAuth();
    const navigate  = useNavigate();
    const { pathname } = useLocation();
    const [pressed, setPressed] = useState<string | null>(null);

    if (!user) return null;

    const isActive = (item: typeof NAV_ITEMS[0]) => {
        if (item.isBack) return false;
        if (item.isHome) return pathname === '/' || pathname === '';
        return item.matchPaths.includes(pathname);
    };

    const handleClick = (item: typeof NAV_ITEMS[0]) => {
        // Press animation
        setPressed(item.key);
        setTimeout(() => setPressed(null), 150);

        if (item.isBack) {
            window.history.length > 1 ? window.history.back() : navigate('/');
        } else if (item.path) {
            navigate(item.path);
        }
    };

    return (
        <>
            <style>{`
                @media (min-width: 768px) {
                    .feeled-bottom-nav { display: none !important; }
                }
            `}</style>

            <nav
                className="feeled-bottom-nav"
                style={{
                    position:        'fixed',
                    bottom:          0,
                    left:            0,
                    right:           0,
                    height:          64,
                    background:      'rgba(8, 8, 20, 0.95)',
                    backdropFilter:  'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderTop:       '1px solid rgba(99, 102, 241, 0.2)',
                    boxShadow:       '0 -4px 24px rgba(0,0,0,0.4), 0 -1px 0 rgba(99,102,241,0.1)',
                    display:         'flex',
                    alignItems:      'center',
                    justifyContent:  'space-around',
                    paddingBottom:   'env(safe-area-inset-bottom)',
                    zIndex:          1000,
                }}
            >
                {NAV_ITEMS.map(item => {
                    const active  = isActive(item);
                    const accent  = MODE_ACCENT[item.key];
                    const isPress = pressed === item.key;

                    return (
                        <button
                            key={item.key}
                            onClick={() => handleClick(item)}
                            style={{
                                background:              'none',
                                border:                  'none',
                                cursor:                  'pointer',
                                display:                 'flex',
                                flexDirection:           'column',
                                alignItems:              'center',
                                justifyContent:          'center',
                                gap:                     0,
                                padding:                 '8px 4px',
                                minWidth:                56,
                                WebkitTapHighlightColor: 'transparent',
                                transition:              'all 0.15s ease',
                            }}
                        >
                            {/* Icon pill */}
                            <div style={{
                                width:          44,
                                height:         28,
                                borderRadius:   14,
                                background:     active ? accent.gradient : 'transparent',
                                display:        'flex',
                                alignItems:     'center',
                                justifyContent: 'center',
                                boxShadow:      active ? `0 0 16px ${accent.glow}` : 'none',
                                transition:     'all 0.2s ease',
                                color:          active ? 'white' : '#3a3a5a',
                                transform:      isPress ? 'scale(0.88)' : 'scale(1)',
                            }}>
                                <item.Icon />
                            </div>

                            {/* Label */}
                            <span style={{
                                fontSize:   10,
                                fontWeight: active ? 700 : 400,
                                color:      active ? accent.dot : '#3a3a5a',
                                marginTop:  2,
                                letterSpacing: '0.2px',
                                lineHeight: 1,
                            }}>
                                {item.label}
                            </span>

                            {/* Active dot */}
                            <div style={{
                                width:        4,
                                height:       4,
                                borderRadius: '50%',
                                background:   active ? accent.dot : 'transparent',
                                marginTop:    2,
                                transition:   'background 0.2s ease',
                            }} />
                        </button>
                    );
                })}
            </nav>
        </>
    );
};

export default BottomNav;
