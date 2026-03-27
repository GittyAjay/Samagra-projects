'use client';

import type { ComponentProps } from 'react';

import {
  IconBell,
  IconCheckCircle,
  IconLogIn,
  IconRefreshCw,
  IconUserPlus,
} from './admin-action-icons';
import { AdminSubmitButton } from './admin-form-status';

const iconMap = {
  logIn: IconLogIn,
  userPlus: IconUserPlus,
  refreshCw: IconRefreshCw,
  checkCircle: IconCheckCircle,
  bell: IconBell,
} as const;

export type AdminIconSubmitName = keyof typeof iconMap;

type SubmitProps = ComponentProps<typeof AdminSubmitButton>;

/** Use from Server Components instead of passing `<Icon />` into `AdminSubmitButton` (avoids RSC/client reference issues). */
export function AdminIconSubmitButton({
  icon,
  ...props
}: { icon: AdminIconSubmitName } & Omit<SubmitProps, 'icon'>) {
  const Icon = iconMap[icon];
  return <AdminSubmitButton {...props} icon={<Icon />} />;
}
