import { format, formatDistance, isPast, isFuture, isToday, isTomorrow, parseISO } from 'date-fns';

export const dateHelpers = {
    // Format date for display
    formatDate: (date) => {
        if (!date) return '';
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return format(dateObj, 'MMM dd, yyyy');
    },

    // Format time for display
    formatTime: (date) => {
        if (!date) return '';
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return format(dateObj, 'hh:mm a');
    },

    // Format full datetime
    formatDateTime: (date) => {
        if (!date) return '';
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return format(dateObj, 'MMM dd, yyyy hh:mm a');
    },

    // Get relative time (e.g., "in 2 hours", "2 days ago")
    getRelativeTime: (date) => {
        if (!date) return '';
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return formatDistance(dateObj, new Date(), { addSuffix: true });
    },

    // Check if date is in the past
    isPast: (date) => {
        if (!date) return false;
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return isPast(dateObj);
    },

    // Check if date is in the future
    isFuture: (date) => {
        if (!date) return false;
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return isFuture(dateObj);
    },

    // Check if date is today
    isToday: (date) => {
        if (!date) return false;
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return isToday(dateObj);
    },

    // Check if date is tomorrow
    isTomorrow: (date) => {
        if (!date) return false;
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return isTomorrow(dateObj);
    },

    // Combine date and time strings into ISO string
    combineDateTime: (dateStr, timeStr) => {
        if (!dateStr || !timeStr) return null;
        const combined = `${dateStr}T${timeStr}`;
        return combined;
    },

    // Get date string for input (YYYY-MM-DD)
    getDateInputValue: (date) => {
        if (!date) return '';
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return format(dateObj, 'yyyy-MM-dd');
    },

    // Get time string for input (HH:mm)
    getTimeInputValue: (date) => {
        if (!date) return '';
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return format(dateObj, 'HH:mm');
    },

    // Check if two dates are on the same day
    isSameDay: (date1, date2) => {
        if (!date1 || !date2) return false;
        const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
        const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
        return format(d1, 'yyyy-MM-dd') === format(d2, 'yyyy-MM-dd');
    }
};
