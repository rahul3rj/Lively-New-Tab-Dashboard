import React, { useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_LOFI_STATIONS } from "../App";
import { UI_THEMES } from "../themes/index.js";

/* ─── Ringtone helpers ─── */
const playBeep = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    /* silent fail */
  }
};

const playCustomRingtone = (dataUrl) => {
  try {
    const audio = new Audio(dataUrl);
    audio.volume = 0.7;
    audio.play().catch(() => {});
  } catch {
    /* silent fail */
  }
};

const previewRingtone = (ringtone) => {
  if (!ringtone || ringtone === "beep") {
    playBeep();
  } else {
    playCustomRingtone(ringtone);
  }
};

/* ─── Constants ─── */
const THEME_PRESETS = [
  { id: "slate", colors: ["#CBD5E1", "#64748B", "#334155", "#0F172A"] },
  { id: "ocean", colors: ["#7DD3FC", "#0EA5E9", "#0369A1", "#0C4A6E"] },
  { id: "emerald", colors: ["#86EFAC", "#22C55E", "#15803D", "#14532D"] },
  { id: "amber", colors: ["#FDE047", "#EAB308", "#A16207", "#713F12"] },
  { id: "orange", colors: ["#FDBA74", "#F97316", "#C2410C", "#7C2D12"] },
  { id: "rose", colors: ["#FCA5A5", "#EF4444", "#B91C1C", "#7F1D1D"] },
  { id: "purple", colors: ["#D8B4FE", "#A855F7", "#6B21A8", "#581C87"] },
  { id: "dark", colors: ["#9CA3AF", "#4B5563", "#1F2937", "#111827"] },
];



const MAX_SHORTCUTS = 7;

const WATER_GOALS = [
  { label: "2.0 L", value: 2000 },
  { label: "3.0 L", value: 3000 },
  { label: "4.5 L", value: 4500 },
  { label: "6.0 L", value: 6000 },
];

const ICON_CATEGORIES = [
  { id: "all", label: "All Icons", icon: "ri-grid-fill" },
  { id: "daily", label: "Daily Life", icon: "ri-sun-line" },
  { id: "fitness", label: "Fitness", icon: "ri-heart-pulse-line" },
  { id: "work", label: "Work & Code", icon: "ri-code-s-slash-line" },
  { id: "study", label: "Study", icon: "ri-book-open-line" },
  { id: "leisure", label: "Hobbies & Leisure", icon: "ri-gamepad-line" },
  { id: "social", label: "Social & Apps", icon: "ri-chat-3-line" },
];

const ICON_GRID_ITEMS = [
  // Daily & Routine
  { class: "ri-hotel-bed-line", category: "daily", keywords: "bed sleep rest night lie down routine" },
  { class: "ri-moon-line", category: "daily", keywords: "moon night sleep rest dark evening" },
  { class: "ri-zzz-line", category: "daily", keywords: "zzz sleep rest nap snooze" },
  { class: "ri-rest-time-line", category: "daily", keywords: "rest time relax break chill" },
  { class: "ri-shower-line", category: "daily", keywords: "shower bath clean hygiene wash bath routine" },
  { class: "ri-coffee-line", category: "daily", keywords: "coffee tea cup drink morning mug cafe espresso" },
  { class: "ri-cup-line", category: "daily", keywords: "cup drink tea beverage matcha" },
  { class: "ri-restaurant-line", category: "daily", keywords: "restaurant food eating meal lunch dinner fork knife" },
  { class: "ri-restaurant-2-line", category: "daily", keywords: "food meal dinner plate dish" },
  { class: "ri-cake-line", category: "daily", keywords: "cake dessert food sweet treat" },
  { class: "ri-apple-line", category: "daily", keywords: "apple fruit healthy food snack diet" },
  { class: "ri-drop-line", category: "daily", keywords: "water hydration drop drink liquid" },
  { class: "ri-t-shirt-line", category: "daily", keywords: "t-shirt clothes laundry dress wear outfit" },
  { class: "ri-alarm-line", category: "daily", keywords: "alarm clock morning wake up timer" },
  { class: "ri-time-line", category: "daily", keywords: "time clock schedule hour duration" },
  { class: "ri-home-2-line", category: "daily", keywords: "home house routine chores cleaning" },
  { class: "ri-home-gear-line", category: "daily", keywords: "home chores maintenance repair fix" },
  { class: "ri-shopping-cart-line", category: "daily", keywords: "shopping cart buy groceries store market" },
  { class: "ri-shopping-bag-line", category: "daily", keywords: "shopping bag store buy retail" },
  { class: "ri-sun-line", category: "daily", keywords: "sun morning day sunshine wake up rise" },

  // Fitness & Health
  { class: "ri-run-line", category: "fitness", keywords: "run running exercise cardio jog track" },
  { class: "ri-walk-line", category: "fitness", keywords: "walk walking steps exercise movement outdoor" },
  { class: "ri-riding-line", category: "fitness", keywords: "bike bicycle riding cycling workout ride" },
  { class: "ri-boxing-line", category: "fitness", keywords: "boxing dumbbell gym workout fight exercise strength heavy" },
  { class: "ri-dribbble-line", category: "fitness", keywords: "exercise sports workout gym fitness" },
  { class: "ri-basketball-line", category: "fitness", keywords: "basketball sports game play court" },
  { class: "ri-football-line", category: "fitness", keywords: "football soccer sports play match" },
  { class: "ri-ping-pong-line", category: "fitness", keywords: "ping pong table tennis sports match" },
  { class: "ri-heart-pulse-line", category: "fitness", keywords: "heart pulse fitness health cardio vitals" },
  { class: "ri-mental-health-line", category: "fitness", keywords: "meditation mental health brain calm relax yoga zen" },
  { class: "ri-capsule-line", category: "fitness", keywords: "medication medicine pills vitamins health supplement" },
  { class: "ri-stethoscope-line", category: "fitness", keywords: "doctor health medical checkup clinic" },
  { class: "ri-shield-cross-line", category: "fitness", keywords: "health care medical safety protection" },
  { class: "ri-footprint-line", category: "fitness", keywords: "footprint steps walking distance health goal" },
  { class: "ri-fire-line", category: "fitness", keywords: "fire burn calories workout streak hot" },

  // Work & Code
  { class: "ri-briefcase-line", category: "work", keywords: "work briefcase job office business corporate" },
  { class: "ri-laptop-line", category: "work", keywords: "laptop computer work coding dev machine" },
  { class: "ri-computer-line", category: "work", keywords: "desktop computer pc work setup screen" },
  { class: "ri-code-s-slash-line", category: "work", keywords: "code coding developer programming leetcode html js" },
  { class: "ri-terminal-box-line", category: "work", keywords: "terminal bash command line shell code cli" },
  { class: "ri-code-box-line", category: "work", keywords: "code box dev script component" },
  { class: "ri-bug-line", category: "work", keywords: "bug debugging fix code error issue" },
  { class: "ri-git-branch-line", category: "work", keywords: "git github branch commit push repo pr" },
  { class: "ri-database-line", category: "work", keywords: "database sql backend server storage data" },
  { class: "ri-cpu-line", category: "work", keywords: "cpu hardware processing tech chip" },
  { class: "ri-robot-2-line", category: "work", keywords: "robot ai bot automation prompt" },
  { class: "ri-gemini-fill", category: "work", keywords: "gemini ai google model assistant prompt" },
  { class: "ri-github-fill", category: "work", keywords: "github code open source repo git" },
  { class: "ri-task-line", category: "work", keywords: "task check todo work done checklist" },
  { class: "ri-file-list-3-line", category: "work", keywords: "file list documents tasks notes specs" },
  { class: "ri-presentation-line", category: "work", keywords: "presentation slides meeting demo pitch decks" },
  { class: "ri-building-line", category: "work", keywords: "building office company workplace headquarters" },

  // Study & Learn
  { class: "ri-book-open-line", category: "study", keywords: "book reading study learn pages literature" },
  { class: "ri-book-read-line", category: "study", keywords: "read reading education study textbook" },
  { class: "ri-graduation-cap-line", category: "study", keywords: "graduation cap college university course school degree" },
  { class: "ri-pencil-ruler-line", category: "study", keywords: "design draw pencil ruler craft geometry" },
  { class: "ri-quill-pen-line", category: "study", keywords: "quill pen writing journal blog article essay" },
  { class: "ri-lightbulb-line", category: "study", keywords: "idea lightbulb solution brain insight spark" },
  { class: "ri-brain-line", category: "study", keywords: "brain thinking focus mind puzzle memory intelligence" },
  { class: "ri-microscope-line", category: "study", keywords: "science research lab study microscope biology" },
  { class: "ri-flask-line", category: "study", keywords: "flask experiment chemistry lab test science" },
  { class: "ri-notion-fill", category: "study", keywords: "notion notes workspace docs study summary" },

  // Hobbies & Leisure
  { class: "ri-gamepad-line", category: "leisure", keywords: "game gaming gamepad arcade play console ps5 steam" },
  { class: "ri-headphone-line", category: "leisure", keywords: "music headphones audio stream podcast listen" },
  { class: "ri-music-2-line", category: "leisure", keywords: "music song lofi audio sound track playlist" },
  { class: "ri-film-line", category: "leisure", keywords: "film movie cinema video watch netflix show" },
  { class: "ri-palette-line", category: "leisure", keywords: "art palette paint drawing creative hobby paint" },
  { class: "ri-camera-line", category: "leisure", keywords: "camera photography photo picture snapshot record" },
  { class: "ri-tv-line", category: "leisure", keywords: "tv television show watch stream anime" },
  { class: "ri-brush-line", category: "leisure", keywords: "brush paint art creative studio canvas" },
  { class: "ri-trophy-line", category: "leisure", keywords: "trophy winner achievement reward streak goal cup" },
  { class: "ri-star-line", category: "leisure", keywords: "star favorite priority bookmark highlight key" },
  { class: "ri-heart-line", category: "leisure", keywords: "heart love care passion favorite like" },
  { class: "ri-youtube-fill", category: "leisure", keywords: "youtube video stream watch music channel" },
  { class: "ri-wallet-line", category: "leisure", keywords: "wallet money finance budget gold savings" },

  // Social & Apps
  { class: "ri-chat-3-line", category: "social", keywords: "chat message talk communication social discuss" },
  { class: "ri-mail-line", category: "social", keywords: "mail email message inbox contact newsletter" },
  { class: "ri-discord-fill", category: "social", keywords: "discord chat community voice server hang out" },
  { class: "ri-twitter-x-fill", category: "social", keywords: "twitter x social news feed posts" },
  { class: "ri-instagram-line", category: "social", keywords: "instagram social media photos story reels" },
  { class: "ri-linkedin-fill", category: "social", keywords: "linkedin network professional jobs career" },
  { class: "ri-reddit-line", category: "social", keywords: "reddit social forum community posts threads" },
  { class: "ri-globe-line", category: "social", keywords: "web globe internet online browsing world" },
  { class: "ri-map-pin-line", category: "social", keywords: "map pin location travel trip spot vacation" },
  { class: "ri-team-line", category: "social", keywords: "team group people friends meeting hang" },
  { class: "ri-user-smile-line", category: "social", keywords: "user profile me person avatar happy" },
];

