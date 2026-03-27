import type { ApiUser, StaffHomeRoute } from '@/types/api';

function readString(value: unknown) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function readTaskTypes(user: ApiUser) {
  const raw = user.metadata?.taskTypes;

  if (!Array.isArray(raw)) {
    return [] as string[];
  }

  return raw
    .map((entry) => readString(entry))
    .filter(Boolean);
}

export function getStaffExperience(user: ApiUser) {
  const taskTypes = readTaskTypes(user);
  const designation = readString(user.metadata?.designation);

  if (taskTypes.includes('sales') || designation.includes('sales')) {
    return 'sales' as const;
  }

  if (taskTypes.includes('survey') || designation.includes('survey')) {
    return 'survey' as const;
  }

  if (
    taskTypes.includes('installation') ||
    taskTypes.includes('installer') ||
    designation.includes('installation') ||
    designation.includes('installer')
  ) {
    return 'installation' as const;
  }

  return 'general' as const;
}

export function getHomeRouteForUser(user: ApiUser): '/(tabs)' | '/admin' | StaffHomeRoute {
  if (user.role === 'client') {
    return '/(tabs)';
  }

  if (user.role === 'admin') {
    return '/admin';
  }

  const experience = getStaffExperience(user);

  if (experience === 'sales') {
    return '/staff/leads';
  }

  if (experience === 'survey' || experience === 'installation') {
    return '/staff/orders';
  }

  return '/staff/leads';
}
