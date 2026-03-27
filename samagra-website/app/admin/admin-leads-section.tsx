'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { assignLeadAction, updateLeadAction } from './actions';
import { AdminIconSubmitButton } from './admin-icon-submit';
import { adminMessages, formatAdminMessage } from './admin-messages';
import { useAdminToast } from './admin-toast';
import { formatCurrency, formatStatus } from './format-display';
import type { AdminUser, Lead } from './lib';

type LeadFilterTab = 'all' | 'new' | 'contacted' | 'survey_scheduled';

const LEAD_FILTER_TABS: { key: LeadFilterTab; label: string }[] = [
  { key: 'all', label: adminMessages.leads.filters.all },
  { key: 'new', label: adminMessages.leads.filters.new },
  { key: 'contacted', label: adminMessages.leads.filters.contacted },
  { key: 'survey_scheduled', label: adminMessages.leads.filters.survey_scheduled },
];

function AdminLeadRow({
  lead,
  staffUsers,
  displayName,
}: {
  lead: Lead;
  staffUsers: AdminUser[];
  displayName: (userId: string) => string;
}) {
  const router = useRouter();
  const { pushToast } = useAdminToast();
  const [assignState, assignAction] = useActionState(assignLeadAction, null);
  const [updateState, updateAction] = useActionState(updateLeadAction, null);

  useEffect(() => {
    if (assignState?.ok || updateState?.ok) {
      router.refresh();
    }
  }, [assignState, updateState, router]);

  useEffect(() => {
    if (assignState?.ok) {
      pushToast({ variant: 'success', message: assignState.message });
    } else if (assignState?.ok === false) {
      pushToast({ variant: 'error', message: assignState.error });
    }
  }, [assignState, pushToast]);

  useEffect(() => {
    if (updateState?.ok) {
      pushToast({ variant: 'success', message: updateState.message });
    } else if (updateState?.ok === false) {
      pushToast({ variant: 'error', message: updateState.error });
    }
  }, [updateState, pushToast]);

  const leadStatusClass = `admin-lead-status admin-lead-status--${lead.status}`;

  return (
    <article className="admin-item-card wide admin-surface-card admin-lead-card">
      <div className="admin-item-head">
        <div>
          <strong>{lead.id.toUpperCase()}</strong>
          <span className={leadStatusClass}>{formatStatus(lead.status)}</span>
        </div>
        <div className="admin-item-head-actions">
          <em>{lead.phone}</em>
          <a className="admin-detail-link" href={`/admin/leads/${lead.id}`}>
            {adminMessages.leads.openLead}
          </a>
        </div>
      </div>
      <p>
        {formatAdminMessage(adminMessages.leads.clientAssigned, {
          client: displayName(lead.clientId),
          assignment: lead.assignedStaffId
            ? formatAdminMessage(adminMessages.leads.assignedTo, { name: displayName(lead.assignedStaffId) })
            : adminMessages.leads.unassigned,
        })}
      </p>
      <p>
        {formatAdminMessage(adminMessages.leads.sourceLoadBill, {
          source: formatStatus(lead.source),
          load: lead.requiredLoadKw,
          bill: formatCurrency(lead.monthlyElectricityBill),
        })}
      </p>
      <p>{lead.address}</p>
      <div className="admin-form-columns">
        <form action={assignAction} className="admin-inline-form">
          <input type="hidden" name="id" value={lead.id} />
          <select name="assignedStaffId" defaultValue={lead.assignedStaffId ?? ''}>
            <option value="" disabled>
              {adminMessages.leads.selectStaff}
            </option>
            {staffUsers.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.fullName}
                {staff.metadata?.designation ? ` (${String(staff.metadata.designation)})` : ''}
              </option>
            ))}
          </select>
          <AdminIconSubmitButton
            icon="userPlus"
            idleLabel={adminMessages.leads.assignLead}
            pendingLabel={adminMessages.leads.assigningLead}
            showLabelWithIcon
          />
        </form>
        <form action={updateAction} className="admin-inline-form">
          <input type="hidden" name="id" value={lead.id} />
          <select name="status" defaultValue={lead.status}>
            <option value="new">{adminMessages.leads.status.new}</option>
            <option value="contacted">{adminMessages.leads.status.contacted}</option>
            <option value="survey_scheduled">{adminMessages.leads.status.survey_scheduled}</option>
            <option value="survey_completed">{adminMessages.leads.status.survey_completed}</option>
            <option value="quotation_sent">{adminMessages.leads.status.quotation_sent}</option>
            <option value="won">{adminMessages.leads.status.won}</option>
            <option value="lost">{adminMessages.leads.status.lost}</option>
          </select>
          <input name="note" />
          <AdminIconSubmitButton
            icon="refreshCw"
            idleLabel={adminMessages.leads.updateLead}
            pendingLabel={adminMessages.leads.updatingLead}
            showLabelWithIcon
          />
        </form>
      </div>
    </article>
  );
}

export function AdminLeadsSection({
  leads,
  staffUsers,
  displayNames,
}: {
  leads: Lead[];
  staffUsers: AdminUser[];
  displayNames: Record<string, string>;
}) {
  const displayName = (userId: string) => displayNames[userId] ?? userId;
  const [filter, setFilter] = useState<LeadFilterTab>('all');

  const filteredLeads = useMemo(() => {
    if (filter === 'all') {
      return leads;
    }
    return leads.filter((lead) => lead.status === filter);
  }, [leads, filter]);

  return (
    <section className="admin-section" id="leads">
      <div className="admin-section-header">
        <div>
          <span className="section-tag">{adminMessages.leads.tag}</span>
          <h2>{adminMessages.leads.title}</h2>
        </div>
      </div>

      <div className="admin-lead-filters" role="tablist" aria-label={adminMessages.leads.filters.label}>
        {LEAD_FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={filter === tab.key}
            className={`admin-lead-filter-tab${filter === tab.key ? ' is-active' : ''}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-card-list">
        {filteredLeads.map((lead) => (
          <AdminLeadRow key={lead.id} lead={lead} staffUsers={staffUsers} displayName={displayName} />
        ))}
      </div>
    </section>
  );
}
