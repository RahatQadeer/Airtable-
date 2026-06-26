import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useRecords} from '@airtable/blocks/ui';
import {Filters} from './Filters';
import {TimesheetTable} from './TimesheetTable';
import {WeeklyTotal} from './WeeklyTotal';
import {WeekNavigation} from './WeekNavigation';
import {SelectOption, TimesheetRowData} from '../types';
import {ALL_OPTION} from '../constants';
import {ResolvedSettings} from '../settings';
import {RegisteredUser} from '../hooks/useCurrentUser';
import {
    addDays,
    formatWeekRange,
    getWeekDates,
    parseISODate,
    startOfWeek,
    toISODate,
} from '../utils/dateUtils';

interface TimeTrackerAppProps {
    settings: ResolvedSettings;
    /** Logged-in user — name for the caption, recordId for stored entries. */
    user: RegisteredUser;
}

/** A linked-record cell value: an array of {id, name}. */
type LinkCell = ReadonlyArray<{id: string; name?: string}>;

/** Aggregated entries for one (task, day) cell. */
interface EntryCell {
    hours: number;
    /** Record IDs backing this cell (first is the update target). */
    entryIds: string[];
}

/**
 * Connected timesheet. Reads Projects / Tasks / Time Entries from the base and
 * persists every hour edit as a create / update / delete on the Time Entries
 * table. The grid shows tasks that already have entries this week plus any the
 * user adds manually.
 */
