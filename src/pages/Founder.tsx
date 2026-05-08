
import React from 'react';
import { Page } from '../types';

interface FounderProps {
    onNavigate: (page: Page) => void;
}

const Founder: React.FC<FounderProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-4xl bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 animate-fade-in transition-colors duration-300 mb-32">
            <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-8 text-center">🌟 Founder</h1>

            {/* Profile Section */}
            <div className="flex flex-col items-center mb-10">
                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl ring-4 ring-blue-50 dark:ring-blue-900/20 mb-4 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center relative group transition-colors">
                    <img 
                        src="https://i.postimg.cc/LYm0CcTm/IMG-20260317-WA0028.jpg"
                        alt="Velayutham S" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 transition-colors">Velayutham S</h2>
                <p className="text-blue-600 dark:text-blue-400 font-medium transition-colors">Founder & Visionary</p>
            </div>

            <div className="space-y-8 text-slate-700 dark:text-slate-400 leading-relaxed transition-colors">
                <div>
                    <h2 className="text-2xl font-semibold mb-2 text-slate-900 dark:text-slate-100">👤 About the Founder</h2>
                    <p>Velayutham S is the Founder and Visionary behind FeelEd AI™.</p>
                    <p>He is an independent researcher and technologist from Chennai, passionate about connecting artificial intelligence with human emotion.</p>
                    <p className="mt-2">His work explores how emotion-aware systems can transform the way we learn, think, and evolve. Before FeelEd AI, he founded BeliefRecode AI and Loopback Cinema Technologies™, both pioneering projects that explore how emotional intelligence can be integrated into storytelling, education, and interactive media.</p>
                    <p className="mt-2">Velayutham believes that true learning happens when a student feels understood. FeelEd AI is his mission to restore empathy in education by merging AI, psychology, and storytelling into a single emotionally intelligent ecosystem.</p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold mb-2 text-slate-900 dark:text-slate-100">💡 Our Vision</h2>
                    <p>At FeelEd AI, we believe that real learning begins when understanding meets emotion. Our goal is humanize technology and bring empathy into education. We imagine a world where AI doesn’t replace teachers — it assists them, creating classrooms that listen, feel, and adapt to every learner.</p>
                    <p className="mt-2">Our vision is to make education emotionally intelligent — where each student learns not only through information, but through experience and connection.</p>
                </div>
                
                <div>
                    <h2 className="text-2xl font-semibold mb-2 text-slate-900 dark:text-slate-100">🎯 Our Mission</h2>
                    <p>To build an education ecosystem where emotional intelligence is the foundation, not an afterthought. We aim to empower teachers and students with tools that make learning personal, relatable, and alive.</p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold mb-2 text-slate-900 dark:text-slate-100">🌱 Why It Matters</h2>
                    <p>Today, most learning platforms focus only on knowledge delivery. FeelEd AI focuses on emotional understanding. Because when technology begins to understand how a child feels, education becomes a relationship — not a transaction.</p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold mb-2 text-slate-900 dark:text-slate-100">📩 Contact</h2>
                    <p>Email: <a href="mailto:founder@feeledai.com" className="text-blue-600 dark:text-blue-400 hover:underline transition-colors">founder@feeledai.com</a></p>
                    <p>LinkedIn: <a href="https://www.linkedin.com/in/velayutham-s-loopbackcinema" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline transition-colors">linkedin.com/in/velayutham-s-loopbackcinema</a></p>
                    <p>Location: Chennai, India</p>
                </div>

                <blockquote className="border-l-4 border-blue-500 pl-4 italic text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r-lg transition-colors">
                    <p>“Education should not just inform the mind — it should transform the heart.”</p>
                    <p className="font-semibold mt-2 text-blue-800 dark:text-blue-300">— Velayutham S</p>
                </blockquote>
            </div>

             <div className="mt-12 text-center">
                <button onClick={() => onNavigate('generator')} className="bg-blue-600 dark:bg-blue-500 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700 dark:hover:bg-blue-600 transition transform hover:scale-105 shadow-md">
                    Back to Story Generator
                </button>
            </div>
        </div>
    );
};

export default Founder;
