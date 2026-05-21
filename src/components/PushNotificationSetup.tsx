import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getToken } from 'firebase/messaging';
import { getMessagingInstance } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const VAPID_KEY = 'BIijSycUE-6prosNa1OigyOeTfhlshMZOtWMvV_B-5y7ZB9HtARPWlFL2HOSFvys-JRi489jL4aP_8TFXavfU5A';

const registerToken = async (uid: string) => {
    try {
        const messaging = await getMessagingInstance();
        if (!messaging) return;
        const token = await getToken(messaging, { vapidKey: VAPID_KEY });
        if (!token) return;
        await setDoc(
            doc(db, 'push_tokens', uid),
            { token, updatedAt: serverTimestamp(), uid },
            { merge: true }
        );
    } catch (e) {
        console.warn('FeelEd push token:', e);
    }
};

const PushNotificationSetup: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        if (!user) return;
        if (!('Notification' in window)) return;

        const perm = Notification.permission;

        if (perm === 'granted') {
            registerToken(user.uid);
        } else if (perm === 'default') {
            const dismissed = localStorage.getItem('push-dismissed') === 'true';
            if (!dismissed) setShowBanner(true);
        }
        // 'denied' — do nothing
    }, [user]);

    const handleEnable = async () => {
        setShowBanner(false);
        try {
            const perm = await Notification.requestPermission();
            if (perm === 'granted' && user) {
                await registerToken(user.uid);
            }
        } catch (e) {
            console.warn('FeelEd push enable:', e);
        }
    };

    const handleDismiss = () => {
        localStorage.setItem('push-dismissed', 'true');
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 999,
            background: '#0c0c1c',
            border: '0.5px solid #1e1e35',
            borderRadius: 16,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            minWidth: 280,
            maxWidth: 360,
        }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>🔔</span>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: '#eeeef8', fontSize: 13, fontWeight: 700, margin: 0 }}>
                    {t('push.title')}
                </p>
                <p style={{ color: '#4a4a6a', fontSize: 11, margin: '2px 0 0' }}>
                    {t('push.subtitle')}
                </p>
            </div>
            <button
                onClick={handleEnable}
                style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none', borderRadius: 10, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
            >
                {t('push.enable')}
            </button>
            <button
                onClick={handleDismiss}
                style={{ background: 'none', border: 'none', color: '#4a4a6a', fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: '0 2px', flexShrink: 0 }}
                aria-label="Dismiss"
            >
                {t('push.dismiss')}
            </button>
        </div>
    );
};

export default PushNotificationSetup;
