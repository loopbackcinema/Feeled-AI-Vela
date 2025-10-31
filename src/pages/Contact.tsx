import React from 'react';
import { Page } from '../types';

interface ContactProps {
    onNavigate: (page: Page) => void;
}

const Contact: React.FC<ContactProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-lg border border-slate-200 animate-fade-in">
            <h1 className="text-3xl font-bold text-blue-600 mb-4 text-center">Contact Us — FeelEd AI</h1>
            <p className="text-center text-slate-500 text-lg mb-8">We’d love to hear from you!</p>

            <div className="space-y-6 text-slate-700">
                <div>
                    <h2 className="text-2xl font-semibold mb-2">📞 General Enquiries</h2>
                    <p>For questions, support, or feedback, reach us anytime.</p>
                    <p className="mt-2">📧 Email: <a href="mailto:feeledai@gmail.com" className="text-blue-600 hover:underline">feeledai@gmail.com</a></p>
                    <p>📞 Phone: +91 90924 50286</p>
                    <p>📍 Location: Chennai, India</p>
                    <p>🕒 Working Hours: Monday – Friday, 9:00 AM – 6:00 PM IST</p>
                </div>
                <div>
                    <h2 className="text-2xl font-semibold mb-2">💼 Business & Partnership Opportunities</h2>
                    <p>If you represent a school, college, or organization interested in using FeelEd AI in your curriculum or platform, please email us with the subject line "Partnership with FeelEd AI".</p>
                </div>
                 <div>
                    <h2 className="text-2xl font-semibold mb-2">🧠 Support & Technical Help</h2>
                    <p>Need assistance with the app or your account? Send your queries to <a href="mailto:feeledai@gmail.com" className="text-blue-600 hover:underline">feeledai@gmail.com</a>. Please include your registered email and a short description of your issue — we’ll get back to you within 24–48 hours.</p>
                </div>
            </div>
             <div className="mt-8 text-center">
                <button onClick={() => onNavigate('generator')} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition">
                    Back to Story Generator
                </button>
            </div>
        </div>
    );
};

export default Contact;
