'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

const TOAST_DURATION_MS = 4500;

const adminToastStyles = `
.admin-toast-provider-inner {
  display: contents;
}
.admin-toast-region {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: min(400px, calc(100vw - 32px));
  pointer-events: none;
}
.admin-toast-region > * {
  pointer-events: auto;
}
.admin-toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 14px 14px 16px;
  border-radius: 12px;
  box-shadow:
    0 18px 40px rgba(15, 23, 42, 0.18),
    0 4px 12px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.25);
  font-size: 14px;
  line-height: 1.45;
  animation: admin-toast-in 0.28s ease-out;
}
@keyframes admin-toast-in {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
.admin-toast--success {
  background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
  color: #064e3b;
  border-color: rgba(5, 150, 105, 0.25);
}
.admin-toast--error {
  background: linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%);
  color: #7f1d1d;
  border-color: rgba(220, 38, 38, 0.22);
}
.admin-toast-body {
  flex: 1;
  min-width: 0;
  padding-top: 1px;
}
.admin-toast-close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin: -4px -4px -4px 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  opacity: 0.65;
  cursor: pointer;
  transition: opacity 0.15s ease, background 0.15s ease;
}
.admin-toast-close:hover {
  opacity: 1;
  background: rgba(15, 23, 42, 0.06);
}
.admin-toast-close:focus-visible {
  outline: 2px solid var(--admin-accent, #f97316);
  outline-offset: 2px;
}
.admin-toast--error .admin-toast-close:hover {
  background: rgba(127, 29, 29, 0.08);
}
`;

type ToastVariant = 'success' | 'error';

export type AdminToastInput = {
  variant: ToastVariant;
  message: string;
};

type ToastRecord = AdminToastInput & { id: number };

type ToastContextValue = {
  pushToast: (input: AdminToastInput) => void;
};

const AdminToastContext = createContext<ToastContextValue | null>(null);

export function useAdminToast(): ToastContextValue {
  const ctx = useContext(AdminToastContext);
  if (!ctx) {
    return { pushToast: () => {} };
  }
  return ctx;
}

function ToastCloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastRecord;
  onDismiss: (id: number) => void;
}) {
  const labelId = useId();

  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`admin-toast admin-toast--${toast.variant}`}
      role="alert"
      aria-labelledby={labelId}
    >
      <div className="admin-toast-body" id={labelId}>
        {toast.message}
      </div>
      <button
        type="button"
        className="admin-toast-close"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
      >
        <ToastCloseIcon />
      </button>
    </div>
  );
}

export function AdminToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback((input: AdminToastInput) => {
    const id = ++nextId.current;
    setToasts((prev) => [...prev, { ...input, id }]);
  }, []);

  return (
    <AdminToastContext.Provider value={{ pushToast }}>
      <div className="admin-toast-provider-inner">
        <style dangerouslySetInnerHTML={{ __html: adminToastStyles }} />
        {children}
        <div className="admin-toast-region" aria-label="Notifications">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </div>
      </div>
    </AdminToastContext.Provider>
  );
}
