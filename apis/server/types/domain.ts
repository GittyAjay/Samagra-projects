export type UserRole = "client" | "staff" | "admin";

export type ProductCategory =
  | "solar_panel"
  | "solar_inverter"
  | "solar_battery"
  | "installation_package";

export type LeadStatus =
  | "new"
  | "contacted"
  | "survey_scheduled"
  | "survey_completed"
  | "quotation_sent"
  | "won"
  | "lost";

/** Used for routing / auto-assign: which kind of work this lead needs. */
export type LeadTaskType = "sales" | "survey" | "installation" | "general";

export type OrderStatus =
  | "order_received"
  | "survey_completed"
  | "quotation_approved"
  | "equipment_procured"
  | "installation_scheduled"
  | "installation_in_progress"
  | "installation_completed";

export interface UserProfile {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  active: boolean;
  emailVerified?: boolean;
  emailVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface Product {
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
}

export interface InquiryDocument {
  id: string;
  fileName: string;
  fileUrl: string;
  documentType: "electricity_bill" | "roof_photo" | "other";
}

export interface Lead {
  id: string;
  clientId: string;
  source: "client_app" | "landing_page" | "admin";
  monthlyElectricityBill: number;
  requiredLoadKw: number;
  roofType: string;
  address: string;
  phone: string;
  notes?: string;
  interestedProductId?: string;
  documents: InquiryDocument[];
  status: LeadStatus;
  /** Drives auto-assign: pick staff whose metadata.taskTypes includes this (or generalists). */
  taskType?: LeadTaskType;
  assignedStaffId?: string;
  internalNotes: string[];
  surveySchedule?: {
    scheduledAt: string;
    assignedTo: string;
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface QuotationItem {
  id: string;
  productId?: string;
  label: string;
  quantity: number;
  unitPrice: number;
}

export interface Quotation {
  id: string;
  leadId: string;
  clientId: string;
  staffId: string;
  systemSizeKw: number;
  items: QuotationItem[];
  subsidyScheme?: string;
  subsidyAmount: number;
  subtotal: number;
  finalPrice: number;
  notes?: string;
  status: "draft" | "sent" | "approved" | "rejected";
  sharedVia: Array<"in_app" | "sms">;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMilestone {
  id: string;
  label: string;
  amount: number;
  status: "pending" | "paid";
  paidAt?: string;
  receiptUrl?: string;
}

export interface Order {
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
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "action" | "system";
  read: boolean;
  createdAt: string;
}

export interface SupportChatMessage {
  id: string;
  author: "user" | "support";
  text: string;
  createdAt: string;
}

export interface SupportConversation {
  id: string;
  userId: string;
  status: "open" | "closed";
  createdAt: string;
  updatedAt: string;
  messages: SupportChatMessage[];
}

export interface Session {
  id: string;
  userId: string;
  role: UserRole;
  token: string;
  createdAt: string;
}

export interface PushToken {
  id: string;
  userId: string;
  token: string;
  platform: "ios" | "android";
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
