
import React from 'react';
import { Page } from '../types';

interface PrivacyPolicyProps {
    onNavigate: (page: Page) => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-5xl mx-auto animate-fade-in pb-12 px-6 mb-32 transition-colors duration-300">
            
            {/* Header Section */}
            <div className="text-center space-y-4 py-8 mb-4">
                <div className="inline-block p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 mb-2 shadow-sm transition-colors">
                    <span className="text-4xl">🔒</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tight transition-colors">
                    Privacy <span className="text-blue-600 dark:text-blue-400">Policy</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">Last Updated: October 2025</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 space-y-10 text-slate-700 dark:text-slate-300 leading-relaxed transition-colors">
                
                {/* Introduction */}
                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30 transition-colors">
                    <p className="text-lg font-medium text-slate-800 dark:text-slate-200 transition-colors">
                        Your privacy is important to us. This Privacy Policy explains how FeelEd AI (“we,” “our,” or “us”) collects, uses, stores, and protects your information when you use our mobile app, website, or related services.
                    </p>
                    <p className="mt-4 text-slate-600 dark:text-slate-400 transition-colors">
                        By accessing or using FeelEd AI, you agree to the practices described in this policy.
                    </p>
                </div>

                {/* 1. Information We Collect */}
                <section>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-3 transition-colors">
                        <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg text-lg transition-colors">1</span> Information We Collect
                    </h2>
                    <p className="mb-4 transition-colors">We follow a minimal data collection approach and collect only what is necessary to provide a safe and personalized learning experience.</p>
                    
                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl transition-colors">
                            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3 transition-colors">1.1 Information You Provide</h3>
                            <ul className="list-disc list-inside space-y-2 text-sm transition-colors">
                                <li>Name</li>
                                <li>Email address</li>
                                <li>Account details or profile information</li>
                                <li>Preferences (learning level, language)</li>
                                <li>Support queries or feedback messages</li>
                            </ul>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl transition-colors">
                            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3 transition-colors">1.2 Automatically Collected</h3>
                            <ul className="list-disc list-inside space-y-2 text-sm transition-colors">
                                <li>App usage analytics (anonymous)</li>
                                <li>Device information (model, OS, browser)</li>
                                <li>Log data for performance and security</li>
                                <li>Non-identifiable emotional signals (processed locally)</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-6 bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-100 dark:border-red-900/30 transition-colors">
                        <h3 className="font-bold text-red-800 dark:text-red-400 mb-3 transition-colors">1.3 What We Do Not Collect</h3>
                        <ul className="space-y-2 text-sm text-red-700 dark:text-red-300 transition-colors">
                            <li className="flex items-center gap-2">❌ We do not collect financial information.</li>
                            <li className="flex items-center gap-2">❌ We do not store facial images, audio recordings, or identifiable emotional data.</li>
                            <li className="flex items-center gap-2">❌ We do not use cookies for advertising or tracking across websites.</li>
                        </ul>
                    </div>
                </section>

                <hr className="border-slate-100 dark:border-slate-800 transition-colors" />

                {/* 2. How We Use Your Information */}
                <section>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-3 transition-colors">
                        <span className="bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 px-3 py-1 rounded-lg text-lg transition-colors">2</span> How We Use Your Information
                    </h2>
                    <p className="mb-4 transition-colors">We use the collected data strictly to provide, improve, and secure our services.</p>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-bold text-green-700 dark:text-green-400 mb-3 transition-colors">✅ We use data to:</h3>
                            <ul className="space-y-2 text-sm transition-colors">
                                <li className="flex items-start gap-2"><span>🔹</span> Personalize story-based learning experiences</li>
                                <li className="flex items-start gap-2"><span>🔹</span> Enhance platform features and performance</li>
                                <li className="flex items-start gap-2"><span>🔹</span> Respond to support queries</li>
                                <li className="flex items-start gap-2"><span>🔹</span> Maintain security and prevent misuse</li>
                                <li className="flex items-start gap-2"><span>🔹</span> Analyze anonymous usage patterns</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-red-700 dark:text-red-400 mb-3 transition-colors">🚫 We do NOT:</h3>
                            <ul className="space-y-2 text-sm transition-colors">
                                <li className="flex items-start gap-2"><span>🔸</span> Sell your data</li>
                                <li className="flex items-start gap-2"><span>🔸</span> Rent your data</li>
                                <li className="flex items-start gap-2"><span>🔸</span> Share your information with advertisers</li>
                                <li className="flex items-start gap-2"><span>🔸</span> Use your data for third-party marketing</li>
                            </ul>
                        </div>
                    </div>
                    <p className="mt-4 text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg inline-block transition-colors">
                        Your data is used only for the functioning and improvement of FeelEd AI.
                    </p>
                </section>

                <hr className="border-slate-100 dark:border-slate-800 transition-colors" />

