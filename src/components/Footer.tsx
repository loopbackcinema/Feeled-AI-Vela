
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
                    {/* Branding */}
                    <div className="space-y-6">
                        <button onClick={() => onNavigate('generator')} className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl">F</div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">FeelEd AI</h2>
                        </button>
                        <p className="text-slate-500 font-medium leading-relaxed text-sm">
                            Restoring empathy in education through emotion-adaptive storytelling and research-backed pedagogical intelligence.
                        </p>
                    </div>

                    {/* Portals */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Audience Portals</h3>
                        <ul className="space-y-3">
                            <li><button onClick={() => onNavigate('teachers')} className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">👩‍🏫 For Teachers</button></li>
                            <li><button onClick={() => onNavigate('parents')} className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">👨‍👩‍👧 For Parents</button></li>
                            <li><button onClick={() => onNavigate('generator')} className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">🎓 For Students</button></li>
                        </ul>
                    </div>

                    {/* Research */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Research Hub</h3>
                        <ul className="space-y-3">
                            <li><button onClick={() => onNavigate('research')} className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Scientific Portfolio</button></li>
                            <li><button onClick={() => onNavigate('pilot')} className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Pilot Program</button></li>
                            <li><button onClick={() => onNavigate('inclusive')} className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Inclusive Learning</button></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Foundation</h3>
                        <ul className="space-y-3">
                            <li><button onClick={() => onNavigate('about')} className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Our Philosophy</button></li>
                            <li><button onClick={() => onNavigate('founder')} className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Meet the Founder</button></li>
                            <li><button onClick={() => onNavigate('contact')} className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Contact Office</button></li>
                            <li><button onClick={() => onNavigate('privacy')} className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Privacy Data Policy</button></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">&copy; 2025 FeelEd AI. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="https://www.linkedin.com/company/feeled-ai/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 transition-all transform hover:scale-110" aria-label="LinkedIn">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/></svg>
                        </a>
                        <a href="https://www.instagram.com/feeledai/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-pink-600 transition-all transform hover:scale-110" aria-label="Instagram">
                             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
