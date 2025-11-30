import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Trash2, Clock } from 'lucide-react';
import { dateHelpers } from '../utils/dateHelpers';
import { alarmService } from '../utils/alarmService';

const AlarmManager = ({ tasks, onUpdateTask, onDeleteTask }) => {
    const [timeUntil, setTimeUntil] = useState({});

    // Get all tasks with alarms
    const alarmedTasks = tasks.filter(task => task.hasAlarm && !task.completed);

    // Update countdown timers
    useEffect(() => {
        const interval = setInterval(() => {
            const newTimeUntil = {};
            alarmedTasks.forEach(task => {
                newTimeUntil[task.id] = alarmService.getTimeUntilAlarm({
                    id: task.id,
                    dateTime: task.dateTime,
                    enabled: true
                });
            });
            setTimeUntil(newTimeUntil);
        }, 1000);

        return () => clearInterval(interval);
    }, [alarmedTasks.length]);

    const handleToggleAlarm = (task) => {
        onUpdateTask({
            ...task,
            hasAlarm: !task.hasAlarm
        });
    };

    const handleDeleteAlarm = (task) => {
        onUpdateTask({
            ...task,
            hasAlarm: false
        });
    };

    return (
        <div className="card">
            <div className="card-header">
                <h2 className="card-title">
                    <Bell size={24} style={{ marginRight: '0.5rem' }} />
                    Active Alarms ({alarmedTasks.length})
                </h2>
            </div>

            <div className="task-list">
                {alarmedTasks.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🔔</div>
                        <p className="empty-state-text">
                            No active alarms. Enable alarms on your tasks!
                        </p>
                    </div>
                ) : (
                    alarmedTasks
                        .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
                        .map(task => {
                            const isPast = dateHelpers.isPast(task.dateTime);

                            return (
                                <div key={task.id} className="task-item">
                                    <div className="task-header">
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                <Bell size={20} color="var(--accent-primary)" />
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
                                                    <span>{dateHelpers.formatDateTime(task.dateTime)}</span>
                                                </div>
                                                <div
                                                    className="task-meta-item"
                                                    style={{
                                                        color: isPast ? 'var(--accent-danger)' : 'var(--accent-success)',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    {isPast ? '⏰ Expired' : `⏱️ ${timeUntil[task.id] || 'Calculating...'}`}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="task-actions">
                                            <button
                                                onClick={() => handleToggleAlarm(task)}
                                                className="btn btn-icon btn-secondary"
                                                title="Disable alarm"
                                            >
                                                <BellOff size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteAlarm(task)}
                                                className="btn btn-icon btn-danger"
                                                title="Remove alarm"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                )}
            </div>
        </div>
    );
};

export default AlarmManager;
