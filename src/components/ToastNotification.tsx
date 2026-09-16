import React, { useEffect } from 'react';
import { CheckCircle2, ShieldCheck, X } from 'lucide-react';

interface ToastNotificationProps {
  message: string | null;
  description?: string;
  onClose: () => void;
  darkMode: boolean;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  description,
  onClose,
  darkMode,
}) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] max-w-sm w-full pointer-events-auto animate-in slide-in-from-top-3 fade-in duration-200">
      <div
        className={`p-4 rounded-2xl border shadow-2xl flex items-start gap-3 transition-all ${
          darkMode
            ? 'bg-neutral-900/95 border-emerald-500/40 text-neutral-100 shadow-emerald-950/40'
            : 'bg-white border-emerald-500/40 text-neutral-900 shadow-emerald-500/10'
        }`}
      >
        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="font-bold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
            {message}
          </div>
          {description && (
            <div className="text-[11px] opacity-70 mt-0.5 leading-snug">
              {description}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="opacity-50 hover:opacity-100 p-1 rounded-lg text-xs"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
