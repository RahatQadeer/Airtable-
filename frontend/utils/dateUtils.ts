/**
 * Local-timezone-safe week math.
 *
 * All helpers build dates from local Y/M/D parts (never UTC parsing) so that an
 * Airtable date field value like "2026-06-22" maps to the same calendar day the
 * user sees, regardless of their timezone.
 */

/** Returns the Monday (00:00 local) of the week containing `date`. */
export function startOfWeek(date: Date): Date {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const day = d.getDay(); // 0 = Sunday … 6 = Saturday
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
}

/** Returns a new date `days` after `date` (negative goes back). */
export function addDays(date: Date, days: number): Date {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    d.setDate(d.getDate() + days);
    return d;
}

/** The seven dates (Mon → Sun) of the week starting at `weekStart`. */
export function getWeekDates(weekStart: Date): Date[] {
    return Array.from({length: 7}, (_unused, i) => addDays(weekStart, i));
}

/** Formats a date as "YYYY-MM-DD" using local parts. */
export function toISODate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/** Parses a "YYYY-MM-DD" string into a local Date. */
export function parseISODate(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, (month || 1) - 1, day || 1);
}

/** Human-readable range, e.g. "Jun 22 – Jun 28, 2026". */
export function formatWeekRange(weekStart: Date): string {
    const end = addDays(weekStart, 6);
    const start = weekStart.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
    const endStr = end.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
    return `${start} – ${endStr}`;
}
