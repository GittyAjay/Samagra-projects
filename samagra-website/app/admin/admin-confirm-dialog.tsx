'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { adminMessages } from './admin-messages';

const confirmDialogStyles = `
.admin-confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  animation: admin-confirm-fade-in 0.2s ease-out;
}
@keyframes admin-confirm-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.admin-confirm-card {
  width: min(420px, 100%);
  max-height: min(90vh, 560px);
  overflow: auto;
  background: var(--admin-surface, rgba(255, 255, 255, 0.96));
  border: 1px solid var(--admin-border, rgba(148, 163, 184, 0.25));
  border-radius: 16px;
  padding: 26px 24px 22px;
  box-shadow:
    0 24px 64px rgba(15, 23, 42, 0.2),
    0 8px 24px rgba(15, 23, 42, 0.1);
  animation: admin-confirm-pop 0.22s ease-out;
}
@keyframes admin-confirm-pop {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
.admin-confirm-card h2 {
  font-family: 'Oswald', sans-serif;
  font-size: 22px;
  font-weight: 600;
  color: var(--admin-ink, #0f172a);
  margin: 0 0 10px;
  line-height: 1.2;
}
.admin-confirm-card p {
  font-size: 14px;
  line-height: 1.6;
  color: var(--admin-copy, #5f6f86);
  margin: 0 0 22px;
}
.admin-confirm-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}
.admin-confirm-btn {
  border: none;
  border-radius: 10px;
  padding: 10px 18px;
  font-family: 'Open Sans', sans-serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
}
.admin-confirm-btn:disabled {
  cursor: wait;
  opacity: 0.72;
}
.admin-confirm-btn--cancel {
  background: #f1f5f9;
  color: var(--admin-ink, #0f172a);
  border: 1px solid var(--admin-form-border, #e2e8f0);
}
.admin-confirm-btn--cancel:hover:not(:disabled) {
  background: #e2e8f0;
}
.admin-confirm-btn--danger {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: #fff;
  box-shadow: 0 3px 12px rgba(220, 38, 38, 0.28);
}
.admin-confirm-btn--danger:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 5px 16px rgba(220, 38, 38, 0.32);
}
.admin-confirm-btn--primary {
  background: linear-gradient(135deg, var(--admin-form-primary-from, #ea580c) 0%, var(--admin-form-primary-to, #fb923c) 100%);
  color: #fff;
  box-shadow: 0 3px 12px var(--admin-form-primary-shadow, rgba(234, 88, 12, 0.28));
}
.admin-confirm-btn--primary:hover:not(:disabled) {
  transform: translateY(-1px);
}
.admin-confirm-btn-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  margin-right: 8px;
  vertical-align: -2px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: admin-confirm-spin 0.7s linear infinite;
}
@keyframes admin-confirm-spin {
  to { transform: rotate(360deg); }
}
`;

export function AdminConfirmDialog({
  open,
  title,
  description,
  confirmLabel = adminMessages.confirmDialog.confirm,
  confirmPendingLabel,
  cancelLabel = adminMessages.confirmDialog.cancel,
  onCancel,
  onConfirm,
  variant = 'danger',
  pending = false,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  /** Shown on the confirm button while `pending` (e.g. "Deleting…"). */
  confirmPendingLabel?: string;
  cancelLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
  variant?: 'danger' | 'primary';
  pending?: boolean;
}) {
  const titleId = useId();
  const descId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !pending) {
        onCancel();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onCancel, pending]);

  if (!mounted || !open) {
    return null;
  }

  const confirmClass =
    variant === 'danger' ? 'admin-confirm-btn admin-confirm-btn--danger' : 'admin-confirm-btn admin-confirm-btn--primary';

  return createPortal(
    <>
      <style dangerouslySetInnerHTML={{ __html: confirmDialogStyles }} />
      <div className="admin-confirm-overlay" role="presentation" onClick={pending ? undefined : onCancel}>
        <div
          className="admin-confirm-card"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descId}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 id={titleId}>{title}</h2>
          <p id={descId}>{description}</p>
          <div className="admin-confirm-actions">
            <button
              ref={cancelRef}
              type="button"
              className="admin-confirm-btn admin-confirm-btn--cancel"
              onClick={onCancel}
              disabled={pending}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className={confirmClass}
              onClick={onConfirm}
              disabled={pending}
            >
              {pending ? (
                <>
                  <span className="admin-confirm-btn-spinner" aria-hidden="true" />
                  {confirmPendingLabel ?? confirmLabel}
                </>
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
