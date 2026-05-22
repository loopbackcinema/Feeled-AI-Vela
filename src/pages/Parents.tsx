import React, { useState } from 'react';
import { Page } from '../types';

interface ParentsProps {
    onNavigate: (page: Page) => void;
}

const faqs = [
    {
        q: 'Does FeelEd AI replace teachers?',
        a: 'No. FeelEd AI is a supplemental learning tool designed to support students alongside their teachers and schools.',
    },
    {
        q: 'Does it work in Tamil?',
        a: 'Yes. FeelEd AI supports both Tamil and English learning experiences.',
    },
    {
        q: 'Does it store biometric data?',
        a: 'No. We do not collect facial recognition, biometric, or emotional scoring data.',
    },
    {
        q: 'Is it suitable for all grade levels?',
        a: 'Currently optimized for Grade 10 TN Samacheer students, with expansion planned for other grades.',
    },
];

const Parents: React.FC<ParentsProps> = ({ onNavigate }) => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <div className="w-full max-w-4xl mx-auto px-6 md:px-8 py-10 text-slate-900 dark:text-slate-100">

            {/* Hero */}
            <div className="mb-10">
                <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">For Parents</h1>
                <p className="text-base text-slate-500 dark:text-slate-400">
                    Learning experiences designed to feel more supportive, engaging, and accessible for students.
                </p>
            </div>

            <div className="space-y-10">

                {/* Section 1 */}
                <section>
                    <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">A Note to Parents</h2>
                    <div className="space-y-4 text-base leading-relaxed text-slate-600 dark:text-slate-400">
                        <p>
                            Every child learns differently. Some students learn quickly through explanations. Others learn better through stories, repetition, interaction, or practice. Many students also experience stress, hesitation, or loss of confidence while learning.
                        </p>
                        <p>
                            FeelEd AI was created to explore how AI-powered learning experiences can feel more engaging, approachable, and emotionally supportive for students — especially in multilingual and mobile-first environments.
                        </p>
                    </div>
                </section>

                <hr className="border-slate-200 dark:border-slate-800" />

                {/* Section 2 */}
                <section>
                    <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">What Is FeelEd AI?</h2>
                    <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400 mb-4">
                        FeelEd AI is a multilingual educational platform that combines conversational tutoring, storytelling, interactive learning, and exam practice into one learning experience.
                    </p>
                    <p className="text-base text-slate-600 dark:text-slate-400 mb-2">The platform is designed to help students:</p>
                    <ul className="space-y-1.5 mb-6">
                        {[
                            'Understand concepts more comfortably',
                            'Practice with less pressure',
                            'Stay engaged through stories and interaction',
                            'Learn in Tamil and English',
                        ].map(item => (
                            <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { icon: '📘', title: 'AI Tutor', desc: 'Ask questions and receive conversational explanations.' },
                            { icon: '✨', title: 'Story Mode', desc: 'Turn lessons into engaging educational stories.' },
                            { icon: '🎮', title: 'Game Mode', desc: 'Practice concepts through interactive activities.' },
                            { icon: '📝', title: 'Exam Mode', desc: 'Prepare using chapter-wise mock tests and revision tools.' },
                        ].map(card => (
                            <div key={card.title} className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-white dark:bg-slate-900">
                                <div className="text-2xl mb-2">{card.icon}</div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">{card.title}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <hr className="border-slate-200 dark:border-slate-800" />

                {/* Section 3 */}
                <section>
                    <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Our Approach to Learning</h2>
                    <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400 mb-3">
                        FeelEd AI explores how learning experiences can become more adaptive and less intimidating for students. Instead of focusing only on information delivery, the platform also considers:
                    </p>
                    <ul className="space-y-1.5">
                        {['Engagement', 'Pacing', 'Storytelling', 'Repetition', 'Student comfort during learning'].map(item => (
                            <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </section>

                <hr className="border-slate-200 dark:border-slate-800" />

                {/* Section 4 */}
                <section>
                    <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Safety & Privacy</h2>
                    <p className="text-base text-slate-600 dark:text-slate-400 mb-4">Student privacy and dignity are important to us.</p>
                    <ul className="space-y-2">
                        {[
                            'No biometric or facial recognition data collection',
                            'No emotional scoring or ranking of children',
                            'No selling of student data to advertisers',
                            'No profiling of students for marketing purposes',
                            'Teacher-guided and educationally focused interactions',
                        ].map(item => (
                            <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                                <span className="mt-1 text-green-600 dark:text-green-500 font-bold flex-shrink-0">✓</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </section>

                <hr className="border-slate-200 dark:border-slate-800" />

                {/* Section 5 */}
                <section>
                    <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Who FeelEd AI Is Designed For</h2>
                    <ul className="space-y-2">
                        {[
                            'Students needing extra revision support',
                            'Mobile-first learners',
                            'Multilingual learners',
                            'Students who learn better through stories or interaction',
                            'Classroom and home learning support',
                        ].map(item => (
                            <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                                <span className="mt-0.5 text-green-600 dark:text-green-500 font-bold flex-shrink-0">✓</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </section>

                <hr className="border-slate-200 dark:border-slate-800" />

                {/* Section 6 */}
                <section>
                    <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Important Clarifications</h2>
                    <div className="bg-amber-50 dark:bg-amber-950/50 border-l-4 border-amber-400 p-4 rounded">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">FeelEd AI is an educational technology platform.</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">It is not:</p>
                        <ul className="space-y-1">
                            {[
                                'A medical service',
                                'A mental health system',
                                'A psychological diagnostic tool',
                                'A replacement for teachers, parents, or schools',
                            ].map(item => (
                                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <hr className="border-slate-200 dark:border-slate-800" />

                {/* Section 7: FAQ */}
                <section>
                    <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Common Questions</h2>
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {faqs.map((faq, i) => (
                            <div key={i} className="py-4">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between text-left gap-4"
                                >
                                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{faq.q}</span>
                                    <span className="text-slate-400 dark:text-slate-600 flex-shrink-0 text-lg leading-none">
                                        {openFaq === i ? '−' : '+'}
                                    </span>
                                </button>
                                {openFaq === i && (
                                    <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{faq.a}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                <hr className="border-slate-200 dark:border-slate-800" />

                {/* Section 8: Closing */}
                <section className="text-center">
                    <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
                        We believe technology should make learning feel more approachable, inclusive, and engaging — especially for students who may feel overlooked by traditional learning systems.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => onNavigate('home')}
                            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
                        >
                            Explore FeelEd AI →
                        </button>
                        <button
                            onClick={() => onNavigate('pilot')}
                            className="inline-flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
                        >
                            Learn About Pilot Programs →
                        </button>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default Parents;
