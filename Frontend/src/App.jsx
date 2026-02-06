import React, { useEffect, useMemo, useRef, useState } from 'react'
import SearchBar from './components/SearchBar.jsx'
import Taskbar from './components/Taskbar.jsx'
import Clock from './components/Clock.jsx'
import Timmer from './components/Timmer.jsx'
import Todo from './components/Todo.jsx'

const STORAGE = {
  wallpaper: 'settings_wallpaper_v1',
  showTimer: 'settings_show_timer_v1',
  showTodo: 'settings_show_todo_v1',
  themeColor: 'settings_theme_color_v1',
  shortcuts: 'settings_shortcuts_v1',
}

const chromeApi = typeof globalThis !== 'undefined' ? globalThis.chrome : undefined

const isExtensionPage =
  typeof globalThis !== 'undefined' &&
  typeof globalThis.location?.protocol === 'string' &&
  globalThis.location.protocol === 'chrome-extension:'

const hasChromeStorage =
  isExtensionPage &&
  !!chromeApi?.storage?.local &&
  typeof chromeApi.storage.local.get === 'function' &&
  typeof chromeApi.storage.local.set === 'function'

const storageGet = (key) => {
  if (!hasChromeStorage) return Promise.resolve(undefined)

  return new Promise((resolve) => {
    chromeApi.storage.local.get([key], (result) => {
      if (chromeApi.runtime?.lastError) {
        resolve(undefined)
        return
      }
      resolve(result?.[key])
    })
  })
}

const storageSet = (key, value) => {
  if (!hasChromeStorage) return Promise.resolve()

  return new Promise((resolve) => {
    chromeApi.storage.local.set({ [key]: value }, () => resolve())
  })
}

const makeId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return String(Date.now() + Math.random())
}

const DEFAULT_SHORTCUTS = [
  { id: 'gemini', title: 'Gemini', url: 'https://gemini.google.com', iconClass: 'ri-gemini-fill' },
  { id: 'claude', title: 'Claude', url: 'https://claude.ai', iconClass: 'ri-claude-fill' },
  { id: 'copilot', title: 'Copilot', url: 'https://copilot.microsoft.com', iconClass: 'ri-copilot-fill' },
  { id: 'openai', title: 'OpenAI', url: 'https://chat.openai.com', iconClass: 'ri-openai-fill' },
  { id: 'perplexity', title: 'Perplexity', url: 'https://perplexity.ai', iconClass: 'ri-perplexity-fill' },
  { id: 'deepseek', title: 'DeepSeek', url: 'https://chat.deepseek.com/', iconClass: 'ri-deepseek-fill' },
  {
    id: 'higgsfield',
    title: 'Higgsfield AI',
    url: 'https://higgsfield.ai',
    iconUrl: 'https://higgsfield.ai/favicon.ico',
  },
]

