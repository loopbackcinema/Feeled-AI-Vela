import React from 'react';
import { Page } from '../types';

interface HeaderProps {
    onNavigate: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {

    const handleFeedbackClick = () => {
        const phoneNumber = "919092450286";
        const message = `Hi FeelEd AI Team! I'd like to share some feedback about the app.\n\n1. What I liked: \n\n2. What can be improved: \n\n3. Any other suggestions: `;
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <header className="w-full bg-white/95 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100 shadow-sm">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <button onClick={() => onNavigate('generator')} className="flex items-center gap-3 group">
                    <img
                        src="/logo.svg"
                        alt="FeelEd AI Logo"
                        className="w-10 h-10 group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="text-left">
                        <h1 className="text-2xl font-black tracking-tight text-blue-600">FeelEd AI</h1>
                        <p className="hidden sm:block text-slate-500 text-[10px] font-bold uppercase tracking-widest ml-0.5">Feel the story. Learn naturally.</p>
                    </div>
                </button>
                <nav className="hidden lg:flex items-center space-x-1 p-1 bg-slate-100/50 rounded-2xl border border-slate-200/50">
                    <button onClick={() => onNavigate('about')} className="text-slate-600 hover:text-blue-600 hover:bg-white px-4 py-2 rounded-xl transition-all text-sm font-bold">About</button>
                    <button onClick={() => onNavigate('founder')} className="text-slate-600 hover:text-blue-600 hover:bg-white px-4 py-2 rounded-xl transition-all text-sm font-bold">Founder</button>
                    <button onClick={() => onNavigate('research')} className="text-slate-600 hover:text-blue-600 hover:bg-white px-4 py-2 rounded-xl transition-all text-sm font-bold">Research</button>
                    <button onClick={() => onNavigate('contact')} className="text-slate-600 hover:text-blue-600 hover:bg-white px-4 py-2 rounded-xl transition-all text-sm font-bold">Contact</button>
                </nav>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleFeedbackClick}
                        className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 font-bold py-2.5 px-6 rounded-full hover:bg-slate-50 transition-all transform hover:scale-105 shadow-sm"
                    >
                        Feedback
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
