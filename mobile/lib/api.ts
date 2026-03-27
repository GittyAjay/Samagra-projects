import Constants from 'expo-constants';

import type {
  AdminDashboardResponse,
  ApiLead,
  ApiNotification,
  ApiOrder,
  ApiProduct,
  ApiQuotation,
  ApiSupportConversation,
  ApiUser,
  AuthResponse,
  AutoAssignLeadResult,
  AutoAssignOrderResult,
  ClientDashboardResponse,
  CreateOrderPayload,
  CreateProductPayload,
  CreateQuotationPayload,
  CreateStaffPayload,
  ForgotPasswordRequestResponse,
  ForgotPasswordVerifyResponse,
  OrderInvoiceResponse,
  QuotationDownloadResponse,
  RegisterResponse,
  RegisterVerifyResponse,
  StaffProfile,
  StaffDashboardResponse,
  StaffWorkloadResponse,
} from '@/types/api';

const API_BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl ?? 'https://samagra-backend.vercel.app/api';

type RequestOptions = {
  body?: unknown;
  headers?: Record<string, string>;
  method?: 'GET' | 'POST' | 'PATCH';
};

function roleHeaders(user: ApiUser): Record<string, string> {
  return {
    'x-user-id': user.id,
    'x-user-role': user.role,
  };
}

async function request<T>(path: string, options: RequestOptions = {}) {
  const method = options.method ?? 'GET';
  const isGet = method === 'GET';
  const requestPath = isGet
    ? `${path}${path.includes('?') ? '&' : '?'}_ts=${Date.now()}`
    : path;

  const response = await fetch(`${API_BASE_URL}${requestPath}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(isGet
        ? {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
          }
        : null),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    let message = 'Request failed';
    const contentType = response.headers.get('content-type') ?? '';

    try {
      if (contentType.includes('application/json')) {
        const payload = (await response.json()) as { statusMessage?: string; message?: string };
        message = payload.statusMessage ?? payload.message ?? message;
      } else {
        const payload = await response.text();

        if (payload.includes('Vercel Authentication') || payload.includes('Authentication Required')) {
          message =
            'The deployed backend is protected by Vercel Authentication. Disable deployment protection or provide a public/bypass URL.';
        } else {
          message = response.statusText || message;
        }
      }
    } catch {
      message = response.statusText || message;
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export function login(body: { identifier: string; password: string }) {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body,
  });
}

export function register(body: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}) {
  return request<RegisterResponse>('/auth/register', {
    method: 'POST',
    body,
  });
}

export function verifyRegistrationOtp(body: { email: string; otp: string }) {
  return request<RegisterVerifyResponse>('/auth/register/verify', {
    method: 'POST',
    body,
  });
}

export function requestPasswordReset(body: { identifier: string }) {
  return request<ForgotPasswordRequestResponse>('/auth/forgot-password/request', {
    method: 'POST',
    body,
  });
}

export function verifyPasswordReset(body: { identifier: string; otp: string; newPassword: string }) {
  return request<ForgotPasswordVerifyResponse>('/auth/forgot-password/verify', {
    method: 'POST',
    body,
  });
}

export function fetchClientDashboard(clientId: string) {
  return request<ClientDashboardResponse>(`/dashboard/client/${clientId}`);
}

export function fetchAdminDashboard(user: ApiUser) {
  return request<AdminDashboardResponse>('/dashboard/admin', {
    method: 'GET',
    headers: roleHeaders(user),
  });
}

export function fetchAllOrders() {
  return request<ApiOrder[]>('/orders', { method: 'GET' });
}

export function fetchOrders(params?: { clientId?: string; staffId?: string; quotationId?: string }) {
  const search = new URLSearchParams();

  if (params?.clientId) {
    search.set('clientId', params.clientId);
  }

  if (params?.staffId) {
    search.set('staffId', params.staffId);
  }

  if (params?.quotationId) {
    search.set('quotationId', params.quotationId);
  }

  const query = search.toString();
  return request<ApiOrder[]>(`/orders${query ? `?${query}` : ''}`, { method: 'GET' });
}

export function fetchAllLeads() {
  return request<ApiLead[]>('/leads', { method: 'GET' });
}

export function fetchLeads(params?: { clientId?: string; staffId?: string; status?: string }) {
  const search = new URLSearchParams();

  if (params?.clientId) {
    search.set('clientId', params.clientId);
  }

  if (params?.staffId) {
    search.set('staffId', params.staffId);
  }

  if (params?.status) {
    search.set('status', params.status);
  }

  const query = search.toString();
  return request<ApiLead[]>(`/leads${query ? `?${query}` : ''}`, { method: 'GET' });
}

export function fetchLead(leadId: string) {
  return request<ApiLead>(`/leads/${leadId}`);
}

export function fetchStaffDashboard(staffId: string) {
  return request<StaffDashboardResponse>(`/dashboard/staff/${staffId}`);
}

export function createQuotation(user: ApiUser, payload: CreateQuotationPayload) {
  return request<ApiQuotation>('/quotations', {
    method: 'POST',
    headers: roleHeaders(user),
    body: payload,
  });
}

export function fetchQuotation(quotationId: string) {
  return request<ApiQuotation>(`/quotations/${quotationId}`);
}

export function fetchQuotationDownload(quotationId: string) {
  const encodedId = encodeURIComponent(quotationId);
  return Promise.resolve<QuotationDownloadResponse>({
    quotationId,
    fileName: `quotation-${quotationId}.txt`,
    downloadUrl: `${API_BASE_URL}/quotations/${encodedId}/file`,
  });
}

export function fetchQuotations(params?: { clientId?: string; staffId?: string; leadId?: string }) {
  const search = new URLSearchParams();

  if (params?.clientId) {
    search.set('clientId', params.clientId);
  }

  if (params?.staffId) {
    search.set('staffId', params.staffId);
  }

  if (params?.leadId) {
    search.set('leadId', params.leadId);
  }

  const query = search.toString();
  return request<ApiQuotation[]>(`/quotations${query ? `?${query}` : ''}`, { method: 'GET' });
}

export function approveQuotation(user: ApiUser, quotationId: string) {
  return request<ApiQuotation>(`/quotations/${quotationId}/approve`, {
    method: 'POST',
    headers: roleHeaders(user),
  });
}

export function createOrder(user: ApiUser, payload: CreateOrderPayload) {
  return request<ApiOrder>('/orders', {
    method: 'POST',
    headers: roleHeaders(user),
    body: payload,
  });
}

export function patchOrderStatus(
  user: ApiUser,
  orderId: string,
  body: { status: ApiOrder['status']; note?: string }
) {
  return request<ApiOrder>(`/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: roleHeaders(user),
    body,
  });
}

