import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-200 flex items-start gap-3 ${
              isSuccess
                ? 'bg-slate-900/95 text-white border-blue-500/30 dark:bg-slate-900 dark:border-blue-500/40'
                : isError
                ? 'bg-rose-950/95 text-white border-rose-500/30 dark:bg-rose-950 dark:border-rose-500/40'
                : 'bg-slate-900/95 text-white border-slate-700 dark:bg-slate-900 dark:border-slate-800'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
              {isError && <AlertTriangle className="w-5 h-5 text-rose-400" />}
              {!isSuccess && !isError && <Info className="w-5 h-5 text-sky-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold tracking-tight text-white">{toast.title}</p>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 text-slate-400 hover:text-white p-1 rounded transition-colors"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
