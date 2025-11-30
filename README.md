# Task Reminder App

A modern, feature-rich task reminder application built with React and Vite. Never miss a task with smart alarms, browser notifications, and an intuitive calendar interface.

## ✨ Features

- **Task Management**: Create, edit, delete, and complete tasks with ease
- **Smart Alarms**: Set alarms for specific dates and times
- **Browser Notifications**: Receive notifications when alarms trigger
- **Sound Alerts**: Audio notifications for alarms
- **Calendar View**: Visual calendar with task indicators
- **Priority Levels**: Organize tasks by priority (Low, Medium, High)
- **Filter & Sort**: Filter tasks by status, date, and completion
- **Local Storage**: All data persists locally in your browser
- **Responsive Design**: Works beautifully on desktop and mobile
- **Premium UI**: Modern dark theme with glassmorphism and smooth animations

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone or navigate to the project directory:
```bash
cd "TASK REMINDER"
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```


4. Open your browser and navigate to `http://localhost:3000`

### How to Upload to GitHub

1. Initialize Git:
```bash
git init
```

2. Add files:
```bash
git add .
```

3. Commit changes:
```bash
git commit -m "Initial commit"
```

4. Connect to your repository (replace URL with yours):
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

5. Push to GitHub:
```bash
git branch -M main
git push -u origin main
```

## 📖 Usage

### Adding a Task

1. Click on the "Add Task" tab
2. Fill in the task details:
   - Title (required)
   - Description (optional)
   - Date (required)
   - Time (required)
   - Priority level
   - Enable alarm checkbox
3. Click "Add Task"

### Managing Tasks

- **Complete**: Click the circle icon to mark as complete
- **Edit**: Click the edit icon to modify task details
- **Delete**: Click the trash icon to remove a task

### Calendar View

- Navigate between months using arrow buttons
- Dates with tasks show a number indicator
- Click on any date to view tasks for that day

### Alarms

- Enable alarms when creating/editing tasks
- View all active alarms in the "Alarms" tab
- See countdown timers for upcoming alarms
- Disable or remove alarms as needed

### Notifications

- Grant notification permission when prompted
- Receive browser notifications when alarms trigger
- Hear audio alerts for alarms

## 🎨 Features Overview

### Task Filters

- **All Tasks**: View all tasks
- **Active**: Only incomplete tasks
- **Today**: Tasks scheduled for today
- **Upcoming**: Future tasks
- **Overdue**: Past tasks that are incomplete
- **Completed**: Finished tasks

### Priority Levels

- **High**: Red badge - urgent tasks
- **Medium**: Orange badge - normal tasks
- **Low**: Green badge - low priority tasks

## 🛠️ Built With

- **React** - UI framework
- **Vite** - Build tool and dev server
- **react-calendar** - Calendar component
- **date-fns** - Date manipulation
- **lucide-react** - Icon library
- **react-toastify** - Toast notifications
- **Browser Notification API** - Native notifications
- **LocalStorage API** - Data persistence

## 📱 Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

**Note**: Notification features require browser permission and work best in Chrome/Edge.

## 🔒 Privacy

All data is stored locally in your browser. No data is sent to external servers.

## 📝 License

This project is open source and available for personal and commercial use.

## 🤝 Contributing

Feel free to fork, modify, and use this project for your needs!

## 💡 Tips

- Set alarms at least 1 minute in the future for testing
- Keep the browser tab open for alarms to trigger
- Grant notification permissions for the best experience
- Use the calendar view to plan your week
- Organize tasks by priority for better productivity

---

Built with ❤️ using React and modern web technologies