export function TimeTrackerApp({settings, user}: TimeTrackerAppProps) {
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
    } = settings;

    const tasks = useRecords(tasksTable);
    const projects = useRecords(projectsTable);
    const entries = useRecords(entriesTable);

    const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
    const [selectedProject, setSelectedProject] = useState<string>(ALL_OPTION);
    const [selectedTask, setSelectedTask] = useState<string>(ALL_OPTION);
    const [addedTaskIds, setAddedTaskIds] = useState<string[]>([]);
    const [hiddenTaskIds, setHiddenTaskIds] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Reset the task filter whenever the project filter changes.
    useEffect(() => {
        setSelectedTask(ALL_OPTION);
    }, [selectedProject]);

    const weekISO = useMemo(
        () => getWeekDates(weekStart).map(toISODate),
        [weekStart],
    );
    const dayDates = useMemo(
        () => getWeekDates(weekStart).map((d) => d.getDate()),
        [weekStart],
    );

    const canEdit =
        entriesTable.hasPermissionToCreateRecord() &&
        entriesTable.hasPermissionToUpdateRecord() &&
        entriesTable.hasPermissionToDeleteRecord();

    // ---- Derived data ---------------------------------------------------

    const projectOptions = useMemo<SelectOption[]>(
        () => [
            {value: ALL_OPTION, label: 'All Projects'},
            ...projects.map((p) => ({value: p.id, label: p.name})),
        ],
        [projects],
    );

    const tasksForProject = useMemo(() => {
        if (selectedProject === ALL_OPTION) {
            return tasks;
        }
        return tasks.filter((task) => {
            const links = (task.getCellValue(projectField) as LinkCell | null) ?? [];
            return links.some((link) => link.id === selectedProject);
        });
    }, [tasks, selectedProject, projectField]);

    const taskOptions = useMemo<SelectOption[]>(
        () => [
            {value: ALL_OPTION, label: 'All Tasks'},
            ...tasksForProject.map((t) => ({value: t.id, label: t.name})),
        ],
        [tasksForProject],
    );

    /** Map of "taskId|dateISO" → aggregated hours for the current week. */
    const entryMap = useMemo(() => {
        const map = new Map<string, EntryCell>();
        const weekSet = new Set(weekISO);
        for (const entry of entries) {
            const dateValue = entry.getCellValue(entryDateField) as string | null;
            if (!dateValue) continue;
            const dateISO = dateValue.slice(0, 10);
            if (!weekSet.has(dateISO)) continue;

            const links = entry.getCellValue(entryTaskField) as LinkCell | null;
            if (!links || links.length === 0) continue;

            const hours = Number(entry.getCellValue(entryHoursField)) || 0;
            for (const link of links) {
                const key = `${link.id}|${dateISO}`;
                const cell = map.get(key);
                if (cell) {
                    cell.hours += hours;
                    cell.entryIds.push(entry.id);
                } else {
                    map.set(key, {hours, entryIds: [entry.id]});
                }
            }
        }
        return map;
    }, [entries, weekISO, entryDateField, entryTaskField, entryHoursField]);

    // Tasks that should appear as rows: those with entries this week ∪ added.
    const visibleTaskIds = useMemo(() => {
        const ids = new Set<string>(addedTaskIds);
        for (const key of entryMap.keys()) {
            ids.add(key.slice(0, key.indexOf('|')));
        }
        // Apply the dropdown filters, drop hidden rows, keep existing tasks.
        const hidden = new Set(hiddenTaskIds);
        return tasksForProject
            .filter((task) => ids.has(task.id) && !hidden.has(task.id))
            .filter((task) => selectedTask === ALL_OPTION || task.id === selectedTask)
            .map((task) => task.id);
    }, [addedTaskIds, hiddenTaskIds, entryMap, tasksForProject, selectedTask]);

    const rows = useMemo<TimesheetRowData[]>(() => {
        const byId = new Map(tasks.map((task) => [task.id, task]));
        return visibleTaskIds.map((taskId) => {
            const task = byId.get(taskId);
            const projectLinks = task
                ? ((task.getCellValue(projectField) as LinkCell | null) ?? [])
                : [];
            const projectName =
                projectLinks.map((link) => link.name).filter(Boolean).join(', ') || '—';
            return {
                id: taskId,
                taskName: task ? task.name : 'Unknown task',
                projectName,
                hours: weekISO.map((dateISO) => entryMap.get(`${taskId}|${dateISO}`)?.hours ?? 0),
            };
        });
    }, [visibleTaskIds, tasks, weekISO, entryMap, projectField]);

    const weeklyTotal = useMemo(
        () => rows.reduce((sum, row) => sum + row.hours.reduce((s, h) => s + h, 0), 0),
        [rows],
    );

    // taskId → its (first) linked project id, for stamping onto new entries.
    const taskProjectId = useMemo(() => {
        const map = new Map<string, string>();
        for (const task of tasks) {
            const links = (task.getCellValue(projectField) as LinkCell | null) ?? [];
            if (links[0]) {
                map.set(task.id, links[0].id);
            }
        }
        return map;
    }, [tasks, projectField]);

    // ---- Mutations ------------------------------------------------------

    const handleHoursChange = useCallback(
        async (taskId: string, dayIndex: number, value: number) => {
            if (!canEdit) {
                setError('You don’t have permission to edit time entries.');
                return;
            }
            const dateISO = weekISO[dayIndex];
            const cell = entryMap.get(`${taskId}|${dateISO}`);
            setError(null);
            setIsSaving(true);
            try {
                if (value > 0) {
                    if (cell) {
                        await entriesTable.updateRecordAsync(cell.entryIds[0], {
                            [entryHoursField.id]: value,
                        });
                        // Collapse any duplicate entries for the same task/day.
                        if (cell.entryIds.length > 1) {
                            await entriesTable.deleteRecordsAsync(cell.entryIds.slice(1));
                        }
                    } else {
                        const fields: {[fieldId: string]: unknown} = {
                            [entryTaskField.id]: [{id: taskId}],
                            [entryDateField.id]: dateISO,
                            [entryHoursField.id]: value,
                        };
                        // Optionally stamp the project and the logged-in user.
                        const projectId = taskProjectId.get(taskId);
                        if (entryProjectField && projectId) {
                            fields[entryProjectField.id] = [{id: projectId}];
                        }
                        if (entryUserField) {
                            fields[entryUserField.id] = [{id: user.recordId}];
                        }
                        await entriesTable.createRecordAsync(fields);
                    }
                } else if (cell) {
                    // Zero clears the day → remove backing records.
                    await entriesTable.deleteRecordsAsync(cell.entryIds);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to save changes.');
            } finally {
                setIsSaving(false);
            }
        },
        [
            canEdit,
            weekISO,
            entryMap,
            entriesTable,
            entryHoursField,
            entryTaskField,
            entryDateField,
            entryProjectField,
            entryUserField,
            taskProjectId,
            user.recordId,
        ],
    );

    const handleAddTask = useCallback(() => {
        // With a specific task selected, add it. With "All Tasks", add the next
        // task in the (project-filtered) list that isn't already shown.
        const visible = new Set(visibleTaskIds);
        const target =
            selectedTask !== ALL_OPTION
                ? selectedTask
                : tasksForProject.find((task) => !visible.has(task.id))?.id;
        if (!target) return;
        // Un-hide if it was removed earlier, and add to the working set.
        setHiddenTaskIds((prev) => prev.filter((id) => id !== target));
        setAddedTaskIds((prev) => (prev.includes(target) ? prev : [...prev, target]));
    }, [selectedTask, tasksForProject, visibleTaskIds]);

    // Non-destructive: hide the row for this session without touching records.
    // Any saved entries remain in the base and reappear on reload / re-add.
    const handleRemoveRow = useCallback((taskId: string) => {
        setAddedTaskIds((prev) => prev.filter((id) => id !== taskId));
        setHiddenTaskIds((prev) =>
            prev.includes(taskId) ? prev : [...prev, taskId],
        );
    }, []);

    // ---- Week navigation ------------------------------------------------

    const goPreviousWeek = useCallback(() => setWeekStart((w) => addDays(w, -7)), []);
    const goNextWeek = useCallback(() => setWeekStart((w) => addDays(w, 7)), []);
    const pickDate = useCallback(
        (value: string) => setWeekStart(startOfWeek(parseISODate(value))),
        [],
    );

    // Only disabled when the base has no tasks to add at all.
    const addDisabled = tasksForProject.length === 0;

    return (
        <>
            <Filters
                projectOptions={projectOptions}
                taskOptions={taskOptions}
                selectedProject={selectedProject}
                selectedTask={selectedTask}
                onProjectChange={setSelectedProject}
                onTaskChange={setSelectedTask}
                onAddTask={handleAddTask}
                addDisabled={addDisabled}
            />

            {error && <div className="banner banner--error">{error}</div>}

            <TimesheetTable
                rows={rows}
                dayDates={dayDates}
                disabled={!canEdit || isSaving}
                userName={user.name}
                weekRange={formatWeekRange(weekStart)}
                onHoursChange={handleHoursChange}
                onRemoveRow={handleRemoveRow}
            />

            <WeeklyTotal total={weeklyTotal} />

            <WeekNavigation
                weekRange={formatWeekRange(weekStart)}
                pickerValue={toISODate(weekStart)}
                onPreviousWeek={goPreviousWeek}
                onNextWeek={goNextWeek}
                onPickDate={pickDate}
            />
        </>
    );
}
