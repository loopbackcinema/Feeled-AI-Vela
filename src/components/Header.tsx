
import React from 'react';
import { Page } from '../types';

interface HeaderProps {
    onNavigate: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {

    const handleFeedbackClick = () => {
        const phoneNumber = "919092450286"; // Phone number from Contact Us page
        const message = `Hi FeelEd AI Team! I'd like to share some feedback about the app.\n\n1. What I liked: \n\n2. What can be improved: \n\n3. Any other suggestions: `;
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <header className="w-full bg-white shadow-sm">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <button onClick={() => onNavigate('generator')} className="flex items-center gap-3 group">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl group-hover:bg-blue-700 transition-colors">
                        <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M25 30C25 24.4772 29.4772 20 35 20H65C70.5228 20 75 24.4772 75 30V45H40C31.7157 45 25 51.7157 25 60V70H35C29.4772 70 25 65.5228 25 60V30Z" fill="white"/>
                            <path d="M75 70C75 75.5228 70.5228 80 65 80H35C29.4772 80 25 75.5228 25 70V55H60C68.2843 55 75 48.2843 75 40V30H65C70.5228 30 75 34.4772 75 40V70Z" fill="white" opacity="0.8"/>
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors">FeelEd AI</h1>
                        <p className="text-slate-500 text-left mt-1">Feel the story. Learn naturally.</p>
                    </div>
                </button>
                <button
                    onClick={handleFeedbackClick}
                    aria-label="Provide feedback via WhatsApp"
                    className="flex items-center gap-2 bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors transform hover:scale-105"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 448 512" fill="currentColor">
                       <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.8 0-67.6-9.5-97.8-26.7l-7.1-4.2-73.3 19.3 19.3-71.6-4.7-7.5c-19.1-30.3-29.8-66-29.8-103.3 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                    </svg>
                    <span className="hidden sm:inline">Feedback</span>
                </button>
            </div>
        </header>
    );
};

export default Header;
