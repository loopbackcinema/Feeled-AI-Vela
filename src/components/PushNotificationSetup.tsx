import React, { useEffect } from 'react';
import { getToken } from 'firebase/messaging';
import { getMessagingInstance } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const VAPID_KEY = 'BIijSycUE-6prosNa1OigyOeTfhlshMZOtWMvV_B-5y7ZB9HtARPWlFL2HOSFvys-JRi489jL4aP_8TFXavfU5A';

const PushNotificationSetup: React.FC = () => {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        const setup = async () => {
            try {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') return;

                const messaging = await getMessagingInstance();
                if (!messaging) return;

                const token = await getToken(messaging, { vapidKey: VAPID_KEY });
                if (!token) return;

                await setDoc(
                    doc(db, 'push_tokens', user.uid),
                    { token, updatedAt: serverTimestamp(), uid: user.uid },
                    { merge: true }
                );
            } catch (e) {
                console.warn('FeelEd push setup:', e);
            }
        };

        setup();
    }, [user]);

    return null;
};

export default PushNotificationSetup;
