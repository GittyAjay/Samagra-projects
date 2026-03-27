'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { markPaymentPaidAction, updateOrderStatusAction } from './actions';
import { AdminIconSubmitButton } from './admin-icon-submit';
import { adminMessages, formatAdminMessage } from './admin-messages';
import { useAdminToast } from './admin-toast';
import { formatCurrency, formatDate, formatStatus } from './format-display';
import type { Order } from './lib';

function AdminOrderRow({ order }: { order: Order }) {
  const router = useRouter();
  const { pushToast } = useAdminToast();
  const firstPendingMilestone = order.paymentMilestones.find((milestone) => milestone.status === 'pending');

  const [statusState, statusAction] = useActionState(updateOrderStatusAction, null);
  const [payState, payAction] = useActionState(markPaymentPaidAction, null);

  useEffect(() => {
    if (statusState?.ok || payState?.ok) {
      router.refresh();
    }
  }, [statusState, payState, router]);

  useEffect(() => {
    if (statusState?.ok) {
      pushToast({ variant: 'success', message: statusState.message });
    } else if (statusState?.ok === false) {
      pushToast({ variant: 'error', message: statusState.error });
    }
  }, [statusState, pushToast]);

  useEffect(() => {
    if (payState?.ok) {
      pushToast({ variant: 'success', message: payState.message });
    } else if (payState?.ok === false) {
      pushToast({ variant: 'error', message: payState.error });
    }
  }, [payState, pushToast]);

  return (
    <article className="admin-item-card wide admin-surface-card admin-order-card">
      <div className="admin-item-head">
        <div>
          <strong>{order.id.toUpperCase()}</strong>
          <span className="admin-order-status-pill">{formatStatus(order.status)}</span>
        </div>
        <div className="admin-item-head-actions">
          <em>{order.installationDate ? formatDate(order.installationDate) : adminMessages.orders.installationTbd}</em>
          <a className="admin-detail-link" href={`/admin/orders/${order.id}`}>
            {adminMessages.orders.openOrder}
          </a>
        </div>
      </div>
      <p className="admin-order-section-label">{adminMessages.orders.payments}</p>
      <div className="admin-order-meta">
        {order.paymentMilestones.map((milestone) => (
          <div
            key={milestone.id}
            className={`admin-order-chip${milestone.status === 'paid' ? ' is-paid' : ' is-pending'}`}
          >
            <span>{milestone.label}</span>
            <strong>{milestone.status === 'paid' ? adminMessages.orders.paid : adminMessages.orders.pending}</strong>
          </div>
        ))}
      </div>
      <div className="admin-order-actions">
        <div className="admin-order-form-block">
          <p className="admin-order-section-label">{adminMessages.orders.status}</p>
          <form action={statusAction} className="admin-inline-form admin-inline-form--order-status">
            <input type="hidden" name="id" value={order.id} />
            <select name="status" defaultValue={order.status} aria-label={adminMessages.orders.pipelineAria}>
              <option value="survey_completed">Survey Completed</option>
              <option value="quotation_approved">Quotation Approved</option>
              <option value="order_received">Order Received</option>
              <option value="equipment_procured">Equipment Procured</option>
              <option value="installation_scheduled">Installation Scheduled</option>
              <option value="installation_in_progress">Installation In Progress</option>
              <option value="installation_completed">Installation Completed</option>
            </select>
            <input name="note" />
            <AdminIconSubmitButton
              icon="refreshCw"
              idleLabel={adminMessages.orders.updateOrderStatus}
              pendingLabel={adminMessages.orders.updatingOrderStatus}
              showLabelWithIcon
            />
          </form>
        </div>

        <div className="admin-order-form-block">
          <p className="admin-order-section-label">{adminMessages.orders.pay}</p>
          {firstPendingMilestone ? (
            <div className="admin-order-payment-stack">
              <form action={payAction} className="admin-inline-form admin-inline-form--order-payment">
                <input type="hidden" name="id" value={order.id} />
                <input type="hidden" name="milestoneId" value={firstPendingMilestone.id} />
                <input name="receiptUrl" aria-label={adminMessages.orders.receiptUrl} />
                <AdminIconSubmitButton
                  icon="checkCircle"
                  idleLabel={formatAdminMessage(adminMessages.orders.markPaid, { label: firstPendingMilestone.label })}
                  pendingLabel={adminMessages.orders.recordingPayment}
                  showLabelWithIcon
                />
              </form>
            </div>
          ) : (
            <p className="admin-inline-note admin-order-all-paid">{adminMessages.orders.done}</p>
          )}
        </div>
      </div>
    </article>
  );
}

export function AdminOrdersSection({ orders }: { orders: Order[] }) {
  return (
    <section className="admin-section" id="orders">
      <div className="admin-section-header">
        <div>
          <span className="section-tag">{adminMessages.orders.tag}</span>
          <h2>{adminMessages.orders.title}</h2>
        </div>
      </div>

      <div className="admin-card-list">
        {orders.map((order) => (
          <AdminOrderRow key={order.id} order={order} />
        ))}
      </div>
    </section>
  );
}
