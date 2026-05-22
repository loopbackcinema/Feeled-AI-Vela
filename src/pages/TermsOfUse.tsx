
import React from 'react';
import { Page } from '../types';

interface TermsOfUseProps {
    onNavigate: (page: Page) => void;
}

const TermsOfUse: React.FC<TermsOfUseProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-3xl mx-auto px-6 py-10 text-slate-900 dark:text-slate-100">

            {/* Hero */}
            <div className="mb-10">
                <h1 className="text-3xl font-bold mb-1 text-slate-900 dark:text-white">Terms of Use</h1>
                <p className="text-sm text-slate-500 dark:text-slate-500 mb-5">Last Updated: May 2026</p>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    Welcome to FeelEd AI. These Terms of Use ("Terms") govern your access to and use of FeelEd AI applications, websites, educational features, and related services operated by Alteridea Web Services Private Limited ("FeelEd AI," "we," "our," or "us"). By accessing or using FeelEd AI, you agree to these Terms.
                </p>
            </div>

            <div className="space-y-0">

                {/* Section 1 */}
                <section className="border-b border-slate-100 dark:border-slate-800 pb-8 mb-8">
                    <h2 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">1. Eligibility</h2>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        FeelEd AI is intended for educational use by students, parents, teachers, and institutions. Users under applicable minimum age requirements should access the platform with guidance from a parent, guardian, teacher, or educational institution where appropriate.
                    </p>
                </section>

                {/* Section 2 */}
                <section className="border-b border-slate-100 dark:border-slate-800 pb-8 mb-8">
                    <h2 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">2. Educational Purpose</h2>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        FeelEd AI is designed to support learning, practice, storytelling, and educational engagement. The platform is intended as a supplemental educational tool and does not replace teachers, schools, formal instruction, professional tutoring, psychological care, or medical advice.
                    </p>
                </section>

                {/* Section 3 */}
                <section className="border-b border-slate-100 dark:border-slate-800 pb-8 mb-8">
                    <h2 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">3. User Accounts</h2>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        Users are responsible for maintaining the confidentiality of their account credentials and for activities associated with their accounts. FeelEd AI reserves the right to suspend or restrict accounts involved in misuse, abuse, or activities that compromise platform integrity or user safety.
                    </p>
                </section>

                {/* Section 4 */}
                <section className="border-b border-slate-100 dark:border-slate-800 pb-8 mb-8">
                    <h2 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">4. Acceptable Use</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Users agree not to:</p>
                    <ul className="space-y-1.5">
                        {[
                            'Misuse or disrupt the platform',
                            'Upload harmful, abusive, or illegal content',
                            'Attempt unauthorized access to systems or accounts',
                            'Use automated scraping or reverse-engineering tools',
                            'Use FeelEd AI for unlawful activities',
                        ].map(item => (
                            <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Section 5 */}
                <section className="border-b border-slate-100 dark:border-slate-800 pb-8 mb-8">
                    <h2 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">5. AI-Generated Educational Content</h2>
                    <div className="bg-amber-50 dark:bg-amber-950/50 border-l-4 border-amber-500 p-4 rounded">
                        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                            FeelEd AI uses AI systems to generate explanations, stories, educational suggestions, and learning interactions. AI-generated responses may occasionally contain inaccuracies, incomplete information, or unintended outputs. Users should apply appropriate judgment and consult educators or verified academic resources when necessary.
                        </p>
                    </div>
                </section>

                {/* Section 6 */}
                <section className="border-b border-slate-100 dark:border-slate-800 pb-8 mb-8">
                    <h2 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">6. Privacy</h2>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        Use of FeelEd AI is also governed by the{' '}
                        <button
                            onClick={() => onNavigate('privacy')}
                            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                        >
                            FeelEd AI Privacy Policy
                        </button>
                        , which explains how information is collected, used, and protected.
                    </p>
                </section>

                {/* Section 7 */}
                <section className="border-b border-slate-100 dark:border-slate-800 pb-8 mb-8">
                    <h2 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">7. Intellectual Property</h2>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        FeelEd AI branding, interface design, educational systems, software, and related materials are protected under applicable intellectual property laws. Users may not reproduce, redistribute, or commercially exploit platform content without authorization.
                    </p>
                </section>

                {/* Section 8 */}
                <section className="border-b border-slate-100 dark:border-slate-800 pb-8 mb-8">
                    <h2 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">8. Platform Availability</h2>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        We continuously improve FeelEd AI and may modify, update, suspend, or discontinue features at any time without prior notice.
                    </p>
                </section>

                {/* Section 9 */}
                <section className="border-b border-slate-100 dark:border-slate-800 pb-8 mb-8">
                    <h2 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">9. Limitation of Liability</h2>
                    <div className="bg-amber-50 dark:bg-amber-950/50 border-l-4 border-amber-500 p-4 rounded">
                        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                            FeelEd AI is provided on an "as available" basis. While we aim to provide reliable educational experiences, we do not guarantee uninterrupted availability, complete accuracy, or error-free operation. To the maximum extent permitted by law, FeelEd AI and Alteridea Web Services Private Limited shall not be liable for indirect, incidental, or consequential damages arising from platform use.
                        </p>
                    </div>
                </section>

                {/* Section 10 */}
                <section className="border-b border-slate-100 dark:border-slate-800 pb-8 mb-8">
                    <h2 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">10. Updates to These Terms</h2>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        These Terms may be updated periodically to reflect operational, legal, or product changes. Continued use of FeelEd AI after updates constitutes acceptance of the revised Terms.
                    </p>
                </section>

                {/* Section 11 */}
                <section className="pb-8 mb-8">
                    <h2 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">11. Contact Information</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">For questions regarding these Terms:</p>
                    <p className="text-sm mb-1">
                        <a href="mailto:admin@feeledai.com" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                            admin@feeledai.com
                        </a>
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Chennai, Tamil Nadu, India</p>
                </section>

            </div>

            {/* Footer note */}
            <p className="text-xs text-center text-slate-400 dark:text-slate-600 pt-8 border-t border-slate-200 dark:border-slate-800">
                FeelEd AI is developed by Alteridea Web Services Private Limited.
            </p>
        </div>
    );
};

export default TermsOfUse;
