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
  const lastExplanation = useRef<string>('');

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
      </header>

      <div className="xrl-viewer-wrap">
        <model-viewer
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
        <p className="xrl-hint">விரலால் சுழற்றுங்கள் · இரு விரல்களால் zoom · 📱 AR button-ஐ தொட்டு உங்கள் அறையில் பாருங்கள்</p>
      </div>

      <section className="xrl-panel">
        <div className="xrl-explanation" aria-live="polite">
          {loading ? (
            <p className="xrl-thinking">🤖 யோசிக்கிறேன்…</p>
          ) : error ? (
            <p className="xrl-error">{error}</p>
          ) : (
            <p className="xrl-text">{explanation}</p>
          )}
        </div>

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
        </div>
      </section>
    </div>
  );
}
