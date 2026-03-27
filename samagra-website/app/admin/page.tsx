export const dynamic = 'force-dynamic';

import { unstable_cache } from 'next/cache';

import { loginAdmin } from './actions';
import { ADMIN_DASHBOARD_TAG } from './admin-invalidate';
import { AdminKpiIcon } from './admin-kpi-icons';
import { adminMessages } from './admin-messages';
import { AdminDashboardBody } from './admin-dashboard-client';
import { AdminLoginFeedback } from './admin-login-feedback';
import { type AdminSection, adminSectionMeta } from './admin-section-config';
import { AdminLeadsSection } from './admin-leads-section';
import { AdminNotificationsSection } from './admin-notifications-section';
import { AdminOrdersSection } from './admin-orders-section';
import { AdminProductsSection } from './admin-products-section';
import { AdminTeamSection } from './admin-team-section';
import { AdminIconSubmitButton } from './admin-icon-submit';
import { AdminToastProvider } from './admin-toast';
import {
  clampPercent,
  formatCurrency,
  formatDate,
  formatStatus,
  orderTrendBarBackground,
} from './format-display';
import {
  adminApi,
  type AdminSession,
  type AdminUser,
  type AdminDashboardResponse,
  type Lead,
  type Notification,
  type Order,
  type Product,
  type ReportsSummaryResponse,
  type StaffWorkloadEntry,
  type StaffWorkloadResponse,
  getAdminSession,
} from './lib';

function safeDecodeQueryParam(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '));
  } catch {
    return value;
  }
}

/** Must not call `cookies()` / `getAdminSession()` — used inside `unstable_cache`. */
async function loadAdminDataForSession(session: AdminSession) {
  const [dashboard, reports, products, leads, orders, notifications, staffUsers, clientUsers, staffWorkload] =
    await Promise.all([
      adminApi<AdminDashboardResponse>('/dashboard/admin', undefined, session),
      adminApi<ReportsSummaryResponse>('/reports/summary', undefined, session),
      adminApi<Product[]>('/products', undefined, session),
      adminApi<Lead[]>('/leads', undefined, session),
      adminApi<Order[]>('/orders', undefined, session),
      adminApi<Notification[]>('/notifications', undefined, session),
      adminApi<AdminUser[]>('/users?role=staff', undefined, session),
      adminApi<AdminUser[]>('/users?role=client', undefined, session),
      adminApi<StaffWorkloadResponse>('/users/staff-workload', undefined, session),
    ]);

  return {
    dashboard,
    reports,
    products,
    leads,
    orders,
    notifications,
    staffUsers,
    clientUsers,
    staffWorkload: staffWorkload.staff,
  };
}

/** Per-admin cache: instant sidebar section switches; busted via `invalidateAdminDashboardCache` after mutations. */
function getAdminDataCached(session: AdminSession) {
  if (process.env.NODE_ENV !== 'production') {
    return loadAdminDataForSession(session);
  }

  return unstable_cache(
    async () => loadAdminDataForSession(session),
    ['admin-dashboard-bundle', session.id],
    { tags: [ADMIN_DASHBOARD_TAG] }
  )();
}

function latestTimestamp(values: Array<string | undefined>) {
  return values
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => right.localeCompare(left))[0];
}

