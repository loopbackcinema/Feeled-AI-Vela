
import React from 'react';
import { Page } from '../types';

interface PrivacyPolicyProps {
    onNavigate: (page: Page) => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-lg border border-slate-200 animate-fade-in">
            <h1 className="text-3xl font-bold text-blue-600 mb-2 text-center">Privacy Policy — FeelEd AI</h1>
            <p className="text-center text-slate-500 text-sm mb-8">Last updated: October 2025</p>

            <div className="space-y-6 text-slate-700 text-sm leading-relaxed">
                 <p>Your privacy matters to us. This Privacy Policy explains how FeelEd AI (“we,” “our,” or “us”) collects, uses, and protects your personal information when you use our mobile app, website, or services.</p>
                <div>
                    <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
                    <p>We only collect minimal data needed to deliver and improve our service. This includes information you provide (name, email, preferences) and information we automatically collect (anonymous usage analytics).</p>
                </div>
                <div>
                    <h2 className="text-xl font-semibold mb-2">2. How We Use Your Information</h2>
                    <p>We use collected information to provide personalized experiences, maintain and improve our features, respond to support queries, and ensure platform security. We do not sell, rent, or share your data with advertisers.</p>
                </div>
                 <div>
                    <h2 className="text-xl font-semibold mb-2">3. Data Storage & Security</h2>
                    <p>Your information is stored securely on trusted servers with end-to-end encryption. We take reasonable measures to protect your data against loss, theft, or unauthorized access.</p>
                </div>
                <div>
                    <h2 className="text-xl font-semibold mb-2">4. Your Rights</h2>
                    <p>You can access, update, or request deletion of your account and data at any time. For any data-related request, please contact us at <a href="mailto:feeledai@gmail.com" className="text-blue-600 hover:underline">feeledai@gmail.com</a>.</p>
                </div>
                 <div>
                    <h2 className="text-xl font-semibold mb-2">5. Children’s Privacy</h2>
                    <p>FeelEd AI is designed for learners aged 13+ with teacher or guardian guidance. We do not knowingly collect information from children under 13 without parental consent.</p>
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

export default PrivacyPolicy;
