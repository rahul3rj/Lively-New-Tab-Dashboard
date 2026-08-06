# 🖥️ Project OS — Ultimate New Tab Workspace & Dashboard

> **Transform every new tab into a futuristic, hyper-customizable productivity HQ.**  
> *Sleek aesthetics. Zero distractions. Unrivaled focus.*

---

## 📌 Overview

**Project OS** is a cutting-edge Chrome New Tab Extension (**Manifest V3**) built with **React 19**, **Vite**, **Tailwind CSS v4**, and **dnd-kit**. It replaces standard blank browser tabs with an interactive, modular operating system dashboard designed for developers, students, power users, and productivity enthusiasts.

Whether you need a distraction-free minimalist view, an hourly routine time-box planner, an ambient Lofi music player, or a GitHub-style activity contribution calendar, **Project OS** adapts to your workflow seamlessly.

---

## ✨ Features Breakdown

### 🎨 1. Multi-Aesthetic Theme Engine
Personalize your dashboard with 4 handcrafted design themes:
- 💎 **Glassmorphic (Default):** Translucent frosted-glass cards, smooth modern gradients, and sleek backdrop blurs.
- ⚡ **Cyberpunk:** High-contrast neon glows, futuristic cyan/pink accents, scanline textures, and sci-fi styling.
- 🖋️ **Manga / Ink:** Monochromatic black-and-white ink aesthetic with high-contrast outlines and manga panel styling.
- 👾 **Pixel Art:** Nostalgic 8-bit retro arcade interface with pixelated borders and retro typography.

---

### 🧱 2. Drag & Drop Modular Grid Dashboard
- **Flexible Grid Layout:** Drag, drop, and rearrange widgets dynamically using `@dnd-kit/core`.
- **Dual Workspace View Modes:**
  - **Dashboard Grid Mode:** Multi-widget layout displaying all your active tools at once.
  - **Hero View Mode:** Distraction-free, minimal focus screen for deep work sessions.
- **Widget Toggle Control:** Turn individual widgets on/off on demand to keep your space clean.

---

### ⏰ 3. Smart Clock & Dynamic Greeting
- Real-time digital clock with **12-hour / 24-hour** display formats.
- Customizable greetings (e.g. *"Good Morning, Rahul"*).
- Live date presentation and optional seconds ticker.
- Theme-responsive fonts and custom text color index selection.

---

### 🧭 4. Workspace Shortcuts & AI Tool Launcher
- Quick-launch bar pre-configured with top AI tools & developer sites:
  - 🤖 **Gemini**, **Claude**, **Copilot**, **ChatGPT**, **Perplexity**, **DeepSeek**, **Higgsfield AI**, and custom bookmarks.
- Full CRUD management: Add, edit, remove, reorder, and upload custom icons/favicons for any shortcut.

---

### 🎯 5. Pomodoro & Focus Timer
- Customizable **Work / Rest** timer durations.
- Session counter and total daily focus time tracking.
- Audio ringtone alerts on session completion (Focus finish & Rest finish).
- Chrome browser notifications support.
- Automatically syncs focus metrics to your streak contribution log.

---

### ✅ 6. Structured Task Manager (Todo)
- Lightweight, persistent task checklist.
- Task completion progress bar & quick filters.
- Zero clutter, smooth micro-animations, and fast keyboard entry.

---

### 📅 7. Time-Boxing Routine Planner
- Hourly habit and routine block planner.
- Pre-loaded & customizable task groups (*Brain Stretching, Exercise, LeetCode, Deep Work, Skill Development*).
- Subtask checklists and per-group streak tracking.
- Automatic daily UTC reset to keep your habits fresh every morning.

---

### 🟩 8. Activity Contribution & Streak Grid
- GitHub-style activity contribution calendar matrix (powered by `react-activity-calendar`).
- Visualizes daily focus intensity, logged activity, and long-term consistency streaks.

---

### 💧 9. Hydration Tracker / Water Reminder
- Interactive water intake monitor with customizable daily target in milliliters (ml).
- Quick drink logs (`+250ml`, `+500ml`, custom amounts) with visual hydration progress ring.
- Configurable interval reminders and customizable sound ringtones.

---

### 🎵 10. Ambient Audio & Media Player
- **Lofi Radio Stations:** Embedded live streaming audio feeds (*ILoveMusic, Zeno.fm, Laut.fm, FluxFM*).
- **YouTube Audio Integration:** Play YouTube music videos or streams directly in the background.
- **Spotify Integration:** Quick access to Spotify audio streams.
- Full control bar: Play/Pause, track details, volume adjustment, and custom audio stream URLs.

---

### 📑 11. Important Tabs & Categorized Bookmarks
- Categorized bookmark hubs (*Study, AI Engineering, DSA / LeetCode, News, Personal*).
- Quickly access, group, and manage link collections without tab clutter.

---

### 🖼️ 12. Background & Wallpaper Customizer
- Support for custom **High-Res Images** and **Animated Video Backgrounds** (`.mp4`, `.webm`).
- Built-in wallpaper library (Default, Cyberpunk, Manga, CLI).
- Adjustable background **blur filter**, dark overlay **opacity slider**, and image sizing options.

