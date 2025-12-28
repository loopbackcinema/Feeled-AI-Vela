import React, { useState } from 'react';
import { Page } from '../types';

interface HeaderProps {
    onNavigate: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLinkClick = (id: string) => {
        onNavigate(id as Page);
        setIsMenuOpen(false);
    };

    return (
        <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
                {/* Logo */}
                <button onClick={() => handleLinkClick('generator')} className="flex items-center gap-3 transition-opacity hover:opacity-80">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">F</div>
                    <div className="text-left hidden md:block">
                        <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">FeelEd AI</h1>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Learning Engine</p>
                    </div>
                </button>
                
                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-4">
                    <button 
                        onClick={() => handleLinkClick('generator')}
                        className="text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors"
                    >
                        Teacher Studio
                    </button>
                    
                    {/* HIGH VISIBILITY STUDENT BUTTON */}
                    <button 
                        onClick={() => handleLinkClick('dashboard')}
                        className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-2.5 rounded-full font-black uppercase tracking-widest text-xs shadow-lg shadow-pink-200 hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 ring-4 ring-pink-50"
                    >
                        <span className="text-lg">🚀</span> Student Zone
                    </button>

                    <div className="h-6 w-px bg-slate-200 mx-2"></div>
                    
                    <button onClick={() => handleLinkClick('inclusive')} className="text-slate-500 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest">Inclusive</button>
                    <button onClick={() => handleLinkClick('research')} className="text-slate-500 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest">Research</button>
                </nav>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => handleLinkClick('contact')}
                        className="hidden md:block bg-slate-900 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
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
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        ) : (
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {isMenuOpen && (
                <div className="lg:hidden bg-white border-t border-slate-100 animate-fade-in absolute w-full shadow-2xl z-50 h-screen overflow-y-auto pb-20">
                    <nav className="flex flex-col p-6 space-y-4">
                        <button 
                            onClick={() => handleLinkClick('dashboard')}
                            className="w-full text-left px-6 py-6 rounded-3xl bg-pink-50 text-pink-600 border-2 border-pink-100 flex items-center gap-4 shadow-sm"
                        >
                            <span className="text-3xl">🚀</span> 
                            <span className="font-black text-lg">ENTER STUDENT ZONE</span>
                        </button>

                        <button 
                            onClick={() => handleLinkClick('generator')}
                            className="w-full text-left px-6 py-4 rounded-2xl text-slate-700 font-bold hover:bg-slate-50 flex items-center gap-4"
                        >
                            <span className="text-2xl">🎓</span> Teacher Studio
                        </button>

                        <div className="border-t border-slate-100 my-2"></div>

                        <button onClick={() => handleLinkClick('inclusive')} className="w-full text-left px-6 py-3 text-slate-500 font-bold">Inclusive Learning</button>
                        <button onClick={() => handleLinkClick('research')} className="w-full text-left px-6 py-3 text-slate-500 font-bold">Research Portfolio</button>
                        <button onClick={() => handleLinkClick('contact')} className="w-full text-left px-6 py-3 text-slate-500 font-bold">Contact Us</button>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;