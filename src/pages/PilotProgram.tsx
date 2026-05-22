
import React, { useState } from 'react';
import { Page } from '../types';

interface PilotProgramProps {
    onNavigate: (page: Page) => void;
}

const faqs = [
    {
        q: 'Is this a paid program?',
        a: 'Pilot structure varies by collaboration. Contact us to discuss your institution\'s needs.',
    },
    {
        q: 'Can schools customize usage?',
        a: 'Yes. Pilot programs are structured around the institution\'s learning goals and classroom context.',
    },
    {
        q: 'Are teachers required to change curriculum?',
        a: 'No. FeelEd AI is a supplemental tool — teachers retain full control over curriculum and classroom decisions.',
    },
    {
        q: 'Does FeelEd AI replace teachers?',
        a: 'No. The platform is designed to support teachers, not replace them.',
    },
];

const steps = [
    {
        num: '01',
        title: 'Setup',
        desc: 'Institution onboarding and guided setup of FeelEd AI learning modules.',
    },
    {
        num: '02',
        title: 'Classroom Usage',
        desc: 'Teachers and students use selected learning features such as Story Mode, Exam Mode, and AI-assisted tutoring.',
    },
    {
        num: '03',
        title: 'Feedback & Observation',
        desc: 'Participating educators share observations, classroom insights, and practical feedback.',
    },
    {
        num: '04',
        title: 'Collaborative Improvement',
        desc: 'The FeelEd AI team refines educational workflows based on pilot findings and institutional collaboration.',
    },
];

const participants = [
    { icon: '🏫', label: 'Schools & Learning Centers' },
    { icon: '👩‍🏫', label: 'Teachers & Educators' },
    { icon: '🤝', label: 'NGOs & Educational Foundations' },
    { icon: '🧩', label: 'Inclusive Learning Facilitators' },
    { icon: '🔬', label: 'Educational Researchers' },
];

const PilotProgram: React.FC<PilotProgramProps> = ({ onNavigate }) => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <div className="w-full max-w-4xl mx-auto px-6 md:px-8 py-10 pb-[80px] text-slate-900 dark:text-slate-100">

            {/* Hero */}
            <div className="mb-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold uppercase tracking-widest mb-3 w-fit">
                    🚀 Pilot <span className="text-indigo-600 dark:text-indigo-400">Program</span>
                </span>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-2 text-slate-900 dark:text-white">Pilot <span className="text-indigo-600 dark:text-indigo-400">Program</span></h1>
                <p className="text-base text-slate-500 dark:text-slate-400">
                    Collaborating with schools, educators, and learning communities to explore AI-assisted learning experiences in real classrooms.
                </p>
            </div>

            <div className="space-y-10">

                {/* Section 1 */}
                <section>
                    <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Purpose of the Pilot Program</h2>
                    <div className="space-y-4 text-base leading-relaxed text-slate-600 dark:text-slate-400">
                        <p>
                            The FeelEd AI Pilot Program is designed to help educators, schools, and learning organizations explore how AI-assisted storytelling, conversational learning, and interactive educational experiences can support student engagement and revision workflows.
                        </p>
                        <p>
                            The pilot is intended as a collaborative educational initiative — allowing teachers, students, and institutions to provide practical feedback in real learning environments before wider scale adoption.
                        </p>
                    </div>
                </section>

                <hr className="border-slate-200 dark:border-slate-800" />

                {/* Section 2 */}
                <section>
                    <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Why We Are Running Pilot Programs</h2>
                    <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400 mb-5">
                        Classrooms are diverse, multilingual, and constantly changing. Students learn through different speeds, formats, and levels of participation. Rather than building educational technology in isolation, FeelEd AI works directly with educators and institutions to understand what is genuinely useful in real classrooms.
                    </p>
                    <ul className="space-y-2">
                        {[
                            'Test AI-assisted learning in classroom settings',
                            'Gather practical teacher and student feedback',
                            'Improve multilingual and mobile-first learning workflows',
                            'Understand engagement patterns across different learners',
                            'Refine educational tools responsibly before scaling',
                        ].map(item => (
                            <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                                <span className="mt-0.5 text-green-600 dark:text-green-500 font-bold flex-shrink-0">✓</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </section>

                <hr className="border-slate-200 dark:border-slate-800" />

                {/* Section 3 */}
                <section>
                    <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Who Can Participate</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {participants.map(p => (
                            <div key={p.label} className="flex flex-col items-center text-center gap-2 border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-800/60">
                                <span className="text-2xl">{p.icon}</span>
                                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-snug">{p.label}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <hr className="border-slate-200 dark:border-slate-800" />

                {/* Section 4 */}
                <section>
                    <h2 className="text-xl font-bold mb-5 text-slate-900 dark:text-white">How the Pilot Works</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {steps.map(step => (
                            <div key={step.num} className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-slate-50 dark:bg-slate-800/60">
                                <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-black mb-3">
                                    {step.num}
                                </div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">{step.title}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <hr className="border-slate-200 dark:border-slate-800" />

                {/* Section 5 */}
                <section>
                    <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Responsible Use & Student Safety</h2>
                    <p className="text-base text-slate-600 dark:text-slate-400 mb-4">
                        Student safety, privacy, and responsible educational use are important parts of the pilot program.
                    </p>
                    <div className="bg-amber-50 dark:bg-amber-950/50 border-l-4 border-amber-400 p-4 rounded">
                        <ul className="space-y-1.5">
                            {[
                                'No biometric or facial recognition data collection',
                                'No emotional grading or student profiling',
                                'No advertising-based student tracking',
                                'Teacher-guided educational participation',
                                'Privacy-focused learning interactions',
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

                {/* Section 6 */}
                <section>
                    <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">What Participating Institutions Receive</h2>
                    <ul className="space-y-2">
                        {[
                            'Early access to FeelEd AI educational features',
                            'Pilot collaboration opportunities',
                            'Direct product feedback channels',
                            'Support for multilingual learning workflows',
                            'Participation in future educational research initiatives',
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

                {/* Section 8: Apply CTA */}
                <section className="text-center">
                    <h2 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Interested in Participating?</h2>
                    <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
                        We welcome collaboration with institutions aligned with responsible, student-focused, and inclusive educational innovation.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <a
                            href="mailto:admin@feeledai.com"
                            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
                        >
                            Apply for Pilot Program →
                        </a>
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

export default PilotProgram;
