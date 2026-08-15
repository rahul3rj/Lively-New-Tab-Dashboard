import { useEffect, useRef, useState } from "react";
import { storageGetMultiple, storageSet } from "../utils/storage.js";
import { STORAGE_KEY_UI_THEME } from "../themes/index.js";

export const STORAGE = {
  wallpaper: "settings_wallpaper_v1",
  showTimer: "settings_show_timer_v1",
  showTodo: "settings_show_todo_v1",
  showStreakGrid: "settings_show_streak_grid_v1",
  streakDataSource: "settings_streak_data_source_v1",
  githubUsername: "settings_github_username_v1",
  showSongPlayer: "settings_show_song_player_v1",
  themeColor: "settings_theme_color_v1",
  shortcuts: "settings_shortcuts_v1",
  activeStep: "settings_active_step_v1",
  showWaterReminder: "settings_show_water_v1",
  showImportantTabs: "settings_show_imp_tabs_v1",
  showTimeBoxing: "settings_show_timebox_v1",
  focusNotifEnabled: "settings_focus_notif_v1",
  focusEndRingtone: "settings_focus_ringtone_v1",
  restEndRingtone: "settings_rest_ringtone_v1",
  waterGoalMl: "settings_water_goal_v1",
  waterNotifEnabled: "settings_water_notif_v1",
  waterRingtone: "settings_water_ringtone_v1",
  songPlaylistUrl: "settings_song_playlist_v1",
  songAutoPlay: "settings_song_autoplay_v1",
  songCustomVideo: "settings_song_custom_video_v1",
  lofiStations: "settings_lofi_stations_v1",
  importantTabsConfig: "settings_imp_tabs_config_v1",
  timeBoxingGroups: "settings_timebox_groups_v2",
  themeTextColorIndex: "settings_theme_text_color_idx_v1",
  timeboxingLastResetDate: "settings_timebox_last_reset_utc_v1",
  uiTheme: STORAGE_KEY_UI_THEME,
  baseFont: "settings_base_font_v1",
  baseFontSize: "settings_base_font_size_v1",
  themeColorsMap: "settings_theme_colors_map_v1",
};

export const getTodayUtcDate = () => new Date().toISOString().slice(0, 10);

export const DEFAULT_SHORTCUTS = [
  { id: "gemini", title: "Gemini", url: "https://gemini.google.com", iconClass: "ri-gemini-fill" },
  { id: "claude", title: "Claude", url: "https://claude.ai", iconClass: "ri-claude-fill" },
  { id: "copilot", title: "Copilot", url: "https://copilot.microsoft.com", iconClass: "ri-copilot-fill" },
  { id: "openai", title: "OpenAI", url: "https://chat.openai.com", iconClass: "ri-openai-fill" },
  { id: "perplexity", title: "Perplexity", url: "https://perplexity.ai", iconClass: "ri-perplexity-fill" },
  { id: "deepseek", title: "DeepSeek", url: "https://chat.deepseek.com/", iconClass: "ri-deepseek-fill" },
  { id: "higgsfield", title: "Higgsfield AI", url: "https://higgsfield.ai", iconUrl: "https://higgsfield.ai/favicon.ico" },
];

export const DEFAULT_IMPORTANT_TABS = [
  { id: "tab-1", title: "Study", iconClass: "ri-book-open-line", links: [] },
  { id: "tab-2", title: "AI Engineering", iconClass: "ri-gemini-fill", links: [] },
  { id: "tab-3", title: "DSA (LeetCode & CP)", iconClass: "ri-code-s-slash-line", links: [] },
  { id: "tab-4", title: "News", iconClass: "ri-newspaper-line", links: [] },
];

