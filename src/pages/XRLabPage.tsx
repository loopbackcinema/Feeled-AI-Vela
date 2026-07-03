// FeelEd XR Lab — Selector Screen (V1, Task 1)
// Route: /xr
// Defaults உடன் வருகிறது — ஒன்றும் மாற்றாமல் "தொடங்கு" அழுத்தினாலும் ஓடும்.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  XR_TOPICS, XR_GRADES, XR_LANGUAGES, XR_STYLES,
  type XRLanguage, type XRStyle, type XRSelection,
} from '../data/xrTopics';
import './xr-lab.css';

export default function XRLabPage() {
  const navigate = useNavigate();
  const [grade, setGrade] = useState<number>(8);
  const [topicId, setTopicId] = useState<string>('solar-system');
  const [language, setLanguage] = useState<XRLanguage>('tamil');
  const [style, setStyle] = useState<XRStyle>('simple');

  const visibleTopics = XR_TOPICS.filter(t => t.grades.includes(grade));

  const handleStart = () => {
    const selection: XRSelection = { grade, topicId, language, style };
    // Task 2-ல் /xr/lesson route வரும்; state வழியே selection போகும்
    navigate('/xr/lesson', { state: selection });
  };

  const selectedTopic = XR_TOPICS.find(t => t.id === topicId);
  const canStart = selectedTopic?.active === true;

  return (
    <div className="xr-page">
      <header className="xr-header">
        <h1>FeelEd XR Lab</h1>
        <span className="xr-beta">Beta</span>
        <p className="xr-tagline">உலகை 3D-ல் பாருங்கள் ✨</p>
      </header>

      {/* 1. Grade */}
      <section className="xr-section">
        <h2>வகுப்பு</h2>
        <div className="xr-chip-row">
          {XR_GRADES.map(g => (
            <button
              key={g}
              className={`xr-chip ${grade === g ? 'xr-chip--on' : ''}`}
              onClick={() => setGrade(g)}
            >
              {g}
            </button>
          ))}
        </div>
      </section>

      {/* 2. Topic */}
      <section className="xr-section">
        <h2>பாடம் தேர்வு</h2>
        <div className="xr-topic-grid">
          {visibleTopics.map(t => (
            <button
              key={t.id}
              className={[
                'xr-topic-card',
                topicId === t.id ? 'xr-topic-card--on' : '',
                !t.active ? 'xr-topic-card--soon' : '',
              ].join(' ')}
              onClick={() => t.active && setTopicId(t.id)}
              disabled={!t.active}
            >
              <span className="xr-topic-emoji">{t.emoji}</span>
              <span className="xr-topic-name">{t.nameTa}</span>
              <span className="xr-topic-badge">{t.subjectTa}</span>
              {!t.active && <span className="xr-soon">விரைவில்</span>}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Language */}
      <section className="xr-section">
        <h2>மொழி</h2>
        <div className="xr-chip-row">
          {XR_LANGUAGES.map(l => (
            <button
              key={l.id}
              className={`xr-chip ${language === l.id ? 'xr-chip--on' : ''}`}
              onClick={() => setLanguage(l.id)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </section>

      {/* 4. Style */}
      <section className="xr-section">
        <h2>விளக்க முறை</h2>
        <div className="xr-chip-row">
          {XR_STYLES.map(s => (
            <button
              key={s.id}
              className={`xr-chip ${style === s.id ? 'xr-chip--on' : ''}`}
              onClick={() => setStyle(s.id)}
            >
              {s.emoji} {s.labelTa}
            </button>
          ))}
        </div>
      </section>

      <button className="xr-start" onClick={handleStart} disabled={!canStart}>
        தொடங்கு 🚀
      </button>
    </div>
  );
}
