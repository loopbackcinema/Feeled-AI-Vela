import React from 'react';
import { Page } from '../types';

const Contact: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-xl border border-slate-100 animate-fade-in">
            <h1 className="text-3xl font-black text-blue-600 mb-6 text-center">Contact Us</h1>
            <div className="space-y-6 text-center text-slate-700 font-semibold">
                <p>Have questions or feedback? We'd love to hear from you.</p>
                <div>
                    <p className="text-sm text-slate-400 mb-1">EMAIL</p>
                    <p className="text-lg">feeledai@gmail.com</p>
                </div>
                <div>
                    <p className="text-sm text-slate-400 mb-1">PHONE</p>
                    <p className="text-lg">+91 90924 50286</p>
                </div>
            </div>
            <div className="mt-12 text-center">
                <button onClick={() => onNavigate('generator')} className="text-blue-600 font-bold hover:underline">Back to Generator</button>
            </div>
        </div>
    );
};

export default Contact;