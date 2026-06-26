import React from 'react';
import {Text} from '@airtable/blocks/ui';

interface WeeklyTotalProps {
    /** Sum of all hours across every task in the current week. */
    total: number;
}

/** Summary banner showing the auto-calculated weekly total. */
export function WeeklyTotal({total}: WeeklyTotalProps) {
    return (
        <div className="weekly-total">
            <Text className="weekly-total__label">Weekly Total:</Text>
            <Text className="weekly-total__value">{total} Hours</Text>
        </div>
    );
}
