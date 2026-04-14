import React from 'react';
import { Page } from '../types';

interface FooterProps {
    onNavigate: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
    return (
        <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Branding */}
                    <div className="space-y-6">
                        <button onClick={() => onNavigate('generator')} className="flex items-center gap-3 transition-transform hover:scale-[1.02]">
                            <img 
                                src="https://i.postimg.cc/g0tRDD6q/A-logo-for-Feel-Ed-AI-is-displayed-on-a-transparent-(1).png" 
                                alt="FeelEd AI Logo" 
                                className="w-10 h-10 object-contain"
                                referrerPolicy="no-referrer"
                            />
                            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">FeelEd AI</h2>
                        </button>
                        <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed text-sm">
                            Restoring empathy in education through emotion-adaptive storytelling and research-backed pedagogical intelligence.
                        </p>
                    </div>

                    {/* Social Connect - High Visibility */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Connect With Us</h3>
                        <div className="flex flex-col gap-4">
                            <a 
                                href="https://www.linkedin.com/company/feeled-ai/" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center gap-4 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-[#0A66C2] dark:hover:text-blue-400 transition-all group"
                            >
                                <span className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:bg-[#0A66C2]/10 group-hover:scale-110 transition-all shadow-sm">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/></svg>
                                </span>
                                LinkedIn
                            </a>
                            <a 
                                href="https://www.youtube.com/@FeelEdAI" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center gap-4 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-[#FF0000] dark:hover:text-red-400 transition-all group"
                            >
                                <span className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:bg-[#FF0000]/10 group-hover:scale-110 transition-all shadow-sm">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                                </span>
                                YouTube
                            </a>
                            <a 
                                href="https://www.facebook.com/profile.php?id=61584338379138" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center gap-4 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-[#1877F2] dark:hover:text-blue-500 transition-all group"
                            >
                                <span className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:bg-[#1877F2]/10 group-hover:scale-110 transition-all shadow-sm">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                </span>
                                Facebook
                            </a>
                            <a 
                                href="https://www.instagram.com/feeledai/" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center gap-4 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-[#E4405F] dark:hover:text-pink-400 transition-all group"
                            >
                                <span className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:bg-[#E4405F]/10 group-hover:scale-110 transition-all shadow-sm">
                                     <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                                </span>
                                Instagram
                            </a>
                        </div>
                    </div>

                    {/* Portals */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Audience Portals</h3>
                        <ul className="space-y-3">
                            <li><button onClick={() => onNavigate('teachers')} className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">👩‍🏫 For Teachers</button></li>
                            <li><button onClick={() => onNavigate('parents')} className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">👨‍👩‍👧 For Parents</button></li>
                            <li><button onClick={() => onNavigate('generator')} className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">🎓 For Students</button></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Foundation</h3>
                        <ul className="space-y-3">
                            <li><button onClick={() => onNavigate('research')} className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Scientific Portfolio</button></li>
                            <li><button onClick={() => onNavigate('inclusive')} className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">♿ Inclusive Learning</button></li>
                            <li><button onClick={() => onNavigate('about')} className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Our Philosophy</button></li>
                            <li><button onClick={() => onNavigate('privacy')} className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy Data Policy</button></li>
                            <li><button onClick={() => onNavigate('contact')} className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Contact Office</button></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-12 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">&copy; 2025 FeelEd AI. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;