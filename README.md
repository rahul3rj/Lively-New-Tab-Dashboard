# Lively New Tab Dashboard

A Chrome New Tab extension (Manifest V3) that replaces the default New Tab with a customizable dashboard: search, clock, workspace shortcuts, focus timer, todo list, plus a Settings drawer for personalization.

## Features

- Search bar
  - Selectable search engine
  - Editable welcome name (saved)
- Clock + date widget
- Workspace shortcuts
  - Add/edit/remove
  - Max 7 shortcuts (keeps the UI clean)
  - Optional custom icon upload
- Focus timer
  - Editable duration
  - Tracks “Today” focus time
  - Saves duration + today totals
- Todo list (saved)
- Settings drawer
  - Wallpaper upload (image/video)
  - Widget toggles (Timer / Todo)
  - Theme color picker

## Tech Stack

- React + Vite
- Tailwind CSS
- Chrome Extension (Manifest V3)
- chrome.storage.local for persistence

## Chrome Permissions

- storage — saves settings, wallpaper, shortcuts, todo items, and timer data

## Run Locally

From the `Frontend` folder:

```bat
npm install
npm run dev
```

Notes:
- Local dev is useful for UI changes, but the real “New Tab override” behavior only works when loaded as an extension.

## Build & Load In Chrome

1) Build:

```bat
cd Frontend
npm install
npm run build
```

2) Load unpacked:
- Open `chrome://extensions`
- Enable Developer mode
- Click “Load unpacked”
- Select the folder: `Frontend\dist`

3) Open a new tab.

When you change code later:
- Rebuild (`npm run build`)
- Go back to `chrome://extensions` and click Reload on the extension

## Settings & Limits

- Wallpaper: image/video, max 7MB
- Workspace: max 7 shortcuts
- Shortcut icons: keep icons lightweight (recommended <= 512KB)

## Data Persistence

The extension stores data in `chrome.storage.local` so it persists across tab refresh and browser restarts:
- Settings: wallpaper, widget toggles, theme color
- Workspace: shortcuts list (title/url/icon)
- Timer: duration and today total focus time
- Todo: todo items

## Project Structure (Key Files)

- `src/App.jsx` — main layout + Settings drawer + global persistence wiring
- `src/components/SearchBar.jsx` — search engine + welcome name
- `src/components/Taskbar.jsx` — workspace shortcuts
- `src/components/Clock.jsx` — clock/date
- `src/components/Timmer.jsx` — focus timer + “today” tracking
- `src/components/Todo.jsx` — todo list
- `dist/manifest.json` — MV3 config (newtab override + CSP)

## Troubleshooting

- Fonts/sizes look different from localhost:
  - Reset zoom on the New Tab page: Ctrl + 0 (zoom is stored per-site, and `chrome-extension://` is separate from localhost)
  - Rebuild and reload the extension from `chrome://extensions`
- New changes not showing:
  - Make sure you rebuilt (`npm run build`) and reloaded the extension

## Credits

Developed by Rahul Jha 👌🏼.

## License

Choose and add a license (MIT / Apache-2.0 / etc.).