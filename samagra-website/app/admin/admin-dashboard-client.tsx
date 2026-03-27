'use client';

import { type ReactNode, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { type AdminSection, adminSectionMeta } from './admin-section-config';
import { useAdminToast } from './admin-toast';

/** Main dashboard sections only (sidebar + header come from `AdminAppChrome` in layout). */
export function AdminDashboardBody({
  message,
  error,
  dataError,
  sectionPanels,
  activeSection,
}: {
  message?: string;
  error?: string;
  dataError?: string | null;
  activeSection: AdminSection;
  sectionPanels: Array<{ id: AdminSection; content: ReactNode }>;
}) {
  const { pushToast } = useAdminToast();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sectionFromUrl =
    pathname === '/admin'
      ? ((searchParams.get('section') ?? 'overview') in adminSectionMeta
          ? (searchParams.get('section') ?? 'overview')
          : 'overview')
      : activeSection;
  const visibleSection = sectionFromUrl as AdminSection;

  useEffect(() => {
    if (message) {
      pushToast({ variant: 'success', message });
    }
  }, [message, pushToast]);

  useEffect(() => {
    if (error) {
      pushToast({ variant: 'error', message: error });
    }
  }, [error, pushToast]);

  useEffect(() => {
    if (dataError) {
      pushToast({ variant: 'error', message: dataError });
    }
  }, [dataError, pushToast]);

  return (
    <div className="admin-dashboard-section-root">
      {sectionPanels.map((panel) => {
        const isActive = panel.id === visibleSection;

        return (
          <div
            key={panel.id}
            className={`admin-dashboard-panel${isActive ? ' is-active' : ''}`}
            hidden={!isActive}
            aria-hidden={!isActive}
          >
            {panel.content}
          </div>
        );
      })}
    </div>
  );
}
