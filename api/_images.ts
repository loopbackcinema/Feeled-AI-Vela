import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getDb() {
  if (!getApps().length) {
    const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64 || '';
    console.log('[_images] b64 length:', b64.length);
    if (!b64) throw new Error('FIREBASE_SERVICE_ACCOUNT_B64 not set');
    const sa = JSON.parse(Buffer.from(b64, 'base64').toString('utf-8'));
    console.log('[_images] project_id:', sa.project_id);
    initializeApp({ credential: cert(sa) });
  }
  return getFirestore();
}

export interface TextbookImage {
  url: string;
  grade: number;
  subject: string;
  medium: string;
  page: number;
  width: number;
  height: number;
}

export async function findTextbookImages(params: {
  grade: string;
  subject: string;
  medium: string;
  page?: number;
  limit?: number;
}): Promise<TextbookImage[]> {
  try {
    const db = getDb();
    const { grade, subject, medium, page, limit = 2 } = params;
    console.log(`[_images] query grade=${grade} subject=${subject} medium=${medium} page=${page}`);

    const gradeNum = parseInt(grade);

    // Try page-specific query first (±10 pages)
    if (page && page > 0) {
      const pageMin = Math.max(1, page - 10);
      const pageMax = page + 10;
      
      const snapshot = await db.collection('textbook_images')
        .where('grade', '==', gradeNum)
        .where('subject', '==', subject)
        .where('medium', '==', medium)
        .where('page', '>=', pageMin)
        .where('page', '<=', pageMax)
        .limit(limit)
        .get();

      console.log(`[_images] page-specific found=${snapshot.size} (pages ${pageMin}-${pageMax})`);

      if (!snapshot.empty) {
        return snapshot.docs.map((doc: any) => doc.data() as TextbookImage);
      }
    }

    // Fallback: subject + medium only
    const snapshot = await db.collection('textbook_images')
      .where('grade', '==', gradeNum)
      .where('subject', '==', subject)
      .where('medium', '==', medium)
      .limit(limit)
      .get();

    console.log(`[_images] fallback found=${snapshot.size}`);

    if (snapshot.empty) {
      const fallback2 = await db.collection('textbook_images')
        .where('grade', '==', gradeNum)
        .where('subject', '==', subject)
        .limit(limit)
        .get();
      return fallback2.docs.map((doc: any) => doc.data() as TextbookImage);
    }

    return snapshot.docs.map((doc: any) => doc.data() as TextbookImage);
  } catch (e) {
    console.error('[_images] ERROR:', e);
    return [];
  }
}
