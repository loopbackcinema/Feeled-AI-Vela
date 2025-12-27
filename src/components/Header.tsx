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
        <header className="w-full bg-white/90 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-200/60 shadow-sm">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <button onClick={() => onNavigate('generator')} className="flex items-center gap-3 group">
                    <img
                        src="/logo.svg"
                        alt="FeelEd AI Logo"
                        className="w-10 h-10 group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="text-left">
                        <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600">FeelEd AI</h1>
                        <p className="hidden sm:block text-slate-400 text-[10px] font-bold uppercase tracking-[0.15em] ml-0.5">Empathy Driven Education</p>
                    </div>
                </button>
                <nav className="hidden lg:flex items-center space-x-1 p-1 bg-slate-100/50 rounded-2xl border border-slate-200/50">
                    <button onClick={() => onNavigate('showcase')} className="text-blue-600 hover:bg-white px-4 py-2 rounded-xl transition-all text-sm font-bold shadow-sm border border-transparent hover:border-blue-100">Showcase</button>
                    <button onClick={() => onNavigate('about')} className="text-slate-600 hover:text-blue-600 hover:bg-white px-4 py-2 rounded-xl transition-all text-sm font-bold">About</button>
                    <button onClick={() => onNavigate('research')} className="text-slate-600 hover:text-blue-600 hover:bg-white px-4 py-2 rounded-xl transition-all text-sm font-bold">Research</button>
                    <button onClick={() => onNavigate('founder')} className="text-slate-600 hover:text-blue-600 hover:bg-white px-4 py-2 rounded-xl transition-all text-sm font-bold">Founder</button>
                    <button onClick={() => onNavigate('contact')} className="text-slate-600 hover:text-blue-600 hover:bg-white px-4 py-2 rounded-xl transition-all text-sm font-bold">Contact</button>
                </nav>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleFeedbackClick}
                        className="flex items-center gap-2 bg-[#25D366] text-white font-black py-2.5 px-6 rounded-full hover:bg-[#1fb855] focus:outline-none focus:ring-4 focus:ring-green-100 transition-all transform hover:scale-105 shadow-xl shadow-green-200/40"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 448 512" fill="currentColor">
                           <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.8 0-67.6-9.5-97.8-26.7l-7.1-4.2-73.3 19.3 19.3-71.6-4.7-7.5c-19.1-30.3-29.8-66-29.8-103.3 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                        </svg>
                        <span className="hidden sm:inline">Feedback</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;