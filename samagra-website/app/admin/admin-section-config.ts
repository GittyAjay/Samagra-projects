import { adminMessages } from './admin-messages';

export type AdminSection =
  | 'overview'
  | 'clients'
  | 'products'
  | 'leads'
  | 'orders'
  | 'team'
  | 'notifications';

export const adminSectionMeta: Record<AdminSection, { label: string; meta: string }> = {
  overview: adminMessages.sections.overview,
  clients: adminMessages.sections.clients,
  products: adminMessages.sections.products,
  leads: adminMessages.sections.leads,
  orders: adminMessages.sections.orders,
  team: adminMessages.sections.team,
  notifications: adminMessages.sections.notifications,
};
