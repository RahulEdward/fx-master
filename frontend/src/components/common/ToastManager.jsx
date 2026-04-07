import React, { useState, useCallback } from 'react';

let toastFn = null;

export function showToast(type, title, message) {
  if (toastFn) toastFn({ type, title, message, id: Date.now() });
}

export function ToastManager() {
  const [toasts, setToasts] = useState([]);

  toastFn = useCallback((t) => {
    setToasts(prev => [...prev, t]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 4000);
  }, []);

  const colors = {
    success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    error: 'border-red-500/40 bg-red-500/10 text-red-300',
    info: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
    warning: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  };

  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={`pointer-events-auto px-4 py-3 rounded border ${colors[t.type] || colors.info} backdrop-blur-xl shadow-2xl animate-in slide-in-from-right duration-300 max-w-sm`}
        >
          <div className="flex items-start gap-2">
            <span className="text-xs font-bold mt-0.5">{icons[t.type]}</span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider">{t.title}</p>
              {t.message && <p className="text-[10px] opacity-70 mt-0.5">{t.message}</p>}
            </div>
            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="ml-auto text-xs opacity-50 hover:opacity-100">✕</button>
          </div>
        </div>
      ))}
    </div>
  );
}
