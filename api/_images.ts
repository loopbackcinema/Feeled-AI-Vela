// Server-side helper to fetch textbook images from Firestore.
// Requires FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY env vars.
// Returns [] gracefully when credentials are not configured.

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getDb() {
    if (!getApps().length) {
        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: (process.env.FIREBASE_PRIVATE_KEY || '')
                    .replace(/\\\\n/g, '\n')
                    .replace(/\\n/g, '\n'),
            }),
        });
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
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
        return [];
    }
    try {
        const db = getDb();
        const { grade, subject, medium, limit = 2 } = params;

        console.log(`[_images] Querying: grade=${grade}(${typeof grade}) subject="${subject}" medium="${medium}"`);

        const gradeNum = parseInt(grade);
        console.log(`[_images] gradeNum=${gradeNum}`);

        // Simple 3-field query (no page filter — avoid composite index issues)
        const snapshot = await db.collection('textbook_images')
            .where('grade', '==', gradeNum)
            .where('subject', '==', subject)
            .where('medium', '==', medium)
            .limit(limit)
            .get();

        console.log(`[_images] snapshot.size=${snapshot.size} empty=${snapshot.empty}`);

        if (snapshot.empty) {
            console.log(`[_images] Trying fallback without medium...`);
            // Fallback: grade + subject only
            const fallback = await db.collection('textbook_images')
                .where('grade', '==', gradeNum)
                .where('subject', '==', subject)
                .limit(limit)
                .get();
            console.log(`[_images] fallback.size=${fallback.size}`);
            return fallback.docs.map((doc: any) => doc.data() as TextbookImage);
        }

        return snapshot.docs.map((doc: any) => doc.data() as TextbookImage);
    } catch (e) {
        console.error('[_images] ERROR:', e);
        return [];
    }
}
