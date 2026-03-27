'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  type MouseEvent,
  type ReactNode,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';

import { AdminConfirmDialog } from './admin-confirm-dialog';
import { IconLogOut } from './admin-action-icons';
import { adminMessages } from './admin-messages';
import { type AdminSection, adminSectionMeta } from './admin-section-config';
import { AdminSidebarNavIcon } from './admin-sidebar-icons';
import { AdminToastProvider } from './admin-toast';

function inferSectionFromPath(pathname: string): AdminSection | null {
  if (pathname.startsWith('/admin/leads')) {
    return 'leads';
  }
  if (pathname.startsWith('/admin/orders')) {
    return 'orders';
  }
  if (pathname.startsWith('/admin/quotations')) {
    return 'leads';
  }
  return null;
}

function useHeaderCopy(): { label: string; meta: string } {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const leadMatch = pathname.match(/^\/admin\/leads\/([^/]+)$/);
  if (leadMatch) {
    return { label: leadMatch[1].toUpperCase(), meta: adminMessages.chrome.nested.lead };
  }

  if (pathname === '/admin/quotations/new') {
    const leadId = searchParams.get('leadId');
    return {
      label: adminMessages.chrome.nested.newQuote,
      meta: leadId ? `${adminMessages.chrome.nested.lead} ${leadId}` : adminMessages.chrome.nested.draft,
    };
  }

  const quoteMatch = pathname.match(/^\/admin\/quotations\/([^/]+)$/);
  if (quoteMatch) {
    return { label: quoteMatch[1].toUpperCase(), meta: 'Quote' };
  }

  if (pathname === '/admin/orders/new') {
    const quotationId = searchParams.get('quotationId');
    return {
      label: 'New order',
      meta: quotationId ? `Quote ${quotationId}` : 'Create',
    };
  }

  const orderMatch = pathname.match(/^\/admin\/orders\/([^/]+)$/);
  if (orderMatch) {
    return { label: orderMatch[1].toUpperCase(), meta: adminMessages.chrome.nested.order };
  }

  if (pathname === '/admin') {
    const raw = searchParams.get('section') ?? 'overview';
    const section = (raw in adminSectionMeta ? raw : 'overview') as AdminSection;
    return adminSectionMeta[section];
  }

  return { label: 'Admin', meta: adminMessages.chrome.nested.console };
}

function useActiveNavSection(): AdminSection {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fromPath = inferSectionFromPath(pathname);
  if (fromPath) {
    return fromPath;
  }
  if (pathname === '/admin') {
    const raw = searchParams.get('section') ?? 'overview';
    return (raw in adminSectionMeta ? raw : 'overview') as AdminSection;
  }
  return 'overview';
}

/** When on a nested admin route (not the main dashboard), link back to the parent list or record. */
function useNestedAdminBack(): { show: boolean; href: string; ariaLabel: string } {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (pathname === '/admin' || !pathname.startsWith('/admin/')) {
    return { show: false, href: '/admin', ariaLabel: '' };
  }

  const leadMatch = pathname.match(/^\/admin\/leads\/([^/]+)$/);
  if (leadMatch) {
    return { show: true, href: '/admin?section=leads', ariaLabel: 'Back to leads list' };
  }

  if (pathname === '/admin/quotations/new') {
    const leadId = searchParams.get('leadId');
    if (leadId) {
      return {
        show: true,
        href: `/admin/leads/${encodeURIComponent(leadId)}`,
        ariaLabel: 'Back to lead',
      };
    }
    return { show: true, href: '/admin?section=leads', ariaLabel: 'Back to leads list' };
  }

  if (/^\/admin\/quotations\/[^/]+$/.test(pathname)) {
    return { show: true, href: '/admin?section=leads', ariaLabel: 'Back to leads list' };
  }

  if (pathname === '/admin/orders/new') {
    const quotationId = searchParams.get('quotationId');
    if (quotationId) {
      return {
        show: true,
        href: `/admin/quotations/${encodeURIComponent(quotationId)}`,
        ariaLabel: 'Back to quotation',
      };
    }
    return { show: true, href: '/admin?section=orders', ariaLabel: 'Back to orders list' };
  }

  if (/^\/admin\/orders\/[^/]+$/.test(pathname)) {
    return { show: true, href: '/admin?section=orders', ariaLabel: 'Back to orders list' };
  }

  return { show: true, href: '/admin', ariaLabel: 'Back to admin dashboard' };
}

