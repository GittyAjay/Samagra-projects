'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import {
  assignOrderToStaffAction,
  autoAssignOrderAction,
  markPaymentPaidAction,
  updateOrderStatusAction,
} from './actions';
import { AdminIconSubmitButton } from './admin-icon-submit';
import { AdminSubmitButton } from './admin-form-status';
import { useAdminToast } from './admin-toast';
import { formatCurrency, formatDate, formatStatus } from './format-display';
import type { AdminUser, Order } from './lib';

function FormToasts({ state }: { state: { ok: true; message: string } | { ok: false; error: string } | null }) {
  const router = useRouter();
  const { pushToast } = useAdminToast();

  useEffect(() => {
    if (state?.ok) {
      pushToast({ variant: 'success', message: state.message });
      router.refresh();
    } else if (state?.ok === false) {
      pushToast({ variant: 'error', message: state.error });
    }
  }, [state, pushToast, router]);

  return null;
}

export function AdminOrderDetailClient({ order, staffUsers }: { order: Order; staffUsers: AdminUser[] }) {
  const firstPendingMilestone = order.paymentMilestones.find((m) => m.status === 'pending');

  const [statusState, statusAction] = useActionState(updateOrderStatusAction, null);
  const [payState, payAction] = useActionState(markPaymentPaidAction, null);
  const [assignState, assignAction] = useActionState(assignOrderToStaffAction, null);
  const [autoState, autoAction] = useActionState(autoAssignOrderAction, null);

  return (
    <div className="admin-subpage-content admin-detail-page">
      <FormToasts state={statusState} />
      <FormToasts state={payState} />
      <FormToasts state={assignState} />
      <FormToasts state={autoState} />

      <div className="admin-order-detail-hero">
        <div>
          <h1 className="admin-lead-detail-title">
            <a className="admin-hero-primary-link" href={`/admin/leads/${order.leadId}`}>
              Lead {order.leadId}
            </a>
          </h1>
          <p className="admin-lead-detail-meta">
            <span className="admin-lead-detail-id">{order.id.toUpperCase()}</span>
            <span className="admin-status-pill">{formatStatus(order.status)}</span>
          </p>
          <p>
            <a className="admin-detail-link" href={`/admin/quotations/${order.quotationId}`}>
              Quotation {order.quotationId}
            </a>
          </p>
          <p>
            Client {order.clientId} · Staff {order.staffId} ·{' '}
            {order.installationDate ? formatDate(order.installationDate) : 'Install TBD'}
          </p>
        </div>
      </div>

      {order.statusHistory?.length ? (
        <article className="admin-surface-card admin-form-card">
          <h2>History</h2>
          <ul className="admin-notes-list">
            {order.statusHistory.map((h, i) => (
              <li key={`${h.updatedAt}-${i}`}>
                <strong>{formatStatus(h.status)}</strong> · {formatDate(h.updatedAt)}
                {h.note ? ` — ${h.note}` : ''}
              </li>
            ))}
          </ul>
        </article>
      ) : null}

      <div className="admin-lead-detail-grid">
        <article className="admin-surface-card admin-form-card">
          <h2>Staff</h2>
          <form action={assignAction} className="admin-stack-form">
            <input type="hidden" name="id" value={order.id} />
            <div className="admin-form-group">
              <label>Staff</label>
              <select name="staffId" defaultValue={order.staffId} required>
                {staffUsers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName}
                  </option>
                ))}
              </select>
            </div>
            <AdminIconSubmitButton icon="userPlus" idleLabel="Update assignment" pendingLabel="Saving…" showLabelWithIcon />
          </form>
          <form action={autoAction} className="admin-stack-form admin-form-spaced-top">
            <input type="hidden" name="id" value={order.id} />
            <AdminSubmitButton variant="secondary" idleLabel="Auto-assign staff by workload" pendingLabel="Assigning…" />
          </form>
        </article>

        <article className="admin-surface-card admin-form-card">
          <h2>Status</h2>
          <form action={statusAction} className="admin-stack-form">
            <input type="hidden" name="id" value={order.id} />
            <div className="admin-form-group">
              <label>Status</label>
              <select name="status" defaultValue={order.status}>
                <option value="survey_completed">Survey Completed</option>
                <option value="quotation_approved">Quotation Approved</option>
                <option value="order_received">Order Received</option>
                <option value="equipment_procured">Equipment Procured</option>
                <option value="installation_scheduled">Installation Scheduled</option>
                <option value="installation_in_progress">Installation In Progress</option>
                <option value="installation_completed">Installation Completed</option>
              </select>
            </div>
            <div className="admin-form-group">
              <label>Note</label>
              <input name="note" />
            </div>
            <AdminIconSubmitButton icon="refreshCw" idleLabel="Update status" pendingLabel="Updating…" showLabelWithIcon />
          </form>
        </article>

        <article className="admin-surface-card admin-form-card admin-span-2">
          <h2>Pay</h2>
          <div className="admin-order-meta">
            {order.paymentMilestones.map((milestone) => (
              <div
                key={milestone.id}
                className={`admin-order-chip${milestone.status === 'paid' ? ' is-paid' : ' is-pending'}`}
              >
                <span>{milestone.label}</span>
                <strong>{milestone.status === 'paid' ? 'Paid' : 'Pending'}</strong>
                <span className="admin-chip-amount">{formatCurrency(milestone.amount)}</span>
              </div>
            ))}
          </div>
          {firstPendingMilestone ? (
            <form action={payAction} className="admin-stack-form admin-form-spaced-top">
              <input type="hidden" name="id" value={order.id} />
              <input type="hidden" name="milestoneId" value={firstPendingMilestone.id} />
              <div className="admin-form-group">
                <label>Receipt</label>
                <input name="receiptUrl" />
              </div>
              <AdminIconSubmitButton
                icon="checkCircle"
                idleLabel={`Mark ${firstPendingMilestone.label} paid`}
                pendingLabel="Recording…"
                showLabelWithIcon
              />
            </form>
          ) : (
            <p className="admin-inline-note admin-order-all-paid">Done</p>
          )}
        </article>
      </div>
    </div>
  );
}
