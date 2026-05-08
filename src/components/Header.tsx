import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle, logOut } from '../firebase';

const PATH_MAP: Record<string, string> = {
    home: '/',
    'student-dashboard': '/dashboard',
    'my-stories': '/my-stories',
    'admin-dashboard': '/admin',
};

const toPath = (id: string) => PATH_MAP[id] ?? `/${id}`;

const Header: React.FC = () => {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const navItems = [
        { id: 'home', label: 'Home' },
        { id: 'teachers', label: 'For Teachers' },
        { id: 'parents', label: 'For Parents' },
        { id: 'research', label: 'Scientific Portfolio' },
        { id: 'pilot', label: 'Pilot Program' },
        { id: 'about', label: 'Philosophy' }
    ];

    if (user) {
        navItems.splice(0, 1, { id: 'student-dashboard', label: 'Dashboard' });
        navItems.splice(1, 0, { id: 'my-stories', label: 'My Stories' });
        navItems.push({ id: 'home', label: 'Study AI' });
    }

    if (isAdmin) {
        navItems.push({ id: 'admin-dashboard', label: 'Admin Panel' });
    }

    const handleLinkClick = (id: string) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        navigate(toPath(id));
        setIsMenuOpen(false);
    };

    const handleAuth = async () => {
        if (user) {
            await logOut();
        } else {
            try {
                setIsLoggingIn(true);
                await signInWithGoogle();
            } catch (error: any) {
                console.error("Login failed:", error);
                alert(error.message || "Login failed. Please check if popups are blocked.");
            } finally {
                setIsLoggingIn(false);
            }
        }
    };

    return (
        <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <button onClick={() => handleLinkClick('home')} className="flex items-center gap-3 transition-opacity hover:opacity-80">
                    <img
                        src="https://i.postimg.cc/g0tRDD6q/A-logo-for-Feel-Ed-AI-is-displayed-on-a-transparent-(1).png"
                        alt="FeelEd AI Logo"
                        className="w-12 h-12 object-contain"
                        referrerPolicy="no-referrer"
                    />
                    <div className="text-left">
                        <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">FeelEd AI</h1>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Academic Portal</p>
                    </div>
                </button>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center space-x-1">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleLinkClick(item.id)}
                            className="px-4 py-2 rounded-lg text-[11px] font-black text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all uppercase tracking-[0.1em]"
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm"
                        aria-label="Toggle Dark Mode"
                    >
                        {isDarkMode ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" /></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                        )}
                    </button>

                    <button
                        onClick={handleAuth}
                        disabled={isLoggingIn}
                        className={`hidden md:flex items-center gap-2 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${isLoggingIn ? 'bg-indigo-400 cursor-not-allowed' : 'bg-slate-900 dark:bg-slate-800 hover:bg-indigo-600'}`}
                    >
                        {isLoggingIn ? (
                            <>
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Wait...</span>
                            </>
                        ) : user ? (
                            <>
                                {user.photoURL && <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full" />}
                                <span>Sign Out</span>
                            </>
                        ) : (
                            <span>Student Login</span>
                        )}
                    </button>

                    <button
                        onClick={() => handleLinkClick('contact')}
                        className="hidden md:block border-2 border-slate-900 dark:border-slate-700 text-slate-900 dark:text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white dark:hover:bg-slate-700 transition-all"
                    >
                        Contact
                    </button>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                        aria-label="Toggle Menu"
                    >
                        {isMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {isMenuOpen && (
                <div className="lg:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 animate-fade-in transition-colors duration-300">
                    <nav className="flex flex-col p-4 space-y-1">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleLinkClick(item.id)}
                                className="w-full text-left px-6 py-4 rounded-xl text-xs font-black text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all uppercase tracking-widest"
                            >
                                {item.label}
                            </button>
                        ))}
                        <button
                            onClick={handleAuth}
                            disabled={isLoggingIn}
                            className={`w-full mt-2 text-white px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-center shadow-lg transition-all ${isLoggingIn ? 'bg-indigo-400 cursor-not-allowed' : 'bg-slate-900 dark:bg-slate-800'}`}
                        >
                            {isLoggingIn ? 'Authenticating...' : user ? 'Sign Out' : 'Student Login'}
                        </button>
                        <button
                            onClick={() => handleLinkClick('contact')}
                            className="w-full mt-2 border-2 border-slate-900 dark:border-slate-700 text-slate-900 dark:text-white px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-center"
                        >
                            Contact Office
                        </button>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;
