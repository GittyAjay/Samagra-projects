/**
 * Display helpers for ids like `order_<uuid>` or `lead_<uuid>` from the API.
 * The first UUID segment is short enough to read aloud or share with support.
 */
export function orderShortRef(id: string): string {
  const raw = id.trim();
  const withoutPrefix = raw.replace(/^[a-z][a-z0-9]*_/i, '');
  const firstSegment = withoutPrefix.split('-')[0] ?? withoutPrefix;
  if (firstSegment.length >= 6 && /^[0-9a-f]+$/i.test(firstSegment)) {
    return firstSegment.slice(0, 8).toUpperCase();
  }
  const compact = withoutPrefix.replace(/[^0-9a-z]/gi, '');
  if (compact.length >= 6) {
    return compact.slice(0, 8).toUpperCase();
  }
  return (withoutPrefix || raw).slice(0, 8).toUpperCase();
}

export function orderJobLabel(id: string): string {
  return `Job #${orderShortRef(id)}`;
}

export function leadRefLabel(id: string): string {
  return `Lead #${orderShortRef(id)}`;
}
