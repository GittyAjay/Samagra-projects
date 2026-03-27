'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { approveQuotationAdminAction } from './actions';
import { AdminIconSubmitButton } from './admin-icon-submit';
import { useAdminToast } from './admin-toast';
import { formatCurrency, formatStatus } from './format-display';
import type { Quotation } from './lib';

export function AdminQuotationDetailClient({ quotation }: { quotation: Quotation }) {
  const router = useRouter();
  const { pushToast } = useAdminToast();
  const [state, action] = useActionState(approveQuotationAdminAction, null);

  useEffect(() => {
    if (state?.ok) {
      pushToast({ variant: 'success', message: state.message });
      router.refresh();
    } else if (state?.ok === false) {
      pushToast({ variant: 'error', message: state.error });
    }
  }, [state, pushToast, router]);

  const canApprove = quotation.status !== 'approved' && quotation.status !== 'rejected';
  const canCreateOrder = quotation.status === 'approved' || quotation.status === 'sent';

  return (
    <div className="admin-subpage-content admin-detail-page">
      <article className="admin-surface-card admin-form-card">
        <div className="admin-quotation-detail-head">
          <span className="admin-status-pill">{formatStatus(quotation.status)}</span>
        </div>
        <p>
          Lead:{' '}
          <a className="admin-detail-link" href={`/admin/leads/${quotation.leadId}`}>
            {quotation.leadId}
          </a>
        </p>
        <p>System {quotation.systemSizeKw} kW · Final {formatCurrency(quotation.finalPrice)}</p>
        <p>Subtotal {formatCurrency(quotation.subtotal)} · Subsidy {formatCurrency(quotation.subsidyAmount)}</p>
        {quotation.items?.length ? (
          <ul className="admin-notes-list">
            {quotation.items.map((item) => (
              <li key={item.id}>
                {item.label} × {item.quantity} @ {formatCurrency(item.unitPrice)}
              </li>
            ))}
          </ul>
        ) : null}
        {quotation.notes ? <p>{quotation.notes}</p> : null}
      </article>

      <div className="admin-lead-detail-actions admin-quotation-actions">
        {canCreateOrder ? (
          <a
            className="btn-orange admin-subpage-primary-link"
            href={`/admin/orders/new?quotationId=${encodeURIComponent(quotation.id)}`}
          >
            New order
          </a>
        ) : null}
      </div>

      {canApprove ? (
        <article className="admin-surface-card admin-form-card">
          <h2>Approve</h2>
          <form action={action} className="admin-inline-form">
            <input type="hidden" name="id" value={quotation.id} />
            <AdminIconSubmitButton icon="checkCircle" idleLabel="Approve quotation" pendingLabel="Approving…" showLabelWithIcon />
          </form>
        </article>
      ) : null}
    </div>
  );
}
