'use server';

import { revalidatePath } from 'next/cache';

import { invalidateAdminDashboardCache } from './admin-invalidate';
import { adminMessages } from './admin-messages';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import {
  adminApi,
  getApiBaseUrl,
  type Lead,
  type Order,
  type Product,
  type Quotation,
} from './lib';

function asNumber(value: FormDataEntryValue | null) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function splitList(value: FormDataEntryValue | null) {
  if (!value) {
    return [];
  }

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function redirectToAdmin(options?: {
  section?: 'products' | 'leads' | 'orders' | 'notifications' | 'team';
  message?: string;
  error?: string;
}) {
  const params = new URLSearchParams();

  if (options?.section) {
    params.set('section', options.section);
  }

  if (options?.message) {
    params.set('message', options.message);
  }

  if (options?.error) {
    params.set('error', options.error);
  }

  const query = params.toString();
  redirect(query ? `/admin?${query}` : '/admin');
}

export async function loginAdmin(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  });

  if (!response.ok) {
    redirect(`/admin?error=${encodeURIComponent(adminMessages.actions.invalidCredentials)}`);
  }

  const payload = (await response.json()) as {
    token: string;
    user: {
      id: string;
      fullName: string;
      role: 'client' | 'staff' | 'admin';
      email: string;
      phone: string;
    };
  };

  if (payload.user.role !== 'admin') {
    redirect(`/admin?error=${encodeURIComponent(adminMessages.actions.notAdminAccount)}`);
  }

  const jar = await cookies();
  jar.set(
    'samagra_admin_session',
    JSON.stringify({
      token: payload.token,
      id: payload.user.id,
      fullName: payload.user.fullName,
      email: payload.user.email,
      role: 'admin',
    }),
    {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8,
    }
  );

  redirect('/admin');
}

export async function logoutAdmin() {
  const jar = await cookies();
  jar.delete('samagra_admin_session');
  redirect(`/admin?message=${encodeURIComponent(adminMessages.actions.loggedOut)}`);
}

export type ProductFormState =
  | null
  | { ok: true; message: string; quotationId?: string; orderId?: string }
  | { ok: false; error: string };

/** Shared shape for in-place server actions (no redirect). */
export type AdminFormActionState = ProductFormState;

export async function createProductAction(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  try {
    await adminApi('/products', {
      method: 'POST',
      body: JSON.stringify({
        name: String(formData.get('name') ?? '').trim(),
        category: String(formData.get('category') ?? '').trim(),
        description: String(formData.get('description') ?? '').trim(),
        estimatedPrice: asNumber(formData.get('estimatedPrice')),
        capacityKw: asNumber(formData.get('capacityKw')),
        warrantyYears: asNumber(formData.get('warrantyYears')),
        compatibility: splitList(formData.get('compatibility')),
        imageUrls: splitList(formData.get('imageUrls')),
        active: formData.get('active') === 'on',
      }),
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : adminMessages.actions.createProductFailed,
    };
  }

  revalidatePath('/admin');
  invalidateAdminDashboardCache();
  return { ok: true, message: adminMessages.actions.productCreated };
}

export async function updateProductAction(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const id = String(formData.get('id') ?? '');

  try {
    await adminApi(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        estimatedPrice: asNumber(formData.get('estimatedPrice')),
        warrantyYears: asNumber(formData.get('warrantyYears')),
        active: formData.get('active') === 'on',
      }),
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : adminMessages.actions.updateProductFailed,
    };
  }

  revalidatePath('/admin');
  invalidateAdminDashboardCache();
  return { ok: true, message: adminMessages.actions.productUpdated };
}

