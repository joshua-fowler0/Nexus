# Nexus Dashboard

A productivity dashboard for tracking Projects, Classes, and Graduate School Applications. Built with Electron + React.

---

## Quick Start (Development Mode)

```bash
cd nexus-dashboard
npm install
npm start
```

This launches the app in development mode with hot-reload.

---

## Build as a macOS App (.dmg)

To package Nexus as a standalone macOS application:

### 1. Install dependencies (if you haven't already)
```bash
npm install
```

### 2. Build the app
```bash
npm run dist
```

This will:
- Build the React frontend (`npm run build`)
- Package everything into a macOS `.app` bundle
- Create a `.dmg` installer in the `release/` folder

### 3. Install the app
- Open the `.dmg` file from the `release/` folder
- Drag **Nexus** to your **Applications** folder
- Launch from Applications, Spotlight (`Cmd + Space` → "Nexus"), or the Dock
- Right-click the Dock icon → **Options → Keep in Dock** for quick access

### First Launch Note
Since the app isn't signed with an Apple Developer certificate, macOS may block it on first launch. To fix this:
1. Open **System Settings → Privacy & Security**
2. Scroll down — you'll see a message about "Nexus" being blocked
3. Click **Open Anyway**
4. Alternatively: Right-click the app → **Open** → click **Open** in the dialog

---

## Data Storage

Your data is saved automatically to:
```
~/Library/Application Support/nexus-dashboard/
```

This includes all projects, classes, semesters, grad apps, and settings. Data persists across app restarts, updates, and even reinstalls (the data folder is separate from the app itself).

### Backup & Restore
- **Export**: Settings → Data Management → Export Data (saves a `.json` file)
- **Import**: Settings → Data Management → Import Data
- **Reset**: Settings → Data Management → Reset All Data (requires typing "RESET")

---

## Features

### Home Dashboard
- Unified overview with urgency-coded deadline alerts
- Summary cards for Projects, Classes, and Grad Apps
- Aggregated deadline list across all sections

### Projects
- Create, edit, delete projects with color coding
- Drag-and-drop Kanban boards (To Do → In Progress → Done)
- Task management with subtasks
- Deadline tracking with progress bars

### Classes
- Semester/term organization with tab switching
- Per-class Kanban boards (Not Started → Working → Submitted)
- Item types: Assignments, Exams, Readings, Other
- Due date countdowns

### Graduate School Applications
- Pipeline view: Researching → Preparing → Submitted → Decision
- 9-document checklist per school (SOP, Personal Statement, 3 LORs, CV, Transcripts, GRE, Diversity Statement)
- School comparison notes (Pros, Cons, Fit, Funding)
- Quick stage switching

### Settings
- 8 accent color themes
- 7 font families
- 4 font size scales
- Dashboard customization
- Data export/import/reset

---

## Project Structure

```
nexus-dashboard/
├── main.js                 ← Electron main process
├── preload.js              ← Secure IPC bridge
├── package.json            ← Dependencies & build config
├── build-resources/
│   └── icon_1024.png       ← App icon
├── public/
│   └── index.html
└── src/
    ├── App.js              ← Root component & state management
    ├── theme.js            ← Color system
    ├── storage.js          ← Persistence layer
    ├── data/               ← Default/sample data
    ├── components/         ← Shared UI components
    └── pages/              ← Page components
```