function LoginView({ message, error }: { error?: string; message?: string }) {
  return (
    <AdminToastProvider>
      <AdminLoginFeedback message={message} error={error} />
      <main className="admin-login-page">
        <section className="admin-login-shell">
          <div className="admin-login-card">
            <a className="brand admin-login-brand" href="/">
              <div className="brand-logo" style={{ borderRadius: 6, overflow: 'hidden' }}>
                <img
                  src="/assets/logo.png"
                  alt="Samagra Enterprises Logo"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div className="brand-name admin-brand-dark">
                Samagra Enterprises
                <span>Solar Solutions India</span>
              </div>
            </a>

            <span className="section-tag">{adminMessages.login.tag}</span>
            <h1>{adminMessages.login.title}</h1>

            <form action={loginAdmin} className="admin-auth-form">
              <div className="admin-form-group">
                <label htmlFor="email">{adminMessages.login.emailLabel}</label>
                <input id="email" name="email" type="email" required />
              </div>
              <div className="admin-form-group">
                <label htmlFor="password">{adminMessages.login.passwordLabel}</label>
                <input id="password" name="password" type="password" required />
              </div>
              <AdminIconSubmitButton
                icon="logIn"
                idleLabel={adminMessages.login.submit}
                pendingLabel={adminMessages.login.submitting}
                className="btn-orange admin-submit-btn"
                showLabelWithIcon
              />
            </form>
          </div>
        </section>
      </main>
    </AdminToastProvider>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const session = await getAdminSession();
  const message = typeof params.message === 'string' ? safeDecodeQueryParam(params.message) : undefined;
  const error = typeof params.error === 'string' ? safeDecodeQueryParam(params.error) : undefined;
  const rawSection = typeof params.section === 'string' ? params.section : 'overview';
  const activeSection = (rawSection in adminSectionMeta ? rawSection : 'overview') as AdminSection;

  if (!session) {
    return <LoginView message={message} error={error} />;
  }

  let dataError: string | null = null;
  let dashboard: AdminDashboardResponse | null = null;
  let reports: ReportsSummaryResponse | null = null;
  let products: Product[] = [];
  let leads: Lead[] = [];
  let orders: Order[] = [];
  let notifications: Notification[] = [];
  let staffUsers: AdminUser[] = [];
  let clientUsers: AdminUser[] = [];
  let staffWorkload: StaffWorkloadEntry[] = [];

  try {
    const data = await getAdminDataCached(session);
    dashboard = data.dashboard;
    reports = data.reports;
    products = data.products;
    leads = data.leads;
    orders = data.orders;
    notifications = data.notifications;
    staffUsers = data.staffUsers;
    clientUsers = data.clientUsers;
    staffWorkload = data.staffWorkload;
  } catch (loadError) {
    dataError = loadError instanceof Error ? loadError.message : 'Failed to load admin data';
  }

  const userDirectory = [...staffUsers, ...clientUsers];
  const displayNames = Object.fromEntries(userDirectory.map((user) => [user.id, user.fullName]));
  const openLeads = leads.filter((lead) => lead.status !== 'won' && lead.status !== 'lost').length;
  const callbackLeads = leads.filter((lead) => lead.status === 'contacted').length;
  const scheduledSurveys = leads.filter((lead) => lead.status === 'survey_scheduled').length;
  const completedInstallations = orders.filter((order) => order.status === 'installation_completed').length;
  const totalClientRevenue = clientUsers.reduce((sum, client) => {
    const clientRevenue = orders
      .filter((order) => order.clientId === client.id)
      .reduce(
        (orderSum, order) =>
          orderSum +
          order.paymentMilestones.reduce(
            (milestoneSum, milestone) =>
              milestone.status === 'paid' ? milestoneSum + milestone.amount : milestoneSum,
            0
          ),
        0
      );

    return sum + clientRevenue;
  }, 0);

  const paidCollections = reports
    ? reports.collectionReport.reduce((sum, entry) => sum + entry.paid, 0)
    : 0;
  const pendingCollections = reports
    ? reports.collectionReport.reduce((sum, entry) => sum + entry.pending, 0)
    : 0;
  const collectionTotal = paidCollections + pendingCollections;
  const collectionProgress = collectionTotal ? clampPercent((paidCollections / collectionTotal) * 100) : 0;
  const monthlyTrendPreview = dashboard?.monthlyTrend.slice(0, 6) ?? [];
  const trendMax = monthlyTrendPreview.length
    ? Math.max(...monthlyTrendPreview.map((_, index) => index + 2))
    : 0;
  return (
    <main className="admin-dashboard-page">
      <AdminDashboardBody
        activeSection={activeSection}
        message={message}
        error={error}
        dataError={dataError}
        sectionPanels={[
            {
              id: 'overview',
              content: (
              <section key="overview-section" className="admin-dashboard-hero" id="overview">
                <div className="admin-section-toolbar">
                  <h3>Overview</h3>
                </div>

                <div className="admin-kpi-grid compact">
                  <article className="admin-kpi-card centered">
                    <div className="admin-kpi-card-head">
                      <div className="admin-kpi-icon clients" aria-hidden="true">
                        <AdminKpiIcon metric="clients" />
                      </div>
                      <span className="admin-kpi-title">Clients</span>
                    </div>
                    <strong>{dashboard?.totals.clients ?? 0}</strong>
                    <small className="admin-kpi-caption">Registered customer accounts</small>
                    <em>{reports ? `${reports.totals.staff} staff users in directory` : 'Waiting for live reports data'}</em>
                  </article>
                  <article className="admin-kpi-card centered">
                    <div className="admin-kpi-card-head">
                      <div className="admin-kpi-icon leads" aria-hidden="true">
                        <AdminKpiIcon metric="leads" />
                      </div>
                      <span className="admin-kpi-title">Leads</span>
                    </div>
                    <strong>{dashboard?.totals.leads ?? 0}</strong>
                    <small className="admin-kpi-caption">Lead records synced from the backend</small>
                    <em>{`${openLeads} open pipeline · ${callbackLeads} callbacks`}</em>
                  </article>
                  <article className="admin-kpi-card centered">
                    <div className="admin-kpi-card-head">
                      <div className="admin-kpi-icon orders" aria-hidden="true">
                        <AdminKpiIcon metric="orders" />
                      </div>
                      <span className="admin-kpi-title">Orders</span>
                    </div>
                    <strong>{dashboard?.totals.orders ?? 0}</strong>
                    <small className="admin-kpi-caption">Orders synced from live execution data</small>
                    <em>{`${dashboard?.activeInstallations ?? 0} active · ${completedInstallations} completed`}</em>
                  </article>
                  <article className="admin-kpi-card centered accent">
                    <div className="admin-kpi-card-head">
                      <div className="admin-kpi-icon revenue" aria-hidden="true">
                        <AdminKpiIcon metric="revenue" />
                      </div>
                      <span className="admin-kpi-title">Revenue</span>
                    </div>
                    <strong>{dashboard ? formatCurrency(dashboard.totals.revenue) : '--'}</strong>
                    <small className="admin-kpi-caption">Collected payment milestones (INR)</small>
                    <em>{`${reports?.collectionReport.length ?? 0} orders in collections view`}</em>
                  </article>
                </div>

                <div className="admin-kpi-grid secondary">
                  <article className="admin-kpi-card centered">
                    <div className="admin-kpi-card-head">
                      <div className="admin-kpi-icon conversion" aria-hidden="true">
                        <AdminKpiIcon metric="conversion" />
                      </div>
                      <span className="admin-kpi-title">Conversion</span>
                    </div>
                    <strong>{dashboard ? `${dashboard.conversionRate}%` : '--'}</strong>
                    <small className="admin-kpi-caption">Leads that became orders</small>
                    <em>{`${scheduledSurveys} surveys scheduled right now`}</em>
                  </article>
                  <article className="admin-kpi-card centered">
                    <div className="admin-kpi-card-head">
                      <div className="admin-kpi-icon installations" aria-hidden="true">
                        <AdminKpiIcon metric="installations" />
                      </div>
                      <span className="admin-kpi-title">Installations</span>
                    </div>
                    <strong>{dashboard?.activeInstallations ?? 0}</strong>
                    <small className="admin-kpi-caption">Sites actively in progress</small>
                    <em>{`${completedInstallations} installations completed`}</em>
                  </article>
                </div>

                <div className="admin-overview-grid">
                  <article className="admin-surface-card admin-visual-card">
                    <div className="admin-overview-card-head">
                      <div className="admin-overview-card-title-block">
                        <div className="admin-kpi-icon trend" aria-hidden="true">
                          <AdminKpiIcon metric="trend" />
                        </div>
                        <div className="admin-overview-card-titles">
                          <h3 className="admin-overview-card-heading">Momentum</h3>
                          <p className="admin-overview-card-lede">
                            Bar height = recency in this list (newer → taller). Bar color = order pipeline stage.
                          </p>
                        </div>
                      </div>
                      <div className="admin-card-badge">
                        {monthlyTrendPreview.length === 1
                          ? '1 order'
                          : `${monthlyTrendPreview.length} orders`}
                      </div>
                    </div>
                    <div className="admin-mini-bars" aria-label="Recent orders by status">
                      {monthlyTrendPreview.length ? (
                        monthlyTrendPreview.map((entry, index) => {
                          const height = trendMax ? `${40 + (((index + 2) / trendMax) * 60).toFixed(0)}%` : '48%';
                          const orderLabel = formatStatus(entry.orderId.replace(/_/g, ' '));
                          const barFill = orderTrendBarBackground(entry.status);

                          return (
                            <div key={`${entry.orderId}-${entry.createdAt}-${index}`} className="admin-mini-bar-item">
                              <div className="admin-mini-bar-track">
                                <div
                                  className="admin-mini-bar-fill"
                                  style={{ height, background: barFill }}
                                />
                              </div>
                              <strong title={entry.orderId}>{orderLabel}</strong>
                              <span>{formatStatus(entry.status)}</span>
                            </div>
                          );
                        })
                      ) : (
                        <p className="admin-overview-empty">No recent orders in the trend feed yet.</p>
                      )}
                    </div>
                    {monthlyTrendPreview.length ? (
                      <ul className="admin-mini-bar-legend" aria-label="Stage colors">
                        {[...new Set(monthlyTrendPreview.map((e) => e.status))]
                          .sort()
                          .map((status) => (
                            <li key={status}>
                              <span
                                className="admin-mini-bar-legend-swatch"
                                style={{ background: orderTrendBarBackground(status) }}
                                aria-hidden={true}
                              />
                              <span>{formatStatus(status)}</span>
                            </li>
                          ))}
                      </ul>
                    ) : null}
                  </article>

                  <article className="admin-surface-card admin-visual-card">
                    <div className="admin-overview-card-head">
                      <div className="admin-overview-card-title-block">
                        <div className="admin-kpi-icon collections-overview" aria-hidden="true">
                          <AdminKpiIcon metric="collectionsOverview" />
                        </div>
                        <div className="admin-overview-card-titles">
                          <h3 className="admin-overview-card-heading">Collections</h3>
                          <p className="admin-overview-card-lede">
                            Share of billed amounts collected vs still outstanding across orders.
                          </p>
                        </div>
                      </div>
                      <div className="admin-card-badge">{collectionProgress}% collected</div>
                    </div>
                    <div className="admin-progress-panel">
                      <div className="admin-arc-gauge" style={{ ['--gauge-progress' as string]: collectionProgress }}>
                        <div className="admin-arc-gauge-center">
                          <strong>{collectionProgress}%</strong>
                          <span>Paid vs pending mix</span>
                        </div>
                      </div>
                      <div className="admin-metric-split">
                        <div>
                          <span>Paid to date</span>
                          <strong>{reports ? formatCurrency(paidCollections) : '--'}</strong>
                        </div>
                        <div>
                          <span>Still pending</span>
                          <strong>{reports ? formatCurrency(pendingCollections) : '--'}</strong>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              </section>
            ),
            },
            {
              id: 'clients',
              content: (
              <section key="clients-section" className="admin-section" id="clients">
                <div className="admin-section-header">
                  <div>
                    <span className="section-tag">Clients</span>
                    <h2>Directory</h2>
                  </div>
                </div>

                <div className="admin-kpi-grid secondary">
                  <article className="admin-kpi-card centered">
                    <div className="admin-kpi-card-head">
                      <div className="admin-kpi-icon clients" aria-hidden="true">
                        <AdminKpiIcon metric="clients" />
                      </div>
                      <span className="admin-kpi-title">Clients</span>
                    </div>
                    <strong>{clientUsers.length}</strong>
                    <small className="admin-kpi-caption">Customer accounts in the backend</small>
                  </article>
                  <article className="admin-kpi-card centered accent">
                    <div className="admin-kpi-card-head">
                      <div className="admin-kpi-icon revenue" aria-hidden="true">
                        <AdminKpiIcon metric="revenue" />
                      </div>
                      <span className="admin-kpi-title">Client Revenue</span>
                    </div>
                    <strong>{formatCurrency(totalClientRevenue)}</strong>
                    <small className="admin-kpi-caption">Paid milestone total linked to clients</small>
                  </article>
                </div>

                <div className="admin-card-list">
                  {clientUsers.length ? (
                    clientUsers.map((client) => {
                      const clientLeads = leads.filter((lead) => lead.clientId === client.id);
                      const clientOrders = orders.filter((order) => order.clientId === client.id);
                      const latestActivity = latestTimestamp([
                        client.updatedAt,
                        ...clientLeads.map((lead) => lead.updatedAt),
                        ...clientOrders.map((order) => order.updatedAt),
                      ]);
                      const paidAmount = clientOrders.reduce(
                        (sum, order) =>
                          sum +
                          order.paymentMilestones.reduce(
                            (milestoneSum, milestone) =>
                              milestone.status === 'paid' ? milestoneSum + milestone.amount : milestoneSum,
                            0
                          ),
                        0
                      );

                      return (
                        <article key={client.id} className="admin-item-card wide admin-surface-card">
                          <div className="admin-item-head">
                            <div>
                              <strong>{client.fullName}</strong>
                              <span>{client.email}</span>
                            </div>
                            <em>{client.active ? 'Active' : 'Inactive'}</em>
                          </div>
                          <p>
                            Phone: {client.phone} · Client ID: {client.id}
                          </p>
                          <p>
                            Leads: {clientLeads.length} · Orders: {clientOrders.length} · Collected:{' '}
                            {formatCurrency(paidAmount)}
                          </p>
                          <p>
                            Last activity: {latestActivity ? formatDate(latestActivity) : 'No activity yet'}
                          </p>
                        </article>
                      );
                    })
                  ) : (
                    <article className="admin-item-card admin-surface-card">
                      <p>No client records are available from the live API yet.</p>
                    </article>
                  )}
                </div>
              </section>
            ),
            },
            {
              id: 'products',
              content: <AdminProductsSection key="products-section" products={products} />,
            },
            {
              id: 'leads',
              content: (
              <AdminLeadsSection
                key="leads-section"
                leads={leads}
                staffUsers={staffUsers}
                displayNames={displayNames}
              />
            ),
            },
            {
              id: 'orders',
              content: <AdminOrdersSection key="orders-section" orders={orders} />,
            },
            {
              id: 'team',
              content: (
                <AdminTeamSection
                  key="team-section"
                  leads={leads}
                  orders={orders}
                  staffUsers={staffUsers}
                  workload={staffWorkload}
                />
              ),
            },
            {
              id: 'notifications',
              content: (
                <AdminNotificationsSection
                  key="notifications-section"
                  clientUsers={clientUsers}
                  staffUsers={staffUsers}
                  notifications={notifications}
                  displayNames={displayNames}
                />
              ),
            },
          ]}
        />
    </main>
  );
}
