
import React, { useState } from 'react';
import { Page } from '../types';

interface HeaderProps {
    onNavigate: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navItems = [
        { id: 'generator', label: 'Dashboard' },
        { id: 'inclusive', label: '♿ Inclusive Learning' },
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
        <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <button onClick={() => handleLinkClick('generator')} className="flex items-center gap-3 transition-opacity hover:opacity-80">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">F</div>
                    <div className="text-left">
                        <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">FeelEd AI</h1>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Academic Portal</p>
                    </div>
                </button>
                
                {/* Desktop Navigation */}
                <nav className="hidden xl:flex items-center space-x-1">
                    {navItems.map((item) => (
                        <button 
                            key={item.id}
                            onClick={() => handleLinkClick(item.id)}
                            className="px-4 py-2 rounded-lg text-[11px] font-black text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-all uppercase tracking-[0.1em]"
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
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
                <div className="lg:hidden bg-white border-t border-slate-100 animate-fade-in">
                    <nav className="flex flex-col p-4 space-y-1">
                        {navItems.map((item) => (
                            <button 
                                key={item.id}
                                onClick={() => handleLinkClick(item.id)}
                                className="w-full text-left px-6 py-4 rounded-xl text-xs font-black text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all uppercase tracking-widest"
                            >
                                {item.label}
                            </button>
                        ))}
                        <button 
                            onClick={() => handleLinkClick('contact')}
                            className="w-full mt-4 bg-indigo-600 text-white px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-center"
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
