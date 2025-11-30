// LocalStorage utility functions

const STORAGE_KEYS = {
    TASKS: 'task_reminder_tasks',
    ALARMS: 'task_reminder_alarms'
};

export const storage = {
    // Tasks
    getTasks: () => {
        try {
            const tasks = localStorage.getItem(STORAGE_KEYS.TASKS);
            return tasks ? JSON.parse(tasks) : [];
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    },

    saveTasks: (tasks) => {
        try {
            localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
            return true;
        } catch (error) {
            console.error('Error saving tasks:', error);
            return false;
        }
    },

    // Alarms
    getAlarms: () => {
        try {
            const alarms = localStorage.getItem(STORAGE_KEYS.ALARMS);
            return alarms ? JSON.parse(alarms) : [];
        } catch (error) {
            console.error('Error loading alarms:', error);
            return [];
        }
    },

    saveAlarms: (alarms) => {
        try {
            localStorage.setItem(STORAGE_KEYS.ALARMS, JSON.stringify(alarms));
            return true;
        } catch (error) {
            console.error('Error saving alarms:', error);
            return false;
        }
    },

    // Clear all data
    clearAll: () => {
        try {
            localStorage.removeItem(STORAGE_KEYS.TASKS);
            localStorage.removeItem(STORAGE_KEYS.ALARMS);
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }
};
