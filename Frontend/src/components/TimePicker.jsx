import React, { useEffect, useMemo, useRef, useState } from "react";
import { fitPopoverInContainer } from "./iconData.js";

/* ─── Custom Time Dropdown Popover ─── */
export const TimeDropdownPopover = ({ current, onSelect, onClose, uiTheme = "default", triggerRef }) => {
  const popoverRef = useRef(null);
  const [openUpwards, setOpenUpwards] = useState(false);

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
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    const timerId = setTimeout(() => {
      document.addEventListener("pointerdown", handlePointerDownOutside, true);
      document.addEventListener("keydown", handleKeyDown);
    }, 50);
    return () => {
      clearTimeout(timerId);
      document.removeEventListener("pointerdown", handlePointerDownOutside, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, triggerRef]);

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
      className={`absolute right-0 ${
        openUpwards ? "bottom-full mb-2" : "top-full mt-2"
      } z-[99999] w-60 rounded-2xl p-3.5 flex flex-col gap-3 animate-fade-in border backdrop-blur-2xl select-text ${
        isManga ? "text-black" : "text-white"
      }`}
    >
      {/* Header with Close */}
      <div className="flex items-center justify-between shrink-0">
        <span
          style={{ color: isManga ? "#000000" : "var(--theme-2, var(--theme-1, var(--theme)))" }}
          className="text-[10px] uppercase tracking-wider font-gilroy-bold opacity-90"
        >
          Set Time
        </span>
        <button
          type="button"
          onClick={onClose}
          title="Close"
          aria-label="Close time picker"
          className={`h-6 w-6 rounded-lg border flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0 ${
            isManga
              ? "bg-white text-black border-black hover:bg-black hover:text-white"
              : "bg-white/10 text-white/70 hover:text-white border-white/15 hover:bg-white/25"
          }`}
        >
          <i className="ri-close-line text-sm" />
        </button>
      </div>

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
          backgroundColor: isManga ? "#000000" : "var(--theme)",
          borderColor: isManga ? "#000000" : "var(--theme)",
        }}
        className="w-full py-2.5 rounded-xl hover:brightness-110 border text-white font-gilroy-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
      >
        Apply Time ({timeState.hour}:{String(timeState.minute).padStart(2, "0")} {timeState.period})
      </button>
    </div>
  );
};
