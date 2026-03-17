
import React, { useState, useEffect } from 'react';
import { Page } from '../types';

interface HeaderProps {
    onNavigate: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const navItems = [
        { id: 'generator', label: 'Dashboard' },
        { id: 'teachers', label: 'For Teachers' },
        { id: 'parents', label: 'For Parents' },
        { id: 'research', label: 'Scientific Portfolio' },
        { id: 'pilot', label: 'Pilot Program' },
        { id: 'about', label: 'Philosophy' }
    ];

    const handleLinkClick = (id: string) => {
        onNavigate(id as Page);
        setIsMenuOpen(false);
    };

    return (
        <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <button onClick={() => handleLinkClick('generator')} className="flex items-center gap-3 transition-opacity hover:opacity-80">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">F</div>
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
                        onClick={() => handleLinkClick('contact')}
                        className="hidden md:block bg-slate-900 text-white px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg"
                    >
                        Contact Office
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
                            onClick={() => handleLinkClick('contact')}
                            className="w-full mt-4 bg-indigo-600 text-white px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-center shadow-lg hover:bg-indigo-700 transition-colors"
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
