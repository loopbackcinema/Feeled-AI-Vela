
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
                        <button onClick={() => onNavigate('generator')} className="flex items-center gap-3 transition-transform hover:scale-[1.02]">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">F</div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">FeelEd AI</h2>
                        </button>
                        <p className="text-slate-500 font-medium leading-relaxed text-sm">
                            Restoring empathy in education through emotion-adaptive storytelling and research-backed pedagogical intelligence.
                        </p>
                    </div>

                    {/* Social Connect */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Connect With Us</h3>
                        <div className="flex flex-col gap-4">
                            <a 
                                href="https://www.linkedin.com/company/feeled-ai/" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center gap-4 text-sm font-bold text-slate-600 hover:text-[#0A66C2] transition-all group"
                            >
                                <span className="p-3 bg-slate-50 rounded-2xl group-hover:bg-[#0A66C2]/10 group-hover:scale-110 transition-all shadow-sm">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/></svg>
                                </span>
                                LinkedIn
                            </a>
                        </div>
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

                    {/* Resources */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Foundation</h3>
                        <ul className="space-y-3">
                            <li><button onClick={() => onNavigate('inclusive')} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors font-black">♿ Inclusive Learning Research</button></li>
                            <li><button onClick={() => onNavigate('research')} className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Scientific Portfolio</button></li>
                            <li><button onClick={() => onNavigate('about')} className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Our Philosophy</button></li>
                            <li><button onClick={() => onNavigate('privacy')} className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Privacy Data Policy</button></li>
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
