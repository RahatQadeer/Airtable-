/**
 * Creates sample Projects, Tasks and Time Entries via the Blocks SDK so the
 * tracker can be tested with real records. Intended as a dev/testing helper.
 */

import {ResolvedSettings} from '../settings';
import {getWeekDates, startOfWeek, toISODate} from './dateUtils';

interface SeedResult {
    projects: number;
    tasks: number;
    entries: number;
}

/** A couple of projects, each with a few tasks and Mon–Fri hours. */
const SAMPLE = [
    {
        project: 'Website Redesign',
        tasks: [
            {name: 'Design', hours: [4, 6, 3, 5, 2]},
            {name: 'Development', hours: [6, 7, 8, 6, 4]},
        ],
    },
    {
        project: 'Mobile App',
        tasks: [
            {name: 'QA & Testing', hours: [2, 3, 4, 3, 5]},
            {name: 'Meetings', hours: [1, 1, 2, 1, 1]},
        ],
    },
];

/**
 * Seeds the base with sample data for the current week.
 *
 * @returns counts of the records created.
 */
export async function seedSampleData(settings: ResolvedSettings): Promise<SeedResult> {
    const {
        tasksTable,
        projectField,
        projectsTable,
        entriesTable,
        entryTaskField,
        entryDateField,
        entryHoursField,
    } = settings;

    // Use today's local date for the week being seeded.
    const weekDates = getWeekDates(startOfWeek(new Date()));

    // 1. Projects ------------------------------------------------------------
    const projectIds = await projectsTable.createRecordsAsync(
        SAMPLE.map((s) => ({
            fields: {[projectsTable.primaryField.id]: s.project},
        })),
    );

    // 2. Tasks (linked to their project) ------------------------------------
    const taskDefs = SAMPLE.flatMap((s, projectIndex) =>
        s.tasks.map((task) => ({
            fields: {
                [tasksTable.primaryField.id]: task.name,
                [projectField.id]: [{id: projectIds[projectIndex]}],
            },
        })),
    );
    const taskIds = await tasksTable.createRecordsAsync(taskDefs);

    // 3. Time Entries for Mon–Fri of the current week -----------------------
    const flatTasks = SAMPLE.flatMap((s) => s.tasks);
    const entryDefs: Array<{fields: {[fieldId: string]: unknown}}> = [];
    flatTasks.forEach((task, taskIndex) => {
        task.hours.forEach((hours, dayIndex) => {
            if (hours <= 0) return;
            entryDefs.push({
                fields: {
                    [entryTaskField.id]: [{id: taskIds[taskIndex]}],
                    [entryDateField.id]: toISODate(weekDates[dayIndex]),
                    [entryHoursField.id]: hours,
                },
            });
        });
    });
    const entryIds = await entriesTable.createRecordsAsync(entryDefs);

    return {
        projects: projectIds.length,
        tasks: taskIds.length,
        entries: entryIds.length,
    };
}
