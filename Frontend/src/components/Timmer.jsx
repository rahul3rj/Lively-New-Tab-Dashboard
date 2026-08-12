import React, { useEffect, useRef, useState } from "react";
import { recordActivity } from "../utils/activityStore";

const pad2 = (n) => String(n).padStart(2, "0");

const formatMmSs = (totalSeconds) => {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${pad2(minutes)}:${pad2(seconds)}`;
};

const parseDurationToSeconds = (raw) => {
  const value = String(raw ?? "").trim();
  if (!value) return null;

  if (value.includes(":")) {
    const [mStr, sStr] = value.split(":");
    const minutes = Number.parseInt(mStr, 10);
    const seconds = Number.parseInt(sStr, 10);
    if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return null;
    if (minutes < 0 || seconds < 0 || seconds > 59) return null;
    return minutes * 60 + seconds;
  }

  const minutes = Number.parseInt(value, 10);
  if (!Number.isFinite(minutes) || minutes < 0) return null;
  return minutes * 60;
};

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

const STORAGE = {
  date: "pomodoro_today_date_v1",
  totalSec: "pomodoro_today_total_sec_v1",
  durationSec: "pomodoro_duration_sec_v1",
};

import { storageGet, storageSet } from "../utils/storage.js";

const Timmer = ({ dragHandleProps }) => {
  const [mode, setMode] = useState("focus"); // 'focus' | 'rest'
  const [status, setStatus] = useState("idle");
  const [durationSec, setDurationSec] = useState(25 * 60);
  const [remainingSec, setRemainingSec] = useState(25 * 60);
  const [_todayTotalSec, setTodayTotalSec] = useState(0);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  const endTimeRef = useRef(null);
  const lastAccountedMsRef = useRef(null);
  const todayTotalSecRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const storedDurationRaw = await storageGet(STORAGE.durationSec);
        const storedDuration = Number(storedDurationRaw);
        if (
          !cancelled &&
          Number.isFinite(storedDuration) &&
          storedDuration > 0
        ) {
          setDurationSec(storedDuration);
          setRemainingSec(storedDuration);
        }

        const storedDate = String((await storageGet(STORAGE.date)) ?? "");
        const tKey = todayKey();

        if (storedDate === tKey) {
          const storedTotalRaw = await storageGet(STORAGE.totalSec);
          const storedTotal = Number(storedTotalRaw);
          const safeTotal =
            Number.isFinite(storedTotal) && storedTotal >= 0 ? storedTotal : 0;
          if (!cancelled) {
            todayTotalSecRef.current = safeTotal;
            setTodayTotalSec(safeTotal);
          }
        } else {
          await storageSet(STORAGE.date, tKey);
          await storageSet(STORAGE.totalSec, 0);
          if (!cancelled) {
            todayTotalSecRef.current = 0;
            setTodayTotalSec(0);
          }
        }
      } catch {
        if (!cancelled) {
          todayTotalSecRef.current = 0;
          setTodayTotalSec(0);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    storageSet(STORAGE.durationSec, durationSec);
  }, [durationSec]);

  const setAndPersistTodayTotal = (nextTotalSec) => {
    const safe = Math.max(0, Math.floor(nextTotalSec));
    todayTotalSecRef.current = safe;
    setTodayTotalSec(safe);
    storageSet(STORAGE.date, todayKey());
    storageSet(STORAGE.totalSec, safe);
  };

  const addToTodayTotal = (secondsToAdd) => {
    const add = Math.max(0, Math.floor(secondsToAdd));
    if (add <= 0) return;
    const prev = todayTotalSecRef.current;
    setAndPersistTodayTotal(prev + add);
    // 1 streak point per 15 minutes of focus
    if (Math.floor((prev + add) / 900) !== Math.floor(prev / 900)) {
      recordActivity(1);
    }
  };

  const flushElapsed = () => {
    if (status !== "running") {
      lastAccountedMsRef.current = null;
      return;
    }

    const now = Date.now();
    const last = lastAccountedMsRef.current ?? now;
    const deltaSec = Math.max(0, Math.floor((now - last) / 1000));

    if (deltaSec > 0) addToTodayTotal(deltaSec);

    const remainderMs = (now - last) % 1000;
    lastAccountedMsRef.current = now - remainderMs;
  };

  const tick = () => {
    flushElapsed();

    if (!endTimeRef.current) return;
    const msLeft = endTimeRef.current - Date.now();
    const nextRemaining = Math.max(0, Math.ceil(msLeft / 1000));
    setRemainingSec(nextRemaining);

    if (nextRemaining <= 0) {
      endTimeRef.current = null;
      lastAccountedMsRef.current = null;
      setStatus("idle");
      setRemainingSec(durationSec);
    }
  };

  useEffect(() => {
    if (status !== "running") return;

    const id = window.setInterval(tick, 250);
    tick();

    return () => window.clearInterval(id);
  }, [status, durationSec]);

  const switchMode = (newMode) => {
    if (newMode === mode) return;
    flushElapsed();
    endTimeRef.current = null;
    lastAccountedMsRef.current = null;
    setStatus("idle");
    setMode(newMode);
    const targetSec = newMode === "focus" ? 25 * 60 : 5 * 60;
    setDurationSec(targetSec);
    setRemainingSec(targetSec);
  };

  const canEdit = status !== "running";

  const beginEdit = () => {
    if (!canEdit) return;
    setIsEditing(true);
    setEditValue(formatMmSs(durationSec));
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditValue("");
  };

  const commitEdit = () => {
    if (!canEdit) return;

    const parsed = parseDurationToSeconds(editValue);
    if (parsed === null || parsed <= 0) {
      cancelEdit();
      return;
    }

    setDurationSec(parsed);
    setRemainingSec(parsed);
    endTimeRef.current = null;
    lastAccountedMsRef.current = null;
    setStatus("idle");
    cancelEdit();
  };

  const handleStart = () => {
    cancelEdit();
    if (status === "running") return;
    const startFrom = remainingSec > 0 ? remainingSec : durationSec;
    setRemainingSec(startFrom);
    endTimeRef.current = Date.now() + startFrom * 1000;
    lastAccountedMsRef.current = Date.now();
    setStatus("running");
  };

  const handlePause = () => {
    cancelEdit();
    if (status !== "running") return;
    tick();
    flushElapsed();
    endTimeRef.current = null;
    lastAccountedMsRef.current = null;
    setStatus("paused");
  };

  const handleReset = () => {
    cancelEdit();
    flushElapsed();
    endTimeRef.current = null;
    lastAccountedMsRef.current = null;
    setStatus("idle");
    setRemainingSec(durationSec);
  };

  return (
    <div className="figma-glass-static focus-widget rounded-[26px] px-[20px] py-[13px] text-white font-gilroy-medium w-full h-full select-none flex flex-col justify-between shadow-2xl relative overflow-hidden">
      {/* Header Row: Drag Icon + Title & Segmented Toggle */}
      <div className="w-full flex items-center justify-between z-10 relative mb-1 shrink-0">
        <div
          className="flex items-center gap-2 text-white/80 text-xs font-gilroy-medium cursor-grab active:cursor-grabbing select-none"
          data-drag-handle
          {...dragHandleProps}
        >
          <i className="ri-draggable text-sm pointer-events-none"></i>
          <span className="pointer-events-none font-bold">Focus</span>
        </div>

        {/* Mode Segmented Switcher: Focus | Rest */}
        <div
          className="flex items-center p-0.5 rounded-full border border-white/10 shadow-sm"
          style={{ backgroundColor: "var(--theme-4, #0F172A)" }}
        >
          <button
            type="button"
            onClick={() => switchMode("focus")}
            className={`px-3 py-1 rounded-full text-[11px] font-gilroy-bold transition-all cursor-pointer ${
              mode === "focus"
                ? "bg-white/25 text-white shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            Focus
          </button>
          <button
            type="button"
            onClick={() => switchMode("rest")}
            className={`px-3 py-1 rounded-full text-[11px] font-gilroy-bold transition-all cursor-pointer ${
              mode === "rest"
                ? "bg-white/25 text-white shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            Rest
          </button>
        </div>
      </div>

      {/* Center Giant Heathergreen Timer Display */}
      <div className="w-full flex-1 min-h-0 flex items-center justify-center z-10 relative">
        {isEditing ? (
          <input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitEdit();
              if (e.key === "Escape") cancelEdit();
            }}
            autoFocus
            inputMode="numeric"
            className="w-[300px] h-[122px] bg-transparent text-center text-[110px] leading-none font-bold font-heathergreen outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={beginEdit}
            className="select-none text-[110px] leading-[95px] font-bold font-heathergreen transition-opacity hover:opacity-80 cursor-pointer"
          >
            {formatMmSs(remainingSec)}
          </button>
        )}
      </div>

      {/* Bottom Controls Row: Start/Pause Toggle + Reset */}
      <div className="w-full flex items-center justify-center gap-2.5 z-10 relative mt-2 mb-2">
        <button
          type="button"
          onClick={status === "running" ? handlePause : handleStart}
          className="h-8 w-[90px] rounded-full flex items-center justify-center gap-1.5 text-white font-gilroy-bold text-xs transition-all duration-200 shadow-sm cursor-pointer whitespace-nowrap shrink-0"
          style={{ backgroundColor: "var(--theme-4, #0F172A)" }}
        >
          <i className={`${status === "running" ? "ri-pause-fill" : "ri-play-fill"} text-xs shrink-0 relative z-10`} />
          <span className="relative z-10 leading-none">
            {status === "running" ? "Pause" : status === "paused" ? "Resume" : "Start"}
          </span>
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="h-8 w-[90px] rounded-full flex items-center justify-center gap-1.5 text-white/80 hover:text-white font-gilroy-bold text-xs transition-all duration-200 shadow-sm cursor-pointer whitespace-nowrap shrink-0"
          style={{ backgroundColor: "var(--theme-4, #0F172A)" }}
        >
          <i className="ri-refresh-line text-xs shrink-0 relative z-10" />
          <span className="relative z-10 leading-none">Reset</span>
        </button>
      </div>
    </div>
  );
};

export default Timmer;
