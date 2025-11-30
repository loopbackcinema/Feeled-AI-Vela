
import React from 'react';
import { Page } from '../types';

interface FounderProps {
    onNavigate: (page: Page) => void;
}

const Founder: React.FC<FounderProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-lg border border-slate-200 animate-fade-in">
            <h1 className="text-3xl font-bold text-blue-600 mb-8 text-center">🌟 Founder</h1>

            {/* Profile Section with Embedded SVG Illustration */}
            <div className="flex flex-col items-center mb-10">
                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-xl ring-4 ring-blue-50 mb-4 bg-blue-100 flex items-center justify-center relative group">
                    {/* Founder Illustration (Beard, White Shirt, ID Card) */}
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full transform transition-transform duration-500 group-hover:scale-105">
                        <defs>
                            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#8D5524" />
                                <stop offset="100%" stopColor="#6F421B" />
                            </linearGradient>
                            <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#FFFFFF" />
                                <stop offset="100%" stopColor="#F3F4F6" />
                            </linearGradient>
                        </defs>
                        
                        {/* Background Circle */}
                        <circle cx="100" cy="100" r="100" fill="#DBEAFE" />

                        {/* Body/Shirt */}
                        <path d="M40 200 L40 180 Q40 150 100 150 Q160 150 160 180 L160 200 Z" fill="url(#shirtGrad)" />
                        
                        {/* Neck */}
                        <rect x="85" y="130" width="30" height="30" fill="#8D5524" />
                        
                        {/* Face Shape */}
                        <ellipse cx="100" cy="100" rx="45" ry="55" fill="#8D5524" />

                        {/* Beard */}
                        <path d="M55 100 Q55 140 100 160 Q145 140 145 100 L145 90 L135 90 L135 110 Q135 125 100 125 Q65 125 65 110 L65 90 L55 90 Z" fill="#1F2937" />
                        
                        {/* Mustache */}
                        <path d="M75 115 Q100 105 125 115" stroke="#1F2937" strokeWidth="6" strokeLinecap="round" fill="none" />

                        {/* Mouth */}
                        <path d="M90 130 Q100 135 110 130" stroke="#372010" strokeWidth="2" strokeLinecap="round" fill="none" />

                        {/* Eyes */}
                        <circle cx="80" cy="90" r="4" fill="white" />
                        <circle cx="80" cy="90" r="2" fill="black" />
                        
                        <circle cx="120" cy="90" r="4" fill="white" />
                        <circle cx="120" cy="90" r="2" fill="black" />
                        
                        {/* Eyebrows */}
                        <path d="M70 80 Q80 75 90 80" stroke="#1F2937" strokeWidth="3" fill="none" />
                        <path d="M110 80 Q120 75 130 80" stroke="#1F2937" strokeWidth="3" fill="none" />

                        {/* Hair */}
                        <path d="M50 80 Q50 20 100 20 Q150 20 150 80 L145 100 L135 60 Q100 40 65 60 L55 100 Z" fill="#1F2937" />
                        
                        {/* ID Card Lanyard */}
                        <path d="M70 150 L100 185 L130 150" stroke="#2563EB" strokeWidth="4" fill="none" />
                        <rect x="90" y="185" width="20" height="15" fill="#FFFFFF" stroke="#2563EB" strokeWidth="1" rx="2" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Velayutham S</h2>
                <p className="text-blue-600 font-medium">Founder & Visionary</p>
            </div>

            <div className="space-y-8 text-slate-700 leading-relaxed">
                <div>
                    <h2 className="text-2xl font-semibold mb-2">👤 About the Founder</h2>
                    <p>Velayutham S is the Founder and Visionary behind FeelEd AI™.</p>
                    <p>He is an independent researcher and technologist from Chennai, passionate about connecting artificial intelligence with human emotion.</p>
                    <p className="mt-2">His work explores how emotion-aware systems can transform the way we learn, think, and evolve. Before FeelEd AI, he founded BeliefRecode AI and Loopback Cinema Technologies™, both pioneering projects that explore how emotional intelligence can be integrated into storytelling, education, and interactive media.</p>
                    <p className="mt-2">Velayutham believes that true learning happens when a student feels understood. FeelEd AI is his mission to restore empathy in education by merging AI, psychology, and storytelling into a single emotionally intelligent ecosystem.</p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold mb-2">💡 Our Vision</h2>
                    <p>At FeelEd AI, we believe that real learning begins when understanding meets emotion. Our goal is to humanize technology and bring empathy into education. We imagine a world where AI doesn’t replace teachers — it assists them, creating classrooms that listen, feel, and adapt to every learner.</p>
                    <p className="mt-2">Our vision is to make education emotionally intelligent — where each student learns not only through information, but through experience and connection.</p>
                </div>
                
                <div>
                    <h2 className="text-2xl font-semibold mb-2">🎯 Our Mission</h2>
                    <p>To build an education ecosystem where emotional intelligence is the foundation, not an afterthought. We aim to empower teachers and students with tools that make learning personal, relatable, and alive.</p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold mb-2">🌱 Why It Matters</h2>
                    <p>Today, most learning platforms focus only on knowledge delivery. FeelEd AI focuses on emotional understanding. Because when technology begins to understand how a child feels, education becomes a relationship — not a transaction.</p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold mb-2">📩 Contact</h2>
                    <p>Email: <a href="mailto:founder@feeledai.com" className="text-blue-600 hover:underline">founder@feeledai.com</a></p>
                    <p>LinkedIn: <a href="https://www.linkedin.com/in/velayutham-s-loopbackcinema" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">linkedin.com/in/velayutham-s-loopbackcinema</a></p>
                    <p>Location: Chennai, India</p>
                </div>

                <blockquote className="border-l-4 border-blue-500 pl-4 italic text-slate-600 bg-blue-50 p-4 rounded-r-lg">
                    <p>“Education should not just inform the mind — it should transform the heart.”</p>
                    <p className="font-semibold mt-2 text-blue-800">— Velayutham S</p>
                </blockquote>
            </div>

             <div className="mt-12 text-center">
                <button onClick={() => onNavigate('generator')} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700 transition transform hover:scale-105 shadow-md">
                    Back to Story Generator
                </button>
            </div>
        </div>
    );
};

export default Founder;
