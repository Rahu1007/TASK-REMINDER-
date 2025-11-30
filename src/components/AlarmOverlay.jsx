import React, { useEffect } from 'react';
import { Bell, X, Clock } from 'lucide-react';

const AlarmOverlay = ({ alarm, onStop, onSnooze }) => {
    if (!alarm) return null;

    return (
        <div className="alarm-overlay">
            <div className="alarm-content">
                <div className="alarm-icon-wrapper">
                    <Bell size={48} className="alarm-icon-pulse" />
                </div>
                <h2 className="alarm-title">{alarm.title}</h2>
                {alarm.description && (
                    <p className="alarm-description">{alarm.description}</p>
                )}
                <div className="alarm-actions">
                    <button onClick={onSnooze} className="btn btn-secondary alarm-btn">
                        <Clock size={20} />
                        Snooze (5m)
                    </button>
                    <button onClick={onStop} className="btn btn-danger alarm-btn">
                        <X size={20} />
                        Stop Alarm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlarmOverlay;
