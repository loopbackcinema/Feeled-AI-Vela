
import React from 'react';
import { Page } from '../types';

interface FooterProps {
    onNavigate: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
    return (
        <footer className="w-full bg-white border-t border-slate-200 mt-auto">
            <div className="max-w-7xl mx-auto px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    <div className="space-y-6">
                        <button onClick={() => onNavigate('generator')} className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl">F</div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">FeelEd AI</h2>
                        </button>
                        <p className="text-slate-500 font-medium leading-relaxed text-sm">
                            Restoring empathy in education through emotion-adaptive storytelling and research-backed pedagogical intelligence.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Audience Portals</h3>
                        <ul className="space-y-3">
                            <li><button onClick={() => onNavigate('teachers')} className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">👩‍🏫 For Teachers</button></li>
                            <li><button onClick={() => onNavigate('parents')} className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">👨‍👩‍👧 For Parents</button></li>
                            <li><button onClick={() => onNavigate('generator')} className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">🎓 For Students</button></li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Research Hub</h3>
                        <ul className="space-y-3">
                            <li><button onClick={() => onNavigate('research')} className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Scientific Portfolio</button></li>
                            <li><button onClick={() => onNavigate('pilot')} className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Pilot Program</button></li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Foundation</h3>
                        <ul className="space-y-3">
                            <li><button onClick={() => onNavigate('about')} className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Our Philosophy</button></li>
                            <li><button onClick={() => onNavigate('founder')} className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Meet the Founder</button></li>
                            <li><button onClick={() => onNavigate('contact')} className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Contact Office</button></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">&copy; 2025 FeelEd AI. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