---

### 💾 13. Data Privacy & Backup / Restore
- **100% Local & Private:** All settings, wallpapers, todos, and focus stats stay stored on your device via `chrome.storage.local`.
- **JSON Backup & Restore:** Export your complete setup configuration to JSON and restore it anytime or transfer across browsers.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [React 19](https://react.dev/) + [Vite 7](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + Vanilla CSS Theme Engines |
| **Drag & Drop** | [@dnd-kit/core](https://dndkit.com/) & `@dnd-kit/utilities` |
| **Activity Graph** | `react-activity-calendar` |
| **Icons** | Remix Icon (`remixicon`) |
| **Extension Architecture** | Chrome Extension Manifest V3 (`chrome.storage.local`, `declarativeNetRequest`) |

---

## 📂 Project Directory Structure

```txt
Chrome_Extension/
├── README.md                      # Project OS Documentation
└── Frontend/
    ├── package.json               # Dependencies & build scripts
    ├── vite.config.js             # Vite configuration
    ├── index.html                 # Main extension HTML template
    ├── public/
    │   ├── manifest.json          # Chrome Extension Manifest V3 config
    │   ├── rules.json             # Declarative net request header rules
    │   ├── logo.png               # Extension branding icon
    │   └── wallpapers & fonts     # Pre-loaded wallpaper assets & custom typography
    └── src/
        ├── App.jsx                # Core application state, storage syncing & settings
        ├── main.jsx               # Application entry point
        ├── index.css              # Global styles & design system utilities
        ├── components/
        │   ├── DashboardGrid.jsx  # Drag-and-drop widget layout manager
        │   ├── HeroView.jsx       # Distraction-free minimal focus view
        │   ├── Clock.jsx          # Digital clock & dynamic greeting widget
        │   ├── Taskbar.jsx        # Quick shortcuts launcher bar
        │   ├── Timmer.jsx         # Pomodoro / focus session timer widget
        │   ├── Todo.jsx           # Task manager widget
        │   ├── TimeBoxing.jsx     # Hourly routine planner widget
        │   ├── StreakGrid.jsx     # Activity contribution graph widget
        │   ├── WaterReminder.jsx  # Hydration tracker widget
        │   ├── SongPlayer.jsx     # Ambient Lofi & YouTube music player
        │   ├── ImportantTabs.jsx  # Categorized link bookmarks widget
        │   ├── SettingsPage.jsx   # Complete settings, theme & wallpaper drawer
        │   └── FigmaGlassCard.jsx # Frosted glass card UI wrapper
        ├── utils/
        │   ├── storage.js         # Chrome storage wrapper (local & fallback support)
        │   ├── activityStore.js   # Focus streak activity logger
        │   ├── youtube.js         # YouTube player helper utilities
        │   └── spotify.js         # Spotify integration helper utilities
        └── themes/
            ├── index.js           # Theme registry & state management
            ├── cyberpunk.css      # Cyberpunk neon theme stylesheet
            ├── manga.css          # Manga ink monochrome stylesheet
            └── pixel.css          # 8-Bit Pixel Art theme stylesheet
```

---

## 🚀 Quick Start & Installation Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- Google Chrome (or any Chromium-based browser like Brave, Edge, Arc)

---

### 1️⃣ Clone & Install Dependencies

Navigating to the `Frontend` directory:

```bash
cd Frontend
npm install
```

---

### 2️⃣ Development Mode (Local UI Testing)

To run the app locally in the browser for fast UI testing:

```bash
npm run dev
```

> **Note:** The Chrome New Tab override feature requires loading the built extension into Chrome.

---

### 3️⃣ Build & Load Extension in Chrome

#### Step A: Build the project
```bash
npm run build
```
This generates the optimized production bundle inside `Frontend/dist`.

#### Step B: Load into Google Chrome
1. Open Google Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** (toggle switch in top right corner).
3. Click **Load unpacked**.
4. Select the `Frontend/dist` directory.

#### Step C: Open a New Tab!
Open a new tab (`Ctrl + T` or `Cmd + T`) to experience **Project OS**! 🎉

---

### 🔄 Updating After Code Changes
Whenever you modify files in `src/`:
```bash
cd Frontend
npm run build
```
Then go to `chrome://extensions` and click the **Reload** (🔄) icon on **Project OS**.

---

## 🔐 Chrome Permissions & Privacy

**Project OS** respects your privacy. All user data stays strictly on your local device.

```json
"permissions": [
  "storage",
  "unlimitedStorage",
  "declarativeNetRequest"
]
```

- **`storage` / `unlimitedStorage`:** Stores custom themes, wallpapers, shortcuts, routine schedules, todos, and timer stats locally on your machine.
- **`declarativeNetRequest`:** Enables smooth audio streaming playback for Lofi radio stations and YouTube media embedding.
- **Zero External Data Tracking:** No analytics, no remote telemetry, no external accounts required.

---

## 👨‍💻 Author & Credits

Crafted with ❤️ by **Rahul Jha**  
*Developer • Student • Builder • Hustler* 🚀

---

## 📜 License

This project is licensed under the **MIT License**. Feel free to customize and extend it for personal or open-source use.
