import type { Lead, LeadTaskType, Order, OrderStatus, UserProfile } from "../types/domain";

const TERMINAL_LEAD: Lead["status"][] = ["won", "lost"];

export function normalizeLeadTaskType(lead: Lead): LeadTaskType {
  return lead.taskType ?? "general";
}

/** Infer routing task from order pipeline stage. */
export function orderRoutingTaskType(status: OrderStatus): LeadTaskType {
  if (status === "installation_scheduled" || status === "installation_in_progress") {
    return "installation";
  }
  return "sales";
}

export function parseStaffTaskTypes(metadata?: Record<string, unknown>): string[] {
  const raw = metadata?.taskTypes;
  if (Array.isArray(raw) && raw.every((x) => typeof x === "string")) {
    return raw as string[];
  }
  return [];
}

/** Empty taskTypes on staff = generalist (eligible for any task type). */
export function isStaffEligibleForTaskType(typesOnStaff: string[], taskType: LeadTaskType): boolean {
  if (typesOnStaff.length === 0) {
    return true;
  }
  return typesOnStaff.includes(taskType);
}

export function workloadForStaff(
  staffId: string,
  leads: Lead[],
  orders: Order[]
): { openLeads: number; activeOrders: number; total: number } {
  const openLeads = leads.filter(
    (l) => l.assignedStaffId === staffId && !TERMINAL_LEAD.includes(l.status)
  ).length;
  const activeOrders = orders.filter(
    (o) => o.staffId === staffId && o.status !== "installation_completed"
  ).length;
  return { openLeads, activeOrders, total: openLeads + activeOrders };
}

export function pickAutoAssignStaff(input: {
  taskType: LeadTaskType;
  staffUsers: UserProfile[];
  leads: Lead[];
  orders: Order[];
}): {
  staffId: string;
  fullName: string;
  reason: string;
  openLeads: number;
  activeOrders: number;
  matchedTaskProfile: boolean;
} | null {
  const staffOnly = input.staffUsers.filter((u) => u.role === "staff" && u.active);
  if (staffOnly.length === 0) {
    return null;
  }

  const eligible = staffOnly.filter((u) =>
    isStaffEligibleForTaskType(parseStaffTaskTypes(u.metadata), input.taskType)
  );

  const candidates = eligible.length > 0 ? eligible : staffOnly;
  const matchedTaskProfile = eligible.length > 0;

  let best = candidates[0]!;
  let bestLoad = workloadForStaff(best.id, input.leads, input.orders);

  for (const u of candidates.slice(1)) {
    const w = workloadForStaff(u.id, input.leads, input.orders);
    if (w.total < bestLoad.total) {
      best = u;
      bestLoad = w;
    }
  }

  const reason = matchedTaskProfile
    ? `Task “${input.taskType}” — lowest load among matching staff (${bestLoad.openLeads} open leads, ${bestLoad.activeOrders} active orders).`
    : `No staff tagged for “${input.taskType}”; picked lowest load overall (${bestLoad.openLeads} + ${bestLoad.activeOrders} active).`;

  return {
    staffId: best.id,
    fullName: best.fullName,
    reason,
    openLeads: bestLoad.openLeads,
    activeOrders: bestLoad.activeOrders,
    matchedTaskProfile
  };
}
