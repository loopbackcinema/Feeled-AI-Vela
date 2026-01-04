
import React, { useState, useRef, useEffect } from 'react';

// --- Types & Constants ---

type PilotState = 'SELECT_CLASS' | 'SELECT_TOPIC' | 'INPUT_QUESTION' | 'PROCESSING' | 'PLAYING' | 'FEEDBACK' | 'QUIZ' | 'SUCCESS';

const CLASSES = [
    { id: '6', label_en: 'Class 6', label_ta: '6 ஆம் வகுப்பு' },
    { id: '7', label_en: 'Class 7', label_ta: '7 ஆம் வகுப்பு' },
    { id: '8', label_en: 'Class 8', label_ta: '8 ஆம் வகுப்பு' },
];

const TOPICS: Record<string, Array<{ id: string, label_en: string, label_ta: string }>> = {
    '6': [
        { id: 'light_shadow', label_en: 'Light & Shadow', label_ta: 'ஒளி மற்றும் நிழல்' },
        { id: 'electric_circuits', label_en: 'Simple Electric Circuits', label_ta: 'எளிய மின்சுற்றுகள்' },
        { id: 'phy_chem_changes', label_en: 'Physical & Chemical Changes', label_ta: 'இயற்பியல் & வேதியியல் மாற்றங்கள்' },
    ],
    '7': [
        { id: 'photosynthesis', label_en: 'Photosynthesis', label_ta: 'ஒளிச்சேர்க்கை' },
        { id: 'heat_temp', label_en: 'Heat & Temperature', label_ta: 'வெப்பம் & வெப்பநிலை' },
        { id: 'motion_time', label_en: 'Motion & Time', label_ta: 'இயக்கம் & நேரம்' },
    ],
    '8': [
        { id: 'force_pressure', label_en: 'Force & Pressure', label_ta: 'விசை & அழுத்தம்' },
        { id: 'sound', label_en: 'Sound', label_ta: 'ஒலி' },
        { id: 'chemical_effects', label_en: 'Chemical Effects of Electric Current', label_ta: 'மின்சாரத்தின் வேதியியல் விளைவுகள்' },
    ]
};

// --- Utils ---
const logInteraction = async (data: any) => {
    try {
        await fetch('/api/pilot/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ table: 'interactions', data }),
        });
    } catch (e) { console.error("Log failed", e); }
};

