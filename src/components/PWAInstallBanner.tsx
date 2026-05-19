import React, { useState } from 'react';
import { usePWA } from '../hooks/usePWA';

const PWAInstallBanner: React.FC = () => {
  const { installPrompt, isInstalled, isIOS, install } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed) return null;

  if (isIOS) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-indigo-100 dark:border-indigo-900 p-4 flex items-center gap-3 animate-fade-in">
        <div className="text-3xl flex-shrink-0">📱</div>
        <div className="flex-1">
          <p className="font-black text-slate-800 dark:text-white text-sm">Install FeelEd AI</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Tap <span className="font-bold">Share</span> → <span className="font-bold">Add to Home Screen</span></p>
        </div>
        <button onClick={() => setDismissed(true)} className="text-slate-400 hover:text-slate-600 font-black text-lg flex-shrink-0">✕</button>
      </div>
    );
  }

  if (!installPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-indigo-100 dark:border-indigo-900 p-4 flex items-center gap-3 animate-fade-in">
      <div className="text-3xl flex-shrink-0">📱</div>
      <div className="flex-1">
        <p className="font-black text-slate-800 dark:text-white text-sm">Install FeelEd AI App</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">Fast, offline-ready learning app</p>
      </div>
      <button
        onClick={install}
        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-4 py-2 rounded-xl transition-all active:scale-95 flex-shrink-0"
      >
        Install
      </button>
      <button onClick={() => setDismissed(true)} className="text-slate-400 hover:text-slate-600 font-black flex-shrink-0">✕</button>
    </div>
  );
};

export default PWAInstallBanner;
