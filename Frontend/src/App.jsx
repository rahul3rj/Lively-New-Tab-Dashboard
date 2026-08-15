import React, { useEffect, useMemo, useState } from "react";
import Taskbar from "./components/Taskbar.jsx";
import Clock from "./components/Clock.jsx";
import DashboardGrid from "./components/DashboardGrid.jsx";
import HeroView from "./components/HeroView.jsx";
import SettingsPage from "./components/SettingsPage.jsx";
import {
  useDashboardSettings,
  DEFAULT_THEME_PALETTES,
  DEFAULT_SHORTCUTS,
  DEFAULT_IMPORTANT_TABS,
  DEFAULT_TIMEBOX_GROUPS,
  DEFAULT_LOFI_STATIONS,
} from "./hooks/useDashboardSettings.js";

export {
  DEFAULT_SHORTCUTS,
  DEFAULT_IMPORTANT_TABS,
  DEFAULT_TIMEBOX_GROUPS,
  DEFAULT_LOFI_STATIONS,
  DEFAULT_THEME_PALETTES,
};

const MAX_SHORTCUTS = 12;

const makeId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function")
    return crypto.randomUUID();
  return String(Date.now() + Math.random());
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("read_error"));
    reader.readAsDataURL(file);
  });

const App = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isThemeChanging, setIsThemeChanging] = useState(false);

  const settings = useDashboardSettings();
  const {
    activeStep, setActiveStep,
    wallpaper, setWallpaper,
    showTimer, setShowTimer,
    showTodo, setShowTodo,
    showStreakGrid, setShowStreakGrid,
    streakDataSource, setStreakDataSource,
    githubUsername, setGithubUsername,
    showSongPlayer, setShowSongPlayer,
    themeColor, setThemeColor,
    themeColorsMap, setThemeColorsMap,
    themeTextColorIndex, setThemeTextColorIndex,
    shortcuts, setShortcuts,
    showWaterReminder, setShowWaterReminder,
    showImportantTabs, setShowImportantTabs,
    showTimeBoxing, setShowTimeBoxing,
    focusNotifEnabled, setFocusNotifEnabled,
    focusEndRingtone, setFocusEndRingtone,
    restEndRingtone, setRestEndRingtone,
    waterGoalMl, setWaterGoalMl,
    waterNotifEnabled, setWaterNotifEnabled,
    waterRingtone, setWaterRingtone,
    songPlaylistUrl, setSongPlaylistUrl,
    songAutoPlay, setSongAutoPlay,
    songCustomVideo, setSongCustomVideo,
    lofiStations, setLofiStations,
    importantTabsConfig, setImportantTabsConfig,
    timeBoxingGroups, setTimeBoxingGroups,
    uiTheme, setUiTheme,
    baseFont, setBaseFont,
    baseFontSize, setBaseFontSize,
    isHydrated,
  } = settings;

  /* ── Dynamic Google Font Loader for Base Font ── */
  useEffect(() => {
    if (!baseFont || baseFont === "Gilroy" || baseFont === "Default") {
      document.documentElement.style.setProperty("--font-base-custom", `"Gilroy", sans-serif`);
      return;
    }
    const fontId = `google-font-${baseFont.replace(/\s+/g, "-").toLowerCase()}`;
    if (!document.getElementById(fontId)) {
      const link = document.createElement("link");
      link.id = fontId;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(baseFont)}:wght@300;400;500;600;700;800&display=swap`;
      document.head.appendChild(link);
    }
    document.documentElement.style.setProperty("--font-base-custom", `"${baseFont}", sans-serif`);
  }, [baseFont]);

  /* ── Dynamic Base Font Size Property ── */
  useEffect(() => {
    document.documentElement.style.setProperty("--base-font-size", `${baseFontSize}px`);
  }, [baseFontSize]);

  /* ── Apply UI theme to <html> data attribute ── */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", uiTheme);
    return () => { document.documentElement.removeAttribute("data-theme"); };
  }, [uiTheme]);

  /* ── Theme CSS variables ── */
  useEffect(() => {
    const colors = Array.isArray(themeColor) && themeColor.length === 4
      ? themeColor
      : ["#CBD5E1", "#64748B", "#334155", "#0F172A"];

    const activeTextColor = colors[themeTextColorIndex] ?? colors[0];

    document.documentElement.style.setProperty("--theme-1", colors[0]);
    document.documentElement.style.setProperty("--theme-2", colors[1]);
    document.documentElement.style.setProperty("--theme-3", colors[2]);
    document.documentElement.style.setProperty("--theme-4", colors[3]);
    document.documentElement.style.setProperty("--theme", colors[2]);
    document.documentElement.style.setProperty("--theme-text", activeTextColor);
  }, [themeColor, themeTextColorIndex]);

  /* ── Background ── */
  const background = useMemo(() => {
    if (wallpaper?.type === "video" && typeof wallpaper?.dataUrl === "string") {
      return (
        <video
          src={wallpaper.dataUrl}
          className="theme-wallpaper h-full w-full object-cover select-none"
          autoPlay muted loop playsInline
        />
      );
    }
    if (wallpaper?.type === "image" && typeof wallpaper?.dataUrl === "string") {
      return <img src={wallpaper.dataUrl} alt="" className="theme-wallpaper h-full w-full object-cover select-none" />;
    }
    const defaultWallpaperForTheme = {
      manga: "/manga-wallpaper.jpg",
      cyberpunk: "/cyberpunk-wallpaper.png",
      pixel: "/cli-wallpaper.jpg",
      default: "/default-wallpaper.jpg",
    }[uiTheme] || "/default-wallpaper.jpg";

    return <img src={defaultWallpaperForTheme} alt="" className="theme-wallpaper h-full w-full object-cover select-none object-top" />;
  }, [wallpaper, uiTheme]);

  /* ── Shortcut helpers ── */
  const updateShortcut = (id, patch) =>
    setShortcuts((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const removeShortcut = (id) =>
    setShortcuts((prev) => prev.filter((s) => s.id !== id));

  const reorderShortcuts = (fromId, toId) =>
    setShortcuts((prev) => {
      const keyOf = (s) => s.id || s.url;
      const fromIndex = prev.findIndex((s) => keyOf(s) === fromId);
      const toIndex = prev.findIndex((s) => keyOf(s) === toId);
      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });

  const addShortcut = (newShortcut) => {
    setShortcuts((prev) => {
      if (prev.length >= MAX_SHORTCUTS) return prev;
      const item =
        newShortcut && typeof newShortcut === "object" && newShortcut.title
          ? newShortcut
          : { id: makeId(), title: "New", url: "https://" };
      if (!item.id) item.id = makeId();
      return [...prev, item];
    });
  };

  const handleWallpaperPick = async (fileOrWallpaper) => {
    if (!fileOrWallpaper) return;
    if (fileOrWallpaper.dataUrl && fileOrWallpaper.type) {
      setWallpaper(fileOrWallpaper);
      return;
    }
    const file = fileOrWallpaper;
    const maxBytes = 20 * 1024 * 1024;
    if (file.size > maxBytes) return;
    const dataUrl = await readFileAsDataUrl(file);
    const type = file.type.startsWith("video/") ? "video" : "image";
    setWallpaper({ type, dataUrl, name: file.name });
  };

  const handleShortcutIconPick = async (id, file) => {
    if (!file) return;
    const maxBytes = 512 * 1024;
    if (file.size > maxBytes) return;
    const dataUrl = await readFileAsDataUrl(file);
    updateShortcut(id, { iconDataUrl: dataUrl });
  };

  /* ── Smooth Theme & Wallpaper Transition Handlers ── */
  const handleUiThemeChange = (newTheme) => {
    if (newTheme === uiTheme) return;
    setIsThemeChanging(true);
    setUiTheme(newTheme);

    const targetPalette =
      themeColorsMap[newTheme] ||
      DEFAULT_THEME_PALETTES[newTheme] ||
      DEFAULT_THEME_PALETTES.default;
    setThemeColor(targetPalette);

    setTimeout(() => {
      setIsThemeChanging(false);
    }, 280);
  };

  const handleThemeColorChange = (newColors) => {
    setThemeColor(newColors);
    setThemeColorsMap((prev) => ({
      ...prev,
      [uiTheme]: newColors,
    }));
  };

  const handleWallpaperChange = async (fileOrWallpaper) => {
    setIsThemeChanging(true);
    await handleWallpaperPick(fileOrWallpaper);
    setTimeout(() => {
      setIsThemeChanging(false);
    }, 280);
  };

  const handleWallpaperResetChange = () => {
    setIsThemeChanging(true);
    setWallpaper(null);
    setTimeout(() => {
      setIsThemeChanging(false);
    }, 280);
  };

  const showLoader = !isHydrated || isThemeChanging;

  return (
    <div className="theme-bg h-screen w-full bg-black relative overflow-hidden">
      {/* Minimalist Linear/Vercel Aesthetic Loader Overlay */}
      <div
        className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#08080a] transition-opacity duration-300 pointer-events-none ${
          showLoader ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          {/* Minimal Monospace Brand Mark */}
          <span className="text-[11px] font-medium tracking-[0.4em] text-white/80 font-mono uppercase">
            L I V E L Y
          </span>

          {/* 2px Micro Shimmer Bar */}
          <div className="w-24 h-[2px] bg-white/10 rounded-full overflow-hidden relative">
            <div className="absolute inset-y-0 bg-white rounded-full animate-loader-bar" />
          </div>
        </div>
      </div>

      <div className="h-full w-full flex items-center justify-center relative">
        {background}

        {/* Hero View */}
        <HeroView
          shortcuts={shortcuts}
          onStart={() => setActiveStep("dashboard")}
          onOpenSettings={() => setSettingsOpen(true)}
          isVisible={activeStep === "hero"}
        />

        {/* Clock */}
        <Clock isDashboard={activeStep === "dashboard"} />

        {/* Taskbar */}
        <div
          className={`absolute top-2.5 left-1/2 -translate-x-1/2 awwwards-motion z-30 ${
            activeStep === "dashboard"
              ? "translate-y-0 opacity-100 scale-100 pointer-events-auto"
              : "-translate-y-12 opacity-0 scale-95 pointer-events-none"
          }`}
        >
          <Taskbar
            shortcuts={shortcuts}
            onAddShortcut={addShortcut}
            onRemoveShortcut={removeShortcut}
            onUpdateShortcut={updateShortcut}
            onReorderShortcuts={reorderShortcuts}
          />
        </div>

        {/* Dashboard Grid */}
        <div
          className={`absolute inset-0 z-20 awwwards-motion pointer-events-none ${
            activeStep === "dashboard" ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <DashboardGrid
            showTimer={showTimer}
            showTodo={showTodo}
            showStreakGrid={showStreakGrid}
            showSongPlayer={showSongPlayer}
            showWaterReminder={showWaterReminder}
            showImportantTabs={showImportantTabs}
            showTimeBoxing={showTimeBoxing}
            importantTabsConfig={importantTabsConfig}
            timeBoxingGroups={timeBoxingGroups}
            onTimeBoxingGroupsChange={setTimeBoxingGroups}
            songPlaylistUrl={songPlaylistUrl}
            songAutoPlay={songAutoPlay}
            songCustomVideo={songCustomVideo}
            lofiStations={lofiStations}
            waterGoalMl={waterGoalMl}
            streakDataSource={streakDataSource}
            githubUsername={githubUsername}
          />
        </div>

        {/* Top Right Controls */}
        <div className="absolute top-2.5 right-5 flex items-center gap-3 pointer-events-auto z-30">
          <div
            className={`awwwards-motion ${
              activeStep === "dashboard"
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-50 pointer-events-none w-0 overflow-hidden"
            }`}
          >
            <button
              type="button"
              onClick={() => setActiveStep("hero")}
              className="figma-glass-card h-[6.5vh] w-[6.5vh] min-h-[42px] min-w-[42px] rounded-full flex items-center justify-center text-white cursor-pointer transition-all"
              aria-label="Back to Hero screen"
            >
              <i className="ri-close-line text-[2.8vh] relative z-10" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="figma-glass-card h-[6.5vh] w-[6.5vh] min-h-[42px] min-w-[42px] rounded-full flex items-center justify-center text-white cursor-pointer transition-all"
            aria-label="Open settings"
          >
            <i className="ri-settings-3-fill text-[2.8vh] relative z-10" />
          </button>
        </div>

        {/* Full-screen Settings Page */}
        <SettingsPage
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          // UI Theme & Base Font
          uiTheme={uiTheme}
          onUiThemeChange={handleUiThemeChange}
          baseFont={baseFont}
          onBaseFontChange={setBaseFont}
          baseFontSize={baseFontSize}
          onBaseFontSizeChange={setBaseFontSize}
          // Wallpaper
          wallpaper={wallpaper}
          onWallpaperPick={handleWallpaperChange}
          onWallpaperReset={handleWallpaperResetChange}
          // Theme
          themeColor={themeColor}
          themeColorsMap={themeColorsMap}
          onThemeChange={handleThemeColorChange}
          themeTextColorIndex={themeTextColorIndex}
          onThemeTextColorChange={setThemeTextColorIndex}
          // Shortcuts
          shortcuts={shortcuts}
          onShortcutsChange={setShortcuts}
          onShortcutUpdate={updateShortcut}
          onShortcutRemove={removeShortcut}
          onShortcutAdd={addShortcut}
          onShortcutIconPick={handleShortcutIconPick}
          // Focus Timer
          showTimer={showTimer}
          onShowTimerChange={setShowTimer}
          focusNotifEnabled={focusNotifEnabled}
          onFocusNotifChange={setFocusNotifEnabled}
          focusEndRingtone={focusEndRingtone}
          onFocusEndRingtoneChange={setFocusEndRingtone}
          restEndRingtone={restEndRingtone}
          onRestEndRingtoneChange={setRestEndRingtone}
          // Water Reminder
          showWaterReminder={showWaterReminder}
          onShowWaterReminderChange={setShowWaterReminder}
          waterGoalMl={waterGoalMl}
          onWaterGoalChange={setWaterGoalMl}
          waterNotifEnabled={waterNotifEnabled}
          onWaterNotifChange={setWaterNotifEnabled}
          waterRingtone={waterRingtone}
          onWaterRingtoneChange={setWaterRingtone}
          // Song Player
          showSongPlayer={showSongPlayer}
          onShowSongPlayerChange={setShowSongPlayer}
          songPlaylistUrl={songPlaylistUrl}
          onSongPlaylistUrlChange={setSongPlaylistUrl}
          songAutoPlay={songAutoPlay}
          onSongAutoPlayChange={setSongAutoPlay}
          songCustomVideo={songCustomVideo}
          onSongCustomVideoChange={setSongCustomVideo}
          lofiStations={lofiStations}
          onLofiStationsChange={setLofiStations}
          // Notepad
          showTodo={showTodo}
          onShowTodoChange={setShowTodo}
          // Important Tabs
          showImportantTabs={showImportantTabs}
          onShowImportantTabsChange={setShowImportantTabs}
          importantTabsConfig={importantTabsConfig}
          onImportantTabsConfigChange={setImportantTabsConfig}
          // TimeBoxing
          showTimeBoxing={showTimeBoxing}
          onShowTimeBoxingChange={setShowTimeBoxing}
          timeBoxingGroups={timeBoxingGroups}
          onTimeBoxingGroupsChange={setTimeBoxingGroups}
          // Streak
          showStreakGrid={showStreakGrid}
          onShowStreakGridChange={setShowStreakGrid}
          streakDataSource={streakDataSource}
          onStreakDataSourceChange={setStreakDataSource}
          githubUsername={githubUsername}
          onGithubUsernameChange={setGithubUsername}
        />
      </div>
    </div>
  );
};

export default App;