/** Admin-only: list clients for resolving lead `clientId` → display name. */
export function fetchClientDirectory(admin: ApiUser, search?: string) {
  const q = new URLSearchParams();
  q.set('role', 'client');
  if (search?.trim()) {
    q.set('search', search.trim());
  }
  return request<StaffProfile[]>(`/users?${q.toString()}`, {
    method: 'GET',
    headers: roleHeaders(admin),
  });
}

export function fetchProducts(params?: { category?: string; search?: string }) {
  const search = new URLSearchParams();

  if (params?.category) {
    search.set('category', params.category);
  }

  if (params?.search) {
    search.set('search', params.search);
  }

  const query = search.toString();
  return request<ApiProduct[]>(`/products${query ? `?${query}` : ''}`);
}

export function fetchProduct(productId: string) {
  return request<ApiProduct>(`/products/${productId}`);
}

export function createInquiry(body: {
  clientId: string;
  monthlyElectricityBill: number;
  requiredLoadKw: number;
  roofType: string;
  address: string;
  phone: string;
  interestedProductId?: string;
  notes?: string;
}) {
  return request<{ message: string; lead: ApiLead; autoAssigned: boolean }>('/inquiries', {
    method: 'POST',
    body,
  });
}

export function registerPushToken(user: ApiUser, body: { token: string; platform: 'ios' | 'android' }) {
  return request<{ message: string; tokenId: string }>('/push-tokens/register', {
    method: 'POST',
    headers: roleHeaders(user),
    body,
  });
}

export function createProduct(user: ApiUser, payload: CreateProductPayload) {
  return request<ApiProduct>('/products', {
    method: 'POST',
    headers: roleHeaders(user),
    body: payload,
  });
}

export function fetchStaffDirectory(admin: ApiUser, search?: string) {
  const q = new URLSearchParams();
  q.set('role', 'staff');
  if (search?.trim()) {
    q.set('search', search.trim());
  }
  return request<StaffProfile[]>(`/users?${q.toString()}`, {
    method: 'GET',
    headers: roleHeaders(admin),
  });
}

export function createStaffUser(admin: ApiUser, payload: CreateStaffPayload) {
  return request<{ user: StaffProfile }>('/users', {
    method: 'POST',
    headers: roleHeaders(admin),
    body: payload,
  });
}

export function assignLeadToStaff(admin: ApiUser, leadId: string, assignedStaffId: string) {
  return request<ApiLead>(`/leads/${leadId}/assign`, {
    method: 'POST',
    headers: roleHeaders(admin),
    body: { assignedStaffId },
  });
}

export function assignOrderToStaff(admin: ApiUser, orderId: string, staffId: string) {
  return request<ApiOrder>(`/orders/${orderId}/assign-staff`, {
    method: 'POST',
    headers: roleHeaders(admin),
    body: { staffId },
  });
}

export function fetchStaffWorkload(admin: ApiUser) {
  return request<StaffWorkloadResponse>('/users/staff-workload', {
    method: 'GET',
    headers: roleHeaders(admin),
  });
}

export function autoAssignLead(admin: ApiUser, leadId: string) {
  return request<AutoAssignLeadResult>(`/leads/${leadId}/auto-assign`, {
    method: 'POST',
    headers: roleHeaders(admin),
  });
}

export function autoAssignOrder(admin: ApiUser, orderId: string) {
  return request<AutoAssignOrderResult>(`/orders/${orderId}/auto-assign-staff`, {
    method: 'POST',
    headers: roleHeaders(admin),
  });
}

export function patchLead(
  admin: ApiUser,
  leadId: string,
  body: Partial<Pick<ApiLead, 'taskType' | 'status'>> & { internalNotes?: string[] }
) {
  return request<ApiLead>(`/leads/${leadId}`, {
    method: 'PATCH',
    headers: roleHeaders(admin),
    body,
  });
}

export function fetchOrder(orderId: string) {
  return request<ApiOrder>(`/orders/${orderId}`);
}

export function fetchOrderInvoice(orderId: string) {
  return request<OrderInvoiceResponse>(`/orders/${orderId}/invoice`);
}

export function fetchNotifications(userId: string) {
  return request<ApiNotification[]>(`/notifications?userId=${encodeURIComponent(userId)}`);
}

export function fetchSupportConversation(user: ApiUser) {
  return request<ApiSupportConversation>(`/support/chat?userId=${encodeURIComponent(user.id)}`, {
    method: 'GET',
    headers: roleHeaders(user),
  });
}

export function sendSupportMessage(user: ApiUser, text: string) {
  return request<ApiSupportConversation>('/support/chat', {
    method: 'POST',
    headers: roleHeaders(user),
    body: {
      userId: user.id,
      text,
    },
  });
}
