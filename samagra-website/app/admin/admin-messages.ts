import en from '../../messages/en.json';

export const adminMessages = en.admin;

export function formatAdminMessage(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (message, [key, value]) => message.replaceAll(`{{${key}}}`, String(value)),
    template
  );
}
