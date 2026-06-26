/** Static configuration shared across the UI. */

/** Weekday labels, ordered Monday → Sunday to match TimesheetRowData.hours. */
export const WEEKDAYS = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
] as const;

/** Allowed range for a single day's hours. */
export const MIN_HOURS = 0;
export const MAX_HOURS = 24;

/** Sentinel value for the "All …" option in the filter dropdowns. */
export const ALL_OPTION = 'all';
