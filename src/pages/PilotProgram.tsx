
import React from 'react';
import { Page } from '../types';

interface PilotProgramProps {
    onNavigate: (page: Page) => void;
}

const PilotProgram: React.FC<PilotProgramProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-5xl mx-auto space-y-20 animate-fade-in pb-24 px-4">
            
            {/* Hero Section */}
            <div className="text-center space-y-6 pt-12">
                <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-[0.4em] border border-indigo-100 shadow-sm">
                    Collaboration & Co-creation
                </div>
                <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter leading-tight">
                    FeelEd AI <span className="text-indigo-600">Pilot Program</span>
                </h1>
                <p className="text-2xl text-slate-500 font-medium max-w-4xl mx-auto leading-relaxed">
                    Co-creating Emotion-Adaptive Learning with Real Classrooms
                </p>
            </div>

            {/* Purpose Statement */}
            <div className="bg-white border-4 border-slate-50 p-12 md:p-20 rounded-[4rem] shadow-2xl space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[120px] opacity-10 -mr-32 -mt-32"></div>
                <h2 className="text-3xl font-black text-slate-900">Purpose Statement</h2>
                <div className="space-y-6 text-xl text-slate-600 leading-relaxed font-medium">
                    <p>
                        FeelEd AI Pilot Program is a collaborative research and classroom exploration initiative designed to understand how emotion-adaptive storytelling can support diverse learners in real educational environments.
                    </p>
                    <p className="p-8 bg-slate-900 text-white rounded-3xl font-bold">
                        This is not a finished product rollout. It is a guided pilot where teachers, students, and researchers work together to explore what emotionally responsive learning can become — ethically, responsibly, and inclusively.
                    </p>
                </div>
            </div>

            {/* Why a Pilot? Section */}
            <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Why a Pilot Program?</h2>
                    <div className="space-y-4 text-lg text-slate-500 font-medium leading-relaxed">
                        <p>Classrooms are emotionally complex spaces. Students learn differently, respond differently, and carry invisible emotional states into every lesson.</p>
                        <p>Traditional EdTech systems treat learning as static. FeelEd AI explores learning as a dynamic emotional process.</p>
                    </div>
                </div>
                <div className="bg-indigo-50 p-12 rounded-[3.5rem] border-2 border-indigo-100 space-y-6 shadow-inner">
                    <h3 className="text-xl font-black text-indigo-900 uppercase tracking-widest">Our Objectives</h3>
                    <ul className="space-y-4">
                        {[
                            "Test learning experiences in real classroom conditions",
                            "Learn from teachers and students directly",
                            "Validate ideas before scaling",
                            "Design responsibly, not speculatively"
                        ].map((obj, i) => (
                            <li key={i} className="flex items-center gap-4 text-slate-700 font-bold">
                                <span className="text-indigo-500 text-xl">✓</span>
                                {obj}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Who Can Participate Section */}
            <div className="space-y-12">
                <div className="text-center">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Who Can Participate?</h2>
                    <p className="text-slate-500 font-bold mt-2">Participation is selective to ensure ethical oversight and meaningful collaboration.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {[
                        { t: "Schools & Learning Centers", i: "🏫" },
                        { t: "Teachers & Educators", i: "👩‍🏫" },
                        { t: "Special Education Facilitators", i: "🧩" },
                        { t: "NGOs & Foundations", i: "🤝" },
                        { t: "Inclusive Education Researchers", i: "🔬" }
                    ].map((part, i) => (
                        <div key={i} className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 text-center shadow-md hover:shadow-xl transition-all group">
                            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{part.i}</div>
                            <h4 className="text-sm font-black text-slate-800 leading-tight">{part.t}</h4>
                        </div>
                    ))}
                </div>
            </div>

            {/* What Happens Section */}
            <div className="bg-slate-900 text-white p-12 md:p-24 rounded-[5rem] shadow-4xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(79,70,229,0.15)_0%,transparent_70%)]"></div>
                <div className="relative z-10 grid lg:grid-cols-2 gap-20">
                    <div className="space-y-10">
                        <h2 className="text-4xl font-black tracking-tight">What Happens During the Pilot?</h2>
                        <p className="text-indigo-200 text-xl font-medium leading-relaxed">Each pilot runs for a limited period (typically 4–6 weeks) and focuses on observation, reflection, and co-creation.</p>
                        <div className="p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
                            <p className="text-lg font-bold text-indigo-400">Important Note:</p>
                            <p className="text-slate-400 font-medium">There is no grading, labeling, or emotional scoring of children.</p>
                        </div>
                    </div>
                    <div className="space-y-6">
                         {[
                            "Guided use of FeelEd AI learning experiences",
                            "Emotion-adaptive story-based lessons (non-diagnostic)",
                            "Teacher observation and reflection",
                            "Student engagement feedback",
                            "Collaborative review sessions"
                        ].map((step, i) => (
                            <div key={i} className="flex items-center gap-6 p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                <span className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-black text-sm">{i+1}</span>
                                <span className="font-bold text-indigo-100">{step}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* What Participants Receive */}
            <div className="space-y-12">
                <h2 className="text-4xl font-black text-slate-900 text-center">What Participants Receive</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        { t: "Early Access", d: "Preview access to FeelEd AI learning experiences before public release.", i: "🔑" },
                        { t: "Direct Influence", d: "Shape the product direction and research based on your classroom needs.", i: "🎨" },
                        { t: "Recognition", d: "Optional recognition as an official pilot collaborator for your institution.", i: "🎖️" },
                        { t: "Summary Insights", d: "Learn from the aggregated pilot insights to improve your teaching methods.", i: "📊" },
                        { t: "Priority Support", d: "Direct line of communication with our research and support team.", i: "📞" },
                        { t: "Co-creation Role", d: "Act as a partner in the evolution of emotion-adaptive technology.", i: "🤝" }
                    ].map((item, i) => (
                        <div key={i} className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-lg hover:-translate-y-2 transition-all">
                            <div className="text-4xl mb-6">{item.i}</div>
                            <h4 className="text-xl font-black text-slate-900 mb-4">{item.t}</h4>
                            <p className="text-slate-500 font-medium leading-relaxed">{item.d}</p>
                        </div>
                    ))}
                </div>
                <p className="text-center text-indigo-600 font-black text-xl italic pt-8">This is a co-creation process, not a customer transaction.</p>
            </div>

            {/* Data Collection Section */}
            <div className="grid lg:grid-cols-2 gap-12 bg-white border-4 border-slate-50 rounded-[4rem] overflow-hidden shadow-2xl">
                <div className="p-12 md:p-20 space-y-8 bg-emerald-50">
                    <h2 className="text-3xl font-black text-emerald-900">What We Collect</h2>
                    <ul className="space-y-4">
                        {[
                            "Anonymous usage patterns",
                            "Qualitative teacher feedback",
                            "Observational learning insights"
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-4 font-black text-emerald-700">
                                <span className="text-2xl">✔️</span> {item}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="p-12 md:p-20 space-y-8 bg-rose-50">
                    <h2 className="text-3xl font-black text-rose-900">What We Do NOT Collect</h2>
                    <ul className="space-y-4">
                        {[
                            "No biometric data",
                            "No facial recordings",
                            "No emotional labeling of children",
                            "No student profiling",
                            "No selling or sharing of data"
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-4 font-black text-rose-700">
                                <span className="text-2xl">❌</span> {item}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="col-span-full p-10 text-center bg-slate-900 text-white font-black text-sm uppercase tracking-[0.4em]">
                    All pilots follow strict ethical and child-first principles.
                </div>
            </div>

            {/* Ethics & Responsibility */}
            <div className="max-w-4xl mx-auto text-center space-y-12">
                <h2 className="text-4xl font-black text-slate-900">Ethics & Responsibility</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { t: "Emotion as Context", d: "Emotion is a context for learning, not a metric.", i: "🧠" },
                        { t: "Support Teachers", d: "AI must support teachers, not replace them.", i: "🍎" },
                        { t: "Child Privacy", d: "Children must never be reduced to data points.", i: "🛡️" }
                    ].map((ethic, i) => (
                        <div key={i} className="space-y-4">
                            <div className="text-5xl">{ethic.i}</div>
                            <h4 className="text-lg font-black text-slate-900">{ethic.t}</h4>
                            <p className="text-slate-500 font-bold text-sm leading-relaxed">{ethic.d}</p>
                        </div>
                    ))}
                </div>
                <p className="p-8 bg-indigo-50 border-2 border-indigo-100 rounded-3xl text-indigo-900 font-bold italic">
                    The pilot program exists to ensure these values remain central as the system evolves.
                </p>
            </div>

            {/* Pilot Focus Areas */}
            <div className="bg-white border-2 border-slate-200 p-12 md:p-20 rounded-[4.5rem] shadow-xl space-y-10">
                <h2 className="text-3xl font-black text-slate-900 text-center">Current Pilot Focus Areas</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    {[
                        "Emotion-aware storytelling for foundational learning",
                        "Confidence-building for slow and sensitive learners",
                        "Inclusive narrative formats (audio-first, visual rhythm, simplified interaction)",
                        "Teacher-guided emotional pacing in lessons"
                    ].map((area, i) => (
                        <div key={i} className="flex items-start gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100 transition-colors hover:border-indigo-200">
                            <span className="text-indigo-600 text-3xl font-black opacity-20">0{i+1}</span>
                            <p className="font-bold text-slate-700 leading-relaxed">{area}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Application Section */}
            <div className="bg-slate-900 text-white p-20 md:p-32 rounded-[5rem] text-center shadow-4xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.2)_0%,transparent_100%)]"></div>
                <div className="relative z-10 space-y-12">
                    <h2 className="text-5xl md:text-8xl font-black tracking-tighter">Interested in <span className="text-indigo-400">Participating?</span></h2>
                    <p className="text-2xl text-slate-400 font-bold max-w-4xl mx-auto leading-relaxed">
                        If you are an educator, institution, or organization interested in participating, we invite you to apply.
                    </p>
                    <div className="flex flex-col md:flex-row gap-8 justify-center pt-8">
                        <a href="mailto:contact@feeledai.com?subject=Pilot Program Application" className="bg-white text-slate-900 px-16 py-8 rounded-full font-black text-2xl shadow-4xl hover:scale-105 transition-transform border-b-[12px] border-slate-200">Apply for Pilot Program</a>
                        <button onClick={() => onNavigate('generator')} className="border-4 border-white/20 text-white px-16 py-8 rounded-full font-black text-2xl hover:bg-white/10 transition-colors">Return to Dashboard</button>
                    </div>
                    <div className="pt-12 border-t border-white/10 max-w-2xl mx-auto">
                        <p className="text-slate-500 font-bold italic leading-relaxed text-lg">
                            "This pilot is not about proving technology. It is about listening — to classrooms, to teachers, and to learners. If this approach resonates with your values, we welcome the conversation."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PilotProgram;
