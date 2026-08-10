import React, { useEffect, useMemo, useRef, useState } from "react";
import { updateTodayCompletedTasksCount } from "../utils/activityStore";


const DEFAULT_TASK_GROUPS = [
  {
    id: "brain-stretching",
    title: "Brain Stretching",
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
    time: "8:45 am",
    streak: 0,
    subtasks: [
      { id: "ex-1", text: "Warm Up & Stretch", done: false },
      { id: "ex-2", text: "Push Ups 3 Sets", done: false },
      { id: "ex-3", text: "30 Min Cardio", done: false },
      { id: "ex-4", text: "Cool Down Yoga", done: false },
    ],
  },
  {
    id: "leetcode",
    title: "LeetCode Problem",
    time: "9:00 am",
    streak: 0,
    subtasks: [
      { id: "lc-1", text: "Leetcode Problem Solve", done: false },
      { id: "lc-2", text: "Push Code To Github", done: false },
      { id: "lc-3", text: "Analyse Most Optimal Solution", done: false },
      { id: "lc-4", text: "Recognise Patterns", done: false },
      { id: "lc-5", text: "Note Down Any Important Findings", done: false },
    ],
  },
  {
    id: "project",
    title: "Project",
    time: "11:00 am",
    streak: 0,
    subtasks: [
      { id: "pj-1", text: "Design New Component", done: false },
      { id: "pj-2", text: "Fix Pending Bugs", done: false },
      { id: "pj-3", text: "Code Review", done: false },
      { id: "pj-4", text: "Deploy Latest Build", done: false },
    ],
  },
  {
    id: "gaming",
    title: "Gaming",
    time: "2:00 pm",
    streak: 0,
    subtasks: [
      { id: "gm-1", text: "Warm Up Aim Trainer", done: false },
      { id: "gm-2", text: "Ranked Matches", done: false },
      { id: "gm-3", text: "Review Gameplay", done: false },
      { id: "gm-4", text: "Claim Daily Rewards", done: false },
    ],
  },
];

const parseTimeToMinutes = (time) => {
  if (!time) return null;
  const match = /^(\d{1,2})(?::(\d{2}))?\s*([ap]m)$/i.exec(String(time).trim());
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  let minutes = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3].toLowerCase();

  if (period === "pm" && hours < 12) hours += 12;
  if (period === "am" && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

const getNowMinutes = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};

