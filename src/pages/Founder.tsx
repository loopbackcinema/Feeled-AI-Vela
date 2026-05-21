import React from 'react';
import { Page } from '../types';

interface FounderProps {
    onNavigate: (page: Page) => void;
}

const Founder: React.FC<FounderProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-3xl mx-auto px-6 md:px-8 py-10 text-gray-900 dark:text-gray-100">

            {/* Hero */}
            <div className="mb-10">
                <h1 className="text-3xl font-bold mb-1 text-gray-900 dark:text-white">Founder</h1>
            </div>

            {/* Photo + name */}
            <div className="flex flex-col items-center mb-10">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg ring-4 ring-indigo-50 dark:ring-indigo-900/20 mb-4 bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center relative group transition-colors">
                    <img
                        src="https://i.postimg.cc/LYm0CcTm/IMG-20260317-WA0028.jpg"
                        alt="Velayutham S"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Velayutham S</h2>
                <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Founder, FeelEd AI</p>
            </div>

            <div className="space-y-10">

                {/* Section 1 */}
                <section>
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">About the Founder</h2>
                    <div className="space-y-4 text-base leading-relaxed text-gray-600 dark:text-gray-400">
                        <p>
                            Velayutham S is the founder of FeelEd AI, a multilingual AI learning platform focused on conversational tutoring, storytelling, exam preparation, and mobile-first educational experiences for students.
                        </p>
                        <p>
                            Based in Chennai, India, his work focuses on educational AI systems, multilingual accessibility, student engagement, and story-based learning approaches designed for Indian learners.
                        </p>
                        <p>
                            Before FeelEd AI, he explored experimental projects related to interactive storytelling and adaptive media systems through initiatives such as Loopback Cinema Technologies.
                        </p>
                    </div>
                </section>

                <hr className="border-gray-200 dark:border-gray-800" />

                {/* Section 2 */}
                <section>
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Vision</h2>
                    <div className="space-y-4 text-base leading-relaxed text-gray-600 dark:text-gray-400">
                        <p>
                            FeelEd AI was created with a simple goal: to make learning more engaging, accessible, and approachable for students through AI-assisted educational experiences.
                        </p>
                        <p>
                            The platform combines conversational learning, storytelling, revision tools, and interactive modes into a unified educational environment designed for multilingual and mobile-first learners.
                        </p>
                    </div>
                </section>

                <hr className="border-gray-200 dark:border-gray-800" />

                {/* Section 3 */}
                <section>
                    <h2 className="text-xl font-bold mb-5 text-gray-900 dark:text-white">Focus Areas</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { icon: '📘', title: 'Educational AI', desc: 'AI-assisted tutoring and revision systems' },
                            { icon: '🌐', title: 'Multilingual Learning', desc: 'Tamil and English learning experiences' },
                            { icon: '✨', title: 'Story-Based Learning', desc: 'Interactive educational storytelling approaches' },
                            { icon: '📱', title: 'Mobile-First Accessibility', desc: 'Designed for accessible learning on everyday devices' },
                        ].map(card => (
                            <div key={card.title} className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 bg-white dark:bg-gray-900">
                                <div className="text-2xl mb-2">{card.icon}</div>
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">{card.title}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <hr className="border-gray-200 dark:border-gray-800" />

                {/* Section 4 */}
                <section>
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Research & Educational Interests</h2>
                    <p className="text-base text-gray-600 dark:text-gray-400 mb-3">Current areas of interest include:</p>
                    <ul className="space-y-1.5">
                        {[
                            'AI-assisted learning systems',
                            'Story-driven educational design',
                            'Multilingual educational experiences',
                            'Student engagement workflows',
                            'Inclusive and mobile-first learning environments',
                        ].map(item => (
                            <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </section>

                <hr className="border-gray-200 dark:border-gray-800" />

                {/* Section 5 */}
                <section>
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Contact</h2>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                            <span>📧</span>
                            <a href="mailto:founder@feeledai.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">founder@feeledai.com</a>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                            <span>🔗</span>
                            <a href="https://www.linkedin.com/in/velayutham-s-loopbackcinema" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">linkedin.com/in/velayutham-s-loopbackcinema</a>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                            <span>📍</span>
                            <span>Chennai, Tamil Nadu, India</span>
                        </div>
                    </div>
                </section>

                <hr className="border-gray-200 dark:border-gray-800" />

                {/* Footer note */}
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center pb-4">
                    FeelEd AI is being developed as a modern AI learning platform focused on accessibility, engagement, and multilingual education.
                </p>

            </div>
        </div>
    );
};

export default Founder;
