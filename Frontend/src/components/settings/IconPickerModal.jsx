import React, { useMemo, useState } from "react";
import { ICON_CATEGORIES, ICON_GRID_ITEMS } from "../iconData.js";
import { InputField } from "./SettingsPrims.jsx";

/* ─── Unified Icon Picker Modal ─── */
export const IconPickerModal = ({ current, onSelect, onClose }) => {
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
