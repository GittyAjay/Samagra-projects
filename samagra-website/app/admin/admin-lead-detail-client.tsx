'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import {
  appendLeadNoteAction,
  assignLeadAction,
  autoAssignLeadAction,
  updateLeadAction,
  updateLeadTaskAction,
} from './actions';
import { AdminIconSubmitButton } from './admin-icon-submit';
import { AdminSubmitButton } from './admin-form-status';
import { useAdminToast } from './admin-toast';
import { formatCurrency, formatStatus } from './format-display';
import type { AdminUser, Lead, LeadTaskType, Quotation } from './lib';

const TASK_TYPES: LeadTaskType[] = ['sales', 'survey', 'installation', 'general'];

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

export function AdminLeadDetailClient({
  lead,
  quotations,
  staffUsers,
  clientLabel,
}: {
  lead: Lead;
  quotations: Quotation[];
  staffUsers: AdminUser[];
  clientLabel: string;
}) {
  const [assignState, assignAction] = useActionState(assignLeadAction, null);
  const [autoState, autoAction] = useActionState(autoAssignLeadAction, null);
  const [taskState, taskAction] = useActionState(updateLeadTaskAction, null);
  const [updateState, updateAction] = useActionState(updateLeadAction, null);
  const [noteState, noteAction] = useActionState(appendLeadNoteAction, null);

  return (
    <div className="admin-subpage-content admin-detail-page">
      <FormToasts state={assignState} />
      <FormToasts state={autoState} />
      <FormToasts state={taskState} />
      <FormToasts state={updateState} />
      <FormToasts state={noteState} />

      <div className="admin-lead-detail-hero">
        <div>
          <h1 className="admin-lead-detail-title">{clientLabel}</h1>
          <p className="admin-lead-detail-meta">
            <span className="admin-lead-detail-id">{lead.id.toUpperCase()}</span>
            <span className="admin-status-pill">{formatStatus(lead.status)}</span>
            {lead.taskType ? <span className="admin-table-sub">Task: {lead.taskType}</span> : null}
          </p>
          <p className="admin-lead-detail-client">{lead.address}</p>
          <p>
            Load {lead.requiredLoadKw} kW · Bill {formatCurrency(lead.monthlyElectricityBill)} ·{' '}
            <a className="admin-detail-link" href={`tel:${lead.phone.replace(/\s/g, '')}`}>
              {lead.phone}
            </a>
          </p>
        </div>
        <div className="admin-lead-detail-actions">
          <a className="btn-orange admin-subpage-primary-link" href={`/admin/quotations/new?leadId=${lead.id}`}>
            Create quotation
          </a>
        </div>
      </div>

      {quotations.length ? (
        <article className="admin-surface-card admin-form-card">
          <h2>Quotations</h2>
          <ul className="admin-quotation-link-list">
            {quotations.map((q) => (
              <li key={q.id}>
                <a href={`/admin/quotations/${q.id}`} className="admin-detail-link">
                  {q.id} · {formatStatus(q.status)} · {formatCurrency(q.finalPrice)}
                </a>
              </li>
            ))}
          </ul>
        </article>
      ) : null}

      <div className="admin-lead-detail-grid">
        <article className="admin-surface-card admin-form-card">
          <h2>Assign</h2>
          <form action={assignAction} className="admin-stack-form">
            <input type="hidden" name="id" value={lead.id} />
            <div className="admin-form-group">
              <label>Staff</label>
              <select name="assignedStaffId" defaultValue={lead.assignedStaffId ?? ''} required>
                <option value="" disabled>
                  Pick
                </option>
                {staffUsers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName}
                  </option>
                ))}
              </select>
            </div>
            <AdminIconSubmitButton icon="userPlus" idleLabel="Save assignment" pendingLabel="Saving…" showLabelWithIcon />
          </form>
          <form action={autoAction} className="admin-stack-form admin-form-spaced-top">
            <input type="hidden" name="id" value={lead.id} />
            <AdminSubmitButton variant="secondary" idleLabel="Auto-assign by workload" pendingLabel="Assigning…" />
          </form>
        </article>

        <article className="admin-surface-card admin-form-card">
          <h2>Routing</h2>
          <form action={taskAction} className="admin-stack-form">
            <input type="hidden" name="id" value={lead.id} />
            <div className="admin-form-group">
              <label>Type</label>
              <select name="taskType" defaultValue={lead.taskType ?? 'general'}>
                {TASK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <AdminIconSubmitButton icon="refreshCw" idleLabel="Update task type" pendingLabel="Saving…" showLabelWithIcon />
          </form>
        </article>

        <article className="admin-surface-card admin-form-card admin-span-2">
          <h2>Pipeline</h2>
          <form action={updateAction} className="admin-stack-form">
            <input type="hidden" name="id" value={lead.id} />
            <div className="admin-form-group">
              <label>Status</label>
              <select name="status" defaultValue={lead.status}>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="survey_scheduled">Survey Scheduled</option>
                <option value="survey_completed">Survey Completed</option>
                <option value="quotation_sent">Quotation Sent</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <div className="admin-form-group">
              <label>Note</label>
              <input name="note" />
            </div>
            <AdminIconSubmitButton icon="refreshCw" idleLabel="Update lead" pendingLabel="Updating…" showLabelWithIcon />
          </form>
        </article>

        <article className="admin-surface-card admin-form-card admin-span-2">
          <h2>Notes</h2>
          {lead.internalNotes?.length ? (
            <ul className="admin-notes-list">
              {lead.internalNotes.map((n, i) => (
                <li key={`${i}-${n.slice(0, 12)}`}>{n}</li>
              ))}
            </ul>
          ) : null}
          <form action={noteAction} className="admin-stack-form admin-form-spaced-top">
            <input type="hidden" name="id" value={lead.id} />
            <div className="admin-form-group">
              <label>Note</label>
              <textarea name="note" rows={3} required />
            </div>
            <AdminSubmitButton idleLabel="Append note" pendingLabel="Saving…" />
          </form>
        </article>
      </div>
    </div>
  );
}
