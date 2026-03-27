export const solarProducts = [
  {
    slug: 'emerald-peak-450w',
    category: 'Tier 1 PV',
    title: 'Emerald Peak 450W',
    subtitle: 'Monocrystalline panel with 25-year performance warranty',
    price: '₹14,900',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBptEWl-NkUheDGAyHrRd73_4ZuxnFvLRwFsFjkeu4vfHxV-Hsq_QVp1QYIVDa5vrlas2nUiadRjsfOaTEDMpTn65Fqme2DD1X66FC7INBxqFxqTYUM3rMohqWWBOMGp3SLzxu6-t9TFRXIdFtQvWGCUnOXdRLNEnh1Xwiiru8f4G5OlWxBlvpj9ExF3x2fEZah7XSgFgU2B2zSyrfYDYl5qE_oEN5dGofDpnvsrKnMCd8t2BNl7XVd_RNnbj7c0IIGsqpchcAmuNfU',
    capacity: '450W',
    warranty: '25 Years',
    generation: '1.8 units/day average',
    description:
      'Designed for residential rooftops that need dependable generation, strong heat performance, and long-term output stability.',
    features: ['Tier 1 module quality', 'Low-light optimization', 'Corrosion-resistant frame'],
  },
  {
    slug: 'zenith-wall-15kwh',
    category: 'Storage',
    title: 'Zenith Wall 15kWh',
    subtitle: 'Home storage battery for backup and peak shaving',
    price: '₹4,90,000',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCQX8OWAJQ1BVlXgC4m-W0qDTlD2JCobFLioL4Rp1NxthZJN06C6q3g7iIge1Sz_cscmvjlj3abqCxNdOL3AHxJuCzWAPoL4x4e_tmG4pN0b-2iEXKb2FfwgicclCs2uQwNex-AyuqMl2PvpdkDvYlEbCOJovSY123qIZzcdUwhW4I5hQRrfrox5UwZPYnojJSt0ezYDrfKd9fp5pBoJLKG-EqeEK3quZjeJNSFw6llg1zsGL1Mvduf-RLxPfXosWKRbn3uB110ewzR',
    capacity: '15 kWh',
    warranty: '10 Years',
    generation: 'Whole-home backup ready',
    description:
      'A wall-mounted storage unit for homes that want better outage protection and smarter solar self-consumption.',
    features: ['Fast backup switchover', 'Expandable architecture', 'Smart app monitoring'],
  },
  {
    slug: 'fastcharge-pro',
    category: 'Charging',
    title: 'FastCharge Pro',
    subtitle: 'Smart EV charger with home energy coordination',
    price: '₹68,900',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCzn8Kr1rcntaAloVVyUbMZEzHq6g5BoY0mtwyrGm6Q_FEJgTohSwBI8O_mWdcyeeK0h5zHgvgR1NK-QwHPbh725u-4Je32Cq9jGzYPpeUr2qsjJGHcdxS8xy_OYJaAihNjlmySI7kNxldHWcHlY0ws0hDeilGm0mxjntoY4nJ0jautdWfDh6KS5VRR72Xxy1YO0u0chPV43gQKqILrHFNOcSGAfnCVHeHR6lsybHPCBDcASaXtisL8CEXSGYRP3LKKgV_fSHQgtVnb',
    capacity: '7.4 kW AC',
    warranty: '3 Years',
    generation: 'Smart load balancing',
    description:
      'A connected EV charger for solar homes that want clean daytime charging and power-aware scheduling.',
    features: ['App scheduling', 'Load balancing', 'Solar-priority charging'],
  },
] as const;

export function getSolarProduct(slug: string) {
  return solarProducts.find((product) => product.slug === slug);
}
