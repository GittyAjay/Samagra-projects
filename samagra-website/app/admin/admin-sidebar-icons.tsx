import type { AdminSection } from './admin-section-config';

const svgProps = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
  'aria-hidden': true as const,
};

export function AdminSidebarNavIcon({ section }: { section: AdminSection }) {
  const stroke = 'currentColor';
  const sw = 1.65;
  const cap = 'round' as const;
  const join = 'round' as const;

  switch (section) {
    case 'overview':
      return (
        <svg {...svgProps}>
          <path
            d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap={cap}
            strokeLinejoin={join}
          />
        </svg>
      );
    case 'products':
      return (
        <svg {...svgProps}>
          <path
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap={cap}
            strokeLinejoin={join}
          />
        </svg>
      );
    case 'clients':
      return (
        <svg {...svgProps}>
          <path
            d="M16 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap={cap}
            strokeLinejoin={join}
          />
          <path
            d="M9 11a4 4 0 100-8 4 4 0 000 8zM17 8a3 3 0 110 6M21 21v-2a4 4 0 00-3-3.87"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap={cap}
            strokeLinejoin={join}
          />
        </svg>
      );
    case 'leads':
      return (
        <svg {...svgProps}>
          <path
            d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap={cap}
            strokeLinejoin={join}
          />
          <path
            d="M19 8v6M22 11h-6"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap={cap}
            strokeLinejoin={join}
          />
        </svg>
      );
    case 'orders':
      return (
        <svg {...svgProps}>
          <path
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9h.01M12 12h.01M15 12h.01"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap={cap}
            strokeLinejoin={join}
          />
        </svg>
      );
    case 'notifications':
      return (
        <svg {...svgProps}>
          <path
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap={cap}
            strokeLinejoin={join}
          />
        </svg>
      );
    case 'team':
      return (
        <svg {...svgProps}>
          <path
            d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap={cap}
            strokeLinejoin={join}
          />
        </svg>
      );
    default:
      return (
        <svg {...svgProps}>
          <circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth={sw} />
        </svg>
      );
  }
}
