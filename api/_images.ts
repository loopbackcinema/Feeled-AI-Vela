import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Hardcoded service account — avoids env var parsing issues
const SERVICE_ACCOUNT = {
    type: 'service_account',
    project_id: 'gen-lang-client-0342576140',
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || '',
    private_key: (process.env.FIREBASE_PRIVATE_KEY || '')
        .replace(/\\\\n/g, '\n')
        .replace(/\\n/g, '\n'),
    client_email: 'firebase-adminsdk-fbsvc@gen-lang-client-0342576140.iam.gserviceaccount.com',
    client_id: '',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
};

function getDb() {
    if (!getApps().length) {
        console.log('[_images] init Firebase, key starts:', SERVICE_ACCOUNT.private_key.slice(0, 50), 'includes newline:', SERVICE_ACCOUNT.private_key.includes('\n'));
        initializeApp({
            credential: cert(SERVICE_ACCOUNT as any),
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
    try {
        const db = getDb();
        const { grade, subject, medium, limit = 2 } = params;

        console.log(`[_images] query grade=${grade} subject=${subject} medium=${medium}`);

        const snapshot = await db.collection('textbook_images')
            .where('grade', '==', parseInt(grade))
            .where('subject', '==', subject)
            .where('medium', '==', medium)
            .limit(limit)
            .get();

        console.log(`[_images] found=${snapshot.size}`);

        if (snapshot.empty) {
            const fallback = await db.collection('textbook_images')
                .where('grade', '==', parseInt(grade))
                .where('subject', '==', subject)
                .limit(limit)
                .get();
            return fallback.docs.map((doc: any) => doc.data() as TextbookImage);
        }

        return snapshot.docs.map((doc: any) => doc.data() as TextbookImage);
    } catch (e) {
        console.error('[_images] ERROR:', e);
        return [];
    }
}