const ResearchPilot: React.FC = () => {
    // --- State ---
    const [state, setState] = useState<PilotState>('SELECT_CLASS');
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [selectedTopic, setSelectedTopic] = useState<any>(null);
    const [questionText, setQuestionText] = useState('');
    const [storyText, setStoryText] = useState('');
    const [audioBase64, setAudioBase64] = useState<string | null>(null);
    const [quizData, setQuizData] = useState<any[]>([]);
    const [quizIndex, setQuizIndex] = useState(0);
    const [quizScore, setQuizScore] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    
    // --- Refs ---
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

    // --- Actions ---

    const handleClassSelect = (clsId: string) => {
        setSelectedClass(clsId);
        setState('SELECT_TOPIC');
    };

    const handleTopicSelect = (topic: any) => {
        setSelectedTopic(topic);
        setState('INPUT_QUESTION');
        logInteraction({ class_level: selectedClass, topic: topic.id, action_type: 'started' });
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = handleRecordingStop;
            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            alert("Microphone access denied. Please allow microphone access.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setState('PROCESSING');
        }
    };

    const handleRecordingStop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); // Browsers record in webm/ogg
        const file = new File([audioBlob], "audio.webm", { type: 'audio/webm' });
        
        try {
            // 1. Send to ASR
            const formData = new FormData();
            formData.append('file', file);
            formData.append('model', 'saaras:v1'); // Sarvam Model
            
            // NOTE: Sending raw FormData via Vercel requires specific handling in the backend function.
            // Our api/pilot/sarvam-asr.ts handles piping.
            const asrRes = await fetch('/api/pilot/sarvam-asr', {
                method: 'POST',
                body: formData // No Content-Type header, browser sets it with boundary
            });
            const asrData = await asrRes.json();
            const transcript = asrData.transcript || "No speech detected";
            setQuestionText(transcript);
            logInteraction({ class_level: selectedClass, topic: selectedTopic.id, question_text: transcript, action_type: 'question_asked' });

            // 2. Generate Story
            await generateAndPlay(transcript, 'new');

        } catch (e) {
            console.error(e);
            alert("Error processing voice. Please try typing.");
            setState('INPUT_QUESTION');
        }
    };

    const handleTextSubmit = async () => {
        if (!questionText.trim()) return;
        setState('PROCESSING');
        logInteraction({ class_level: selectedClass, topic: selectedTopic.id, question_text: questionText, action_type: 'question_asked_text' });
        await generateAndPlay(questionText, 'new');
    };

    const generateAndPlay = async (q: string, mode: 'new' | 'explain_again') => {
        try {
            // Generate Text
            const genRes = await fetch('/api/pilot/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    classLevel: selectedClass, 
                    topic: selectedTopic.id, 
                    question: q,
                    mode
                })
            });
            const genData = await genRes.json();
            setStoryText(genData.tamil_story);
            if (genData.quiz && genData.quiz.length > 0) setQuizData(genData.quiz);

            // TTS
            const ttsRes = await fetch('/api/pilot/sarvam-tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: genData.tamil_story })
            });
            const ttsData = await ttsRes.json();
            setAudioBase64(ttsData.audio);
            
            setState('PLAYING');
            
        } catch (e) {
            console.error(e);
            alert("Error generating content.");
            setState('INPUT_QUESTION');
        }
    };

    useEffect(() => {
        if (state === 'PLAYING' && audioBase64 && audioPlayerRef.current) {
            audioPlayerRef.current.src = `data:audio/wav;base64,${audioBase64}`;
            audioPlayerRef.current.play().catch(e => console.log("Auto-play blocked", e));
            
            audioPlayerRef.current.onended = () => {
                setState('FEEDBACK');
            };
        }
    }, [state, audioBase64]);

    // --- Feedback Handlers ---

    const handleFeedback = (type: 'understood' | 'explain_again' | 'replay') => {
        logInteraction({ class_level: selectedClass, topic: selectedTopic.id, action_type: type });
        
        if (type === 'replay') {
            if (audioPlayerRef.current) {
                setState('PLAYING');
                audioPlayerRef.current.currentTime = 0;
                audioPlayerRef.current.play();
            }
        } else if (type === 'explain_again') {
            setState('PROCESSING');
            generateAndPlay(questionText, 'explain_again');
        } else if (type === 'understood') {
            setQuizIndex(0);
            setQuizScore(0);
            setState('QUIZ');
        }
    };

    // --- Quiz Handlers ---

    const handleQuizAnswer = (idx: number) => {
        const currentQ = quizData[quizIndex];
        const isCorrect = idx === currentQ.correct_answer_index;
        
        if (isCorrect) setQuizScore(p => p + 1);

        // Log answer
        // Note: For pilot, simplistic logging
        
        if (quizIndex < quizData.length - 1) {
            setQuizIndex(p => p + 1);
        } else {
            // Finish
            const finalScore = isCorrect ? quizScore + 1 : quizScore;
            // Log final result
             fetch('/api/pilot/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    table: 'quiz_results', 
                    data: { topic: selectedTopic.id, score: finalScore, total: quizData.length, answers: {} } 
                }),
            });
            setState('SUCCESS');
        }
    };

    // --- Render Helpers ---

    const renderHeader = () => (
        <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-slate-800">FeelEd AI – Science Voice Learning</h1>
            <p className="text-indigo-600 font-bold">ஃபீல்எட் AI – அறிவியல் குரல் வழி கற்றல்</p>
            <div className="mt-2 inline-block bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full border border-yellow-300">
                Research Pilot (Class 6-8)
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
            {renderHeader()}

            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 p-6 relative min-h-[500px] flex flex-col">
                
                {/* 1. SELECT CLASS */}
                {state === 'SELECT_CLASS' && (
                    <div className="flex flex-col gap-4 flex-grow justify-center">
                        <h2 className="text-xl font-bold text-center mb-4">Select Class / வகுப்பு தேர்வு</h2>
                        {CLASSES.map(cls => (
                            <button key={cls.id} onClick={() => handleClassSelect(cls.id)} className="p-6 rounded-2xl bg-indigo-50 border-2 border-indigo-100 hover:bg-indigo-100 hover:border-indigo-300 transition-all text-left group">
                                <div className="text-lg font-black text-slate-800">{cls.label_en}</div>
                                <div className="text-md text-slate-600 group-hover:text-indigo-700">{cls.label_ta}</div>
                            </button>
                        ))}
                    </div>
                )}

                {/* 2. SELECT TOPIC */}
                {state === 'SELECT_TOPIC' && (
                    <div className="flex flex-col gap-4 flex-grow">
                        <button onClick={() => setState('SELECT_CLASS')} className="text-sm text-slate-400 font-bold mb-2">← Back / பின் செல்ல</button>
                        <h2 className="text-xl font-bold text-center mb-4">Select Topic / தலைப்பு தேர்வு</h2>
                        {TOPICS[selectedClass]?.map(topic => (
                            <button key={topic.id} onClick={() => handleTopicSelect(topic)} className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-100 hover:bg-emerald-100 hover:border-emerald-300 transition-all text-left">
                                <div className="text-lg font-bold text-slate-800">{topic.label_en}</div>
                                <div className="text-sm text-slate-600">{topic.label_ta}</div>
                            </button>
                        ))}
                    </div>
                )}

                {/* 3. INPUT QUESTION */}
                {state === 'INPUT_QUESTION' && (
                    <div className="flex flex-col items-center flex-grow justify-center gap-8">
                        <div className="text-center space-y-2">
                            <h2 className="text-xl font-bold">Ask using voice</h2>
                            <p className="text-slate-500">உங்கள் சந்தேகத்தை குரலில் கேளுங்கள்</p>
                        </div>

                        <button 
                            onMouseDown={startRecording}
                            onMouseUp={stopRecording}
                            onTouchStart={startRecording}
                            onTouchEnd={stopRecording}
                            className={`w-32 h-32 rounded-full flex items-center justify-center text-5xl transition-all shadow-2xl ${isRecording ? 'bg-red-500 scale-110 ring-8 ring-red-200' : 'bg-indigo-600 hover:bg-indigo-700 ring-4 ring-indigo-100'}`}
                        >
                            🎙️
                        </button>
                        <p className="text-sm text-slate-400 font-bold animate-pulse">
                            {isRecording ? "Listening... (Release to send)" : "Press & Hold to Speak"}
                        </p>

                        <div className="w-full mt-8 pt-6 border-t border-slate-100">
                             <input 
                                type="text" 
                                placeholder="Or type here / அல்லது தட்டச்சு செய்க"
                                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 mb-2"
                                value={questionText}
                                onChange={e => setQuestionText(e.target.value)}
                             />
                             <button onClick={handleTextSubmit} className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold">Ask / கேட்க</button>
                        </div>
                    </div>
                )}

                {/* 4. PROCESSING */}
                {state === 'PROCESSING' && (
                    <div className="flex flex-col items-center justify-center flex-grow space-y-6">
                        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="font-bold text-slate-600 text-center">Thinking...<br/>சிந்தித்துக்கொண்டிருக்கிறது...</p>
                    </div>
                )}

                {/* 5. PLAYING */}
                {state === 'PLAYING' && (
                    <div className="flex flex-col items-center justify-center flex-grow space-y-8">
                        <div className="w-40 h-40 bg-indigo-50 rounded-full flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-indigo-200 rounded-full animate-ping opacity-20"></div>
                            <span className="text-6xl">🔊</span>
                        </div>
                        <div className="text-center space-y-2">
                            <h2 className="text-xl font-bold text-slate-800">Listen Carefully</h2>
                            <p className="text-slate-500">கவனமாக கேளுங்கள்</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl w-full text-sm text-slate-400 max-h-32 overflow-y-auto">
                            {storyText}
                        </div>
                        <audio ref={audioPlayerRef} className="hidden" />
                    </div>
                )}

                {/* 6. FEEDBACK */}
                {state === 'FEEDBACK' && (
                    <div className="flex flex-col justify-center flex-grow space-y-6">
                        <div className="text-center mb-4">
                            <h2 className="text-2xl font-black">Did you understand?</h2>
                            <p className="text-slate-500 text-lg">உங்களுக்கு புரிந்ததா?</p>
                        </div>

                        <button onClick={() => handleFeedback('understood')} className="py-6 bg-green-100 text-green-800 rounded-2xl font-black text-xl border-2 border-green-200 hover:bg-green-200 transition-colors">
                            ✅ Yes / ஆம்
                        </button>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => handleFeedback('explain_again')} className="py-4 bg-orange-50 text-orange-800 rounded-2xl font-bold border-2 border-orange-100 hover:bg-orange-100">
                                ✋ Explain Again<br/><span className="text-xs">விளக்கம் வேண்டும்</span>
                            </button>
                            <button onClick={() => handleFeedback('replay')} className="py-4 bg-blue-50 text-blue-800 rounded-2xl font-bold border-2 border-blue-100 hover:bg-blue-100">
                                🔄 Replay<br/><span className="text-xs">மீண்டும் கேட்க</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* 7. QUIZ */}
                {state === 'QUIZ' && quizData.length > 0 && (
                    <div className="flex flex-col justify-center flex-grow space-y-6">
                        <div className="flex justify-between items-center text-xs font-black text-slate-400 uppercase tracking-widest">
                            <span>Quiz</span>
                            <span>{quizIndex + 1} / {quizData.length}</span>
                        </div>
                        
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 min-h-[120px] flex items-center justify-center">
                            <h3 className="text-xl font-bold text-center text-slate-800">
                                {quizData[quizIndex].question_ta}
                            </h3>
                        </div>

                        <div className="space-y-3">
                            {quizData[quizIndex].options_ta.map((opt: string, idx: number) => (
                                <button 
                                    key={idx} 
                                    onClick={() => handleQuizAnswer(idx)}
                                    className="w-full p-4 rounded-xl bg-white border-2 border-slate-100 font-bold text-slate-700 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
                                >
                                    {String.fromCharCode(65 + idx)}. {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 8. SUCCESS */}
                {state === 'SUCCESS' && (
                    <div className="flex flex-col items-center justify-center flex-grow space-y-8 text-center animate-fade-in">
                        <div className="text-8xl">🎉</div>
                        <h2 className="text-3xl font-black text-slate-800">
                            {quizScore > 0 ? "Congratulations!" : "Good Effort!"}
                        </h2>
                        <p className="text-xl text-slate-500 font-bold">
                            {quizScore > 0 ? "வாழ்த்துகள்!" : "முயற்சிக்கு பாராட்டுக்கள்!"}
                        </p>
                        
                        <div className="bg-indigo-50 p-6 rounded-2xl">
                            <p className="text-indigo-800 font-bold">Score: {quizScore} / {quizData.length}</p>
                        </div>

                        <button onClick={() => setState('SELECT_CLASS')} className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold shadow-lg">
                            Start New Topic
                        </button>
                    </div>
                )}

            </div>
            
            <p className="mt-8 text-xs text-slate-400 font-mono">Session ID: {Date.now().toString().slice(-6)} | Channel: Web-Voice</p>
        </div>
    );
};

export default ResearchPilot;
