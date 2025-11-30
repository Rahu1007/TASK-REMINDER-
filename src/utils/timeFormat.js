// Time formatting utilities

export const formatTime = (time, format = '24') => {
    if (!time) return '';

    // If time is in HH:MM format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);

    if (format === '12') {
        // Convert to 12-hour format with AM/PM
        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${hour12}:${minutes} ${period}`;
    }

    // Return 24-hour format
    return time;
};

export const formatDateTime = (dateTime, timeFormat = '24') => {
    if (!dateTime) return '';

    const date = new Date(dateTime);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');

    if (timeFormat === '12') {
        const period = hours >= 12 ? 'PM' : 'AM';
        const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        return `${hour12}:${minutes} ${period}`;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes}`;
};
