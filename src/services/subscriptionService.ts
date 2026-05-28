import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export type SubscriptionTier   = 'free' | 'plus';
export type SubscriptionStatus = 'active' | 'expired';

export interface Subscription {
    tier:      SubscriptionTier;
    status:    SubscriptionStatus;
    startedAt: any;
    expiresAt: any;
    source:    'free' | 'razorpay' | 'promo';
}

export interface DailyUsage {
    stories: number;
    exams:   number;
    date:    string; // YYYY-MM-DD
}

export const FREE_LIMITS = { stories: 3, exams: 2 } as const;

export async function getSubscription(uid: string): Promise<Subscription> {
    try {
        const ref  = doc(db, 'subscriptions', uid);
        const snap = await getDoc(ref);
        if (snap.exists()) return snap.data() as Subscription;
        const defaultSub: Subscription = {
            tier: 'free', status: 'active',
            startedAt: serverTimestamp(), expiresAt: null, source: 'free',
        };
        await setDoc(ref, defaultSub);
        return defaultSub;
    } catch {
        return { tier: 'free', status: 'active', startedAt: null, expiresAt: null, source: 'free' };
    }
}

export async function getDailyUsage(uid: string): Promise<DailyUsage> {
    try {
        const today = new Date().toISOString().split('T')[0];
        const ref   = doc(db, 'daily_usage', `${uid}_${today}`);
        const snap  = await getDoc(ref);
        if (snap.exists()) return snap.data() as DailyUsage;
        return { stories: 0, exams: 0, date: today };
    } catch {
        return { stories: 0, exams: 0, date: new Date().toISOString().split('T')[0] };
    }
}

export async function incrementUsage(uid: string, type: 'stories' | 'exams'): Promise<void> {
    try {
        const today = new Date().toISOString().split('T')[0];
        const ref   = doc(db, 'daily_usage', `${uid}_${today}`);
        const snap  = await getDoc(ref);
        if (snap.exists()) {
            await updateDoc(ref, { [type]: ((snap.data()[type] as number) || 0) + 1 });
        } else {
            await setDoc(ref, { stories: 0, exams: 0, date: today, [type]: 1 });
        }
    } catch { /* fire-and-forget */ }
}

export async function canUseFeature(
    uid: string,
    feature: 'stories' | 'exams',
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
    try {
        const [sub, usage] = await Promise.all([getSubscription(uid), getDailyUsage(uid)]);
        if (sub.tier === 'plus' && sub.status === 'active') {
            return { allowed: true, remaining: 999, limit: 999 };
        }
        const limit     = FREE_LIMITS[feature];
        const used      = usage[feature] || 0;
        const remaining = Math.max(0, limit - used);
        return { allowed: remaining > 0, remaining, limit };
    } catch {
        return { allowed: true, remaining: 3, limit: 3 };
    }
}

export function isPlusUser(sub: Subscription): boolean {
    return sub.tier === 'plus' && sub.status === 'active';
}
