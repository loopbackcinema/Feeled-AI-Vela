import React, { useState } from 'react';
import { Page } from '../types';

interface HeaderProps {
    onNavigate: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLinkClick = (id: Page) => {
        onNavigate(id);
        setIsMenuOpen(false);
    };

    return (
        <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm no-print">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
                {/* Brand Logo */}
                <button onClick={() => handleLinkClick('dashboard')} className="flex items-center gap-3 group transition-transform active:scale-95">
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl group-hover:bg-indigo-600 transition-colors">F</div>
                    <div className="text-left hidden sm:block">
                        <h1 className="text-xl font-black text-slate-900 tracking-tighter leading-none">FeelEd AI</h1>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Next-Gen Education</p>
                    </div>
                </button>
                
                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-4">
                    <button 
                        onClick={() => handleLinkClick('dashboard')}
                        className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white px-8 py-3.5 rounded-full font-black uppercase tracking-widest text-[11px] shadow-2xl hover:scale-110 transition-all flex items-center gap-3 ring-4 ring-pink-50 animate-pulse-slow"
                    >
                        <span className="text-xl">🚀</span> Student Hub
                    </button>

                    <div className="h-8 w-px bg-slate-100 mx-2"></div>
                    
                    <button onClick={() => handleLinkClick('generator')} className="px-4 py-2 text-slate-500 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest transition-all">Teacher Studio</button>
                    <button onClick={() => handleLinkClick('parents')} className="px-4 py-2 text-slate-500 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest transition-all">Parents</button>
                    <button onClick={() => handleLinkClick('research')} className="px-4 py-2 text-slate-500 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest transition-all">Research</button>
                    <button onClick={() => handleLinkClick('contact')} className="ml-4 bg-slate-900 text-white px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg">Support</button>
                </nav>

                {/* Mobile Trigger */}
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="lg:hidden p-3 text-slate-900 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors"
                    aria-label="Toggle Menu"
                >
                    {isMenuOpen ? (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    ) : (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                    )}
                </button>
            </div>

            {/* Mobile Sidebar/Menu */}
            {isMenuOpen && (
                <div className="lg:hidden bg-white border-t border-slate-100 animate-fade-in absolute w-full shadow-2xl z-50 h-[85vh] overflow-y-auto">
                    <nav className="flex flex-col p-6 space-y-4">
                        <button 
                            onClick={() => handleLinkClick('dashboard')}
                            className="w-full text-left px-8 py-8 rounded-[2.5rem] bg-gradient-to-r from-pink-500 to-indigo-600 text-white flex items-center justify-between shadow-2xl active:scale-95 transition-transform"
                        >
                            <span className="font-black text-2xl uppercase tracking-tighter">Enter Student Hub</span>
                            <span className="text-4xl">🚀</span>
                        </button>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => handleLinkClick('generator')} className="p-6 rounded-3xl bg-slate-50 text-slate-700 font-black text-xs uppercase tracking-widest text-center border border-slate-100 active:bg-slate-100">Teachers</button>
                            <button onClick={() => handleLinkClick('parents')} className="p-6 rounded-3xl bg-slate-50 text-slate-700 font-black text-xs uppercase tracking-widest text-center border border-slate-100 active:bg-slate-100">Parents</button>
                        </div>
                        <button onClick={() => handleLinkClick('research')} className="w-full p-6 rounded-3xl bg-slate-50 text-center font-black text-slate-500 uppercase tracking-widest text-[10px]">Scientific Portfolio</button>
                        <button onClick={() => handleLinkClick('contact')} className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-transform">Contact Support</button>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;