const Toggle = ({ checked, onChange, label }) => {
  return (
    <button
      type='button'
      onClick={() => onChange(!checked)}
      className='w-full flex items-center justify-between gap-3 py-2'
      aria-pressed={checked}
    >
      <span className='text-white/90 text-sm font-semibold'>{label}</span>
      <span
        className={`h-6 w-12 rounded-full transition-colors duration-200 flex items-center px-1 ${
          checked ? 'bg-white/70' : 'bg-white/20'
        }`}
        aria-hidden='true'
      >
        <span
          className={`h-4 w-4 rounded-full bg-white transition-transform duration-200 ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  )
}

const MAX_SHORTCUTS = 7

const THEME_PRESETS = ['#5C5C5C', '#0EA5E9', '#22C55E', '#EAB308', '#F97316', '#EF4444', '#A855F7', '#111827']

const ColorSwatch = ({ color, selected, onSelect }) => {
  return (
    <button
      type='button'
      onClick={() => onSelect(color)}
      className={`h-9 w-9 rounded-xl border transition-all duration-200 ${
        selected ? 'border-white/80 scale-105' : 'border-white/20 hover:border-white/40'
      }`}
      style={{ backgroundColor: color }}
      aria-label={`Select theme color ${color}`}
    />
  )
}

const App = () => {
  const [settingsOpen, setSettingsOpen] = useState(false)

  const [wallpaper, setWallpaper] = useState(null)
  const [showTimer, setShowTimer] = useState(true)
  const [showTodo, setShowTodo] = useState(true)
  const [themeColor, setThemeColor] = useState('#5C5C5C')
  const [shortcuts, setShortcuts] = useState(DEFAULT_SHORTCUTS)

  const wallpaperInputRef = useRef(null)
  const hydratedRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const storedWallpaper = await storageGet(STORAGE.wallpaper)
      const storedShowTimer = await storageGet(STORAGE.showTimer)
      const storedShowTodo = await storageGet(STORAGE.showTodo)
      const storedThemeColor = await storageGet(STORAGE.themeColor)
      const storedShortcuts = await storageGet(STORAGE.shortcuts)

      if (cancelled) return

      if (storedWallpaper && typeof storedWallpaper === 'object') setWallpaper(storedWallpaper)
      if (typeof storedShowTimer === 'boolean') setShowTimer(storedShowTimer)
      if (typeof storedShowTodo === 'boolean') setShowTodo(storedShowTodo)
      if (typeof storedThemeColor === 'string' && storedThemeColor.trim().startsWith('#')) {
        setThemeColor(storedThemeColor.trim())
      }
      if (Array.isArray(storedShortcuts) && storedShortcuts.length > 0) setShortcuts(storedShortcuts)

      hydratedRef.current = true
    })()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!hydratedRef.current) return
    storageSet(STORAGE.wallpaper, wallpaper)
  }, [wallpaper])

  useEffect(() => {
    if (!hydratedRef.current) return
    storageSet(STORAGE.showTimer, showTimer)
  }, [showTimer])

  useEffect(() => {
    if (!hydratedRef.current) return
    storageSet(STORAGE.showTodo, showTodo)
  }, [showTodo])

  useEffect(() => {
    if (!hydratedRef.current) return
    storageSet(STORAGE.themeColor, themeColor)
  }, [themeColor])

  useEffect(() => {
    document.documentElement.style.setProperty('--theme', themeColor)
  }, [themeColor])

  useEffect(() => {
    if (!hydratedRef.current) return
    storageSet(STORAGE.shortcuts, shortcuts)
  }, [shortcuts])

  const background = useMemo(() => {
    if (wallpaper?.type === 'video' && typeof wallpaper?.dataUrl === 'string') {
      return (
        <video
          src={wallpaper.dataUrl}
          className='h-full w-full object-cover select-none'
          autoPlay
          muted
          loop
          playsInline
        />
      )
    }

    if (wallpaper?.type === 'image' && typeof wallpaper?.dataUrl === 'string') {
      return <img src={wallpaper.dataUrl} alt='' className='h-full w-full object-cover select-none' />
    }

    return <img src='/wallpaper.jpg' alt='' className='h-full w-full object-cover select-none' />
  }, [wallpaper])

  const updateShortcut = (id, patch) => {
    setShortcuts((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }

  const removeShortcut = (id) => {
    setShortcuts((prev) => prev.filter((s) => s.id !== id))
  }

  const addShortcut = () => {
    setShortcuts((prev) => {
      if (prev.length >= MAX_SHORTCUTS) return prev
      return [
        ...prev,
        {
          id: makeId(),
          title: 'New',
          url: 'https://',
        },
      ]
    })
  }

  const readFileAsDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.onerror = () => reject(new Error('read_error'))
      reader.readAsDataURL(file)
    })
  }

  const handleWallpaperPick = async (file) => {
    if (!file) return

    const maxBytes = 7 * 1024 * 1024
    if (file.size > maxBytes) return

    const dataUrl = await readFileAsDataUrl(file)
    const type = file.type.startsWith('video/') ? 'video' : 'image'
    setWallpaper({ type, dataUrl, name: file.name })
  }

  const handleShortcutIconPick = async (id, file) => {
    if (!file) return

    const maxBytes = 512 * 1024
    if (file.size > maxBytes) return

    const dataUrl = await readFileAsDataUrl(file)
    updateShortcut(id, { iconDataUrl: dataUrl })
  }

  const showRightPanel = showTimer || showTodo

  return (
    <div className="h-screen w-full bg-black relative overflow-hidden font-poppins">
      <div className="h-full w-full flex items-center justify-center relative">
        {background}

        <div className="absolute top-10 left-20 w-[65vw]">
          <SearchBar />
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[50vw]">
          <Taskbar shortcuts={shortcuts} />
        </div>

        <div className="absolute bottom-10 left-20 w-[20vw]">
          <Clock />
        </div>

        {showRightPanel && (
          <div className="absolute top-10 right-10 h-[81vh] w-[25vw] flex flex-col gap-4">
            {showTimer && (
              <div className="flex-1">
                <Timmer />
              </div>
            )}
            {showTodo && (
              <div className="flex-1">
                <Todo />
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="absolute bottom-10 right-10 h-10 w-10 rounded-xl hover:scale-110 transition-all duration-200 hover:bg-[color:var(--theme)]/70 bg-[color:var(--theme)]/36 flex items-center justify-center cursor-pointer"
          aria-label="Open settings"
        >
          <i className="ri-settings-3-fill text-white text-2xl"></i>
        </button>

        <div
          className={`fixed inset-0 z-40 transition-opacity duration-200 ${
            settingsOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          aria-hidden={!settingsOpen}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/35 backdrop-blur-md"
            onClick={() => setSettingsOpen(false)}
            aria-label="Close settings"
          />

          <aside
            className={`absolute top-0 right-0 h-full w-[420px] max-w-[95vw] bg-[color:var(--theme)]/36 backdrop-blur-md border-l border-white/15 shadow-2xl transition-transform duration-300 ease-out ${
              settingsOpen ? "translate-x-0" : "translate-x-full"
            }`}
            role="dialog"
            aria-modal="true"
            aria-label="Settings"
          >
            <div className="h-full w-full p-6 flex flex-col gap-6 overflow-auto scrollbar-hide">
              <div className="flex items-center justify-between">
                <h2 className="text-white text-xl font-semibold">Settings</h2>
                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  className="h-10 w-10 rounded-xl bg-[#4C4C4C]/30 hover:bg-[#4C4C4C]/45 transition-all duration-200 flex items-center justify-center cursor-pointer"
                  aria-label="Close settings"
                >
                  <i className="ri-close-line text-2xl text-white"></i>
                </button>
              </div>

              <div className="text-xs text-white/80 rounded-xl bg-black/20 border border-white/10 p-3">
                <div className='flex items-center gap-2'>
                  <button
                    type="button"
                    onClick={() => window.open('https://github.com/rahul3rj', '_blank')}
                    className="flex items-center gap-2 hover:bg-white/10 bg-[color:var(--theme)] rounded-lg px-2 py-1 transition-colors cursor-pointer"
                    aria-label="Open GitHub"
                  >
                    <i className="ri-github-fill text-white text-base"></i>
                    <h1 className='text-white font-semibold'>GitHub</h1>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.open('https://chromewebstore.google.com/?hl=en', '_blank')}
                    className="flex items-center gap-2 hover:bg-white/10 bg-[color:var(--theme)] rounded-lg px-2 py-1 transition-colors cursor-pointer"
                    aria-label="Open Chrome Extension Page"
                  >
                    <i className="ri-chrome-line text-white text-base"></i>
                    <h1 className='text-white font-semibold'>Feedback</h1>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.open('https://github.com', '_blank')}
                    className="flex items-center gap-2 hover:bg-white/10 bg-[color:var(--theme)] rounded-lg px-2 py-1 transition-colors cursor-pointer"
                    aria-label="Buy me a Coffee"
                  >
                    <i class="ri-drinks-fill text-white text-base"></i>
                    <h1 className='text-white font-semibold'>Buy me a Coffee</h1>
                  </button>
                </div>
              </div>

              <section className="rounded-2xl bg-black/20 border border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white text-base font-semibold">Wallpaper</h3>
                  <div className="flex items-center gap-2 text-white">
                    <input
                      ref={wallpaperInputRef}
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={(e) => handleWallpaperPick(e.target.files?.[0])}
                    />
                    <button
                      type="button"
                      onClick={() => wallpaperInputRef.current?.click()}
                      className="h-9 px-3 rounded-xl bg-white/15 hover:bg-white/20 transition-all duration-200 text-sm font-semibold cursor-pointer"
                    >
                      Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setWallpaper(null)}
                      className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/15 transition-all duration-200 text-sm font-semibold cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                </div>
                <div className="mt-3 text-xs text-white/75">
                  Max 7MB for wallpaper.
                </div>
              </section>

              <section className="rounded-2xl bg-black/20 border border-white/10 p-4">
                <h3 className="text-white text-base font-semibold">Widgets</h3>
                <div className="mt-2 flex flex-col">
                  <Toggle
                    checked={showTimer}
                    onChange={setShowTimer}
                    label="Focus Timer"
                  />
                  <Toggle
                    checked={showTodo}
                    onChange={setShowTodo}
                    label="To Do List"
                  />
                </div>
              </section>

              <section className="rounded-2xl bg-black/20 border border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white text-sm font-semibold">Theme</h3>
                  <div className="text-xs text-white/75">
                    {themeColor.toUpperCase()}
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  {THEME_PRESETS.map((c) => (
                    <ColorSwatch
                      key={c}
                      color={c}
                      selected={c.toLowerCase() === themeColor.toLowerCase()}
                      onSelect={setThemeColor}
                    />
                  ))}

                  <label className="ml-auto h-9 px-3 rounded-xl bg-white/10 hover:bg-white/15 transition-all duration-200 text-sm font-semibold flex items-center gap-2 cursor-pointer text-white">
                    <span>Custom</span>
                    <input
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="h-6 w-6 bg-transparent border-0 p-0"
                      aria-label="Pick custom theme color"
                    />
                  </label>
                </div>
              </section>

              <section className="rounded-2xl bg-black/20 border border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-white text-base font-semibold">Workspace</h3>
                    <div className="text-xs text-white/70">
                      ({shortcuts.length}/{MAX_SHORTCUTS})
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addShortcut}
                    disabled={shortcuts.length >= MAX_SHORTCUTS}
                    className={`h-9 w-9 rounded-xl transition-all duration-200 flex items-center justify-center ${
                      shortcuts.length >= MAX_SHORTCUTS
                        ? "bg-white/5 opacity-60 cursor-not-allowed"
                        : "bg-white/15 hover:bg-white/20 cursor-pointer"
                    }`}
                    aria-label="Add shortcut"
                  >
                    <i className="ri-add-line text-xl text-white"></i>
                  </button>
                </div>

                <div className="mt-3 flex flex-col gap-3">
                  {shortcuts.map((s) => (
                    <div
                      key={s.id}
                      className="rounded-2xl bg-white/5 border border-white/10 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <label className="block text-xs text-white/70">
                            Title
                          </label>
                          <input
                            value={s.title ?? ""}
                            onChange={(e) =>
                              updateShortcut(s.id, { title: e.target.value })
                            }
                            className="mt-1 h-9 w-full rounded-xl bg-black/20 border border-white/10 px-3 text-sm text-white outline-none"
                            placeholder="Name"
                          />

                          <label className="block mt-3 text-xs text-white/70">
                            URL
                          </label>
                          <input
                            value={s.url ?? ""}
                            onChange={(e) =>
                              updateShortcut(s.id, { url: e.target.value })
                            }
                            className="mt-1 h-9 w-full rounded-xl bg-black/20 border border-white/10 px-3 text-sm text-white outline-none"
                            placeholder="https://..."
                          />

                          <div className="mt-3 flex items-center gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id={`icon-${s.id}`}
                              onChange={(e) =>
                                handleShortcutIconPick(
                                  s.id,
                                  e.target.files?.[0],
                                )
                              }
                            />
                            <button
                              type="button"
                              onClick={() =>
                                document.getElementById(`icon-${s.id}`)?.click()
                              }
                              className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/15 transition-all duration-200 text-xs cursor-pointer font-semibold text-white"
                            >
                              Upload Icon
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateShortcut(s.id, {
                                  iconDataUrl: undefined,
                                  iconUrl: undefined,
                                  iconClass: undefined,
                                })
                              }
                              className="h-9 px-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 text-xs cursor-pointer font-semibold text-white/70"
                            >
                              Clear
                            </button>
                            <div className="ml-auto h-9 w-9 rounded-xl bg-black/20 border border-white/10 flex items-center justify-center overflow-hidden">
                              {s.iconDataUrl || s.iconUrl ? (
                                <img
                                  src={s.iconDataUrl || s.iconUrl}
                                  alt=""
                                  className="h-6 w-6 object-contain"
                                />
                              ) : (
                                <i className="ri-link text-lg text-white"></i>
                              )}
                            </div>
                          </div>

                          <div className="mt-2 text-[11px] text-white/65">
                            Icon max 512KB.
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeShortcut(s.id)}
                          className="h-10 w-10 rounded-xl bg-white/10 hover:bg-white/15 transition-all duration-200 flex items-center justify-center cursor-pointer"
                          aria-label="Remove shortcut"
                        >
                          <i className="ri-delete-bin-6-line text-xl text-white"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              <a
                href="https://www.linkedin.com/in/rahul-jha-049945257/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 text-sm text-center font-semibold hover:text-white transition-colors"
              >
                Developed by Rahul Jha 👌🏼
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default App