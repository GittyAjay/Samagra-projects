import { cookies } from 'next/headers';

export type AdminSession = {
  email: string;
  fullName: string;
  id: string;
  role: 'admin';
  token: string;
};

export type AdminUser = {
  id: string;
  role: 'client' | 'staff' | 'admin';
  fullName: string;
  email: string;
  phone: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
};

export type Product = {
  id: string;
  name: string;
  category: 'solar_panel' | 'solar_inverter' | 'solar_battery' | 'installation_package';
  description: string;
  capacityKw?: number;
  estimatedPrice: number;
  warrantyYears?: number;
  compatibility?: string[];
  imageUrls: string[];
  specifications: Record<string, string | number>;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LeadTaskType = 'sales' | 'survey' | 'installation' | 'general';

export type Lead = {
  id: string;
  clientId: string;
  source: 'client_app' | 'landing_page' | 'admin';
  monthlyElectricityBill: number;
  requiredLoadKw: number;
  roofType: string;
  address: string;
  phone: string;
  notes?: string;
  interestedProductId?: string;
  status: 'new' | 'contacted' | 'survey_scheduled' | 'survey_completed' | 'quotation_sent' | 'won' | 'lost';
  assignedStaffId?: string;
  taskType?: LeadTaskType;
  internalNotes?: string[];
  createdAt: string;
  updatedAt: string;
};

export type QuotationLineItem = {
  id: string;
  productId?: string;
  label: string;
  quantity: number;
  unitPrice: number;
};

export type Quotation = {
  id: string;
  leadId: string;
  clientId: string;
  staffId: string;
  systemSizeKw: number;
  items?: QuotationLineItem[];
  subsidyScheme?: string;
  subsidyAmount: number;
  subtotal: number;
  finalPrice: number;
  notes?: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  sharedVia: Array<'in_app' | 'sms'>;
  createdAt: string;
  updatedAt: string;
};

export type StaffWorkloadEntry = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  active: boolean;
  designation?: string;
  taskTypes: string[];
  openLeads: number;
  activeOrders: number;
  totalLoad: number;
};

export type StaffWorkloadResponse = {
  staff: StaffWorkloadEntry[];
};

export type OrderStatus =
  | 'order_received'
  | 'survey_completed'
  | 'quotation_approved'
  | 'equipment_procured'
  | 'installation_scheduled'
  | 'installation_in_progress'
  | 'installation_completed';

export type Order = {
  id: string;
  leadId: string;
  quotationId: string;
  clientId: string;
  staffId: string;
  status: OrderStatus;
  installationTeam?: string;
  sourcingNotes?: string;
  statusHistory?: Array<{
    status: OrderStatus;
    updatedAt: string;
    note?: string;
  }>;
  installationDate?: string;
  paymentMilestones: Array<{
    id: string;
    label: string;
    amount: number;
    status: 'pending' | 'paid';
    paidAt?: string;
    receiptUrl?: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'action' | 'system';
  read: boolean;
  createdAt: string;
};

export type AdminDashboardResponse = {
  totals: {
    clients: number;
    leads: number;
    orders: number;
    revenue: number;
  };
  conversionRate: number;
  activeInstallations: number;
  monthlyTrend: Array<{
    orderId: string;
    createdAt: string;
    status: string;
  }>;
  activityFeed: Array<{
    orderId: string;
    status: string;
    updatedAt: string;
  }>;
};

export type ReportsSummaryResponse = {
  totals: {
    clients: number;
    staff: number;
    leads: number;
    orders: number;
    revenue: number;
  };
  leadPipeline: {
    new: number;
    surveyScheduled: number;
    quotationSent: number;
    won: number;
    lost: number;
  };
  installationStats: {
    active: number;
    completed: number;
  };
  collectionReport: Array<{
    orderId: string;
    paid: number;
    pending: number;
  }>;
};

export function getApiBaseUrl() {
  return process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api';
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  const raw = jar.get('samagra_admin_session')?.value;

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AdminSession;
    if (parsed.role !== 'admin' || !parsed.id) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function adminApi<T>(path: string, init?: RequestInit, session?: AdminSession): Promise<T> {
  const activeSession = session ?? (await getAdminSession());

  if (!activeSession) {
    throw new Error('Admin session not found');
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': activeSession.id,
      'x-user-role': activeSession.role,
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    let message = 'Request failed';

    try {
      const payload = await response.json();
      message = payload?.statusMessage ?? payload?.message ?? message;
    } catch {
      message = response.statusText || message;
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}
