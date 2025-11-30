import React, { useState } from 'react';
import { Plus, X, Volume2, Upload, MapPin } from 'lucide-react';
import { dateHelpers } from '../utils/dateHelpers';
import { alarmService } from '../utils/alarmService';
import { toast } from 'react-toastify';

const TaskForm = ({ timeFormat = '24', onAddTask, onClose, editTask = null }) => {
    const [formData, setFormData] = useState({
        title: editTask?.title || '',
        description: editTask?.description || '',
        date: editTask?.date || '',
        time: editTask?.time || '',
        priority: editTask?.priority || 'medium',
        hasAlarm: editTask?.hasAlarm || false,
        ringtone: editTask?.ringtone || 'classic',
        customRingtoneUrl: editTask?.customRingtoneUrl || '',
        localRingtoneFile: editTask?.localRingtoneFile || null,
        category: editTask?.category || 'personal',
        recurrence: editTask?.recurrence || 'none'
    });

    const [localFileName, setLocalFileName] = useState(editTask?.localRingtoneFileName || '');

    const handleSubmit = (e) => {
        e.preventDefault();

        // Stop any playing preview sound
        alarmService.stopSound();

        if (!formData.title.trim()) {
            toast.error('Please enter a task title');
            return;
        }

        if (!formData.date) {
            toast.error('Please select a date');
            return;
        }

        if (!formData.time) {
            toast.error('Please select a time');
            return;
        }

        const taskData = {
            id: editTask?.id || Date.now().toString(),
            ...formData,
            dateTime: dateHelpers.combineDateTime(formData.date, formData.time),
            completed: editTask?.completed || false,
            createdAt: editTask?.createdAt || new Date().toISOString(),
            localRingtoneFileName: localFileName
        };

        onAddTask(taskData);

        if (!editTask) {
            setFormData({
                title: '',
                description: '',
                date: '',
                time: '',
                priority: 'medium',
                hasAlarm: false,
                ringtone: 'classic',
                customRingtoneUrl: '',
                localRingtoneFile: null,
                category: 'personal',
                recurrence: 'none'
            });
            setLocalFileName('');
        }

        toast.success(editTask ? 'Task updated successfully!' : 'Task added successfully!');
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check if it's an audio file
            if (!file.type.startsWith('audio/')) {
                toast.error('Please select an audio file');
                return;
            }

            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size should be less than 5MB');
                return;
            }

            // Create a URL for the local file
            const fileUrl = URL.createObjectURL(file);

            setFormData(prev => ({
                ...prev,
                localRingtoneFile: fileUrl
            }));
            setLocalFileName(file.name);
            toast.success(`File "${file.name}" selected!`);
        }
    };

    const handlePreviewRingtone = () => {
        if (formData.ringtone === 'custom' && formData.customRingtoneUrl) {
            alarmService.playSound('custom', formData.customRingtoneUrl);
        } else if (formData.ringtone === 'local' && formData.localRingtoneFile) {
            alarmService.playSound('custom', formData.localRingtoneFile);
        } else {
            alarmService.playSound(formData.ringtone);
        }
        toast.info('🔊 Playing ringtone preview...');
    };

    const handleAutoDetectTime = () => {
        if (!navigator.onLine) {
            toast.error('⚠️ Internet connection required for auto-detection');
            return;
        }

        if (!navigator.geolocation) {
            toast.error('⚠️ Geolocation is not supported by your browser');
            return;
        }

        toast.info('📍 Detecting location and time...');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Success - use current time
                const now = new Date();
                const dateStr = dateHelpers.formatDateForInput(now);
                const timeStr = dateHelpers.formatTimeForInput(now);

                setFormData(prev => ({
                    ...prev,
                    date: dateStr,
                    time: timeStr
                }));

                toast.success('✅ Time and date auto-detected!');
            },
            (error) => {
                // Error
                console.error('Geolocation error:', error);
                let errorMessage = 'Failed to detect location.';
                if (error.code === error.PERMISSION_DENIED) {
                    errorMessage = '⚠️ Location permission denied. Please enable location services.';
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    errorMessage = '⚠️ Location information is unavailable.';
                } else if (error.code === error.TIMEOUT) {
                    errorMessage = '⚠️ Location request timed out.';
                }
                toast.error(errorMessage);
            },
            { timeout: 10000 }
        );
    };

    return (
        <div className="card">
            <div className="card-header">
                <h2 className="card-title">{editTask ? 'Edit Task' : 'Add New Task'}</h2>
                {onClose && (
                    <button onClick={onClose} className="btn btn-icon btn-secondary">
                        <X size={20} />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Task Title *</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Enter task title..."
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="form-textarea"
                        placeholder="Enter task description..."
                        rows="3"
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label className="form-label" style={{ marginBottom: 0 }}>Date *</label>
                            <button
                                type="button"
                                onClick={handleAutoDetectTime}
                                className="btn btn-secondary"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                title="Auto-detect date and time from location"
                            >
                                <MapPin size={12} />
                                Auto-detect
                            </button>
                        </div>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Time *</label>
                        {timeFormat === '24' ? (
                            <input
                                type="time"
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                className="form-input"
                                required
                            />
                        ) : (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <select
                                    name="hour"
                                    value={formData.time ? (parseInt(formData.time.split(':')[0]) % 12 || 12).toString() : ''}
                                    onChange={(e) => {
                                        const hour = parseInt(e.target.value);
                                        const minute = formData.time ? formData.time.split(':')[1] : '00';
                                        const isPM = formData.time ? parseInt(formData.time.split(':')[0]) >= 12 : false;
                                        let hour24 = hour;
                                        if (isPM && hour !== 12) hour24 = hour + 12;
                                        if (!isPM && hour === 12) hour24 = 0;
                                        setFormData(prev => ({ ...prev, time: `${hour24.toString().padStart(2, '0')}:${minute}` }));
                                    }}
                                    className="form-select"
                                    style={{ flex: 1 }}
                                    required
                                >
                                    <option value="">Hour</option>
                                    {[...Array(12)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                                    ))}
                                </select>
                                <select
                                    name="minute"
                                    value={formData.time ? formData.time.split(':')[1] : ''}
                                    onChange={(e) => {
                                        const hour = formData.time ? formData.time.split(':')[0] : '00';
                                        setFormData(prev => ({ ...prev, time: `${hour}:${e.target.value}` }));
                                    }}
                                    className="form-select"
                                    style={{ flex: 1 }}
                                    required
                                >
                                    <option value="">Min</option>
                                    {[...Array(60)].map((_, i) => (
                                        <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>
                                    ))}
                                </select>
                                <select
                                    name="period"
                                    value={formData.time && parseInt(formData.time.split(':')[0]) >= 12 ? 'PM' : 'AM'}
                                    onChange={(e) => {
                                        if (!formData.time) return;
                                        const [hourStr, minute] = formData.time.split(':');
                                        let hour = parseInt(hourStr);
                                        const isPM = e.target.value === 'PM';

                                        if (isPM && hour < 12) {
                                            hour += 12;
                                        } else if (!isPM && hour >= 12) {
                                            hour -= 12;
                                        }

                                        setFormData(prev => ({ ...prev, time: `${hour.toString().padStart(2, '0')}:${minute}` }));
                                    }}
                                    className="form-select"
                                    style={{ flex: 0.8 }}
                                    required
                                >
                                    <option value="AM">AM</option>
                                    <option value="PM">PM</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="form-select"
                        >
                            <option value="personal">👤 Personal</option>
                            <option value="work">💼 Work</option>
                            <option value="health">❤️ Health</option>
                            <option value="shopping">🛒 Shopping</option>
                            <option value="education">🎓 Education</option>
                            <option value="other">📝 Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Recurrence</label>
                        <select
                            name="recurrence"
                            value={formData.recurrence}
                            onChange={handleChange}
                            className="form-select"
                        >
                            <option value="none">No Repeat</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        className="form-select"
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>

                <div className="form-group checkbox-wrapper">
                    <input
                        type="checkbox"
                        name="hasAlarm"
                        checked={formData.hasAlarm}
                        onChange={handleChange}
                        id="hasAlarm"
                        className="checkbox"
                    />
                    <label htmlFor="hasAlarm" style={{ cursor: 'pointer' }}>Set alarm for this task</label>
                </div>

                {formData.hasAlarm && (
                    <>
                        <div className="form-group">
                            <label className="form-label">Ringtone</label>
                            <select
                                name="ringtone"
                                value={formData.ringtone}
                                onChange={handleChange}
                                className="form-select"
                            >
                                {alarmService.getAvailableRingtones().map(rt => (
                                    <option key={rt.id} value={rt.id}>{rt.name}</option>
                                ))}
                                <option value="custom">🔗 Custom URL</option>
                                <option value="local">📁 Local File</option>
                            </select>
                        </div>

                        {formData.ringtone === 'local' && (
                            <div className="form-group">
                                <label className="form-label">Upload Ringtone</label>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('ringtone-upload').click()}
                                        className="btn btn-secondary"
                                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    >
                                        <Upload size={16} />
                                        {localFileName || 'Choose Audio File'}
                                    </button>
                                    <input
                                        id="ringtone-upload"
                                        type="file"
                                        accept="audio/*"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                                    Supported formats: MP3, WAV, OGG, M4A (Max 5MB)
                                </p>
                            </div>
                        )}

                        {formData.ringtone === 'custom' && (
                            <div className="form-group">
                                <label className="form-label">Ringtone URL</label>
                                <input
                                    type="url"
                                    name="customRingtoneUrl"
                                    value={formData.customRingtoneUrl}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="https://example.com/ringtone.mp3"
                                />
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                                    Enter a direct URL to an MP3 or audio file (e.g., from Zedge, Freesound, etc.)
                                </p>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handlePreviewRingtone}
                            className="btn btn-secondary"
                            style={{ width: '100%', marginBottom: 'var(--spacing-md)' }}
                        >
                            <Volume2 size={20} />
                            Preview Ringtone
                        </button>
                    </>
                )}

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    <Plus size={20} />
                    {editTask ? 'Update Task' : 'Add Task'}
                </button>
            </form>
        </div>
    );
};

export default TaskForm;
