
import React, { useState } from 'react';
import { Page } from '../types';

interface HeaderProps {
    onNavigate: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navItems = [
        { id: 'generator', label: 'Dashboard' },
        { id: 'teachers', label: 'For Teachers' },
        { id: 'parents', label: 'For Parents' },
        { id: 'research', label: 'Scientific Portfolio' },
        { id: 'pilot', label: 'Pilot Program' },
        { id: 'about', label: 'Philosophy' }
    ];

    const handleNavigate = (page: Page) => {
        onNavigate(page);
        setIsMenuOpen(false);
    };

    return (
        <header className="w-full bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 shadow-sm">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <button onClick={() => handleNavigate('generator')} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xl group-hover:rotate-6 transition-transform">F</div>
                    <div className="text-left">
                        <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none">FeelEd AI</h1>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Scientific Pedagogy</p>
                    </div>
                </button>
                
                {/* Desktop Nav */}
                <nav className="hidden lg:flex items-center space-x-1">
                    {navItems.map((item) => (
                        <button 
                            key={item.id}
                            onClick={() => handleNavigate(item.id as Page)}
                            className="px-4 py-2 rounded-lg text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all uppercase tracking-wider"
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => handleNavigate('contact')}
                        className="hidden sm:block bg-slate-900 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
                    >
                        Contact Office
                    </button>
                    
                    {/* Mobile Menu Toggle */}
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Nav Overlay */}
            {isMenuOpen && (
                <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-2xl animate-fade-in">
                    <nav className="flex flex-col p-6 space-y-2">
                        {navItems.map((item) => (
                            <button 
                                key={item.id}
                                onClick={() => handleNavigate(item.id as Page)}
                                className="w-full text-left px-6 py-4 rounded-xl text-sm font-black text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all uppercase tracking-widest"
                            >
                                {item.label}
                            </button>
                        ))}
                        <button 
                            onClick={() => handleNavigate('contact')}
                            className="w-full mt-4 bg-indigo-600 text-white px-6 py-4 rounded-xl text-sm font-black uppercase tracking-widest"
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
