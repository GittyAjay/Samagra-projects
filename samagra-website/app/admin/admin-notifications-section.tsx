'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { createNotificationAction } from './actions';
import { AdminIconSubmitButton } from './admin-icon-submit';
import { adminMessages } from './admin-messages';
import { useAdminToast } from './admin-toast';
import { formatStatus } from './format-display';
import type { AdminUser, Notification } from './lib';

export function AdminNotificationsSection({
  clientUsers,
  staffUsers,
  notifications,
  displayNames,
}: {
  clientUsers: AdminUser[];
  staffUsers: AdminUser[];
  notifications: Notification[];
  displayNames: Record<string, string>;
}) {
  const router = useRouter();
  const { pushToast } = useAdminToast();
  const [state, action] = useActionState(createNotificationAction, null);

  useEffect(() => {
    if (state?.ok) {
      pushToast({ variant: 'success', message: state.message });
      router.refresh();
    } else if (state?.ok === false) {
      pushToast({ variant: 'error', message: state.error });
    }
  }, [state, pushToast, router]);

  return (
    <section className="admin-section" id="notifications">
      <div className="admin-section-header">
        <div>
          <span className="section-tag">{adminMessages.notifications.tag}</span>
          <h2>{adminMessages.notifications.title}</h2>
        </div>
      </div>

      <div className="admin-management-grid">
        <article className="admin-form-card admin-surface-card">
          <h3>{adminMessages.notifications.compose}</h3>
          <form action={action} className="admin-stack-form">
            <div className="admin-form-group">
              <label>{adminMessages.notifications.recipient}</label>
              <select name="userId" defaultValue="" required>
                <option value="" disabled>
                  {adminMessages.notifications.pick}
                </option>
                {clientUsers.length ? (
                  <optgroup label={adminMessages.notifications.clientsGroup}>
                    {clientUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.fullName} ({user.email})
                      </option>
                    ))}
                  </optgroup>
                ) : null}
                {staffUsers.length ? (
                  <optgroup label={adminMessages.notifications.staffGroup}>
                    {staffUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.fullName} ({user.email})
                      </option>
                    ))}
                  </optgroup>
                ) : null}
              </select>
            </div>
            <div className="admin-form-group">
              <label>{adminMessages.notifications.titleLabel}</label>
              <input name="title" required />
            </div>
            <div className="admin-form-group">
              <label>{adminMessages.notifications.messageLabel}</label>
              <textarea name="message" rows={4} required />
            </div>
            <div className="admin-form-group">
              <label>{adminMessages.notifications.typeLabel}</label>
              <select name="type" defaultValue="info">
                <option value="info">{adminMessages.notifications.types.info}</option>
                <option value="action">{adminMessages.notifications.types.action}</option>
                <option value="system">{adminMessages.notifications.types.system}</option>
              </select>
            </div>
            <AdminIconSubmitButton
              icon="bell"
              idleLabel={adminMessages.notifications.send}
              pendingLabel={adminMessages.notifications.sending}
              className="btn-orange"
              showLabelWithIcon
            />
          </form>
        </article>

        <article className="admin-list-card admin-surface-card">
          <div className="admin-list-heading">
            <h3>{adminMessages.notifications.recent}</h3>
            <span>{notifications.length}</span>
          </div>
          <div className="admin-card-list">
            {notifications.map((notification) => (
              <div key={notification.id} className="admin-item-card">
                <div className="admin-item-head">
                  <div>
                    <strong>{notification.title}</strong>
                    <span>{displayNames[notification.userId] ?? notification.userId}</span>
                  </div>
                  <em>{formatStatus(notification.type)}</em>
                </div>
                <p>{notification.message}</p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
