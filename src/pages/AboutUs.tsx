
import React from 'react';
import { Page } from '../types';

interface AboutUsProps {
    onNavigate: (page: Page) => void;
}

const AboutUs: React.FC<AboutUsProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-3xl mx-auto px-6 py-10 text-slate-900 dark:text-slate-100">

            {/* Hero */}
            <div className="mb-10">
                <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">About FeelEd AI</h1>
                <p className="text-base text-slate-500 dark:text-slate-400 mb-6">AI-powered learning designed for Indian students.</p>
                <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
                    FeelEd AI is a multilingual AI learning platform designed to make education more engaging, adaptive, and emotionally supportive for students. By combining conversational AI, storytelling, exam preparation, and interactive learning experiences, FeelEd AI helps students learn in ways that feel more personal, relatable, and less intimidating.
                </p>
            </div>

            <hr className="border-slate-200 dark:border-slate-800 mb-10" />

            {/* Why We Built It */}
            <div className="mb-10">
                <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Why We Built FeelEd AI</h2>
                <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
                    Many students struggle not because they lack intelligence, but because learning often feels disconnected, stressful, or emotionally overwhelming. Traditional educational systems are designed to deliver information at scale, but they rarely adapt to how students actually experience learning. FeelEd AI explores a different approach — one where AI can support curiosity, confidence, storytelling, revision, and practice in a more human-centered way.
                </p>
            </div>

            <hr className="border-slate-200 dark:border-slate-800 mb-10" />

            {/* What We Offer */}
            <div className="mb-10">
                <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">What FeelEd AI Offers</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { icon: '📘', title: 'AI Chat Tutor', desc: 'Ask questions, understand concepts, and learn subjects conversationally in Tamil or English.' },
                        { icon: '✨', title: 'Story Mode', desc: 'Transform lessons into emotionally engaging stories that improve memory and understanding.' },
                        { icon: '🎮', title: 'Game Mode', desc: 'Practice core concepts through interactive educational games designed for mobile-first learners.' },
                        { icon: '📝', title: 'Exam Mode', desc: 'Prepare using real TN Board-style questions, mock tests, and AI-powered explanations.' },
                    ].map(card => (
                        <div key={card.title} className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-white dark:bg-slate-900">
                            <div className="text-2xl mb-3">{card.icon}</div>
                            <h3 className="font-semibold text-sm mb-2 text-slate-900 dark:text-white">{card.title}</h3>
                            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{card.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <hr className="border-slate-200 dark:border-slate-800 mb-10" />

            {/* What Makes Us Different */}
            <div className="mb-10">
                <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">What Makes FeelEd AI Different</h2>
                <ul className="space-y-2">
                    {[
                        'Designed for Indian students and multilingual learning',
                        'Built for mobile-first accessibility',
                        'Combines storytelling, practice, and conversational AI',
                        'Focuses on emotional engagement, not just information delivery',
                        'Supports Tamil and English learning experiences',
                        'Structured for low-friction student interaction',
                    ].map(item => (
                        <li key={item} className="flex items-start gap-3 text-base leading-relaxed text-slate-600 dark:text-slate-400">
                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>

            <hr className="border-slate-200 dark:border-slate-800 mb-10" />

            {/* Vision */}
            <div className="mb-10">
                <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Our Vision</h2>
                <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
                    We believe the future of education will not be defined only by intelligence, but by accessibility, emotional connection, and personalization. FeelEd AI aims to help create learning systems that feel less mechanical and more supportive — especially for students who often feel overlooked by traditional approaches.
                </p>
            </div>

            <hr className="border-slate-200 dark:border-slate-800 mb-10" />

            {/* Founder */}
            <div className="mb-10">
                <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Founder</h2>
                <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
                    FeelEd AI was founded by Velayutham S, an independent researcher and technology builder from Chennai, India. His work focuses on emotion-aware learning systems, multilingual AI experiences, and storytelling-driven educational design.
                </p>
                <button
                    onClick={() => onNavigate('founder')}
                    style={{ marginTop: '12px', padding: '8px 18px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: 'none', boxShadow: '0 4px 12px #4f46e530' }}
                >
                    Read Founder Story →
                </button>
            </div>

            <hr className="border-slate-200 dark:border-slate-800 mb-10" />

            {/* Ecosystem */}
            <div className="mb-10">
                <p className="text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-600 text-center mb-3">Ecosystem &amp; Startup Programs</p>
                <div className="flex flex-wrap justify-center gap-3">
                    {['NVIDIA Inception Program', 'Sarvam AI Startup Program'].map(label => (
                        <span key={label} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            {label}
                        </span>
                    ))}
                </div>
            </div>

            <hr className="border-slate-200 dark:border-slate-800 mb-10" />

            {/* CTA */}
            <div className="mb-10 text-center">
                <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Start Learning with FeelEd AI</h2>
                <button
                    onClick={() => onNavigate('home')}
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
                >
                    Open Learning App →
                </button>
            </div>

            {/* Footer note */}
            <p className="text-xs text-center text-slate-400 dark:text-slate-600">
                FeelEd AI is developed by Alteridea Web Services Private Limited, Chennai, India.
            </p>
        </div>
    );
};

export default AboutUs;
