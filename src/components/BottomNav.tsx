import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
    { icon: '←',  label: 'Back',      path: null,        isBack: true  },
    { icon: '🏠', label: 'Home',       path: '/',         isHome: true  },
    { icon: '✨', label: 'Story',      path: '/generator', matchPaths: ['/generator', '/story'] },
    { icon: '📝', label: 'Exam',       path: '/exam-mock', matchPaths: ['/exam-mock', '/exam'] },
    { icon: '📊', label: 'Dashboard',  path: '/dashboard', matchPaths: ['/dashboard'] },
];

// Pages where BottomNav should NOT appear
const HIDDEN_PATHS: string[] = [];

const BottomNav: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    // Hide when not logged in
    if (!user) return null;
    if (HIDDEN_PATHS.includes(pathname)) return null;

    const isActive = (item: typeof NAV_ITEMS[0]) => {
        if (item.isBack) return false;
        if (item.matchPaths) return item.matchPaths.includes(pathname);
        if (item.isHome) return pathname === '/' || pathname === '';
        return pathname === item.path;
    };

    const handleClick = (item: typeof NAV_ITEMS[0]) => {
        if (item.isBack) {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                navigate('/');
            }
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
            <div
                className="feeled-bottom-nav"
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 60,
                    background: 'rgba(8, 8, 20, 0.92)',
                    borderTop: '0.5px solid #1a1a2e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    zIndex: 1000,
                    paddingBottom: 'env(safe-area-inset-bottom)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                }}
            >
                {NAV_ITEMS.map((item, i) => {
                    const active = isActive(item);
                    return (
                        <button
                            key={i}
                            onClick={() => handleClick(item)}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 3,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '6px 12px',
                                borderRadius: 10,
                                minWidth: 50,
                                WebkitTapHighlightColor: 'transparent',
                            }}
                        >
                            <div style={{
                                width: 32,
                                height: 32,
                                borderRadius: 10,
                                background: active ? '#1a1040' : 'transparent',
                                border: `0.5px solid ${active ? '#4f46e5' : 'transparent'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 16,
                                boxShadow: active ? '0 0 10px #4f46e530' : 'none',
                                transition: 'all 0.15s ease',
                                color: item.isBack ? '#5a5a8a' : active ? '#818cf8' : '#3a3a5a',
                                fontWeight: item.isBack ? 700 : 'normal',
                            }}>
                                {item.icon}
                            </div>
                            <span style={{
                                fontSize: 9,
                                color: active ? '#818cf8' : '#3a3a5a',
                                fontWeight: active ? 600 : 400,
                                letterSpacing: '0.2px',
                            }}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </>
    );
};

export default BottomNav;
