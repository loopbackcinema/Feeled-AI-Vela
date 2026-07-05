// FeelEd XR Lab — Topic Registry
// LDS-000 compliant · Session 1 (V1 Build Plan) · DOC FREEZE v1.0
// Philosophy (XRS-01): code knows this schema, never the topic. New lesson = new data.

// ─── LDS-000 Block 5: AI Knowledge Sheet ───
export interface KnowledgeSheet {
  facts: string[];                                   // AI-ன் ஒரே source of truth
  misconceptions: { wrong: string; correct: string }[];
  analogies: string[];
  realWorld: string[];
  examTips: string[];
  vocabulary: { ta: string; en: string }[];
}

// ─── Amendment 1: capabilities — UI reads these to show/hide features ───
export interface XRCapabilities {
  ai: boolean;
  voice: boolean;      // Session 2 flips this
  quiz: boolean;       // Session 3 flips this
  experiment: boolean; // V1.5
  ar: boolean;
  vr: boolean;
}

export type XRStage = 'orientation' | 'explore' | 'experiment' | 'quiz' | 'summary';
export type XRStageType = XRStage; // V1.1 fix — page imports this name; alias keeps both valid

export interface XRTopic {
  // Block 1: Identity
  id: string;
  lessonId?: string;             // XR-001…
  nameTa: string;
  nameEn: string;
  subject: string;
  subjectTa: string;
  emoji: string;
  grades: number[];
  active: boolean;
  status?: 'draft' | 'review' | 'published';
  // Block 4: XR Asset
  glbUrl: string;
  usdzUrl: string;
  cameraOrbit?: string;
  hotspots?: { label: string; position: string }[];
  // Block 5 + legacy bridge
  knowledgeSheet?: KnowledgeSheet;
  factSheet: string;             // legacy field — live page reads this; derived from facts
  // Block 6
  suggestedQuestions: { ta: string; en: string }[];
  // Block 8
  quizConfig?: { count: number; types: string[] };
  // Amendments 1 & 2
  capabilities?: XRCapabilities;
  stages?: XRStage[];            // Amendment 2: flow is data, not code
}

