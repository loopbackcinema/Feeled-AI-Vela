import React from 'react';
import { Page } from '../types';

interface ContactProps {
    onNavigate: (page: Page) => void;
}

const Contact: React.FC<ContactProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-5xl space-y-16 animate-fade-in pb-20">
            {/* Header */}
            <div className="text-center space-y-4">
                 <div className="w-24 h-24 bg-blue-100 rounded-[2.5rem] flex items-center justify-center text-5xl mx-auto mb-8 shadow-sm">📬</div>
                 <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter">Contact Us</h1>
                 <p className="text-2xl text-slate-500 max-w-2xl mx-auto font-bold leading-relaxed">
                    We’d love to hear from you. Whether you have a question, need support, or want to collaborate, our team is here to help.
                 </p>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
                {/* General Card */}
                <div className="bg-white p-12 rounded-[4rem] shadow-xl border border-slate-100 hover:shadow-2xl transition-shadow duration-500">
                     <div className="flex items-center gap-6 mb-10">
                         <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-4xl">📞</div>
                         <h2 className="text-3xl font-black text-slate-900 tracking-tight">General Enquiries</h2>
                     </div>
                     <p className="text-xl text-slate-500 font-bold mb-10 leading-relaxed">For questions, support, suggestions, or feedback:</p>
                     <div className="space-y-8">
                         <div className="flex items-start gap-6 group">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">📧</div>
                            <div>
                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                                <a href="mailto:vela@feeledai.com" className="text-xl font-black text-slate-800 hover:text-blue-600 transition-colors">vela@feeledai.com</a>
                            </div>
                         </div>
                         <div className="flex items-start gap-6 group">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">📱</div>
                            <div>
                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                                <a href="tel:+919092450286" className="text-xl font-black text-slate-800 hover:text-blue-600 transition-colors">+91 90924 50286</a>
                            </div>
                         </div>
                         <div className="flex items-start gap-6 group">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">📍</div>
                            <div>
                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
                                <p className="text-xl font-black text-slate-800">Chennai, India</p>
                            </div>
                         </div>
                         <div className="flex items-start gap-6 group">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">🕒</div>
                            <div>
                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Working Hours</p>
                                <p className="text-xl font-black text-slate-800">Mon – Fri, 9:00 AM – 6:00 PM IST</p>
                            </div>
                         </div>
                     </div>
                </div>

                {/* Business Card */}
                <div className="bg-slate-900 text-white p-12 rounded-[4rem] shadow-2xl flex flex-col relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[120px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
                     <div className="relative z-10 h-full flex flex-col">
                        <div className="flex items-center gap-6 mb-10">
                            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-4xl backdrop-blur-md">💼</div>
                            <h2 className="text-3xl font-black text-white tracking-tight">Partnership Opportunities</h2>
                        </div>
                        <p className="text-xl text-slate-400 font-bold mb-10 leading-relaxed">
                            If you represent a school, college, NGO, EdTech company, or organization interested in integrating FeelEd AI into your curriculum, platform, or research program, we’d be happy to collaborate.
                        </p>
                        <div className="mt-auto bg-white/5 border border-white/10 p-10 rounded-[3rem] backdrop-blur-xl">
                            <p className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-2">EMAIL SUBJECT LINE:</p>
                            <p className="text-2xl font-mono text-white mb-8">“Partnership with FeelEd AI”</p>
                            <a href="mailto:vela@feeledai.com?subject=Partnership with FeelEd AI" className="w-full py-5 rounded-2xl bg-white text-slate-900 text-xl font-black flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-xl">
                                <span>✉️</span> Contact Partnerships
                            </a>
                        </div>
                     </div>
                </div>
            </div>

            {/* Support Box */}
            <div className="bg-emerald-50 p-10 md:p-16 rounded-[4rem] border-4 border-emerald-100 shadow-xl relative group overflow-hidden">
                <div className="absolute top-[-5rem] right-[-5rem] w-64 h-64 bg-emerald-200 rounded-full blur-[100px] opacity-20"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="flex-1 space-y-6">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-5xl shadow-sm">🧠</div>
                            <h2 className="text-4xl font-black text-emerald-900">Support & Technical Assistance</h2>
                        </div>
                        <p className="text-xl text-emerald-800/70 font-bold leading-relaxed">
                            If you’re facing issues with the app, dashboard, or user account, our support team is ready to assist you.
                        </p>
                        <div className="bg-white p-10 rounded-[3rem] border border-emerald-100 shadow-sm flex flex-col md:flex-row gap-10 items-center">
                            <div className="flex-1 space-y-4">
                                <h3 className="text-xl font-black text-emerald-900 mb-4 tracking-tight">Please Include:</h3>
                                <ul className="space-y-3 text-lg font-bold text-slate-600">
                                    <li className="flex items-center gap-3"><span className="text-emerald-500">🔹</span> Your registered email</li>
                                    <li className="flex items-center gap-3"><span className="text-emerald-500">🔹</span> Device details (mobile/desktop)</li>
                                    <li className="flex items-center gap-3"><span className="text-emerald-500">🔹</span> Short description of the issue</li>
                                    <li className="flex items-center gap-3"><span className="text-emerald-500">🔹</span> Screenshots (if applicable)</li>
                                </ul>
                            </div>
                            <div className="flex flex-col items-center justify-center gap-6 md:border-l border-emerald-100 md:pl-10 h-full">
                                <a href="mailto:vela@feeledai.com" className="text-2xl md:text-4xl font-black text-emerald-700 hover:text-emerald-900 transition-all border-b-4 border-emerald-200 group-hover:border-emerald-500">
                                    vela@feeledai.com
                                </a>
                                <span className="px-8 py-3 bg-emerald-200 text-emerald-900 rounded-2xl text-lg font-black tracking-tighter">
                                    ⚡ Response time: 24–48 hours
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center pt-10 pb-20">
                <button onClick={() => onNavigate('generator')} className="bg-slate-800 text-white font-black py-5 px-16 rounded-full text-2xl shadow-2xl hover:scale-105 transition-all">
                    Back to Story Generator
                </button>
            </div>
        </div>
    );
};

export default Contact;
