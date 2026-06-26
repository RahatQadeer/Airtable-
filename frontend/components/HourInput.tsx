import React, {useEffect, useState} from 'react';
import {MAX_HOURS, MIN_HOURS} from '../constants';

interface HourInputProps {
    /** Numeric hours value for this day (the saved/source value). */
    value: number;
    /** Commits a validated numeric value (0–24). Called on blur / Enter. */
    onChange: (value: number) => void;
    /** Accessible label, e.g. "Monday hours". */
    ariaLabel: string;
    /** Disables editing (e.g. while saving or without write permission). */
    disabled?: boolean;
}

/**
 * Numeric input for a single day's hours.
 *
 * Typing is tracked in local state and only committed to `onChange` on blur or
 * Enter. This is important because the committed value is persisted async to
 * Airtable: if the field were directly controlled by that value, every render
 * would fight the user's keystrokes and multi-digit entry (e.g. 10, 11, 12)
 * would break.
 *
 * Validation: numbers only, min 0, max 24, no negatives. An inline error is
 * shown while the typed value is out of range.
 */
export function HourInput({value, onChange, ariaLabel, disabled = false}: HourInputProps) {
    const [text, setText] = useState(() => (value ? String(value) : ''));
    const [error, setError] = useState<string | null>(null);
    const [isFocused, setIsFocused] = useState(false);

    // Reflect the saved value when not actively editing (e.g. after a save,
    // a week change, or an external update). Never clobber live typing.
    useEffect(() => {
        if (!isFocused) {
            setText(value ? String(value) : '');
            setError(null);
        }
    }, [value, isFocused]);

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const raw = event.target.value;
        setText(raw);

        if (raw === '') {
            setError(null);
            return;
        }
        if (!/^\d*\.?\d*$/.test(raw)) {
            setError('Numbers only');
            return;
        }
        const parsed = Number(raw);
        if (Number.isNaN(parsed)) {
            setError('Invalid');
        } else if (parsed < MIN_HOURS) {
            setError(`Min ${MIN_HOURS}`);
        } else if (parsed > MAX_HOURS) {
            setError(`Max ${MAX_HOURS}`);
        } else {
            setError(null);
        }
    }

    /** Validate, clamp and persist the current text. */
    function commit() {
        const raw = text.trim();
        if (raw === '') {
            onChange(0);
            return;
        }
        const parsed = Number(raw);
        if (Number.isNaN(parsed) || parsed < MIN_HOURS) {
            // Discard invalid input back to the last good value.
            setText(value ? String(value) : '');
            setError(null);
            return;
        }
        const clamped = Math.min(MAX_HOURS, parsed);
        setText(clamped ? String(clamped) : '');
        setError(null);
        onChange(clamped);
    }

    function handleBlur() {
        setIsFocused(false);
        commit();
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        // Block keys that would create a negative or non-numeric value.
        if (event.key === '-' || event.key === '+' || event.key === 'e') {
            event.preventDefault();
        }
        // Enter commits immediately.
        if (event.key === 'Enter') {
            event.currentTarget.blur();
        }
    }

    return (
        <div className="hour-input">
            <input
                className={`hour-input__field${error ? ' hour-input__field--error' : ''}`}
                type="number"
                inputMode="decimal"
                min={MIN_HOURS}
                max={MAX_HOURS}
                step={0.5}
                value={text}
                placeholder="0"
                aria-label={ariaLabel}
                disabled={disabled}
                onFocus={() => setIsFocused(true)}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
            />
            {error && <span className="hour-input__error">{error}</span>}
        </div>
    );
}
