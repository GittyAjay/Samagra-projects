export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatStatus(value: string) {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/** Vertical mini-bar fill: distinct gradient per pipeline stage (Execution momentum chart). */
const ORDER_STATUS_BAR: Record<string, string> = {
  order_received: 'linear-gradient(180deg, #94a3b8 0%, #475569 100%)',
  survey_completed: 'linear-gradient(180deg, #38bdf8 0%, #0369a1 100%)',
  quotation_approved: 'linear-gradient(180deg, #a78bfa 0%, #5b21b6 100%)',
  equipment_procured: 'linear-gradient(180deg, #fcd34d 0%, #b45309 100%)',
  installation_scheduled: 'linear-gradient(180deg, #fb923c 0%, #c2410c 100%)',
  installation_in_progress: 'linear-gradient(180deg, #fb7185 0%, #be123c 100%)',
  installation_completed: 'linear-gradient(180deg, #4ade80 0%, #047857 100%)',
};

export function orderTrendBarBackground(status: string): string {
  const key = status.trim().toLowerCase().replace(/\s+/g, '_');
  return ORDER_STATUS_BAR[key] ?? 'linear-gradient(180deg, #cbd5e1 0%, #64748b 100%)';
}
