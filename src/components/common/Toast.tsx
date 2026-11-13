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
            className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl backdrop-blur-md transition-all duration-200 flex items-start gap-3 bg-[#141414]/98 text-white ${
              isSuccess
                ? 'border-[#FFC928]/40'
                : isError
                ? 'border-[#E50914]/50'
                : 'border-[#FF7900]/40'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-[#FFC928]" />}
              {isError && <AlertTriangle className="w-5 h-5 text-[#E50914]" />}
              {!isSuccess && !isError && <Info className="w-5 h-5 text-[#FF7900]" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold tracking-tight text-white">{toast.title}</p>
              <p className="text-xs text-[#A3A3A3] mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 text-[#A3A3A3] hover:text-white p-1 rounded transition-colors cursor-pointer"
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
