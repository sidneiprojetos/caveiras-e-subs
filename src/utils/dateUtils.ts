/**
 * Date utilities for Gestão Operacional Sidnei.
 * Eliminates timezone conversion errors where "2025-10-30" is parsed as UTC midnight
 * and shifted to "29/10/2025" in Brazilian timezones (UTC-3).
 */

/**
 * Returns today's date in local time as "YYYY-MM-DD".
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a date string into Brazilian format "DD/MM/YYYY".
 * Directly extracts Year, Month and Day from "YYYY-MM-DD" to avoid timezone regression.
 */
export function formatDateBR(dateStr?: string | null): string {
  if (!dateStr || typeof dateStr !== 'string') return '-';
  const clean = dateStr.trim();
  if (!clean) return '-';

  // If already in DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(clean)) {
    return clean;
  }

  // Matches YYYY-MM-DD anywhere at the start (e.g. "2025-10-30" or "2025-10-30T...")
  const ymdMatch = clean.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymdMatch) {
    const [, year, month, day] = ymdMatch;
    return `${day}/${month}/${year}`;
  }

  // Fallback for timestamp or standard date string
  try {
    const d = new Date(clean);
    if (isNaN(d.getTime())) return clean;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return clean;
  }
}

/**
 * Safely extracts the year (e.g. "2025") from a date string without timezone shift.
 */
export function formatYear(dateStr?: string | null): string {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const clean = dateStr.trim();
  const ymdMatch = clean.match(/^(\d{4})/);
  if (ymdMatch) {
    return ymdMatch[1];
  }
  const d = new Date(clean);
  return isNaN(d.getFullYear()) ? '' : String(d.getFullYear());
}

/**
 * Calculates complete years elapsed since the given date string.
 */
export function calculateYearsInClub(dateStr?: string | null): number | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const clean = dateStr.trim();
  const ymdMatch = clean.match(/^(\d{4})-(\d{2})-(\d{2})/);
  let entryYear: number;
  let entryMonth: number;
  let entryDay: number;

  if (ymdMatch) {
    entryYear = Number(ymdMatch[1]);
    entryMonth = Number(ymdMatch[2]) - 1;
    entryDay = Number(ymdMatch[3]);
  } else {
    const d = new Date(clean);
    if (isNaN(d.getTime())) return null;
    entryYear = d.getFullYear();
    entryMonth = d.getMonth();
    entryDay = d.getDate();
  }

  const today = new Date();
  let years = today.getFullYear() - entryYear;
  const monthDiff = today.getMonth() - entryMonth;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < entryDay)) {
    years--;
  }
  return Math.max(0, years);
}