const TimeBoxing = ({ dragHandleProps, externalGroups, onGroupsChange }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [nowMinutes, setNowMinutes] = useState(getNowMinutes);
  const containerRef = useRef(null);
  const activeTaskRef = useRef(null);

  // Use externalGroups when provided (always the case from DashboardGrid),
  // falling back to built-in defaults only for standalone/testing usage.
  const groups = useMemo(() => {
    if (Array.isArray(externalGroups) && externalGroups.length > 0) {
      return externalGroups;
    }
    return DEFAULT_TASK_GROUPS;
  }, [externalGroups]);

  useEffect(() => {
    const id = setInterval(() => setNowMinutes(getNowMinutes()), 10000);
    return () => clearInterval(id);
  }, []);

  const activeId = useMemo(() => {
    if (!groups || groups.length === 0) return null;

    let bestActiveGroup = null;
    let maxPastStart = -1;
    let earliestGroup = null;
    let minStart = Infinity;

    for (const g of groups) {
      const start = parseTimeToMinutes(g.time);
      if (start !== null) {
        if (start < minStart) {
          minStart = start;
          earliestGroup = g;
        }
        if (start <= nowMinutes && start > maxPastStart) {
          maxPastStart = start;
          bestActiveGroup = g;
        }
      }
    }

    if (bestActiveGroup) {
      return bestActiveGroup.id;
    }
    if (earliestGroup) {
      return earliestGroup.id;
    }
    return groups[0]?.id || null;
  }, [groups, nowMinutes]);

  // Default to expanding the current active task relevant to time
  useEffect(() => {
    if (activeId) {
      setExpandedId(activeId);
    }
  }, [activeId]);

  // Auto-scroll active task to center on page load / refresh or activeId change
  useEffect(() => {
    if (!activeId) return;

    const timer = setTimeout(() => {
      const container = containerRef.current;
      const target = activeTaskRef.current;
      if (container && target) {
        const containerRect = container.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();

        const targetTopRelativeToContainer =
          targetRect.top - containerRect.top + container.scrollTop;
        const targetCenter = targetTopRelativeToContainer + targetRect.height / 2;
        const containerCenter = container.clientHeight / 2;

        const scrollToTop = targetCenter - containerCenter;
        container.scrollTo({
          top: Math.max(0, scrollToTop),
          behavior: "smooth",
        });
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [activeId]);

  const toggleSubtask = (groupId, subtaskId) => {
    const nextGroups = groups.map((g) =>
      g.id !== groupId
        ? g
        : {
            ...g,
            subtasks: (g.subtasks || []).map((s) =>
              s.id === subtaskId ? { ...s, done: !s.done } : s,
            ),
          },
    );

    // Lift state up to parent (App.jsx) which persists it — no local shadow needed.
    if (typeof onGroupsChange === "function") {
      onGroupsChange(nextGroups);
    }

    const completedMainCount = nextGroups.filter(
      (g) => g.subtasks && g.subtasks.length > 0 && g.subtasks.every((s) => s.done),
    ).length;

    updateTodayCompletedTasksCount(completedMainCount);
  };

  return (
    <div className="figma-glass-static rounded-[26px] px-4 py-3 text-white font-gilroy-medium w-full h-full select-none flex flex-col shadow-2xl relative overflow-hidden">
      {/* Header Row */}
      <div className="w-full flex items-center justify-between z-10 relative shrink-0 mb-3">
        <div
          className="flex items-center gap-2 text-white/70 text-xs font-gilroy-medium cursor-grab active:cursor-grabbing select-none"
          data-drag-handle
          {...dragHandleProps}
        >
          <i className="ri-draggable text-sm pointer-events-none"></i>
          <span className="pointer-events-none">Time Boxing</span>
        </div>
      </div>

      {/* Task Groups + Timeline */}
      <div
        ref={containerRef}
        className="w-full flex-1 min-h-0 overflow-y-auto scrollbar-hide z-10 relative pr-0.5"
      >
        <div className="flex flex-col">
          {groups.map((group, index) => {
            const total = group.subtasks.length;
            const done = group.subtasks.filter((s) => s.done).length;
            const percent = total === 0 ? 0 : Math.round((done / total) * 100);
            const expanded = expandedId === group.id;
            const active = activeId === group.id;
            const isFirst = index === 0;
            const isLast = index === groups.length - 1;

            const isCompleted = total > 0 && done === total;
            const baseStreak = group.baseStreak ?? group.streak ?? 0;
            const displayStreak = baseStreak + (isCompleted ? 1 : 0);

            return (
              <div
                key={group.id}
                ref={active ? activeTaskRef : null}
                className="flex items-stretch"
              >
                {/* Task Group Card */}
                <div className={`flex-1 min-w-0 ${isLast ? "" : "pb-5"}`}>
                  <div
                    className={`timebox-task-card relative rounded-[18px] border px-4 pt-3.5 pb-4 overflow-hidden shadow-lg transition-all duration-300 ${
                      active
                        ? "border-white/50 shadow-[0_0_20px_rgba(255,255,255,0.25)]"
                        : "border-white/10 hover:border-white/20"
                    }`}
                    style={{
                      backgroundColor: active
                        ? "var(--theme-1, #CBD5E1)"
                        : "color-mix(in srgb, var(--theme-4, #0F172A) 80%, #101015)",
                      color: active ? "var(--theme-4, #0F172A)" : "#FFFFFF",
                    }}
                  >
                    {/* Card Header (click to expand / collapse) */}
                    <div
                      className="cursor-pointer"
                      onClick={() => setExpandedId(expanded ? null : group.id)}
                    >
                      <div className="flex items-center gap-2.5">
                        {group.iconClass && (group.iconClass.startsWith("img:") || group.iconClass.startsWith("http") || group.iconClass.startsWith("data:")) ? (
                          <img
                            src={group.iconClass.replace(/^img:/, "")}
                            alt=""
                            className="w-[18px] h-[18px] object-contain shrink-0"
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                          />
                        ) : (
                          <i
                            className={`${group.iconClass || "ri-briefcase-line"} text-[17px] ${
                              active ? "text-[color:var(--theme-4,#0F172A)]" : "text-white/75"
                            }`}
                          />
                        )}
                        <h3
                          className={`font-gilroy-bold text-[15px] truncate ${
                            active ? "text-[color:var(--theme-4,#0F172A)]" : "text-white"
                          }`}
                        >
                          {group.title}
                        </h3>
                      </div>

                      <div className="mt-2.5 flex items-center gap-2">
                        <i
                          className={`text-sm shrink-0 ${
                            percent === 100
                              ? active
                                ? "ri-checkbox-circle-fill text-[color:var(--theme-4,#0F172A)] opacity-90"
                                : "ri-checkbox-circle-fill text-white/75"
                              : active
                                ? "ri-checkbox-blank-circle-line text-[color:var(--theme-4,#0F172A)] opacity-60"
                                : "ri-checkbox-blank-circle-line text-white/45"
                          }`}
                        ></i>
                        <span
                          className={`text-[11px] font-gilroy-medium whitespace-nowrap ${
                            active ? "text-[color:var(--theme-4,#0F172A)] opacity-75" : "text-white/55"
                          }`}
                        >
                          {done} of {total}
                        </span>
                        <div
                          className={`flex-1 h-[5px] rounded-full overflow-hidden ${
                            active ? "bg-black/15" : "bg-white/10"
                          }`}
                        >
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              active ? "bg-[color:var(--theme-4,#0F172A)]" : "bg-white/85"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span
                          className={`text-[11px] font-gilroy-medium w-[30px] text-right whitespace-nowrap ${
                            active ? "text-[color:var(--theme-4,#0F172A)] opacity-75" : "text-white/55"
                          }`}
                        >
                          {percent}%
                        </span>
                        <span
                          className={`flex items-center gap-1 shrink-0 transition-all duration-300 ${
                            displayStreak > 0
                              ? active
                                ? "text-amber-800 font-gilroy-bold"
                                : "text-orange-400 font-gilroy-bold"
                              : active
                                ? "text-[color:var(--theme-4,#0F172A)] opacity-40"
                                : "text-white/25"
                          }`}
                          title={`Current Task Streak: ${displayStreak} days`}
                        >
                          <i className={`ri-fire-fill text-sm ${displayStreak > 0 ? "animate-pulse" : ""}`}></i>
                          <span className="text-[11px]">
                            {displayStreak}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Expanded Subtask Tree */}
                    {expanded && (
                      <div className="relative mt-1.5">
                        {group.subtasks.map((subtask, subIndex) => {
                          const isLastSubtask =
                            subIndex === group.subtasks.length - 1;
                          return (
                            <div
                              key={subtask.id}
                              className="relative flex items-center gap-2.5 py-[5px] pl-7"
                            >
                              <span
                                className={`absolute left-[9px] top-0 w-px ${
                                  active ? "bg-black/25" : "bg-white/20"
                                } ${isLastSubtask ? "h-1/2" : "bottom-0"}`}
                              />
                              <span
                                className={`absolute left-[9px] top-1/2 w-[13px] h-px ${
                                  active ? "bg-black/25" : "bg-white/20"
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  toggleSubtask(group.id, subtask.id)
                                }
                                className="timebox-subtask-check shrink-0 cursor-pointer focus:outline-none bg-transparent border-0 p-0 shadow-none"
                              >
                                {subtask.done ? (
                                  <i
                                    className={`ri-checkbox-circle-fill text-[15px] ${
                                      active
                                        ? "text-[color:var(--theme-4,#0F172A)] opacity-85"
                                        : "text-white/65"
                                    }`}
                                  ></i>
                                ) : (
                                  <i
                                    className={`ri-checkbox-blank-circle-line text-[15px] ${
                                      active
                                        ? "text-[color:var(--theme-4,#0F172A)] opacity-60 hover:opacity-100"
                                        : "text-white/50 hover:text-white"
                                    }`}
                                  ></i>
                                )}
                              </button>
                              <span
                                onClick={() =>
                                  toggleSubtask(group.id, subtask.id)
                                }
                                className={`flex-1 min-w-0 truncate text-xs font-gilroy-medium cursor-pointer ${
                                  subtask.done
                                    ? active
                                      ? "line-through opacity-50 text-[color:var(--theme-4,#0F172A)]"
                                      : "line-through text-white/35"
                                    : active
                                      ? "text-[color:var(--theme-4,#0F172A)] font-gilroy-bold"
                                      : "text-white/85"
                                }`}
                              >
                                {subtask.text}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline Marker */}
                <div className="relative w-[70px] shrink-0">
                  <div
                    className={`absolute left-[5px] w-px bg-white/15 ${
                      isFirst
                        ? "top-[9px] bottom-0"
                        : isLast
                          ? "top-0 h-[9px]"
                          : "top-0 bottom-0"
                    }`}
                  />
                  <span
                    className={`absolute left-0 top-[4px] h-[10px] w-[10px] rounded-full transition-all duration-300 ${
                      active
                        ? "scale-125 shadow-[0_0_10px_var(--theme-1,#CBD5E1)]"
                        : "bg-white/60"
                    }`}
                    style={{
                      backgroundColor: active ? "var(--theme-1, #CBD5E1)" : undefined,
                    }}
                  />
                  <span
                    className={`absolute left-[16px] top-[2px] text-[10px] leading-[14px] font-gilroy-medium whitespace-nowrap transition-colors ${
                      active ? "text-white font-gilroy-bold" : "text-white/55"
                    }`}
                  >
                    {group.time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimeBoxing;