function AdminAppChromeInner({
  logoutAction,
  children,
}: {
  logoutAction: (formData: FormData) => void | Promise<void>;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeNav = useActiveNavSection();
  const { label: headerLabel, meta: headerMeta } = useHeaderCopy();
  const nestedBack = useNestedAdminBack();
  const [isNavPending, startNavTransition] = useTransition();
  const logoutFormRef = useRef<HTMLFormElement>(null);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isLogoutPending, setIsLogoutPending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return [];
    }

    const aliases: Record<AdminSection, string[]> = {
      overview: ['dashboard', 'home', 'summary', 'kpi'],
      clients: ['customers', 'customer', 'directory', 'users'],
      products: ['catalog', 'inventory', 'items'],
      leads: ['pipeline', 'prospects', 'inquiries'],
      orders: ['execution', 'installs', 'installation'],
      team: ['staff', 'members', 'roster'],
      notifications: ['alerts', 'messages', 'updates'],
    };

    return (Object.entries(adminSectionMeta) as Array<[AdminSection, (typeof adminSectionMeta)[AdminSection]]>)
      .map(([section, config]) => {
        const terms = [config.label, config.meta, ...aliases[section]].join(' ').toLowerCase();
        return { section, config, score: terms.includes(query) ? terms.indexOf(query) : -1 };
      })
      .filter((entry) => entry.score !== -1)
      .sort((left, right) => left.score - right.score)
      .slice(0, 6);
  }, [searchQuery]);

  useEffect(() => {
    for (const section of Object.keys(adminSectionMeta) as AdminSection[]) {
      void router.prefetch(`/admin?section=${section}`);
    }
  }, [router]);

  useEffect(() => {
    if (!isLogoutConfirmOpen) {
      setIsLogoutPending(false);
    }
  }, [isLogoutConfirmOpen]);

  useEffect(() => {
    setSearchQuery('');
    setIsSearchOpen(false);
  }, [pathname, searchParams]);

  function pushDashboardSection(section: AdminSection) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('section', section);
    params.delete('message');
    params.delete('error');
    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    window.history.pushState(null, '', nextUrl);
  }

  function onDashboardSectionClick(e: MouseEvent<HTMLAnchorElement>, href: string) {
    if (e.defaultPrevented) {
      return;
    }
    if (e.button !== 0) {
      return;
    }
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    e.preventDefault();
    if (pathname === '/admin') {
      const url = new URL(href, window.location.origin);
      const nextSection = url.searchParams.get('section');
      if (nextSection && nextSection in adminSectionMeta) {
        pushDashboardSection(nextSection as AdminSection);
        return;
      }
    }
    startNavTransition(() => {
      router.replace(href);
    });
  }

  function goToSection(section: AdminSection) {
    setSearchQuery('');
    setIsSearchOpen(false);
    if (pathname === '/admin') {
      pushDashboardSection(section);
      return;
    }
    startNavTransition(() => {
      router.replace(`/admin?section=${section}`);
    });
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-panel">
          <a className="admin-sidebar-brand" href="/">
            <div className="brand-logo" style={{ borderRadius: 6, overflow: 'hidden' }}>
              <img
                src="/assets/logo.png"
                alt="Samagra Enterprises Logo"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div className="brand-name">
              Samagra Enterprises
              <span>{adminMessages.chrome.brandSubtitle}</span>
            </div>
          </a>

          <nav className="admin-sidebar-nav">
            {(Object.entries(adminSectionMeta) as Array<[AdminSection, (typeof adminSectionMeta)[AdminSection]]>).map(
              ([section, config]) => {
                const href = `/admin?section=${section}`;
                return (
                  <a
                    key={section}
                    href={href}
                    className={`admin-sidebar-link admin-sidebar-button${activeNav === section ? ' is-active' : ''}`}
                    onClick={(e) => onDashboardSectionClick(e, href)}
                  >
                    <span className="admin-sidebar-link-icon">
                      <AdminSidebarNavIcon section={section} />
                    </span>
                    <div className="admin-sidebar-link-copy">
                      <strong>{config.label}</strong>
                      <small>{config.meta}</small>
                    </div>
                  </a>
                );
              }
            )}
          </nav>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-top-header">
          <div className="admin-top-header-left">
            {nestedBack.show ? (
              <a
                className="admin-header-back"
                href={nestedBack.href}
                aria-label={nestedBack.ariaLabel}
                onClick={(e) => {
                  if (e.defaultPrevented || e.button !== 0) {
                    return;
                  }
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
                    return;
                  }
                  e.preventDefault();
                  startNavTransition(() => {
                    router.push(nestedBack.href);
                  });
                }}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                  <path
                    d="M15 18l-6-6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{adminMessages.chrome.back}</span>
              </a>
            ) : null}
            <div className="admin-section-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
                <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
                <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
                <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
              </svg>
            </div>
            <div>
              <h1>{headerLabel}</h1>
              <p>{headerMeta}</p>
            </div>
          </div>

          <div className="admin-top-header-right">
            <div className="admin-top-header-actions">
              <div className="admin-search-shell">
                <div
                  className="admin-search-box"
                >
                  <span className="admin-search-icon" aria-hidden="true" />
                  <input
                    type="search"
                    value={searchQuery}
                    placeholder={adminMessages.chrome.searchPlaceholder}
                    onFocus={() => setIsSearchOpen(true)}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsSearchOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchResults[0]) {
                        e.preventDefault();
                        goToSection(searchResults[0].section);
                      }
                    }}
                  />
                </div>
                {isSearchOpen && searchQuery.trim() ? (
                  <div className="admin-search-results" role="listbox" aria-label="Admin section search results">
                    {searchResults.length ? (
                      searchResults.map(({ section, config }) => (
                        <button
                          key={section}
                          type="button"
                          className="admin-search-result"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => goToSection(section)}
                        >
                          <strong>{config.label}</strong>
                          <span>{config.meta}</span>
                        </button>
                      ))
                    ) : (
                      <div className="admin-search-empty">No matching section found.</div>
                    )}
                  </div>
                ) : null}
              </div>
              <form
                ref={logoutFormRef}
                action={logoutAction}
                style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
                aria-hidden
              />
              <button
                type="button"
                className="admin-submit-btn admin-submit-btn--icon-labeled nav-cta admin-logout-btn"
                onClick={() => setIsLogoutConfirmOpen(true)}
              >
                <span className="admin-submit-btn__with-label">
                  <span className="admin-btn-icon-inner" aria-hidden="true">
                    <IconLogOut />
                  </span>
                  <span>{adminMessages.chrome.logout}</span>
                </span>
              </button>
            </div>
          </div>
        </header>

        <div
          className={`admin-active-section admin-layout-outlet${isNavPending ? ' is-nav-pending' : ''}`}
          data-pathname={pathname}
        >
          {children}
        </div>

        <AdminConfirmDialog
          open={isLogoutConfirmOpen}
          title="Logout from admin?"
          description="Are you sure you want to log out? You will need to sign in again to access the admin console."
          confirmLabel={adminMessages.chrome.logout}
          confirmPendingLabel={adminMessages.chrome.loggingOut}
          cancelLabel={adminMessages.confirmDialog.cancel}
          onCancel={() => {
            if (!isLogoutPending) {
              setIsLogoutConfirmOpen(false);
            }
          }}
          onConfirm={() => {
            setIsLogoutPending(true);
            logoutFormRef.current?.requestSubmit();
          }}
          variant="danger"
          pending={isLogoutPending}
        />
      </div>
    </div>
  );
}

function ChromeSuspenseFallback() {
  return (
    <div className="admin-shell admin-chrome-suspense-fallback" aria-busy="true">
      <aside className="admin-sidebar" aria-hidden="true" />
      <div className="admin-main" style={{ padding: '32px 28px' }}>
        <p style={{ margin: 0, color: 'var(--admin-muted, #8391a7)', fontWeight: 600 }}>
          {adminMessages.chrome.loadingConsole}
        </p>
      </div>
    </div>
  );
}

export function AdminAppChrome({
  logoutAction,
  children,
}: {
  logoutAction: (formData: FormData) => void | Promise<void>;
  children: ReactNode;
}) {
  return (
    <AdminToastProvider>
      <Suspense fallback={<ChromeSuspenseFallback />}>
        <AdminAppChromeInner logoutAction={logoutAction}>{children}</AdminAppChromeInner>
      </Suspense>
    </AdminToastProvider>
  );
}
