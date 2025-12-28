import React, { useState, useRef, useCallback } from 'react';
import { Story, QuizQuestion } from '../types';
import Spinner from './Spinner';
import StoryChat from './StoryChat';

interface StoryDisplayProps {
    story: Story;
    base64Audio: string | null;
    isAudioLoading: boolean;
    base64Image: string | null;
    imageMimeType: string | null;
    isImageLoading: boolean;
    onTryAnother: () => void;
}

const StorySection: React.FC<{ title: string; content: string }> = ({ title, content }) => (
    <div className="mb-6 bg-slate-50 p-6 rounded-2xl border-l-8 border-indigo-400 shadow-sm transition-transform hover:translate-x-2 break-inside-avoid">
        <h3 className="text-lg font-black text-slate-800 mb-2 capitalize flex items-center gap-3">
            {title === 'Introduction' && '✨'}
            {title === 'Emotional_trigger' && '❤️'}
            {title === 'Concept_explanation' && '💡'}
            {title === 'Resolution' && '✅'}
            {title === 'Moral_message' && '🌟'}
            {title === 'Conclusion' && '🎓'}
            {title.replace(/_/g, ' ')}
        </h3>
        <p className="text-slate-700 leading-relaxed text-xl font-medium">{content}</p>
    </div>
);

interface QuizSectionProps {
    quiz: QuizQuestion[];
    onQuizComplete: (score: number) => void;
}

