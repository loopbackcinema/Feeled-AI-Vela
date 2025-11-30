
import React from 'react';
import { Page } from '../types';

interface ContactProps {
    onNavigate: (page: Page) => void;
}

const Contact: React.FC<ContactProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-5xl mx-auto animate-fade-in pb-12">
            {/* Header Section */}
            <div className="text-center space-y-4 py-8 mb-4">
                <div className="inline-block p-3 rounded-2xl bg-blue-100 text-blue-600 mb-2 shadow-sm animate-bounce-slow">
                    <span className="text-4xl">📬</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-slate-800 tracking-tight">
                    Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Us</span>
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
                    We’d love to hear from you. Whether you have a question, need support, or want to collaborate, our team is here to help.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* General Enquiries Card */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-blue-100 hover:border-blue-300 transition-all duration-300 group hover:-translate-y-1 md:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                            📞
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">General Enquiries</h2>
                    </div>
                    <div className="space-y-4 text-slate-600 text-lg">
                        <p>For questions, support, suggestions, or feedback:</p>
                        
                        <div className="space-y-3 mt-4">
                            <a href="mailto:contact@feeledai.com" className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100">
                                <span className="text-blue-500 text-xl">📧</span>
                                <span className="font-semibold text-slate-700">contact@feeledai.com</span>
                            </a>
                            <a href="tel:+919092450286" className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100">
                                <span className="text-blue-500 text-xl">📱</span>
                                <span className="font-semibold text-slate-700">+91 90924 50286</span>
                            </a>
                            <div className="flex items-center gap-3 p-3">
                                <span className="text-blue-500 text-xl">📍</span>
                                <span>Chennai, India</span>
                            </div>
                            <div className="flex items-center gap-3 p-3">
                                <span className="text-blue-500 text-xl">🕒</span>
                                <span>Mon – Fri, 9:00 AM – 6:00 PM IST</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Business & Partnership Card */}
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white md:col-span-2 lg:col-span-1 relative overflow-hidden group">
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
                            <a href="mailto:contact@feeledai.com?subject=Partnership with FeelEd AI" className="inline-flex items-center gap-2 bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg">
                                <span>✉️</span> Contact Partnerships
                            </a>
                        </div>
                    </div>
                </div>

                {/* Support & Tech Assistance - Full Width */}
                <div className="bg-emerald-50 p-8 rounded-[2.5rem] shadow-lg border border-emerald-100 md:col-span-2 hover:border-emerald-300 transition-all duration-300">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                                    🧠
                                </div>
                                <h2 className="text-2xl font-bold text-emerald-900">Support & Technical Assistance</h2>
                            </div>
                            <p className="text-emerald-800 text-lg mb-6 max-w-2xl">
                                If you’re facing issues with the app, dashboard, or user account, our support team is ready to assist you.
                            </p>
                            
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm">
                                    <h3 className="font-bold text-emerald-900 mb-2">Please Include:</h3>
                                    <ul className="space-y-2 text-emerald-700 text-sm">
                                        <li className="flex items-center gap-2">🔹 Your registered email</li>
                                        <li className="flex items-center gap-2">🔹 Device details (mobile/desktop)</li>
                                        <li className="flex items-center gap-2">🔹 Short description of the issue</li>
                                        <li className="flex items-center gap-2">🔹 Screenshots (if applicable)</li>
                                    </ul>
                                </div>
                                <div className="flex flex-col justify-center items-start space-y-4">
                                    <a href="mailto:contact@feeledai.com" className="text-2xl font-bold text-emerald-700 hover:text-emerald-900 transition-colors border-b-2 border-emerald-200 hover:border-emerald-500">
                                        contact@feeledai.com
                                    </a>
                                    <span className="inline-block px-4 py-2 bg-emerald-200 text-emerald-800 rounded-lg text-sm font-bold">
                                        ⚡ Response time: 24–48 hours
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12 text-center">
                <button onClick={() => onNavigate('generator')} className="bg-slate-800 text-white font-bold py-3 px-8 rounded-full hover:bg-slate-900 transition transform hover:scale-105 shadow-lg border-4 border-white ring-2 ring-slate-100">
                    Back to Story Generator
                </button>
            </div>
        </div>
    );
};

export default Contact;
