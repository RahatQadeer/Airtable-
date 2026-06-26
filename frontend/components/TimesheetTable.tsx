import React from 'react';
import {Text, Icon} from '@airtable/blocks/ui';
import {TimesheetRowData} from '../types';
import {WEEKDAYS} from '../constants';
import {HourInput} from './HourInput';

interface TimesheetTableProps {
    rows: TimesheetRowData[];
    onHoursChange: (rowId: string, dayIndex: number, value: number) => void;
    onRemoveRow: (rowId: string) => void;
    /** Day-of-month for each weekday column, shown under the header label. */
    dayDates?: number[];
    /** Disables all inputs (e.g. while saving or without write permission). */
    disabled?: boolean;
    /** Logged-in user, shown in the caption bar. */
    userName?: string;
    /** Human-readable week range, shown in the caption bar. */
    weekRange?: string;
}

/** Sums a single row's daily hours. */
function rowTotal(hours: number[]): number {
    return hours.reduce((sum, h) => sum + h, 0);
}

/** Weekly timesheet grid: one row per task, one numeric input per weekday. */
export function TimesheetTable({
    rows,
    onHoursChange,
    onRemoveRow,
    dayDates,
    disabled = false,
    userName,
    weekRange,
}: TimesheetTableProps) {
    // Project, Task, 7 days, Total, Actions.
    const totalColumns = WEEKDAYS.length + 4;

    return (
        <div className="card table-card">
            {(userName || weekRange) && (
                <div className="timesheet-caption">
                    <div className="timesheet-caption__left">
                        <Icon name="time" size={16} className="timesheet-caption__icon" />
                        <Text className="timesheet-caption__title">Weekly Timesheet</Text>
                        {weekRange && (
                            <span className="timesheet-caption__week">{weekRange}</span>
                        )}
                    </div>
                    {userName && (
                        <div className="timesheet-caption__user">
                            <Icon name="personalAuto" size={14} />
                            <Text className="timesheet-caption__user-text">
                                Logged by <strong>{userName}</strong>
                            </Text>
                        </div>
                    )}
                </div>
            )}

            <div className="table-scroll">
                <table className="timesheet">
                    <thead>
                        <tr>
                            <th className="timesheet__th timesheet__th--project">Project</th>
                            <th className="timesheet__th timesheet__th--task">Task Name</th>
                            {WEEKDAYS.map((day, index) => (
                                <th key={day} className="timesheet__th timesheet__th--day">
                                    <span className="timesheet__th-day">{day}</span>
                                    {dayDates && (
                                        <span className="timesheet__th-date">{dayDates[index]}</span>
                                    )}
                                </th>
                            ))}
                            <th className="timesheet__th timesheet__th--total">Total</th>
                            <th className="timesheet__th timesheet__th--actions" aria-label="Actions" />
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td className="timesheet__empty" colSpan={totalColumns}>
                                    No tasks yet. Click <strong>Add Task</strong> to log your hours.
                                </td>
                            </tr>
                        ) : (
                            rows.map((row) => (
                                <tr key={row.id} className="timesheet__row">
                                    <td className="timesheet__cell timesheet__cell--project">
                                        <span className="timesheet__project">{row.projectName}</span>
                                    </td>
                                    <td className="timesheet__cell timesheet__cell--task">
                                        <Text className="timesheet__task-name">{row.taskName}</Text>
                                    </td>
                                    {row.hours.map((hours, dayIndex) => (
                                        <td key={WEEKDAYS[dayIndex]} className="timesheet__cell">
                                            <HourInput
                                                value={hours}
                                                disabled={disabled}
                                                ariaLabel={`${WEEKDAYS[dayIndex]} hours for ${row.taskName}`}
                                                onChange={(value) =>
                                                    onHoursChange(row.id, dayIndex, value)
                                                }
                                            />
                                        </td>
                                    ))}
                                    <td className="timesheet__cell timesheet__cell--total">
                                        {rowTotal(row.hours)}
                                    </td>
                                    <td className="timesheet__cell timesheet__cell--actions">
                                        <button
                                            type="button"
                                            className="btn btn--icon btn--danger timesheet__remove-btn"
                                            disabled={disabled}
                                            aria-label={`Remove ${row.taskName}`}
                                            onClick={() => onRemoveRow(row.id)}
                                        >
                                            <Icon name="trash" size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
