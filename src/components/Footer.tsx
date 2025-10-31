import React from 'react';
import { Page } from '../types';

interface FooterProps {
    onNavigate: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
    return (
        <footer className="w-full bg-white border-t border-slate-200 mt-auto">
            <div className="container mx-auto px-4 py-6 text-center text-slate-500">
                <div className="flex justify-center items-center space-x-6 mb-4">
                    <button onClick={() => onNavigate('about')} className="hover:text-blue-600 transition-colors">About Us</button>
                    <button onClick={() => onNavigate('contact')} className="hover:text-blue-600 transition-colors">Contact</button>
                    <button onClick={() => onNavigate('privacy')} className="hover:text-blue-600 transition-colors">Privacy Policy</button>
                </div>
                <p className="text-sm">&copy; 2025 FeelEd AI. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
