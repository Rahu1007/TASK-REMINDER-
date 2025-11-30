import React, { useState } from 'react';
import { Filter, ListTodo } from 'lucide-react';
import TaskItem from './TaskItem';
import { dateHelpers } from '../utils/dateHelpers';

const TaskList = ({ tasks, timeFormat, onToggleComplete, onEdit, onDelete }) => {
    const [filter, setFilter] = useState('all');

    const getFilteredTasks = () => {
        const now = new Date();

        switch (filter) {
            case 'today':
                return tasks.filter(task => dateHelpers.isToday(task.dateTime));
            case 'upcoming':
                return tasks.filter(task => dateHelpers.isFuture(task.dateTime) && !task.completed);
            case 'completed':
                return tasks.filter(task => task.completed);
            case 'active':
                return tasks.filter(task => !task.completed);
            case 'overdue':
                return tasks.filter(task => dateHelpers.isPast(task.dateTime) && !task.completed);
            default:
                return tasks;
        }
    };

    const filteredTasks = getFilteredTasks();

    const filterButtons = [
        { id: 'all', label: 'All Tasks', icon: ListTodo },
        { id: 'active', label: 'Active', icon: ListTodo },
        { id: 'today', label: 'Today', icon: ListTodo },
        { id: 'upcoming', label: 'Upcoming', icon: ListTodo },
        { id: 'overdue', label: 'Overdue', icon: ListTodo },
        { id: 'completed', label: 'Completed', icon: ListTodo }
    ];

    return (
        <div className="card">
            <div className="card-header">
                <h2 className="card-title">
                    <ListTodo size={24} style={{ marginRight: '0.5rem' }} />
                    My Tasks ({filteredTasks.length})
                </h2>
            </div>

            <div className="filter-buttons">
                {filterButtons.map(btn => (
                    <button
                        key={btn.id}
                        onClick={() => setFilter(btn.id)}
                        className={`filter-btn ${filter === btn.id ? 'active' : ''}`}
                    >
                        <btn.icon size={16} />
                        {btn.label}
                    </button>
                ))}
            </div>

            <div className="task-list">
                {filteredTasks.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📝</div>
                        <p className="empty-state-text">
                            {filter === 'all'
                                ? 'No tasks yet. Create your first task!'
                                : `No ${filter} tasks found.`}
                        </p>
                    </div>
                ) : (
                    filteredTasks
                        .sort((a, b) => {
                            // Sort by completed status first, then by date
                            if (a.completed !== b.completed) {
                                return a.completed ? 1 : -1;
                            }
                            return new Date(a.dateTime) - new Date(b.dateTime);
                        })
                        .map(task => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                timeFormat={timeFormat}
                                onToggleComplete={onToggleComplete}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))
                )}
            </div>
        </div>
    );
};

export default TaskList;
