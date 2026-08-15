import React, { useMemo, useRef, useState } from "react";
import { UI_THEMES } from "../../themes/index.js";
import { CardContainer, InputField, THEME_PRESETS } from "./SettingsPrims.jsx";

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
export const AppearanceTab = ({
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
              name: "Dropped Media",
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
        name: "Online Image",
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