                {/* 3. Data Storage & Security */}
                <section>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-3 transition-colors">
                        <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-lg text-lg transition-colors">3</span> Data Storage & Security
                    </h2>
                    <p className="mb-4 transition-colors">We take privacy seriously and implement industry-standard protection.</p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-purple-50 dark:bg-purple-900/10 p-6 rounded-2xl border border-purple-100 dark:border-purple-900/30 transition-colors">
                            <h3 className="font-bold text-purple-900 dark:text-purple-400 mb-3 transition-colors">Security Measures</h3>
                            <ul className="list-disc list-inside space-y-2 text-sm text-purple-800 dark:text-purple-300 transition-colors">
                                <li>End-to-end encryption for data transmission</li>
                                <li>Secured servers hosted by trusted providers</li>
                                <li>Regular security audits</li>
                                <li>Restricted internal access based on role</li>
                            </ul>
                        </div>
                        <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 transition-colors">
                            <h3 className="font-bold text-indigo-900 dark:text-indigo-400 mb-3 transition-colors">Emotion Data Protection</h3>
                            <ul className="list-disc list-inside space-y-2 text-sm text-indigo-800 dark:text-indigo-300 transition-colors">
                                <li>All processing happens locally on the device</li>
                                <li>No identifiable photos or videos stored</li>
                                <li>No biometric data is saved</li>
                                <li>We prioritize safety and user dignity</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <hr className="border-slate-100 dark:border-slate-800 transition-colors" />

                {/* 4. Your Rights */}
                <section>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-3 transition-colors">
                        <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-lg text-lg transition-colors">4</span> Your Rights
                    </h2>
                    <p className="mb-4 transition-colors">You have full control over your data. You may request to:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4 text-slate-700 dark:text-slate-300 transition-colors">
                        <li>Access the data associated with your account</li>
                        <li>Update or modify your profile information</li>
                        <li>Delete your account permanently</li>
                        <li>Request deletion of all stored data</li>
                    </ul>
                    <div className="mt-4 bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30 transition-colors">
                        <p className="font-medium text-amber-900 dark:text-amber-400 transition-colors">To exercise these rights, contact us at:</p>
                        <a href="mailto:feeledai@gmail.com" className="text-blue-600 dark:text-blue-400 font-bold hover:underline transition-colors">feeledai@gmail.com</a>
                        <p className="text-xs text-amber-700 dark:text-amber-500 mt-1 transition-colors">We process data requests within 7–14 business days.</p>
                    </div>
                </section>

                <hr className="border-slate-100 dark:border-slate-800 transition-colors" />

                {/* 5. Children’s Privacy */}
                <section>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-3 transition-colors">
                        <span className="bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400 px-3 py-1 rounded-lg text-lg transition-colors">5</span> Children’s Privacy
                    </h2>
                    <p className="mb-4 transition-colors">FeelEd AI is designed for learners 13 years and above, ideally with teacher or guardian guidance.</p>
                    <div className="bg-pink-50 dark:bg-pink-900/10 border-l-4 border-pink-400 dark:border-pink-600 p-4 rounded-r-xl transition-colors">
                        <p className="font-bold text-pink-900 dark:text-pink-400 mb-2 transition-colors">We do not:</p>
                        <ul className="space-y-1 text-pink-800 text-sm dark:text-pink-300 transition-colors">
                            <li>• Knowingly collect personal information from children under 13</li>
                            <li>• Store sensitive data of minors without verified parental consent</li>
                        </ul>
                        <p className="mt-3 text-xs text-pink-700 dark:text-pink-500 transition-colors">If we discover an underage account created without consent, we will delete it promptly.</p>
                    </div>
                </section>

                <hr className="border-slate-100 dark:border-slate-800 transition-colors" />

                {/* 6. Changes & 7. Contact */}
                <div className="grid md:grid-cols-2 gap-8">
                    <section>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3 transition-colors">6. Changes to Policy</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors">
                            We may update this policy to reflect improvements or legal requirements. When we do, the “Last Updated” date will be revised. Continued use of FeelEd AI after updates indicates acceptance of the new policy.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3 transition-colors">7. Contact Us</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 transition-colors">For any privacy, data protection, or security-related questions:</p>
                        <div className="space-y-1 text-sm font-medium transition-colors">
                            <p>📧 <a href="mailto:contact@feeledai.com" className="text-blue-600 dark:text-blue-400 hover:underline">contact@feeledai.com</a></p>
                            <p>📩 <a href="mailto:feeledai@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">feeledai@gmail.com</a></p>
                            <p>📞 +91 90924 50286</p>
                            <p>📍 Chennai, India</p>
                        </div>
                    </section>
                </div>

            </div>

            <div className="mt-12 text-center">
                <button onClick={() => onNavigate('generator')} className="bg-slate-800 dark:bg-indigo-600 text-white font-bold py-3 px-8 rounded-full hover:bg-slate-900 dark:hover:bg-indigo-500 transition transform hover:scale-105 shadow-lg border-4 border-white dark:border-slate-800 ring-2 ring-slate-100 dark:ring-slate-800">
                    Back to Story Generator
                </button>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
