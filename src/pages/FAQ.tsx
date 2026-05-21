import React, { useState } from 'react';

interface FAQProps {
    onNavigate: (path: string) => void;
}

const groups = [
    {
        id: 'general',
        label: 'General',
        items: [
            {
                q: 'What is FeelEd AI?',
                a: 'FeelEd AI is a multilingual AI-powered learning platform that combines conversational tutoring, storytelling, educational games, and exam preparation into one student-focused experience.',
            },
            {
                q: 'Who is FeelEd AI designed for?',
                a: 'FeelEd AI is designed for students, parents, teachers, schools, and learning communities looking for more engaging and accessible learning experiences.',
            },
            {
                q: 'Which subjects does FeelEd AI support?',
                a: 'Current support focuses on school-level learning including Science, Mathematics, Social Science, and chapter-wise educational content.',
            },
        ],
    },
    {
        id: 'features',
        label: 'Features',
        items: [
            {
                q: 'What is Story Mode?',
                a: 'Story Mode transforms educational concepts into engaging AI-generated stories designed to improve understanding, attention, and memory retention.',
            },
            {
                q: 'What is Exam Mode?',
                a: 'Exam Mode provides chapter-wise mock tests, revision tools, and AI-assisted explanations using curriculum-aligned question banks.',
            },
            {
                q: 'What is Game Mode?',
                a: 'Game Mode helps students practice concepts through interactive educational activities and mobile-friendly learning experiences.',
            },
            {
                q: 'Does FeelEd AI support Tamil?',
                a: 'Yes. FeelEd AI supports Tamil and English learning experiences, with future multilingual expansion planned.',
            },
        ],
    },
    {
        id: 'safety',
        label: 'Safety',
        items: [
            {
                q: 'Does FeelEd AI collect biometric or facial data?',
                a: 'No. FeelEd AI does not collect biometric data, facial recognition data, or advertising-based tracking information.',
            },
            {
                q: 'Does FeelEd AI replace teachers?',
                a: 'No. FeelEd AI is designed to support learning experiences and classroom engagement — not replace teachers, schools, or parents.',
            },
            {
                q: 'Does FeelEd AI diagnose emotions or mental health conditions?',
                a: 'No. FeelEd AI is an educational technology platform and not a medical, psychological, or diagnostic system.',
            },
        ],
    },
    {
        id: 'technical',
        label: 'Technical',
        items: [
            {
                q: 'Does FeelEd AI work on Android phones?',
                a: 'Yes. FeelEd AI is designed as a mobile-first platform and supports Android devices and modern web browsers.',
            },
            {
                q: 'Do I need to install an app?',
                a: 'No. FeelEd AI can be accessed through supported web browsers, and Android app support is also being expanded.',
            },
            {
                q: 'Is internet required?',
                a: 'Some features require an active internet connection for AI-assisted learning and content generation.',
            },
        ],
    },
    {
        id: 'schools',
        label: 'Schools',
        items: [
            {
                q: 'Can schools or teachers collaborate with FeelEd AI?',
                a: 'Yes. Schools, educators, NGOs, and learning organizations can participate through pilot programs and educational collaborations.',
            },
            {
                q: 'How can institutions join the Pilot Program?',
                a: 'Institutions can apply through the Pilot Program page or contact the FeelEd AI team directly for collaboration discussions.',
            },
        ],
    },
    {
        id: 'support',
        label: 'Support',
        items: [
            {
                q: 'How can I contact support?',
                a: 'You can contact the FeelEd AI team at: admin@feeledai.com',
            },
            {
                q: 'Can I delete my account or data?',
                a: 'Yes. Users may request account deletion or data removal by contacting FeelEd AI support.',
            },
        ],
    },
];

const FAQ: React.FC<FAQProps> = ({ onNavigate }) => {
    const [activeTab, setActiveTab] = useState('general');
    const [openItem, setOpenItem] = useState<string | null>(null);

    const activeGroup = groups.find(g => g.id === activeTab) ?? groups[0];

    const toggle = (key: string) => setOpenItem(prev => (prev === key ? null : key));

    return (
        <div className="w-full max-w-3xl mx-auto px-6 md:px-8 py-10 text-gray-900 dark:text-gray-100">

            {/* Hero */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Frequently Asked Questions</h1>
                <p className="text-base text-gray-500 dark:text-gray-400">
                    Answers to common questions about FeelEd AI, learning features, safety, and classroom usage.
                </p>
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 flex-wrap mb-8 border-b border-gray-200 dark:border-gray-800">
                {groups.map(g => (
                    <button
                        key={g.id}
                        onClick={() => { setActiveTab(g.id); setOpenItem(null); }}
                        className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                            activeTab === g.id
                                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                    >
                        {g.label}
                    </button>
                ))}
            </div>

            {/* Accordion */}
            <div className="divide-y divide-gray-100 dark:divide-gray-800 mb-12">
                {activeGroup.items.map((item, i) => {
                    const key = `${activeTab}-${i}`;
                    const isOpen = openItem === key;
                    return (
                        <div key={key} className="py-4">
                            <button
                                onClick={() => toggle(key)}
                                className="w-full flex items-center justify-between text-left gap-4"
                            >
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{item.q}</span>
                                <span className={`flex-shrink-0 text-lg leading-none font-medium transition-colors ${isOpen ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-600'}`}>
                                    {isOpen ? '−' : '+'}
                                </span>
                            </button>
                            {isOpen && (
                                <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{item.a}</p>
                            )}
                        </div>
                    );
                })}
            </div>

            <hr className="border-gray-200 dark:border-gray-800 mb-10" />

            {/* CTA */}
            <div className="text-center">
                <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Still Have Questions?</h2>
                <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
                    Our team is available for support, educational partnerships, and pilot collaboration enquiries.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => onNavigate('/contact')}
                        className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
                    >
                        Contact FeelEd AI →
                    </button>
                    <button
                        onClick={() => onNavigate('/pilot')}
                        className="inline-flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
                    >
                        Explore Pilot Program →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FAQ;
