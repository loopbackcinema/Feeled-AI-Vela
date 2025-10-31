import React from 'react';
import { Page } from '../types';

interface AboutUsProps {
    onNavigate: (page: Page) => void;
}

const AboutUs: React.FC<AboutUsProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-lg border border-slate-200 animate-fade-in">
            <h1 className="text-3xl font-bold text-blue-600 mb-4 text-center">About Us — FeelEd AI</h1>
            <p className="text-center text-slate-500 text-lg mb-8">Feel the story. Learn naturally.</p>

            <div className="space-y-6 text-slate-700 leading-relaxed">
                <div>
                    <h2 className="text-2xl font-semibold mb-2">💡 Our Vision</h2>
                    <p>At FeelEd AI, we believe that real learning happens when knowledge meets emotion. We’re reimagining education through AI-driven storytelling — transforming lessons into emotional journeys that spark curiosity, empathy, and lifelong understanding.</p>
                    <p className="mt-2">Our vision is to bring back the human connection in education — making every student feel, think, and grow through stories that stay in the heart.</p>
                </div>
                <div>
                    <h2 className="text-2xl font-semibold mb-2">🤖 What We Do</h2>
                    <p>FeelEd AI is an emotional learning assistant powered by Artificial Intelligence. It helps teachers and students turn any topic into a meaningful story within seconds. We blend technology, storytelling, and education to make complex ideas simple and memorable.</p>
                    <ul className="list-disc list-inside mt-2 pl-4 space-y-1">
                        <li>🎓 Emotion-Based Story Generation – Convert topics into age-appropriate, emotionally intelligent stories</li>
                        <li>🎧 Text-to-Speech Narration – Listen to stories in natural Tamil or English voices</li>
                        <li>💬 Teacher Tools – Generate stories instantly for any subject or grade</li>
                        <li>❤️ Personalized Learning – Each learner experiences a story that connects with their feelings and level</li>
                    </ul>
                </div>
                <div>
                    <h2 className="text-2xl font-semibold mb-2">🌱 Why We Exist</h2>
                    <p>Education is more than memorizing facts — it’s about understanding and feeling. Most digital learning tools focus only on content delivery. FeelEd AI focuses on emotional understanding, helping learners relate to the subject through empathy and imagination.</p>
                     <p className="mt-2">We exist to answer one question: “What if every child could learn in a way that feels natural?”</p>
                </div>
                <div>
                    <h2 className="text-2xl font-semibold mb-2">🌏 Our Promise</h2>
                    <p>We promise to keep FeelEd AI simple, secure, and inspiring — a space where stories create understanding, and emotions become the bridge to knowledge. “When a student feels the story, learning becomes unforgettable.”</p>
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

export default AboutUs;
