// FeelEd XR Lab — Landing / Hero screen (Session 5, Commit 6)
// Route: /xr  →  "தொடங்கு" → /xr/select (selector)
// Commit 6: generic copy (எல்லா பாடங்களும்) + bilingual Tamil/English + AR/VR roadmap line
import { useNavigate } from 'react-router-dom';
import './xr-landing.css';

const FEATURES = [
  {
    ico: '🧊',
    ta: '3D + AR மாதிரிகள்', en: '3D + AR Models',
    desc: 'சுழற்றி, zoom செய்து, AR-ல் உங்கள் அறையிலேயே பாருங்கள்.',
    descEn: 'Rotate, zoom, and view in AR — right in your room.',
  },
  {
    ico: '🗣️',
    ta: 'AI ஆசிரியர்', en: 'AI Tutor',
    desc: 'உங்கள் வகுப்புக்கு ஏற்ப தமிழ் / English-ல் விளக்கும் — குரலிலும் கேட்கலாம்.',
    descEn: 'Explains at your grade level in Tamil or English — with voice.',
  },
  {
    ico: '🏆',
    ta: 'Quiz + சுருக்கம்', en: 'Quiz + Summary',
    desc: 'கற்றதை உடனே சோதித்து, மதிப்பெண்ணுடன் முடியுங்கள்.',
    descEn: 'Test what you learned and finish with a score.',
  },
];

const STEPS = [
  { n: '1', ta: 'வகுப்பு + பாடம் தேர்வு', en: 'Pick your grade & topic' },
  { n: '2', ta: '3D மாதிரியை தொட்டு ஆராயுங்கள்', en: 'Explore the 3D model' },
  { n: '3', ta: 'AI-யுடன் கற்று, quiz-ல் வெல்லுங்கள்', en: 'Learn with AI, win the quiz' },
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
          புத்தகத்தை மட்டும் படிக்காதீர்கள் —<br />
          பாடங்களுக்குள் நுழையுங்கள்
        </p>
        <p className="xrland-headline-en">
          Don't just read your lessons. Step inside them.
        </p>
        <p className="xrland-verbs">
          தொடுங்கள் · சுழற்றுங்கள் · கேளுங்கள் · கற்றுக்கொள்ளுங்கள்
          <span className="xrland-verbs-en">Touch · Rotate · Ask · Learn</span>
        </p>
        <button className="xrland-cta" onClick={() => navigate('/xr/select')}>
          தொடங்கு · Start 🚀
        </button>
        <p className="xrland-hint">
          அறிவியல் · கணிதம் · வரலாறு — எல்லா பாடங்களும் 3D-ல் · AR இப்போதே · VR விரைவில்
          <br />
          Every subject in 3D · AR today · VR coming soon · No install needed
        </p>
      </header>

      <section className="xrland-features" aria-label="சிறப்பம்சங்கள்">
        {FEATURES.map((f) => (
          <div className="xrland-card" key={f.en}>
            <span className="xrland-ico" aria-hidden="true">{f.ico}</span>
            <h3>{f.ta} <span className="xrland-en">{f.en}</span></h3>
            <p>{f.desc}</p>
            <p className="xrland-desc-en">{f.descEn}</p>
          </div>
        ))}
      </section>

      <section className="xrland-steps" aria-label="எப்படி வேலை செய்கிறது">
        <h2>எப்படி வேலை செய்கிறது? · How it works</h2>
        <ol>
          {STEPS.map((s) => (
            <li key={s.n}>
              <span className="xrland-step-n" aria-hidden="true">{s.n}</span>
              <span className="xrland-step-txt">
                {s.ta}
                <span className="xrland-en">{s.en}</span>
              </span>
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
