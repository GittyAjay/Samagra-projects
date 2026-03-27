export type KpiMetric =
  | 'clients'
  | 'leads'
  | 'orders'
  | 'revenue'
  | 'conversion'
  | 'installations'
  | 'trend'
  | 'collectionsOverview';

const svgProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  xmlns: 'http://www.w3.org/2000/svg',
  'aria-hidden': true as const,
};

export function AdminKpiIcon({ metric }: { metric: KpiMetric }) {
  const stroke = 'currentColor';
  const sw = 1.65;
  const cap = 'round' as const;
  const join = 'round' as const;

  switch (metric) {
    case 'clients':
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
    case 'revenue':
      return (
        <svg {...svgProps}>
          <path
            d="M23 6l-9.5 9.5-5-5L1 18M17 6h6v6"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap={cap}
            strokeLinejoin={join}
          />
        </svg>
      );
    case 'conversion':
      return (
        <svg {...svgProps}>
          <path d="M19 5L5 19" stroke={stroke} strokeWidth={sw} strokeLinecap={cap} strokeLinejoin={join} />
          <circle cx="6.5" cy="6.5" r="2.5" stroke={stroke} strokeWidth={sw} />
          <circle cx="17.5" cy="17.5" r="2.5" stroke={stroke} strokeWidth={sw} />
        </svg>
      );
    case 'installations':
      return (
        <svg {...svgProps}>
          <circle cx="12" cy="12" r="4" stroke={stroke} strokeWidth={sw} />
          <path
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap={cap}
            strokeLinejoin={join}
          />
        </svg>
      );
    case 'trend':
      return (
        <svg {...svgProps}>
          <path d="M3 3v18h18" stroke={stroke} strokeWidth={sw} strokeLinecap={cap} strokeLinejoin={join} />
          <path
            d="M7 15v3M11 11v7M15 8v10M19 12v6"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap={cap}
            strokeLinejoin={join}
          />
        </svg>
      );
    case 'collectionsOverview':
      return (
        <svg {...svgProps}>
          <rect x="2" y="5" width="20" height="14" rx="2" stroke={stroke} strokeWidth={sw} />
          <path d="M6 9h.01M18 15h.01" stroke={stroke} strokeWidth={sw} strokeLinecap={cap} />
          <path
            d="M8 12h8"
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
