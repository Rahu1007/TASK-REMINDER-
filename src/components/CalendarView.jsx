import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { CalendarDays } from 'lucide-react';
import { dateHelpers } from '../utils/dateHelpers';
import TaskItem from './TaskItem';

const CalendarView = ({ tasks, timeFormat, onToggleComplete, onEdit, onDelete }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // Handle window resize for responsive layout
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Get tasks for a specific date
    const getTasksForDate = (date) => {
        return tasks.filter(task =>
            dateHelpers.isSameDay(task.dateTime, date)
        );
    };

    // Add custom class to dates with tasks
    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const tasksOnDate = getTasksForDate(date);
            if (tasksOnDate.length > 0) {
                return 'react-calendar__tile--hasTask';
            }
        }
        return null;
    };

    // Get content to display on tiles
    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const tasksOnDate = getTasksForDate(date);
            if (tasksOnDate.length > 0) {
                return (
                    <div style={{
                        fontSize: '0.7rem',
                        color: 'var(--accent-primary)',
                        fontWeight: 'bold',
                        marginTop: '2px'
                    }}>
                        {tasksOnDate.length}
                    </div>
                );
            }
        }
        return null;
    };

    const selectedDateTasks = getTasksForDate(selectedDate);

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? 'var(--spacing-md)' : 'var(--spacing-xl)'
        }}>
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">
                        <CalendarDays size={24} style={{ marginRight: '0.5rem' }} />
                        Calendar
                    </h2>
                </div>
                <Calendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    tileClassName={tileClassName}
                    tileContent={tileContent}
                />
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">
                        Tasks on {dateHelpers.formatDate(selectedDate)}
                    </h2>
                </div>

                <div className="task-list">
                    {selectedDateTasks.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📅</div>
                            <p className="empty-state-text">No tasks on this date</p>
                        </div>
                    ) : (
                        selectedDateTasks
                            .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
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
        </div>
    );
};

export default CalendarView;
