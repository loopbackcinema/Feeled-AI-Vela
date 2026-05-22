
import React from 'react';
import { Page } from '../types';

interface ContactProps {
    onNavigate: (page: Page) => void;
}

const Contact: React.FC<ContactProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-5xl mx-auto px-6 md:px-8 py-10 text-slate-900 dark:text-slate-100">

            {/* Hero */}
            <div className="mb-10">
                <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Contact FeelEd AI</h1>
                <p className="text-base text-slate-500 dark:text-slate-400">
                    Questions, partnerships, support, or pilot collaborations — our team is here to help.
                </p>
            </div>

            {/* Desktop 2-col / Mobile stacked */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

                {/* Left: General Enquiries */}
                <div className="pb-8 lg:pb-0">
                    <h2 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">General Enquiries</h2>
                    <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400 mb-5">
                        For product questions, feedback, collaborations, media enquiries, or general support, you can contact the FeelEd AI team directly.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
                        <a href="mailto:admin@feeledai.com"
                            className="flex flex-col h-full gap-3 border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors group">
                            <span className="text-xl">📧</span>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wide mb-1">Email</p>
                                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 group-hover:underline break-all">admin@feeledai.com</p>
                            </div>
                        </a>
                        <div className="flex flex-col h-full gap-3 border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-white dark:bg-slate-900">
                            <span className="text-xl">📱</span>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wide mb-1">Phone</p>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">+91 90924 50286</p>
                            </div>
                        </div>
                        <div className="flex flex-col h-full gap-3 border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-white dark:bg-slate-900">
                            <span className="text-xl">📍</span>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wide mb-1">Location</p>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Chennai, Tamil Nadu, India</p>
                            </div>
                        </div>
                        <div className="flex flex-col h-full gap-3 border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-white dark:bg-slate-900">
                            <span className="text-xl">🕒</span>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wide mb-1">Support Hours</p>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Mon – Fri, 9:00 AM – 6:00 PM IST</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Partnerships + Technical Support */}
                <div className="flex flex-col gap-6">

                    {/* Partnerships */}
                    <div>
                        <h2 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">School & Partnership Collaborations</h2>
                        <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400 mb-4">
                            We collaborate with schools, educators, NGOs, EdTech organizations, and research initiatives exploring multilingual, AI-assisted, and emotionally supportive learning experiences.
                        </p>
                        <ul className="space-y-2 mb-4">
                            {[
                                'Pilot Programs',
                                'School Integrations',
                                'Research Collaborations',
                                'Accessibility & Inclusive Learning',
                                'Educational Content Partnerships',
                            ].map(item => (
                                <li key={item} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            For partnership discussions, please email:{' '}
                            <a href="mailto:admin@feeledai.com" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                                admin@feeledai.com
                            </a>
                        </p>
                    </div>

                    {/* Technical Support */}
                    <div>
                        <h2 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Technical Support</h2>
                        <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400 mb-4">
                            If you experience issues with login, stories, exam mode, dashboards, or app performance, our support team will assist you as quickly as possible.
                        </p>
                        <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-white dark:bg-slate-900 mb-3">
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Please include:</p>
                            <ul className="space-y-1.5">
                                {[
                                    'Your registered email address',
                                    'Device type (mobile or desktop)',
                                    'Short description of the issue',
                                    'Screenshots if available',
                                ].map(item => (
                                    <li key={item} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-500">Typical response time: 24–48 hours</p>
                    </div>
                </div>
            </div>

            <hr className="border-slate-200 dark:border-slate-800 mb-8" />

            {/* Company Info */}
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Company Information</h2>
                <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
                    FeelEd AI is developed by Alteridea Web Services Private Limited, Chennai, India.
                </p>
            </div>

            <hr className="border-slate-200 dark:border-slate-800 mb-8" />

            {/* CTA */}
            <div className="text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Building the future of AI-assisted learning for Indian students.
                </p>
                <button
                    onClick={() => onNavigate('home')}
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
                >
                    Open FeelEd AI →
                </button>
            </div>
        </div>
    );
};

export default Contact;
