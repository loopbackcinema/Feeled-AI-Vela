// FeelEd XR Lab — Lesson Screen (V1, Task 3 — AI live)
// Route: /xr/lesson
// 3D model-viewer + Gemini explanation + Ask AI + இன்னும் எளிதாக + மீண்டும்.

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '@google/model-viewer';
import {
  XR_TOPICS, XR_STYLES,
  type XRSelection,
} from '../data/xrTopics';
import './xr-lesson.css';

// model-viewer custom element-க்கு TypeScript declaration
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        src?: string;
        'ios-src'?: string;
        alt?: string;
        ar?: boolean;
        'ar-modes'?: string;
        'camera-controls'?: boolean;
        'auto-rotate'?: boolean;
        'shadow-intensity'?: string;
        'camera-orbit'?: string;
        exposure?: string;
        'touch-action'?: string;
        loading?: string;
      };
    }
  }
}

export default function XRLessonPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const selection = location.state as XRSelection | null;

  const [explanation, setExplanation] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showHint, setShowHint] = useState<boolean>(true);
  const [audioLoading, setAudioLoading] = useState<boolean>(false);
  const [playing, setPlaying] = useState<boolean>(false);
  const lastExplanation = useRef<string>('');
  const viewerRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCache = useRef<{ text: string; src: string } | null>(null);
  type XRQuizQ = { question: string; options: string[]; correctIndex: number; feedback: string[] };
  const [phase, setPhase] = useState<'explore' | 'quiz' | 'summary'>('explore');
  const [quiz, setQuiz] = useState<XRQuizQ[]>([]);
  const [qIdx, setQIdx] = useState<number>(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [summary, setSummary] = useState<string>('');

  const stopAudio = () => {
    audioRef.current?.pause();
    setPlaying(false);
  };

  const speakExplanation = async () => {
    if (playing) { stopAudio(); return; }
    const text = lastExplanation.current;
    if (!text) return;
    try {
      let src = audioCache.current?.text === text ? audioCache.current.src : null;
      if (!src) {
        setAudioLoading(true);
        const resp = await fetch('/api/concept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'xr', task: 'tts', text }),
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        if (!data.audio) throw new Error('empty');
        src = `data:audio/wav;base64,${data.audio}`;
        audioCache.current = { text, src };
      }
      const audio = new Audio(src);
      audioRef.current = audio;
      audio.onended = () => setPlaying(false);
      setPlaying(true);
      await audio.play();
    } catch {
      setPlaying(false);
      // voice never blocks learning — silent fail, text remains (EDS principle)
    } finally {
      setAudioLoading(false);
    }
  };

  const resetCamera = () => {
    const el = viewerRef.current;
    if (el) {
      el.cameraOrbit = '35deg 65deg 130%';
      el.fieldOfView = '30deg';
    }
  };

  const topic = XR_TOPICS.find(t => t.id === selection?.topicId);

  const callXR = useCallback(
    async (opts: { question?: string; easier?: boolean } = {}) => {
      if (!selection || !topic) return;
      setLoading(true);
      setError('');
      try {
        const resp = await fetch('/api/concept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'xr',
            topicName: selection.language === 'english' ? topic.nameEn : topic.nameTa,
            factSheet: topic.factSheet,
            grade: selection.grade,
            language: selection.language,
            style: selection.style,
            question: opts.question,
            easier: opts.easier,
            previousExplanation: opts.easier ? lastExplanation.current : undefined,
          }),
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        if (!data.explanation) throw new Error('Empty');
        stopAudio();
        lastExplanation.current = data.explanation;
        setExplanation(data.explanation);
      } catch {
        setError('விளக்கம் வர தாமதம் ஆகிறது — மீண்டும் முயற்சிக்கவும் 🔁');
      } finally {
        setLoading(false);
      }
    },
    [selection, topic]
  );
  const startQuiz = async () => {
    if (!selection || !topic) return;
    stopAudio();
    setLoading(true);
    setError('');
    try {
      const resp = await fetch('/api/concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'xr',
          task: 'quiz',
          topicName: selection.language === 'english' ? topic.nameEn : topic.nameTa,
          factSheet: topic.factSheet,
          grade: selection.grade,
          language: selection.language,
        }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      if (!data.questions?.length) throw new Error('Empty');
      setQuiz(data.questions);
      setQIdx(0);
      setPicked(null);
      setScore(0);
      setPhase('quiz');
    } catch {
      setError('வினாடி வினா வர தாமதம் — மீண்டும் முயற்சிக்கவும் 🔁');
    } finally {
      setLoading(false);
    }
  };

  const pickOption = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === quiz[qIdx].correctIndex) setScore(s => s + 1);
  };

  const fetchSummary = async () => {
    if (!selection || !topic) return;
    setPhase('summary');
    setLoading(true);
    try {
      const resp = await fetch('/api/concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'xr',
          task: 'summary',
          topicName: selection.language === 'english' ? topic.nameEn : topic.nameTa,
          factSheet: topic.factSheet,
          grade: selection.grade,
          language: selection.language,
        }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      setSummary(data.summary || '');
    } catch {
      setSummary('சுருக்கம் வரவில்லை — ஆனால் நீங்கள் பாடத்தை முடித்துவிட்டீர்கள்! 🎉');
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    if (qIdx < quiz.length - 1) {
      setQIdx(qIdx + 1);
      setPicked(null);
    } else {
      fetchSummary();
    }
  };

  // நேரடியாக /xr/lesson-க்கு வந்தால் selector-க்கு திருப்பு
  useEffect(() => {
    if (!selection || !topic || !topic.active) {
      navigate('/xr', { replace: true });
    }
  }, [selection, topic, navigate]);

  // Page திறந்ததும் முதல் விளக்கம்
  useEffect(() => {
    if (selection && topic?.active) callXR();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!selection || !topic || !topic.active) return null;

  const styleLabel = XR_STYLES.find(s => s.id === selection.style)?.labelTa ?? '';
  const isTamil = selection.language !== 'english';

  return (
    <div className="xrl-page">
      <header className="xrl-header">
        <button className="xrl-back" onClick={() => navigate('/xr')} aria-label="பின் செல்">
          ←
        </button>
        <div className="xrl-title">
          <h1>{topic.emoji} {isTamil ? topic.nameTa : topic.nameEn}</h1>
          <p>வகுப்பு {selection.grade} · {styleLabel}</p>
        </div>
        <span className="xrl-lang-badge">
          {selection.language === 'english' ? 'English' : selection.language === 'tanglish' ? 'Tanglish' : 'தமிழ்'}
        </span>
      </header>

      <div className="xrl-viewer-wrap">
        <model-viewer
          ref={viewerRef}
          onPointerDown={() => setShowHint(false)}
          src={topic.glbUrl}
          ios-src={topic.usdzUrl}
          alt={topic.nameEn}
          ar
          ar-modes="scene-viewer webxr quick-look"
          camera-controls
          auto-rotate
          shadow-intensity="0.6"
          camera-orbit="35deg 65deg 130%"
          exposure="1.15"
          touch-action="pan-y"
          loading="eager"
          style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
        >
          {topic.hotspots?.map((h, i) => (
            <button
              key={i}
              slot={`hotspot-${i}`}
              className="xrl-hotspot"
              data-position={h.position}
              data-normal="0 1 0"
            >
              {h.label}
            </button>
          ))}
        </model-viewer>
        {showHint && (
          <div className="xrl-drag-hint">👆 இழுத்து சுழற்றுங்கள் · pinch-ல் zoom</div>
        )}
        <button className="xrl-reset" onClick={resetCamera} aria-label="காட்சியை மீட்டமை">
          🔄 மீட்டமை
        </button>
      </div>

      <section className="xrl-panel">
        {phase === 'quiz' && quiz.length > 0 ? (
          <>
            <div className="xrl-explanation" aria-live="polite">
              <p className="xrl-text">📝 கேள்வி {qIdx + 1}/{quiz.length}</p>
              <p className="xrl-text">{quiz[qIdx].question}</p>
            </div>
            <div className="xrl-questions">
              {quiz[qIdx].options.map((opt, i) => (
                <button
                  key={i}
                  className="xrl-q"
                  disabled={picked !== null}
                  style={picked !== null ? {
                    opacity: i === quiz[qIdx].correctIndex || i === picked ? 1 : 0.45,
                    border: i === quiz[qIdx].correctIndex
                      ? '2px solid #22c55e'
                      : i === picked ? '2px solid #ef4444' : undefined,
                  } : undefined}
                  onClick={() => pickOption(i)}
                >
                  {opt}
                </button>
              ))}
            </div>
            {picked !== null && (
              <>
                <div className="xrl-explanation" aria-live="polite">
                  <p className="xrl-text">
                    {picked === quiz[qIdx].correctIndex ? '✅ ' : '💡 '}
                    {quiz[qIdx].feedback[picked]}
                  </p>
                </div>
                <div className="xrl-actions">
                  <button className="xrl-action" onClick={nextQuestion}>
                    {qIdx < quiz.length - 1 ? '➡️ அடுத்த கேள்வி' : '📋 சுருக்கம் பார்'}
                  </button>
                </div>
              </>
            )}
          </>
        ) : phase === 'summary' ? (
          <>
            <div className="xrl-explanation" aria-live="polite">
              {loading ? (
                <p className="xrl-thinking">🤖 சுருக்கம் தயாராகிறது…</p>
              ) : (
                <>
                  <p className="xrl-text">🏆 மதிப்பெண்: {score}/{quiz.length}</p>
                  <p className="xrl-text">{summary}</p>
                </>
              )}
            </div>
            <div className="xrl-actions">
              <button className="xrl-action" disabled={loading} onClick={startQuiz}>
                🔁 மீண்டும் வினாடி வினா
              </button>
              <button className="xrl-action" disabled={loading} onClick={() => setPhase('explore')}>
                👀 மீண்டும் ஆராய்
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="xrl-explanation" aria-live="polite">
              {loading ? (
                <p className="xrl-thinking">🤖 யோசிக்கிறேன்…</p>
              ) : error ? (
                <p className="xrl-error">{error}</p>
              ) : (
                <p className="xrl-text">{explanation}</p>
              )}
            </div>

            {topic.capabilities?.voice && explanation && !loading && (
              <button className="xrl-voice" onClick={speakExplanation} disabled={audioLoading}>
                {audioLoading ? '🔊 தயாராகிறது…' : playing ? '⏸ நிறுத்து' : '🔊 விளக்கத்தை கேள்'}
              </button>
            )}

            <div className="xrl-questions">
              {topic.suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  className="xrl-q"
                  disabled={loading}
                  onClick={() => callXR({ question: isTamil ? q.ta : q.en })}
                >
                  {isTamil ? q.ta : q.en}
                </button>
              ))}
            </div>

            <div className="xrl-actions">
              <button className="xrl-action" disabled={loading} onClick={() => callXR({ easier: true })}>
                😊 இன்னும் எளிதாக
              </button>
              <button className="xrl-action" disabled={loading} onClick={() => callXR()}>
                🔁 மீண்டும் சொல்
              </button>
              <button className="xrl-action" disabled={loading} onClick={startQuiz}>
                📝 வினாடி வினா
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
