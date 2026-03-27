'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { createQuotationAction } from './actions';
import { AdminIconSubmitButton } from './admin-icon-submit';
import { useAdminToast } from './admin-toast';
import type { AdminUser, Lead, Product } from './lib';

const SUBSIDY_PER_KW = 12_000;

export function AdminQuotationCreateClient({
  lead,
  panels,
  inverters,
  staffUsers,
  defaultStaffId,
}: {
  lead: Lead;
  panels: Product[];
  inverters: Product[];
  staffUsers: AdminUser[];
  defaultStaffId: string;
}) {
  const router = useRouter();
  const { pushToast } = useAdminToast();
  const [state, action] = useActionState(createQuotationAction, null);
  const [kw, setKw] = useState(lead.requiredLoadKw > 0 ? String(lead.requiredLoadKw) : '');
  const [subsidyAuto, setSubsidyAuto] = useState(true);
  const [subsidy, setSubsidy] = useState(() =>
    lead.requiredLoadKw > 0 ? String(Math.round(lead.requiredLoadKw * SUBSIDY_PER_KW)) : ''
  );

  const kwNum = Number.parseFloat(kw.replace(/,/g, '').trim());
  const validKw = Number.isFinite(kwNum) && kwNum > 0 ? kwNum : 0;

  useEffect(() => {
    if (!subsidyAuto || validKw <= 0) {
      return;
    }
    setSubsidy(String(Math.round(validKw * SUBSIDY_PER_KW)));
  }, [validKw, subsidyAuto]);

  useEffect(() => {
    if (!state) {
      return;
    }
    if (state.ok === true && state.quotationId) {
      pushToast({ variant: 'success', message: state.message });
      router.push(`/admin/quotations/${state.quotationId}`);
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
        <form action={action} className="admin-stack-form">
          <input type="hidden" name="leadId" value={lead.id} />
          <input type="hidden" name="clientId" value={lead.clientId} />

          <div className="admin-form-group">
            <label>Staff</label>
            <select name="staffId" defaultValue={defaultStaffId}>
              <option value="">Lead</option>
              {staffUsers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-form-group">
            <label htmlFor="q-kw">kW</label>
            <input
              id="q-kw"
              name="systemSizeKw"
              type="number"
              min="0"
              step="0.1"
              required
              value={kw}
              onChange={(e) => setKw(e.target.value)}
            />
          </div>

          <div className="admin-form-group">
            <label>Panel</label>
            <select name="panelProductId" required defaultValue="">
              <option value="" disabled>
                Select panel
              </option>
              {panels.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-form-group">
            <label>Inverter</label>
            <select name="inverterProductId" required defaultValue="">
              <option value="" disabled>
                Select inverter
              </option>
              {inverters.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-form-group">
            <label htmlFor="q-equip">Equipment</label>
            <input id="q-equip" name="equipmentCost" type="number" min="1" step="1" required />
          </div>

          <div className="admin-form-group">
            <label htmlFor="q-subsidy">Subsidy</label>
            <input
              id="q-subsidy"
              name="subsidyAmount"
              type="number"
              min="0"
              step="1"
              value={subsidy}
              onChange={(e) => {
                setSubsidyAuto(false);
                setSubsidy(e.target.value);
              }}
            />
          </div>

          <div className="admin-form-group">
            <label>Notes</label>
            <textarea name="notes" rows={3} />
          </div>

          <AdminIconSubmitButton
            icon="checkCircle"
            idleLabel="Send quotation to client"
            pendingLabel="Sending…"
            className="btn-orange"
            showLabelWithIcon
          />
        </form>
      </article>
    </div>
  );
}
