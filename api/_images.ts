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
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
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
        const { grade, subject, medium, page, limit = 3 } = params;

        let q: FirebaseFirestore.Query = db.collection('textbook_images')
            .where('grade', '==', parseInt(grade))
            .where('subject', '==', subject)
            .where('medium', '==', medium);

        if (page) {
            q = q
                .where('page', '>=', page - 2)
                .where('page', '<=', page + 2);
        }

        const snapshot = await q.limit(limit).get();

        if (snapshot.empty) {
            const fallback = await db.collection('textbook_images')
                .where('grade', '==', parseInt(grade))
                .where('subject', '==', subject)
                .limit(limit)
                .get();
            return fallback.docs.map(doc => doc.data() as TextbookImage);
        }

        return snapshot.docs.map(doc => doc.data() as TextbookImage);
    } catch (e) {
        console.error('[images] fetch error:', e);
        return [];
    }
}
