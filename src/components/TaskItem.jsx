import React from 'react';
import { CheckCircle, Circle, Edit, Trash2, Clock, Bell, BellOff, Calendar, Repeat } from 'lucide-react';
import { dateHelpers } from '../utils/dateHelpers';
import { formatDateTime } from '../utils/timeFormat';

const TaskItem = ({ task, timeFormat = '24', onToggleComplete, onEdit, onDelete }) => {
    const isPastDue = dateHelpers.isPast(task.dateTime) && !task.completed;

    return (
        <div className={`task-item ${task.completed ? 'completed' : ''}`}>
            <div className="task-header">
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <button
                            onClick={() => onToggleComplete(task.id)}
                            className="btn btn-icon btn-secondary"
                            style={{ padding: '0.25rem' }}
                        >
                            {task.completed ? <CheckCircle size={24} color="#10b981" /> : <Circle size={24} />}
                        </button>
                        <h3 className="task-title">{task.title}</h3>
                        <span className={`priority-badge priority-${task.priority}`}>
                            {task.priority}
                        </span>
                    </div>

                    {task.description && (
                        <p className="task-description">{task.description}</p>
                    )}

                    <div className="task-meta">
                        <div className="task-meta-item">
                            <Clock size={16} />
                            <span>{dateHelpers.formatDate(task.dateTime)} {formatDateTime(task.dateTime, timeFormat)}</span>
                        </div>
                        {isPastDue && (
                            <div className="task-meta-item" style={{ color: 'var(--accent-danger)' }}>
                                <span>⚠️ Overdue</span>
                            </div>
                        )}
                        {dateHelpers.isToday(task.dateTime) && !task.completed && (
                            <div className="task-meta-item" style={{ color: 'var(--accent-warning)' }}>
                                <span>📅 Today</span>
                            </div>
                        )}
                        {dateHelpers.isTomorrow(task.dateTime) && !task.completed && (
                            <div className="task-meta-item" style={{ color: 'var(--accent-info)' }}>
                                <span>📅 Tomorrow</span>
                            </div>
                        )}
                        {task.hasAlarm && (
                            <div className="task-meta-item" style={{ color: 'var(--accent-primary)' }}>
                                {task.completed ? <BellOff size={16} /> : <Bell size={16} />}
                                <span>Alarm {task.completed ? 'disabled' : 'enabled'}</span>
                            </div>
                        )}
                        {task.recurrence && task.recurrence !== 'none' && (
                            <div className="task-meta-item" style={{ color: 'var(--accent-info)' }}>
                                <Repeat size={14} />
                                <span style={{ textTransform: 'capitalize' }}>{task.recurrence}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="task-actions">
                    {task.category && (
                        <span className={`category-badge category-${task.category}`}>
                            {task.category}
                        </span>
                    )}
                    <button
                        onClick={() => onEdit(task)}
                        className="btn btn-icon btn-secondary"
                        title="Edit task"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={() => onDelete(task.id)}
                        className="btn btn-icon btn-danger"
                        title="Delete task"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskItem;
