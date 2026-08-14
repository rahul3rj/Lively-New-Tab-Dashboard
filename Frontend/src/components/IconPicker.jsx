import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  fitPopoverInContainer,
  ICON_CATEGORIES,
  ICON_GRID_ITEMS,
} from "./iconData.js";

/* ─── Icon Dropdown Popover ─── */
export const IconDropdownPopover = ({ current, onSelect, onClose, uiTheme = "default", triggerRef }) => {
  const popoverRef = useRef(null);
  const [openUpwards, setOpenUpwards] = useState(false);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [customIconInput, setCustomIconInput] = useState(() => {
    if (typeof current === "string") {
      if (current.startsWith("img:") || current.startsWith("http") || current.startsWith("data:")) {
        return current.replace(/^img:/, "");
      }
      if (current.startsWith("ri-")) {
        return current.slice(3).replace(/-/g, " ");
      }
    }
    return "";
  });

  useEffect(() => {
    if (popoverRef.current) {
      fitPopoverInContainer(popoverRef.current, triggerRef?.current, setOpenUpwards);
    }
  }, [triggerRef]);

  useEffect(() => {
    const handlePointerDownOutside = (e) => {
      const trigger = triggerRef?.current;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        !(trigger && trigger.contains(e.target))
      ) {
        onClose();
      }
    };
    const timerId = setTimeout(() => {
      document.addEventListener("pointerdown", handlePointerDownOutside, true);
    }, 50);
    return () => {
      clearTimeout(timerId);
      document.removeEventListener("pointerdown", handlePointerDownOutside, true);
    };
  }, [onClose, triggerRef]);

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

  const handleApplyCustomIcon = () => {
    const trimmed = customIconInput.trim();
    if (!trimmed) return;

    if (trimmed.startsWith("img:") || trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:")) {
      const imgVal = trimmed.startsWith("img:") ? trimmed : `img:${trimmed}`;
      onSelect(imgVal);
      onClose();
      return;
    }

    let val = trimmed;
    const classMatch = /class(?:Name)?=["']([^"']+)["']/i.exec(val);
    if (classMatch) {
      val = classMatch[1].trim();
    } else {
      val = val.replace(/<[^>]*>/g, "").trim();
    }

    let formattedClass = val.toLowerCase().replace(/\s+/g, "-");
    if (!formattedClass.startsWith("ri-")) {
      formattedClass = `ri-${formattedClass}`;
    }

    onSelect(formattedClass);
    onClose();
  };

  const isManga = uiTheme === "manga";

  return (
    <div
      ref={popoverRef}
      onClick={(e) => e.stopPropagation()}
      style={{
        backgroundColor: isManga
          ? "#FFFFFF"
          : "color-mix(in srgb, var(--theme-4, #0F172A) 96%, #000000)",
        borderColor: isManga
          ? "#000000"
          : "color-mix(in srgb, var(--theme-1, var(--theme)) 45%, transparent)",
        boxShadow: isManga
          ? "4px 4px 0px #000"
          : "0 10px 40px rgba(0,0,0,0.9), 0 0 20px color-mix(in srgb, var(--theme-1, var(--theme)) 25%, transparent)",
      }}
      className={`absolute left-0 ${
        openUpwards ? "bottom-full mb-2" : "top-full mt-2"
      } z-[99999] w-72 h-[300px] max-h-[310px] rounded-2xl p-3 flex flex-col gap-2 shadow-2xl animate-fade-in border backdrop-blur-2xl select-text ${
        isManga ? "text-black" : "text-white"
      }`}
    >
      {/* Header with Close */}
      <div className="flex items-center justify-between shrink-0">
        <span
          style={{ color: isManga ? "#000000" : "var(--theme-2, var(--theme-1, var(--theme)))" }}
          className="text-[10px] uppercase tracking-wider font-gilroy-bold opacity-90"
        >
          Select Icon
        </span>
        <button
          type="button"
          onClick={onClose}
          title="Close"
          aria-label="Close icon picker"
          className={`h-6 w-6 rounded-lg border flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0 ${
            isManga
              ? "bg-white text-black border-black hover:bg-black hover:text-white"
              : "bg-white/10 text-white/70 hover:text-white border-white/15 hover:bg-white/25"
          }`}
        >
          <i className="ri-close-line text-sm" />
        </button>
      </div>

      {/* Search Input */}
      <div className="relative w-full shrink-0">
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
          className="w-full h-8 pl-8 pr-3 rounded-xl bg-black/60 border text-xs text-white placeholder:text-white/40 focus:outline-none transition-all font-gilroy-medium"
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
              className={`px-2 py-0.5 rounded-lg text-[10px] font-gilroy-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 border ${
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
      <div className="flex-1 min-h-0 grid grid-cols-6 gap-1.5 overflow-y-auto scrollbar-hide pr-0.5 z-10 relative">
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
              className={`h-8 w-8 rounded-lg flex items-center justify-center text-base transition-all cursor-pointer border ${
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

      {/* Custom Remix Icon Name / Class Input */}
      <div className="pt-2 border-t border-white/10 flex flex-col gap-1 shrink-0">
        <label
          style={{ color: isManga ? "#000000" : "var(--theme-2, var(--theme-1, var(--theme)))" }}
          className="text-[9px] uppercase tracking-wider block font-gilroy-bold opacity-90"
        >
          Or Custom Remix Icon Name / CDN Link
        </label>
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={customIconInput}
            onChange={(e) => setCustomIconInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleApplyCustomIcon();
              }
            }}
            placeholder="Type icon name (e.g. openai fill)..."
            style={{
              borderColor: isManga ? "#000000" : "color-mix(in srgb, var(--theme-1, var(--theme)) 35%, transparent)",
            }}
            className="flex-1 h-7.5 px-2.5 rounded-xl bg-black/60 border text-[11px] text-white placeholder:text-white/40 focus:outline-none transition-all font-gilroy-medium"
          />
          <button
            type="button"
            onClick={handleApplyCustomIcon}
            style={{
              backgroundColor: isManga ? "#000000" : "var(--theme)",
              borderColor: isManga ? "#000000" : "var(--theme)",
            }}
            className="px-3 h-7.5 rounded-xl border text-white font-gilroy-bold text-[11px] cursor-pointer hover:brightness-110 shrink-0 transition-all active:scale-95 shadow-sm"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
