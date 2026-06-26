import React from 'react';
import {
    FieldPicker,
    Heading,
    Icon,
    TablePicker,
    Text,
    useGlobalConfig,
} from '@airtable/blocks/ui';
import {AllowedFieldTypes, ConfigKeys, ResolvedSettings, SettingsResult} from '../settings';
import {SampleDataButton} from './SampleDataButton';

interface SettingsFormProps {
    settings: SettingsResult;
    onDone: () => void;
}

/**
 * Configuration panel. Lets the user map their base's tables and fields onto
 * the concepts the tracker needs. Selections are persisted to GlobalConfig.
 */
export function SettingsForm({settings, onDone}: SettingsFormProps) {
    const globalConfig = useGlobalConfig();
    const canEditSettings = globalConfig.hasPermissionToSet();

    const set = (key: string, value: string | undefined) => {
        if (canEditSettings) {
            void globalConfig.setAsync(key, value);
        }
    };

    const {
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
    } = settings;

    return (
        <section className="card settings">
            <div className="settings__head">
                <Icon name="cog" size={18} className="settings__head-icon" />
                <Heading className="settings__title">Settings</Heading>
            </div>

            {!canEditSettings && (
                <div className="banner banner--warn">
                    You don&apos;t have permission to edit this extension&apos;s settings.
                </div>
            )}

            <Text className="settings__intro">
                Map your base&apos;s tables and fields. The Projects table is detected
                automatically from the project link field.
            </Text>

            <div className="settings__grid">
                <div className="settings__group">
                    <Text className="settings__group-title">Tasks</Text>

                    <label className="settings__field">
                        <Text className="settings__label">Tasks table</Text>
                        <TablePicker
                            table={tasksTable}
                            onChange={(table) => {
                                set(ConfigKeys.TASKS_TABLE, table?.id);
                                // Clear the dependent link field when the table changes.
                                set(ConfigKeys.PROJECT_FIELD, undefined);
                            }}
                            shouldAllowPickingNone={false}
                            disabled={!canEditSettings}
                        />
                    </label>

                    <label className="settings__field">
                        <Text className="settings__label">Project link field</Text>
                        <FieldPicker
                            table={tasksTable}
                            field={projectField}
                            allowedTypes={[...AllowedFieldTypes.PROJECT]}
                            onChange={(field) => set(ConfigKeys.PROJECT_FIELD, field?.id)}
                            shouldAllowPickingNone={false}
                            disabled={!canEditSettings || !tasksTable}
                        />
                    </label>

                    {projectsTable && (
                        <Text className="settings__hint">
                            <Icon name="check" size={12} /> Projects table:{' '}
                            <strong>{projectsTable.name}</strong>
                        </Text>
                    )}
                </div>

                <div className="settings__group">
                    <Text className="settings__group-title">Time Entries</Text>

                    <label className="settings__field">
                        <Text className="settings__label">Time Entries table</Text>
                        <TablePicker
                            table={entriesTable}
                            onChange={(table) => {
                                set(ConfigKeys.ENTRIES_TABLE, table?.id);
                                set(ConfigKeys.ENTRY_TASK_FIELD, undefined);
                                set(ConfigKeys.ENTRY_DATE_FIELD, undefined);
                                set(ConfigKeys.ENTRY_HOURS_FIELD, undefined);
                            }}
                            shouldAllowPickingNone={false}
                            disabled={!canEditSettings}
                        />
                    </label>

                    <label className="settings__field">
                        <Text className="settings__label">Task link field</Text>
                        <FieldPicker
                            table={entriesTable}
                            field={entryTaskField}
                            allowedTypes={[...AllowedFieldTypes.ENTRY_TASK]}
                            onChange={(field) => set(ConfigKeys.ENTRY_TASK_FIELD, field?.id)}
                            shouldAllowPickingNone={false}
                            disabled={!canEditSettings || !entriesTable}
                        />
                    </label>

                    <label className="settings__field">
                        <Text className="settings__label">Date field</Text>
                        <FieldPicker
                            table={entriesTable}
                            field={entryDateField}
                            allowedTypes={[...AllowedFieldTypes.ENTRY_DATE]}
                            onChange={(field) => set(ConfigKeys.ENTRY_DATE_FIELD, field?.id)}
                            shouldAllowPickingNone={false}
                            disabled={!canEditSettings || !entriesTable}
                        />
                    </label>

                    <label className="settings__field">
                        <Text className="settings__label">Hours field</Text>
                        <FieldPicker
                            table={entriesTable}
                            field={entryHoursField}
                            allowedTypes={[...AllowedFieldTypes.ENTRY_HOURS]}
                            onChange={(field) => set(ConfigKeys.ENTRY_HOURS_FIELD, field?.id)}
                            shouldAllowPickingNone={false}
                            disabled={!canEditSettings || !entriesTable}
                        />
                    </label>

                    <label className="settings__field">
                        <Text className="settings__label">Project field (optional)</Text>
                        <FieldPicker
                            table={entriesTable}
                            field={entryProjectField}
                            allowedTypes={[...AllowedFieldTypes.ENTRY_PROJECT]}
                            onChange={(field) => set(ConfigKeys.ENTRY_PROJECT_FIELD, field?.id)}
                            shouldAllowPickingNone
                            disabled={!canEditSettings || !entriesTable}
                        />
                    </label>

                    <label className="settings__field">
                        <Text className="settings__label">Logged-by user field (optional)</Text>
                        <FieldPicker
                            table={entriesTable}
                            field={entryUserField}
                            allowedTypes={[...AllowedFieldTypes.ENTRY_USER]}
                            onChange={(field) => set(ConfigKeys.ENTRY_USER_FIELD, field?.id)}
                            shouldAllowPickingNone
                            disabled={!canEditSettings || !entriesTable}
                        />
                    </label>
                </div>
            </div>

            <div className="settings__footer">
                {isValid && canEditSettings && (
                    <SampleDataButton settings={settings as unknown as ResolvedSettings} />
                )}
                {!isValid && (
                    <Text className="settings__footer-hint">
                        Select all fields to start tracking time.
                    </Text>
                )}
                <button
                    type="button"
                    className="btn btn--primary settings__done-btn"
                    onClick={onDone}
                    disabled={!isValid}
                >
                    <Icon name="check" size={16} />
                    <span>Done</span>
                </button>
            </div>
        </section>
    );
}