const NAV_TABS = [
  { id: "appearance", label: "Appearance & Theme", icon: "ri-palette-line" },
  { id: "focus", label: "Focus & Reminders", icon: "ri-timer-line" },
  { id: "songPlayer", label: "Song Player Settings", icon: "ri-music-2-line" },
  { id: "taskbar", label: "Taskbar Shortcuts", icon: "ri-external-link-line" },
  { id: "tabs", label: "Important Tabs", icon: "ri-bookmark-3-line" },
  { id: "timebox", label: "Time Boxing", icon: "ri-time-line" },
  { id: "widgets", label: "Widget Visibility", icon: "ri-layout-grid-line" },
];

const makeId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function")
    return crypto.randomUUID();
  return String(Date.now() + Math.random());
};

/* ─── Figma Glass Matching UI Primitives ─── */

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative h-6 w-11 rounded-full transition-all duration-300 flex items-center px-0.5 shrink-0 cursor-pointer border border-white/15 ${
      checked ? "bg-[color:var(--theme)] shadow-md" : "bg-black/50 border-white/10"
    }`}
    aria-pressed={checked}
  >
    <span
      className={`h-5 w-5 rounded-full transition-transform duration-300 shadow-md ${
        checked ? "translate-x-5 bg-white" : "translate-x-0 bg-white/70"
      }`}
    />
  </button>
);

const InputField = ({ value, onChange, placeholder, className = "", type = "text" }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full h-10 rounded-2xl bg-black/40 border border-white/15 focus:border-white/40 px-3.5 text-xs text-white placeholder:text-white/30 outline-none transition-all font-gilroy-medium ${className}`}
  />
);