export const DEFAULT_TIMEBOX_GROUPS = [
  {
    id: "brain-stretching",
    title: "Brain Stretching",
    iconClass: "ri-brain-line",
    time: "8:00 am",
    streak: 0,
    subtasks: [
      { id: "bs-1", text: "Morning Meditation", done: false },
      { id: "bs-2", text: "Read 10 Pages", done: false },
      { id: "bs-3", text: "Solve A Puzzle", done: false },
      { id: "bs-4", text: "Plan The Day", done: false },
    ],
  },
  {
    id: "exercise",
    title: "Exercise",
    iconClass: "ri-run-line",
    time: "8:45 am",
    streak: 0,
    subtasks: [
      { id: "ex-1", text: "Warm Up & Stretch", done: false },
      { id: "ex-2", text: "Push Ups 3 Sets", done: false },
      { id: "ex-3", text: "30 Min Cardio", done: false },
    ],
  },
  {
    id: "leetcode",
    title: "LeetCode Problem",
    iconClass: "ri-code-s-slash-line",
    time: "9:00 am",
    streak: 0,
    subtasks: [
      { id: "lc-1", text: "Solve Problem", done: false },
      { id: "lc-2", text: "Push Code To Github", done: false },
      { id: "lc-3", text: "Analyse Optimal Solution", done: false },
    ],
  },
  {
    id: "project",
    title: "Project",
    iconClass: "ri-briefcase-line",
    time: "11:00 am",
    streak: 0,
    subtasks: [
      { id: "pj-1", text: "Design New Component", done: false },
      { id: "pj-2", text: "Fix Pending Bugs", done: false },
      { id: "pj-3", text: "Deploy Latest Build", done: false },
    ],
  },
];

export const DEFAULT_LOFI_STATIONS = [
  {
    id: "lofi-zeno-lounge",
    name: "Lofi Study Lounge 24/7",
    provider: "Zeno Live Stream",
    streamUrl: "https://stream.zeno.fm/f3wvbbqmdg8uv",
    badge: "Lofi Study Lounge",
    gradient: "from-blue-900/60 via-cyan-950/50 to-slate-900/70",
  },
  {
    id: "lofi-laut-fm",
    name: "Lofi Hip Hop Radio 24/7",
    provider: "Laut FM Stream",
    streamUrl: "https://lofi.stream.laut.fm/lofi",
    badge: "24/7 Lofi Hip Hop",
    gradient: "from-purple-900/60 via-indigo-900/50 to-slate-900/70",
  },
  {
    id: "chillhop-beats",
    name: "Chillhop Radio — Jazzy & Lofi Beats",
    provider: "Flux FM Stream",
    streamUrl: "https://streams.fluxfm.de/chillhop/mp3-320/stream.fluxfm.de/",
    badge: "Chillhop Beats",
    gradient: "from-amber-900/60 via-orange-950/50 to-slate-950/70",
  },
  {
    id: "ambient-sleep-lofi",
    name: "Cozy Ambient Rain Lofi",
    provider: "Zeno Live Stream",
    streamUrl: "https://stream.zeno.fm/0r0xa792kwzuv",
    badge: "Ambient Rain Lofi",
    gradient: "from-emerald-950/60 via-slate-900/60 to-purple-950/70",
  },
  {
    id: "coffee-jazz-lofi",
    name: "Coffee Shop & Jazz Lofi Radio",
    provider: "Zeno Live Stream",
    streamUrl: "https://stream.zeno.fm/7c8bh802kwzuv",
    badge: "Coffee & Jazz Lofi",
    gradient: "from-yellow-950/60 via-amber-900/50 to-stone-900/70",
  },
];

export const DEFAULT_THEME_PALETTES = {
  default: ["#CBD5E1", "#64748B", "#334155", "#0F172A"],
  manga: ["#CBD5E1", "#64748B", "#334155", "#0F172A"],
  cyberpunk: ["#FF0055", "#00F0FF", "#FFE600", "#120024"],
  pixel: ["#00FF66", "#009933", "#003311", "#051A0A"],
};

