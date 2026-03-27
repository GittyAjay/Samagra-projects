'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { createOrderFromQuotationAction } from './actions';
import { AdminIconSubmitButton } from './admin-icon-submit';
import { useAdminToast } from './admin-toast';
import { formatCurrency } from './format-display';
import type { Quotation } from './lib';

export function AdminOrderCreateClient({ quotation }: { quotation: Quotation }) {
  const router = useRouter();
  const { pushToast } = useAdminToast();
  const [state, action] = useActionState(createOrderFromQuotationAction, null);

  useEffect(() => {
    if (!state) {
      return;
    }
    if (state.ok === true && state.orderId) {
      pushToast({ variant: 'success', message: state.message });
      router.push(`/admin/orders/${state.orderId}`);
      return;
    }
    if (state.ok === false) {
      pushToast({ variant: 'error', message: state.error });
    }
  }, [state, pushToast, router]);

  return (
    <div className="admin-subpage-content">
      <article className="admin-surface-card admin-form-card">
        <h2>Quote</h2>
        <p>
          {quotation.leadId} · {formatCurrency(quotation.finalPrice)} · {quotation.systemSizeKw} kW
        </p>
      </article>

      <article className="admin-surface-card admin-form-card">
        <h2>Order</h2>
        <form action={action} className="admin-stack-form">
          <input type="hidden" name="quotationId" value={quotation.id} />
          <div className="admin-form-group">
            <label htmlFor="install-date">Install</label>
            <input id="install-date" name="installationDate" type="date" />
          </div>
          <AdminIconSubmitButton
            icon="checkCircle"
            idleLabel="Create order"
            pendingLabel="Creating…"
            className="btn-orange"
            showLabelWithIcon
          />
        </form>
      </article>
    </div>
  );
}
