/** Free-text install dates from forms often fail `new Date()`; normalize for display. */
export function formatInstallDateForDisplay(raw: string | undefined, fallback = 'TBD'): string {
  if (!raw?.trim()) {
    return fallback;
  }

  const s = raw.trim();
  const isoTry = new Date(s);
  if (!Number.isNaN(isoTry.getTime())) {
    const y = isoTry.getFullYear();
    if (y >= 1990 && y <= 2100) {
      return isoTry.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  }

  const parts = s.split(/[/.-]/).map((p) => p.trim());
  if (parts.length === 3) {
    const day = parseInt(parts[0]!, 10);
    const month = parseInt(parts[1]!, 10) - 1;
    let year = parseInt(parts[2]!, 10);
    if (!Number.isNaN(day) && month >= 0 && month <= 11) {
      if (year < 100) {
        year += 2000;
      }
      if (year >= 2000 && year <= 2100) {
        const d = new Date(year, month, day);
        if (!Number.isNaN(d.getTime()) && d.getMonth() === month) {
          return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        }
      }
    }
  }

  return fallback;
}
