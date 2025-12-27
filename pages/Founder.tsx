import React from 'react';
import { Page } from '../types';

interface FounderProps {
    onNavigate: (page: Page) => void;
}

const Founder: React.FC<FounderProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-4xl bg-white p-8 rounded-[3rem] shadow-2xl border-4 border-white ring-4 ring-blue-50 animate-fade-in relative overflow-hidden">
            <h1 className="text-3xl font-black text-blue-600 mb-8 text-center flex items-center justify-center gap-3">
                <span className="text-4xl">🌟</span> Founder
            </h1>

            <div className="flex flex-col items-center mb-10">
                <div className="w-56 h-56 rounded-full overflow-hidden border-8 border-white shadow-2xl ring-4 ring-blue-50 mb-4 bg-blue-100 flex items-center justify-center relative group">
                    <img 
                        src="/founder.jpg?v=final"
                        alt="Velayutham S" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </div>
                <h2 className="text-3xl font-black text-slate-800">Velayutham S</h2>
                <p className="text-blue-600 font-bold text-lg">Founder & Visionary</p>
                <div className="mt-4 flex gap-4">
                    <a href="https://www.linkedin.com/in/velayutham-s-loopbackcinema" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/></svg>
                    </a>
                </div>
            </div>

            <div className="space-y-12 text-slate-700 leading-relaxed">
                <section className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-inner">
                    <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
                        <span className="bg-white p-2 rounded-xl shadow-sm">👤</span> About the Founder
                    </h2>
                    <p className="text-lg">Velayutham S is the Founder and Visionary behind FeelEd AI™.</p>
                    <p className="mt-4">He is an independent researcher and technologist from Chennai, passionate about connecting artificial intelligence with human emotion.</p>
                    <p className="mt-4">His work explores how emotion-aware systems can transform the way we learn, think, and evolve. Before FeelEd AI, he founded BeliefRecode AI and Loopback Cinema Technologies™, both pioneering projects that explore how emotional intelligence can be integrated into storytelling, education, and interactive media.</p>
                    <p className="mt-4 font-bold text-blue-900">Velayutham believes that true learning happens when a student feels understood. FeelEd AI is his mission to restore empathy in education by merging AI, psychology, and storytelling into a single emotionally intelligent ecosystem.</p>
                </section>

                <div className="grid md:grid-cols-2 gap-8">
                    <section className="bg-blue-50/50 p-8 rounded-3xl border border-blue-100 shadow-sm">
                        <h2 className="text-xl font-black mb-3 flex items-center gap-2 text-blue-900">
                            <span className="text-2xl">💡</span> Our Vision
                        </h2>
                        <p className="text-sm">At FeelEd AI, we believe that real learning begins when understanding meets emotion. Our goal is to humanize technology and bring empathy into education. We imagine a world where AI doesn’t replace teachers — it assists them, creating classrooms that listen, feel, and adapt to every learner.</p>
                    </section>
                    
                    <section className="bg-indigo-50/50 p-8 rounded-3xl border border-indigo-100 shadow-sm">
                        <h2 className="text-xl font-black mb-3 flex items-center gap-2 text-indigo-900">
                            <span className="text-2xl">🎯</span> Our Mission
                        </h2>
                        <p className="text-sm">To build an education ecosystem where emotional intelligence is the foundation, not an afterthought. We aim to empower teachers and students with tools that make learning personal, relatable, and alive.</p>
                    </section>
                </div>

                <blockquote className="border-l-8 border-blue-500 pl-8 italic text-2xl text-slate-600 bg-blue-50/30 py-8 rounded-r-[2.5rem]">
                    <p>“Education should not just inform the mind — it should transform the heart.”</p>
                    <footer className="font-black mt-4 text-blue-800">— Velayutham S</footer>
                </blockquote>
            </div>

             <div className="mt-16 text-center">
                <button onClick={() => onNavigate('generator')} className="bg-slate-800 text-white font-black py-4 px-10 rounded-full hover:bg-slate-900 transition transform hover:scale-105 shadow-xl">
                    Back to Story Generator
                </button>
            </div>
        </div>
    );
};

export default Founder;
