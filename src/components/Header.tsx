import React from 'react';
import { Page } from '../types';

interface HeaderProps {
    onNavigate: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {

    const handleFeedbackClick = () => {
        const phoneNumber = "919092450286";
        const message = `Hi FeelEd AI Team! I'm reaching out from the Startup School showcase. I have some feedback/enquiries regarding the prototype.`;
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <header className="w-full glass-header sticky top-0 z-50 border-b border-slate-200/50">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <button 
                    onClick={() => onNavigate('generator')} 
                    className="flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-95"
                >
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                        <img src="/logo.svg" alt="Logo" className="w-6 h-6 invert brightness-0" />
                    </div>
                    <div className="text-left">
                        <h1 className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">FeelEd <span className="text-indigo-600">AI</span></h1>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Empathy Engine</span>
                    </div>
                </button>

                <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/50">
                    <button onClick={() => onNavigate('generator')} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-white transition-all">Home</button>
                    <button onClick={() => onNavigate('about')} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-white transition-all">Mission</button>
                    <button onClick={() => onNavigate('research')} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-white transition-all">Science</button>
                    <button onClick={() => onNavigate('founder')} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-white transition-all">Leadership</button>
                </nav>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => onNavigate('showcase')}
                        className="hidden md:block px-5 py-2.5 rounded-xl text-sm font-bold bg-white border border-slate-200 text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm"
                    >
                        Startup Showcase
                    </button>
                    <button
                        onClick={handleFeedbackClick}
                        className="bg-indigo-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center gap-2"
                    >
                        <span className="hidden sm:inline">Connect</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;