export async function deleteProductAction(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const id = String(formData.get('id') ?? '');

  try {
    await adminApi(`/products/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : adminMessages.actions.deleteProductFailed,
    };
  }

  revalidatePath('/admin');
  invalidateAdminDashboardCache();
  return { ok: true, message: adminMessages.actions.productDeleted };
}

export async function assignLeadAction(
  _prev: AdminFormActionState,
  formData: FormData
): Promise<AdminFormActionState> {
  const id = String(formData.get('id') ?? '');
  const assignedStaffId = String(formData.get('assignedStaffId') ?? '').trim();

  if (!assignedStaffId) {
    return { ok: false, error: adminMessages.actions.selectStaffAssign };
  }

  try {
    await adminApi(`/leads/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ assignedStaffId }),
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : adminMessages.actions.assignLeadFailed,
    };
  }

  revalidatePath('/admin');
  invalidateAdminDashboardCache();
  return { ok: true, message: adminMessages.actions.leadAssigned };
}

export async function updateLeadAction(
  _prev: AdminFormActionState,
  formData: FormData
): Promise<AdminFormActionState> {
  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? '').trim();
  const note = String(formData.get('note') ?? '').trim();

  try {
    const existing = await adminApi<Lead>(`/leads/${id}`);
    const prior = existing.internalNotes ?? [];
    const internalNotes = note ? [...prior, note] : undefined;

    await adminApi(`/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status,
        ...(internalNotes ? { internalNotes } : {}),
      }),
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : adminMessages.actions.updateLeadFailed,
    };
  }

  revalidatePath('/admin');
  invalidateAdminDashboardCache();
  return { ok: true, message: adminMessages.actions.leadUpdated };
}

export async function appendLeadNoteAction(
  _prev: AdminFormActionState,
  formData: FormData
): Promise<AdminFormActionState> {
  const id = String(formData.get('id') ?? '');
  const note = String(formData.get('note') ?? '').trim();

  if (!note) {
    return { ok: false, error: adminMessages.actions.enterNote };
  }

  try {
    const existing = await adminApi<Lead>(`/leads/${id}`);
    const prior = existing.internalNotes ?? [];
    await adminApi(`/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ internalNotes: [...prior, note] }),
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : adminMessages.actions.saveNoteFailed,
    };
  }

  revalidatePath('/admin');
  invalidateAdminDashboardCache();
  revalidatePath(`/admin/leads/${id}`);
  return { ok: true, message: adminMessages.actions.noteSaved };
}

