'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  assignLeadAction,
  assignOrderToStaffAction,
  autoAssignLeadAction,
  autoAssignOrderAction,
} from './actions';
import { AdminIconSubmitButton } from './admin-icon-submit';
import { AdminSubmitButton } from './admin-form-status';
import { useAdminToast } from './admin-toast';
import { formatCurrency, formatStatus } from './format-display';
import type { AdminUser, Lead, Order, StaffWorkloadEntry } from './lib';

type Segment = 'leads' | 'orders';

function AutoAssignLeadForm({ leadId }: { leadId: string }) {
  const router = useRouter();
  const { pushToast } = useAdminToast();
  const [state, action] = useActionState(autoAssignLeadAction, null);

  useEffect(() => {
    if (state?.ok) {
      pushToast({ variant: 'success', message: state.message });
      router.refresh();
    } else if (state?.ok === false) {
      pushToast({ variant: 'error', message: state.error });
    }
  }, [state, pushToast, router]);

  return (
    <form action={action} className="admin-inline-form admin-assign-inline">
      <input type="hidden" name="id" value={leadId} />
      <AdminSubmitButton variant="secondary" idleLabel="Auto-assign" pendingLabel="Assigning…" />
    </form>
  );
}

function AutoAssignOrderForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { pushToast } = useAdminToast();
  const [state, action] = useActionState(autoAssignOrderAction, null);

  useEffect(() => {
    if (state?.ok) {
      pushToast({ variant: 'success', message: state.message });
      router.refresh();
    } else if (state?.ok === false) {
      pushToast({ variant: 'error', message: state.error });
    }
  }, [state, pushToast, router]);

  return (
    <form action={action} className="admin-inline-form admin-assign-inline">
      <input type="hidden" name="id" value={orderId} />
      <AdminSubmitButton variant="secondary" idleLabel="Auto-assign" pendingLabel="Assigning…" />
    </form>
  );
}

function AssignLeadRowForm({
  lead,
  staffUsers,
}: {
  lead: Lead;
  staffUsers: AdminUser[];
}) {
  const router = useRouter();
  const { pushToast } = useAdminToast();
  const [state, action] = useActionState(assignLeadAction, null);

  useEffect(() => {
    if (state?.ok) {
      pushToast({ variant: 'success', message: state.message });
      router.refresh();
    } else if (state?.ok === false) {
      pushToast({ variant: 'error', message: state.error });
    }
  }, [state, pushToast, router]);

  return (
    <form action={action} className="admin-inline-form admin-assign-row-form">
      <input type="hidden" name="id" value={lead.id} />
      <select name="assignedStaffId" defaultValue={lead.assignedStaffId ?? ''} aria-label="Assign to staff">
        <option value="">Select staff…</option>
        {staffUsers.map((s) => (
          <option key={s.id} value={s.id}>
            {s.fullName}
          </option>
        ))}
      </select>
      <AdminIconSubmitButton icon="userPlus" idleLabel="Assign" pendingLabel="Assigning…" showLabelWithIcon />
    </form>
  );
}

function AssignOrderRowForm({
  order,
  staffUsers,
}: {
  order: Order;
  staffUsers: AdminUser[];
}) {
  const router = useRouter();
  const { pushToast } = useAdminToast();
  const [state, action] = useActionState(assignOrderToStaffAction, null);

  useEffect(() => {
    if (state?.ok) {
      pushToast({ variant: 'success', message: state.message });
      router.refresh();
    } else if (state?.ok === false) {
      pushToast({ variant: 'error', message: state.error });
    }
  }, [state, pushToast, router]);

  return (
    <form action={action} className="admin-inline-form admin-assign-row-form">
      <input type="hidden" name="id" value={order.id} />
      <select name="staffId" defaultValue={order.staffId} aria-label="Assign order to staff">
        {staffUsers.map((s) => (
          <option key={s.id} value={s.id}>
            {s.fullName}
          </option>
        ))}
      </select>
      <AdminIconSubmitButton icon="userPlus" idleLabel="Assign" pendingLabel="Assigning…" showLabelWithIcon />
    </form>
  );
}

export function AdminAssignmentsSection({
  leads,
  orders,
  staffUsers,
  workload,
}: {
  leads: Lead[];
  orders: Order[];
  staffUsers: AdminUser[];
  workload: StaffWorkloadEntry[];
}) {
  const [segment, setSegment] = useState<Segment>('leads');

  return (
    <div className="admin-assignments-root">
      <div className="admin-section-header">
        <div>
          <span className="section-tag">Assignments</span>
          <h2>Assignments</h2>
        </div>
      </div>

      <article className="admin-surface-card admin-form-card admin-workload-card">
        <h3>Workload</h3>
        {workload.length ? (
          <div className="admin-table-wrap">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Task types</th>
                  <th>Open leads</th>
                  <th>Active orders</th>
                  <th>Load</th>
                </tr>
              </thead>
              <tbody>
                {workload.map((w) => (
                  <tr key={w.id}>
                    <td>
                      <strong>{w.fullName}</strong>
                      <span className="admin-table-sub">{w.email}</span>
                      {w.designation ? <span className="admin-table-sub">{w.designation}</span> : null}
                    </td>
                    <td>{w.taskTypes.length ? w.taskTypes.join(', ') : 'All'}</td>
                    <td>{w.openLeads}</td>
                    <td>{w.activeOrders}</td>
                    <td>{w.totalLoad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No staff workload data yet.</p>
        )}
      </article>

      <div className="admin-segment-tabs" role="tablist" aria-label="Assignment target">
        <button
          type="button"
          role="tab"
          aria-selected={segment === 'leads'}
          className={`admin-segment-tab${segment === 'leads' ? ' is-active' : ''}`}
          onClick={() => setSegment('leads')}
        >
          Leads ({leads.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={segment === 'orders'}
          className={`admin-segment-tab${segment === 'orders' ? ' is-active' : ''}`}
          onClick={() => setSegment('orders')}
        >
          Orders ({orders.length})
        </button>
      </div>

      {segment === 'leads' ? (
        <div className="admin-card-list">
          {leads.map((lead) => (
            <article key={lead.id} className="admin-item-card wide admin-surface-card">
              <div className="admin-item-head">
                <div>
                  <strong>{lead.id.toUpperCase()}</strong>
                  <span>{formatStatus(lead.status)}</span>
                </div>
                <a className="admin-detail-link" href={`/admin/leads/${lead.id}`}>
                  Open lead →
                </a>
              </div>
              <p>
                {lead.address} · {lead.requiredLoadKw} kW · {lead.phone}
              </p>
              <div className="admin-assign-actions">
                <AssignLeadRowForm lead={lead} staffUsers={staffUsers} />
                <AutoAssignLeadForm leadId={lead.id} />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="admin-card-list">
          {orders.map((order) => (
            <article key={order.id} className="admin-item-card wide admin-surface-card">
              <div className="admin-item-head">
                <div>
                  <strong>{order.id.toUpperCase()}</strong>
                  <span>{formatStatus(order.status)}</span>
                </div>
                <a className="admin-detail-link" href={`/admin/orders/${order.id}`}>
                  Open order →
                </a>
              </div>
              <p>
                Client {order.clientId} · Staff {order.staffId} · Paid{' '}
                {formatCurrency(
                  order.paymentMilestones.reduce((s, m) => (m.status === 'paid' ? s + m.amount : s), 0)
                )}
              </p>
              <div className="admin-assign-actions">
                <AssignOrderRowForm order={order} staffUsers={staffUsers} />
                <AutoAssignOrderForm orderId={order.id} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
