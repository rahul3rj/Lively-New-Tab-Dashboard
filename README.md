# 🚀 Lively New Tab Dashboard

> Turn every new tab into your **personal productivity HQ** ⚡
> Clean. Custom. Focused. No distractions.

**Lively New Tab Dashboard** is a Chrome New Tab extension (Manifest V3) that replaces boring blank tabs with a **customizable workspace** featuring search, clock, focus timer, todo list, shortcuts, and aesthetic wallpapers.

Built for students, devs, and productivity nerds who want their browser to actually *work for them* 💻✨

---

## 🌟 Why Lively?

Because your new tab should be:

✅ Useful
✅ Aesthetic
✅ Fast
✅ Minimal
✅ Yours

Not just… empty.

---

## ✨ Features

### 🔍 Smart Search

* Choose your favorite search engine
* Personalized welcome name (auto-saved)

### ⏰ Time & Date

* Live clock + date widget
* Keeps you grounded in reality 😄

### 🧭 Workspace Shortcuts

* Add / Edit / Remove shortcuts
* Max 7 (clean UI = clear mind)
* Upload custom icons

### 🎯 Focus Timer

* Custom focus duration
* Tracks **Today’s Focus Time**
* Auto-saves progress

### ✅ Todo Manager

* Lightweight task list
* Persistent storage
* Zero clutter

### ⚙️ Settings Drawer

* Upload wallpaper (image / video)
* Toggle widgets (Timer / Todo)
* Theme color picker
* Personalize everything

---

## 🛠️ Tech Stack

Built with modern tools only 🔥

* ⚛️ React + Vite
* 🎨 Tailwind CSS
* 🧩 Chrome Extension (Manifest V3)
* 💾 chrome.storage.local

---

## 🔐 Chrome Permissions

```
storage
```

Used for:

* Settings
* Wallpapers
* Shortcuts
* Todos
* Focus stats

No shady stuff. Your data stays local 💯

---

## 🚀 Run Locally (Dev Mode)

From the `Frontend` folder:

```bash
npm install
npm run dev
```

⚠️ Note:
Local dev is for UI/testing only.
New Tab override works **only when loaded as extension**.

---

## 📦 Build & Load in Chrome

### 1️⃣ Build Project

```bash
cd Frontend
npm install
npm run build
```

### 2️⃣ Load Extension

1. Open `chrome://extensions`
2. Enable **Developer Mode**
3. Click **Load unpacked**
4. Select: `Frontend/dist`

### 3️⃣ Open New Tab 🎉

You’re live.

---

### 🔄 After Making Changes

Whenever you update code:

```bash
npm run build
```

Then:

* Go to `chrome://extensions`
* Hit **Reload**

Boom. Updated.

---

## ⚠️ Settings & Limits

| Feature   | Limit                 |
| --------- | --------------------- |
| Wallpaper | Max 7MB               |
| Shortcuts | Max 7                 |
| Icons     | ≤ 512KB (Recommended) |

Keeping it fast + smooth 🚀

---

## 💾 Data Persistence

All data is stored using `chrome.storage.local`:

### Stored Items:

* 🎨 Theme + Wallpaper
* ⚙️ Widget Toggles
* 🧭 Shortcuts
* 🎯 Focus Stats
* ✅ Todos

Your setup stays safe even after restart.

---

## 📁 Project Structure

Key Files:

```txt
src/App.jsx                 → Main layout + Settings logic
src/components/SearchBar    → Search + Welcome
src/components/Taskbar      → Shortcuts
src/components/Clock        → Time + Date
src/components/Timmer       → Focus Timer
src/components/Todo         → Task Manager
dist/manifest.json          → MV3 Config
```

---

## 🧯 Troubleshooting

### Fonts / Zoom Issues

If UI looks weird:

```txt
Ctrl + 0
```

Reset zoom on extension page.

---

### Changes Not Showing?

Checklist:

✅ Did you run `npm run build`?
✅ Did you reload extension?
✅ Did you select correct `dist` folder?

If yes, you’re good.

---

## 👨‍💻 Author

Built with ❤️ by **Rahul Jha**
Student • Developer • Builder • Hustler 🚀

If you like it, drop a ⭐

---

## 📜 License

Choose one:

* MIT (Recommended)
* Apache-2.0
* GPL

Then add it here.

---

## 🤝 Contribute

PRs are welcome 💪
Ideas? Issues? Improvements?
Open a ticket and let’s build together.

---

## 📸 Preview (Coming Soon)

Add screenshots here to flex the UI 😎
