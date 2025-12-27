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
        <div className="mb-6 bg-white p-6 md:p-8 rounded-[2rem] border-l-8 border-blue-500 shadow-lg hover:shadow-xl transition-all duration-300">
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
    const [isCompleted, setIsCompleted] = useState(false);

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
                setIsCompleted(true);
                onQuizComplete(isCorrect ? score + 1 : score);
            }
            return next;
        });
    };

    if (!quiz || quiz.length === 0) return null;

    return (
        <div className="mt-16 bg-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl border border-indigo-50 relative overflow-hidden">
            <h3 className="text-3xl font-black text-indigo-900 mb-10 text-center flex items-center justify-center gap-3">
                <span className="text-4xl">🧠</span> Knowledge Check
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
                                
                                let btnStyle = "w-full text-left px-6 py-5 rounded-2xl border-2 transition-all font-bold text-lg ";
                                if (isRevealed) {
                                    if (isCorrect) btnStyle += "bg-green-50 border-green-500 text-green-700 ring-4 ring-green-100";
                                    else if (isSelected) btnStyle += "bg-red-50 border-red-500 text-red-700 ring-4 ring-red-100";
                                    else btnStyle += "border-slate-100 text-slate-300";
                                } else {
                                    if (isSelected) btnStyle += "bg-blue-50 border-blue-500 text-blue-800 shadow-md transform scale-[1.01]";
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
                                            {isRevealed && isCorrect && <span className="text-2xl">✓</span>}
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
                                className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black hover:bg-indigo-600 transition-all disabled:opacity-30 shadow-xl shadow-slate-200 ml-auto block transform hover:scale-105"
                            >
                                Check Answer
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// PCM decoding helpers
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

// Helper to write a string to a DataView
function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

// Helper to encode PCM data into a WAV file blob
function encodeWAV(samples: Int16Array, sampleRate: number): Blob {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
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
    for (let i = 0; i < samples.length; i++) {
        view.setInt16(44 + i * 2, samples[i], true);
    }
    return new Blob([view], { type: 'audio/wav' });
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, base64Audio, isAudioLoading, base64Image, imageMimeType, isImageLoading, onTryAnother }) => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isDecoding, setIsDecoding] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    
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

        canvas.width = 1600;
        canvas.height = 1100;

        const grad = ctx.createLinearGradient(0, 0, 1600, 1100);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(1, '#f8fafc');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1600, 1100);

        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 40;
        ctx.strokeRect(0, 0, 1600, 1100);
        
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 10;
        ctx.strokeRect(70, 70, 1460, 960);

        ctx.font = 'bold 110px "Nunito", sans-serif';
        ctx.fillStyle = '#1e3a8a';
        ctx.textAlign = 'center';
        ctx.fillText('CERTIFICATE', 800, 260);
        
        ctx.font = 'bold 50px "Nunito", sans-serif';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('OF MERIT', 800, 330);

        ctx.font = 'italic 35px "Nunito", sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('This is proudly presented to', 800, 440);

        ctx.font = 'bold italic 100px "Nunito", serif';
        ctx.fillStyle = '#2563eb';
        ctx.fillText(studentName, 800, 560);

        ctx.font = '32px "Nunito", sans-serif';
        ctx.fillStyle = '#334155';
        ctx.fillText(`Grade: ${studentClass} | School: ${schoolName}`, 800, 640);

        ctx.font = 'italic 30px "Nunito", sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('For successfully mastering the concept of', 800, 730);

        ctx.font = 'bold 50px "Nunito", sans-serif';
        ctx.fillStyle = '#1e3a8a';
        ctx.fillText(story.title, 800, 810);

        ctx.font = 'bold 40px "Nunito", sans-serif';
        ctx.fillStyle = '#6366f1';
        ctx.fillText('FeelEd AI', 800, 940);
        
        const logoImg = new Image();
        logoImg.src = '/logo.svg';
        logoImg.onload = () => {
            ctx.drawImage(logoImg, 1350, 100, 180, 180);
            canvas.toBlob((blob) => {
                if (blob) setCertificateBlob(blob);
                setGeneratingCert(false);
            }, 'image/png');
        };
        logoImg.onerror = () => {
            canvas.toBlob((blob) => {
                if (blob) setCertificateBlob(blob);
                setGeneratingCert(false);
            }, 'image/png');
        };
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

    const handleShareModal = async (type: 'text' | 'image' | 'audio' | 'cert') => {
        if (!navigator.share) {
            alert("Sharing is not supported on this browser.");
            return;
        }

        const shareData: ShareData = {
            title: story.title,
            text: `Check out this magical story from FeelEd AI: "${story.title}"! https://feeledai.com`,
        };

        if (type === 'image' && base64Image) {
            const blob = await (await fetch(`data:${imageMimeType};base64,${base64Image}`)).blob();
            const file = new File([blob], "story_image.png", { type: imageMimeType || 'image/png' });
            shareData.files = [file];
        } else if (type === 'audio' && base64Audio) {
            const audioBytes = decode(base64Audio);
            const wavBlob = encodeWAV(new Int16Array(audioBytes.buffer), 24000);
            const file = new File([wavBlob], "story_audio.wav", { type: 'audio/wav' });
            shareData.files = [file];
        } else if (type === 'cert' && certificateBlob) {
            const file = new File([certificateBlob], "FeelEd_Merit_Certificate.png", { type: 'image/png' });
            shareData.files = [file];
            shareData.text = `I just earned my Merit Certificate on FeelEd AI! 🏆 https://feeledai.com`;
        }

        try {
            await navigator.share(shareData);
        } catch (err) { console.error(err); }
    };

    const handleCopyStory = () => {
        const text = `${story.title}\n\n${story.introduction}\n\n${story.concept_explanation}\n\n${story.resolution}\n\n${story.moral_message}\n\nRead more at https://feeledai.com`;
        navigator.clipboard.writeText(text).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    const handleWhatsAppShare = () => {
        const text = encodeURIComponent(`Check out this magical story on FeelEd AI: "${story.title}"! https://feeledai.com`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    const handleDownloadAudio = () => {
        if (!base64Audio) return;
        const audioBytes = decode(base64Audio);
        const wavBlob = encodeWAV(new Int16Array(audioBytes.buffer), 24000);
        const url = URL.createObjectURL(wavBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${story.title.replace(/\s+/g, '_')}.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        return () => {
            audioSourceRef.current?.stop();
            audioContextRef.current?.close();
        };
    }, []);

    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in pb-24 px-4">
            <div className="text-center mb-16 space-y-4">
                <h2 className="text-5xl md:text-6xl font-black text-blue-800 tracking-tighter leading-tight drop-shadow-sm">{story.title}</h2>
                <div className="inline-flex items-center px-6 py-2 rounded-full bg-blue-50 border-2 border-blue-100 text-blue-600 font-black text-sm uppercase tracking-widest shadow-sm">
                    Tone: {story.emotion_tone}
                </div>
            </div>

            <div className="mb-16">
                {isImageLoading ? (
                    <div className="w-full aspect-video bg-white rounded-[4rem] shadow-2xl border-4 border-white flex items-center justify-center animate-pulse">
                        <p className="text-slate-400 font-black text-xl tracking-tight">AI is painting the world for you...</p>
                    </div>
                ) : base64Image && (
                    <div className="relative group overflow-hidden rounded-[4rem] shadow-2xl border-[12px] border-white ring-2 ring-slate-100">
                        <img 
                            src={`data:${imageMimeType};base64,${base64Image}`} 
                            alt={story.title} 
                            className="w-full h-auto object-cover transform transition-transform duration-[2000ms] group-hover:scale-110"
                        />
                    </div>
                )}
            </div>

            <div className="sticky top-28 z-40 flex justify-center mb-16 pointer-events-none">
                 <button 
                    onClick={handlePlayPause} 
                    disabled={isAudioLoading || isDecoding || !base64Audio}
                    className="pointer-events-auto bg-white/90 backdrop-blur-2xl border-4 border-white shadow-2xl px-12 py-6 rounded-full font-black text-blue-700 flex items-center gap-5 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 ring-8 ring-blue-50/50 group"
                >
                    {isAudioLoading || isDecoding ? <Spinner /> : (
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isPlaying ? 'bg-red-500' : 'bg-blue-600'} text-white shadow-xl group-hover:rotate-6`}>
                            {isPlaying ? (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8v4h2V8H7zm4 0v4h2V8h-2z"/></svg>
                            ) : (
                                <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 1 00-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
                            )}
                        </div>
                    )}
                    <span className="text-2xl uppercase tracking-tighter">
                        {isAudioLoading ? 'Creating Voice...' : isDecoding ? 'Preparing...' : isPlaying ? 'Stop Story' : 'Narrate Story'}
                    </span>
                 </button>
            </div>
            
            <div className="space-y-8">
                <StorySection title="Introduction" content={story.introduction} />
                <StorySection title="Emotional Trigger" content={story.emotional_trigger} />
                <StorySection title="Concept Explanation" content={story.concept_explanation} />
                <StorySection title="Resolution" content={story.resolution} />
                <div className="grid md:grid-cols-2 gap-8">
                    <StorySection title="Moral Message" content={story.moral_message} />
                    <StorySection title="Conclusion" content={story.conclusion} />
                </div>
            </div>

            <QuizSection quiz={story.quiz} onQuizComplete={handleQuizComplete} />
            
            {showCertificateForm && (
                <div ref={certRef} className="mt-20 bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 p-2 rounded-[4rem] shadow-2xl animate-fade-in">
                    <div className="bg-white p-10 md:p-16 rounded-[3.8rem] text-center space-y-10">
                        {!certificateBlob ? (
                            <>
                                <div className="space-y-4">
                                    <div className="text-7xl mb-4 animate-bounce">🏆</div>
                                    <h3 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">Congratulations!</h3>
                                    <p className="text-2xl text-slate-500 font-bold max-w-2xl mx-auto">Claim your official Merit Certificate.</p>
                                </div>
                                <form onSubmit={generateCertificate} className="max-w-md mx-auto space-y-5">
                                    <input type="text" placeholder="Enter Student Name" value={studentName} onChange={e => setStudentName(e.target.value)} className="w-full px-8 py-5 rounded-[2rem] border-4 border-slate-50 bg-slate-50 focus:border-orange-400 outline-none font-black text-xl" required />
                                    <input type="text" placeholder="Grade (e.g. 5th Std)" value={studentClass} onChange={e => setStudentClass(e.target.value)} className="w-full px-8 py-5 rounded-[2rem] border-4 border-slate-50 bg-slate-50 focus:border-orange-400 outline-none font-black text-xl" required />
                                    <input type="text" placeholder="School Name" value={schoolName} onChange={e => setSchoolName(e.target.value)} className="w-full px-8 py-5 rounded-[2rem] border-4 border-slate-50 bg-slate-50 focus:border-orange-400 outline-none font-black text-xl" required />
                                    <button type="submit" disabled={generatingCert} className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-6 rounded-[2rem] font-black text-2xl shadow-2xl hover:scale-[1.03] uppercase tracking-tighter border-b-8 border-red-800">
                                        {generatingCert ? 'Crafting Merit...' : 'Generate Certificate 🏆'}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="space-y-10">
                                <h3 className="text-4xl font-black text-blue-800">Merit Certificate Ready!</h3>
                                <img src={URL.createObjectURL(certificateBlob)} alt="Merit Certificate" className="w-full rounded-[2rem] shadow-2xl border-4 border-slate-100 max-w-3xl mx-auto" />
                                <div className="flex flex-wrap justify-center gap-4">
                                    <button onClick={() => handleShareModal('cert')} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition flex items-center gap-3">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/></svg>
                                        Share Certificate
                                    </button>
                                    <a href={URL.createObjectURL(certificateBlob)} download={`${studentName}_Certificate.png`} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-slate-800 transition">Download Image</a>
                                    <button onClick={() => setShowCertificateForm(false)} className="bg-slate-100 text-slate-600 px-10 py-4 rounded-2xl font-black text-lg hover:bg-slate-200 transition">Close</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            <div ref={chatSectionRef} className="mt-20">
                <StoryChat story={story} />
            </div>

            {/* Comprehensive Share Controls */}
            <div className="mt-20 bg-white/60 backdrop-blur-xl border-4 border-white p-10 rounded-[4rem] shadow-2xl text-center space-y-10">
                <h3 className="text-3xl font-black text-slate-800 flex items-center justify-center gap-3">
                    <span className="text-4xl text-blue-500">✨</span> Share or Discuss
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <button onClick={handleDownloadAudio} disabled={!base64Audio} className="flex flex-col items-center gap-3 p-6 bg-white rounded-3xl border-2 border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all group">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">🎵</div>
                        <span className="font-black text-slate-700">Audio story</span>
                    </button>
                    <button onClick={() => handleShareModal('image')} disabled={!base64Image} className="flex flex-col items-center gap-3 p-6 bg-white rounded-3xl border-2 border-slate-100 hover:border-pink-200 hover:shadow-lg transition-all group">
                        <div className="w-16 h-16 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">🖼️</div>
                        <span className="font-black text-slate-700">Theme Image</span>
                    </button>
                    <button onClick={handleCopyStory} className="flex flex-col items-center gap-3 p-6 bg-white rounded-3xl border-2 border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all group">
                        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">{copySuccess ? '✅' : '📝'}</div>
                        <span className="font-black text-slate-700">{copySuccess ? 'Copied!' : 'Copy Story'}</span>
                    </button>
                    <button onClick={handleWhatsAppShare} className="flex flex-col items-center gap-3 p-6 bg-white rounded-3xl border-2 border-slate-100 hover:border-green-200 hover:shadow-lg transition-all group">
                        <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">💬</div>
                        <span className="font-black text-slate-700">WhatsApp</span>
                    </button>
                </div>

                <div className="flex flex-wrap justify-center gap-6 pt-6 border-t border-slate-100">
                    <button onClick={() => handleShareModal('text')} className="bg-slate-900 text-white px-10 py-4 rounded-full font-black text-lg hover:bg-blue-600 transition-all shadow-xl flex items-center gap-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.682 7.318l6 6M11.318 7.318l-6 6m6.364-6.364a9 9 0 11-12.728 0 9 9 0 0112.728 0z"/></svg>
                        Share Full Story (Text + Image)
                    </button>
                    <button onClick={() => chatSectionRef.current?.scrollIntoView({ behavior: 'smooth' })} className="bg-white border-4 border-blue-50 text-blue-600 px-10 py-4 rounded-full font-black text-lg hover:bg-blue-50 transition-all shadow-md">
                        Discuss with AI Narrator
                    </button>
                </div>
            </div>

            <div className="mt-16 text-center">
                <button onClick={onTryAnother} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-6 px-16 rounded-[2.5rem] hover:shadow-2xl transition-all transform hover:scale-105 uppercase tracking-tighter text-xl border-b-8 border-indigo-900">
                    ✨ Create Another Magic Story
                </button>
            </div>
        </div>
    );
};

export default StoryDisplay;