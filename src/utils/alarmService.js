import { toast } from 'react-toastify';

class AlarmService {
    constructor() {
        this.audioContext = null;
        this.checkInterval = null;
        this.currentAudio = null;
        this.notificationPermission = 'default';
    }

    // Initialize audio context and request notification permission
    async init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            if ('Notification' in window) {
                this.notificationPermission = await Notification.requestPermission();
            }
        } catch (error) {
            console.error('Error creating audio context:', error);
        }

        return this.notificationPermission === 'granted';
    }

    // Built-in ringtone generators using Web Audio API
    playBuiltInRingtone(type = 'classic') {
        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;

        switch (type) {
            case 'classic':
                this.playClassicBeep(now);
                break;
            case 'gentle':
                this.playGentleChime(now);
                break;
            case 'urgent':
                this.playUrgentAlarm(now);
                break;
            case 'digital':
                this.playDigitalBeep(now);
                break;
            case 'melody':
                this.playMelody(now);
                break;
            default:
                this.playClassicBeep(now);
        }
    }

    // Classic beep sound
    playClassicBeep(startTime) {
        for (let i = 0; i < 3; i++) {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            const time = startTime + (i * 0.3);
            gainNode.gain.setValueAtTime(0.3, time);
            gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

            oscillator.start(time);
            oscillator.stop(time + 0.2);
        }
    }

    // Gentle chime sound
    playGentleChime(startTime) {
        const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
        frequencies.forEach((freq, i) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = freq;
            oscillator.type = 'sine';

            const time = startTime + (i * 0.4);
            gainNode.gain.setValueAtTime(0.2, time);
            gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.8);

            oscillator.start(time);
            oscillator.stop(time + 0.8);
        });
    }

    // Urgent alarm sound
    playUrgentAlarm(startTime) {
        for (let i = 0; i < 5; i++) {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = i % 2 === 0 ? 1000 : 800;
            oscillator.type = 'square';

            const time = startTime + (i * 0.15);
            gainNode.gain.setValueAtTime(0.4, time);
            gainNode.gain.setValueAtTime(0, time + 0.1);

            oscillator.start(time);
            oscillator.stop(time + 0.1);
        }
    }

    // Digital beep sound
    playDigitalBeep(startTime) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = 1200;
        oscillator.type = 'square';

        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.5);
    }

    // Simple melody
    playMelody(startTime) {
        const notes = [
            { freq: 523.25, duration: 0.2 }, // C5
            { freq: 587.33, duration: 0.2 }, // D5
            { freq: 659.25, duration: 0.2 }, // E5
            { freq: 783.99, duration: 0.4 }, // G5
        ];

        let currentTime = startTime;
        notes.forEach(note => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = note.freq;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.2, currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + note.duration);

            oscillator.start(currentTime);
            oscillator.stop(currentTime + note.duration);

            currentTime += note.duration;
        });
    }

    // Play custom ringtone from URL
    playCustomRingtone(url) {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }

        this.currentAudio = new Audio(url);
        this.currentAudio.volume = 0.5;
        this.currentAudio.play().catch(err => {
            console.error('Error playing custom ringtone:', err);
            // Fallback to built-in sound
            this.playBuiltInRingtone('classic');
        });
    }

    // Start checking for alarms
    startChecking(alarms, onAlarmTrigger) {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }

        // Check every second
        this.checkInterval = setInterval(() => {
            this.checkAlarms(alarms, onAlarmTrigger);
        }, 1000);
    }

    // Stop checking for alarms
    stopChecking() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    // Check if any alarms should trigger
    checkAlarms(alarms, onAlarmTrigger) {
        const now = new Date();

        alarms.forEach(alarm => {
            if (!alarm.enabled) return;

            const alarmTime = new Date(alarm.dateTime);
            const timeDiff = alarmTime - now;

            // Trigger if within 1 second window
            if (timeDiff > 0 && timeDiff <= 1000) {
                this.triggerAlarm(alarm, onAlarmTrigger);
            }
        });
    }

    // Trigger an alarm
    triggerAlarm(alarm, onAlarmTrigger) {
        // Play sound based on ringtone selection
        if (alarm.ringtone === 'local' && alarm.localRingtoneFile) {
            this.playSound('custom', alarm.localRingtoneFile);
        } else if (alarm.ringtone === 'custom' && alarm.customRingtoneUrl) {
            this.playSound('custom', alarm.customRingtoneUrl);
        } else {
            this.playSound(alarm.ringtone || 'classic');
        }

        // Show browser notification
        this.showNotification(alarm);

        // Show toast
        toast.info(`⏰ Alarm: ${alarm.title}`, {
            position: 'top-center',
            autoClose: 10000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });

        // Call callback
        if (onAlarmTrigger) {
            onAlarmTrigger(alarm);
        }
    }

    // Show browser notification
    showNotification(alarm) {
        if (this.notificationPermission !== 'granted') return;

        const notification = new Notification('Task Reminder', {
            body: `${alarm.title}\n${alarm.description || ''}`,
            icon: '/vite.svg',
            badge: '/vite.svg',
            tag: alarm.id,
            requireInteraction: true,
            vibrate: [200, 100, 200]
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        // Auto close after 10 seconds
        setTimeout(() => notification.close(), 10000);
    }

    // Play alarm sound
    playSound(ringtone = 'classic', customUrl = null) {
        try {
            if (customUrl) {
                this.playCustomRingtone(customUrl);
            } else {
                this.playBuiltInRingtone(ringtone);
            }
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    }

    // Stop alarm sound
    stopSound() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
    }

    // Get time until alarm
    getTimeUntilAlarm(alarm) {
        const now = new Date();
        const alarmTime = new Date(alarm.dateTime);
        const diff = alarmTime - now;

        if (diff < 0) return 'Expired';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (days > 0) return `${days}d ${hours}h ${minutes}m`;
        if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
        if (minutes > 0) return `${minutes}m ${seconds}s`;
        return `${seconds}s`;
    }

    // Get available ringtones
    getAvailableRingtones() {
        return [
            { id: 'classic', name: '🔔 Classic Beep', description: 'Simple beep sound' },
            { id: 'gentle', name: '🎵 Gentle Chime', description: 'Soft musical chime' },
            { id: 'urgent', name: '⚠️ Urgent Alarm', description: 'Loud alternating beeps' },
            { id: 'digital', name: '📱 Digital Beep', description: 'Modern digital sound' },
            { id: 'melody', name: '🎶 Melody', description: 'Pleasant musical notes' },
        ];
    }
}

export const alarmService = new AlarmService();
