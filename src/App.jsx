import React, { useState, useEffect } from 'react';
import { ListTodo, CalendarDays, Bell, Plus, Clock, Download, Upload } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import CalendarView from './components/CalendarView';
import AlarmManager from './components/AlarmManager';
import AlarmOverlay from './components/AlarmOverlay';

import { storage } from './utils/storage';
import { alarmService } from './utils/alarmService';

function App() {
    const [tasks, setTasks] = useState([]);
    const [activeTab, setActiveTab] = useState('tasks');
    const [editingTask, setEditingTask] = useState(null);
    const [timeFormat, setTimeFormat] = useState(localStorage.getItem('timeFormat') || '24'); // '24' or '12'
    const [activeAlarm, setActiveAlarm] = useState(null);

    // Save time format preference
    useEffect(() => {
        localStorage.setItem('timeFormat', timeFormat);
    }, [timeFormat]);

    // Load tasks from localStorage on mount
    useEffect(() => {
        const savedTasks = storage.getTasks();
        setTasks(savedTasks);
    }, []);

    // Save tasks to localStorage whenever they change
    useEffect(() => {
        storage.saveTasks(tasks);
    }, [tasks]);

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }, []);

    // Initialize alarm service
    useEffect(() => {
        const initAlarms = async () => {
            const granted = await alarmService.init();
            if (!granted) {
                toast.warning('Please enable notifications to receive alarm alerts!', {
                    position: 'top-center',
                    autoClose: 5000
                });
            }
        };

        initAlarms();

        return () => {
            alarmService.stopChecking();
        };
    }, []);

    // Start alarm checking
    useEffect(() => {
        const activeAlarms = tasks
            .filter(task => task.hasAlarm && !task.completed)
            .map(task => ({
                id: task.id,
                title: task.title,
                description: task.description,
                dateTime: task.dateTime,
                enabled: true,
                ringtone: task.ringtone || 'classic',
                customRingtoneUrl: task.customRingtoneUrl || '',
                localRingtoneFile: task.localRingtoneFile || null
            }));

        if (activeAlarms.length > 0) {
            alarmService.startChecking(activeAlarms, (alarm) => {
                // When alarm triggers, show overlay
                setActiveAlarm(alarm);
            });
        }

        return () => {
            alarmService.stopChecking();
        };
    }, [tasks]);

    const handleAddTask = (taskData) => {
        if (editingTask) {
            // Update existing task
            setTasks(tasks.map(task =>
                task.id === editingTask.id ? taskData : task
            ));
            setEditingTask(null);
        } else {
            // Add new task
            setTasks([...tasks, taskData]);
        }
    };

    const handleToggleComplete = (taskId) => {
        setTasks(prevTasks => {
            const taskToToggle = prevTasks.find(t => t.id === taskId);

            // Handle recurring tasks
            if (taskToToggle && !taskToToggle.completed && taskToToggle.recurrence && taskToToggle.recurrence !== 'none') {
                const nextDate = new Date(taskToToggle.dateTime);

                if (taskToToggle.recurrence === 'daily') nextDate.setDate(nextDate.getDate() + 1);
                if (taskToToggle.recurrence === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
                if (taskToToggle.recurrence === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);

                const newTask = {
                    ...taskToToggle,
                    id: Date.now(),
                    dateTime: nextDate.toISOString(),
                    date: nextDate.toISOString().split('T')[0],
                    completed: false,
                    hasAlarm: taskToToggle.hasAlarm // Keep alarm setting for next instance
                };

                toast.success(`Next recurring task created for ${new Date(newTask.dateTime).toLocaleDateString()}`);

                // Return updated list with original task completed AND new task added
                return [...prevTasks.map(task =>
                    task.id === taskId ? { ...task, completed: !task.completed } : task
                ), newTask];
            }

            // Standard toggle for non-recurring tasks
            return prevTasks.map(task =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
            );
        });
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setActiveTab('add');
    };

    const handleDeleteTask = (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            setTasks(tasks.filter(task => task.id !== taskId));
            toast.success('Task deleted successfully!');
        }
    };

    const handleUpdateTask = (updatedTask) => {
        setTasks(tasks.map(task =>
            task.id === updatedTask.id ? updatedTask : task
        ));
    };

    const handleStopAlarm = () => {
        alarmService.stopSound();
        setActiveAlarm(null);
        // Optional: Mark as completed? For now, just stop.
    };

    const handleSnoozeAlarm = () => {
        if (!activeAlarm) return;

        alarmService.stopSound();

        // Add 5 minutes to current time
        const now = new Date();
        const snoozeTime = new Date(now.getTime() + 5 * 60000);

        // Update task with new time
        const updatedTask = tasks.find(t => t.id === activeAlarm.id);
        if (updatedTask) {
            const newTask = {
                ...updatedTask,
                dateTime: snoozeTime.toISOString(),
                date: snoozeTime.toISOString().split('T')[0]
            };
            handleUpdateTask(newTask);
            toast.info(`Snoozed for 5 minutes (until ${snoozeTime.toLocaleTimeString()})`);
        }

        setActiveAlarm(null);
    };

    const toggleTimeFormat = () => {
        setTimeFormat(prev => prev === '24' ? '12' : '24');
    };

    const handleExportData = () => {
        const dataStr = JSON.stringify({ tasks, timeFormat });
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = 'task-reminder-data.json';
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        toast.success('Data exported successfully!');
    };

    const handleImportData = (event) => {
        const fileReader = new FileReader();
        if (event.target.files[0]) {
            fileReader.readAsText(event.target.files[0], "UTF-8");
            fileReader.onload = e => {
                try {
                    const parsedData = JSON.parse(e.target.result);
                    if (parsedData.tasks) {
                        setTasks(parsedData.tasks);
                        if (parsedData.timeFormat) setTimeFormat(parsedData.timeFormat);
                        toast.success('Data imported successfully!');
                    } else {
                        toast.error('Invalid data file');
                    }
                } catch (error) {
                    toast.error('Error parsing data file');
                }
            };
        }
    };

    const tabs = [
        { id: 'tasks', label: 'Tasks', icon: ListTodo },
        { id: 'add', label: 'Add Task', icon: Plus },
        { id: 'calendar', label: 'Calendar', icon: CalendarDays },
        { id: 'alarms', label: 'Alarms', icon: Bell }
    ];

    return (
        <div className="container">
            <header className="app-header">
                <div className="header-content">
                    <div>
                        <h1 className="app-title">Task Reminder</h1>
                        <p className="app-subtitle">Manage your time effectively</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                            onClick={toggleTimeFormat}
                            className="btn btn-icon btn-secondary"
                            title={`Switch to ${timeFormat === '24' ? '12-hour' : '24-hour'} format`}
                        >
                            <Clock size={20} />
                            <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                                {timeFormat === '24' ? '24H' : '12H'}
                            </span>
                        </button>
                        <button onClick={handleExportData} className="btn btn-icon btn-secondary" title="Export Data">
                            <Download size={20} />
                        </button>
                        <label className="btn btn-icon btn-secondary" title="Import Data" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <Upload size={20} />
                            <input type="file" onChange={handleImportData} style={{ display: 'none' }} accept=".json" />
                        </label>
                    </div>
                </div>
            </header>

            <nav className="nav-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id);
                            if (tab.id !== 'add') {
                                setEditingTask(null);
                            }
                        }}
                        className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                    >
                        <tab.icon size={20} />
                        {tab.label}
                    </button>
                ))}
            </nav>

            <main>
                {activeTab === 'tasks' && (
                    <TaskList
                        tasks={tasks}
                        timeFormat={timeFormat}
                        onToggleComplete={handleToggleComplete}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                    />
                )}

                {activeTab === 'add' && (
                    <TaskForm
                        timeFormat={timeFormat}
                        onAddTask={handleAddTask}
                        editTask={editingTask}
                        onClose={() => {
                            setEditingTask(null);
                            setActiveTab('tasks');
                        }}
                    />
                )}

                {activeTab === 'calendar' && (
                    <CalendarView
                        tasks={tasks}
                        timeFormat={timeFormat}
                        onToggleComplete={handleToggleComplete}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                    />
                )}

                {activeTab === 'alarms' && (
                    <AlarmManager
                        tasks={tasks}
                        timeFormat={timeFormat}
                        onUpdateTask={handleUpdateTask}
                        onDeleteTask={handleDeleteTask}
                    />
                )}
            </main>

            <footer style={{
                position: 'fixed',
                bottom: '0',
                left: '0',
                right: '0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                fontSize: '0.875rem',
                color: 'var(--text-tertiary)',
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(10px)',
                borderTop: '1px solid var(--border-color)',
                zIndex: 1000
            }}>
                <span>Developed by</span>
                <a
                    href="https://www.linkedin.com/in/rahul-kumar-sharma-1a6007283/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        color: 'var(--accent-primary)',
                        textDecoration: 'none',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        transition: 'all var(--transition-base)'
                    }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--accent-secondary)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--accent-primary)'}
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        style={{ marginRight: '0.25rem' }}
                    >
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    Rahul Kumar Sharma
                </a>
            </footer>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />

            <AlarmOverlay
                alarm={activeAlarm}
                onStop={handleStopAlarm}
                onSnooze={handleSnoozeAlarm}
            />
        </div>
    );
}

export default App;
