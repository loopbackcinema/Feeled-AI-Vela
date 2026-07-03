// FeelEd XR Lab — Topic Registry (V1)
// ஒரே ஒரு active topic: Solar System. மீதி "விரைவில்".
// Model swap செய்ய: glbUrl / usdzUrl மட்டும் மாற்றவும்.

export interface XRTopic {
  id: string;
  nameTa: string;
  nameEn: string;
  subject: string;
  subjectTa: string;
  emoji: string;
  grades: number[];
  glbUrl: string;   // Android / desktop
  usdzUrl: string;  // iOS AR Quick Look
  active: boolean;
  factSheet: string; // Gemini grounding — hallucination தடுக்க
  suggestedQuestions: { ta: string; en: string }[];
}

export const XR_TOPICS: XRTopic[] = [
  {
    id: 'solar-system',
    nameTa: 'சூரிய குடும்பம்',
    nameEn: 'Solar System',
    subject: 'Science',
    subjectTa: 'அறிவியல்',
    emoji: '🪐',
    grades: [6, 7, 8, 9, 10, 11, 12],
    glbUrl: '/models/solar-system.glb',  // bundled in public/models/
    usdzUrl: '',  // iOS USDZ — V2 (Android/desktop 3D+AR இப்போது வேலை செய்யும்)
    active: true,
    factSheet: `சூரிய குடும்பத்தில் 8 கோள்கள்: புதன், வெள்ளி, பூமி, செவ்வாய், வியாழன், சனி, யுரேனஸ், நெப்டியூன்.
சூரியன் ஒரு நட்சத்திரம்; சூரிய குடும்பத்தின் மொத்த நிறையில் 99.8% சூரியனே.
புதன் மிக அருகில்; நெப்டியூன் மிக தொலைவில். வியாழன் மிகப்பெரிய கோள்; புதன் மிகச்சிறியது.
செவ்வாய் சிவப்பாக இருப்பதற்கு காரணம் அதன் மேற்பரப்பில் உள்ள இரும்பு ஆக்சைடு (துரு).
புளூட்டோ 2006-ல் குள்ளக்கோள் (dwarf planet) என வகைப்படுத்தப்பட்டது.
பூமியில் மட்டும் உயிர்கள்: நீர், ஆக்சிஜன், சரியான வெப்பநிலை, காந்தப்புலம், ஓசோன் படலம் காரணங்கள்.
கோள்கள் சூரியனை நீள்வட்டப் பாதையில் சுற்றுகின்றன (கெப்லர் விதிகள்).`,
    suggestedQuestions: [
      { ta: 'பூமியில் மட்டும் ஏன் உயிர்கள் இருக்கின்றன?', en: 'Why does only Earth have life?' },
      { ta: 'செவ்வாய் ஏன் சிவப்பாக இருக்கிறது?', en: 'Why is Mars red?' },
      { ta: 'புளூட்டோ ஏன் கோள் இல்லை?', en: 'Why is Pluto not a planet?' },
      { ta: 'சூரியன் எவ்வளவு பெரியது?', en: 'How big is the Sun?' },
    ],
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