export async function updateLeadTaskAction(
  _prev: AdminFormActionState,
  formData: FormData
): Promise<AdminFormActionState> {
  const id = String(formData.get('id') ?? '');
  const taskType = String(formData.get('taskType') ?? '').trim();

  try {
    await adminApi(`/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ taskType }),
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : adminMessages.actions.updateTaskTypeFailed,
    };
  }

  revalidatePath('/admin');
  invalidateAdminDashboardCache();
  revalidatePath(`/admin/leads/${id}`);
  return { ok: true, message: 'Task type updated' };
}

export async function updateOrderStatusAction(
  _prev: AdminFormActionState,
  formData: FormData
): Promise<AdminFormActionState> {
  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? '').trim();
  const note = String(formData.get('note') ?? '').trim();

  try {
    await adminApi(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to update order status',
    };
  }

  revalidatePath('/admin');
  invalidateAdminDashboardCache();
  revalidatePath(`/admin/orders/${id}`);
  return { ok: true, message: 'Order status updated' };
}

export async function markPaymentPaidAction(
  _prev: AdminFormActionState,
  formData: FormData
): Promise<AdminFormActionState> {
  const id = String(formData.get('id') ?? '');
  const milestoneId = String(formData.get('milestoneId') ?? '').trim();
  const receiptUrl = String(formData.get('receiptUrl') ?? '').trim();

  try {
    await adminApi(`/orders/${id}/payments`, {
      method: 'POST',
      body: JSON.stringify({
        milestoneId,
        receiptUrl: receiptUrl || undefined,
      }),
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to record payment',
    };
  }

  revalidatePath('/admin');
  invalidateAdminDashboardCache();
  revalidatePath(`/admin/orders/${id}`);
  return { ok: true, message: 'Payment marked as paid' };
}

export async function createNotificationAction(
  _prev: AdminFormActionState,
  formData: FormData
): Promise<AdminFormActionState> {
  try {
    await adminApi('/notifications', {
      method: 'POST',
      body: JSON.stringify({
        userId: String(formData.get('userId') ?? '').trim(),
        title: String(formData.get('title') ?? '').trim(),
        message: String(formData.get('message') ?? '').trim(),
        type: String(formData.get('type') ?? 'info').trim(),
      }),
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to send notification',
    };
  }

  revalidatePath('/admin');
  invalidateAdminDashboardCache();
  return { ok: true, message: 'Notification sent' };
}

export async function createStaffAction(
  _prev: AdminFormActionState,
  formData: FormData
): Promise<AdminFormActionState> {
  const fullName = String(formData.get('fullName') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const phone = String(formData.get('phone') ?? '').replace(/\D/g, '').slice(0, 15);
  const password = String(formData.get('password') ?? '');
  const designation = String(formData.get('designation') ?? '').trim();
  const taskTypes = formData.getAll('taskTypes').map((v) => String(v).trim()).filter(Boolean);

  if (!fullName) {
    return { ok: false, error: 'Full name is required.' };
  }
  if (!email.includes('@')) {
    return { ok: false, error: 'Enter a valid email.' };
  }
  if (phone.length < 10) {
    return { ok: false, error: 'Enter a valid phone number (10+ digits).' };
  }
  if (password.length < 6) {
    return { ok: false, error: 'Password must be at least 6 characters.' };
  }

  try {
    await adminApi('/users', {
      method: 'POST',
      body: JSON.stringify({
        fullName,
        email,
        phone,
        password,
        role: 'staff',
        designation: designation || undefined,
        taskTypes: taskTypes.length ? taskTypes : undefined,
      }),
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to create staff user',
    };
  }

  revalidatePath('/admin');
  invalidateAdminDashboardCache();
  return { ok: true, message: 'Staff member created' };
}

export async function assignOrderToStaffAction(
  _prev: AdminFormActionState,
  formData: FormData
): Promise<AdminFormActionState> {
  const id = String(formData.get('id') ?? '');
  const staffId = String(formData.get('staffId') ?? '').trim();

  if (!staffId) {
    return { ok: false, error: 'Select a staff member.' };
  }

  try {
    await adminApi(`/orders/${id}/assign-staff`, {
      method: 'POST',
      body: JSON.stringify({ staffId }),
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to assign order',
    };
  }

  revalidatePath('/admin');
  invalidateAdminDashboardCache();
  revalidatePath(`/admin/orders/${id}`);
  return { ok: true, message: 'Order assigned to staff' };
}

type AutoAssignPayload = {
  lead: Lead;
  assignment: { staffName: string; reason: string };
};

export async function autoAssignLeadAction(
  _prev: AdminFormActionState,
  formData: FormData
): Promise<AdminFormActionState> {
  const id = String(formData.get('id') ?? '');

  try {
    const result = await adminApi<AutoAssignPayload>(`/leads/${id}/auto-assign`, {
      method: 'POST',
    });
    const name = result.assignment?.staffName ?? 'staff';
    return { ok: true, message: `Lead auto-assigned to ${name}` };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Auto-assign failed',
    };
  } finally {
    revalidatePath('/admin');
    invalidateAdminDashboardCache();
    revalidatePath(`/admin/leads/${id}`);
  }
}

type AutoAssignOrderPayload = {
  order: Order;
  assignment: { staffName: string };
};

export async function autoAssignOrderAction(
  _prev: AdminFormActionState,
  formData: FormData
): Promise<AdminFormActionState> {
  const id = String(formData.get('id') ?? '');

  try {
    const result = await adminApi<AutoAssignOrderPayload>(`/orders/${id}/auto-assign-staff`, {
      method: 'POST',
    });
    const name = result.assignment?.staffName ?? 'staff';
    return { ok: true, message: `Order auto-assigned to ${name}` };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Auto-assign failed',
    };
  } finally {
    revalidatePath('/admin');
    invalidateAdminDashboardCache();
    revalidatePath(`/admin/orders/${id}`);
  }
}

export async function createQuotationAction(
  _prev: AdminFormActionState,
  formData: FormData
): Promise<AdminFormActionState> {
  const leadId = String(formData.get('leadId') ?? '');
  const clientId = String(formData.get('clientId') ?? '');
  let staffId = String(formData.get('staffId') ?? '').trim();
  const systemSizeKw = asNumber(formData.get('systemSizeKw'));
  const panelProductId = String(formData.get('panelProductId') ?? '').trim();
  const inverterProductId = String(formData.get('inverterProductId') ?? '').trim();
  const equipmentCost = asNumber(formData.get('equipmentCost'));
  const subsidyAmount = asNumber(formData.get('subsidyAmount')) ?? 0;
  const notes = String(formData.get('notes') ?? '').trim();

  if (!systemSizeKw || systemSizeKw <= 0) {
    return { ok: false, error: 'Enter a valid system size (kW).' };
  }
  if (!panelProductId || !inverterProductId) {
    return { ok: false, error: 'Select a panel and an inverter.' };
  }
  if (!equipmentCost || equipmentCost <= 0) {
    return { ok: false, error: 'Enter total equipment cost.' };
  }

  let panelName = '';
  let inverterName = '';
  try {
    const [panel, inverter] = await Promise.all([
      adminApi<Product>(`/products/${panelProductId}`),
      adminApi<Product>(`/products/${inverterProductId}`),
    ]);
    panelName = panel.name;
    inverterName = inverter.name;
  } catch {
    return { ok: false, error: 'Could not load selected products.' };
  }

  const finalPrice = Math.max(0, equipmentCost - subsidyAmount);
  const lineLabel = `${panelName} + ${inverterName} (${systemSizeKw}kW system)`;
  const itemId = `qi_${Date.now()}`;

  try {
    if (!staffId) {
      const lead = await adminApi<Lead>(`/leads/${leadId}`);
      staffId = lead.assignedStaffId ?? '';
    }
    if (!staffId) {
      return { ok: false, error: 'Assign a staff member to this lead first, or pick staff explicitly.' };
    }

    const created = await adminApi<{ id: string }>('/quotations', {
      method: 'POST',
      body: JSON.stringify({
        leadId,
        clientId,
        staffId,
        systemSizeKw,
        items: [
          {
            id: itemId,
            productId: panelProductId || undefined,
            label: lineLabel,
            quantity: 1,
            unitPrice: equipmentCost,
          },
        ],
        subsidyScheme: 'Government subsidy estimate',
        subsidyAmount,
        finalPrice,
        notes: notes || undefined,
        status: 'sent',
        sharedVia: ['in_app'],
      }),
    });
    revalidatePath('/admin');
    invalidateAdminDashboardCache();
    revalidatePath(`/admin/leads/${leadId}`);
    return { ok: true, message: 'Quotation sent to client', quotationId: created.id };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to create quotation',
    };
  }
}

export async function createOrderFromQuotationAction(
  _prev: AdminFormActionState,
  formData: FormData
): Promise<AdminFormActionState> {
  const quotationId = String(formData.get('quotationId') ?? '').trim();
  const installationDateRaw = String(formData.get('installationDate') ?? '').trim();

  try {
    const quotation = await adminApi<Quotation>(`/quotations/${quotationId}`);
    const order = await adminApi<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify({
        leadId: quotation.leadId,
        quotationId,
        clientId: quotation.clientId,
        staffId: quotation.staffId,
        installationDate: installationDateRaw || undefined,
      }),
    });
    revalidatePath('/admin');
    invalidateAdminDashboardCache();
    revalidatePath(`/admin/quotations/${quotationId}`);
    return { ok: true, message: 'Order created from quotation', orderId: order.id };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to create order',
    };
  }
}

export async function approveQuotationAdminAction(
  _prev: AdminFormActionState,
  formData: FormData
): Promise<AdminFormActionState> {
  const id = String(formData.get('id') ?? '').trim();

  try {
    await adminApi(`/quotations/${id}/approve`, { method: 'POST' });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to approve quotation',
    };
  }

  revalidatePath('/admin');
  invalidateAdminDashboardCache();
  revalidatePath(`/admin/quotations/${id}`);
  return { ok: true, message: 'Quotation approved' };
}
