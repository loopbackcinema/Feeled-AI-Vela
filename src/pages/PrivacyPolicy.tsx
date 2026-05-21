
import React from 'react';
import { Page } from '../types';

interface PrivacyPolicyProps {
    onNavigate: (page: Page) => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-3xl mx-auto px-6 py-10 text-gray-900 dark:text-gray-100">

            {/* Hero */}
            <div className="mb-10">
                <h1 className="text-3xl font-bold mb-1 text-gray-900 dark:text-white">Privacy Policy</h1>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-5">Last Updated: May 2026</p>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    FeelEd AI ("FeelEd," "we," "our," or "us") is committed to protecting user privacy and maintaining safe, responsible educational experiences. This Privacy Policy explains how information is collected, used, stored, and protected when using FeelEd AI applications, websites, and related services.
                </p>
            </div>

            <div className="space-y-10">

                {/* Section 1 */}
                <section>
                    <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">1. Information We Collect</h2>
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 mb-5">
                        We collect limited information necessary to provide educational features, account access, platform security, and service improvements.
                    </p>

                    <div className="space-y-5">
                        <div>
                            <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">1.1 Information Provided by Users</h3>
                            <ul className="space-y-1.5">
                                {[
                                    'Name and profile information',
                                    'Email address',
                                    'Learning preferences (language, grade, subjects)',
                                    'Messages or support requests',
                                    'Account authentication details',
                                ].map(item => (
                                    <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">1.2 Automatically Collected Information</h3>
                            <ul className="space-y-1.5">
                                {[
                                    'Device and browser information',
                                    'App performance and diagnostic logs',
                                    'Anonymous usage analytics',
                                    'Session activity related to learning features',
                                ].map(item => (
                                    <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">1.3 Information We Do Not Collect</h3>
                            <ul className="space-y-1.5">
                                {[
                                    'Financial or payment information',
                                    'Facial recognition data',
                                    'Biometric identification data',
                                    'Persistent audio recordings',
                                    'Advertising tracking data across third-party websites',
                                ].map(item => (
                                    <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                <hr className="border-gray-200 dark:border-gray-800" />

                {/* Section 2 */}
                <section>
                    <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">2. How We Use Information</h2>
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 mb-4">
                        Information is used strictly to operate, improve, and secure FeelEd AI services.
                    </p>
                    <ul className="space-y-1.5 mb-5">
                        {[
                            'Personalizing learning experiences',
                            'Supporting multilingual educational features',
                            'Improving app performance and reliability',
                            'Responding to support requests',
                            'Monitoring platform security and misuse prevention',
                            'Understanding anonymous usage trends',
                        ].map(item => (
                            <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                    <div className="bg-blue-50 dark:bg-blue-950/50 border-l-4 border-blue-500 p-4 rounded">
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            FeelEd AI does not sell, rent, or share personal data with advertisers or third-party marketing platforms.
                        </p>
                    </div>
                </section>

                <hr className="border-gray-200 dark:border-gray-800" />

                {/* Section 3 */}
                <section>
                    <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">3. Data Storage & Security</h2>
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 mb-4">
                        We implement technical and organizational safeguards designed to protect user information against unauthorized access, misuse, or disclosure.
                    </p>
                    <ul className="space-y-1.5">
                        {[
                            'Encrypted data transmission',
                            'Secure cloud infrastructure',
                            'Access restrictions for internal systems',
                            'Regular monitoring and security updates',
                        ].map(item => (
                            <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </section>

                <hr className="border-gray-200 dark:border-gray-800" />

                {/* Section 4 */}
                <section>
                    <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">4. Children's Privacy</h2>
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 mb-4">
                        FeelEd AI is intended for educational use by students, educators, and parents. Certain features may require guardian or teacher supervision depending on the learner's age and institutional context.
                    </p>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">We do not knowingly:</p>
                    <ul className="space-y-1.5 mb-4">
                        {[
                            'Collect sensitive personal information from children without appropriate consent',
                            'Sell student information',
                            'Use student data for advertising purposes',
                        ].map(item => (
                            <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                        If we become aware that inappropriate personal data has been collected from a minor without required authorization, we will take reasonable steps to remove such information.
                    </p>
                </section>

                <hr className="border-gray-200 dark:border-gray-800" />

                {/* Section 5 */}
                <section>
                    <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">5. User Rights & Account Requests</h2>
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 mb-4">
                        Users may request access, correction, or deletion of account-related information by contacting FeelEd AI support.
                    </p>
                    <ul className="space-y-1.5 mb-4">
                        {[
                            'Access account information',
                            'Update profile information',
                            'Request account deletion',
                            'Request removal of stored data',
                        ].map(item => (
                            <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Contact:{' '}
                        <a href="mailto:admin@feeledai.com" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                            admin@feeledai.com
                        </a>
                    </p>
                </section>

                <hr className="border-gray-200 dark:border-gray-800" />

                {/* Section 6 */}
                <section>
                    <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">6. Policy Updates</h2>
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                        This Privacy Policy may be updated periodically to reflect product improvements, operational changes, or legal requirements. Continued use of FeelEd AI after updates indicates acceptance of the revised policy.
                    </p>
                </section>

                <hr className="border-gray-200 dark:border-gray-800" />

                {/* Section 7 */}
                <section>
                    <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">7. Contact Information</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">For privacy, security, or data-related enquiries:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <a href="mailto:admin@feeledai.com" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                            admin@feeledai.com
                        </a>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Chennai, Tamil Nadu, India</p>
                </section>

            </div>

            {/* Footer note */}
            <p className="text-xs text-center text-gray-400 dark:text-gray-600 mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                FeelEd AI is developed by Alteridea Web Services Private Limited.
            </p>
        </div>
    );
};

export default PrivacyPolicy;
