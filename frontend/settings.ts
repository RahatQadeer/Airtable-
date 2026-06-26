/**
 * Settings layer.
 *
 * The extension stores only table/field IDs in GlobalConfig. `useSettings`
 * resolves those IDs into live Table/Field objects and reports whether the
 * configuration is complete. Nothing here is hardcoded to a specific base —
 * the user maps everything through the settings form.
 */

import {useBase, useGlobalConfig} from '@airtable/blocks/ui';
import {Base, Field, FieldType, Table} from '@airtable/blocks/models';

/** GlobalConfig keys. Bump the values only with a migration. */
export const ConfigKeys = {
    TASKS_TABLE: 'tasksTableId',
    /** Link field on the Tasks table pointing at the Projects table. */
    PROJECT_FIELD: 'projectFieldId',
    ENTRIES_TABLE: 'timeEntriesTableId',
    /** Link field on the Time Entries table pointing at the Tasks table. */
    ENTRY_TASK_FIELD: 'entryTaskFieldId',
    ENTRY_DATE_FIELD: 'entryDateFieldId',
    ENTRY_HOURS_FIELD: 'entryHoursFieldId',
    /** Optional: link field on Time Entries pointing at the Projects table. */
    ENTRY_PROJECT_FIELD: 'entryProjectFieldId',
    /** Optional: link field on Time Entries pointing at the Users table. */
    ENTRY_USER_FIELD: 'entryUserFieldId',
} as const;

/** Field types accepted by each picker in the settings form. */
export const AllowedFieldTypes = {
    PROJECT: [FieldType.MULTIPLE_RECORD_LINKS],
    ENTRY_TASK: [FieldType.MULTIPLE_RECORD_LINKS],
    ENTRY_DATE: [FieldType.DATE, FieldType.DATE_TIME],
    ENTRY_HOURS: [FieldType.NUMBER],
    ENTRY_PROJECT: [FieldType.MULTIPLE_RECORD_LINKS],
    ENTRY_USER: [FieldType.MULTIPLE_RECORD_LINKS],
} as const;

/** Raw resolution result — any member may be null until configured. */
export interface SettingsResult {
    base: Base;
    tasksTable: Table | null;
    projectField: Field | null;
    projectsTable: Table | null;
    entriesTable: Table | null;
    entryTaskField: Field | null;
    entryDateField: Field | null;
    entryHoursField: Field | null;
    /** Optional fields — null when not configured. */
    entryProjectField: Field | null;
    entryUserField: Field | null;
    isValid: boolean;
}

/** Fully-configured settings — every member is guaranteed non-null. */
export interface ResolvedSettings {
    base: Base;
    tasksTable: Table;
    projectField: Field;
    projectsTable: Table;
    entriesTable: Table;
    entryTaskField: Field;
    entryDateField: Field;
    entryHoursField: Field;
    /** Optional fields — null when not configured. */
    entryProjectField: Field | null;
    entryUserField: Field | null;
}

function getString(value: unknown): string | null {
    return typeof value === 'string' && value ? value : null;
}

/** Resolves GlobalConfig IDs into live model objects and validates them. */
export function useSettings(): SettingsResult {
    const base = useBase();
    const globalConfig = useGlobalConfig();

    const tasksTableId = getString(globalConfig.get(ConfigKeys.TASKS_TABLE));
    const tasksTable = tasksTableId ? base.getTableByIdIfExists(tasksTableId) : null;

    const projectFieldId = getString(globalConfig.get(ConfigKeys.PROJECT_FIELD));
    const projectField =
        tasksTable && projectFieldId
            ? tasksTable.getFieldByIdIfExists(projectFieldId)
            : null;

    // The Projects table is derived from the link field — no separate picker.
    let projectsTable: Table | null = null;
    if (projectField && projectField.type === FieldType.MULTIPLE_RECORD_LINKS) {
        const options = projectField.options as {linkedTableId?: string} | null;
        if (options?.linkedTableId) {
            projectsTable = base.getTableByIdIfExists(options.linkedTableId);
        }
    }

    const entriesTableId = getString(globalConfig.get(ConfigKeys.ENTRIES_TABLE));
    const entriesTable = entriesTableId
        ? base.getTableByIdIfExists(entriesTableId)
        : null;

    const entryTaskFieldId = getString(globalConfig.get(ConfigKeys.ENTRY_TASK_FIELD));
    const entryTaskField =
        entriesTable && entryTaskFieldId
            ? entriesTable.getFieldByIdIfExists(entryTaskFieldId)
            : null;

    const entryDateFieldId = getString(globalConfig.get(ConfigKeys.ENTRY_DATE_FIELD));
    const entryDateField =
        entriesTable && entryDateFieldId
            ? entriesTable.getFieldByIdIfExists(entryDateFieldId)
            : null;

    const entryHoursFieldId = getString(globalConfig.get(ConfigKeys.ENTRY_HOURS_FIELD));
    const entryHoursField =
        entriesTable && entryHoursFieldId
            ? entriesTable.getFieldByIdIfExists(entryHoursFieldId)
            : null;

    const entryProjectFieldId = getString(globalConfig.get(ConfigKeys.ENTRY_PROJECT_FIELD));
    const entryProjectField =
        entriesTable && entryProjectFieldId
            ? entriesTable.getFieldByIdIfExists(entryProjectFieldId)
            : null;

    const entryUserFieldId = getString(globalConfig.get(ConfigKeys.ENTRY_USER_FIELD));
    const entryUserField =
        entriesTable && entryUserFieldId
            ? entriesTable.getFieldByIdIfExists(entryUserFieldId)
            : null;

    const isValid = Boolean(
        tasksTable &&
            projectField &&
            projectsTable &&
            entriesTable &&
            entryTaskField &&
            entryDateField &&
            entryHoursField,
    );

    return {
        base,
        tasksTable,
        projectField,
        projectsTable,
        entriesTable,
        entryTaskField,
        entryDateField,
        entryHoursField,
        entryProjectField,
        entryUserField,
        isValid,
    };
}
