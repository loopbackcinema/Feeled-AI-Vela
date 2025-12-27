
import React from 'react';
import { Page } from '../types';

interface HeaderProps {
    onNavigate: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
    return (
        <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
                <button onClick={() => onNavigate('generator')} className="flex items-center gap-4 transition-opacity hover:opacity-80">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">F</div>
                    <div className="text-left">
                        <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">FeelEd AI</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Academic Portal</p>
                    </div>
                </button>
                
                <nav className="hidden md:flex items-center space-x-1">
                    {[
                        { id: 'generator', label: 'Dashboard' },
                        { id: 'research', label: 'Scientific Portfolio' },
                        { id: 'about', label: 'Philosophy' },
                        { id: 'founder', label: 'Founder' },
                        { id: 'showcase', label: 'Showcase' }
                    ].map((item) => (
                        <button 
                            key={item.id}
                            onClick={() => onNavigate(item.id as Page)}
                            className="px-5 py-2.5 rounded-lg text-xs font-black text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-all uppercase tracking-widest"
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>

                <button 
                    onClick={() => onNavigate('contact')}
                    className="bg-slate-900 text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100"
                >
                    Contact Office
                </button>
            </div>
        </header>
    );
};

export default Header;
