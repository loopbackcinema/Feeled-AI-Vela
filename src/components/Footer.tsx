
import React from 'react';
import { Page } from '../types';

interface FooterProps {
    onNavigate: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
    return (
        <footer className="w-full bg-white border-t border-slate-200 mt-auto">
            <div className="container mx-auto px-6 py-16">
                <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
                    <div className="space-y-6 max-w-sm">
                        <button onClick={() => onNavigate('generator')} className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xl">F</div>
                            <h2 className="text-xl font-bold text-slate-900">FeelEd AI</h2>
                        </button>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            Restoring empathy in education through emotion-adaptive storytelling and research-backed pedagogical intelligence.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 w-full md:w-auto">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Audience</h3>
                            <ul className="space-y-3">
                                <li><button onClick={() => onNavigate('teachers')} className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">For Teachers</button></li>
                                <li><button onClick={() => onNavigate('parents')} className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">For Parents</button></li>
                                <li><button onClick={() => onNavigate('generator')} className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">For Students</button></li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Initiatives</h3>
                            <ul className="space-y-3">
                                <li><button onClick={() => onNavigate('pilot')} className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Pilot Program</button></li>
                                <li><button onClick={() => onNavigate('research')} className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Scientific Portfolio</button></li>
                                <li><button onClick={() => onNavigate('inclusive')} className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Inclusive Research</button></li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Company</h3>
                            <ul className="space-y-3">
                                <li><button onClick={() => onNavigate('about')} className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Philosophy</button></li>
                                <li><button onClick={() => onNavigate('founder')} className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Founder</button></li>
                                <li><button onClick={() => onNavigate('privacy')} className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Privacy Policy</button></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">&copy; 2025 FeelEd AI. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="https://linkedin.com" className="text-slate-400 hover:text-blue-600 transition-colors" aria-label="LinkedIn">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                        </a>
                        <a href="https://facebook.com" className="text-slate-400 hover:text-blue-800 transition-colors" aria-label="Facebook">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.323-1.325z"/></svg>
                        </a>
                        <a href="https://twitter.com" className="text-slate-400 hover:text-slate-900 transition-colors" aria-label="Twitter">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
