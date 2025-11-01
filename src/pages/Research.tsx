import React from 'react';
import { Page } from '../types';

interface ResearchProps {
    onNavigate: (page: Page) => void;
}

const Research: React.FC<ResearchProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-lg border border-slate-200 animate-fade-in">
            <h1 className="text-3xl font-bold text-blue-600 mb-4 text-center">🧠 Research</h1>

            <div className="space-y-8 text-slate-700 leading-relaxed">
                <div>
                    <h2 className="text-2xl font-semibold mb-2">🔬 Our Research Philosophy</h2>
                    <p>At FeelEd AI, research is not separate from creation — it drives every feature we build. We study how emotions shape attention, memory, and curiosity — then translate those findings into learning systems that adapt in real time.</p>
                    <p className="mt-2 font-semibold italic text-slate-600">Our core belief:</p>
                    <blockquote className="border-l-4 border-blue-500 pl-4 italic text-slate-600 mt-2">
                        “When the mind understands and the heart agrees, learning becomes permanent.”
                    </blockquote>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold mb-2">🧩 Core Research Areas</h2>
                    <ul className="list-disc list-inside pl-4 space-y-2">
                        <li><span className="font-semibold">🎯 Emotion Sensing</span> – Using voice tone, facial micro-patterns, and text behavior to interpret student engagement.</li>
                        <li><span className="font-semibold">📖 Adaptive Story Engine</span> – Turning textbook lessons into stories that adjust in pace and tone based on emotional response.</li>
                        <li><span className="font-semibold">💡 Reinforcement Models</span> – Short, in-story feedback loops that strengthen memory through emotion-linked recall.</li>
                        <li><span className="font-semibold">📊 Teacher Analytics</span> – Real-time dashboards showing engagement levels and emotional balance in classrooms.</li>
                        <li><span className="font-semibold">🛡️ Privacy-First Design</span> – Local device processing, zero student data storage, and complete parental transparency.</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold mb-2">🔍 How We Research</h2>
                    <p>Our methods combine classroom pilots, teacher interviews, cognitive psychology insights, and data-driven analytics. We test what makes students connect emotionally — whether it’s story rhythm, tone, or empathy cues — and refine the AI to respond naturally.</p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold mb-2">📚 Publications & Conferences</h2>
                    <p>Our early papers and abstracts have been presented at international platforms including:</p>
                    <ul className="list-disc list-inside pl-4 mt-2">
                        <li>Neurology & Neurological Disorders 2025, London</li>
                        <li>AI in Education Forum, 2026 (upcoming)</li>
                    </ul>
                    <p className="mt-2">These studies form the foundation for our future academic collaborations in affective computing and emotion-based pedagogy.</p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold mb-2">🤝 Collaboration Opportunities</h2>
                    <p>We welcome partnerships with:</p>
                    <ul className="list-disc list-inside pl-4 mt-2">
                        <li>Universities & Research Institutes</li>
                        <li>Educators & Curriculum Designers</li>
                        <li>AI and Cognitive Science Researchers</li>
                    </ul>
                    <p className="mt-2">For academic or research collaborations, write to us at: 📧 <a href="mailto:research@feeledai.com" className="text-blue-600 hover:underline">research@feeledai.com</a></p>
                </div>
                
                <div>
                     <h2 className="text-2xl font-semibold mb-2">🌏 Our Promise</h2>
                     <p>FeelEd AI stands for research with empathy. Every algorithm we build, every model we test, respects the human emotion it interacts with. We promise to keep our research transparent, ethical, and always centered on one goal — learning that feels human.</p>
                </div>

            </div>

             <div className="mt-8 text-center">
                <button onClick={() => onNavigate('generator')} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition">
                    Back to Story Generator
                </button>
            </div>
        </div>
    );
};

export default Research;