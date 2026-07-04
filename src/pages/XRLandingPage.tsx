// FeelEd XR Lab — Landing / Hero screen (Session 5, Commit 4)
// Route: /xr  →  "தொடங்கு" → /xr/select (selector)
// Commit 4: emotional hero copy + CSS orbit animation (review items 1, 2)
import { useNavigate } from 'react-router-dom';
import './xr-landing.css';

const FEATURES = [
  { ico: '🧊', title: '3D + AR மாதிரிகள்', desc: 'சுழற்றி, zoom செய்து, AR-ல் உங்கள் அறையிலேயே பாருங்கள்.' },
  { ico: '🗣️', title: 'தமிழ் AI விளக்கம்', desc: 'உங்கள் வகுப்புக்கு ஏற்ப AI விளக்கும் — குரலிலும் கேட்கலாம்.' },
  { ico: '🏆', title: 'Quiz + சுருக்கம்', desc: 'கற்றதை உடனே சோதித்து, மதிப்பெண்ணுடன் சுருக்கம் பெறுங்கள்.' },
];

const STEPS = [
  { n: '1', t: 'வகுப்பு + பாடம் தேர்வு செய்யுங்கள்' },
  { n: '2', t: '3D மாதிரியை தொட்டு ஆராயுங்கள்' },
  { n: '3', t: 'AI-யுடன் கற்று, quiz-ல் வெல்லுங்கள்' },
];

export default function XRLandingPage() {
  const navigate = useNavigate();

  return (
    <div className="xrland-page">
      <div className="xrland-stars" aria-hidden="true" />

      <header className="xrland-hero">
        <div className="xrland-orbit" aria-hidden="true">
          <span className="xrland-sun">☀️</span>
          <span className="xrland-ring xrland-ring--1">
            <span className="xrland-planet">🌍</span>
          </span>
          <span className="xrland-ring xrland-ring--2">
            <span className="xrland-planet">🪐</span>
          </span>
        </div>

        <h1>
          FeelEd XR Lab <span className="xrland-beta">Beta</span>
        </h1>
        <p className="xrland-headline">
          இன்று புத்தகத்தை மட்டும் படிக்க வேண்டாம் —<br />
          கிரகங்களுக்குள் பயணம் செய்யுங்கள்
        </p>
        <p className="xrland-verbs">
          தொடுங்கள் · சுழற்றுங்கள் · கேளுங்கள் · கற்றுக்கொள்ளுங்கள்
        </p>
        <button className="xrland-cta" onClick={() => navigate('/xr/select')}>
          தொடங்கு 🚀
        </button>
        <p className="xrland-hint">Install தேவையில்லை · Browser-லேயே வேலை செய்யும்</p>
      </header>

      <section className="xrland-features" aria-label="சிறப்பம்சங்கள்">
        {FEATURES.map((f) => (
          <div className="xrland-card" key={f.title}>
            <span className="xrland-ico" aria-hidden="true">{f.ico}</span>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="xrland-steps" aria-label="எப்படி வேலை செய்கிறது">
        <h2>எப்படி வேலை செய்கிறது?</h2>
        <ol>
          {STEPS.map((s) => (
            <li key={s.n}>
              <span className="xrland-step-n" aria-hidden="true">{s.n}</span>
              {s.t}
            </li>
          ))}
        </ol>
      </section>

      <footer className="xrland-foot">
        <p>TN Samacheer · வகுப்பு 6–12 · தமிழ் / English / Tanglish</p>
      </footer>
    </div>
  );
}
