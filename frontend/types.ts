/**
 * Shared types for the Employee Time Tracker UI.
 *
 * These are intentionally framework-agnostic so they can later be mapped
 * directly onto Airtable records/fields without touching the components.
 */

/** A simple option used by the filter dropdowns. */
export interface SelectOption {
    value: string;
    label: string;
}

/** Hours logged for a single task across one week (Mon → Sun). */
export interface TimesheetRowData {
    id: string;
    taskName: string;
    /** Name of the project this task belongs to ("—" if none). */
    projectName: string;
    /** Length is always 7, indexed Monday(0) → Sunday(6). */
    hours: number[];
}
