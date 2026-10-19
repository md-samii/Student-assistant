import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, Trash2, X, Info } from 'lucide-react';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
}

export interface AlertOptions {
  title?: string;
  message: string;
  buttonText?: string;
  type?: 'error' | 'warning' | 'info' | 'success';
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions | string) => Promise<boolean>;
  alert: (options: AlertOptions | string) => Promise<void>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for confirm modal
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    isAlertOnly?: boolean;
  }>({
    isOpen: false,
    options: { message: '' },
    isAlertOnly: false,
  });

  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions | string): Promise<boolean> => {
    const normalized: ConfirmOptions =
      typeof options === 'string'
        ? { message: options }
        : options;

    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setConfirmState({
        isOpen: true,
        options: normalized,
        isAlertOnly: false,
      });
    });
  }, []);

  const alert = useCallback((options: AlertOptions | string): Promise<void> => {
    const normalized: AlertOptions =
      typeof options === 'string'
        ? { message: options }
        : options;

    return new Promise<void>((resolve) => {
      resolverRef.current = () => resolve();
      setConfirmState({
        isOpen: true,
        options: {
          title: normalized.title || (normalized.type === 'error' ? 'Error' : 'Notice'),
          message: normalized.message,
          confirmText: normalized.buttonText || 'Got it',
          type: normalized.type === 'error' ? 'danger' : normalized.type || 'info',
        },
        isAlertOnly: true,
      });
    });
  }, []);

  const handleClose = (result: boolean) => {
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }
  };

  const { isOpen, options, isAlertOnly } = confirmState;
  const modalType = options.type || 'danger';

  // Icon selector based on type
  const renderIcon = () => {
    switch (modalType) {
      case 'danger':
        return (
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 shadow-sm mb-4">
            <Trash2 className="w-6 h-6 stroke-[2.2]" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shadow-sm mb-4">
            <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
          </div>
        );
      case 'success':
        return (
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#134e2f] shadow-sm mb-4">
            <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
          </div>
        );
      case 'info':
      default:
        return (
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#134e2f] shadow-sm mb-4">
            <Info className="w-6 h-6 stroke-[2.2]" />
          </div>
        );
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm, alert }}>
      {children}

      {/* Custom Confirmation / Alert Card Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => handleClose(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md bg-white rounded-[28px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-[#e2e8e2] overflow-hidden p-6 sm:p-7 relative text-center animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Background Accent */}
            <div
              className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 rounded-full blur-2xl pointer-events-none opacity-40 ${
                modalType === 'danger'
                  ? 'bg-rose-400'
                  : modalType === 'warning'
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
            />

            {/* Close 'X' Button */}
            <button
              onClick={() => handleClose(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon */}
            <div className="relative z-10">{renderIcon()}</div>

            {/* Title */}
            {options.title && (
              <h3 className="relative z-10 text-lg sm:text-xl font-extrabold text-[#181c1b] tracking-tight">
                {options.title}
              </h3>
            )}

            {/* Message Body */}
            <p className="relative z-10 text-xs sm:text-sm text-[#404942] leading-relaxed mt-2 whitespace-pre-line">
              {options.message}
            </p>

            {/* Actions */}
            <div className="relative z-10 mt-6 flex items-center gap-3">
              {!isAlertOnly && (
                <button
                  type="button"
                  onClick={() => handleClose(false)}
                  className="flex-1 py-2.5 px-4 rounded-full border border-[#c0c9bf] hover:bg-[#f0f4f0] text-[#181c1b] font-semibold text-xs sm:text-sm transition cursor-pointer active:scale-95"
                >
                  {options.cancelText || 'Cancel'}
                </button>
              )}

              <button
                type="button"
                autoFocus
                onClick={() => handleClose(true)}
                className={`flex-1 py-2.5 px-4 rounded-full text-white font-semibold text-xs sm:text-sm transition cursor-pointer active:scale-95 shadow-sm ${
                  modalType === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                    : modalType === 'warning'
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                    : 'bg-[#134e2f] hover:bg-[#0e3b24] shadow-emerald-900/20'
                }`}
              >
                {options.confirmText || (modalType === 'danger' ? 'Delete' : 'Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};
