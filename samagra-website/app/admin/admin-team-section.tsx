'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { createStaffAction } from './actions';
import { AdminAssignmentsSection } from './admin-assignments-section';
import { AdminIconSubmitButton } from './admin-icon-submit';
import { adminMessages } from './admin-messages';
import { useAdminToast } from './admin-toast';
import type { AdminUser, Lead, Order, StaffWorkloadEntry } from './lib';

const TASK_TYPES = [
  { value: 'sales', label: adminMessages.team.taskTypes.sales },
  { value: 'survey', label: adminMessages.team.taskTypes.survey },
  { value: 'installation', label: adminMessages.team.taskTypes.installation },
  { value: 'general', label: adminMessages.team.taskTypes.general },
] as const;

export function AdminTeamSection({
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
  const router = useRouter();
  const { pushToast } = useAdminToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [state, action] = useActionState(createStaffAction, null);

  useEffect(() => {
    if (state?.ok) {
      pushToast({ variant: 'success', message: state.message });
      router.refresh();
      setShowCreateForm(false);
    } else if (state?.ok === false) {
      pushToast({ variant: 'error', message: state.error });
    }
  }, [state, pushToast, router]);

  return (
    <section className="admin-section admin-team-section" id="team">
      <div className="admin-section-header">
        <div>
          <span className="section-tag">{adminMessages.team.tag}</span>
          <h2>{adminMessages.team.title}</h2>
        </div>
        <button
          type="button"
          className={`admin-plus-action${showCreateForm ? ' is-open' : ''}`}
          onClick={() => setShowCreateForm((prev) => !prev)}
          aria-expanded={showCreateForm}
          aria-controls="admin-create-staff-form"
          aria-label={showCreateForm ? adminMessages.team.hideAddForm : adminMessages.team.showAddForm}
          title={showCreateForm ? adminMessages.team.hideAddForm : adminMessages.team.addMember}
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>

      {showCreateForm ? (
        <div className="admin-management-grid admin-management-grid-stack">
          <article id="admin-create-staff-form" className="admin-form-card admin-surface-card">
            <h3>{adminMessages.team.newMember}</h3>
            <form action={action} className="admin-stack-form" key={staffUsers.length}>
              <div className="admin-form-group">
                <label htmlFor="staff-fullName">{adminMessages.team.name}</label>
                <input id="staff-fullName" name="fullName" required autoComplete="name" />
              </div>
              <div className="admin-form-split">
                <div className="admin-form-group">
                  <label htmlFor="staff-email">{adminMessages.team.email}</label>
                  <input id="staff-email" name="email" type="email" required autoComplete="email" />
                </div>
                <div className="admin-form-group">
                  <label htmlFor="staff-phone">{adminMessages.team.phone}</label>
                  <input id="staff-phone" name="phone" type="tel" required autoComplete="tel" />
                </div>
              </div>
              <div className="admin-form-group">
                <label htmlFor="staff-password">{adminMessages.team.password}</label>
                <input
                  id="staff-password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              <div className="admin-form-group">
                <label htmlFor="staff-designation">{adminMessages.team.designation}</label>
                <input id="staff-designation" name="designation" />
              </div>
              <fieldset className="admin-form-group admin-checkbox-fieldset">
                <legend>{adminMessages.team.taskTypesLegend}</legend>
                <div className="admin-task-type-grid">
                  {TASK_TYPES.map((t) => (
                    <label key={t.value} className="admin-checkbox compact">
                      <input type="checkbox" name="taskTypes" value={t.value} />
                      <span>{t.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <AdminIconSubmitButton
                icon="userPlus"
                idleLabel={adminMessages.team.createStaffUser}
                pendingLabel={adminMessages.team.creating}
                className="btn-orange"
                showLabelWithIcon
              />
            </form>
          </article>
        </div>
      ) : null}

      <AdminAssignmentsSection leads={leads} orders={orders} staffUsers={staffUsers} workload={workload} />
    </section>
  );
}