// ═══════════════ XR-001: சூரிய குடும்பம் (LDS-001 lives here) ═══════════════
const SOLAR_KNOWLEDGE: KnowledgeSheet = {
  facts: [
    'இந்த 3D மாதிரியில் சூரியன், 8 கோள்கள், சிறுகோள் பட்டை (செவ்வாய்-வியாழன் இடையில்), நிலா (பூமிக்கு அருகில்), புளூட்டோ (நெப்டியூனுக்கு அப்பால்) காட்டப்பட்டுள்ளன; மற்ற துணைக்கோள்கள் மாதிரியில் இல்லை — அவற்றைப் பற்றி கூறும்போது "மாதிரியில் காட்டப்படவில்லை" என்று குறிப்பிடவும்.',
    'சூரிய குடும்பத்தில் 8 கோள்கள்: புதன், வெள்ளி, பூமி, செவ்வாய், வியாழன், சனி, யுரேனஸ், நெப்டியூன்.',
    'வெள்ளி மற்ற கோள்களுக்கு எதிர் திசையில் (retrograde) மிக மெதுவாக தன்னைத்தானே சுற்றுகிறது — வெள்ளியில் சூரியன் மேற்கில் உதிக்கும்! ஒரு சுழற்சிக்கு 243 பூமி நாட்கள் ஆகும். யுரேனஸ் சுமார் 98° சாய்ந்து பக்கவாட்டில் உருண்டு செல்கிறது. மாதிரியிலும் இவை காட்டப்பட்டுள்ளன — வெள்ளி எதிர் திசையில், யுரேனஸ் சாய்ந்து சுழல்வதை கவனிக்கவும்.',
    'சூரியன் ஒரு நட்சத்திரம் — கோள் அல்ல; சூரிய குடும்பத்தின் மொத்த நிறையில் 99.8% சூரியனே.',
    'கோள்கள் சூரியனை நீள்வட்டப் பாதையில் (elliptical orbit) சுற்றுகின்றன — இது கெப்லர் விதி.',
    'ஈர்ப்பு விசை (gravity) தான் கோள்களை சூரியனை சுற்ற வைக்கிறது.',
    'புதன் சூரியனுக்கு மிக அருகில்; நெப்டியூன் மிக தொலைவில்.',
    'வியாழன் மிகப்பெரிய கோள் — 1300 பூமிகள் அதற்குள் அடங்கும்; புதன் மிகச்சிறியது.',
    'செவ்வாய் சிவப்பாக இருப்பதற்கு காரணம் அதன் மேற்பரப்பில் உள்ள இரும்பு ஆக்சைடு (துரு).',
    'சனியின் வளையங்கள் பனிக்கட்டிகள் மற்றும் பாறைத் துண்டுகளால் ஆனவை.',
    'புளூட்டோ 2006-ல் குள்ளக்கோள் (dwarf planet) என மறு-வகைப்படுத்தப்பட்டது.',
    'பூமியில் மட்டும் உயிர்கள்: திரவ நீர், ஆக்சிஜன், சரியான வெப்பநிலை, காந்தப்புலம், ஓசோன் படலம் காரணங்கள்.',
    'உள் கோள்கள் (புதன்-செவ்வாய்) பாறைக் கோள்கள்; வெளி கோள்கள் (வியாழன்-நெப்டியூன்) வாயு/பனி ராட்சதர்கள்.',
    'பூமி தன்னைத்தானே சுற்ற 24 மணி (பகல்-இரவு); சூரியனை சுற்ற 365¼ நாட்கள் (ஒரு வருடம்).',
  ],
  misconceptions: [
    { wrong: 'சூரியன் ஒரு கோள்', correct: 'சூரியன் ஒரு நட்சத்திரம் — தன் சொந்த ஒளியை உமிழ்கிறது; கோள்கள் ஒளியை பிரதிபலிக்கின்றன மட்டுமே.' },
    { wrong: 'நிலா தன் சொந்த ஒளியில் பிரகாசிக்கிறது', correct: 'நிலா சூரிய ஒளியை பிரதிபலிக்கிறது — அதற்கு சொந்த ஒளி இல்லை.' },
    { wrong: 'கோடை-குளிர் காலங்கள் சூரியனுக்கு அருகில்/தொலைவில் போவதால் வருகின்றன', correct: 'பருவங்கள் பூமியின் அச்சு சாய்வால் (axial tilt 23.5°) வருகின்றன — தூரத்தால் அல்ல.' },
    { wrong: 'புளூட்டோ 9-வது கோள்', correct: '2006 முதல் புளூட்டோ குள்ளக்கோள் — அதன் சுற்றுப்பாதை பகுதியை அது சுத்தம் செய்யவில்லை என்பதே காரணம்.' },
  ],
  analogies: [
    'சூரிய குடும்பம் ஒரு கூட்டுக் குடும்பம் போல — சூரியன் தலைவர், கோள்கள் உறுப்பினர்கள்; எல்லோரும் தலைவரை சுற்றியே இயங்குகிறார்கள்.',
    'கயிற்றில் கல் கட்டி சுழற்றுவது போல — கயிறு = ஈர்ப்பு விசை, கல் = கோள்; கயிறு அறுந்தால் கல் பறந்து போகும்.',
    'சூரியன் ஒரு football என்றால், பூமி ஒரு கடுகு அளவு — அதுவும் 25 மீட்டர் தள்ளி!',
  ],
  realWorld: [
    'ISRO-வின் சந்திரயான், மங்கள்யான் — இந்த பாடம்தான் அவற்றின் அடிப்படை; space scientist ஒரு உண்மையான career.',
    'TV, GPS, வானிலை அறிக்கை — எல்லாம் பூமியை சுற்றும் செயற்கைக்கோள்களால்தான்.',
    'பகல்-இரவு, பருவங்கள், lunar/solar eclipse — அன்றாட வானம் இந்த பாடத்தின் live demo.',
  ],
  examTips: [
    'கோள்களின் வரிசை 1-mark கட்டாய கேள்வி — "புவெபூசெ வியாசயுநெ" என்று முதல் எழுத்துக்களில் மனப்பாடம் செய்யுங்கள்.',
    '2-mark: உள் கோள்கள் vs வெளி கோள்கள் வேறுபாடு (பாறை vs வாயு, சிறிய vs பெரிய, வளையம் இல்லை vs உண்டு).',
    '5-mark: "பூமியில் மட்டும் ஏன் உயிர்கள்" — நீர், ஆக்சிஜன், வெப்பநிலை, காந்தப்புலம், ஓசோன் — 5 புள்ளிகள் எழுதுங்கள்.',
  ],
  vocabulary: [
    { ta: 'கோள்', en: 'Planet' },
    { ta: 'நட்சத்திரம்', en: 'Star' },
    { ta: 'சுற்றுப்பாதை', en: 'Orbit' },
    { ta: 'ஈர்ப்பு விசை', en: 'Gravity' },
    { ta: 'குள்ளக்கோள்', en: 'Dwarf Planet' },
    { ta: 'துணைக்கோள்', en: 'Satellite / Moon' },
    { ta: 'அச்சு சாய்வு', en: 'Axial Tilt' },
  ],
};

