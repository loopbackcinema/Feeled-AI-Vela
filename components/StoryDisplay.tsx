import React, { useState, useRef, useCallback, useEffect } from 'react';
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

const StorySection: React.FC<{ title: string; content: string }> = ({ title, content }) => {
    const getIcon = (t: string) => {
        const lower = t.toLowerCase();
        if (lower.includes('introduction')) return '✨';
        if (lower.includes('trigger')) return '❤️';
        if (lower.includes('explanation')) return '💡';
        if (lower.includes('resolution')) return '✅';
        if (lower.includes('moral')) return '🌟';
        if (lower.includes('conclusion')) return '🎓';
        return '📖';
    };

    return (
        <div className="mb-6 bg-white p-6 md:p-8 rounded-[2rem] border-l-8 border-blue-500 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <h3 className="text-xl font-black text-slate-800 mb-3 capitalize flex items-center gap-3">
                <span className="text-3xl">{getIcon(title)}</span>
                {title.replace(/_/g, ' ')}
            </h3>
            <p className="text-slate-700 leading-relaxed text-lg font-medium">{content}</p>
        </div>
    );
};

interface QuizSectionProps {
    quiz: QuizQuestion[];
    onQuizComplete: (score: number) => void;
}

const QuizSection: React.FC<QuizSectionProps> = ({ quiz, onQuizComplete }) => {
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [showResult, setShowResult] = useState<{ [key: number]: boolean }>({});
    const [score, setScore] = useState(0);

    const handleOptionSelect = (qIndex: number, option: string) => {
        if (showResult[qIndex]) return; 
        setAnswers(prev => ({ ...prev, [qIndex]: option }));
    };

    const handleCheckAnswer = (qIndex: number) => {
        const isCorrect = answers[qIndex] === quiz[qIndex].answer;
        if (isCorrect) setScore(prev => prev + 1);
        
        setShowResult(prev => {
            const next = { ...prev, [qIndex]: true };
            if (Object.keys(next).length === quiz.length) {
                onQuizComplete(isCorrect ? score + 1 : score);
            }
            return next;
        });
    };

    return (
        <div className="mt-16 bg-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl border-4 border-indigo-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
            <h3 className="text-3xl font-black text-indigo-900 mb-10 text-center flex items-center justify-center gap-4">
                <span className="text-4xl animate-bounce">🧠</span> Knowledge Check
            </h3>
            <div className="space-y-12">
                {quiz.map((q, index) => (
                    <div key={index} className="space-y-6">
                        <p className="text-xl font-black text-slate-800 leading-snug">{index + 1}. {q.question}</p>
                        <div className="grid gap-4">
                            {q.options.map((option) => {
                                const isSelected = answers[index] === option;
                                const isCorrect = option === q.answer;
                                const isRevealed = showResult[index];
                                
                                let btnStyle = "w-full text-left px-6 py-5 rounded-2xl border-4 transition-all font-bold text-lg ";
                                if (isRevealed) {
                                    if (isCorrect) btnStyle += "bg-green-50 border-green-500 text-green-700 ring-8 ring-green-100/50";
                                    else if (isSelected) btnStyle += "bg-red-50 border-red-500 text-red-700";
                                    else btnStyle += "border-slate-100 text-slate-300";
                                } else {
                                    if (isSelected) btnStyle += "bg-blue-50 border-blue-500 text-blue-800 shadow-md transform scale-[1.02]";
                                    else btnStyle += "bg-slate-50 border-slate-100 text-slate-600 hover:border-blue-200 hover:bg-white";
                                }

                                return (
                                    <button
                                        key={option}
                                        onClick={() => handleOptionSelect(index, option)}
                                        className={btnStyle}
                                        disabled={isRevealed}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span>{option}</span>
                                            {isRevealed && isCorrect && <span className="text-2xl animate-pulse">✓</span>}
                                            {isRevealed && isSelected && !isCorrect && <span className="text-2xl">✗</span>}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        {!showResult[index] && (
                            <button 
                                onClick={() => handleCheckAnswer(index)}
                                disabled={!answers[index]}
                                className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black hover:bg-indigo-600 transition-all disabled:opacity-30 shadow-2xl ml-auto block transform hover:scale-105 active:scale-95"
                            >
                                Submit Answer
                            </button>
                        )}
                        {showResult[index] && (
                             <div className={`p-5 rounded-2xl text-lg font-black text-center animate-fade-in shadow-inner ${answers[index] === q.answer ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {answers[index] === q.answer ? "✨ Brilliant! You've got it!" : "Almost there! Keep practicing and you'll master it! 💪"}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Audio decoding and encoding helpers
function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodePcmAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
}

function encodeWAV(samples: Int16Array, sampleRate: number): Blob {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    const writeString = (view: DataView, offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
    };
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);
    for (let i = 0; i < samples.length; i++) view.setInt16(44 + i * 2, samples[i], true);
    return new Blob([view], { type: 'audio/wav' });
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, base64Audio, isAudioLoading, base64Image, imageMimeType, isImageLoading, onTryAnother }) => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isDecoding, setIsDecoding] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    
    // Certificate & Sharing
    const [showCertificateForm, setShowCertificateForm] = useState(false);
    const [studentName, setStudentName] = useState('');
    const [studentClass, setStudentClass] = useState('');
    const [schoolName, setSchoolName] = useState('');
    const [certificateBlob, setCertificateBlob] = useState<Blob | null>(null);
    const [generatingCert, setGeneratingCert] = useState(false);

    const chatSectionRef = useRef<HTMLDivElement>(null);
    const certRef = useRef<HTMLDivElement>(null);

    const handleQuizComplete = (score: number) => {
        if (score === 3) {
            setTimeout(() => {
                setShowCertificateForm(true);
                setTimeout(() => certRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            }, 1500);
        }
    };

    const generateCertificate = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneratingCert(true);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 2000;
        canvas.height = 1400;

        const grad = ctx.createLinearGradient(0, 0, 2000, 1400);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(1, '#f1f5f9');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 2000, 1400);

        // Ornate Borders
        ctx.strokeStyle = '#1e3a8a';
        ctx.lineWidth = 60;
        ctx.strokeRect(0, 0, 2000, 1400);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 15;
        ctx.strokeRect(100, 100, 1800, 1200);

        // Text Drawing
        ctx.textAlign = 'center';
        ctx.font = 'bold 160px "Nunito", sans-serif';
        ctx.fillStyle = '#1e3a8a';
        ctx.fillText('CERTIFICATE', 1000, 350);
        
        ctx.font = 'bold 70px "Nunito", sans-serif';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('OF MERIT', 1000, 450);

        ctx.font = 'italic 45px "Nunito", sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('This is proudly presented to', 1000, 600);

        ctx.font = 'bold italic 130px "Nunito", serif';
        ctx.fillStyle = '#2563eb';
        ctx.fillText(studentName, 1000, 780);

        ctx.font = '40px "Nunito", sans-serif';
        ctx.fillStyle = '#334155';
        ctx.fillText(`Grade: ${studentClass} | School: ${schoolName}`, 1000, 880);

        ctx.font = 'italic 35px "Nunito", sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('For successfully mastering the concept of', 1000, 1000);

        ctx.font = 'bold 60px "Nunito", sans-serif';
        ctx.fillStyle = '#1e3a8a';
        ctx.fillText(story.title, 1000, 1100);

        ctx.font = 'bold 50px "Nunito", sans-serif';
        ctx.fillStyle = '#6366f1';
        ctx.fillText('FeelEd AI', 1000, 1280);

        // QR Fake Code
        ctx.fillStyle = '#000';
        ctx.fillRect(1700, 1100, 150, 150);
        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = '#fff';
        ctx.fillText('VERIFIED', 1775, 1185);

        canvas.toBlob((blob) => {
            if (blob) setCertificateBlob(blob);
            setGeneratingCert(false);
        }, 'image/png');
    };

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
                source.onended = () => setIsPlaying(false);
                source.start(0);
                audioSourceRef.current = source;
                setIsPlaying(true);
            } catch (e) { console.error(e); }
            finally { setIsDecoding(false); }
        }
    }, [isPlaying, isDecoding, base64Audio]);

    const handleGlobalShare = async (type: 'text' | 'image' | 'audio' | 'cert') => {
        if (!navigator.share) return alert("Sharing not supported in this browser");

        let files: File[] = [];
        let text = `Check out this magical story from FeelEd AI: "${story.title}"! https://feeledai.com`;

        if (type === 'image' && base64Image) {
            const res = await fetch(`data:${imageMimeType};base64,${base64Image}`);
            files = [new File([await res.blob()], "story.png", { type: imageMimeType || 'image/png' })];
        } else if (type === 'audio' && base64Audio) {
            const audioBytes = decode(base64Audio);
            files = [new File([encodeWAV(new Int16Array(audioBytes.buffer), 24000)], "story_audio.wav", { type: 'audio/wav' })];
        } else if (type === 'cert' && certificateBlob) {
            files = [new File([certificateBlob], "FeelEd_Merit.png", { type: 'image/png' })];
            text = `I just mastered "${story.title}" and earned a Merit Certificate on FeelEd AI! 🏆 https://feeledai.com`;
        }

        try {
            await navigator.share({ title: "FeelEd AI Magic", text, files: files.length ? files : undefined });
        } catch (e) { console.error(e); }
    };

    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in pb-32 px-4">
            {/* Header */}
            <div className="text-center mb-16 space-y-4">
                <h2 className="text-5xl md:text-7xl font-black text-blue-800 tracking-tighter leading-tight drop-shadow-md">{story.title}</h2>
                <div className="inline-flex items-center px-8 py-2.5 rounded-full bg-blue-50 border-4 border-blue-100 text-blue-600 font-black text-sm uppercase tracking-[0.2em] shadow-sm">
                    Emotional Arc: {story.emotion_tone}
                </div>
            </div>

            {/* Thematic Visual */}
            <div className="mb-16">
                {isImageLoading ? (
                    <div className="w-full aspect-video bg-white rounded-[4rem] shadow-2xl border-8 border-white flex flex-col items-center justify-center animate-pulse">
                        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-5xl mb-4 shadow-inner">🎨</div>
                        <p className="text-slate-400 font-black text-xl">AI is painting the world for you...</p>
                    </div>
                ) : base64Image && (
                    <div className="relative group overflow-hidden rounded-[4rem] shadow-[0_40px_70px_-15px_rgba(0,0,0,0.4)] border-[16px] border-white ring-2 ring-slate-100 transition-all duration-700 hover:scale-[1.02]">
                        <img 
                            src={`data:${imageMimeType};base64,${base64Image}`} 
                            alt={story.title} 
                            className="w-full h-auto object-cover transform transition-transform duration-[3s] group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                    </div>
                )}
            </div>

            {/* Narration Toggle */}
            <div className="sticky top-28 z-40 flex justify-center mb-16 pointer-events-none">
                 <button 
                    onClick={handlePlayPause} 
                    disabled={isAudioLoading || isDecoding || !base64Audio}
                    className="pointer-events-auto bg-white/90 backdrop-blur-2xl border-4 border-white shadow-[0_30px_60px_-10px_rgba(37,99,235,0.3)] px-12 py-6 rounded-full font-black text-blue-700 flex items-center gap-6 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 ring-[12px] ring-blue-50/50 group"
                >
                    {isAudioLoading || isDecoding ? <Spinner /> : (
                        <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center ${isPlaying ? 'bg-red-500' : 'bg-blue-600'} text-white shadow-2xl transition-all duration-300 group-hover:rotate-6`}>
                            {isPlaying ? (
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8v4h2V8H7zm4 0v4h2V8h-2z"/></svg>
                            ) : (
                                <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 1 00-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
                            )}
                        </div>
                    )}
                    <span className="text-2xl uppercase tracking-tighter">
                        {isAudioLoading ? 'Creating Voice...' : isDecoding ? 'Preparing...' : isPlaying ? 'Stop Story' : 'Narrate Story'}
                    </span>
                 </button>
            </div>
            
            {/* Story Sections */}
            <div className="space-y-10">
                <StorySection title="Introduction" content={story.introduction} />
                <StorySection title="Emotional Trigger" content={story.emotional_trigger} />
                <StorySection title="Concept Explanation" content={story.concept_explanation} />
                <StorySection title="Resolution" content={story.resolution} />
                <div className="grid md:grid-cols-2 gap-10">
                    <StorySection title="Moral Message" content={story.moral_message} />
                    <StorySection title="Conclusion" content={story.conclusion} />
                </div>
            </div>

            {/* Quiz */}
            <QuizSection quiz={story.quiz} onQuizComplete={handleQuizComplete} />
            
            {/* Certificate Unlock */}
            {showCertificateForm && (
                <div ref={certRef} className="mt-24 bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 p-2 rounded-[4.5rem] shadow-[0_60px_100px_-20px_rgba(245,158,11,0.5)] animate-fade-in transform hover:-translate-y-2 transition-all duration-500">
                    <div className="bg-white p-12 md:p-20 rounded-[4.3rem] text-center space-y-12">
                        {!certificateBlob ? (
                            <>
                                <div className="space-y-6">
                                    <div className="text-8xl mb-6 animate-bounce">🏆</div>
                                    <h3 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 tracking-tight">Magnificent!</h3>
                                    <p className="text-2xl text-slate-500 font-bold max-w-2xl mx-auto leading-relaxed">You've mastered this lesson with a perfect score! Claim your official Merit Certificate now.</p>
                                </div>
                                <form onSubmit={generateCertificate} className="max-w-md mx-auto space-y-6">
                                    <input type="text" placeholder="Full Student Name" value={studentName} onChange={e => setStudentName(e.target.value)} className="w-full px-10 py-6 rounded-[2rem] border-4 border-slate-50 bg-slate-50 focus:border-orange-400 focus:bg-white outline-none font-black text-2xl transition-all shadow-inner" required />
                                    <input type="text" placeholder="Grade (e.g. 5th Std)" value={studentClass} onChange={e => setStudentClass(e.target.value)} className="w-full px-10 py-6 rounded-[2rem] border-4 border-slate-50 bg-slate-50 focus:border-orange-400 focus:bg-white outline-none font-black text-2xl transition-all shadow-inner" required />
                                    <input type="text" placeholder="School Name" value={schoolName} onChange={e => setSchoolName(e.target.value)} className="w-full px-10 py-6 rounded-[2rem] border-4 border-slate-50 bg-slate-50 focus:border-orange-400 focus:bg-white outline-none font-black text-2xl transition-all shadow-inner" required />
                                    <button type="submit" disabled={generatingCert} className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-8 rounded-[2.5rem] font-black text-3xl shadow-2xl hover:scale-[1.03] active:scale-95 transition-all uppercase tracking-tighter border-b-8 border-red-800">
                                        {generatingCert ? 'Crafting Merit...' : 'Create Certificate 🏆'}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="space-y-12 animate-fade-in">
                                <h3 className="text-5xl font-black text-blue-900 tracking-tight">Merit Certificate Unlocked!</h3>
                                <div className="relative group max-w-4xl mx-auto">
                                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 rounded-[3rem] blur-2xl opacity-30 group-hover:opacity-60 transition-opacity duration-1000"></div>
                                    <img src={URL.createObjectURL(certificateBlob)} alt="Merit Certificate" className="relative w-full rounded-[2.5rem] shadow-2xl border-8 border-white" />
                                </div>
                                <div className="flex flex-col md:flex-row justify-center gap-6 pt-8">
                                    <button onClick={() => handleGlobalShare('cert')} className="bg-blue-600 text-white px-14 py-6 rounded-full font-black text-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-4 shadow-2xl transform hover:-translate-y-1">
                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/></svg>
                                        Share Achievement
                                    </button>
                                    <a href={URL.createObjectURL(certificateBlob)} download={`${studentName}_FeelEd_Merit.png`} className="bg-slate-900 text-white px-14 py-6 rounded-full font-black text-2xl hover:bg-slate-800 transition-all shadow-xl flex items-center gap-4">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                                        Download Image
                                    </a>
                                </div>
                                <button onClick={() => setShowCertificateForm(false)} className="text-slate-400 font-black hover:text-slate-600 transition-colors text-xl">Close Preview</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* Interactive Chatbot */}
            <div ref={chatSectionRef} className="mt-24">
                <StoryChat story={story} />
            </div>

            {/* Sharing Panel */}
            <div className="mt-24 bg-white/70 backdrop-blur-3xl border-4 border-white p-12 rounded-[4.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] text-center space-y-12 animate-fade-in">
                <h3 className="text-4xl font-black text-slate-800 flex items-center justify-center gap-4">
                    <span className="text-5xl text-blue-500">✨</span> Share or Discuss
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <button onClick={() => handleGlobalShare('audio')} disabled={!base64Audio} className="flex flex-col items-center gap-4 p-8 bg-white rounded-[2.5rem] border-4 border-slate-50 hover:border-blue-200 hover:shadow-2xl transition-all group">
                        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform shadow-inner">🎵</div>
                        <span className="font-black text-xl text-slate-700">Audio story</span>
                    </button>
                    <button onClick={() => handleGlobalShare('image')} disabled={!base64Image} className="flex flex-col items-center gap-4 p-8 bg-white rounded-[2.5rem] border-4 border-slate-50 hover:border-pink-200 hover:shadow-2xl transition-all group">
                        <div className="w-20 h-20 bg-pink-50 text-pink-600 rounded-3xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform shadow-inner">🖼️</div>
                        <span className="font-black text-xl text-slate-700">Theme Image</span>
                    </button>
                    <button onClick={() => {
                        const text = `${story.title}\n\n${story.introduction}\n\nGenerated by FeelEd AI: https://feeledai.com`;
                        navigator.clipboard.writeText(text);
                        setCopySuccess(true);
                        setTimeout(() => setCopySuccess(false), 2000);
                    }} className="flex flex-col items-center gap-4 p-8 bg-white rounded-[2.5rem] border-4 border-slate-50 hover:border-indigo-200 hover:shadow-2xl transition-all group">
                        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform shadow-inner">{copySuccess ? '✅' : '📝'}</div>
                        <span className="font-black text-xl text-slate-700">{copySuccess ? 'Copied!' : 'Copy Story'}</span>
                    </button>
                    <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`I just learned about ${story.title} on FeelEd AI! 🧚‍♂️ https://feeledai.com`)}`, '_blank')} className="flex flex-col items-center gap-4 p-8 bg-white rounded-[2.5rem] border-4 border-slate-50 hover:border-green-200 hover:shadow-2xl transition-all group">
                        <div className="w-20 h-20 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform shadow-inner">💬</div>
                        <span className="font-black text-xl text-slate-700">WhatsApp</span>
                    </button>
                </div>

                <div className="flex flex-wrap justify-center gap-8 pt-8 border-t-4 border-slate-50">
                    <button onClick={() => handleGlobalShare('text')} className="bg-slate-900 text-white px-12 py-5 rounded-full font-black text-xl hover:bg-blue-600 transition-all shadow-2xl flex items-center gap-4 transform hover:scale-105">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.682 7.318l6 6M11.318 7.318l-6 6m6.364-6.364a9 9 0 11-12.728 0 9 9 0 0112.728 0z"/></svg>
                        Share Full Magic Journey
                    </button>
                    <button onClick={() => chatSectionRef.current?.scrollIntoView({ behavior: 'smooth' })} className="bg-white border-4 border-blue-100 text-blue-600 px-12 py-5 rounded-full font-black text-xl hover:bg-blue-50 transition-all shadow-xl flex items-center gap-4 transform hover:scale-105">
                        Discuss with AI Narrator
                    </button>
                </div>
            </div>

            {/* Restart CTA */}
            <div className="mt-24 text-center">
                <button onClick={onTryAnother} className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white font-black py-8 px-20 rounded-[3rem] hover:shadow-[0_40px_80px_-10px_rgba(37,99,235,0.4)] transition-all transform hover:scale-105 uppercase tracking-tighter text-2xl border-b-[12px] border-indigo-900 active:border-b-0 active:translate-y-2">
                    ✨ Create Another Magic Story
                </button>
            </div>
        </div>
    );
};

export default StoryDisplay;