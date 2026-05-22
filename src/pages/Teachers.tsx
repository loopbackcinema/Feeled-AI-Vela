import React, { useState } from 'react';
import { Page } from '../types';

interface TeachersProps {
    onNavigate: (page: Page) => void;
}

const faqs = [
    {
        q: 'Can teachers control usage?',
        a: 'Yes. FeelEd AI is a supplemental tool that teachers can integrate at their discretion.',
    },
    {
        q: 'Does FeelEd AI replace teaching?',
        a: 'No. The platform is designed to support teachers, not replace them.',
    },
    {
        q: 'Can it support revision?',
        a: 'Yes. Exam Mode and Story Mode are specifically designed for concept revision and reinforcement.',
    },
    {
        q: 'Does it support Tamil learning?',
        a: 'Yes. FeelEd AI supports both Tamil and English learning experiences.',
    },
];

const Teachers: React.FC<TeachersProps> = ({ onNavigate }) => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <div className="w-full max-w-4xl mx-auto px-6 md:px-8 py-10 pb-[80px] text-slate-900 dark:text-slate-100">

            {/* Hero */}
            <div className="mb-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold uppercase tracking-widest mb-3 w-fit">
                    👩‍🏫 For <span className="text-indigo-600 dark:text-indigo-400">Teachers</span>
                </span>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-2 text-slate-900 dark:text-white">For <span className="text-indigo-600 dark:text-indigo-400">Teachers</span></h1>
                <p className="text-base text-slate-500 dark:text-slate-400">
                    AI-assisted learning experiences designed to support classroom engagement, storytelling, revision, and student participation.
                </p>
            </div>

            <div className="space-y-10">

                {/* Section 1 */}
                <section>
                    <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">A Note to Teachers</h2>
                    <div className="space-y-4 text-base leading-relaxed text-slate-600 dark:text-slate-400">
                        <p>
                            Teaching is more than delivering lessons. Teachers continuously adapt to different learning speeds, attention levels, classroom energy, and student confidence. Every classroom is dynamic, and no two students learn in exactly the same way.
                        </p>
                        <p>
                            FeelEd AI was designed with a simple principle: technology should support teachers and learning experiences — not replace human judgment or classroom relationships.
                        </p>
                    </div>
                </section>

                <hr className="border-slate-200 dark:border-slate-800" />

                {/* Section 2 */}
                <section>
                    <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">What Is FeelEd AI?</h2>
                    <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400 mb-3">
                        FeelEd AI is a multilingual educational platform that combines conversational tutoring, storytelling, interactive learning, and exam practice into one learning experience.
                    </p>
                    <p className="text-base text-slate-600 dark:text-slate-400 mb-2">
                        The platform is designed to help students engage more actively through:
                    </p>
                    <ul className="space-y-1.5 mb-6">
                        {[
                            'Conversational explanations',
                            'Story-based learning',
                            'Gamified practice',
                            'Chapter-wise revision tools',
                        ].map(item => (
                            <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { icon: '📘', title: 'AI Tutor', desc: 'Support concept clarification and revision conversations.', accent: 'rounded-xl p-5 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50' },
                            { icon: '✨', title: 'Story Mode', desc: 'Transform lessons into engaging educational narratives.', accent: 'rounded-xl p-5 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/50' },
                            { icon: '🎮', title: 'Game Mode', desc: 'Encourage participation through interactive learning.', accent: 'rounded-xl p-5 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/50' },
                            { icon: '📝', title: 'Exam Mode', desc: 'Provide chapter-wise mock tests and AI-assisted explanations.', accent: 'rounded-xl p-5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50' },
                        ].map(card => (
                            <div key={card.title} className={card.accent}>
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
                    <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">How FeelEd AI Can Support Classrooms</h2>
                    <ul className="space-y-2">
                        {[
                            'Revision support for difficult concepts',
                            'Reinforcement through storytelling',
                            'Practice support for exam preparation',
                            'Multilingual accessibility for learners',
                            'Additional engagement for hesitant students',
                            'Mobile-friendly learning outside classrooms',
                        ].map(item => (
                            <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                                <span className="mt-0.5 text-green-600 dark:text-green-500 font-bold flex-shrink-0">✓</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </section>

                <hr className="border-slate-200 dark:border-slate-800" />

                {/* Section 4 */}
                <section>
                    <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Important Clarifications</h2>
                    <p className="text-base text-slate-600 dark:text-slate-400 mb-4">
                        FeelEd AI is designed as a supplemental educational platform.
                    </p>
                    <div className="bg-amber-50 dark:bg-amber-950/50 border-l-4 border-amber-400 p-4 rounded">
                        <ul className="space-y-1.5">
                            {[
                                'It does not replace teachers',
                                'It does not automate classroom decisions',
                                'It does not diagnose learning or behavioral conditions',
                                'It does not assign emotional labels to students',
                                'It does not collect biometric or facial recognition data',
                            ].map(item => (
                                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <hr className="border-slate-200 dark:border-slate-800" />

                {/* Section 5 */}
                <section>
                    <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Teachers Remain Central</h2>
                    <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
                        Teachers provide context, guidance, discussion, encouragement, and human understanding that technology cannot replace. FeelEd AI is intended to act as a supportive educational layer that teachers may choose to integrate into revision, storytelling, engagement, or practice workflows.
                    </p>
                </section>

                <hr className="border-slate-200 dark:border-slate-800" />

                {/* Section 6 */}
                <section>
                    <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Pilot Collaborations</h2>
                    <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400 mb-4">
                        Schools, educators, NGOs, and learning initiatives can collaborate with FeelEd AI through guided pilot programs focused on multilingual, mobile-first, and adaptive educational experiences.
                    </p>
                    <ul className="space-y-2">
                        {[
                            'Early access to educational features',
                            'Participation in product feedback',
                            'Classroom experimentation support',
                            'Insight into learning engagement patterns',
                            'Collaborative educational research opportunities',
                        ].map(item => (
                            <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
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
                        We believe educational technology should reduce friction, improve engagement, and support teachers in creating more accessible learning experiences for students.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => onNavigate('pilot')}
                            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
                        >
                            Explore Pilot Programs →
                        </button>
                        <button
                            onClick={() => onNavigate('contact')}
                            className="inline-flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
                        >
                            Contact FeelEd AI →
                        </button>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default Teachers;
