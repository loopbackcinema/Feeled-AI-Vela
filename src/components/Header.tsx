import React from 'react';
import { Page } from '../types';

interface HeaderProps {
    onNavigate: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
    return (
        <header className="w-full bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 shadow-sm">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <button onClick={() => onNavigate('generator')} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xl group-hover:rotate-6 transition-transform">F</div>
                    <div className="text-left">
                        <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none">FeelEd AI</h1>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Scientific Pedagogy</p>
                    </div>
                </button>
                
                <nav className="hidden lg:flex items-center space-x-1">
                    {[
                        { id: 'generator', label: 'Dashboard' },
                        { id: 'teachers', label: 'For Teachers' },
                        { id: 'parents', label: 'For Parents' },
                        { id: 'research', label: 'Scientific Portfolio' },
                        { id: 'pilot', label: 'Pilot Program' },
                        { id: 'about', label: 'Philosophy' }
                    ].map((item) => (
                        <button 
                            key={item.id}
                            onClick={() => onNavigate(item.id as Page)}
                            className="px-4 py-2 rounded-lg text-xs font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all uppercase tracking-wider"
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => onNavigate('contact')}
                        className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-200"
                    >
                        Contact Office
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;