export const useDashboardSettings = () => {
  const [activeStep, setActiveStep] = useState("hero");

  const [wallpaper, setWallpaper] = useState(null);
  const [showTimer, setShowTimer] = useState(true);
  const [showTodo, setShowTodo] = useState(true);
  const [showStreakGrid, setShowStreakGrid] = useState(true);
  const [streakDataSource, setStreakDataSource] = useState("local");
  const [githubUsername, setGithubUsername] = useState("");
  const [showSongPlayer, setShowSongPlayer] = useState(true);
  const [themeColor, setThemeColor] = useState(DEFAULT_THEME_PALETTES.default);
  const [themeColorsMap, setThemeColorsMap] = useState(DEFAULT_THEME_PALETTES);
  const [themeTextColorIndex, setThemeTextColorIndex] = useState(0);
  const [shortcuts, setShortcuts] = useState(DEFAULT_SHORTCUTS);

  const [showWaterReminder, setShowWaterReminder] = useState(true);
  const [showImportantTabs, setShowImportantTabs] = useState(true);
  const [showTimeBoxing, setShowTimeBoxing] = useState(true);

  const [focusNotifEnabled, setFocusNotifEnabled] = useState(false);
  const [focusEndRingtone, setFocusEndRingtone] = useState("beep");
  const [restEndRingtone, setRestEndRingtone] = useState("beep");

  const [waterGoalMl, setWaterGoalMl] = useState(4500);
  const [waterNotifEnabled, setWaterNotifEnabled] = useState(false);
  const [waterRingtone, setWaterRingtone] = useState("beep");

  const [songPlaylistUrl, setSongPlaylistUrl] = useState("");
  const [songAutoPlay, setSongAutoPlay] = useState(false);
  const [songCustomVideo, setSongCustomVideo] = useState(null);
  const [lofiStations, setLofiStations] = useState(DEFAULT_LOFI_STATIONS);

  const [importantTabsConfig, setImportantTabsConfig] = useState(DEFAULT_IMPORTANT_TABS);
  const [timeBoxingGroups, setTimeBoxingGroups] = useState(DEFAULT_TIMEBOX_GROUPS);
  const [timeboxingLastResetDate, setTimeboxingLastResetDate] = useState(null);
  const [uiTheme, setUiTheme] = useState("default");
  const [baseFont, setBaseFont] = useState("Gilroy");
  const [baseFontSize, setBaseFontSize] = useState(16);

  const [isHydrated, setIsHydrated] = useState(false);

  const hydratedRef = useRef(false);
  const lastResetDateRef = useRef(null);

  /* ── Hydration ── */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const keys = Object.values(STORAGE);
        const data = await storageGetMultiple(keys);

        if (cancelled) return;

        const storedWallpaper = data[STORAGE.wallpaper];
        const storedShowTimer = data[STORAGE.showTimer];
        const storedShowTodo = data[STORAGE.showTodo];
        const storedShowStreakGrid = data[STORAGE.showStreakGrid];
        const storedShowSongPlayer = data[STORAGE.showSongPlayer];
        const storedThemeColor = data[STORAGE.themeColor];
        const storedShortcuts = data[STORAGE.shortcuts];
        const storedActiveStepObj = data[STORAGE.activeStep];
        const storedShowWater = data[STORAGE.showWaterReminder];
        const storedShowImpTabs = data[STORAGE.showImportantTabs];
        const storedShowTimeBox = data[STORAGE.showTimeBoxing];
        const storedFocusNotif = data[STORAGE.focusNotifEnabled];
        const storedFocusRing = data[STORAGE.focusEndRingtone];
        const storedRestRing = data[STORAGE.restEndRingtone];
        const storedWaterGoal = data[STORAGE.waterGoalMl];
        const storedWaterNotif = data[STORAGE.waterNotifEnabled];
        const storedWaterRing = data[STORAGE.waterRingtone];
        const storedPlaylist = data[STORAGE.songPlaylistUrl];
        const storedAutoPlay = data[STORAGE.songAutoPlay];
        const storedCustomVideo = data[STORAGE.songCustomVideo];
        const storedLofiStations = data[STORAGE.lofiStations];
        const storedImpTabsCfg = data[STORAGE.importantTabsConfig];
        const storedStreakDataSource = data[STORAGE.streakDataSource];
        const storedGithubUsername = data[STORAGE.githubUsername];
        let storedTimeboxGroups = data[STORAGE.timeBoxingGroups];
        const storedThemeTextIdx = data[STORAGE.themeTextColorIndex];
        const storedResetDate = data[STORAGE.timeboxingLastResetDate];
        const storedUiTheme = data[STORAGE.uiTheme];
        const storedBaseFont = data[STORAGE.baseFont];
        const storedBaseFontSize = data[STORAGE.baseFontSize];

        const todayUtc = getTodayUtcDate();

        if (Array.isArray(storedTimeboxGroups)) {
          if (storedResetDate && storedResetDate !== todayUtc) {
            storedTimeboxGroups = storedTimeboxGroups.map((group) => {
              const isCompleted =
                group.subtasks?.length > 0 && group.subtasks.every((s) => s.done);
              return {
                ...group,
                streak: isCompleted ? (group.streak || 0) + 1 : (group.streak || 0),
                subtasks: (group.subtasks || []).map((s) => ({ ...s, done: false })),
              };
            });
            storageSet(STORAGE.timeBoxingGroups, storedTimeboxGroups);
            storageSet(STORAGE.timeboxingLastResetDate, todayUtc);
          } else if (!storedResetDate) {
            storageSet(STORAGE.timeboxingLastResetDate, todayUtc);
          }
        }

        lastResetDateRef.current = todayUtc;
        setTimeboxingLastResetDate(todayUtc);

        if (storedWallpaper && typeof storedWallpaper === "object") setWallpaper(storedWallpaper);
        if (typeof storedShowTimer === "boolean") setShowTimer(storedShowTimer);
        if (typeof storedShowTodo === "boolean") setShowTodo(storedShowTodo);
        if (typeof storedShowStreakGrid === "boolean") setShowStreakGrid(storedShowStreakGrid);
        if (storedStreakDataSource === "local" || storedStreakDataSource === "github") setStreakDataSource(storedStreakDataSource);
        if (typeof storedGithubUsername === "string") setGithubUsername(storedGithubUsername);
        if (typeof storedShowSongPlayer === "boolean") setShowSongPlayer(storedShowSongPlayer);
        const storedThemeColorsMap = data[STORAGE.themeColorsMap];
        let activeThemeMap = { ...DEFAULT_THEME_PALETTES };
        if (storedThemeColorsMap && typeof storedThemeColorsMap === "object") {
          activeThemeMap = { ...DEFAULT_THEME_PALETTES, ...storedThemeColorsMap };
        } else if (storedThemeColor) {
          if (Array.isArray(storedThemeColor) && storedThemeColor.length === 4) {
            activeThemeMap.default = storedThemeColor;
          } else if (typeof storedThemeColor === "string" && storedThemeColor.trim().startsWith("#")) {
            const c = storedThemeColor.trim();
            activeThemeMap.default = [c, c, c, c];
          }
        }
        setThemeColorsMap(activeThemeMap);

        const currentUiTheme = (typeof storedUiTheme === "string" && ["default","manga","cyberpunk","pixel"].includes(storedUiTheme)) ? storedUiTheme : "default";
        const activePalette = activeThemeMap[currentUiTheme] || DEFAULT_THEME_PALETTES[currentUiTheme] || DEFAULT_THEME_PALETTES.default;
        setThemeColor(activePalette);

        if (typeof storedThemeTextIdx === "number" && storedThemeTextIdx >= 0 && storedThemeTextIdx <= 3) {
          setThemeTextColorIndex(storedThemeTextIdx);
        }
        if (Array.isArray(storedShortcuts) && storedShortcuts.length > 0) setShortcuts(storedShortcuts);

        if (storedActiveStepObj &&
          typeof storedActiveStepObj === "object" &&
          storedActiveStepObj.dateUtc === getTodayUtcDate() &&
          (storedActiveStepObj.step === "dashboard" || storedActiveStepObj.step === "hero")
        ) {
          setActiveStep(storedActiveStepObj.step);
        } else {
          setActiveStep("hero");
        }

        if (typeof storedShowWater === "boolean") setShowWaterReminder(storedShowWater);
        if (typeof storedShowImpTabs === "boolean") setShowImportantTabs(storedShowImpTabs);
        if (typeof storedShowTimeBox === "boolean") setShowTimeBoxing(storedShowTimeBox);
        if (typeof storedFocusNotif === "boolean") setFocusNotifEnabled(storedFocusNotif);
        if (typeof storedFocusRing === "string") setFocusEndRingtone(storedFocusRing);
        if (typeof storedRestRing === "string") setRestEndRingtone(storedRestRing);
        if (typeof storedWaterGoal === "number" && storedWaterGoal > 0) setWaterGoalMl(storedWaterGoal);
        if (typeof storedWaterNotif === "boolean") setWaterNotifEnabled(storedWaterNotif);
        if (typeof storedWaterRing === "string") setWaterRingtone(storedWaterRing);
        if (typeof storedPlaylist === "string") setSongPlaylistUrl(storedPlaylist);
        if (typeof storedAutoPlay === "boolean") setSongAutoPlay(storedAutoPlay);
        if (storedCustomVideo) setSongCustomVideo(storedCustomVideo);
        if (Array.isArray(storedLofiStations) && storedLofiStations.length > 0) setLofiStations(storedLofiStations);
        if (Array.isArray(storedTimeboxGroups) && storedTimeboxGroups.length > 0) setTimeBoxingGroups(storedTimeboxGroups);
        let parsedImpTabs = storedImpTabsCfg;
        if (typeof storedImpTabsCfg === "string") {
          try { parsedImpTabs = JSON.parse(storedImpTabsCfg); } catch { parsedImpTabs = null; }
        }
        if (Array.isArray(parsedImpTabs)) setImportantTabsConfig(parsedImpTabs);
        if (typeof storedUiTheme === "string" && ["default","manga","cyberpunk","pixel"].includes(storedUiTheme)) setUiTheme(storedUiTheme);
        if (typeof storedBaseFont === "string" && storedBaseFont.trim()) setBaseFont(storedBaseFont);
        if (typeof storedBaseFontSize === "number" && storedBaseFontSize >= 12 && storedBaseFontSize <= 24) setBaseFontSize(storedBaseFontSize);

        if (!cancelled) {
          hydratedRef.current = true;
          setIsHydrated(true);
        }
      } catch (err) {
        console.error("App hydration error:", err);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  /* ── Persistence effects ── */
  useEffect(() => { if (!hydratedRef.current) return; storageSet(STORAGE.wallpaper, wallpaper); }, [wallpaper]);
  useEffect(() => { if (!hydratedRef.current) return; storageSet(STORAGE.showTimer, showTimer); }, [showTimer]);
  useEffect(() => { if (!hydratedRef.current) return; storageSet(STORAGE.showTodo, showTodo); }, [showTodo]);
  useEffect(() => { if (!hydratedRef.current) return; storageSet(STORAGE.showStreakGrid, showStreakGrid); }, [showStreakGrid]);
  useEffect(() => { if (!hydratedRef.current) return; storageSet(STORAGE.streakDataSource, streakDataSource); }, [streakDataSource]);
  useEffect(() => { if (!hydratedRef.current) return; storageSet(STORAGE.githubUsername, githubUsername); }, [githubUsername]);
  useEffect(() => { if (!hydratedRef.current) return; storageSet(STORAGE.showSongPlayer, showSongPlayer); }, [showSongPlayer]);
  useEffect(() => { if (!hydratedRef.current) return; storageSet(STORAGE.themeColor, themeColor); }, [themeColor]);
  useEffect(() => { if (!hydratedRef.current) return; storageSet(STORAGE.themeColorsMap, themeColorsMap); }, [themeColorsMap]);
  useEffect(() => { if (!hydratedRef.current) return; storageSet(STORAGE.shortcuts, shortcuts); }, [shortcuts]);
  useEffect(() => {
    if (!hydratedRef.current) return;
    storageSet(STORAGE.activeStep, { step: activeStep, dateUtc: getTodayUtcDate() });
  }, [activeStep]);
  useEffect(() => { if (!hydratedRef.current) return; storageSet(STORAGE.showWaterReminder, showWaterReminder); }, [showWaterReminder]);
  useEffect(() => { if (!hydratedRef.current) return; storageSet(STORAGE.showImportantTabs, showImportantTabs); }, [showImportantTabs]);
  useEffect(() => { if (!hydratedRef.current) return; storageSet(STORAGE.showTimeBoxing, showTimeBoxing); }, [showTimeBoxing]);
  useEffect(() => { if (!hydratedRef.current) return; storageSet(STORAGE.focusNotifEnabled, focusNotifEnabled); }, [focusNotifEnabled]);
  useEffect(() => { if (!hydratedRef.current) return; storageSet(STORAGE.focusEndRingtone, focusEndRingtone); }, [focusEndRingtone]);
  useEffect(() => { if (!hydratedRef.current) return; storageSet(STORAGE.restEndRingtone, restEndRingtone); }, [restEndRingtone]);
  useEffect(() => { if (!hydratedRef.current) return; storageSet(STORAGE.waterGoalMl, waterGoalMl); }, [waterGoalMl]);
  useEffect(() => { if (!hydratedRef.current) return; storageSet(STORAGE.waterNotifEnabled, waterNotifEnabled); }, [waterNotifEnabled]);
  useEffect(() => { if (!hydratedRef.current) return; storageSet(STORAGE.waterRingtone, waterRingtone); }, [waterRingtone]);
  useEffect(() => { if (!hydratedRef.current) return; storageSet(STORAGE.songPlaylistUrl, songPlaylistUrl); }, [songPlaylistUrl]);
  useEffect(() => { if (!hydratedRef.current) return; storageSet(STORAGE.songAutoPlay, songAutoPlay); }, [songAutoPlay]);
  useEffect(() => { if (!hydratedRef.current) return; storageSet(STORAGE.songCustomVideo, songCustomVideo); }, [songCustomVideo]);
  useEffect(() => { if (!hydratedRef.current) return; storageSet(STORAGE.lofiStations, lofiStations); }, [lofiStations]);
  useEffect(() => { if (!hydratedRef.current) return; storageSet(STORAGE.importantTabsConfig, importantTabsConfig); }, [importantTabsConfig]);
  useEffect(() => { if (!hydratedRef.current) return; storageSet(STORAGE.timeBoxingGroups, timeBoxingGroups); }, [timeBoxingGroups]);
  useEffect(() => { if (!hydratedRef.current) return; storageSet(STORAGE.themeTextColorIndex, themeTextColorIndex); }, [themeTextColorIndex]);
  useEffect(() => { if (!hydratedRef.current) return; storageSet(STORAGE.uiTheme, uiTheme); }, [uiTheme]);
  useEffect(() => { if (!hydratedRef.current) return; storageSet(STORAGE.baseFont, baseFont); }, [baseFont]);
  useEffect(() => { if (!hydratedRef.current) return; storageSet(STORAGE.baseFontSize, baseFontSize); }, [baseFontSize]);

  /* ── Periodic & Focus Check for 00:00 UTC / 5:30 AM IST Daily Reset ── */
  useEffect(() => {
    if (!isHydrated) return;

    const checkAndRunReset = () => {
      const todayUtc = getTodayUtcDate();
      if (lastResetDateRef.current && lastResetDateRef.current !== todayUtc) {
        lastResetDateRef.current = todayUtc;
        setTimeboxingLastResetDate(todayUtc);
        storageSet(STORAGE.timeboxingLastResetDate, todayUtc);

        setTimeBoxingGroups((prevGroups) => {
          if (!Array.isArray(prevGroups)) return prevGroups;
          const resetGroups = prevGroups.map((group) => {
            const isCompleted =
              group.subtasks?.length > 0 && group.subtasks.every((s) => s.done);
            return {
              ...group,
              streak: isCompleted ? (group.streak || 0) + 1 : (group.streak || 0),
              subtasks: (group.subtasks || []).map((s) => ({ ...s, done: false })),
            };
          });
          storageSet(STORAGE.timeBoxingGroups, resetGroups);
          return resetGroups;
        });
      }
    };

    const intervalId = setInterval(checkAndRunReset, 30000);
    const handleFocusOrVisibility = () => {
      if (document.visibilityState === "visible") {
        checkAndRunReset();
      }
    };

    window.addEventListener("visibilitychange", handleFocusOrVisibility);
    window.addEventListener("focus", checkAndRunReset);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("visibilitychange", handleFocusOrVisibility);
      window.removeEventListener("focus", checkAndRunReset);
    };
  }, [isHydrated]);

  return {
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
    timeboxingLastResetDate,
    uiTheme, setUiTheme,
    baseFont, setBaseFont,
    baseFontSize, setBaseFontSize,
    isHydrated,
  };
};