const QuizSection: React.FC<QuizSectionProps> = ({ quiz, onQuizComplete }) => {
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [showResult, setShowResult] = useState<{ [key: number]: boolean }>({});
    const [score, setScore] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);

    const handleOptionSelect = (qIndex: number, option: string) => {
        if (showResult[qIndex]) return; 
        setAnswers(prev => ({ ...prev, [qIndex]: option }));
    };

    const handleCheckAnswer = (qIndex: number) => {
        const isCorrect = answers[qIndex] === quiz[qIndex].answer;
        if (isCorrect) setScore(prev => prev + 1);
        setShowResult(prev => ({ ...prev, [qIndex]: true }));
        
        const nextResults = { ...showResult, [qIndex]: true };
        if (Object.keys(nextResults).length === quiz.length && !isCompleted) {
            setIsCompleted(true);
            onQuizComplete(isCorrect ? score + 1 : score);
        }
    };

    return (
        <div className="mt-16 bg-white p-8 md:p-12 rounded-[3.5rem] border-4 border-indigo-50 shadow-2xl break-inside-avoid">
            <h3 className="text-3xl font-black text-indigo-900 mb-10 text-center flex items-center justify-center gap-4">
                <span>🧠</span> Knowledge Verification
            </h3>
            <div className="space-y-10">
                {quiz.map((q, index) => (
                    <div key={index} className="space-y-6">
                        <p className="text-xl font-black text-slate-800">{index + 1}. {q.question}</p>
                        <div className="grid md:grid-cols-2 gap-4">
                            {q.options.map((option) => {
                                const isSelected = answers[index] === option;
                                const isCorrect = option === quiz[index].answer;
                                const isRevealed = showResult[index];
                                
                                let btnStyle = "w-full text-left px-6 py-4 rounded-2xl border-4 font-bold transition-all ";
                                if (isRevealed) {
                                    if (isCorrect) btnStyle += "bg-green-50 border-green-500 text-green-800";
                                    else if (isSelected) btnStyle += "bg-red-50 border-red-500 text-red-800";
                                    else btnStyle += "border-slate-100 text-slate-300 opacity-50";
                                } else {
                                    if (isSelected) btnStyle += "bg-blue-50 border-blue-600 text-blue-800 scale-[1.02] shadow-lg";
                                    else btnStyle += "bg-slate-50 border-slate-100 hover:border-blue-200 text-slate-600";
                                }

                                return (
                                    <button key={option} onClick={() => handleOptionSelect(index, option)} className={btnStyle} disabled={isRevealed}>
                                        {option}
                                    </button>
                                );
                            })}
                        </div>
                        {!showResult[index] && (
                            <div className="flex justify-end pt-4 no-print">
                                <button onClick={() => handleCheckAnswer(index)} disabled={!answers[index]} className="bg-indigo-600 text-white px-8 py-3 rounded-full font-black shadow-xl hover:bg-indigo-700 transition active:scale-95 disabled:opacity-50">
                                    Verify Answer
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Audio Utilities
function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
}

async function decodePcmAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    return buffer;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, base64Audio, isAudioLoading, base64Image, imageMimeType, isImageLoading, onTryAnother }) => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isDecoding, setIsDecoding] = useState(false);
    const [showCertificateForm, setShowCertificateForm] = useState(false);

    const handlePrint = () => window.print();

    const handlePlayPause = useCallback(async () => {
        if (!base64Audio) return;
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const audioCtx = audioContextRef.current;
        if (isPlaying && audioSourceRef.current) {
            audioSourceRef.current.stop();
        } else if (!isDecoding) {
            setIsDecoding(true);
            try {
                const audioBuffer = await decodePcmAudioData(decode(base64Audio), audioCtx);
                const source = audioCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioCtx.destination);
                source.onended = () => { setIsPlaying(false); audioSourceRef.current = null; };
                source.start(0);
                audioSourceRef.current = source;
                setIsPlaying(true);
            } catch (e) { console.error(e); }
            finally { setIsDecoding(false); }
        }
    }, [isPlaying, isDecoding, base64Audio]);

    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in pb-32 px-4 print:max-w-full print:p-0">
            {/* Header */}
            <div className="text-center mb-16 space-y-6">
                <h2 className="text-5xl md:text-7xl font-black text-indigo-900 tracking-tighter print:text-4xl">{story.title}</h2>
                <div className="flex justify-center gap-4 no-print">
                    <span className="px-5 py-2 rounded-full bg-indigo-50 border-2 border-indigo-100 text-indigo-600 font-black text-xs uppercase tracking-widest">
                        Tone: {story.emotion_tone}
                    </span>
                    <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2 rounded-full bg-slate-900 text-white font-black text-xs uppercase hover:bg-slate-800 transition shadow-lg hover:shadow-xl">
                        <span>🖨️</span> Save as PDF
                    </button>
                </div>
            </div>

            {/* Visual */}
            <div className="mb-16 transform transition-all hover:scale-[1.01]">
                {isImageLoading ? (
                    <div className="w-full aspect-video bg-indigo-50 rounded-[3rem] animate-pulse border-4 border-white shadow-xl flex items-center justify-center no-print">
                        <p className="text-indigo-300 font-black text-xl">Creating mental imagery...</p>
                    </div>
                ) : base64Image && (
                    <div className="relative rounded-[3rem] overflow-hidden border-[12px] border-white shadow-3xl ring-2 ring-slate-100 print:rounded-2xl print:border-4 print:shadow-none">
                        <img src={`data:${imageMimeType};base64,${base64Image}`} alt={story.title} className="w-full h-auto object-cover" />
                    </div>
                )}
            </div>

            {/* Voice Toggle */}
            <div className="flex justify-center mb-16 no-print">
                 <button 
                    onClick={handlePlayPause} 
                    disabled={isAudioLoading || isDecoding || !base64Audio}
                    className="bg-white/90 backdrop-blur-xl border-4 border-white shadow-[0_30px_60px_-10px_rgba(79,70,229,0.3)] px-12 py-6 rounded-full font-black text-indigo-700 flex items-center gap-6 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 ring-8 ring-indigo-50/50"
                >
                    {isAudioLoading || isDecoding ? <Spinner /> : (
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isPlaying ? 'bg-rose-500' : 'bg-indigo-600'} text-white shadow-xl`}>
                            {isPlaying ? '■' : '▶'}
                        </div>
                    )}
                    <span className="text-2xl uppercase tracking-tighter">
                        {isAudioLoading ? 'Synthesizing...' : isDecoding ? 'Buffering...' : isPlaying ? 'Stop Narration' : 'Narrate Story'}
                    </span>
                 </button>
            </div>
            
            {/* Story Flow */}
            <div className="space-y-8 print:space-y-6">
                <StorySection title="Introduction" content={story.introduction} />
                <StorySection title="Emotional_trigger" content={story.emotional_trigger} />
                <StorySection title="Concept_explanation" content={story.concept_explanation} />
                <StorySection title="Resolution" content={story.resolution} />
                <div className="grid md:grid-cols-2 gap-8 print:block print:space-y-6">
                     <StorySection title="Moral_message" content={story.moral_message} />
                     <StorySection title="Conclusion" content={story.conclusion} />
                </div>
            </div>

            {/* Quiz */}
            <div className="print:break-before-page">
                <QuizSection quiz={story.quiz} onQuizComplete={(score) => {
                    if (score === 3) setShowCertificateForm(true);
                }} />
            </div>

            {/* Chat */}
            <div className="mt-24 no-print">
                <StoryChat story={story} />
            </div>

            {/* Restart */}
            <div className="mt-24 text-center no-print">
                <button onClick={onTryAnother} className="bg-slate-900 text-white font-black py-8 px-20 rounded-[3rem] shadow-4xl hover:bg-indigo-700 transition-all transform hover:scale-105 uppercase tracking-tighter text-2xl border-b-[12px] border-slate-950 active:border-b-0">
                    ✨ Generate New Journey
                </button>
            </div>
            
            {/* Footer for Print */}
            <div className="hidden print:block text-center mt-12 text-slate-400 font-bold uppercase tracking-widest text-xs">
                Generated by FeelEd AI - Emotion-Adaptive Learning
            </div>
        </div>
    );
};

export default StoryDisplay;