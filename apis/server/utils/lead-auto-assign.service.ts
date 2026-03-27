import type { Lead, Order, UserProfile } from "../types/domain";
import { normalizeLeadTaskType, pickAutoAssignStaff } from "./auto-assign";
import { notifyUser } from "./notifications";
import { listCollection, nowIso, setItem } from "./storage";

export type LeadAutoAssignment = {
  staffId: string;
  staffName: string;
  reason: string;
  taskType: ReturnType<typeof normalizeLeadTaskType>;
  matchedTaskProfile: boolean;
  openLeads: number;
  activeOrders: number;
};

const TERMINAL: Lead["status"][] = ["won", "lost"];

async function notifyStaffOfLeadAssignment(lead: Lead, staffId: string, taskType: string) {
  await notifyUser({
    userId: staffId,
    title: "Lead auto-assigned",
    message: `Lead ${lead.id} was assigned to you (${taskType}).`,
    type: "action",
    emailSubject: "New enquiry assigned to you",
    emailText: `Lead ${lead.id} has been assigned to you. Please review the enquiry and contact the client soon.`,
    emailHtml:
      `<div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">` +
      `<p>Lead <strong>${lead.id}</strong> has been assigned to you.</p>` +
      `<p>Please review the enquiry and contact the client soon.</p>` +
      `</div>`
  });
}

/**
 * Server-side lead auto-assign. Used on new inquiry, cron sweep, and admin API.
 * @param force When true, replaces existing assignee (admin action).
 */
export async function executeLeadAutoAssign(
  lead: Lead,
  options: { force?: boolean } = {}
): Promise<
  | { ok: true; lead: Lead; assignment: LeadAutoAssignment }
  | { ok: false; lead: Lead; reason: "already_assigned" | "no_staff" | "terminal" }
> {
  if (TERMINAL.includes(lead.status)) {
    return { ok: false, lead, reason: "terminal" };
  }

  if (!options.force && lead.assignedStaffId) {
    return { ok: false, lead, reason: "already_assigned" };
  }

  const [users, leads, orders] = await Promise.all([
    listCollection<UserProfile>("users"),
    listCollection<Lead>("leads"),
    listCollection<Order>("orders")
  ]);

  const taskType = normalizeLeadTaskType(lead);
  const pick = pickAutoAssignStaff({
    taskType,
    staffUsers: users,
    leads,
    orders
  });

  if (!pick) {
    return { ok: false, lead, reason: "no_staff" };
  }

  const nextStatus = lead.status === "new" ? "contacted" : lead.status;
  const updatedLead: Lead = {
    ...lead,
    assignedStaffId: pick.staffId,
    status: nextStatus,
    updatedAt: nowIso()
  };

  await setItem("leads", updatedLead);
  await notifyStaffOfLeadAssignment(lead, pick.staffId, taskType);

  return {
    ok: true,
    lead: updatedLead,
    assignment: {
      staffId: pick.staffId,
      staffName: pick.fullName,
      reason: pick.reason,
      taskType,
      matchedTaskProfile: pick.matchedTaskProfile,
      openLeads: pick.openLeads,
      activeOrders: pick.activeOrders
    }
  };
}

/**
 * Cron / batch: assign every open lead that has no owner yet. Updates in-memory lead list between picks so load stays accurate.
 */
export async function sweepUnassignedLeads(): Promise<{
  scanned: number;
  assigned: number;
}> {
  let leads = await listCollection<Lead>("leads");
  const users = await listCollection<UserProfile>("users");
  const orders = await listCollection<Order>("orders");

  let scanned = 0;
  let assigned = 0;

  for (const lead of leads) {
    if (lead.assignedStaffId || TERMINAL.includes(lead.status)) {
      continue;
    }
    scanned++;

    const taskType = normalizeLeadTaskType(lead);
    const pick = pickAutoAssignStaff({
      taskType,
      staffUsers: users,
      leads,
      orders
    });

    if (!pick) {
      continue;
    }

    const nextStatus = lead.status === "new" ? "contacted" : lead.status;
    const updated: Lead = {
      ...lead,
      assignedStaffId: pick.staffId,
      status: nextStatus,
      updatedAt: nowIso()
    };

    await setItem("leads", updated);
    await notifyStaffOfLeadAssignment(lead, pick.staffId, taskType);

    const idx = leads.findIndex((l) => l.id === lead.id);
    if (idx !== -1) {
      leads[idx] = updated;
    }
    assigned++;
  }

  return { scanned, assigned };
}
