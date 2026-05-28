import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
    Subscription, DailyUsage, FREE_LIMITS,
    getSubscription, getDailyUsage, isPlusUser,
} from '../services/subscriptionService';
import UpgradeModal from '../components/UpgradeModal';

interface SubscriptionContextValue {
    subscription:      Subscription | null;
    dailyUsage:        DailyUsage | null;
    isPlus:            boolean;
    canUse:            (feature: 'stories' | 'exams') => boolean;
    showUpgrade:       (reason?: string) => void;
    upgradeModalOpen:  boolean;
    upgradeReason:     string;
    closeUpgrade:      () => void;
    refreshSubscription: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextValue>({
    subscription:        null,
    dailyUsage:          null,
    isPlus:              false,
    canUse:              () => true,
    showUpgrade:         () => {},
    upgradeModalOpen:    false,
    upgradeReason:       '',
    closeUpgrade:        () => {},
    refreshSubscription: () => {},
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [subscription, setSubscription]     = useState<Subscription | null>(null);
    const [dailyUsage, setDailyUsage]         = useState<DailyUsage | null>(null);
    const [upgradeModalOpen, setUpgradeModal] = useState(false);
    const [upgradeReason, setUpgradeReason]   = useState('');

    const load = (uid: string) => {
        Promise.all([getSubscription(uid), getDailyUsage(uid)])
            .then(([sub, usage]) => { setSubscription(sub); setDailyUsage(usage); })
            .catch(() => {});
    };

    useEffect(() => {
        if (user?.uid) load(user.uid);
        else { setSubscription(null); setDailyUsage(null); }
    }, [user?.uid]);

    const canUse = (feature: 'stories' | 'exams'): boolean => {
        if (!subscription) return true; // optimistic while loading
        if (isPlusUser(subscription)) return true;
        const limit = FREE_LIMITS[feature];
        const used  = dailyUsage?.[feature] ?? 0;
        return used < limit;
    };

    const showUpgrade = (reason = 'feature') => {
        setUpgradeReason(reason);
        setUpgradeModal(true);
    };

    const closeUpgrade = () => setUpgradeModal(false);

    const refreshSubscription = () => { if (user?.uid) load(user.uid); };

    return (
        <SubscriptionContext.Provider value={{
            subscription,
            dailyUsage,
            isPlus:   subscription ? isPlusUser(subscription) : false,
            canUse,
            showUpgrade,
            upgradeModalOpen,
            upgradeReason,
            closeUpgrade,
            refreshSubscription,
        }}>
            {children}
            <UpgradeModal isOpen={upgradeModalOpen} onClose={closeUpgrade} reason={upgradeReason} />
        </SubscriptionContext.Provider>
    );
};