const Pill = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-1.5 rounded-full text-xs font-gilroy-medium transition-all active:scale-95 cursor-pointer border ${
      active
        ? "bg-[color:var(--theme)] text-white font-gilroy-bold border-white/40 shadow-md scale-105"
        : "bg-[color:var(--theme)]/20 hover:bg-[color:var(--theme)]/35 text-white/80 border-white/15"
    }`}
  >
    {children}
  </button>
);

const CardContainer = ({ title, description, children, action }) => (
  <div className="card-glass-bg bg-black/30 border border-white/10 rounded-[24px] p-6 flex flex-col gap-5 relative text-white font-gilroy-medium shadow-xl backdrop-blur-sm">
    <div className="flex items-start justify-between gap-4 z-10 relative">
      <div>
        <h3 className="text-white text-base font-gilroy-bold">{title}</h3>
        {description && <p className="text-white/50 text-xs mt-1 font-gilroy-medium">{description}</p>}
      </div>
      {action}
    </div>
    <div className="z-10 relative">{children}</div>
  </div>
);

/* ─── Ringtone Selector Component ─── */
const RingtoneRow = ({ label, value, onChange }) => {
  const fileRef = useRef(null);
  const hasCustom = value && value !== "beep";

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-white/80 text-xs font-gilroy-medium">{label}</span>
      <div className="flex items-center gap-2">
        <Pill active={!value || value === "beep"} onClick={() => onChange("beep")}>
          Default Beep
        </Pill>
        <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={handleFile} />
        <Pill active={hasCustom} onClick={() => fileRef.current?.click()}>
          {hasCustom ? "Custom Tone ✓" : "Upload Tone"}
        </Pill>
        <button
          type="button"
          onClick={() => previewRingtone(value)}
          className="h-8 w-8 rounded-full bg-[color:var(--theme)]/25 hover:bg-[color:var(--theme)]/45 border border-white/20 flex items-center justify-center text-white/90 hover:text-white transition-all active:scale-95 cursor-pointer shrink-0"
          title="Test Sound"
        >
          <i className="ri-volume-up-line text-sm relative z-10" />
        </button>
      </div>
    </div>
  );
};

/* ─── Custom Time Dropdown Popover ─── */
const TimeDropdownPopover = ({ current, onSelect, onClose, uiTheme = "default" }) => {
  const popoverRef = useRef(null);

  const safeCurrent = useMemo(() => String(current || "9:00 am").trim(), [current]);

  const parseInit = (tStr) => {
    const match = /^(\d{1,2}):(\d{2})\s*([ap]m)$/i.exec(String(tStr || "").trim());
    if (match) {
      let h = parseInt(match[1], 10);
      if (h < 1 || h > 12) h = 9;
      let m = parseInt(match[2], 10);
      if (isNaN(m) || m < 0 || m > 59) m = 0;
      const p = match[3].toUpperCase();
      return { hour: h, minute: m, period: p };
    }
    return { hour: 9, minute: 0, period: "AM" };
  };

  const [timeState, setTimeState] = useState(() => parseInit(safeCurrent));

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    };
    const timerId = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 50);
    return () => {
      clearTimeout(timerId);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [onClose]);

  const handleApply = () => {
    const formatted = `${timeState.hour}:${String(timeState.minute).padStart(2, "0")} ${timeState.period.toLowerCase()}`;
    onSelect(formatted);
  };

  const isManga = uiTheme === "manga";

  return (
    <div
      ref={popoverRef}
      onClick={(e) => e.stopPropagation()}
      style={{
        borderColor: isManga ? "#000000" : "color-mix(in srgb, var(--theme-1, var(--theme)) 45%, transparent)",
      }}
      className={`absolute right-0 top-full mt-2 z-[9999] w-60 rounded-2xl p-3.5 flex flex-col gap-3 shadow-2xl animate-fade-in border ${
        isManga
          ? "bg-white text-black shadow-[4px_4px_0px_#000]"
          : "bg-[#121216]/95 backdrop-blur-2xl text-white shadow-[0_0_20px_rgba(0,0,0,0.6)]"
      }`}
    >
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label
            style={{ color: isManga ? "#000000" : "var(--theme-2, var(--theme-1, var(--theme)))" }}
            className="text-[10px] uppercase tracking-wider block mb-1 font-gilroy-bold opacity-90"
          >
            Hour
          </label>
          <select
            value={timeState.hour}
            onChange={(e) => setTimeState({ ...timeState, hour: parseInt(e.target.value, 10) })}
            style={{
              borderColor: isManga ? "#000000" : "color-mix(in srgb, var(--theme-1, var(--theme)) 35%, transparent)",
            }}
            className="w-full py-2 px-2 rounded-xl bg-black/60 border text-xs font-gilroy-bold text-white focus:outline-none cursor-pointer hover:brightness-125 transition-all"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
              <option key={h} value={h} className="bg-[#18181b] text-white">
                {h}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            style={{ color: isManga ? "#000000" : "var(--theme-2, var(--theme-1, var(--theme)))" }}
            className="text-[10px] uppercase tracking-wider block mb-1 font-gilroy-bold opacity-90"
          >
            Minute
          </label>
          <select
            value={timeState.minute}
            onChange={(e) => setTimeState({ ...timeState, minute: parseInt(e.target.value, 10) })}
            style={{
              borderColor: isManga ? "#000000" : "color-mix(in srgb, var(--theme-1, var(--theme)) 35%, transparent)",
            }}
            className="w-full py-2 px-2 rounded-xl bg-black/60 border text-xs font-gilroy-bold text-white focus:outline-none cursor-pointer hover:brightness-125 transition-all"
          >
            {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
              <option key={m} value={m} className="bg-[#18181b] text-white">
                :{String(m).padStart(2, "0")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            style={{ color: isManga ? "#000000" : "var(--theme-2, var(--theme-1, var(--theme)))" }}
            className="text-[10px] uppercase tracking-wider block mb-1 font-gilroy-bold opacity-90"
          >
            Period
          </label>
          <select
            value={timeState.period}
            onChange={(e) => setTimeState({ ...timeState, period: e.target.value })}
            style={{
              borderColor: isManga ? "#000000" : "color-mix(in srgb, var(--theme-1, var(--theme)) 35%, transparent)",
            }}
            className="w-full py-2 px-2 rounded-xl bg-black/60 border text-xs font-gilroy-bold text-white focus:outline-none cursor-pointer hover:brightness-125 transition-all"
          >
            <option value="AM" className="bg-[#18181b] text-white">AM</option>
            <option value="PM" className="bg-[#18181b] text-white">PM</option>
          </select>
        </div>
      </div>

      <button
        type="button"
        onClick={handleApply}
        style={{
          backgroundColor: isManga ? "#000000" : "var(--theme-1, var(--theme))",
          borderColor: isManga ? "#000000" : "var(--theme-1, var(--theme))",
        }}
        className="w-full py-2.5 rounded-xl hover:brightness-110 border text-white font-gilroy-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
      >
        Apply Time ({timeState.hour}:{String(timeState.minute).padStart(2, "0")} {timeState.period})
      </button>
    </div>
  );
};

/* ─── Inline Icon Dropdown Popover ─── */
const IconDropdownPopover = ({ current, onSelect, onClose, uiTheme = "default" }) => {
  const popoverRef = useRef(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    };
    const timerId = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 50);
    return () => {
      clearTimeout(timerId);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [onClose]);

  const filteredItems = useMemo(() => {
    return ICON_GRID_ITEMS.filter((item) => {
      const matchesCategory = activeCategory === "all" || item.category === activeCategory;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.class.toLowerCase().includes(q) ||
        (item.keywords && item.keywords.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  const isManga = uiTheme === "manga";

  return (
    <div
      ref={popoverRef}
      onClick={(e) => e.stopPropagation()}
      style={{
        borderColor: isManga ? "#000000" : "color-mix(in srgb, var(--theme-1, var(--theme)) 45%, transparent)",
      }}
      className={`absolute left-0 top-full mt-2 z-[9999] w-72 rounded-2xl p-3 flex flex-col gap-2.5 shadow-2xl animate-fade-in border ${
        isManga
          ? "bg-white text-black shadow-[4px_4px_0px_#000]"
          : "bg-[#121216]/95 backdrop-blur-2xl text-white shadow-[0_0_20px_rgba(0,0,0,0.6)]"
      }`}
    >
      {/* Search Input */}
      <div className="relative w-full">
        <i
          style={{ color: isManga ? "#000000" : "var(--theme-1, var(--theme))" }}
          className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-xs"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search icons (bed, exercise, coffee)..."
          style={{
            borderColor: isManga ? "#000000" : "color-mix(in srgb, var(--theme-1, var(--theme)) 35%, transparent)",
          }}
          className="w-full h-8.5 pl-8.5 pr-3 rounded-xl bg-black/60 border text-xs text-white placeholder:text-white/40 focus:outline-none transition-all font-gilroy-medium"
        />
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-0.5 shrink-0">
        {ICON_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              style={{
                backgroundColor: isActive
                  ? isManga ? "#000000" : "var(--theme-1, var(--theme))"
                  : "transparent",
                borderColor: isManga
                  ? "#000000"
                  : isActive
                  ? "var(--theme-1, var(--theme))"
                  : "color-mix(in srgb, var(--theme-1, var(--theme)) 30%, transparent)",
                color: isActive ? "#ffffff" : isManga ? "#000000" : "var(--theme-1, var(--theme))",
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-gilroy-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 border ${
                isActive
                  ? "font-gilroy-bold shadow-sm"
                  : "bg-black/50 hover:brightness-125"
              }`}
            >
              <i className={`${cat.icon} text-[10px]`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Icon Grid */}
      <div className="grid grid-cols-6 gap-1.5 overflow-y-auto scrollbar-hide max-h-44 pr-0.5 z-10 relative">
        {filteredItems.map((item) => {
          const isSelected = item.class === current;
          return (
            <button
              key={item.class}
              type="button"
              onClick={() => {
                onSelect(item.class);
                onClose();
              }}
              style={{
                backgroundColor: isSelected
                  ? isManga ? "#000000" : "var(--theme-1, var(--theme))"
                  : "transparent",
                borderColor: isManga
                  ? "#000000"
                  : isSelected
                  ? "var(--theme-1, var(--theme))"
                  : "color-mix(in srgb, var(--theme-1, var(--theme)) 30%, transparent)",
                color: isSelected ? "#ffffff" : isManga ? "#000000" : "var(--theme-1, var(--theme))",
              }}
              className={`h-9 w-9 rounded-xl flex items-center justify-center text-lg transition-all cursor-pointer border ${
                isSelected
                  ? "font-bold shadow-md scale-105"
                  : "bg-black/50 hover:scale-105 hover:brightness-125"
              }`}
              title={`${item.class}`}
            >
              <i className={`${item.class}`} />
            </button>
          );
        })}
        {filteredItems.length === 0 && (
          <div className="col-span-6 py-4 text-center text-xs opacity-50 font-gilroy-medium">
            No icons found
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Unified Icon Picker Modal ─── */
const IconPickerModal = ({ current, onSelect, onClose }) => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredItems = useMemo(() => {
    return ICON_GRID_ITEMS.filter((item) => {
      const matchesCategory = activeCategory === "all" || item.category === activeCategory;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.class.toLowerCase().includes(q) ||
        (item.keywords && item.keywords.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center bg-black/65 backdrop-blur-xl animate-fade-in p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#121216]/95 backdrop-blur-2xl border border-[color:var(--theme)]/40 rounded-[26px] p-6 w-full max-w-lg max-h-[82vh] flex flex-col gap-4 text-white font-gilroy-medium shadow-2xl relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <i className="ri-palette-line text-lg text-[color:var(--theme)]" />
            <h4 className="text-sm font-gilroy-bold text-white">Select Icon</h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/50 hover:text-white cursor-pointer transition-all p-1"
          >
            <i className="ri-close-line text-xl" />
          </button>
        </div>

        {/* Search Input */}
        <InputField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search icons (e.g. bed, exercise, coffee, code, sleep)..."
        />

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1 shrink-0">
          {ICON_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-gilroy-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
                activeCategory === cat.id
                  ? "bg-[color:var(--theme)] border-white/40 text-white font-gilroy-bold shadow-md"
                  : "bg-black/40 border-white/15 text-white/70 hover:text-white hover:bg-white/15"
              }`}
            >
              <i className={`${cat.icon} text-xs`} />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Icons Grid */}
        <div className="grid grid-cols-7 gap-2 overflow-y-auto scrollbar-hide max-h-64 pr-1 z-10 relative py-1">
          {filteredItems.map((item) => (
            <button
              key={item.class}
              type="button"
              onClick={() => {
                onSelect(item.class);
                onClose();
              }}
              className={`h-11 w-11 rounded-2xl flex items-center justify-center text-xl transition-all cursor-pointer border ${
                item.class === current
                  ? "bg-[color:var(--theme)] border-white/50 text-white font-bold shadow-md scale-105"
                  : "bg-black/40 border-white/15 text-white/80 hover:text-white hover:bg-[color:var(--theme)]/30 hover:border-white/30 hover:scale-105"
              }`}
              title={`${item.class} (${item.keywords})`}
            >
              <i className={`${item.class} relative z-10`} />
            </button>
          ))}
          {filteredItems.length === 0 && (
            <div className="col-span-7 py-8 text-center text-xs opacity-50 font-gilroy-medium">
              No matching icons found for "{search}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FONT_SIZE_TICKS = [
  { value: 14, label: "Small", sub: "14px (87.5%)" },
  { value: 15, label: "Compact", sub: "15px (93.8%)" },
  { value: 16, label: "Default", sub: "16px (100%)" },
  { value: 18, label: "Large", sub: "18px (112.5%)" },
  { value: 20, label: "Extra Large", sub: "20px (125%)" },
];

const FONT_CATEGORIES = ["All", "Sans", "Mono", "Serif", "Display", "Retro"];

const GOOGLE_FONTS_PRESETS = [
  { name: "Gilroy", desc: "Default clean geometric sans-serif", cat: "Sans" },
  { name: "Inter", desc: "Modern, ultra-legible screen font", cat: "Sans" },
  { name: "Poppins", desc: "Geometric sans-serif with friendly curves", cat: "Sans" },
  { name: "Roboto", desc: "Classic mechanical & friendly sans-serif", cat: "Sans" },
  { name: "Outfit", desc: "Sleek contemporary display & body font", cat: "Sans" },
  { name: "Plus Jakarta Sans", desc: "Modern tech brand typography", cat: "Sans" },
  { name: "Space Grotesk", desc: "Quirky tech & sci-fi sans-serif", cat: "Mono" },
  { name: "Lexend", desc: "Designed to improve reading speed", cat: "Sans" },
  { name: "Montserrat", desc: "Urban signage inspired geometry", cat: "Sans" },
  { name: "Lato", desc: "Warm & serious sans-serif", cat: "Sans" },
  { name: "Open Sans", desc: "Neutral & friendly universal font", cat: "Sans" },
  { name: "Raleway", desc: "Elegant thin-weight heading font", cat: "Sans" },
  { name: "Playfair Display", desc: "High-contrast editorial serif", cat: "Serif" },
  { name: "Fira Code", desc: "Monospace font with programming ligatures", cat: "Mono" },
  { name: "Orbitron", desc: "Futuristic sci-fi display font", cat: "Display" },
  { name: "Rajdhani", desc: "Modular, condensed military font", cat: "Display" },
  { name: "Share Tech Mono", desc: "Terminal & hacker monospace font", cat: "Mono" },
  { name: "Bangers", desc: "Comic book bold headline font", cat: "Retro" },
  { name: "Press Start 2P", desc: "8-bit arcade retro font", cat: "Retro" },
  { name: "Cinzel", desc: "Classical Roman proportions", cat: "Serif" },
  { name: "Permanent Marker", desc: "Bold marker pen handwriting", cat: "Retro" },
  { name: "Syne", desc: "Artistic & unique display font", cat: "Display" },
  { name: "Oswald", desc: "Re-drawn classic Gothic font", cat: "Display" },
  { name: "Nunito", desc: "Rounded well-balanced sans-serif", cat: "Sans" },
  { name: "Quicksand", desc: "Clean rounded geometry", cat: "Sans" },
  { name: "Ubuntu", desc: "Humanist sans-serif", cat: "Sans" },
];

/* ─── TAB 1: Appearance ─── */
const AppearanceTab = ({
  wallpaper,
  onWallpaperPick,
  onWallpaperReset,
  themeColor,
  themeColorsMap,
  onThemeChange,
  themeTextColorIndex = 1,
  onThemeTextColorChange,
  uiTheme = "default",
  onUiThemeChange,
  baseFont = "Gilroy",
  onBaseFontChange,
  baseFontSize = 16,
  onBaseFontSizeChange,
}) => {
  const wallpaperInputRef = useRef(null);
  const dragCounterRef = useRef(0);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [fontSearch, setFontSearch] = useState("");
  const [fontCategory, setFontCategory] = useState("All");

  const filteredFonts = useMemo(() => {
    let list = GOOGLE_FONTS_PRESETS;
    if (fontCategory !== "All") {
      list = list.filter((f) => f.cat === fontCategory);
    }
    const query = fontSearch.toLowerCase().trim();
    if (!query) return list;

    return list.filter(
      (f) => f.name.toLowerCase().includes(query) || f.desc.toLowerCase().includes(query)
    );
  }, [fontSearch, fontCategory]);

  const showCustomAdd = useMemo(() => {
    const query = fontSearch.trim();
    if (!query) return false;
    return !GOOGLE_FONTS_PRESETS.some((f) => f.name.toLowerCase() === query.toLowerCase());
  }, [fontSearch]);

  const processDroppedUrl = async (rawUrl) => {
    if (!rawUrl) return;
    const cleanUrl = rawUrl.trim();
    setIsProcessing(true);

    try {
      if (cleanUrl.startsWith("data:video/")) {
        onWallpaperPick({ type: "video", dataUrl: cleanUrl, name: "Dropped Video" });
        return;
      }
      if (cleanUrl.startsWith("data:image/")) {
        onWallpaperPick({ type: "image", dataUrl: cleanUrl, name: "Dropped Image" });
        return;
      }

      // Try fetching & converting URL to base64 Data URL for persistent offline storage
      try {
        const res = await fetch(cleanUrl);
        const blob = await res.blob();
        if (blob && blob.size <= 20 * 1024 * 1024) {
          const reader = new FileReader();
          reader.onload = () => {
            const isVideo = blob.type.startsWith("video/") || Boolean(cleanUrl.match(/\.(mp4|webm|ogg)(\?.*)?$/i));
            onWallpaperPick({
              type: isVideo ? "video" : "image",
              dataUrl: String(reader.result),
              name: "Dropped Media"
            });
          };
          reader.readAsDataURL(blob);
          return;
        }
      } catch {
        /* Fallback to direct URL if CORS blocks blob fetching */
      }

      const isVideo = Boolean(cleanUrl.match(/\.(mp4|webm|ogg)(\?.*)?$/i));
      onWallpaperPick({
        type: isVideo ? "video" : "image",
        dataUrl: cleanUrl,
        name: "Online Image"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (dragCounterRef.current === 1) {
      setIsDraggingOver(true);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "copy";
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDraggingOver(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDraggingOver(false);

    const dt = e.dataTransfer;
    if (!dt) return;

    // 1. Local File(s) dropped
    if (dt.files && dt.files.length > 0) {
      const file = dt.files[0];
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        onWallpaperPick(file);
        return;
      }
    }

    // 2. Dragged Image URL / Link dropped
    let droppedUrl = dt.getData("text/uri-list") || dt.getData("text/plain");

    if (!droppedUrl && dt.getData("text/html")) {
      const html = dt.getData("text/html");
      const match = html.match(/src=["']([^"']+)["']/i);
      if (match && match[1]) {
        droppedUrl = match[1];
      }
    }

    if (droppedUrl) {
      processDroppedUrl(droppedUrl);
    }
  };

  const normalizePalette = (val) => {
    if (Array.isArray(val) && val.length === 4) return val;
    if (typeof val === "string" && val.startsWith("#")) {
      return [val, val, val, val];
    }
    return ["#CBD5E1", "#64748B", "#334155", "#0F172A"];
  };

  const activeColors = normalizePalette(themeColor);

  return (
    <div className="flex flex-col gap-6">
      {/* Wallpaper */}
      <CardContainer
        title="Custom Wallpaper"
        description="Drag & drop any image/video file or image link directly onto the box below, or click to upload."
        action={
          <div className="flex items-center gap-2">
            <input
              ref={wallpaperInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => onWallpaperPick(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => wallpaperInputRef.current?.click()}
              className="px-4 py-2 rounded-full bg-[color:var(--theme)]/30 hover:bg-[color:var(--theme)]/50 border border-white/20 text-xs text-white font-gilroy-medium cursor-pointer transition-all active:scale-95 shadow-sm"
            >
              Upload Media
            </button>
            {wallpaper && (
              <button
                type="button"
                onClick={onWallpaperReset}
                className="px-4 py-2 rounded-full bg-black/40 hover:bg-black/60 border border-white/15 text-xs text-white/70 hover:text-white font-gilroy-medium cursor-pointer transition-all active:scale-95"
              >
                Reset Default
              </button>
            )}
          </div>
        }
      >
        <div className="flex flex-col gap-3">
          {/* Dropzone Container */}
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => wallpaperInputRef.current?.click()}
            className={`w-full h-52 rounded-[22px] overflow-hidden border-2 transition-all duration-300 relative flex items-center justify-center shadow-xl cursor-pointer group select-none ${
              isDraggingOver
                ? "border-[color:var(--theme)] bg-[color:var(--theme)]/20 scale-[1.01] ring-4 ring-[color:var(--theme)]/30"
                : "border-white/20 hover:border-white/40"
            }`}
          >
            {wallpaper?.dataUrl ? (
              wallpaper.type === "video" ? (
                <video src={wallpaper.dataUrl} className="w-full h-full object-cover pointer-events-none" muted autoPlay loop />
              ) : (
                <img src={wallpaper.dataUrl} alt="" className="w-full h-full object-cover pointer-events-none" />
              )
            ) : (
              <img
                src={
                  {
                    manga: "/manga-wallpaper.jpg",
                    cyberpunk: "/cyberpunk-wallpaper.png",
                    pixel: "/cli-wallpaper.jpg",
                    default: "/default-wallpaper.jpg",
                  }[uiTheme] || "/default-wallpaper.jpg"
                }
                alt=""
                className="w-full h-full object-cover object-top pointer-events-none"
              />
            )}

            {/* Hover overlay hint */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-1.5 text-white z-10 backdrop-blur-[2px] pointer-events-none">
              <i className="ri-drag-drop-line text-3xl" />
              <p className="text-xs font-gilroy-bold">Drag & Drop Image or Link Here</p>
              <span className="text-[10px] text-white/70 font-gilroy-medium">or click to browse files</span>
            </div>

            {/* Drag active overlay */}
            {isDraggingOver && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-30 flex flex-col items-center justify-center gap-2 text-white animate-fade-in pointer-events-none">
                <i className="ri-upload-cloud-2-line text-4xl text-[color:var(--theme)] animate-bounce" />
                <p className="text-sm font-gilroy-bold">Drop Image or Link to Set Wallpaper</p>
              </div>
            )}

            {/* Processing spinner */}
            {isProcessing && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-30 flex flex-col items-center justify-center gap-2 text-white pointer-events-none">
                <i className="ri-loader-4-line text-3xl animate-spin text-[color:var(--theme)]" />
                <p className="text-xs font-gilroy-medium">Processing Image...</p>
              </div>
            )}

            {/* Label badge */}
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs text-white font-gilroy-medium shadow-md z-20 pointer-events-none">
              {wallpaper ? wallpaper.name || "Custom Wallpaper" : "Default Wallpaper"}
            </div>
          </div>

          {/* Quick Paste Image Link Field */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/10">
            <span className="text-white/70 text-xs font-gilroy-medium shrink-0">Image Link</span>
            <InputField
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste image or video URL (https://...)"
              className="flex-1"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (urlInput) {
                  processDroppedUrl(urlInput);
                  setUrlInput("");
                }
              }}
              className="px-4 py-2 rounded-full bg-[color:var(--theme)]/30 hover:bg-[color:var(--theme)]/50 border border-white/20 text-xs text-white font-gilroy-medium cursor-pointer transition-all active:scale-95 shrink-0"
            >
              Apply Link
            </button>
          </div>
        </div>
      </CardContainer>

      {/* Theme Sector — UI Style Themes rendered in rich visual cards */}
      <CardContainer
        title="Theme Sector"
        description="Select a complete UI theme style. Changes backgrounds, glass cards, panels & fonts across your dashboard."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {UI_THEMES.map((t) => {
            const isSelected = uiTheme === t.id;
            return (
              <div
                key={t.id}
                onClick={() => onUiThemeChange && onUiThemeChange(t.id)}
                className={`group rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden relative flex flex-col bg-black/40 shadow-lg ${
                  isSelected
                    ? "border-white ring-2 ring-white/50 scale-[1.02] shadow-2xl"
                    : "border-white/10 hover:border-white/30 hover:bg-black/60"
                }`}
              >
                <div className="h-32 w-full overflow-hidden relative">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  
                  {/* Corner Beta Overlay Badge */}
                  {(t.id === "manga" || t.beta) && (
                    <span className="absolute top-2.5 right-2.5 z-20 px-2 py-0.5 rounded-md bg-amber-400 text-black text-[10px] font-gilroy-bold uppercase tracking-wider border border-yellow-200/50 shadow-md backdrop-blur-sm flex items-center gap-1 select-none">
                      <i className="ri-flask-line text-[11px]" /> Beta
                    </span>
                  )}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between z-10">
                    <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20">
                      {(themeColorsMap?.[t.id] || t.preview).map((c, i) => (
                        <span
                          key={i}
                          className="h-3.5 w-3.5 border border-white/40 shadow-sm"
                          style={{
                            backgroundColor: c,
                            borderRadius: t.id === "pixel" ? 0 : "50%",
                          }}
                        />
                      ))}
                    </div>
                    {isSelected && (
                      <span className="px-2.5 py-1 rounded-full bg-[color:var(--theme)] text-white text-[10px] font-gilroy-bold border border-white/30 uppercase tracking-wider shadow-md">
                        Active Theme
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3.5 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <i className={`${t.icon} text-sm text-[color:var(--theme)]`} />
                    <h4 className="text-white text-xs font-gilroy-bold group-hover:text-[color:var(--theme)] transition-colors">
                      {t.name}
                    </h4>
                  </div>
                  <p className="text-white/50 text-[11px] font-gilroy-medium line-clamp-2">
                    {t.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContainer>

      {/* Theme Color */}
      <CardContainer
        title="Theme Accent Palette"
        description="Select a signature 4-color gradient palette (light to dark) or customize all 4 shades."
      >
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {THEME_PRESETS.map((p) => {
            const isSelected = activeColors.every((c, i) => c.toLowerCase() === p.colors[i].toLowerCase());
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onThemeChange(p.colors)}
                className={`h-14 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer active:scale-95 flex p-1 bg-black/40 ${
                  isSelected
                    ? "border-white scale-105 shadow-xl ring-2 ring-white/50"
                    : "border-white/10 opacity-75 hover:opacity-100 hover:border-white/30"
                }`}
              >
                <div className="w-full h-full rounded-xl overflow-hidden flex">
                  {p.colors.map((colorHex, idx) => (
                    <div key={idx} className="flex-1 h-full" style={{ backgroundColor: colorHex }} />
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 pt-3 border-t border-white/10 mt-2">
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-xs font-gilroy-medium">Custom 4-Color Selection</span>
            <span className="text-white/40 text-[11px] font-gilroy-medium">Light → Dark</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {activeColors.map((colorHex, idx) => (
              <label
                key={idx}
                className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 cursor-pointer text-xs text-white font-gilroy-medium transition-all active:scale-95 shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-4 w-4 rounded-full border border-white/60 shadow-sm shrink-0"
                    style={{ backgroundColor: colorHex }}
                  />
                  <span className="text-[11px] text-white/90 font-mono tracking-wider">{colorHex.toUpperCase()}</span>
                </div>
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => {
                    const updated = [...activeColors];
                    updated[idx] = e.target.value;
                    onThemeChange(updated);
                  }}
                  className="sr-only"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Text & Accent Color Selector */}
        <div className="flex flex-col gap-3 pt-3 border-t border-white/10 mt-2">
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-xs font-gilroy-medium">Text & Accent Color</span>
            <span className="text-white/40 text-[11px] font-gilroy-medium">Select from Theme Shades</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {activeColors.map((colorHex, idx) => {
              const isSelected = themeTextColorIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onThemeTextColorChange && onThemeTextColorChange(idx)}
                  className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer active:scale-95 ${
                    isSelected
                      ? "bg-white/20 border-white text-white font-gilroy-bold shadow-md scale-105 ring-2 ring-white/40"
                      : "bg-white/5 hover:bg-white/10 border-white/15 text-white/70"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-4 w-4 rounded-full border border-white/60 shadow-sm shrink-0"
                      style={{ backgroundColor: colorHex }}
                    />
                    <span className="text-[11px] font-mono tracking-wider">{colorHex.toUpperCase()}</span>
                  </div>
                  {isSelected && <i className="ri-check-line text-xs text-white" />}
                </button>
              );
            })}
          </div>
        </div>
      </CardContainer>

      {/* Base Font Selector */}
      <CardContainer
        title="Base Typography Font"
        description="Select or search for any Google Font to apply as the primary typeface."
        action={
          baseFont && baseFont !== "Gilroy" && baseFont !== "Default" && (
            <button
              type="button"
              onClick={() => onBaseFontChange && onBaseFontChange("Gilroy")}
              className="px-4 py-2 rounded-full bg-black/40 hover:bg-black/60 border border-white/15 text-xs text-white/70 hover:text-white font-gilroy-medium cursor-pointer transition-all active:scale-95 shadow-sm flex items-center gap-1.5"
            >
              <i className="ri-refresh-line text-xs" />
              Reset to Gilroy
            </button>
          )
        }
      >
        <div className="flex flex-col gap-5">
          {/* Active Font Showcase Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-white/10 via-black/40 to-black/30 border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[color:var(--theme)]/30 border border-white/20 text-[10px] font-bold text-white uppercase tracking-wider">
                  Active Font
                </span>
                <span className="text-xs text-white/60 font-medium truncate">{baseFont || "Gilroy"}</span>
              </div>
              <p
                className="text-lg sm:text-xl font-medium text-white truncate mt-0.5"
                style={{ fontFamily: baseFont === "Gilroy" ? "Gilroy" : `"${baseFont}", sans-serif` }}
              >
                The quick brown fox jumps over the lazy dog
              </p>
            </div>
            <div className="shrink-0 text-right sm:border-l sm:border-white/10 sm:pl-4">
              <span className="text-[10px] text-white/40 block">Sample Characters</span>
              <span
                className="text-base sm:text-lg text-white/90 tracking-widest font-bold"
                style={{ fontFamily: baseFont === "Gilroy" ? "Gilroy" : `"${baseFont}", sans-serif` }}
              >
                Aa Bb 123
              </span>
            </div>
          </div>

          {/* Search Bar & Custom Font Action */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm" />
                <input
                  type="text"
                  value={fontSearch}
                  onChange={(e) => setFontSearch(e.target.value)}
                  placeholder="Search or type any Google Font (e.g. Inter, Outfit, Space Grotesk...)"
                  className="w-full h-11 rounded-2xl bg-black/40 border border-white/15 focus:border-white/40 pl-10 pr-10 text-xs text-white placeholder:text-white/30 outline-none transition-all"
                />
                {fontSearch && (
                  <button
                    type="button"
                    onClick={() => setFontSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer"
                  >
                    <i className="ri-close-line text-sm" />
                  </button>
                )}
              </div>

              {showCustomAdd && (
                <button
                  type="button"
                  onClick={() => {
                    const customName = fontSearch.trim();
                    if (customName && onBaseFontChange) {
                      onBaseFontChange(customName);
                    }
                  }}
                  className="h-11 px-4 rounded-2xl bg-[color:var(--theme)] hover:opacity-90 text-white text-xs font-bold transition-all shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer active:scale-95 border border-white/20"
                >
                  <i className="ri-add-line text-sm" />
                  Apply "{fontSearch.trim()}"
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
              {FONT_CATEGORIES.map((cat) => {
                const isActive = fontCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFontCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border shrink-0 ${
                      isActive
                        ? "bg-white/25 border-white text-white font-bold shadow-sm"
                        : "bg-black/30 hover:bg-black/50 border-white/10 text-white/60 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1.5 scrollbar-hide">
            {filteredFonts.map((f) => {
              const isSelected = (baseFont || "Gilroy").toLowerCase() === f.name.toLowerCase();
              return (
                <button
                  key={f.name}
                  type="button"
                  onClick={() => onBaseFontChange && onBaseFontChange(f.name)}
                  className={`flex flex-col justify-between p-3.5 rounded-2xl border transition-all text-left cursor-pointer relative group ${
                    isSelected
                      ? "border-white bg-white/20 ring-2 ring-white/40 shadow-xl scale-[1.01]"
                      : "border-white/10 bg-black/30 hover:border-white/30 hover:bg-black/50"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-xs font-bold text-white truncate">{f.name}</span>
                      {f.cat && (
                        <span className="px-1.5 py-0.2 text-[9px] font-mono rounded bg-white/10 text-white/60">
                          {f.cat}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <span className="h-5 w-5 rounded-full bg-[color:var(--theme)] flex items-center justify-center text-white shrink-0 ml-1 shadow-sm">
                        <i className="ri-check-line text-xs font-bold" />
                      </span>
                    )}
                  </div>

                  <p
                    className="text-sm text-white/90 truncate my-1.5"
                    style={{ fontFamily: f.name === "Gilroy" ? "Gilroy" : `"${f.name}", sans-serif` }}
                  >
                    Aa Bb 123 • Quick Fox
                  </p>

                  <span className="text-[10px] text-white/40 truncate w-full">
                    {f.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </CardContainer>

      {/* Font Size Selector (Discrete Slider with Ticks) */}
      <CardContainer
        title="Font Size Scaling"
        description="Adjust base typography scale proportionally across all widgets and dashboard elements."
        action={
          baseFontSize !== 16 && (
            <button
              type="button"
              onClick={() => onBaseFontSizeChange && onBaseFontSizeChange(16)}
              className="px-4 py-2 rounded-full bg-black/40 hover:bg-black/60 border border-white/15 text-xs text-white/70 hover:text-white font-gilroy-medium cursor-pointer transition-all active:scale-95 shadow-sm flex items-center gap-1.5"
            >
              <i className="ri-refresh-line text-xs" />
              Reset Size (16px)
            </button>
          )
        }
      >
        <div className="flex flex-col gap-5">
          {/* Active Size Summary Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/15 text-white">
            <div className="flex items-center gap-2.5">
              <i className="ri-text-spacing text-base text-[color:var(--theme)]" />
              <div>
                <h4 className="text-xs font-bold text-white">
                  {FONT_SIZE_TICKS.find((t) => t.value === baseFontSize)?.label || "Custom Size"}
                </h4>
                <p className="text-[11px] text-white/50">Base typography sizing</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-mono font-bold text-white shadow-sm">
              {baseFontSize}px ({Math.round((baseFontSize / 16) * 100)}%)
            </span>
          </div>

          {/* Discrete Slider & Track Container */}
          <div className="flex flex-col gap-4 px-1 pt-2 pb-1">
            <div className="relative w-full h-8 flex items-center px-2">
              {/* Range Input */}
              {(() => {
                const tickIdx = FONT_SIZE_TICKS.findIndex((t) => t.value === baseFontSize);
                const safeIdx = tickIdx >= 0 ? tickIdx : 2;
                const percent = (safeIdx / (FONT_SIZE_TICKS.length - 1)) * 100;

                return (
                  <div className="relative w-full h-full flex items-center">
                    {/* Background Track */}
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1.5 bg-white/15 rounded-full border border-white/10 pointer-events-none" />

                    {/* Active Filled Progress Bar */}
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-[color:var(--theme)] shadow-sm transition-all duration-200 pointer-events-none"
                      style={{ width: `${percent}%` }}
                    />

                    {/* Visible Discrete Tick Dots */}
                    {FONT_SIZE_TICKS.map((t, idx) => {
                      const dotPercent = (idx / (FONT_SIZE_TICKS.length - 1)) * 100;
                      const isPastOrCurrent = idx <= safeIdx;
                      const isCurrent = idx === safeIdx;

                      return (
                        <div
                          key={t.value}
                          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 flex items-center justify-center"
                          style={{ left: `${dotPercent}%` }}
                          title={`${t.label} (${t.value}px)`}
                        >
                          <span
                            className={`block transition-all duration-200 ${
                              isCurrent
                                ? "h-4 w-4 bg-white ring-4 ring-[color:var(--theme)]/60 shadow-md scale-110"
                                : isPastOrCurrent
                                ? "h-3 w-3 bg-white/90 border border-white/80 shadow-sm"
                                : "h-2.5 w-2.5 bg-white/30 border border-white/40"
                            }`}
                            style={{ borderRadius: "9999px" }}
                          />
                        </div>
                      );
                    })}

                    {/* Actual Native Range Input overlaid for accessibility & drag */}
                    <input
                      type="range"
                      min={0}
                      max={FONT_SIZE_TICKS.length - 1}
                      step={1}
                      value={safeIdx}
                      onChange={(e) => {
                        const targetVal = FONT_SIZE_TICKS[Number(e.target.value)]?.value;
                        if (targetVal && onBaseFontSizeChange) {
                          onBaseFontSizeChange(targetVal);
                        }
                      }}
                      className="w-full opacity-0 cursor-pointer h-full z-30 relative"
                    />
                  </div>
                );
              })()}
            </div>

            {/* Discrete Tick Labels Row */}
            <div className="grid grid-cols-5 gap-1 text-center">
              {FONT_SIZE_TICKS.map((t) => {
                const isActive = t.value === baseFontSize;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => onBaseFontSizeChange && onBaseFontSizeChange(t.value)}
                    className={`flex flex-col items-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
                      isActive
                        ? "bg-white/15 text-white font-bold scale-105 shadow-sm"
                        : "text-white/50 hover:text-white/80 hover:bg-white/5"
                    }`}
                  >
                    <span className="text-xs font-gilroy-bold truncate w-full">{t.label}</span>
                    <span className="text-[10px] font-mono opacity-60 mt-0.5">{t.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/15 flex flex-col gap-2 shadow-inner">
            <div className="flex items-center justify-between text-[11px] text-white/50">
              <span className="font-gilroy-bold uppercase tracking-wider text-[10px] text-white/60">
                Live Typography Scale Preview
              </span>
              <span className="font-mono">
                Font: {baseFont || "Gilroy"} • {baseFontSize}px
              </span>
            </div>
            <p
              className="text-white font-gilroy-medium leading-relaxed transition-all truncate"
              style={{
                fontFamily: baseFont === "Gilroy" ? "Gilroy" : `"${baseFont}", sans-serif`,
                fontSize: `${baseFontSize}px`,
              }}
            >
              The quick brown fox jumps over the lazy dog. 1234567890
            </p>
          </div>
        </div>
      </CardContainer>
    </div>
  );
};

/* ─── TAB 2: Focus & Reminders ─── */
const FocusTab = ({
  focusNotifEnabled, onFocusNotifChange,
  focusEndRingtone, onFocusEndRingtoneChange,
  restEndRingtone, onRestEndRingtoneChange,
  waterGoalMl, onWaterGoalChange,
  waterNotifEnabled, onWaterNotifChange,
  waterRingtone, onWaterRingtoneChange,
}) => (
  <div className="flex flex-col gap-6">
    {/* Focus Timer */}
    <CardContainer
      title="Focus Timer Settings"
      description="Configure audio alerts and completion ringtones for Focus and Rest pomodoro sessions."
    >
      <div className="flex flex-col gap-3.5 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white text-xs font-gilroy-bold">Audio Sound Alerts</h4>
            <p className="text-white/50 text-[11px] font-gilroy-medium">Play ringtone when timer session completes</p>
          </div>
          <Toggle checked={focusNotifEnabled} onChange={onFocusNotifChange} />
        </div>

        {focusNotifEnabled && (
          <div className="flex flex-col gap-3.5 pl-3.5 border-l-2 border-white/20 my-1 pt-1">
            <RingtoneRow label="Focus Session Completion Ringtone" value={focusEndRingtone} onChange={onFocusEndRingtoneChange} />
            <RingtoneRow label="Rest Session Completion Ringtone" value={restEndRingtone} onChange={onRestEndRingtoneChange} />
          </div>
        )}
      </div>
    </CardContainer>

    {/* Water Reminder */}
    <CardContainer
      title="Water Reminder Settings"
      description="Customize your daily target hydration goal and sound alert preferences."
    >
      <div className="flex flex-col gap-4 pt-3 border-t border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-white text-xs font-gilroy-bold">Daily Target Hydration Goal</h4>
            <p className="text-white/50 text-[11px] font-gilroy-medium">Select your target daily water intake</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {WATER_GOALS.map((g) => (
              <Pill key={g.value} active={waterGoalMl === g.value} onClick={() => onWaterGoalChange(g.value)}>
                {g.label}
              </Pill>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div>
            <h4 className="text-white text-xs font-gilroy-bold">Reminder Sound Notifications</h4>
            <p className="text-white/50 text-[11px] font-gilroy-medium">Chime alert when it's time to drink water</p>
          </div>
          <Toggle checked={waterNotifEnabled} onChange={onWaterNotifChange} />
        </div>

        {waterNotifEnabled && (
          <div className="pl-3.5 border-l-2 border-white/20 my-1 pt-1">
            <RingtoneRow label="Hydration Reminder Alert Ringtone" value={waterRingtone} onChange={onWaterRingtoneChange} />
          </div>
        )}
      </div>
    </CardContainer>
  </div>
);

/* ─── TAB 3: Song Player Settings ─── */
const SongPlayerTab = ({
  showSongPlayer, onShowSongPlayerChange,
  songPlaylistUrl, onSongPlaylistUrlChange,
  songAutoPlay, onSongAutoPlayChange,
  songCustomVideo, onSongCustomVideoChange,
  lofiStations, onLofiStationsChange,
}) => {
  const videoInputRef = useRef(null);

  const handleUpdateStation = (id, field, value) => {
    if (!onLofiStationsChange) return;
    const updated = (lofiStations || []).map((st) =>
      st.id === id ? { ...st, [field]: value } : st
    );
    onLofiStationsChange(updated);
  };

  const handleAddStation = () => {
    if (!onLofiStationsChange) return;
    const newStation = {
      id: `custom-station-${Date.now()}`,
      name: "My Custom Lofi Station",
      provider: "Custom Live Stream",
      streamUrl: "https://stream.example.com/lofi",
      badge: "Custom Lofi",
      gradient: "from-purple-900/60 via-indigo-900/50 to-slate-900/70",
    };
    onLofiStationsChange([...(lofiStations || []), newStation]);
  };

  const handleRemoveStation = (id) => {
    if (!onLofiStationsChange) return;
    if ((lofiStations || []).length <= 1) {
      alert("At least one station must remain in the player.");
      return;
    }
    const filtered = (lofiStations || []).filter((st) => st.id !== id);
    onLofiStationsChange(filtered);
  };

  const handleResetStations = () => {
    if (!onLofiStationsChange) return;
    onLofiStationsChange(DEFAULT_LOFI_STATIONS);
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert("Please choose a video/GIF under 15MB for optimal browser performance.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onSongCustomVideoChange({
        dataUrl: String(reader.result),
        name: file.name,
        type: file.type.startsWith("video/") ? "video" : "image",
      });
    };
    reader.readAsDataURL(file);
  };

  const videoSrc = typeof songCustomVideo === "string" ? songCustomVideo : songCustomVideo?.dataUrl;

  return (
  <div className="flex flex-col gap-6">
    {/* Song Player */}
    <CardContainer
      title="Song Player Settings"
      description="24/7 Lofi live streaming radio from dedicated servers. Use Next/Prev controls to switch streaming services, or upload a custom video for the player container."
    >
      <div className="flex flex-col gap-5 pt-3 border-t border-white/10">
          {/* Custom Player Video Background */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="ri-vidicon-line text-sm text-[color:var(--theme)]" />
                <span className="text-white/90 text-xs font-gilroy-bold">Custom Video / GIF Background</span>
              </div>
              {songCustomVideo && (
                <button
                  type="button"
                  onClick={() => onSongCustomVideoChange(null)}
                  className="text-[11px] text-white/60 hover:text-white underline cursor-pointer transition-colors"
                >
                  Remove Background
                </button>
              )}
            </div>
            <p className="text-white/50 text-[11px] font-gilroy-medium leading-relaxed">
              Upload a video/GIF file (.mp4, .webm, .gif) or paste an online video / GIF link URL to display inside the Song Player container.
            </p>

            <input
              ref={videoInputRef}
              type="file"
              accept="video/*,image/gif,image/webp"
              onChange={handleVideoUpload}
              className="hidden"
            />

            <div className="flex flex-col gap-2.5 mt-1">
              <InputField
                value={videoSrc && !videoSrc.startsWith("data:") ? videoSrc : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val.trim()) {
                    onSongCustomVideoChange(null);
                  } else {
                    const isVid = Boolean(val.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i));
                    onSongCustomVideoChange({
                      dataUrl: val.trim(),
                      name: "Online Link",
                      type: isVid ? "video" : "image",
                    });
                  }
                }}
                placeholder="Paste direct video URL or .gif link (e.g. https://.../lofi.mp4)"
                className="w-full"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-gilroy-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shrink-0"
                  title="Upload local file"
                >
                  <i className="ri-folder-open-line text-sm" />
                  <span>Upload Local Video / GIF File</span>
                </button>
              </div>

              {videoSrc && (
                <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 mt-1">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-12 w-20 rounded-xl overflow-hidden border border-white/20 bg-black/60 relative shrink-0 shadow-md">
                      {songCustomVideo?.type?.startsWith("video/") || videoSrc.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) || videoSrc.startsWith("data:video/") ? (
                        <video src={videoSrc} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                      ) : (
                        <img src={videoSrc} alt="Preview" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white text-xs font-gilroy-bold truncate">
                          {songCustomVideo?.name || "Active Background"}
                        </p>
                        <span className="px-2 py-0.5 rounded-md bg-white/10 text-[9px] font-gilroy-bold text-white/70 uppercase">
                          {videoSrc.startsWith("data:") ? "Local File" : "Web Link"}
                        </span>
                      </div>
                      <p className="text-white/40 text-[10.5px] font-gilroy-medium truncate mt-0.5">
                        {videoSrc.startsWith("data:") ? "Local File Upload" : videoSrc}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSongCustomVideoChange(null)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-red-500/20 text-white/60 hover:text-red-400 border border-white/10 transition-colors shrink-0"
                    title="Remove Video Background"
                  >
                    <i className="ri-delete-bin-6-line text-sm" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 24/7 Lofi Stream Stations Manager */}
          <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <i className="ri-radio-2-line text-sm text-[color:var(--theme)]" />
                  <span className="text-white/90 text-xs font-gilroy-bold">Manage 24/7 Lofi Live Stream Stations</span>
                </div>
                <p className="text-white/50 text-[11px] font-gilroy-medium mt-0.5">
                  Edit station names, badge labels, or audio stream URLs. Click Next/Prev in the player to cycle through them.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetStations}
                className="text-[11px] text-white/60 hover:text-white underline cursor-pointer transition-colors shrink-0 ml-2"
              >
                Reset Default Stations
              </button>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[360px] overflow-y-auto scrollbar-hide pr-1 mt-1">
              {(lofiStations || []).map((station, idx) => (
                <div
                  key={station.id}
                  className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-black/25 border border-white/10 hover:border-white/20 transition-all shadow-sm group"
                >
                  <div className="h-9 w-9 rounded-xl bg-[color:var(--theme)]/20 border border-white/15 flex items-center justify-center shrink-0 shadow-inner">
                    <span className="text-[11px] font-gilroy-bold text-white/90">#{idx + 1}</span>
                  </div>

                  <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <InputField
                      value={station.name || ""}
                      onChange={(e) => handleUpdateStation(station.id, "name", e.target.value)}
                      placeholder="Station Name"
                      className="w-full"
                    />
                    <InputField
                      value={station.streamUrl || ""}
                      onChange={(e) => handleUpdateStation(station.id, "streamUrl", e.target.value)}
                      placeholder="Stream URL (https://...)"
                      className="w-full"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveStation(station.id)}
                    className="h-9 w-9 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 border border-white/10 cursor-pointer transition-all flex items-center justify-center shrink-0 active:scale-95"
                    title="Remove Station"
                  >
                    <i className="ri-delete-bin-6-line text-sm" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddStation}
                className="w-full py-3 rounded-2xl bg-[color:var(--theme)]/30 hover:bg-[color:var(--theme)]/50 border border-white/20 text-xs text-white font-gilroy-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] shadow-md mt-1"
              >
                <i className="ri-add-line text-base" />
                <span>Add Custom Lofi Station</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <div>
              <span className="text-white/90 text-xs font-gilroy-medium">Auto-Play Lofi Stream</span>
              <p className="text-white/50 text-[11px] font-gilroy-medium">Automatically start streaming music when dashboard opens</p>
            </div>
            <Toggle checked={songAutoPlay} onChange={onSongAutoPlayChange} />
          </div>
        </div>
      </CardContainer>
  </div>
  );
};

/* ─── TAB 4: Taskbar Shortcuts ─── */
const TaskbarTab = ({
  shortcuts, onShortcutUpdate, onShortcutRemove, onShortcutAdd, onShortcutIconPick, uiTheme = "default",
}) => {
  const [iconPickerShortcutId, setIconPickerShortcutId] = useState(null);

  return (
  <div className="flex flex-col gap-6">
    {/* Taskbar Shortcuts */}
    <CardContainer
      title="Taskbar Quick Launchers"
      description="Customize AI tools, developer bookmarks, and custom web links in your top taskbar."
      action={
        <button
          type="button"
          onClick={onShortcutAdd}
          className="px-3.5 py-2 rounded-2xl bg-[color:var(--theme)] hover:brightness-110 text-white font-gilroy-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-md"
        >
          <i className="ri-add-line text-sm relative z-10" />
          <span className="relative z-10">Add Shortcut</span>
        </button>
      }
    >
      <div className="flex flex-col gap-3 pt-3 border-t border-white/10">
        {(shortcuts || []).map((s) => (
          <div
            key={s.id}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 bg-black/25 border border-white/10 hover:border-white/20 rounded-2xl transition-all shadow-sm"
          >
            <button
              type="button"
              onClick={() => setIconPickerShortcutId(s.id)}
              className="h-10 w-10 rounded-2xl bg-[color:var(--theme)]/20 hover:bg-[color:var(--theme)]/40 border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer shrink-0 group/ic active:scale-95 shadow-inner"
              title="Change Icon"
            >
              {s.iconDataUrl || s.iconUrl ? (
                <img src={s.iconDataUrl || s.iconUrl} alt="" className="h-5 w-5 object-contain" />
              ) : s.iconClass ? (
                <i className={`${s.iconClass} text-white text-xl group-hover/ic:scale-110 transition-transform`} />
              ) : (
                <i className="ri-link text-white text-xl" />
              )}
            </button>

            <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <InputField
                value={s.title ?? ""}
                onChange={(e) => onShortcutUpdate(s.id, { title: e.target.value })}
                placeholder="Title"
                className="w-full"
              />
              <InputField
                value={s.url ?? ""}
                onChange={(e) => onShortcutUpdate(s.id, { url: e.target.value })}
                placeholder="https://..."
                className="w-full"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id={`sc-icon-${s.id}`}
                onChange={(e) => onShortcutIconPick(s.id, e.target.files?.[0])}
              />
              <button
                type="button"
                onClick={() => document.getElementById(`sc-icon-${s.id}`)?.click()}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs text-white cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
                title="Upload image favicon"
              >
                <i className="ri-image-line text-xs" />
                <span className="hidden sm:inline">Upload Image</span>
              </button>
              <button
                type="button"
                onClick={() => onShortcutRemove(s.id)}
                className="h-9 w-9 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 text-white/50 hover:text-red-400 cursor-pointer transition-all flex items-center justify-center shrink-0 active:scale-95"
                title="Remove Shortcut"
              >
                <i className="ri-delete-bin-6-line text-sm" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {iconPickerShortcutId && (
        <IconPickerModal
          current={shortcuts.find((s) => s.id === iconPickerShortcutId)?.iconClass}
          onSelect={(ic) => onShortcutUpdate(iconPickerShortcutId, { iconClass: ic, iconDataUrl: null, iconUrl: null })}
          onClose={() => setIconPickerShortcutId(null)}
          uiTheme={uiTheme}
        />
      )}
    </CardContainer>
  </div>
  );
};

/* ─── TAB 4: Important Tabs ─── */
const ImportantTabsTab = ({ showImportantTabs, onShowImportantTabsChange, importantTabsConfig, onImportantTabsConfigChange, uiTheme = "default" }) => {
  const [iconPickerTabId, setIconPickerTabId] = useState(null);
  const [expandedTabId, setExpandedTabId] = useState(null);

  const addTab = () => {
    const newTab = { id: makeId(), title: "New Tab Group", iconClass: "ri-globe-line", links: [] };
    onImportantTabsConfigChange([...importantTabsConfig, newTab]);
    setExpandedTabId(newTab.id);
  };

  const removeTab = (id) => onImportantTabsConfigChange(importantTabsConfig.filter((t) => t.id !== id));

  const updateTab = (id, patch) =>
    onImportantTabsConfigChange(importantTabsConfig.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const addLink = (tabId) => {
    const tab = importantTabsConfig.find((t) => t.id === tabId);
    if (!tab) return;
    updateTab(tabId, {
      links: [...tab.links, { id: makeId(), label: "Link", url: "https://" }],
    });
  };

  const removeLink = (tabId, linkId) => {
    const tab = importantTabsConfig.find((t) => t.id === tabId);
    if (!tab) return;
    updateTab(tabId, { links: tab.links.filter((l) => l.id !== linkId) });
  };

  const updateLink = (tabId, linkId, patch) => {
    const tab = importantTabsConfig.find((t) => t.id === tabId);
    if (!tab) return;
    updateTab(tabId, {
      links: tab.links.map((l) => (l.id === linkId ? { ...l, ...patch } : l)),
    });
  };

  return (
    <CardContainer
      title="Important Tabs Bundles"
      description="Organize multiple website links into one-click tab groups."
    >
      <div className="flex flex-col gap-4 pt-3 border-t border-white/10">
        <div className="flex flex-col gap-3">
          {(importantTabsConfig || []).map((tab) => (
            <div key={tab.id} className="bg-black/25 border border-white/10 hover:border-white/20 rounded-2xl overflow-hidden transition-all shadow-sm">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-3">
                <button
                  type="button"
                  onClick={() => setIconPickerTabId(tab.id)}
                  className="h-10 w-10 rounded-2xl bg-[color:var(--theme)]/25 hover:bg-[color:var(--theme)]/45 border border-white/20 flex items-center justify-center text-white text-xl transition-all shrink-0 cursor-pointer active:scale-95 shadow-sm"
                  title="Change Icon"
                >
                  <i className={`${tab.iconClass || "ri-globe-line"} relative z-10`} />
                </button>

                <div className="flex-1 min-w-0">
                  <InputField
                    value={tab.title}
                    onChange={(e) => updateTab(tab.id, { title: e.target.value })}
                    placeholder="Tab Group Title"
                    className="w-full font-gilroy-bold"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-auto">
                  <button
                    type="button"
                    onClick={() => setExpandedTabId(expandedTabId === tab.id ? null : tab.id)}
                    className="h-10 px-3.5 rounded-2xl bg-[color:var(--theme)]/25 hover:bg-[color:var(--theme)]/45 border border-white/20 text-xs text-white/80 hover:text-white cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
                  >
                    <span className="text-xs font-gilroy-medium">{tab.links?.length || 0} links</span>
                    <i className={`ri-arrow-${expandedTabId === tab.id ? "up" : "down"}-s-line text-sm relative z-10`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeTab(tab.id)}
                    className="h-10 w-10 rounded-2xl bg-white/5 hover:bg-red-500/20 border border-white/10 text-white/50 hover:text-red-400 cursor-pointer transition-all flex items-center justify-center shrink-0 active:scale-95"
                    title="Remove Tab Group"
                  >
                    <i className="ri-delete-bin-6-line text-sm" />
                  </button>
                </div>
              </div>

              {expandedTabId === tab.id && (
                <div className="border-t border-white/10 p-3 bg-black/20 flex flex-col gap-2">
                  {tab.links?.map((link) => (
                    <div key={link.id} className="flex items-center gap-2.5">
                      <i className="ri-corner-down-right-line text-white/40 text-sm shrink-0 ml-1.5" />
                      <div className="w-36 shrink-0">
                        <InputField
                          value={link.label}
                          onChange={(e) => updateLink(tab.id, link.id, { label: e.target.value })}
                          placeholder="Label (e.g. Docs)"
                          className="w-full h-9 rounded-xl text-xs bg-black/30 border-white/10"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <InputField
                          value={link.url}
                          onChange={(e) => updateLink(tab.id, link.id, { url: e.target.value })}
                          placeholder="https://..."
                          className="w-full h-9 rounded-xl text-xs bg-black/30 border-white/10"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLink(tab.id, link.id)}
                        className="h-9 w-9 rounded-xl hover:bg-red-500/20 text-white/40 hover:text-red-400 cursor-pointer flex items-center justify-center shrink-0 transition-all active:scale-95"
                        title="Remove Link"
                      >
                        <i className="ri-close-line text-base" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addLink(tab.id)}
                    className="mt-1.5 self-start px-4 py-1.5 rounded-xl bg-[color:var(--theme)]/30 hover:bg-[color:var(--theme)]/50 border border-white/20 text-xs text-white font-gilroy-medium cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
                  >
                    <i className="ri-add-line text-xs relative z-10" />
                    <span className="relative z-10">Add Link</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addTab}
          className="w-full py-3 rounded-2xl bg-[color:var(--theme)]/30 hover:bg-[color:var(--theme)]/50 border border-white/20 text-xs text-white font-gilroy-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-md mt-1"
        >
          <i className="ri-add-line text-base relative z-10" />
          <span className="relative z-10">Add Tab Group</span>
        </button>
      </div>

      {iconPickerTabId && (
        <IconPickerModal
          current={importantTabsConfig.find((t) => t.id === iconPickerTabId)?.iconClass}
          onSelect={(ic) => updateTab(iconPickerTabId, { iconClass: ic })}
          onClose={() => setIconPickerTabId(null)}
          uiTheme={uiTheme}
        />
      )}
    </CardContainer>
  );
};

/* ─── TAB 5: Time Boxing ─── */
const TimeBoxingTab = ({ timeBoxingGroups, onTimeBoxingGroupsChange, uiTheme = "default" }) => {
  const [iconPickerGroupId, setIconPickerGroupId] = useState(null);
  const [timePickerGroupId, setTimePickerGroupId] = useState(null);
  const [expandedGroupId, setExpandedGroupId] = useState(null);

  const [draggedIdx, setDraggedIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const addGroup = () => {
    const g = { id: makeId(), title: "New Routine", iconClass: "ri-briefcase-line", time: "9:00 am", streak: 0, subtasks: [] };
    onTimeBoxingGroupsChange([...timeBoxingGroups, g]);
    setExpandedGroupId(g.id);
  };

  const removeGroup = (id) => onTimeBoxingGroupsChange(timeBoxingGroups.filter((g) => g.id !== id));

  const updateGroup = (id, patch) =>
    onTimeBoxingGroupsChange(timeBoxingGroups.map((g) => (g.id === id ? { ...g, ...patch } : g)));

  const handleDragStart = (e, index) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragOverIdx !== index) {
      setDragOverIdx(index);
    }
  };

  const handleDrop = (e, targetIdx) => {
    e.preventDefault();
    if (draggedIdx !== null && draggedIdx !== targetIdx) {
      const reordered = [...timeBoxingGroups];
      const [movedItem] = reordered.splice(draggedIdx, 1);
      reordered.splice(targetIdx, 0, movedItem);
      onTimeBoxingGroupsChange(reordered);
    }
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const addSubtask = (groupId) => {
    const g = timeBoxingGroups.find((g) => g.id === groupId);
    if (!g) return;
    updateGroup(groupId, { subtasks: [...g.subtasks, { id: makeId(), text: "New Subtask", done: false }] });
  };

  const removeSubtask = (groupId, stId) => {
    const g = timeBoxingGroups.find((g) => g.id === groupId);
    if (!g) return;
    updateGroup(groupId, { subtasks: g.subtasks.filter((s) => s.id !== stId) });
  };

  const updateSubtask = (groupId, stId, text) => {
    const g = timeBoxingGroups.find((g) => g.id === groupId);
    if (!g) return;
    updateGroup(groupId, { subtasks: g.subtasks.map((s) => (s.id === stId ? { ...s, text } : s)) });
  };

  return (
    <CardContainer
      title="Time Boxing Routine Editor"
      description="Structure your daily routines into scheduled task blocks with subtask checklists. Drag task cards up or down to reorder them."
    >
      <div className="flex flex-col gap-4 pt-3 border-t border-white/10">
        <div className="flex flex-col gap-3">
          {(timeBoxingGroups || []).map((group, idx) => {
            const isDragging = draggedIdx === idx;
            const isDragOver = dragOverIdx === idx;

            return (
              <div
                key={group.id}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
                className={`bg-black/25 border rounded-2xl transition-all shadow-sm relative ${
                  (timePickerGroupId === group.id || iconPickerGroupId === group.id) ? "z-30 overflow-visible" : "z-10 overflow-hidden"
                } ${
                  isDragging
                    ? "opacity-40 border-dashed border-white/40 scale-[0.99]"
                    : isDragOver
                    ? "border-[color:var(--theme)] shadow-lg ring-2 ring-[color:var(--theme)]/30 scale-[1.01]"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-3">
                  {/* Drag Handle */}
                  <div className="flex items-center shrink-0">
                    <div
                      className="h-10 w-7 flex items-center justify-center text-white/40 hover:text-white cursor-grab active:cursor-grabbing transition-colors"
                      title="Drag to reorder routine tasks"
                    >
                      <i className="ri-drag-move-fill text-lg" />
                    </div>
                  </div>

                  {/* Icon Picker Dropdown */}
                  <div className="relative shrink-0 z-50">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIconPickerGroupId(iconPickerGroupId === group.id ? null : group.id);
                      }}
                      className="h-10 w-10 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/15 hover:border-white/30 flex items-center justify-center text-white text-xl transition-all shrink-0 cursor-pointer active:scale-95 shadow-sm"
                      title="Change Icon"
                    >
                      <i className={`${group.iconClass || "ri-briefcase-line"} relative z-10`} />
                    </button>

                    {iconPickerGroupId === group.id && (
                      <IconDropdownPopover
                        current={group.iconClass || "ri-briefcase-line"}
                        onSelect={(newIcon) => {
                          updateGroup(group.id, { iconClass: newIcon });
                          setIconPickerGroupId(null);
                        }}
                        onClose={() => setIconPickerGroupId(null)}
                        uiTheme={uiTheme}
                      />
                    )}
                  </div>

                  {/* Task Group Title */}
                  <div className="flex-1 min-w-0">
                    <InputField
                      value={group.title}
                      onChange={(e) => updateGroup(group.id, { title: e.target.value })}
                      placeholder="Task Group Name"
                      className="w-full font-gilroy-bold"
                    />
                  </div>

                  {/* Time Selector Dropdown */}
                  <div className="relative shrink-0 z-50">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTimePickerGroupId(timePickerGroupId === group.id ? null : group.id);
                      }}
                      className="h-10 px-3.5 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/15 hover:border-white/30 text-xs text-white font-gilroy-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-95 shadow-sm min-w-[105px]"
                      title="Select Routine Scheduled Time"
                    >
                      <i className="ri-time-line text-sm text-[color:var(--theme)]" />
                      <span>{group.time || "9:00 am"}</span>
                      <i className={`ri-arrow-${timePickerGroupId === group.id ? "up" : "down"}-s-line text-xs opacity-60 transition-transform`} />
                    </button>

                    {timePickerGroupId === group.id && (
                      <TimeDropdownPopover
                        current={group.time || "9:00 am"}
                        onSelect={(newTime) => {
                          updateGroup(group.id, { time: newTime });
                          setTimePickerGroupId(null);
                        }}
                        onClose={() => setTimePickerGroupId(null)}
                        uiTheme={uiTheme}
                      />
                    )}
                  </div>

                  {/* Subtask Toggle & Delete Button */}
                  <div className="flex items-center gap-2 shrink-0 ml-auto">
                    <button
                      type="button"
                      onClick={() => setExpandedGroupId(expandedGroupId === group.id ? null : group.id)}
                      className="h-10 px-3.5 rounded-2xl bg-[color:var(--theme)]/25 hover:bg-[color:var(--theme)]/45 border border-white/20 text-xs text-white/80 hover:text-white cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
                    >
                      <span className="text-xs font-gilroy-medium">{group.subtasks?.length || 0} subtasks</span>
                      <i className={`ri-arrow-${expandedGroupId === group.id ? "up" : "down"}-s-line text-sm relative z-10`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeGroup(group.id)}
                      className="h-10 w-10 rounded-2xl bg-white/5 hover:bg-red-500/20 border border-white/10 text-white/50 hover:text-red-400 cursor-pointer transition-all flex items-center justify-center shrink-0 active:scale-95"
                      title="Remove Group"
                    >
                      <i className="ri-delete-bin-6-line text-sm" />
                    </button>
                  </div>
                </div>

                {expandedGroupId === group.id && (
                  <div className="border-t border-white/10 p-3 bg-black/20 flex flex-col gap-2">
                    {group.subtasks?.map((st) => (
                      <div key={st.id} className="flex items-center gap-2.5">
                        <i className="ri-corner-down-right-line text-white/40 text-sm shrink-0 ml-1.5" />
                        <div className="flex-1 min-w-0">
                          <InputField
                            value={st.text}
                            onChange={(e) => updateSubtask(group.id, st.id, e.target.value)}
                            placeholder="Subtask description"
                            className="w-full h-9 rounded-xl text-xs bg-black/30 border-white/10"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSubtask(group.id, st.id)}
                          className="h-9 w-9 rounded-xl hover:bg-red-500/20 text-white/40 hover:text-red-400 cursor-pointer flex items-center justify-center shrink-0 transition-all active:scale-95"
                          title="Remove Subtask"
                        >
                          <i className="ri-close-line text-base" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addSubtask(group.id)}
                      className="mt-1.5 self-start px-4 py-1.5 rounded-xl bg-[color:var(--theme)]/30 hover:bg-[color:var(--theme)]/50 border border-white/20 text-xs text-white font-gilroy-medium cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
                    >
                      <i className="ri-add-line text-xs relative z-10" />
                      <span className="relative z-10">Add Subtask</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={addGroup}
          className="w-full py-3 rounded-2xl bg-[color:var(--theme)]/30 hover:bg-[color:var(--theme)]/50 border border-white/20 text-xs text-white font-gilroy-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-md mt-1"
        >
          <i className="ri-add-line text-base relative z-10" />
          <span className="relative z-10">Add Time Boxing Group</span>
        </button>
      </div>
    </CardContainer>
  );
};

/* ─── TAB 6: Widget Visibility ─── */
const WidgetsTab = ({
  showTimer, onShowTimerChange,
  showWaterReminder, onShowWaterReminderChange,
  showSongPlayer, onShowSongPlayerChange,
  showTodo, onShowTodoChange,
  showImportantTabs, onShowImportantTabsChange,
  showTimeBoxing, onShowTimeBoxingChange,
  showStreakGrid, onShowStreakGridChange,
}) => (
  <CardContainer
    title="Dashboard Widgets Visibility"
    description="Control which widgets and tools are displayed on your main dashboard grid."
  >
    <div className="flex flex-col gap-1 pt-3 border-t border-white/10">
      {[
        { title: "Focus Timer Widget", desc: "Pomodoro & rest countdown timer card", state: showTimer, set: onShowTimerChange, icon: "ri-timer-line" },
        { title: "Water Reminder Widget", desc: "Liquid animation hydration goal & counter", state: showWaterReminder, set: onShowWaterReminderChange, icon: "ri-drop-line" },
        { title: "24/7 Song Player Widget", desc: "24/7 Lofi live stream music player", state: showSongPlayer, set: onShowSongPlayerChange, icon: "ri-music-2-line" },
        { title: "Notepad / To Do Checklist", desc: "Quick notes and task checklist card", state: showTodo, set: onShowTodoChange, icon: "ri-file-text-line" },
        { title: "Important Tabs Widget", desc: "Categorized quick bookmarks and links", state: showImportantTabs, set: onShowImportantTabsChange, icon: "ri-bookmark-3-line" },
        { title: "Time Boxing Routines", desc: "Daily time blocking and scheduled task cards", state: showTimeBoxing, set: onShowTimeBoxingChange, icon: "ri-time-line" },
        { title: "Streak Activity Grid", desc: "GitHub-style daily contribution grid", state: showStreakGrid, set: onShowStreakGridChange, icon: "ri-calendar-check-line" },
      ].map((w, idx) => (
        <div key={idx} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] px-2 rounded-xl transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[color:var(--theme)]/20 border border-white/15 flex items-center justify-center text-white text-base shrink-0 shadow-inner">
              <i className={`${w.icon} relative z-10`} />
            </div>
            <div>
              <h4 className="text-white text-xs font-gilroy-bold">{w.title}</h4>
              <p className="text-white/50 text-[11px] font-gilroy-medium">{w.desc}</p>
            </div>
          </div>
          <Toggle checked={w.state} onChange={w.set} />
        </div>
      ))}
    </div>
  </CardContainer>
);

/* ─── Main Full-Fledged Settings Screen ─── */
const SettingsPage = (props) => {
  const [activeTab, setActiveTab] = useState("appearance");

  if (!props.open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/60 backdrop-blur-md text-white font-gilroy-medium overflow-hidden pointer-events-auto animate-fade-in"
      onClick={props.onClose}
    >
      {/* Settings Full-Screen SaaS Pop-Up Container with Figma Glass background */}
      <div
        className="figma-glass-static w-full h-full max-w-[1360px] max-h-[90vh] rounded-[28px] sm:rounded-[32px] border-0 shadow-2xl flex flex-col overflow-hidden text-white font-gilroy-medium relative z-10 animate-modal-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar matching App header close controls */}
        <div className="w-full flex items-center justify-between px-6 sm:px-8 py-4 border-b border-white/15 shrink-0 z-30 relative bg-black/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-inner">
              <i className="ri-settings-3-fill text-lg relative z-10" />
            </div>
            <h1 className="text-white text-lg font-gilroy-bold tracking-tight">Settings</h1>
          </div>

          {/* Top-right controls: Close button matching Dashboard close button */}
          <button
            type="button"
            onClick={props.onClose}
            className="figma-glass-card h-10 w-10 sm:h-11 sm:w-11 rounded-full flex items-center justify-center text-white cursor-pointer transition-all active:scale-95 hover:bg-white/20"
            aria-label="Close Settings"
          >
            <i className="ri-close-line text-xl relative z-10" />
          </button>
        </div>

        {/* Main Full-Fledged Screen Split */}
        <div className="w-full flex-1 flex min-h-0 overflow-hidden z-20 relative">
          {/* Left Sidebar Navigation */}
          <aside className="w-64 sm:w-72 border-r border-white/15 p-6 flex flex-col justify-between shrink-0 select-none bg-black/10">
            <div className="flex flex-col gap-6">
              <nav className="flex flex-col gap-2">
                {NAV_TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs transition-all duration-300 ease-out cursor-pointer relative overflow-hidden select-none active:scale-[0.98] ${
                        isActive
                          ? "text-white font-gilroy-bold"
                          : "text-white/60 hover:text-white hover:bg-white/5 font-gilroy-medium"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full shadow-md animate-fade-in" />
                      )}
                      <i className={`${tab.icon} text-base transition-colors duration-300 ${isActive ? "text-white" : "text-white/50"}`} />
                      <span className="relative z-10 transition-colors duration-300">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Footer Social & Credit Links */}
            <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.open("https://github.com/rahul3rj/Lively-New-Tab-Dashboard", "_blank")}
                  className="flex-1 py-2.5 rounded-xl text-[11px] text-white font-gilroy-medium bg-[color:var(--theme)]/20 hover:bg-[color:var(--theme)]/40 border border-white/15 transition-all duration-300 ease-out active:scale-[0.97] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <i className="ri-github-fill relative z-10" />
                  <span className="relative z-10">GitHub</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.open("https://forms.gle/teCwi4Nmm39Lq1i37", "_blank")}
                  className="flex-1 py-2.5 rounded-xl text-[11px] text-white font-gilroy-medium bg-[color:var(--theme)]/20 hover:bg-[color:var(--theme)]/40 border border-white/15 transition-all duration-300 ease-out active:scale-[0.97] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <i className="ri-chrome-line relative z-10" />
                  <span className="relative z-10">Feedback</span>
                </button>
              </div>
              <a
                href="https://www.linkedin.com/in/rahul-jha-049945257/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 text-[11px] text-center font-gilroy-medium hover:text-white transition-colors duration-300"
              >
                Developed by Rahul Jha 👌🏼
              </a>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto scrollbar-hide p-8 sm:p-10">
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h2 className="text-white text-xl font-gilroy-bold">
                {NAV_TABS.find((t) => t.id === activeTab)?.label}
              </h2>
            </div>

            {activeTab === "appearance" && (
              <AppearanceTab
                wallpaper={props.wallpaper}
                onWallpaperPick={props.onWallpaperPick}
                onWallpaperReset={props.onWallpaperReset}
                themeColor={props.themeColor}
                themeColorsMap={props.themeColorsMap}
                onThemeChange={props.onThemeChange}
                themeTextColorIndex={props.themeTextColorIndex}
                onThemeTextColorChange={props.onThemeTextColorChange}
                uiTheme={props.uiTheme}
                onUiThemeChange={props.onUiThemeChange}
                baseFont={props.baseFont}
                onBaseFontChange={props.onBaseFontChange}
                baseFontSize={props.baseFontSize}
                onBaseFontSizeChange={props.onBaseFontSizeChange}
              />
            )}

            {activeTab === "focus" && (
              <FocusTab
                focusNotifEnabled={props.focusNotifEnabled}
                onFocusNotifChange={props.onFocusNotifChange}
                focusEndRingtone={props.focusEndRingtone}
                onFocusEndRingtoneChange={props.onFocusEndRingtoneChange}
                restEndRingtone={props.restEndRingtone}
                onRestEndRingtoneChange={props.onRestEndRingtoneChange}
                waterGoalMl={props.waterGoalMl}
                onWaterGoalChange={props.onWaterGoalChange}
                waterNotifEnabled={props.waterNotifEnabled}
                onWaterNotifChange={props.onWaterNotifChange}
                waterRingtone={props.waterRingtone}
                onWaterRingtoneChange={props.onWaterRingtoneChange}
              />
            )}

            {activeTab === "songPlayer" && (
              <SongPlayerTab
                songPlaylistUrl={props.songPlaylistUrl}
                onSongPlaylistUrlChange={props.onSongPlaylistUrlChange}
                songAutoPlay={props.songAutoPlay}
                onSongAutoPlayChange={props.onSongAutoPlayChange}
                songCustomVideo={props.songCustomVideo}
                onSongCustomVideoChange={props.onSongCustomVideoChange}
                lofiStations={props.lofiStations}
                onLofiStationsChange={props.onLofiStationsChange}
              />
            )}

            {activeTab === "taskbar" && (
              <TaskbarTab
                shortcuts={props.shortcuts}
                onShortcutUpdate={props.onShortcutUpdate}
                onShortcutRemove={props.onShortcutRemove}
                onShortcutAdd={props.onShortcutAdd}
                onShortcutIconPick={props.onShortcutIconPick}
                uiTheme={props.uiTheme}
              />
            )}

            {activeTab === "tabs" && (
              <ImportantTabsTab
                importantTabsConfig={props.importantTabsConfig}
                onImportantTabsConfigChange={props.onImportantTabsConfigChange}
                uiTheme={props.uiTheme}
              />
            )}

            {activeTab === "timebox" && (
              <TimeBoxingTab
                timeBoxingGroups={props.timeBoxingGroups}
                onTimeBoxingGroupsChange={props.onTimeBoxingGroupsChange}
                uiTheme={props.uiTheme}
              />
            )}

            {activeTab === "widgets" && (
              <WidgetsTab
                showTimer={props.showTimer}
                onShowTimerChange={props.onShowTimerChange}
                showWaterReminder={props.showWaterReminder}
                onShowWaterReminderChange={props.onShowWaterReminderChange}
                showSongPlayer={props.showSongPlayer}
                onShowSongPlayerChange={props.onShowSongPlayerChange}
                showTodo={props.showTodo}
                onShowTodoChange={props.onShowTodoChange}
                showImportantTabs={props.showImportantTabs}
                onShowImportantTabsChange={props.onShowImportantTabsChange}
                showTimeBoxing={props.showTimeBoxing}
                onShowTimeBoxingChange={props.onShowTimeBoxingChange}
                showStreakGrid={props.showStreakGrid}
                onShowStreakGridChange={props.onShowStreakGridChange}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  </div>
  );
};

export default SettingsPage;
