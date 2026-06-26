import React from 'react';
import {Icon, Text} from '@airtable/blocks/ui';

interface WeekNavigationProps {
    /** Human-readable range, e.g. "Jun 22 – Jun 28, 2026". */
    weekRange: string;
    /** Current week start as "YYYY-MM-DD" for the date picker. */
    pickerValue: string;
    onPreviousWeek: () => void;
    onNextWeek: () => void;
    /** Called with the picked "YYYY-MM-DD" date. */
    onPickDate: (value: string) => void;
}

/** Week range navigator with previous/next controls and a date picker. */
export function WeekNavigation({
    weekRange,
    pickerValue,
    onPreviousWeek,
    onNextWeek,
    onPickDate,
}: WeekNavigationProps) {
    return (
        <nav className="card week-nav">
            <button
                type="button"
                className="btn btn--ghost week-nav__btn"
                onClick={onPreviousWeek}
                aria-label="Previous week"
            >
                <Icon name="chevronLeft" size={16} />
                <span className="week-nav__btn-label">Previous Week</span>
            </button>

            <div className="week-nav__range">
                <label className="week-nav__calendar" aria-label="Jump to week of date">
                    <Icon name="calendar" size={16} className="week-nav__calendar-icon" />
                    <input
                        type="date"
                        className="week-nav__date-input"
                        value={pickerValue}
                        onChange={(event) => {
                            if (event.target.value) {
                                onPickDate(event.target.value);
                            }
                        }}
                    />
                </label>
                <Text className="week-nav__range-text">{weekRange}</Text>
            </div>

            <button
                type="button"
                className="btn btn--ghost week-nav__btn"
                onClick={onNextWeek}
                aria-label="Next week"
            >
                <span className="week-nav__btn-label">Next Week</span>
                <Icon name="chevronRight" size={16} />
            </button>
        </nav>
    );
}
