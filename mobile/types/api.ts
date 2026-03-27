export type UserRole = 'client' | 'staff' | 'admin';

export type ApiUser = {
  id: string;
  fullName: string;
  role: UserRole;
  email: string;
  phone: string;
  metadata?: Record<string, unknown>;
};

/** User row from GET /users (password omitted in app UI). */
export type StaffProfile = {
  id: string;
  fullName: string;
  role: UserRole;
  email: string;
  phone: string;
  active: boolean;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateStaffPayload = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: 'staff';
  designation?: string;
  /** Task queues this staff accepts for auto-assign (empty = all). */
  taskTypes?: string[];
};

export type AuthResponse = {
  token: string;
  user: ApiUser;
};

export type StaffHomeRoute = '/staff/leads' | '/staff/orders';

export type StaffDashboardResponse = {
  newLeads: number;
  pendingCallbacks: number;
  surveyQueue: number;
  ordersInProgress: number;
  completedInstallations: number;
  leads: ApiLead[];
  orders: ApiOrder[];
};

export type RegisterResponse = {
  message: string;
  email: string;
  expiresInSeconds: number;
};

export type RegisterVerifyResponse = {
  message: string;
  user: ApiUser & {
    createdAt: string;
    updatedAt: string;
    active: boolean;
    emailVerified?: boolean;
    emailVerifiedAt?: string;
  };
};

export type ForgotPasswordRequestResponse = {
  message: string;
  identifier: string;
  expiresInSeconds: number;
};

export type ForgotPasswordVerifyResponse = {
  message: string;
  verified: boolean;
};

export type ProductCategory =
  | 'solar_panel'
  | 'solar_inverter'
  | 'solar_battery'
  | 'installation_package';

export type ApiProduct = {
  id: string;
  name: string;
  category: ProductCategory;
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

export type CreateProductPayload = {
  name: string;
  category: ProductCategory;
  description: string;
  estimatedPrice: number;
  capacityKw?: number;
  warrantyYears?: number;
  imageUrls?: string[];
  specifications?: Record<string, string | number>;
  active?: boolean;
};

export type PaymentMilestone = {
  id: string;
  label: string;
  amount: number;
  status: 'pending' | 'paid';
  paidAt?: string;
  receiptUrl?: string;
};

export type OrderStatus =
  | 'order_received'
  | 'survey_completed'
  | 'quotation_approved'
  | 'equipment_procured'
  | 'installation_scheduled'
  | 'installation_in_progress'
  | 'installation_completed';

/** Matches server `ORDER_PIPELINE` — survey & quotation precede the order record, then fulfillment. */
export const ORDER_STATUS_PIPELINE: OrderStatus[] = [
  'survey_completed',
  'quotation_approved',
  'order_received',
  'equipment_procured',
  'installation_scheduled',
  'installation_in_progress',
  'installation_completed',
];

export type ApiOrder = {
  id: string;
  leadId: string;
  quotationId: string;
  clientId: string;
  staffId: string;
  installationTeam?: string;
  sourcingNotes?: string;
  status: OrderStatus;
  statusHistory: Array<{
    status: OrderStatus;
    updatedAt: string;
    note?: string;
  }>;
  installationDate?: string;
  paymentMilestones: PaymentMilestone[];
  createdAt: string;
  updatedAt: string;
};

export type OrderInvoiceResponse = {
  invoiceId: string;
  orderId: string;
  clientId: string;
  quotationId: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  downloadUrl: string;
};

export type QuotationLineItem = {
  id: string;
  productId?: string;
  label: string;
  quantity: number;
  unitPrice: number;
};

export type ApiQuotation = {
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

export type QuotationDownloadResponse = {
  quotationId: string;
  downloadUrl: string;
  fileName: string;
};

export type CreateOrderPayload = {
  leadId: string;
  quotationId: string;
  clientId: string;
  staffId: string;
  installationTeam?: string;
  sourcingNotes?: string;
  installationDate?: string;
};

export type CreateQuotationPayload = {
  leadId: string;
  clientId: string;
  staffId: string;
  systemSizeKw: number;
  items: QuotationLineItem[];
  subsidyScheme?: string;
  subsidyAmount?: number;
  finalPrice?: number;
  notes?: string;
  status?: 'draft' | 'sent';
  sharedVia?: Array<'in_app' | 'sms'>;
};

export type ApiNotification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'action' | 'system';
  read: boolean;
  createdAt: string;
};

export type ApiSupportChatMessage = {
  id: string;
  author: 'user' | 'support';
  text: string;
  createdAt: string;
};

export type ApiSupportConversation = {
  id: string;
  userId: string;
  status: 'open' | 'closed';
  createdAt: string;
  updatedAt: string;
  messages: ApiSupportChatMessage[];
};

export type ClientDashboardResponse = {
  recommendedProducts: ApiProduct[];
  activeOrders: ApiOrder[];
  installationProgress: Array<{
    orderId: string;
    status: OrderStatus;
    installationDate?: string;
    paymentMilestones: PaymentMilestone[];
  }>;
  quotations: ApiQuotation[];
  notifications: ApiNotification[];
  leadSummary: {
    total: number;
    open: number;
  };
};

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'survey_scheduled'
  | 'survey_completed'
  | 'quotation_sent'
  | 'won'
  | 'lost';

export type LeadTaskType = 'sales' | 'survey' | 'installation' | 'general';

export const LEAD_TASK_TYPES: LeadTaskType[] = ['sales', 'survey', 'installation', 'general'];

export type ApiLead = {
  id: string;
  clientId: string;
  source: string;
  monthlyElectricityBill: number;
  requiredLoadKw: number;
  roofType: string;
  address: string;
  phone: string;
  notes?: string;
  interestedProductId?: string;
  status: LeadStatus;
  taskType?: LeadTaskType;
  assignedStaffId?: string;
  internalNotes?: string[];
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

export type AutoAssignLeadResult = {
  lead: ApiLead;
  assignment: {
    staffId: string;
    staffName: string;
    reason: string;
    taskType: LeadTaskType;
    matchedTaskProfile: boolean;
    openLeads: number;
    activeOrders: number;
  };
};

export type AutoAssignOrderResult = {
  order: ApiOrder;
  assignment: AutoAssignLeadResult['assignment'];
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
    status: OrderStatus;
  }>;
  activityFeed: Array<{
    orderId: string;
    status: OrderStatus;
    updatedAt: string;
  }>;
};
