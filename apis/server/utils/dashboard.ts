import type { Lead, Notification, Order, Product, Quotation } from "../types/domain";

export function buildClientDashboard(input: {
  leads: Lead[];
  orders: Order[];
  quotations: Quotation[];
  notifications: Notification[];
  recommendedProducts: Product[];
}) {
  return {
    recommendedProducts: input.recommendedProducts,
    activeOrders: input.orders,
    installationProgress: input.orders.map((order) => ({
      orderId: order.id,
      status: order.status,
      installationDate: order.installationDate,
      paymentMilestones: order.paymentMilestones
    })),
    quotations: input.quotations,
    notifications: input.notifications,
    leadSummary: {
      total: input.leads.length,
      open: input.leads.filter((lead) => lead.status !== "won" && lead.status !== "lost").length
    }
  };
}

export function buildStaffDashboard(input: {
  leads: Lead[];
  orders: Order[];
}) {
  return {
    newLeads: input.leads.filter((lead) => lead.status === "new").length,
    pendingCallbacks: input.leads.filter((lead) => lead.status === "contacted").length,
    surveyQueue: input.leads.filter((lead) => lead.status === "survey_scheduled").length,
    ordersInProgress: input.orders.filter(
      (order) => order.status !== "installation_completed"
    ).length,
    completedInstallations: input.orders.filter(
      (order) => order.status === "installation_completed"
    ).length,
    leads: input.leads,
    orders: input.orders
  };
}

export function buildAdminDashboard(input: {
  clients: number;
  leads: Lead[];
  orders: Order[];
}) {
  const wonLeads = input.leads.filter((lead) => lead.status === "won").length;

  return {
    totals: {
      clients: input.clients,
      leads: input.leads.length,
      orders: input.orders.length,
      revenue: input.orders.reduce(
        (sum, order) =>
          sum +
          order.paymentMilestones.reduce(
            (milestoneSum, milestone) =>
              milestone.status === "paid" ? milestoneSum + milestone.amount : milestoneSum,
            0
          ),
        0
      )
    },
    conversionRate: input.leads.length === 0 ? 0 : Number(((wonLeads / input.leads.length) * 100).toFixed(2)),
    activeInstallations: input.orders.filter(
      (order) => order.status !== "installation_completed"
    ).length,
    monthlyTrend: input.orders.map((order) => ({
      orderId: order.id,
      createdAt: order.createdAt,
      status: order.status
    })),
    activityFeed: input.orders
      .slice()
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 10)
      .map((order) => ({
        orderId: order.id,
        status: order.status,
        updatedAt: order.updatedAt
      }))
  };
}
