import React, { useRef } from "react";

/* ─── Ringtone helpers ─── */
export const playBeep = () => {
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

export const playCustomRingtone = (dataUrl) => {
  try {
    const audio = new Audio(dataUrl);
    audio.volume = 0.7;
    audio.play().catch(() => {});
  } catch {
    /* silent fail */
  }
};

export const previewRingtone = (ringtone) => {
  if (!ringtone || ringtone === "beep") {
    playBeep();
  } else {
    playCustomRingtone(ringtone);
  }
};

/* ─── Constants ─── */
export const THEME_PRESETS = [
  { id: "slate", colors: ["#CBD5E1", "#64748B", "#334155", "#0F172A"] },
  { id: "ocean", colors: ["#7DD3FC", "#0EA5E9", "#0369A1", "#0C4A6E"] },
  { id: "emerald", colors: ["#86EFAC", "#22C55E", "#15803D", "#14532D"] },
  { id: "amber", colors: ["#FDE047", "#EAB308", "#A16207", "#713F12"] },
  { id: "orange", colors: ["#FDBA74", "#F97316", "#C2410C", "#7C2D12"] },
  { id: "rose", colors: ["#FCA5A5", "#EF4444", "#B91C1C", "#7F1D1D"] },
  { id: "purple", colors: ["#D8B4FE", "#A855F7", "#6B21A8", "#581C87"] },
  { id: "dark", colors: ["#9CA3AF", "#4B5563", "#1F2937", "#111827"] },
];

export const MAX_SHORTCUTS = 7;

export const WATER_GOALS = [
  { label: "2.0 L", value: 2000 },
  { label: "3.0 L", value: 3000 },
  { label: "4.5 L", value: 4500 },
  { label: "6.0 L", value: 6000 },
];

export const DEFAULT_LOFI_STATIONS = [
  {
    id: "fluxfm-chillhop",
    name: "Chillhop Beats",
    badge: "Chillhop",
    provider: "FluxFM Stream",
    streamUrl: "https://fluxfm.streamabc.net/flx-chillhop-mp3-320-8025178",
    gradient: "from-[#2A0845] via-[#6441A5] to-[#FE8C00]",
  },
  {
    id: "zeno-lofi",
    name: "Lofi Cafe Stream",
    badge: "Zeno Radio",
    provider: "Zeno.fm 24/7",
    streamUrl: "https://stream.zeno.fm/f3wvbbqmdg8uv",
    gradient: "from-[#0F2027] via-[#203A43] to-[#2C5364]",
  },
  {
    id: "ilovemusic-lofi",
    name: "Lofi Hip-Hop 24/7",
    badge: "I Love Music",
    provider: "ILoveMusic.de",
    streamUrl: "https://streams.ilovemusic.de/iloveradio17.mp3",
    gradient: "from-[#1D2671] via-[#C33764] to-[#1D2671]",
  },
];

export const NAV_TABS = [
  { id: "appearance", label: "Appearance & Theme", icon: "ri-palette-line" },
  { id: "focus", label: "Focus & Reminders", icon: "ri-timer-line" },
  { id: "songPlayer", label: "Song Player Settings", icon: "ri-music-2-line" },
  { id: "taskbar", label: "Taskbar Shortcuts", icon: "ri-external-link-line" },
  { id: "tabs", label: "Important Tabs", icon: "ri-bookmark-3-line" },
  { id: "timebox", label: "Time Boxing", icon: "ri-time-line" },
  { id: "widgets", label: "Widget Visibility", icon: "ri-layout-grid-line" },
  { id: "backup", label: "Export & Restore Data", icon: "ri-save-3-line" },
];

export const makeId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return String(Date.now() + Math.random());
};

/* ─── Figma Glass Matching UI Primitives ─── */

export const Toggle = ({ checked, onChange }) => (
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

export const InputField = ({ value, onChange, placeholder, className = "", type = "text" }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full h-10 rounded-2xl bg-black/40 border border-white/15 focus:border-white/40 px-3.5 text-xs text-white placeholder:text-white/30 outline-none transition-all font-gilroy-medium ${className}`}
  />
);

export const Pill = ({ active, onClick, children }) => (
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

export const CardContainer = ({ title, description, children, action, overflowVisible = false }) => (
  <div
    className="card-glass-bg bg-black/30 border border-white/10 rounded-[24px] p-6 flex flex-col gap-5 relative text-white font-gilroy-medium shadow-xl backdrop-blur-sm"
    style={overflowVisible ? { overflow: "visible" } : undefined}
  >
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
export const RingtoneRow = ({ label, value, onChange }) => {
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
