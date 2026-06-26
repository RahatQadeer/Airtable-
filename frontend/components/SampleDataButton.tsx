import React, {useState} from 'react';
import {Icon, Text} from '@airtable/blocks/ui';
import {ResolvedSettings} from '../settings';
import {seedSampleData} from '../utils/seedSampleData';

interface SampleDataButtonProps {
    settings: ResolvedSettings;
}

type Status = 'idle' | 'working' | 'done' | 'error';

/** Dev/testing helper: one click seeds Projects, Tasks and Time Entries. */
export function SampleDataButton({settings}: SampleDataButtonProps) {
    const [status, setStatus] = useState<Status>('idle');
    const [message, setMessage] = useState('');

    const run = async () => {
        setStatus('working');
        setMessage('');
        try {
            const result = await seedSampleData(settings);
            setStatus('done');
            setMessage(
                `Added ${result.projects} projects, ${result.tasks} tasks, ${result.entries} entries.`,
            );
        } catch (err) {
            setStatus('error');
            setMessage(err instanceof Error ? err.message : 'Failed to add sample data.');
        }
    };

    return (
        <div className="seed">
            <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={run}
                disabled={status === 'working'}
            >
                <Icon name="plus" size={14} />
                <span>{status === 'working' ? 'Adding sample data…' : 'Load sample data'}</span>
            </button>
            {message && (
                <Text className={`seed__msg seed__msg--${status}`}>{message}</Text>
            )}
        </div>
    );
}
