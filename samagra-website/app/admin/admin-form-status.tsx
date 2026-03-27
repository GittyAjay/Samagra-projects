'use client';

import type { ReactNode } from 'react';
import { useFormStatus } from 'react-dom';

export function AdminSubmitButton({
  idleLabel,
  pendingLabel,
  className,
  icon,
  showLabelWithIcon = false,
  variant = 'primary',
}: {
  idleLabel: string;
  pendingLabel: string;
  className?: string;
  /** When set, the idle state shows this icon (and optional label). Pending shows a spinner when icon-only. */
  icon?: ReactNode;
  /** If true, show icon and `idleLabel` text side by side when not pending. */
  showLabelWithIcon?: boolean;
  /** `secondary` = outlined / neutral for non-primary actions (e.g. auto-assign). */
  variant?: 'primary' | 'secondary';
}) {
  const { pending } = useFormStatus();
  const iconMode = Boolean(icon);
  const composedClass = [
    'admin-submit-btn',
    variant === 'secondary' ? 'admin-submit-btn--secondary' : '',
    className,
    iconMode && !showLabelWithIcon ? 'admin-submit-btn--icon' : '',
    iconMode && showLabelWithIcon ? 'admin-submit-btn--icon-labeled' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="submit"
      className={composedClass || undefined}
      disabled={pending}
      aria-busy={pending}
      aria-label={
        iconMode && !showLabelWithIcon ? (pending ? pendingLabel : idleLabel) : undefined
      }
      title={iconMode ? (pending ? pendingLabel : idleLabel) : undefined}
    >
      {pending ? (
        iconMode ? (
          showLabelWithIcon ? (
            <span className="admin-submit-btn__with-label">
              <span className="admin-btn-spinner" aria-hidden="true" />
              <span>{pendingLabel}</span>
            </span>
          ) : (
            <span className="admin-btn-spinner" aria-hidden="true" />
          )
        ) : (
          pendingLabel
        )
      ) : icon ? (
        showLabelWithIcon ? (
          <span className="admin-submit-btn__with-label">
            <span className="admin-btn-icon-inner" aria-hidden="true">
              {icon}
            </span>
            <span>{idleLabel}</span>
          </span>
        ) : (
          <span className="admin-btn-icon-inner" aria-hidden="true">
            {icon}
          </span>
        )
      ) : (
        idleLabel
      )}
    </button>
  );
}
