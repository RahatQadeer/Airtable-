import React from 'react';
import {Select, Icon, Text} from '@airtable/blocks/ui';
import {SelectOption} from '../types';

interface FiltersProps {
    projectOptions: SelectOption[];
    taskOptions: SelectOption[];
    selectedProject: string;
    selectedTask: string;
    onProjectChange: (value: string) => void;
    onTaskChange: (value: string) => void;
    onAddTask: () => void;
    /** Disabled when no specific task is selected to add. */
    addDisabled?: boolean;
}

/** Filter bar with Project / Task dropdowns and an "Add Task" action. */
export function Filters({
    projectOptions,
    taskOptions,
    selectedProject,
    selectedTask,
    onProjectChange,
    onTaskChange,
    onAddTask,
    addDisabled = false,
}: FiltersProps) {
    return (
        <section className="card filters">
            <div className="filters__field">
                <Text className="filters__label">Project</Text>
                <Select
                    className="filters__select"
                    options={projectOptions}
                    value={selectedProject}
                    onChange={(value) => onProjectChange(String(value))}
                    aria-label="Select Project"
                />
            </div>

            <div className="filters__field">
                <Text className="filters__label">Task</Text>
                <Select
                    className="filters__select"
                    options={taskOptions}
                    value={selectedTask}
                    onChange={(value) => onTaskChange(String(value))}
                    aria-label="Select Task"
                />
            </div>

            <div className="filters__action">
                <button
                    type="button"
                    className="btn btn--primary filters__add-btn"
                    onClick={onAddTask}
                    disabled={addDisabled}
                >
                    <Icon name="plus" size={16} />
                    <span className="filters__add-label">Add Task</span>
                </button>
                {addDisabled && (
                    <Text className="filters__add-hint">No tasks available</Text>
                )}
            </div>
        </section>
    );
}
