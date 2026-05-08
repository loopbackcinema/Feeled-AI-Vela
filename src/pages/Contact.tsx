
import React from 'react';
import { Page } from '../types';

interface ContactProps {
    onNavigate: (page: Page) => void;
}

const Contact: React.FC<ContactProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-5xl mx-auto animate-fade-in pb-12 px-6 mb-32 transition-colors duration-300">
            {/* Header Section */}
            <div className="text-center space-y-4 py-8 mb-4">
                <div className="inline-block p-3 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-2 shadow-sm animate-bounce-slow transition-colors">
                    <span className="text-4xl">📬</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-slate-800 dark:text-white tracking-tight transition-colors">
                    Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Us</span>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed transition-colors">
                    We’d love to hear from you. Whether you have a question, need support, or want to collaborate, our team is here to help.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* General Enquiries Card */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-blue-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 group hover:-translate-y-1 md:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-all">
                            📞
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 transition-colors">General Enquiries</h2>
                    </div>
                    <div className="space-y-4 text-slate-600 dark:text-slate-400 text-lg transition-colors">
                        <p>For questions, support, suggestions, or feedback:</p>
                        
                        <div className="space-y-3 mt-4">
                            <a href="mailto:admin@feeledai.com" className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-blue-100 dark:hover:border-slate-700">
                                <span className="text-blue-500 text-xl">📧</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">admin@feeledai.com</span>
                            </a>
                            <a href="tel:+919092450286" className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-blue-100 dark:hover:border-slate-700">
                                <span className="text-blue-500 text-xl">📱</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">+91 90924 50286</span>
                            </a>
                            <div className="flex items-center gap-3 p-3">
                                <span className="text-blue-500 text-xl">📍</span>
                                <span className="dark:text-slate-300">Chennai, India</span>
                            </div>
                            <div className="flex items-center gap-3 p-3">
                                <span className="text-blue-500 text-xl">🕒</span>
                                <span className="dark:text-slate-300">Mon – Fri, 9:00 AM – 6:00 PM IST</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Business & Partnership Card */}
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 dark:from-indigo-950 dark:to-slate-950 p-8 rounded-[2.5rem] shadow-xl text-white md:col-span-2 lg:col-span-1 relative overflow-hidden group transition-colors">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-3xl backdrop-blur-sm border border-white/10">
                                💼
                            </div>
                            <h2 className="text-2xl font-bold text-white">Partnership Opportunities</h2>
                        </div>
                        <p className="text-indigo-100 mb-6 leading-relaxed">
                            If you represent a school, college, NGO, EdTech company, or organization interested in integrating FeelEd AI into your curriculum, platform, or research program, we’d be happy to collaborate.
                        </p>
                        <div className="bg-white/10 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                            <p className="text-sm text-indigo-200 mb-2 uppercase tracking-wide font-bold">Email Subject Line:</p>
                            <p className="font-mono text-white mb-4">“Partnership with FeelEd AI”</p>
                            <a href="mailto:admin@feeledai.com?subject=Partnership with FeelEd AI" className="inline-flex items-center gap-2 bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg">
                                <span>✉️</span> Contact Partnerships
                            </a>
                        </div>
                    </div>
                </div>

                {/* Support & Tech Assistance - Full Width */}
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-8 rounded-[2.5rem] shadow-lg border border-emerald-100 dark:border-emerald-800 md:col-span-2 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-300">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-colors">
                                    🧠
                                </div>
                                <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-400 transition-colors">Support & Technical Assistance</h2>
                            </div>
                            <p className="text-emerald-800 dark:text-emerald-300 text-lg mb-6 max-w-2xl transition-colors">
                                If you’re facing issues with the app, dashboard, or user account, our support team is ready to assist you.
                            </p>
                            
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-800 shadow-sm transition-colors">
                                    <h3 className="font-bold text-emerald-900 dark:text-emerald-400 mb-2 transition-colors">Please Include:</h3>
                                    <ul className="space-y-2 text-emerald-700 dark:text-emerald-300 text-sm transition-colors">
                                        <li className="flex items-center gap-2">🔹 Your registered email</li>
                                        <li className="flex items-center gap-2">🔹 Device details (mobile/desktop)</li>
                                        <li className="flex items-center gap-2">🔹 Short description of the issue</li>
                                        <li className="flex items-center gap-2">🔹 Screenshots (if applicable)</li>
                                    </ul>
                                </div>
                                <div className="flex flex-col justify-center items-start space-y-4">
                                    <a href="mailto:admin@feeledai.com" className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 transition-colors border-b-2 border-emerald-200 dark:border-emerald-800 hover:border-emerald-500 dark:hover:border-emerald-600">
                                        admin@feeledai.com
                                    </a>
                                    <span className="inline-block px-4 py-2 bg-emerald-200 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 rounded-lg text-sm font-bold transition-colors">
                                        ⚡ Response time: 24–48 hours
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12 text-center">
                <button onClick={() => onNavigate('generator')} className="bg-slate-800 dark:bg-indigo-600 text-white font-bold py-3 px-8 rounded-full hover:bg-slate-900 dark:hover:bg-indigo-500 transition transform hover:scale-105 shadow-lg border-4 border-white dark:border-slate-800 ring-2 ring-slate-100 dark:ring-slate-800">
                    Back to Story Generator
                </button>
            </div>
        </div>
    );
};

export default Contact;
