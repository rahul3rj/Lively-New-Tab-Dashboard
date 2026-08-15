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
- Built-in presets and the ability to upload or link custom wallpapers.
- Smooth background transitions and blur control.

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | React 19 |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS v4 |
| **Drag & Drop** | @dnd-kit/core |
| **Calendar** | react-activity-calendar |
| **Extension** | Chrome Manifest V3 |
| **Package Manager** | npm |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ and **npm** installed
- **Google Chrome** browser

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/rahul3rj/Project-OS.git
   cd Project-OS/Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. To load as a Chrome Extension:
   - Run `npm run build` to generate the production build
   - Open `chrome://extensions/` in Chrome
   - Enable **Developer Mode**
   - Click **Load unpacked** and select the `dist/` folder

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. Create a **feature branch** (`git checkout -b feature/your-feature`)
3. **Commit** your changes (`git commit -m 'Add some feature'`)
4. **Push** to the branch (`git push origin feature/your-feature`)
5. Open a **Pull Request**

Please keep PRs focused and well-scoped for easier review.

---

## 📄 License

This project is open source. Please check with the maintainer for specific license terms.

---

## 🙏 Acknowledgments

- Built with [React](https://react.dev/), [Vite](https://vite.dev/), and [Tailwind CSS](https://tailwindcss.com/)
- Drag & drop powered by [@dnd-kit](https://dndkit.com/)
- Activity calendar by [react-activity-calendar](https://github.com/grubersjoe/react-activity-calendar)
