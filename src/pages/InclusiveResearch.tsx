import React from 'react';

interface InclusiveResearchProps {
    onNavigate: (page: string) => void;
}

const InclusiveResearch: React.FC<InclusiveResearchProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-3xl mx-auto px-6 md:px-8 py-10 text-slate-900 dark:text-slate-100">

            {/* Hero */}
            <div className="mb-10">
                <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Inclusive Learning Research</h1>
                <p className="text-base text-slate-500 dark:text-slate-400">
                    Exploring multilingual and accessible learning experiences for diverse student needs.
                </p>
            </div>

            <div className="space-y-10">

                {/* Intro */}
                <section>
                    <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
                        FeelEd AI is exploring how storytelling, conversational learning, and accessible educational design can support students with different learning and communication needs. This initiative focuses on accessibility, multilingual interaction, and inclusive educational experiences across mobile-first environments.
                    </p>
                </section>

                <hr className="border-slate-200 dark:border-slate-800" />

                {/* Section 1 */}
                <section>
                    <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Why Inclusive Learning Matters</h2>
                    <div className="space-y-4 text-base leading-relaxed text-slate-600 dark:text-slate-400">
                        <p>
                            Many digital learning systems are designed around standard reading, audio, or interaction assumptions. This can create accessibility barriers for learners with different communication or sensory needs.
                        </p>
                        <p>
                            FeelEd AI is exploring ways to make educational experiences more flexible, descriptive, and accessible across different learning contexts.
                        </p>
                    </div>
                </section>

                <hr className="border-slate-200 dark:border-slate-800" />

                {/* Section 2 */}
                <section>
                    <h2 className="text-xl font-bold mb-5 text-slate-900 dark:text-white">Areas of Exploration</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-6 bg-white dark:bg-slate-900">
                            <div className="text-2xl mb-3">👁️</div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Blind & Low-Vision Accessibility</p>
                            <ul className="space-y-1.5">
                                {[
                                    'Audio-supported storytelling',
                                    'Descriptive educational narration',
                                    'Voice-first interaction exploration',
                                    'Accessible mobile learning workflows',
                                ].map(item => (
                                    <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-6 bg-white dark:bg-slate-900">
                            <div className="text-2xl mb-3">👂</div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Deaf & Hard-of-Hearing Accessibility</p>
                            <ul className="space-y-1.5">
                                {[
                                    'Caption-friendly educational interfaces',
                                    'Visual learning rhythm and pacing',
                                    'Text-first interaction support',
                                    'Accessible storytelling structures',
                                ].map(item => (
                                    <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                <hr className="border-slate-200 dark:border-slate-800" />

                {/* Section 3 */}
                <section>
                    <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Responsible Research Principles</h2>
                    <div className="bg-amber-50 dark:bg-amber-950/50 border-l-4 border-amber-400 p-4 rounded">
                        <ul className="space-y-1.5">
                            {[
                                'No biometric or facial recognition data collection',
                                'No medical or clinical claims',
                                'Teacher-guided educational usage',
                                'Guardian involvement where appropriate',
                                'Privacy-focused accessibility research',
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

                {/* Section 4 */}
                <section>
                    <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Collaboration</h2>
                    <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400 mb-6">
                        We welcome collaboration with educators, accessibility advocates, inclusive learning facilitators, and organizations interested in accessible educational technology.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => onNavigate('/contact')}
                            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
                        >
                            Contact FeelEd AI →
                        </button>
                        <button
                            onClick={() => onNavigate('/pilot')}
                            className="inline-flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
                        >
                            Explore Pilot Program →
                        </button>
                    </div>
                </section>

                <hr className="border-slate-200 dark:border-slate-800" />

                {/* Footer note */}
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center pb-4">
                    FeelEd AI is committed to building more inclusive and accessible educational experiences for diverse learners.
                </p>

            </div>
        </div>
    );
};

export default InclusiveResearch;
