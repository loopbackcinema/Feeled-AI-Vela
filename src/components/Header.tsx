
import React from 'react';
import { Page } from '../types';

interface HeaderProps {
    onNavigate: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
    return (
        <header className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 shadow-sm">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <button onClick={() => onNavigate('generator')} className="flex items-center gap-4 group">
                    <img src="/logo.svg" alt="Logo" className="w-9 h-9 group-hover:rotate-6 transition-transform" />
                    <div className="text-left">
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">FeelEd AI</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scientific Pedagogy</p>
                    </div>
                </button>
                
                <nav className="hidden lg:flex items-center space-x-2">
                    {[
                        { id: 'generator', label: 'Dashboard' },
                        { id: 'research', label: 'Science' },
                        { id: 'about', label: 'Philosophy' },
                        { id: 'founder', label: 'Founder' },
                        { id: 'showcase', label: 'Showcase' }
                    ].map((item) => (
                        <button 
                            key={item.id}
                            onClick={() => onNavigate(item.id as Page)}
                            className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => onNavigate('contact')}
                        className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                    >
                        Contact
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
