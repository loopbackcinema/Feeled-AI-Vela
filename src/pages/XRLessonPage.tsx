// FeelEd XR Lab — Lesson Screen (V1, Task 2)
// Route: /xr/lesson
// 3D model-viewer + AR button. AI explanation Task 3-ல் இணையும்.

import { useEffect } from 'react';
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

  // நேரடியாக /xr/lesson-க்கு வந்தால் (selection இல்லாமல்) selector-க்கு திருப்பு
  useEffect(() => {
    if (!selection) navigate('/xr', { replace: true });
  }, [selection, navigate]);

  if (!selection) return null;

  const topic = XR_TOPICS.find(t => t.id === selection.topicId);
  if (!topic || !topic.active) {
    navigate('/xr', { replace: true });
    return null;
  }

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

      {/* 3D Viewer — touch: rotate, pinch: zoom. AR button model-viewer தானாக காட்டும் */}
      <div className="xrl-viewer-wrap">
        <model-viewer
          src={topic.glbUrl}
          ios-src={topic.usdzUrl}
          alt={topic.nameEn}
          ar
          ar-modes="scene-viewer webxr quick-look"
          camera-controls
          auto-rotate
          shadow-intensity="1"
          touch-action="pan-y"
          loading="eager"
          style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
        >
          <div slot="progress-bar" className="xrl-progress">
            3D ஏற்றுகிறது…
          </div>
        </model-viewer>
        <p className="xrl-hint">விரலால் சுழற்றுங்கள் · இரு விரல்களால் zoom · 📱 AR button-ஐ தொட்டு உங்கள் அறையில் பாருங்கள்</p>
      </div>

      {/* Explanation panel — Task 3-ல் Gemini இணையும் */}
      <section className="xrl-panel">
        <div className="xrl-explanation">
          <p className="xrl-coming">
            🤖 AI விளக்கம் விரைவில் இங்கே வரும் (Task 3)
          </p>
        </div>

        <div className="xrl-questions">
          {topic.suggestedQuestions.map((q, i) => (
            <button key={i} className="xrl-q" disabled>
              {isTamil ? q.ta : q.en}
            </button>
          ))}
        </div>

        <div className="xrl-actions">
          <button className="xrl-action" disabled>😊 இன்னும் எளிதாக</button>
          <button className="xrl-action" disabled>🔁 மீண்டும் சொல்</button>
        </div>
      </section>
    </div>
  );
}