export const XR_TOPICS: XRTopic[] = [
  {
    id: 'solar-system',
    lessonId: 'XR-001',
    nameTa: 'சூரிய குடும்பம்',
    nameEn: 'Solar System',
    subject: 'Science',
    subjectTa: 'அறிவியல்',
    emoji: '🪐',
    grades: [6, 7, 8, 9, 10, 11, 12],
    active: true,
    status: 'review',
    glbUrl: '/models/solar-system-v2.glb',
    usdzUrl: '',
    cameraOrbit: '35deg 65deg 130%',
    hotspots: [
      { label: 'சூரியன்', position: '0.00 2.50 0.00' },
      { label: 'புதன்', position: '2.79 0.69 -1.95' },
      { label: 'வெள்ளி', position: '2.96 0.85 3.52' },
      { label: 'பூமி', position: '1.55 0.87 -5.80' },
      { label: 'செவ்வாய்', position: '-6.41 0.77 3.70' },
      { label: 'வியாழன்', position: '-8.31 1.50 -4.80' },
      { label: 'சனி', position: '11.06 1.33 5.16' },
      { label: 'யுரேனஸ்', position: '-2.54 1.01 14.38' },
      { label: 'நெப்டியூன்', position: '-5.68 0.99 -15.60' },
    ],
    knowledgeSheet: SOLAR_KNOWLEDGE,
    factSheet: SOLAR_KNOWLEDGE.facts.join('\n'),  // legacy bridge — live page untouched
    suggestedQuestions: [
      { ta: 'பூமியில் மட்டும் ஏன் உயிர்கள் இருக்கின்றன?', en: 'Why does only Earth have life?' },
      { ta: 'செவ்வாய் ஏன் சிவப்பாக இருக்கிறது?', en: 'Why is Mars red?' },
      { ta: 'புளூட்டோ ஏன் கோள் இல்லை?', en: 'Why is Pluto not a planet?' },
      { ta: 'சனியின் வளையங்கள் எதனால் ஆனவை?', en: 'What are Saturn\'s rings made of?' },
      { ta: 'சூரியன் எவ்வளவு பெரியது?', en: 'How big is the Sun?' },
    ],
    quizConfig: { count: 3, types: ['mcq'] },
    capabilities: { ai: true, voice: true, quiz: false, experiment: false, ar: true, vr: false },
    stages: ['orientation', 'explore', 'quiz', 'summary'],
  },
  // ——— விரைவில் (V1-ல் disabled) ———
  { id: 'human-heart', nameTa: 'மனித இதயம்', nameEn: 'Human Heart', subject: 'Biology', subjectTa: 'உயிரியல்', emoji: '❤️', grades: [7,8,9,10,11,12], glbUrl: '', usdzUrl: '', active: false, factSheet: '', suggestedQuestions: [] },
  { id: 'electric-circuit', nameTa: 'மின்சுற்று', nameEn: 'Electric Circuit', subject: 'Physics', subjectTa: 'இயற்பியல்', emoji: '⚡', grades: [6,7,8,9,10,11,12], glbUrl: '', usdzUrl: '', active: false, factSheet: '', suggestedQuestions: [] },
  { id: 'atom', nameTa: 'அணு அமைப்பு', nameEn: 'Atom Structure', subject: 'Chemistry', subjectTa: 'வேதியியல்', emoji: '🧪', grades: [8,9,10,11,12], glbUrl: '', usdzUrl: '', active: false, factSheet: '', suggestedQuestions: [] },
  { id: 'volcano', nameTa: 'எரிமலை', nameEn: 'Volcano', subject: 'Geography', subjectTa: 'புவியியல்', emoji: '🌋', grades: [6,7,8,9,10], glbUrl: '', usdzUrl: '', active: false, factSheet: '', suggestedQuestions: [] },
  { id: 'dna', nameTa: 'DNA இரட்டை சுருள்', nameEn: 'DNA Double Helix', subject: 'Biology', subjectTa: 'உயிரியல்', emoji: '🧬', grades: [10,11,12], glbUrl: '', usdzUrl: '', active: false, factSheet: '', suggestedQuestions: [] },
  { id: 'photosynthesis', nameTa: 'ஒளிச்சேர்க்கை', nameEn: 'Photosynthesis', subject: 'Biology', subjectTa: 'உயிரியல்', emoji: '🌱', grades: [6,7,8,9,10,11,12], glbUrl: '', usdzUrl: '', active: false, factSheet: '', suggestedQuestions: [] },
  { id: 'geometry-3d', nameTa: '3D வடிவியல்', nameEn: '3D Geometry', subject: 'Mathematics', subjectTa: 'கணிதம்', emoji: '📐', grades: [8,9,10,11,12], glbUrl: '', usdzUrl: '', active: false, factSheet: '', suggestedQuestions: [] },
  { id: 'brihadeeswarar', nameTa: 'தஞ்சை பெரிய கோவில்', nameEn: 'Brihadeeswarar Temple', subject: 'History', subjectTa: 'வரலாறு', emoji: '🏛️', grades: [6,7,8,9,10,11,12], glbUrl: '', usdzUrl: '', active: false, factSheet: '', suggestedQuestions: [] },
  { id: 'water-cycle', nameTa: 'நீர் சுழற்சி', nameEn: 'Water Cycle', subject: 'Science', subjectTa: 'அறிவியல்', emoji: '💧', grades: [6,7,8,9], glbUrl: '', usdzUrl: '', active: false, factSheet: '', suggestedQuestions: [] },
];

export const XR_GRADES = [6, 7, 8, 9, 10, 11, 12];

export type XRLanguage = 'tamil' | 'english' | 'tanglish';
export type XRStyle = 'story' | 'simple' | 'exam';

export const XR_LANGUAGES: { id: XRLanguage; label: string }[] = [
  { id: 'tamil', label: 'தமிழ்' },
  { id: 'english', label: 'English' },
  { id: 'tanglish', label: 'Tanglish' },
];

export const XR_STYLES: { id: XRStyle; labelTa: string; emoji: string }[] = [
  { id: 'story', labelTa: 'கதை போல', emoji: '📖' },
  { id: 'simple', labelTa: 'எளிமையாக', emoji: '💡' },
  { id: 'exam', labelTa: 'Exam Focus', emoji: '🎯' },
];

export interface XRSelection {
  grade: number;
  topicId: string;
  language: XRLanguage;
  style: XRStyle;
}
