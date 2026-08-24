'use client';

/**
 * ToastContext — the app's one-line feedback channel.
 *
 * Every mutation in DataContext is optimistic and instant, so the user needs a
 * small confirmation ("বিজ্ঞাপন দেওয়া হয়েছে") rather than a page reload. Toasts
 * auto-dismiss and stack above the bottom navigation on mobile.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, variant?: ToastVariant) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_DURATION_MS = 3200;

const VARIANT_STYLES: Record<ToastVariant, { wrapper: string; icon: ReactNode }> = {
  success: {
    wrapper: 'bg-success text-white',
    icon: <CheckCircle2 size={18} className="shrink-0" />,
  },
  error: {
    wrapper: 'bg-error text-white',
    icon: <XCircle size={18} className="shrink-0" />,
  },
  warning: {
    wrapper: 'bg-warning text-white',
    icon: <TriangleAlert size={18} className="shrink-0" />,
  },
  info: {
    wrapper: 'bg-text-main text-white',
    icon: <Info size={18} className="shrink-0" />,
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'success') => {
      // Math.random is fine here — ids never leave the browser session.
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, message, variant }]);
      const timer = setTimeout(() => dismissToast(id), TOAST_DURATION_MS);
      timers.current.set(id, timer);
    },
    [dismissToast]
  );

  const value = useMemo(
    () => ({ toasts, showToast, dismissToast }),
    [toasts, showToast, dismissToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* `pb-safe` keeps the stack clear of the bottom nav / iOS home bar. */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed inset-x-0 bottom-20 md:bottom-6 z-[60] flex flex-col items-center gap-2 px-4 pb-safe pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={cn(
              'pointer-events-auto flex items-center gap-2.5 w-full max-w-sm px-4 py-3 rounded-[var(--radius-card)] shadow-[var(--shadow-modal)] text-sm font-medium page-enter',
              VARIANT_STYLES[toast.variant].wrapper
            )}
          >
            {VARIANT_STYLES[toast.variant].icon}
            <span className="flex-1 leading-snug">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Close"
              className="shrink-0 opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export { ToastContext };
